/**
 * Capture local evidence for the certifications gallery.
 *
 * Run against `npm run preview -- --port 4173`. The synthetic upload used for
 * the draft/viewer captures is created in the browser only and is never saved
 * to project content or public assets.
 */
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const base = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4173';
const output = 'docs/screenshots';
await mkdir(output, { recursive: true });

const browser = await chromium.launch();
try {
  const desktop = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const page = await desktop.newPage();

  await page.goto(`${base}/certifications/`);
  await page.getByRole('dialog', { name: 'Certifications' }).waitFor();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${output}/certifications-desktop-1600.png` });

  await page.goto(`${base}/`);
  await page.locator('.os-credentials').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${output}/certifications-home-1600.png` });

  await page.goto(`${base}/recruiter/`);
  await page.getByRole('tab', { name: 'Credentials' }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${output}/certifications-recruiter-1600.png` });

  await page.goto(`${base}/content-studio/`);
  const studio = page.getByRole('dialog', { name: 'Content Studio' });
  await studio.getByRole('button', { name: /^Certifications/ }).click();
  const first = studio.locator('.os-studio__fieldset').first();
  await first.getByLabel('Issue date (optional)').fill('2024-03-15');
  await first
    .getByLabel('Official verification URL (optional)')
    .fill('https://trailhead.salesforce.com/verification');
  await first.getByLabel('Verification link label (optional)').fill('Verify with Salesforce');
  await first
    .getByLabel('Redactions shown on the public copy (comma-separated labels only)')
    .fill('Credential ID, Verification code');
  const sample = await sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="640">
        <rect width="900" height="640" fill="#f4eeda"/>
        <rect x="42" y="42" width="816" height="556" fill="none" stroke="#b69a56" stroke-width="4"/>
        <text x="450" y="250" text-anchor="middle" font-family="Georgia" font-size="44" fill="#25342c">SAMPLE — NOT A REAL CERTIFICATE</text>
        <text x="450" y="316" text-anchor="middle" font-family="Helvetica" font-size="24" fill="#5c675f">Local viewer layout evidence only</text>
        <text x="450" y="356" text-anchor="middle" font-family="Helvetica" font-size="20" fill="#8a928b">No credential ID · no verification code</text>
      </svg>`,
    ),
  )
    .png()
    .toBuffer();
  await first
    .getByLabel('Upload certificate document for Salesforce Certified Administrator')
    .setInputFiles({ name: 'sample-certificate.png', mimeType: 'image/png', buffer: sample });
  await first.getByRole('img', { name: 'Draft certificate' }).waitFor();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${output}/certifications-studio-draft-1600.png` });
  await first.getByRole('button', { name: 'Preview' }).click();
  await page
    .getByRole('dialog', { name: 'Salesforce Certified Administrator certificate viewer' })
    .waitFor();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${output}/certifications-viewer-1600.png` });
  await desktop.close();

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(`${base}/certifications/`);
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: `${output}/certifications-mobile-390.png` });
  await mobile.close();
} finally {
  await browser.close();
}
console.log(`Captured certification evidence in ${output}/`);
