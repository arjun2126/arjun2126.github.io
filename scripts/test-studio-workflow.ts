/** Real browser upload/save/restart/build roundtrip in an isolated disposable copy. */
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, readdir, realpath, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { createServer, preview, type ViteDevServer } from 'vite';

const original = process.cwd();
const originalSeed = await readFile('src/content/studio.generated.json');
const originalApproval = await readFile('publication-approved.json');
const fixture = await realpath(await mkdtemp(path.join(tmpdir(), 'arjunos-upload-workflow-')));
let server: ViteDevServer | undefined;
let production: Awaited<ReturnType<typeof preview>> | undefined;
const browser = await chromium.launch();
try {
  for (const entry of ['src', 'public', 'scripts', 'server', 'index.html', 'package.json', 'package-lock.json', 'tsconfig.json', 'vite.config.ts', 'publication-approved.json']) {
    await cp(path.join(original, entry), path.join(fixture, entry), { recursive: true });
  }
  await symlink(path.join(original, 'node_modules'), path.join(fixture, 'node_modules'), 'dir');
  const start = async () => {
    server = await createServer({ root: fixture, configFile: path.join(fixture, 'vite.config.ts'), server: { host: '127.0.0.1', port: 0, fs: { allow: [fixture, original] } } });
    await server.listen();
    const address = server.httpServer!.address();
    assert(address && typeof address !== 'string');
    return `http://127.0.0.1:${address.port}`;
  };
  let url = await start();
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const page = await context.newPage();
  await page.goto(`${url}/content-studio/`);
  const studio = page.getByRole('dialog', { name: 'Content Studio', exact: true });
  await studio.getByLabel('Name', { exact: true }).fill('Synthetic workflow fixture');
  const png = await sharp({ create: { width: 80, height: 100, channels: 3, background: '#456789' } }).png().toBuffer();
  await studio.getByLabel('Upload profile photo').setInputFiles({ name: 'synthetic.png', mimeType: 'image/png', buffer: png });
  await studio.getByRole('img', { name: 'Draft profile' }).waitFor();
  await studio.getByRole('button', { name: /^Résumé/ }).click();
  const pdf = Buffer.alloc(5_900_000, 32);
  pdf.write('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 0/Kids[]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF');
  const certificatePdf = Buffer.from(
    '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 0/Kids[]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF',
  );
  await studio.getByLabel('Upload downloadable résumé PDF', { exact: true }).setInputFiles({ name: 'synthetic.pdf', mimeType: 'application/pdf', buffer: pdf });
  await studio.getByRole('link', { name: 'Download draft PDF for review' }).waitFor();
  const baselineMedia = JSON.parse(await readFile(path.join(fixture, 'src/content/studio.generated.json'), 'utf8')).content?.media?.length ?? 0;
  await studio.getByRole('button', { name: /^Media/ }).click();
  await studio.getByLabel('Upload project images').setInputFiles({ name: 'synthetic-project.png', mimeType: 'image/png', buffer: png });
  await studio.getByRole('textbox', { name: 'Caption for synthetic-project.png' }).waitFor();

  await studio.getByRole('button', { name: /^Certifications/ }).click();
  const firstCertificate = studio.locator('.os-studio__fieldset').first();
  await firstCertificate.getByLabel('Issue date (optional)').fill('2024-03-15');
  await firstCertificate
    .getByLabel('Official verification URL (optional)')
    .fill('https://trailhead.salesforce.com/verification');
  await firstCertificate
    .getByLabel('Upload certificate document for Salesforce Certified Administrator')
    .setInputFiles({ name: 'synthetic-certificate.png', mimeType: 'image/png', buffer: png });
  await firstCertificate.getByRole('img', { name: 'Draft certificate' }).waitFor();
  await firstCertificate
    .getByRole('checkbox', {
      name: 'Publish certificate document for Salesforce Certified Administrator',
    })
    .check();
  const thirdCertificate = studio.locator('.os-studio__fieldset').nth(2);
  await thirdCertificate
    .getByLabel('Upload certificate document for Salesforce Certified Platform Developer I')
    .setInputFiles({ name: 'private-certificate.pdf', mimeType: 'application/pdf', buffer: certificatePdf });
  await thirdCertificate.getByText('PDF', { exact: true }).waitFor();
  await studio
    .locator('.os-studio__fieldset')
    .nth(1)
    .getByRole('checkbox', { name: 'Show Salesforce Certified Platform App Builder publicly' })
    .uncheck();
  await firstCertificate.getByRole('button', { name: 'Preview' }).click();
  await page
    .getByRole('dialog', { name: 'Salesforce Certified Administrator certificate viewer' })
    .waitFor();
  await page.keyboard.press('Escape');

  const responsePromise = page.waitForResponse((response) => response.url().endsWith('/__arjunos/content/save') && response.request().method() === 'POST');
  await studio.getByRole('button', { name: 'Save to project', exact: true }).click();
  const response = await responsePromise;
  const responseText = await response.text();
  assert.equal(response.status(), 200, responseText);
  const editorPayload = JSON.parse(responseText);
  const saved = JSON.parse(await readFile(path.join(fixture, 'src/content/studio.generated.json'), 'utf8'));
  assert.equal(saved.content.profile.name, 'Synthetic workflow fixture');
  assert.match(saved.content.profile.photo, /^\/media\/portrait-[a-f0-9]+\.webp$/);
  await readFile(path.join(fixture, `public${saved.content.profile.photo}`));
  // Existing owner media is preserved; exactly one synthetic upload is appended.
  assert.equal(saved.content.media.length, baselineMedia + 1);
  const uploaded = saved.content.media.find((item: { name: string }) => item.name === 'synthetic-project.png');
  assert(uploaded, 'The synthetic upload was not saved');
  assert.equal(saved.content.media.filter((item: { src: string }) => item.src === uploaded.src).length, 1);
  assert.equal(new Set(saved.content.media.map((item: { src: string }) => item.src)).size, saved.content.media.length);
  assert.match(saved.content.resume.pdf, /^\/media\/resume-[a-f0-9]+\.pdf$/);
  assert.deepEqual(await readFile(path.join(fixture, `public${saved.content.resume.pdf}`)), pdf);
  await readFile(path.join(fixture, `public${uploaded.src}`));
  const administrator = saved.content.certifications[0];
  assert.equal(administrator.name, 'Salesforce Certified Administrator');
  assert.equal(administrator.issuedOn, '2024-03-15');
  assert.equal(administrator.verificationUrl, 'https://trailhead.salesforce.com/verification');
  assert.equal(administrator.documentVisible, true);
  assert.match(administrator.src, /^\/media\/certificate-salesforce-certified-administrator-[a-f0-9]+\.webp$/);
  assert.equal(saved.content.certifications[1].visible, false);
  const developer = saved.content.certifications[2];
  assert.equal(developer.documentVisible, false);
  assert.equal(developer.src, '');
  assert.equal(developer.privateSrc, '');
  const developerEditor = editorPayload.content.certifications[2];
  assert.match(
    developerEditor.privateSrc,
    /^\/__arjunos\/certificate-draft\/certificate-private-salesforce-certified-platform-developer-i-[a-f0-9]+\.pdf$/,
  );
  const privateName = developerEditor.privateSrc.split('/').pop();
  assert(privateName);
  assert.deepEqual(
    await readFile(path.join(fixture, 'content-studio/private/certificates', privateName)),
    certificatePdf,
  );
  assert(
    !(await readFile(path.join(fixture, 'src/content/studio.generated.json'), 'utf8')).includes(
      privateName,
    ),
    'Private certificate paths must not enter the committed content file',
  );
  await readFile(path.join(fixture, `public${administrator.src}`));
  const privateResponse = await page.request.get(`${url}${developerEditor.privateSrc}`);
  assert.equal(privateResponse.status(), 200);
  assert.deepEqual(await privateResponse.body(), certificatePdf);
  const directPrivate = await page.request.get(
    `${url}/content-studio/private/certificates/${privateName}`,
  );
  assert.notEqual(directPrivate.status(), 200, 'Vite must not expose the private draft folder');
  await page.reload();
  await studio.getByRole('button', { name: 'Professional Profile', exact: false }).click();
  assert.equal(await studio.getByLabel('Name', { exact: true }).inputValue(), 'Synthetic workflow fixture');
  await context.close();
  await server!.close();
  url = await start();
  const fresh = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const restarted = await fresh.newPage();
  await restarted.goto(`${url}/content-studio/`);
  assert.equal(await restarted.getByRole('dialog', { name: 'Content Studio', exact: true }).getByLabel('Name', { exact: true }).inputValue(), 'Synthetic workflow fixture');
  await fresh.close();
  await server!.close();
  server = undefined;
  // Synthetic approval exists ONLY in this disposable fixture, never in the project.
  execFileSync(path.join(original, 'node_modules/.bin/tsx'), ['scripts/validate-publication.ts', '--approve', '--owner-reviewed', 'src/content/studio.generated.json', ...(await readdir(path.join(fixture, 'public/media'))).map((name) => `public/media/${name}`)], { cwd: fixture, stdio: 'inherit' });
  execFileSync('npm', ['run', 'build'], { cwd: fixture, stdio: 'inherit', env: { ...process.env, NODE_ENV: 'production', GITHUB_SHA: process.env.GITHUB_SHA || '0000000000000000000000000000000000000000' } });
  assert((await readFile(path.join(fixture, 'dist/recruiter/index.html'), 'utf8')).includes('Synthetic workflow fixture'));
  production = await preview({ root: fixture, configFile: path.join(fixture, 'vite.config.ts'), preview: { host: '127.0.0.1', port: 0 } });
  const address = production.httpServer.address();
  assert(address && typeof address !== 'string');
  const built = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  await built.goto(`http://127.0.0.1:${address.port}/recruiter/`);
  await built.getByRole('heading', { name: 'Synthetic workflow fixture', exact: true }).waitFor();
  const portrait = built.locator(`img[src="${saved.content.profile.photo}"]`).first();
  await portrait.waitFor();
  assert(await portrait.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0));
  assert.equal((await built.request.get(`http://127.0.0.1:${address.port}${uploaded.src}`)).status(), 200);
  const certificationHtml = await readFile(path.join(fixture, 'dist/certifications/index.html'), 'utf8');
  assert(certificationHtml.includes('Salesforce Certified Administrator'));
  assert(certificationHtml.includes(administrator.src));
  assert(certificationHtml.includes('https://trailhead.salesforce.com/verification'));
  assert(!certificationHtml.includes('Salesforce Certified Platform App Builder'));
  assert(!certificationHtml.includes(developerEditor.privateSrc), 'A privately held PDF must not be published');
  assert(certificationHtml.includes('Certificate document held privately'));
  const privateProduction = await built.request.get(
    `http://127.0.0.1:${address.port}${developerEditor.privateSrc}`,
  );
  const privateProductionBody = await privateProduction.body();
  assert.notEqual(privateProduction.headers()['content-type'], 'application/pdf');
  assert(
    privateProductionBody.subarray(0, 5).toString('latin1') !== '%PDF-',
    'The production preview must not serve private certificate bytes',
  );
  assert.deepEqual(privateProductionBody.equals(certificatePdf), false);
  await built.goto(`http://127.0.0.1:${address.port}/certifications/`);
  await built
    .getByRole('dialog', { name: 'Certifications' })
    .getByRole('heading', { level: 1 })
    .waitFor();
  assert.equal((await built.request.get(`http://127.0.0.1:${address.port}${administrator.src}`)).status(), 200);
  await built.goto(`http://127.0.0.1:${address.port}/resume/`);
  await built.getByRole('link', { name: 'Résumé — Arjun Subramanya (PDF)' }).waitFor();
  assert(!(await built.content()).includes('Salesforce Certified Platform App Builder'));
  assert.deepEqual(await (await built.request.get(`http://127.0.0.1:${address.port}${saved.content.resume.pdf}`)).body(), pdf);
  assert.equal((await built.request.post(`http://127.0.0.1:${address.port}/__arjunos/content/save`, { data: {} })).status(), 404);
  console.log('PASS: browser upload → edit → save → generated files → reload → server restart without browser storage → reviewed fixture build → static content/assets. Production write API absent.');
} finally {
  await browser.close();
  await server?.close();
  if (production) await new Promise<void>((resolve) => production!.httpServer.close(() => resolve()));
  await rm(fixture, { recursive: true, force: true });
  assert.deepEqual(await readFile('src/content/studio.generated.json'), originalSeed, 'Original content changed');
  assert.deepEqual(await readFile('publication-approved.json'), originalApproval, 'Original approvals changed');
  console.log('Original approved content and approvals unchanged; disposable synthetic files removed.');
}
