import { mkdtemp, mkdir, readFile, readdir, rm } from 'node:fs/promises';
import { request } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createServer, type ViteDevServer } from 'vite';
import { contentStudioPlugin } from '../../server/content-studio-plugin';
import type { StudioDraft } from '../../src/lib/studioContent';
import sharp from 'sharp';

describe('Content Studio API integration', () => {
  let root: string;
  let server: ViteDevServer;
  let port: number;
  const draft: StudioDraft = {
    profile: { name: 'Test profile', headline: 'Test', summary: 'Fixture only', photo: '', github: '', linkedin: '', x: '', contactNote: '' },
    career: { experience: [], education: [], certifications: [], achievements: [] },
    skills: [], projects: [], certifications: [], media: [], sources: [],
    resume: { pdf: '', label: '' }, walkthrough: { url: '', title: '', summary: '' },
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
    { certifications: [{ id: 'x', name: 'x', issuer: 'x', kind: 'image', src: null }] },
    { certifications: [null] },
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

  it('saves certificate images and PDFs as content-addressed media and preserves visibility', async () => {
    const image = await sharp({
      create: { width: 60, height: 40, channels: 3, background: '#d9b45a' },
    })
      .jpeg()
      .withMetadata({ exif: { IFD0: { Artist: 'Private owner note' } } })
      .toBuffer();
    const pdf = Buffer.from(
      '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 0/Kids[]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF',
    );
    const valid = structuredClone(draft);
    valid.certifications = [
      {
        id: 'fixture-image',
        name: 'Salesforce Certified Fixture',
        issuer: 'Salesforce',
        issuedOn: '2024-03-15',
        expiresOn: '',
        verificationUrl: 'https://trailhead.salesforce.com/verify',
        verificationLabel: 'Verify with Salesforce',
        kind: 'image',
        src: `data:image/jpeg;base64,${image.toString('base64')}`,
        privateSrc: '',
        documentVisible: true,
        alt: 'Salesforce fixture certificate with identifiers redacted.',
        redactions: ['Credential ID'],
        note: '',
        visible: true,
      },
      {
        id: 'fixture-pdf',
        name: 'Salesforce Certified PDF Fixture',
        issuer: 'Salesforce',
        issuedOn: '',
        expiresOn: '',
        verificationUrl: '',
        verificationLabel: '',
        kind: 'pdf',
        src: '',
        privateSrc: `data:application/pdf;base64,${pdf.toString('base64')}`,
        documentVisible: false,
        alt: 'Salesforce PDF fixture with identifiers redacted.',
        redactions: ['Verification code'],
        note: '',
        visible: false,
      },
    ];

    const result = await call('POST', 'save', { Origin: `http://127.0.0.1:${port}` }, valid);
    expect(result.status).toBe(200);
    const body = JSON.parse(result.body) as { certificateCount: number; content: typeof valid };
    expect(body.certificateCount).toBe(2);
    expect(body.content.certifications[0].src).toMatch(/^\/media\/certificate-fixture-image-[a-f0-9]+\.webp$/);
    expect(body.content.certifications[0].privateSrc).toBe('');
    expect(body.content.certifications[1].src).toBe('');
    expect(body.content.certifications[1].privateSrc).toMatch(
      /^\/__arjunos\/certificate-draft\/certificate-private-fixture-pdf-[a-f0-9]+\.pdf$/,
    );
    expect(body.content.certifications[1].visible).toBe(false);

    const imagePath = path.join(root, `public${body.content.certifications[0].src}`);
    const imageBuffer = await readFile(imagePath);
    expect((await sharp(imageBuffer).metadata()).exif).toBeUndefined();
    const privateName = path.basename(body.content.certifications[1].privateSrc);
    expect(
      await readFile(path.join(root, 'content-studio/private/certificates', privateName)),
    ).toEqual(pdf);
    const persisted = JSON.parse(
      await readFile(path.join(root, 'src/content/studio.generated.json'), 'utf8'),
    );
    expect(persisted.content.certifications[1].privateSrc).toBe('');
    expect(persisted.content.certifications[1].src).toBe('');

    // A privately saved document can be promoted without re-uploading the file.
    const promoted = structuredClone(body.content);
    promoted.certifications[1].documentVisible = true;
    promoted.certifications[1].src = promoted.certifications[1].privateSrc;
    promoted.certifications[1].privateSrc = '';
    const promotedResult = await call('POST', 'save', { Origin: `http://127.0.0.1:${port}` }, promoted);
    expect(promotedResult.status).toBe(200);
    const promotedBody = JSON.parse(promotedResult.body) as { content: typeof valid };
    expect(promotedBody.content.certifications[1].src).toMatch(
      /^\/media\/certificate-fixture-pdf-[a-f0-9]+\.pdf$/,
    );
    expect(promotedBody.content.certifications[1].privateSrc).toBe('');
    expect(
      await readFile(path.join(root, `public${promotedBody.content.certifications[1].src}`)),
    ).toEqual(pdf);
    // The private PDF must not be copied into the public tree.
    expect(
      await readFile(path.join(root, 'public/media', privateName)).catch(() => null),
    ).toBeNull();
  });

  it('rejects a certificate PDF with active content', async () => {
    const active = Buffer.from(
      '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R/JavaScript (app.alert(1))>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF',
    );
    const invalid = structuredClone(draft);
    invalid.certifications = [
      {
        id: 'active-pdf',
        name: 'Unsafe fixture',
        issuer: 'Salesforce',
        issuedOn: '',
        expiresOn: '',
        verificationUrl: '',
        verificationLabel: '',
        kind: 'pdf',
        src: '',
        privateSrc: `data:application/pdf;base64,${active.toString('base64')}`,
        documentVisible: false,
        alt: 'Unsafe PDF fixture.',
        redactions: [],
        note: '',
        visible: true,
      },
    ];
    expect((await call('POST', 'save', { Origin: `http://127.0.0.1:${port}` }, invalid)).status).toBe(500);
  });

  it('validates all uploads before modifying saved content or approved media', async () => {
    const image = await sharp({ create: { width: 20, height: 20, channels: 3, background: '#789abc' } }).png().toBuffer();
    const valid = structuredClone(draft);
    valid.profile.photo = `data:image/png;base64,${image.toString('base64')}`;
    const saved = await call('POST', 'save', { Origin: `http://127.0.0.1:${port}` }, valid);
    expect(saved.status).toBe(200);
    const currentPath = path.join(root, 'src/content/studio.generated.json');
    const before = await readFile(currentPath);
    const names = await readdir(path.join(root, 'public/media'));
    const bytes = await Promise.all(names.map((name) => readFile(path.join(root, 'public/media', name))));
    const invalid = structuredClone(valid);
    invalid.resume.pdf = 'data:application/pdf;base64,bm90IGEgcGRm';
    expect((await call('POST', 'save', { Origin: `http://127.0.0.1:${port}` }, invalid)).status).toBe(500);
    expect(await readFile(currentPath)).toEqual(before);
    expect(await readdir(path.join(root, 'public/media'))).toEqual(names);
    expect(await Promise.all(names.map((name) => readFile(path.join(root, 'public/media', name))))).toEqual(bytes);
  });
});
