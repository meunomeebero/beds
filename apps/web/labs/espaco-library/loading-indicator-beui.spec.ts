import { expect, test, type Page } from '@playwright/test';

const label = 'Carregamento demonstrativo';

async function openCatalog(page: Page, theme: 'light' | 'dark') {
  await page.goto(`/?view=components&theme=${theme}`);
  const loading = page.getByRole('status', { name: label, exact: true });
  await loading.scrollIntoViewIfNeeded();
  await expect(loading).toBeVisible();
  return loading;
}

test.describe('LoadingIndicator · beUI loader adaptation', () => {
  for (const theme of ['light', 'dark'] as const) {
    test(`${theme} preserves the status name, label and spinner geometry`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      const loading = await openCatalog(page, theme);

      await expect(loading).toHaveAttribute('role', 'status');
      await expect(loading).toHaveAttribute('aria-label', label);
      await expect(loading).toHaveText(label);
      await expect(loading.locator('svg')).toHaveAttribute('aria-hidden', 'true');
      await expect(loading.locator('svg')).toHaveAttribute('width', '16');
      await expect(loading.locator('svg')).toHaveAttribute('height', '16');
      await expect(loading).toHaveCSS('gap', '8px');
      expect(await loading.innerText()).not.toMatch(/\d/);
    });
  }

  test('wraps the existing label at 320px without inventing progress', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const loading = await openCatalog(page, 'light');
    const labelNode = loading.locator('span').last();
    await expect(labelNode).toHaveText(label);
    expect(await labelNode.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    expect(await loading.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  });

  test('reduced motion removes spinner rotation and keeps the status available', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const loading = await openCatalog(page, 'dark');
    const spinner = loading.locator('svg');
    await expect(spinner).toBeVisible();
    await expect(loading).toHaveAttribute('aria-label', label);
    expect(await spinner.evaluate(element => getComputedStyle(element).transform)).toBe('none');
  });
});
