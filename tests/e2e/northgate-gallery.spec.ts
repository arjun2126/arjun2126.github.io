import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';

const gallery = JSON.parse(readFileSync(new URL('../../src/content/northgate-platform-gallery.json', import.meta.url), 'utf8')) as typeof import('../../src/content/northgate-platform-gallery.json');

for (const [mode, viewport] of [
  ['desktop', { width: 1440, height: 900 }],
  ['mobile', { width: 390, height: 844 }],
] as const) {
  test(`Northgate platform gallery preserves all categories and viewers on ${mode}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/projects/northgate-motors/');
    await expect(page.getByRole('heading', { name: 'Salesforce Platform gallery', exact: true })).toBeVisible();
    for (const section of gallery.sections) {
      const region = page.getByRole('region', { name: section.title, exact: true });
      await expect(region.getByRole('heading', { name: section.title, exact: true })).toBeVisible();
      await expect(region.locator('.gallery__item')).toHaveCount(section.images.length);
      for (let i = 0; i < section.images.length; i++) {
        const button = region.locator('.gallery__item').nth(i);
        await button.scrollIntoViewIfNeeded();
        await expect.poll(() => button.locator('img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
        await button.click();
        const viewer = page.getByRole('dialog', { name: 'Project screenshot viewer' });
        await expect(viewer).toBeVisible();
        await expect(viewer.locator('figure img')).toHaveAttribute('src', section.images[i].src);
        await expect.poll(() => viewer.locator('figure img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
        if (i === 0) {
          const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
          expect(result.violations.filter(issue => ['serious', 'critical'].includes(issue.impact ?? ''))).toEqual([]);
          await page.keyboard.press('ArrowRight');
          await expect(viewer.locator('figure img')).toHaveAttribute('src', section.images[1].src);
          await page.keyboard.press('ArrowLeft');
          await expect(viewer.locator('figure img')).toHaveAttribute('src', section.images[0].src);
        }
        await page.keyboard.press('Escape');
        await expect(viewer).not.toBeVisible();
        await expect(button).toBeFocused();
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.locator('.gallery__item')).toHaveCount(29);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(result.violations.filter(issue => ['serious', 'critical'].includes(issue.impact ?? ''))).toEqual([]);
  });
}

test('Northgate categories and all new captures are readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('/projects/northgate-motors/');
    for (const section of gallery.sections) {
      const region = page.getByRole('region', { name: section.title, exact: true });
      await expect(region.locator('img')).toHaveCount(section.images.length);
      await expect(region).toContainText(section.description);
      for (const image of section.images) {
        await expect(region.locator(`a[href="${image.src}"]`)).toHaveCount(1);
      }
    }
  } finally {
    await context.close();
  }
});
