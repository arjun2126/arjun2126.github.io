import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import sharp from 'sharp';
import type { Plugin } from 'vite';
import { validateContentDraft, type StudioDraft, type StudioMediaItem } from '../src/lib/studioContent';
import { allowsLocalStudioRequest } from './local-access';

const MAX_BODY_BYTES = 16 * 1024 * 1024;
const HISTORY_LIMIT = 20;
const CONTENT_DIR = 'content-studio';
const HISTORY_DIR = path.join(CONTENT_DIR, 'history');
const PUBLIC_DIR = path.join('public', 'content-studio');
const GENERATED_FILE = path.join('src', 'content', 'studio.generated.json');

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('The draft is larger than 16 MB. Reduce the image sizes.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

const strings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

function fields(value: unknown, keys: string[]): boolean {
  return isRecord(value) && keys.every((key) => typeof value[key] === 'string');
}

function isDraft(value: unknown): value is StudioDraft {
  if (!isRecord(value) || !isRecord(value.career)) return false;
  const career = value.career;
  return (
    fields(value.profile, ['name', 'headline', 'summary', 'photo', 'github', 'linkedin', 'x', 'contactNote']) &&
    Array.isArray(career.experience) && career.experience.every((entry) => fields(entry, ['period', 'title', 'org', 'body'])) &&
    strings(career.education) && strings(career.certifications) && strings(career.achievements) &&
    Array.isArray(value.skills) && value.skills.every((group) =>
      isRecord(group) && fields(group, ['id', 'label']) && strings(group.items)) &&
    Array.isArray(value.projects) && value.projects.every((project) =>
      isRecord(project) && fields(project, ['slug', 'tagline', 'summary']) && strings(project.stack)) &&
    Array.isArray(value.media) && value.media.every((item) => fields(item, ['id', 'projectSlug', 'caption', 'src', 'name'])) &&
    Array.isArray(value.sources) && value.sources.every((source) => fields(source, ['name', 'kind', 'importedAt', 'note']))
  );
}

function safeName(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 60) || 'asset';
}

async function saveImageDataUrl(
  dataUrl: string,
  destination: string,
  maxSize: number,
): Promise<boolean> {
  const match = /^data:image\/(png|jpe?g|webp);base64,([a-zA-Z0-9+/=\s]+)$/.exec(dataUrl);
  if (!match) return false;
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > 12 * 1024 * 1024) throw new Error('An image is larger than 12 MB.');
  await sharp(buffer)
    .rotate()
    .resize({ width: maxSize, height: maxSize, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 84, effort: 4 })
    .toFile(destination);
  return true;
}

async function trimHistory(historyDir: string) {
  const entries = (await readdir(historyDir)).filter((name) => name.endsWith('.json')).sort();
  for (const name of entries.slice(0, Math.max(0, entries.length - HISTORY_LIMIT))) {
    await rm(path.join(historyDir, name), { force: true });
  }
  return Math.min(entries.length, HISTORY_LIMIT);
}

export function contentStudioPlugin(): Plugin {
  return {
    name: 'arjunos-content-studio',
    apply: 'serve',
    configureServer(server) {
      const contentDir = path.join(server.config.root, CONTENT_DIR);
      const historyDir = path.join(server.config.root, HISTORY_DIR);
      const publicDir = path.join(server.config.root, PUBLIC_DIR);
      const generatedFile = path.join(server.config.root, GENERATED_FILE);
      server.middlewares.use('/__arjunos/content/save', (req, res, next) => {
        if (req.method !== 'POST') {
          next();
          return;
        }

        if (!allowsLocalStudioRequest(req, true)) {
          sendJson(res, 403, { ok: false, errors: ['Saves require loopback access and a matching Origin.'] });
          return;
        }

        void (async () => {
          try {
            const raw = await readBody(req);
            const draft = JSON.parse(raw) as unknown;
            if (!isDraft(draft)) {
              sendJson(res, 400, { ok: false, errors: ['The draft shape is invalid.'] });
              return;
            }
            const errors = validateContentDraft(draft);
            if (errors.length) {
              sendJson(res, 422, { ok: false, errors });
              return;
            }

            await mkdir(historyDir, { recursive: true });
            await mkdir(publicDir, { recursive: true });

            const content = structuredClone(draft);

            if (content.profile.photo.startsWith('data:image/')) {
              const saved = await saveImageDataUrl(
                content.profile.photo,
                path.join(publicDir, 'portrait.webp'),
                1400,
              );
              content.profile.photo = saved ? '/content-studio/portrait.webp' : '';
            } else if (!content.profile.photo.startsWith('/content-studio/')) {
              content.profile.photo = '';
            }

            const media: StudioMediaItem[] = [];
            for (const item of content.media) {
              if (item.src.startsWith('data:image/')) {
                const filename = `media-${safeName(item.id)}.webp`;
                const saved = await saveImageDataUrl(
                  item.src,
                  path.join(publicDir, filename),
                  1800,
                );
                if (saved) media.push({ ...item, src: `/content-studio/${filename}` });
              } else if (item.src.startsWith('/content-studio/')) {
                media.push(item);
              }
            }
            content.media = media;

            const updatedAt = new Date().toISOString();
            const historyName = `${updatedAt.replace(/[:.]/g, '-')}.json`;
            const generated = { version: 1, updatedAt, content };

            await writeFile(path.join(contentDir, 'current.json'), JSON.stringify(generated, null, 2));
            await writeFile(path.join(historyDir, historyName), JSON.stringify(generated, null, 2));
            await writeFile(generatedFile, `${JSON.stringify(generated, null, 2)}\n`);
            const historyCount = await trimHistory(historyDir);

            sendJson(res, 200, {
              ok: true,
              updatedAt,
              historyCount,
              photo: content.profile.photo,
              mediaCount: content.media.length,
            });
          } catch (error) {
            const message = error instanceof Error ? error.message : 'The save failed.';
            sendJson(res, 500, { ok: false, errors: [message] });
          }
        })();
      });

      server.middlewares.use('/__arjunos/content/state', (req, res, next) => {
        if (req.method !== 'GET') {
          next();
          return;
        }
        if (!allowsLocalStudioRequest(req, false)) {
          sendJson(res, 403, { ok: false, errors: ['State requires loopback access.'] });
          return;
        }
        void (async () => {
          try {
            let updatedAt: string | null = null;
            try {
              const current = JSON.parse(await readFile(path.join(contentDir, 'current.json'), 'utf8')) as {
                updatedAt?: string;
              };
              updatedAt = current.updatedAt ?? null;
            } catch {
              // No save yet.
            }
            const history = await readdir(historyDir).catch(() => [] as string[]);
            sendJson(res, 200, {
              ok: true,
              updatedAt,
              historyCount: history.filter((name) => name.endsWith('.json')).length,
            });
          } catch {
            sendJson(res, 200, { ok: true, updatedAt: null, historyCount: 0 });
          }
        })();
      });
    },
  };
}
