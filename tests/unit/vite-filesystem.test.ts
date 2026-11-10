import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { request } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createServer, resolveConfig, type ViteDevServer } from 'vite';
import type { StudioDraft } from '../../src/lib/studioContent';

describe('development filesystem privacy with the real Vite configuration', () => {
  let root: string;
  let server: ViteDevServer;
  let origin: string;
  const marker = 'FICTIONAL-FILESYSTEM-PRIVACY-FIXTURE';
  const protectedFiles = [
    '.env', '.env.local', '.env.production', 'nested/.env.local',
    'fixture.pem', 'fixture.crt', 'fixture.key', 'nested/fixture.pem',
    '.git/config', '.git/HEAD',
    'content-studio/current.json', 'content-studio/private/certificates/fixture.pdf',
  ];

  beforeAll(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'arjunos-filesystem-privacy-'));
    for (const file of protectedFiles) {
      await mkdir(path.dirname(path.join(root, file)), { recursive: true });
      await writeFile(path.join(root, file), marker);
    }
    await mkdir(path.join(root, 'src/content'), { recursive: true });
    await writeFile(path.join(root, 'src/content/studio.generated.json'), '{"content":null}');
    await writeFile(path.join(root, 'index.html'), '<!doctype html><title>Fictional fixture</title>');
    await writeFile(path.join(root, 'public-fixture.txt'), 'FICTIONAL-PUBLIC-FIXTURE');
    server = await createServer({
      configFile: fileURLToPath(new URL('../../vite.config.ts', import.meta.url)),
      root, envDir: root, cacheDir: path.join(root, '.vite-cache'),
      logLevel: 'silent',
      optimizeDeps: { noDiscovery: true, include: [] },
      server: { host: '127.0.0.1', port: 0, strictPort: false },
    });
    await server.listen();
    const address = server.httpServer!.address();
    if (!address || typeof address === 'string') throw new Error('Missing fixture port');
    origin = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await server?.close();
    if (root) await rm(root, { recursive: true, force: true });
  });

  it('retains every installed Vite default deny rule alongside project restrictions', async () => {
    const defaults = await resolveConfig({ configFile: false, root, logLevel: 'silent' }, 'serve');
    expect(server.config.server.fs.deny).toEqual(expect.arrayContaining(defaults.server.fs.deny));
    expect(server.config.server.fs.deny).toEqual(expect.arrayContaining(['**/content-studio/**', '**/*.key']));
  });

  it.each(protectedFiles)('denies static, raw-import and absolute filesystem requests for %s', async (file) => {
    for (const endpoint of [`/${file}`, `/${file}?raw`, `/@fs/${path.join(root, file)}`]) {
      const response = await fetch(`${origin}${endpoint}`);
      expect(response.status, endpoint).toBe(403);
      expect(await response.text(), endpoint).not.toContain(marker);
    }
  });

  it('still serves legitimate public development assets', async () => {
    const response = await fetch(`${origin}/public-fixture.txt`);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('FICTIONAL-PUBLIC-FIXTURE');
  });

  it('preserves private Studio save, loopback review and document persistence after restart', async () => {
    const pdf = Buffer.from('%PDF-1.4\n% FICTIONAL PRIVATE CERTIFICATE\n%%EOF');
    const draft: StudioDraft = {
      profile: { name: 'Fictional fixture', headline: 'Fixture', summary: 'Fictional test fixture only.', photo: '', github: '', x: '', linkedin: '', contactNote: '' },
      career: { experience: [], education: [], certifications: [], achievements: [] },
      skills: [], projects: [], media: [], sources: [],
      resume: { pdf: '', label: '' }, walkthrough: { url: '', title: '', summary: '' },
      certifications: [{
        id: 'fictional-fixture', name: 'Fictional certificate fixture', issuer: 'Fictional issuer',
        issuedOn: '', expiresOn: '', verificationUrl: '', verificationLabel: '',
        kind: 'pdf', src: '', privateSrc: `data:application/pdf;base64,${pdf.toString('base64')}`,
        documentVisible: false, alt: '', redactions: [], note: '', visible: true,
      }],
    };
    const saved = await fetch(`${origin}/__arjunos/content/save`, {
      method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(draft),
    });
    expect(saved.status).toBe(200);
    const result = await saved.json() as { content: StudioDraft };
    const privateSrc = result.content.certifications[0].privateSrc;
    expect(privateSrc).toMatch(/^\/__arjunos\/certificate-draft\/[\w.-]+\.pdf$/);
    const onDisk = path.join(root, 'content-studio/private/certificates', path.basename(privateSrc));
    expect(await readFile(onDisk)).toEqual(pdf);
    const generated = JSON.parse(await readFile(path.join(root, 'src/content/studio.generated.json'), 'utf8'));
    expect(generated.content.certifications[0].privateSrc).toBe('');
    expect(generated.content.certifications[0].src).toBe('');

    // Restart the actual fixture server. Recovery uses the private reference
    // returned to the local editor; no certificate enters the public directory.
    await server.restart();
    const permitted = await fetch(`${origin}${privateSrc}`);
    expect(permitted.status).toBe(200);
    expect(Buffer.from(await permitted.arrayBuffer())).toEqual(pdf);
    expect((await fetch(`${origin}/content-studio/private/certificates/${path.basename(privateSrc)}`)).status).toBe(403);
    expect((await fetch(`${origin}${privateSrc}`, { headers: { Origin: 'https://example.invalid' } })).status).toBe(403);
    // Node fetch normalizes Host; use a raw HTTP request to exercise the
    // hostile header itself rather than accidentally sending a loopback Host.
    const hostileHostStatus = await new Promise<number>((resolve, reject) => {
      const req = request(`${origin}${privateSrc}`, { headers: { Host: 'example.invalid' } }, (response) => {
        response.resume();
        response.on('end', () => resolve(response.statusCode!));
      });
      req.on('error', reject);
      req.end();
    });
    expect(hostileHostStatus).toBe(403);
    expect((await fetch(`${origin}/__arjunos/content/state`)).status).toBe(200);
  });
});
