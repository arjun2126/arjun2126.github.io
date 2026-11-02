import { mkdtemp, mkdir, readFile, readdir, rm } from 'node:fs/promises';
import { request } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createServer, type ViteDevServer } from 'vite';
import { contentStudioPlugin } from '../../server/content-studio-plugin';

describe('Content Studio API integration', () => {
  let root: string;
  let server: ViteDevServer;
  let port: number;
  const draft = {
    profile: { name: 'Test profile', headline: 'Test', summary: 'Fixture only', photo: '', github: '', linkedin: '', x: '', contactNote: '' },
    career: { experience: [], education: [], certifications: [], achievements: [] },
    skills: [], projects: [], media: [], sources: [],
  };

  beforeAll(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'arjunos-studio-test-'));
    await mkdir(path.join(root, 'src/content'), { recursive: true });
    server = await createServer({
      configFile: false, root, plugins: [contentStudioPlugin()],
      server: { host: '127.0.0.1', port: 0, allowedHosts: true },
      // Disable dependency discovery; this fixture contains no application.
      optimizeDeps: { noDiscovery: true, include: [] },
    });
    await server.listen();
    const address = server.httpServer!.address();
    if (!address || typeof address === 'string') throw new Error('Missing test server port');
    port = address.port;
  });

  afterAll(async () => {
    await server?.close();
    if (root) await rm(root, { recursive: true, force: true });
  });

  function call(method: string, endpoint: string, headers: Record<string, string> = {}, body: unknown = draft) {
    return new Promise<{ status: number; body: string }>((resolve, reject) => {
      const req = request({
        hostname: '127.0.0.1', port, path: `/__arjunos/content/${endpoint}`, method,
        headers: { 'Content-Type': 'application/json', ...headers },
      }, (res) => {
        let text = '';
        res.on('data', (chunk) => { text += chunk; });
        res.on('end', () => resolve({ status: res.statusCode!, body: text }));
      });
      req.on('error', reject);
      req.end(method === 'POST' ? JSON.stringify(body) : undefined);
    });
  }

  it('rejects unsafe writes before creating any files', async () => {
    const unsafeHeaders: Record<string, string>[] = [
      {},
      { Origin: 'null' },
      { Origin: 'http://evil.test' },
      { Origin: `http://127.0.0.1:${port + 1}` },
      { Host: `localhost:${port + 1}`, Origin: `http://localhost:${port + 1}` },
      { Host: `localhost.evil.test:${port}`, Origin: `http://localhost.evil.test:${port}` },
    ];
    for (const headers of unsafeHeaders) {
      expect((await call('POST', 'save', headers)).status).toBe(403);
    }
    expect(await readdir(root)).toEqual(['src']);
  });

  it('saves a valid same-origin loopback draft only inside the Vite root', async () => {
    const result = await call('POST', 'save', { Origin: `http://127.0.0.1:${port}` });
    expect(result.status).toBe(200);
    expect(JSON.parse(result.body).historyCount).toBe(1);
    const current = await readFile(path.join(root, 'content-studio/current.json'), 'utf8');
    expect(JSON.parse(current).content.profile.name).toBe('Test profile');
    const generated = await readFile(path.join(root, 'src/content/studio.generated.json'), 'utf8');
    expect(JSON.parse(generated)).toEqual(JSON.parse(current));

    const invalid = structuredClone(draft);
    invalid.profile.name = '';
    expect((await call('POST', 'save', { Origin: `http://127.0.0.1:${port}` }, invalid)).status).toBe(422);
    expect(await readFile(path.join(root, 'content-studio/current.json'), 'utf8')).toBe(current);
  });

  it.each([
    { profile: { ...draft.profile, photo: null } },
    { career: { ...draft.career, experience: [null] } },
    { career: { ...draft.career, education: [42] } },
    { career: { ...draft.career, certifications: [{}] } },
    { career: { ...draft.career, achievements: [false] } },
    { skills: [{ id: 'x', label: 'x', items: [null] }] },
    { projects: [{ slug: 'x', tagline: 'x', summary: 'x', stack: [false] }] },
    { media: [{ id: 'x', src: null }] },
    { sources: [null] },
  ])('rejects malformed nested draft data before writing: %j', async (overrides) => {
    const currentPath = path.join(root, 'content-studio/current.json');
    const historyPath = path.join(root, 'content-studio/history');
    const before = await readFile(currentPath, 'utf8').catch(() => null);
    const history = await readdir(historyPath).catch(() => []);
    const result = await call('POST', 'save', { Origin: `http://127.0.0.1:${port}` }, { ...draft, ...overrides });
    expect(result.status).toBe(400);
    expect(await readFile(currentPath, 'utf8').catch(() => null)).toBe(before);
    expect(await readdir(historyPath).catch(() => [])).toEqual(history);
  });

  it('gates state reads by peer, Host and optional Origin', async () => {
    expect((await call('GET', 'state')).status).toBe(200);
    expect((await call('GET', 'state', { Origin: 'http://evil.test' })).status).toBe(403);
    expect((await call('GET', 'state', { Host: `localhost:${port + 1}` })).status).toBe(403);
  });
});
