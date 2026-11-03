import { mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import sharp from 'sharp';
import type { Plugin } from 'vite';
import {
  MAX_PDF_BYTES,
  validateContentDraft,
  type StudioDraft,
  type StudioMediaItem,
} from '../src/lib/studioContent';
import { allowsLocalStudioRequest } from './local-access';

const MAX_BODY_BYTES = 24 * 1024 * 1024;
const HISTORY_LIMIT = 20;
const CONTENT_DIR = 'content-studio';
const HISTORY_DIR = path.join(CONTENT_DIR, 'history');
/**
 * Published media lives in a normal, reviewable project directory. Drafts and
 * history stay in the ignored `content-studio/` folder, so saving never stages
 * unreviewed content by itself.
 */
const MEDIA_DIR = path.join('public', 'media');
const MEDIA_URL_PREFIX = '/media/';
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
        reject(new Error('The draft is larger than 24 MB. Reduce the image or PDF sizes.'));
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

function optionalFields(value: unknown, keys: string[]): boolean {
  return isRecord(value) && keys.every((key) => value[key] === undefined || typeof value[key] === 'string');
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
      isRecord(project) && fields(project, ['slug', 'tagline', 'summary']) && strings(project.stack) &&
      optionalFields(project, ['name', 'repo', 'link', 'linkLabel'])) &&
    Array.isArray(value.media) && value.media.every((item) => fields(item, ['id', 'projectSlug', 'caption', 'src', 'name'])) &&
    fields(value.resume, ['pdf', 'label']) &&
    fields(value.walkthrough, ['url', 'title', 'summary']) &&
    Array.isArray(value.sources) && value.sources.every((source) => fields(source, ['name', 'kind', 'importedAt', 'note']))
  );
}

function safeName(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 60) || 'asset';
}

async function saveImageDataUrl(
  dataUrl: string,
  maxSize: number,
): Promise<Buffer> {
  const match = /^data:image\/(png|jpe?g|webp);base64,([a-zA-Z0-9+/=\s]+)$/.exec(dataUrl);
  if (!match) throw new Error('Unsupported image format.');
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > 12 * 1024 * 1024) throw new Error('An image is larger than 12 MB.');
  return sharp(buffer, { limitInputPixels: 40_000_000 })
    .rotate()
    .resize({ width: maxSize, height: maxSize, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 84, effort: 4 })
    .toBuffer();
}

function readPdfDataUrl(dataUrl: string): Buffer {
  const match = /^data:application\/pdf;base64,([a-zA-Z0-9+/=\s]+)$/.exec(dataUrl);
  if (!match) throw new Error('Unsupported PDF upload.');
  const buffer = Buffer.from(match[1], 'base64');
  if (buffer.length > MAX_PDF_BYTES) {
    throw new Error(`The résumé PDF is larger than ${Math.round(MAX_PDF_BYTES / 1_000_000)} MB.`);
  }
  if (buffer.subarray(0, 5).toString('latin1') !== '%PDF-') {
    throw new Error('That file is not a valid PDF.');
  }
  return buffer;
}

function assetName(prefix: string, buffer: Buffer, extension: string): string {
  return `${prefix}-${createHash('sha256').update(buffer).digest('hex').slice(0, 24)}.${extension}`;
}

async function atomicJson(file: string, value: unknown) {
  const temporary = `${file}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`);
  await rename(temporary, file);
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
      const mediaDir = path.join(server.config.root, MEDIA_DIR);
      const generatedFile = path.join(server.config.root, GENERATED_FILE);
      let saving = false;
      server.middlewares.use('/__arjunos/content/save', (req, res, next) => {
        if (req.method !== 'POST') {
          next();
          return;
        }

        if (!allowsLocalStudioRequest(req, true)) {
          sendJson(res, 403, { ok: false, errors: ['Saves require loopback access and a matching Origin.'] });
          return;
        }

        if (saving) {
          sendJson(res, 409, { ok: false, errors: ['A save is already in progress. Try again after it finishes.'] });
          return;
        }
        saving = true;
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

            const content = structuredClone(draft);
            const assets = new Map<string, Buffer>();
            const previous = JSON.parse(await readFile(generatedFile, 'utf8').catch(() => '{"content":null}')) as { content: StudioDraft | null };

            if (content.profile.photo.startsWith('data:image/')) {
              const buffer = await saveImageDataUrl(content.profile.photo, 1400);
              const filename = assetName('portrait', buffer, 'webp');
              assets.set(filename, buffer);
              content.profile.photo = `${MEDIA_URL_PREFIX}${filename}`;
            }

            const media: StudioMediaItem[] = [];
            for (const item of content.media) {
              if (item.src.startsWith('data:image/')) {
                const buffer = await saveImageDataUrl(item.src, 1800);
                const filename = assetName(`media-${safeName(item.id)}`, buffer, 'webp');
                assets.set(filename, buffer);
                media.push({ ...item, src: `${MEDIA_URL_PREFIX}${filename}` });
              } else if (/^\/media\/[\w.-]+$/.test(item.src)) {
                media.push(item);
              }
            }
            content.media = media;

            if (content.resume.pdf.startsWith('data:application/pdf;base64,')) {
              const buffer = readPdfDataUrl(content.resume.pdf);
              const filename = assetName('resume', buffer, 'pdf');
              assets.set(filename, buffer);
              content.resume.pdf = `${MEDIA_URL_PREFIX}${filename}`;
            }

            const references = (value: StudioDraft | null) => value ? [value.profile.photo, value.resume?.pdf, ...value.media.map((item) => item.src)].filter((src): src is string => Boolean(src)) : [];
            for (const ref of references(content)) {
              if (!assets.has(path.basename(ref))) await readFile(path.join(mediaDir, path.basename(ref)));
            }
            // Decode/validate every asset before any filesystem mutation. Content-addressed
            // filenames never overwrite approved bytes; the generated JSON is the commit point.
            await mkdir(historyDir, { recursive: true });
            await mkdir(mediaDir, { recursive: true });
            for (const [filename, buffer] of assets) {
              await writeFile(path.join(mediaDir, filename), buffer, { flag: 'wx' }).catch((error: NodeJS.ErrnoException) => {
                if (error.code !== 'EEXIST') throw error;
              });
            }

            const updatedAt = new Date().toISOString();
            const historyName = `${updatedAt.replace(/[:.]/g, '-')}.json`;
            const generated = { version: 1, updatedAt, content };

            await atomicJson(path.join(historyDir, historyName), generated);
            await atomicJson(path.join(contentDir, 'current.json'), generated);
            await atomicJson(generatedFile, generated);
            // Retain removed/replaced managed assets outside public instead of deleting them.
            const retired = path.join(contentDir, 'retired');
            const active = new Set(references(content));
            for (const ref of new Set(references(previous.content))) {
              if (active.has(ref) || !/^\/media\/[\w.-]+\.(webp|pdf)$/.test(ref)) continue;
              await mkdir(retired, { recursive: true });
              await rename(path.join(mediaDir, path.basename(ref)), path.join(retired, `${historyName}-${path.basename(ref)}`)).catch(() => undefined);
            }
            const historyCount = await trimHistory(historyDir);

            sendJson(res, 200, {
              ok: true,
              updatedAt,
              historyCount,
              photo: content.profile.photo,
              resumePdf: content.resume.pdf,
              mediaCount: content.media.length,
              content,
            });
          } catch (error) {
            const message = error instanceof Error ? error.message : 'The save failed.';
            sendJson(res, 500, { ok: false, errors: [message] });
          } finally {
            saving = false;
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
