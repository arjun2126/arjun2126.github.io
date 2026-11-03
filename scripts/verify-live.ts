/** Read-only public/static-host verification. Writes evidence only under ignored test-results/. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { projects } from '../src/content/projects';

const base = (process.env.SITE_TEST_URL || 'https://arjun2126.github.io').replace(/\/$/, '');
const expected = process.env.DEPLOYED_SHA;
const out = 'test-results/launch-verification';
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const evidence: Record<string, unknown> = { base, checkedAt: new Date().toISOString() };
try {
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.url().startsWith(base) && response.status() >= 400) errors.push(`HTTP ${response.status()} ${new URL(response.url()).pathname}`);
  });
  const routes = ['/', '/projects/', '/recruiter/', '/resume/', '/salesforce/', '/ai/', '/experience/', '/skills/', '/about/', '/contact/', '/northgate-live/', '/walkthrough/', ...projects.map((project) => `/projects/${project.slug}/`)];
  for (const route of routes) {
    const response = await page.goto(base + route);
    assert.equal(response?.status(), 200, route);
    await page.locator('body[data-surface]').waitFor();
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), `https://arjun2126.github.io${route}`);
    assert(await page.locator('main').count());
    if (['/', '/recruiter/', '/northgate-live/'].includes(route)) {
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => undefined))); });
      await page.screenshot({ path: `${out}/desktop-${route === '/' ? 'home' : route.split('/')[1]}.png` });
    }
  }
  assert.deepEqual(errors, [], 'Page errors or missing assets');
  const assets = JSON.parse(await readFile('publication-approved.json', 'utf8')).files as Record<string, string>;
  for (const [file, hash] of Object.entries(assets).filter(([file]) => file.startsWith('public/'))) {
    const response = await context.request.get(`${base}/${file.slice(7)}`);
    assert.equal(response.status(), 200, file);
    assert.equal(createHash('sha256').update(await response.body()).digest('hex'), hash, file);
  }
  for (const route of ['/__arjunos/content/state', '/src/content/studio.generated.json', '/content-studio/current.json', '/.env', '/arjunos-unknown-route/']) {
    assert.equal((await context.request.get(base + route)).status(), 404, `Private/unknown route: ${route}`);
  }
  const unknown = await context.request.get(base + '/arjunos-unknown-route/');
  assert((await unknown.text()).includes('That window doesn’t exist.'));
  // Static hosts differ in method handling: no route (404), disallowed POST (405),
  // or unimplemented method (501). None may return a successful authoring response.
  const postStatus = (await context.request.post(base + '/__arjunos/content/save', { data: {} })).status();
  assert([404, 405, 501].includes(postStatus), `Unexpected authoring POST response: ${postStatus}`);
  evidence.authoringPostStatus = postStatus;
  const sitemap = await (await context.request.get(base + '/sitemap.xml')).text();
  for (const route of routes) assert(sitemap.includes(`<loc>https://arjun2126.github.io${route}</loc>`));
  assert(!sitemap.includes('/content-studio/'));
  const deployment = await (await context.request.get(base + '/deployment.json')).json();
  if (expected) assert.equal(deployment.commit, expected);
  evidence.deployment = deployment;
  evidence.routes = routes;
  evidence.assetHashesVerified = Object.keys(assets).filter((file) => file.startsWith('public/')).length;
  evidence.pageErrors = errors;
  const accessibility: Record<string, number> = {};
  for (const route of ['/', '/recruiter/', '/resume/']) {
    await page.goto(base + route);
    await page.locator('body[data-surface]').waitFor();
    const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    const serious = scan.violations.filter((issue) => ['serious', 'critical'].includes(issue.impact || ''));
    assert.deepEqual(serious, [], `Accessibility: ${route}`);
    accessibility[route] = serious.length;
  }
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const phone = await mobile.newPage();
  for (const route of routes) {
    await phone.goto(base + route);
    await phone.locator('body[data-surface]').waitFor();
    assert(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Mobile overflow: ${route}`);
    if (['/', '/recruiter/', '/northgate-live/'].includes(route)) await phone.screenshot({ path: `${out}/mobile-${route === '/' ? 'home' : route.split('/')[1]}.png`, fullPage: true });
  }
  evidence.accessibility = accessibility;
  evidence.mobileRoutesWithoutOverflow = routes.length;
  evidence.result = 'pass';
  console.log(JSON.stringify(evidence, null, 2));
} finally {
  await browser.close();
  await writeFile(`${out}/evidence.json`, `${JSON.stringify(evidence, null, 2)}\n`);
}
