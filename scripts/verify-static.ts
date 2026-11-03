/** Verify the directory-index contract expected by GitHub Pages; never deploy. */
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { projects } from '../src/content/projects';

const dist = path.resolve('dist');
const origin = (process.env.SITE_URL ?? 'https://arjun2126.github.io').replace(/\/+$/, '');
const routes = ['/', '/projects/', '/recruiter/', '/salesforce/', '/ai/', '/experience/',
  '/northgate-live/', '/walkthrough/', '/resume/', '/skills/', '/about/', '/contact/',
  ...projects.map((project) => `/projects/${project.slug}/`)];

for (const route of routes) {
  const html = await readFile(path.join(dist, route, 'index.html'), 'utf8');
  assert(html.includes(`rel="canonical" href="${origin}${route}"`), `Canonical missing: ${route}`);
  assert(html.includes('<main'), `Readable prerender missing: ${route}`);
}

async function checkHtml(folder: string): Promise<void> {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const file = path.join(folder, entry.name);
    if (entry.isDirectory()) await checkHtml(file);
    else if (entry.name.endsWith('.html')) {
      const html = await readFile(file, 'utf8');
      for (const match of html.matchAll(/(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
        const urlPath = match[1];
        if (urlPath.startsWith('//')) continue;
        const target = path.join(dist, urlPath, urlPath.endsWith('/') ? 'index.html' : '');
        assert((await stat(target)).isFile(), `Broken local reference in ${file}: ${urlPath}`);
      }
    }
  }
}

await checkHtml(dist);
const notFound = await readFile(path.join(dist, '404.html'), 'utf8');
assert(notFound.includes('noindex, follow'), '404 must not be indexed');
assert(notFound.includes('That window doesn’t exist.'), 'Readable custom 404 missing');
assert.equal(await readFile(path.join(dist, '404/index.html'), 'utf8'), notFound);
await stat(path.join(dist, '.nojekyll'));
const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
for (const route of routes) assert(sitemap.includes(`<loc>${origin}${route}</loc>`));
assert(!sitemap.includes('/content-studio/'), 'Private authoring route must not be indexed');
assert(!sitemap.includes('/404/'), '404 must not be in the sitemap');
assert((await readFile(path.join(dist, 'robots.txt'), 'utf8')).includes(`${origin}/sitemap.xml`));
console.log(`Static hosting verified: ${routes.length} public routes, canonical URLs, local links/assets, sitemap, .nojekyll and custom 404.`);
