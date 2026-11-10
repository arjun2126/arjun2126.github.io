import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  '/',
  '/resume/',
  '/skills/',
  '/about/',
  '/contact/',
  '/projects/',
  '/ai/',
  '/experience/',
  '/certifications/',
  '/salesforce/',
  '/projects/northgate-motors/',
  '/northgate-live/',
  '/recruiter/',
];

test.describe('mobile document mode', () => {
  test('renders the mobile experience without desktop windows', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.mobile')).toBeVisible();
    await expect(page.locator('.window')).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 1, name: "Hi, I'm Arjun Subramanya." }),
    ).toBeVisible();
    await expect(page.locator('.m-hero__headline')).toHaveText(
      'Salesforce developer and administrator building systems that operations teams rely on.',
    );
  });

  test('downloads the same résumé PDF in document mode', async ({ page }) => {
    await page.goto('/resume/');
    const download = page.getByRole('link', { name: /Download PDF/i });
    await expect(download).toBeVisible();
    await expect(download).toHaveAttribute('href', '/resume/arjun-subramanya-resume.pdf');
    const response = await page.request.get('/resume/arjun-subramanya-resume.pdf');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/pdf');
    expect((await response.body()).subarray(0, 5).toString('latin1')).toBe('%PDF-');
  });

  test('every route fits the viewport without horizontal overflow', async ({ page }) => {
    for (const path of routes) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(overflow.scrollWidth, `${path} horizontal overflow`).toBeLessThanOrEqual(overflow.clientWidth + 1);
    }
  });

  test('search, filter and project navigation work on mobile', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('searchbox', { name: 'Search projects' }).fill('watchos');
    await expect(page.locator('.project-card')).toHaveCount(1);
    await expect(page.locator('.project-card')).toContainText('Vantage');
    await page.getByRole('link', { name: /Vantage/ }).first().click();
    await expect(page).toHaveURL(/\/projects\/vantage\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vantage');
    await expect(page.getByRole('link', { name: 'All projects' })).toBeVisible();

    await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Contact' }).click();
    await expect(page).toHaveURL(/\/contact\/$/);
    await expect(page.getByRole('heading', { name: /Let’s talk/ })).toBeVisible();
  });

  test('mobile home has no serious automated violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const serious = results.violations.filter(
      (violation) => violation.impact === 'critical' || violation.impact === 'serious',
    );
    expect(
      serious,
      serious.map((violation) => `${violation.id} (${violation.nodes.length})`).join(', '),
    ).toEqual([]);
  });

  test('standalone recruiter keeps actions, tabs and details usable', async ({ page }) => {
    await page.goto('/recruiter/');
    await expect(page.getByRole('heading', { level: 1, name: 'Arjun Subramanya' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'View Résumé' })).toBeInViewport();
    await expect(page.getByRole('link', { name: 'Contact Me' })).toBeInViewport();
    await expect(page.locator('.os-recruiter__selected-grid a')).toHaveCount(4);
    const tabs = page.getByRole('tablist', { name: 'Recruiter profile sections' });
    for (const tab of ['Overview', 'Experience', 'Skills', 'Projects', 'Credentials']) {
      await expect(tabs.getByRole('tab', { name: tab })).toBeVisible();
    }
    await page.getByRole('tab', { name: 'Credentials' }).click();
    await expect(page.getByText('Salesforce Certified Administrator')).toBeVisible();
  });

  test('opens the certification gallery and reads the credential record', async ({ page }) => {
    await page.goto('/certifications/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Certifications');
    const cardCount = await page.locator('.os-cert-card').count();
    expect(cardCount).toBeGreaterThan(0);
    await expect(page.locator('.os-cert-status')).toHaveCount(cardCount);
    await expect(page.locator('.os-cert-card h3').first()).not.toBeEmpty();
    await expect(page.getByText(/Credential IDs, verification codes/).first()).toBeVisible();
    await page
      .getByRole('navigation', { name: 'Mobile navigation' })
      .getByRole('link', { name: 'Home' })
      .click();
    await expect(page).toHaveURL(/\/$/);
    expect(await page.locator('.m-cert-list li').count()).toBe(cardCount);
    await expect(page.locator('#mobile-certs-title')).toHaveText('Salesforce certifications.');
    await expect(page.locator('.m-certs-teaser')).not.toContainText('with the source');
    await expect(page.locator('.m-certs-teaser')).toContainText('verification links are not published');
  });

  test('mobile project page has no serious automated violations', async ({ page }) => {
    await page.goto('/projects/northgate-motors/');
    await page.waitForTimeout(500);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const serious = results.violations.filter(
      (violation) => violation.impact === 'critical' || violation.impact === 'serious',
    );
    expect(
      serious,
      serious.map((violation) => `${violation.id} (${violation.nodes.length})`).join(', '),
    ).toEqual([]);
  });
});
