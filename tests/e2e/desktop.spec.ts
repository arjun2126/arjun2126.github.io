import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { strToU8, zipSync } from 'fflate';
import sharp from 'sharp';

function docxFixture() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t># Arjun Subramanya</w:t></w:r></w:p><w:p><w:r><w:t>Salesforce developer and administrator building business systems, analytics, and AI-assisted workflows with documented delivery.</w:t></w:r></w:p></w:body></w:document>`;
  return Buffer.from(zipSync({ 'word/document.xml': strToU8(xml) }));
}

async function expectNoSeriousA11yViolations(page: Page, label: string) {
  await page.waitForTimeout(900);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const serious = results.violations.filter(
    (violation) => violation.impact === 'critical' || violation.impact === 'serious',
  );
  expect(
    serious,
    `${label}: ${serious.map((violation) => `${violation.id} (${violation.nodes.length})`).join(', ')}`,
  ).toEqual([]);
}

test.describe('ArjunOS desktop', () => {
  test('composes the main, recruiter and Salesforce windows', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.window')).toHaveCount(3);
    await expect(page.getByRole('dialog', { name: 'ArjunOS desktop window' })).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Recruiter Mode' })).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Salesforce Workspace' })).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 1, name: "Hi, I'm Arjun Subramanya." }),
    ).toBeVisible();
    await expect(page.locator('.os-hero__headline')).toHaveText(
      'Salesforce developer and administrator building systems that operations teams rely on.',
    );
    await expect(page.locator('.os-competency')).toHaveCount(4);
    await expect(page.locator('.os-competency').nth(0)).toHaveAttribute('href', '/salesforce/');
    await expect(page.locator('.os-featured .os-project')).toHaveCount(4);
    await expect(page.locator('.os-featured .os-project__category')).toHaveCount(4);
    await expect(page.getByRole('heading', { name: 'Featured Projects' })).toBeVisible();
    await expect(page).toHaveTitle('Arjun Subramanya — Salesforce Developer & Software Engineer');
  });

  test('searches projects by evidence and clears', async ({ page }) => {
    await page.goto('/projects/');
    await expect(page.locator('.os-project')).toHaveCount(8);
    const search = page.getByRole('searchbox', { name: 'Search projects' });
    await expect(search).toBeFocused();
    await search.fill('glicko');
    await expect(page.locator('.os-project')).toHaveCount(1);
    await expect(page.locator('.os-project')).toContainText('Vantage');
    await expect(page.getByText('1 project found')).toBeVisible();

    await search.fill('not-a-real-project');
    await expect(page.getByRole('heading', { name: 'No projects match that.' })).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(page.locator('.os-project')).toHaveCount(8);
  });

  test('filters by discipline and resets', async ({ page }) => {
    await page.goto('/projects/');
    const filters = page.getByRole('group', { name: 'Filter by discipline' });
    await filters.getByRole('button', { name: 'Analytics' }).click();
    await expect(page.locator('.os-project')).toHaveCount(1);
    await expect(page.locator('.os-project')).toContainText('Care Operations Analytics');
    await page.getByRole('searchbox', { name: 'Search projects' }).fill('guest');
    await expect(page.locator('.os-project')).toHaveCount(0);
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.locator('.os-project')).toHaveCount(8);
  });

  test('keyboard shortcut focuses search and skip link comes first', async ({ page }) => {
    await page.goto('/projects/');
    // The project index auto-focuses search on arrival; move focus away first so
    // the global "/" shortcut is exercised from a neutral context.
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.keyboard.press('/');
    await expect(page.getByRole('searchbox', { name: 'Search projects' })).toBeFocused();
    await page.keyboard.type('apex');
    await expect(page.locator('.os-project').first()).toBeVisible();

    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
  });
});

test.describe('window lifecycle', () => {
  test('minimizes, restores, maximizes, restores and closes every window', async ({ page }) => {
    await page.goto('/');
    const main = page.locator('.window[data-window="projects"]');
    await expect(main).toBeVisible();

    await page.getByRole('button', { name: 'Minimize ArjunOS' }).click();
    await expect(main).toHaveAttribute('aria-hidden', 'true');
    await expect(page.getByRole('button', { name: 'Projects (minimized)' })).toBeVisible();
    await page.getByRole('button', { name: 'Projects (minimized)' }).click();
    await expect(main).not.toHaveAttribute('aria-hidden', 'true');

    await page.getByRole('button', { name: 'Maximize ArjunOS' }).click();
    await expect(main).toHaveClass(/is-maximized/);
    await page.getByRole('button', { name: 'Restore ArjunOS' }).click();
    await expect(main).not.toHaveClass(/is-maximized/);

    await page.getByRole('button', { name: 'Close Recruiter Mode' }).click();
    await page.getByRole('button', { name: 'Close Salesforce Workspace' }).click();
    await page.getByRole('button', { name: 'Close ArjunOS' }).click();
    await expect(page.locator('.window')).toHaveCount(0);
    await expect(page.getByText('Everything is tucked away.')).toBeVisible();
    await page.getByRole('button', { name: 'Open Projects' }).click();
    await expect(page.locator('.window')).toHaveCount(3);
  });

  test('opens apps above the desktop and tracks the active window', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation', { name: 'Application dock' }).getByRole('button', { name: 'Résumé' }).click();
    await expect(page).toHaveURL(/\/resume\/$/);
    await expect(page.locator('.window')).toHaveCount(2);
    const resume = page.getByRole('dialog', { name: 'Résumé' });
    await expect(resume).toBeVisible();
    await expect(resume).toHaveClass(/is-active/);
    await expect(resume.getByRole('heading', { level: 1 })).toContainText('Résumé');

    await page.getByRole('button', { name: 'Close Résumé' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('.window')).toHaveCount(3);
  });

  test('refits open windows when the browser narrows', async ({ page }) => {
    await page.goto('/projects/northgate-motors/');
    await page.setViewportSize({ width: 960, height: 760 });
    await page.waitForTimeout(700);
    const boxes = await page.locator('.window').evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, right: rect.right, bottom: rect.bottom };
      }),
    );
    for (const box of boxes) {
      expect(box.left).toBeGreaterThanOrEqual(0);
      expect(box.right).toBeLessThanOrEqual(960);
      expect(box.bottom).toBeLessThanOrEqual(760);
    }
  });

  test('dragging a title bar updates window geometry', async ({ page }) => {
    await page.goto('/');
    const frame = page.locator('.window[data-window="recruiter"]');
    // The 360ms arrival animation transforms the visual bounding box. Measure
    // only once it finishes, rather than comparing animated and layout coords.
    await frame.evaluate(async (element) => {
      await Promise.all(element.getAnimations().map((animation) => animation.finished));
    });
    const before = await frame.boundingBox();
    expect(before).not.toBeNull();
    const bar = frame.locator('.window__bar');
    const barBox = await bar.boundingBox();
    expect(barBox).not.toBeNull();
    if (!before || !barBox) throw new Error('Recruiter window geometry is missing');

    await page.mouse.move(barBox.x + barBox.width / 2, barBox.y + barBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(barBox.x + barBox.width / 2 - 70, barBox.y + barBox.height / 2 + 40, { steps: 8 });
    await page.mouse.up();
    await expect.poll(async () => {
      const after = await frame.boundingBox();
      return after ? Math.abs(after.x - (before.x - 70)) : Infinity;
    }).toBeLessThan(8);
    await expect.poll(async () => {
      const after = await frame.boundingBox();
      return after ? Math.abs(after.y - (before.y + 40)) : Infinity;
    }).toBeLessThan(8);
  });
});

test.describe('project case studies', () => {
  test('opens a project from a card and returns to the desktop', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Northgate Motors/ }).first().click();
    await expect(page).toHaveURL(/\/projects\/northgate-motors\/$/);
    const project = page.getByRole('dialog', { name: 'Northgate Motors' });
    await expect(project.getByRole('heading', { level: 1 })).toHaveText('Northgate Motors');
    await expect(project.getByRole('heading', { name: 'What it demonstrates' })).toBeVisible();
    await expect(project.getByText('What this page does not claim')).toBeVisible();
    await expect(project.getByRole('img', { name: /vehicle listing/i }).first()).toBeVisible();

    await project.getByRole('link', { name: 'Open Live Experience' }).click();
    await expect(page).toHaveURL(/\/northgate-live\/$/);
    await expect(page.getByRole('dialog', { name: 'Northgate Live' })).toBeVisible();

    await page.goto('/projects/northgate-motors/');
    const reopened = page.getByRole('dialog', { name: 'Northgate Motors' });
    await reopened.getByRole('link', { name: 'All projects' }).click();
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:4173\/$/);
    await expect(page.locator('.window')).toHaveCount(3);
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName("Hi, I'm Arjun Subramanya.");
  });

  test('opens the Northgate live window with honest framing fallback and live routes', async ({ page }) => {
    await page.goto('/northgate-live/');
    const live = page.getByRole('dialog', { name: 'Northgate Live' });
    await expect(live).toBeVisible();
    await expect(live.getByRole('heading', { name: 'Northgate Motors, live.' })).toBeVisible();
    await expect(live.getByText('Embedded framing is blocked by Salesforce.')).toBeVisible();
    await expect(live.getByText(/X-Frame-Options: SAMEORIGIN/).first()).toBeVisible();
    await expect(live.locator('.os-live__footer').getByText(/Owner Portal/)).toBeVisible();

    const original = live.getByRole('link', { name: 'Open the live buyer site' });
    await expect(original).toHaveAttribute('href', 'https://orgfarm-25065ad46a-dev-ed.develop.my.site.com/owners/s/buyer');
    await expect(original).toHaveAttribute('target', '_blank');
    await expect(original).toHaveAttribute('rel', /noreferrer/);
    await expect(live.getByRole('link', { name: 'Open inventory' })).toHaveAttribute(
      'href',
      'https://orgfarm-25065ad46a-dev-ed.develop.my.site.com/owners/s/buyer-inventory',
    );
    await expect(live.getByRole('link', { name: 'Open 3D Studio' })).toHaveAttribute(
      'href',
      'https://orgfarm-25065ad46a-dev-ed.develop.my.site.com/owners/s/buyer-studio',
    );

    await live
      .getByRole('navigation', { name: 'Northgate buyer pages' })
      .getByRole('button', { name: '3D Studio' })
      .click();
    await expect(live.getByRole('link', { name: 'Open Original Website' })).toHaveAttribute(
      'href',
      'https://orgfarm-25065ad46a-dev-ed.develop.my.site.com/owners/s/buyer-studio',
    );
    await expect(live.locator('.os-live__stage img')).toHaveAttribute(
      'src',
      '/projects/northgate-motors-demo/studio-3d.webp',
    );
    await expect(live.getByRole('status')).toHaveCount(0);
    expect(await live.locator('a[href*="/owners/s/login"]').count()).toBe(0);
  });

  test('direct URLs render project pages with metadata', async ({ page }) => {
    await page.goto('/projects/care-operations-analytics/');
    await expect(page).toHaveTitle('Care Operations Analytics — Arjun Subramanya');
    await expect(page.getByRole('dialog', { name: 'Care Operations Analytics' })).toBeVisible();
    expect(await page.locator('meta[name="description"]').getAttribute('content')).toContain(
      'Canadian care data',
    );

    await page.goto('/projects/not-a-project/');
    await expect(page.getByRole('heading', { name: 'That window doesn’t exist.' })).toBeVisible();
    await page.getByRole('link', { name: 'Back to projects' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('every desktop app route opens its window', async ({ page }) => {
    const routes: Array<[string, string]> = [
      ['/resume/', 'Résumé'],
      ['/skills/', 'Skills'],
      ['/about/', 'About'],
      ['/contact/', 'Contact'],
      ['/ai/', 'AI Engineering'],
      ['/experience/', 'Experience'],
      ['/salesforce/', 'Salesforce Workspace'],
      ['/northgate-live/', 'Northgate Live'],
      ['/content-studio/', 'Content Studio'],
    ];
    for (const [path, name] of routes) {
      await page.goto(path);
      await expect(page.getByRole('dialog', { name })).toBeVisible();
    }
  });

  test('sidebar navigation reaches the workspace and project index', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.getByRole('navigation', { name: 'ArjunOS applications' });
    await sidebar.getByRole('link', { name: 'Salesforce Workspace' }).click();
    await expect(page).toHaveURL(/\/salesforce\/$/);
    await expect(page.getByRole('dialog', { name: 'Salesforce Workspace' })).toBeVisible();

    await sidebar.getByRole('link', { name: 'Projects' }).click();
    await expect(page).toHaveURL(/\/projects\/$/);
    await expect(page.getByRole('heading', { name: 'All Projects' })).toBeVisible();
  });

  test('recruiter mode has a standalone, recruiter-friendly URL', async ({ page }) => {
    await page.goto('/recruiter/');
    await expect(page.locator('.window')).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1, name: 'Arjun Subramanya' })).toBeVisible();
    await expect(page.locator('.os-recruiter__actions--top')).toBeVisible();
    await expect(page.locator('.os-recruiter__selected-grid a')).toHaveCount(4);
    await expect(page.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('tab', { name: 'Experience' }).click();
    await expect(
      page.getByRole('heading', { name: 'Business Systems Developer & Administrator' }),
    ).toBeVisible();
    await page.getByRole('tab', { name: 'Credentials' }).click();
    await expect(page.getByText('Salesforce Certified Administrator')).toBeVisible();
    await expect(page.getByRole('link', { name: 'View Résumé' })).toHaveAttribute('href', '/resume/');
    await expect(page.getByRole('link', { name: 'Contact Me' })).toHaveAttribute('href', '/contact/');
  });

  test('external links point only at the public profiles', async ({ page }) => {
    await page.goto('/');
    const external = await page.locator('a[target="_blank"]').evaluateAll((links) =>
      links.map((link) => ({ href: (link as HTMLAnchorElement).href, rel: link.getAttribute('rel') })),
    );
    expect(external.length).toBeGreaterThan(0);
    for (const link of external) {
      expect(link.href).toMatch(
        /^https:\/\/(github\.com\/arjun2126|x\.com\/arjunsubramanya|www\.linkedin\.com\/in\/arjunsubra)/,
      );
      expect(link.rel).toContain('noreferrer');
      expect(link.rel).toContain('noopener');
    }
  });

  test('serves readable project content without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto('/projects/northgate-motors/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Northgate Motors');
    await expect(page.getByRole('heading', { name: 'What it demonstrates' })).toBeVisible();
    await expect(page.getByText('Guest-safe by construction')).toBeVisible();
    await context.close();
  });
});

test.describe('content studio', () => {
  test('production authoring is inert on a non-loopback host', async ({ page }) => {
    // Serve the actual production output under a public-looking browser origin
    // without publishing it or relying on external DNS/network access.
    await page.route('http://portfolio.test/**', async (route) => {
      const local = new URL(route.request().url());
      local.host = '127.0.0.1:4173';
      await route.fulfill({ response: await route.fetch({ url: local.href }) });
    });
    await page.goto('http://portfolio.test/content-studio/');
    await expect(page.getByRole('heading', { name: 'Content Studio is local only' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save to project', exact: true })).toHaveCount(0);
    await expect(page.getByRole('textbox')).toHaveCount(0);
    const response = await page.request.post('/__arjunos/content/save', { data: {} });
    expect(response.status()).toBe(404);
  });

  test('edits the local draft without publishing it', async ({ page }) => {
    await page.goto('/content-studio/');
    const dialog = page.getByRole('dialog', { name: 'Content Studio' });
    await expect(dialog.getByText('Local only · never published')).toBeVisible();
    const name = dialog.getByLabel('Name');
    await name.fill('Arjun Subramanya — draft');
    await expect(dialog.getByText(/Saved locally/)).toBeVisible();

    await dialog.getByRole('button', { name: 'Résumé' }).click();
    await expect(dialog.getByRole('heading', { name: 'Résumé' })).toBeVisible();
    await expect(dialog.getByText(/Import DOCX, Markdown, text or JSON/)).toBeVisible();
  });

  test('imports DOCX, stores a photo and survives reload', async ({ page }) => {
    await page.goto('/content-studio/');
    const dialog = page.getByRole('dialog', { name: 'Content Studio' });
    const png = await sharp({
      create: { width: 32, height: 40, channels: 3, background: { r: 150, g: 30, b: 45 } },
    })
      .png()
      .toBuffer();
    await dialog.getByLabel('Upload profile photo').setInputFiles({
      name: 'portrait.png',
      mimeType: 'image/png',
      buffer: png,
    });
    await expect(dialog.getByRole('img', { name: 'Draft profile' })).toBeVisible();

    await dialog.getByRole('button', { name: 'Résumé' }).click();
    await dialog.getByLabel('Import professional document').setInputFiles({
      name: 'resume.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      buffer: docxFixture(),
    });
    await expect(dialog.getByText(/DOCX text extracted locally/)).toBeVisible();
    await dialog.getByRole('checkbox').first().check();
    await dialog.getByRole('button', { name: 'Apply selected fields' }).click();

    await page.reload();
    const reloaded = page.getByRole('dialog', { name: 'Content Studio' });
    await expect(reloaded.getByLabel('Name')).toHaveValue('Arjun Subramanya');
    await expect(reloaded.getByRole('img', { name: 'Draft profile' })).toBeVisible();
  });
});

test.describe('layout and owner media regressions', () => {
  test('AI and Experience windows scroll to their final content', async ({ page }) => {
    await page.goto('/ai/');
    const ai = page.getByRole('dialog', { name: 'AI Engineering' });
    await ai.locator('.window__body').hover();
    for (let i = 0; i < 6; i += 1) await page.mouse.wheel(0, 600);
    await page.waitForTimeout(400);
    await expect(ai.getByRole('link', { name: 'How this portfolio was built' })).toBeInViewport();

    await page.goto('/experience/');
    const experience = page.getByRole('dialog', { name: 'Experience' });
    await experience.locator('.window__body').hover();
    for (let i = 0; i < 10; i += 1) await page.mouse.wheel(0, 600);
    await page.waitForTimeout(400);
    await expect(experience.getByRole('link', { name: 'Open the résumé' })).toBeInViewport();
  });

  test('a maximized window leaves the Dock unobstructed', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Maximize ArjunOS' }).click();
    await page.waitForTimeout(500);
    const win = await page.locator('.window[data-window="projects"]').boundingBox();
    const dock = await page.locator('.os-dock').boundingBox();
    expect(win).not.toBeNull();
    expect(dock).not.toBeNull();
    if (!win || !dock) return;
    expect(win.y + win.height).toBeLessThanOrEqual(dock.y);
  });

  test('the maximized Salesforce workspace uses the available width', async ({ page }) => {
    await page.goto('/salesforce/');
    const sf = page.getByRole('dialog', { name: 'Salesforce Workspace' });
    await page.getByRole('button', { name: 'Maximize Salesforce Workspace' }).click();
    await page.waitForTimeout(400);
    const tabSize = await sf
      .locator('.os-sf__tab')
      .first()
      .evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
    expect(tabSize).toBeGreaterThanOrEqual(11);
    const columnCount = await sf
      .locator('.os-sf__content')
      .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length);
    expect(columnCount).toBeGreaterThanOrEqual(2);
    const content = await sf.locator('.os-sf__content').boundingBox();
    expect(content?.width ?? 0).toBeGreaterThan(1000);
  });

  test('Vantage uses the supplied captures and the portrait appears in profile views', async ({ page }) => {
    await page.goto('/projects/vantage/');
    const vantage = page.getByRole('dialog', { name: 'Vantage' });
    await expect(vantage.locator('.project-hero-image img')).toHaveAttribute(
      'alt',
      /Live match scoring on iPhone/,
    );
    await expect(vantage.locator('.gallery__item')).toHaveCount(16);
    await expect(vantage.getByText('Screenshots supplied from the app by Arjun.')).toBeVisible();

    await page.goto('/about/');
    const about = page.getByRole('dialog', { name: 'About' });
    await expect(about.getByRole('img', { name: 'Portrait of Arjun Subramanya' })).toBeVisible();

    await page.goto('/resume/');
    const resume = page.getByRole('dialog', { name: 'Résumé' });
    await expect(resume.getByRole('img', { name: 'Portrait of Arjun Subramanya' })).toBeVisible();
    await expect(resume.locator('a[download]')).toHaveCount(0);
  });
});

test.describe('accessibility', () => {
  test('home has no serious automated violations', async ({ page }) => {
    await page.goto('/');
    await expectNoSeriousA11yViolations(page, 'desktop home');
  });

  test('project experience has no serious automated violations', async ({ page }) => {
    await page.goto('/projects/northgate-motors/');
    await expect(page.getByRole('dialog', { name: 'Northgate Motors' })).toBeVisible();
    await expectNoSeriousA11yViolations(page, 'desktop project');
  });

  test('résumé has no serious automated violations', async ({ page }) => {
    await page.goto('/resume/');
    await expectNoSeriousA11yViolations(page, 'desktop résumé');
  });

  test('recruiter view has no serious automated violations', async ({ page }) => {
    await page.goto('/recruiter/');
    await expectNoSeriousA11yViolations(page, 'recruiter view');
  });

  test('respects reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const durations = await page.locator('.window').evaluateAll((elements) =>
      elements.flatMap((element) => {
        const style = getComputedStyle(element);
        return [style.animationDuration, style.transitionDuration];
      }),
    );
    for (const duration of durations) {
      const numeric = Number.parseFloat(duration);
      expect(Number.isNaN(numeric) ? 0 : numeric).toBeLessThanOrEqual(0.01);
    }
  });
});
