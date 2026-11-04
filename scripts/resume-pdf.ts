/**
 * Generate the downloadable résumé PDF from approved public content.
 *
 * Runs after `vite build` and `scripts/prerender.ts`, so the file lands in the
 * same `dist/` tree that gets deployed. No browser-side PDF generation and no
 * local server are involved at request time: the deployed site serves a static
 * file from `/resume/`.
 */
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { buildResumeHtml, RESUME_PDF_PATH, type ResumeFonts } from '../src/lib/resumeDocument';

const root = process.cwd();
const output = path.join(root, 'dist', RESUME_PDF_PATH.replace(/^\//, ''));

async function optionalFont(file: string): Promise<string | undefined> {
  try {
    return (await readFile(path.join(root, file))).toString('base64');
  } catch {
    return undefined;
  }
}

const fonts: ResumeFonts = {
  serif: await optionalFont('node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2'),
  sans: await optionalFont('node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2'),
};

const html = buildResumeHtml(fonts);

// Privacy gates run before a byte is written: this document must never carry a
// phone number, email address, credential ID or reference to private folders.
assert(!/\b\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}\b/.test(html), 'Résumé PDF source contains a phone number');
assert(!/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(html), 'Résumé PDF source contains an email address');
assert(!/credential\s*id\s*[:#]/i.test(html), 'Résumé PDF source contains a credential ID');
assert(!/content-studio|\.cloud-attachments|\/Users\//i.test(html), 'Résumé PDF source references private paths');

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready.then(() => true));
  await mkdir(path.dirname(output), { recursive: true });
  await page.pdf({
    path: output,
    format: 'A4',
    printBackground: true,
    margin: { top: '14mm', right: '15mm', bottom: '14mm', left: '15mm' },
  });
} finally {
  await browser.close();
}

const pdf = await readFile(output);
assert(pdf.subarray(0, 5).toString('latin1') === '%PDF-', 'Résumé export is not a PDF');
const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;
assert(pages >= 2 && pages <= 4, `Résumé PDF has an unexpected page count: ${pages}`);
assert(pdf.byteLength > 20_000, `Résumé PDF looks truncated: ${pdf.byteLength} bytes`);

console.log(`résumé PDF: ${path.relative(root, output)} (${pages} A4 pages, ${Math.round(pdf.byteLength / 1024)} KB)`);
