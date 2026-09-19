import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark'] as const) {
  test.describe(`Select / FilterSelect · ${theme}`, () => {
    test.beforeEach(async ({ page }) => {
      page.on('pageerror', error => { throw error; });
      await page.route('**/*', route => {
        const request = route.request();
        const url = new URL(request.url());
        if (!['127.0.0.1', 'localhost'].includes(url.hostname) || !['GET', 'HEAD'].includes(request.method())) {
          throw new Error(`Unexpected external or mutating request: ${request.method()} ${url.origin}${url.pathname}`);
        }
        return route.continue();
      });
      await page.goto(`/?view=components&theme=${theme}`);
      await expect(page.getByRole('heading', { name: 'Componentes', exact: true })).toBeVisible();
    });

    test('adopts beUI entry motion while preserving BEDS keyboard, disabled and focus contracts', async ({ page }) => {
      const trigger = page.getByRole('button', { name: 'Modo de trabalho: Auto', exact: true });
      await trigger.scrollIntoViewIfNeeded();
      await trigger.focus();
      await trigger.press('ArrowDown');
      const list = page.getByRole('listbox', { name: 'Modo de trabalho', exact: true });
      await expect(list).toBeFocused();
      await expect(list).toHaveCSS('width', '260px');
      await expect(list.locator('[data-active="true"]')).toContainText('Auto');
      await list.press('End');
      await expect(list.locator('[data-active="true"]')).toContainText('Review a project with a deliberately long name');
      await list.press('ArrowDown');
      await expect(list.locator('[data-active="true"]')).toContainText('Auto');
      await list.press('ArrowUp');
      await expect(list.locator('[data-active="true"]')).toContainText('Review a project with a deliberately long name');
      await expect(list.getByRole('option', { name: /Unavailable/ })).toHaveAttribute('aria-disabled', 'true');
      await list.press('Home');
      await list.press('ArrowDown');
      await list.press('Enter');
      await expect(page.getByRole('button', { name: 'Modo de trabalho: Review', exact: true })).toBeFocused();
      await expect(page.getByText('Modo selecionado: Review.', { exact: true })).toBeVisible();
    });

    test('keeps FilterSelect variant geometry, touch targets and reduced motion', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload();
      await expect(page.getByRole('heading', { name: 'Componentes', exact: true })).toBeVisible();
      const filter = page.getByRole('button', { name: 'Período da atividade: Últimos 30 dias', exact: true });
      await filter.scrollIntoViewIfNeeded();
      await expect(filter).toHaveCSS('min-height', '36px');
      await filter.click();
      const list = page.getByRole('listbox', { name: 'Período da atividade', exact: true });
      await expect(list).toBeVisible();
      await expect(list).toHaveCSS('border-radius', '10px');
      await expect(list).toHaveCSS('width', '260px');
      const reducedMotion = await list.locator('.es-select-option').first().evaluate(element => {
        const style = getComputedStyle(element);
        return { transform: style.transform, filter: style.filter };
      });
      expect(reducedMotion.transform).toBe('none');
      expect(reducedMotion.filter).toBe('none');
      await list.getByRole('option', { name: 'Últimos 7 dias', exact: true }).click();
      const selectedFilter = page.getByRole('button', { name: 'Período da atividade: Últimos 7 dias', exact: true });
      await expect(selectedFilter).toBeFocused();

      await selectedFilter.click();
      await page.mouse.click(1, 1);
      await expect(list).toHaveCount(0);
    });
  });
}
