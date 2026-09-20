import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark'] as const) {
  test.describe(`BEDS Tabs beUI adaptation · ${theme}`, () => {
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
      await page.goto(`/?view=components&theme=${theme}&ber11=1`);
      await expect(page.getByTestId('ber11-fixture')).toBeVisible();
    });

    test('keeps pointer motion animated but keyboard selection instant', async ({ page }) => {
      const tabs = page.getByRole('tablist', { name: 'BER-11 pointer motion' });
      const first = tabs.getByRole('tab', { name: 'First', exact: true });
      const second = tabs.getByRole('tab', { name: 'Second', exact: true });
      const indicator = tabs.locator('[data-tabs-indicator]');
      const component = page.locator('.es-tabs').filter({ has: tabs });
      await second.click();
      await expect(second).toHaveAttribute('aria-selected', 'true');
      await page.waitForTimeout(50);
      expect(await indicator.evaluate(element => getComputedStyle(element).transform)).not.toBe('none');
      await second.press('ArrowLeft');
      await expect(first).toBeFocused();
      await expect(first).toHaveAttribute('aria-selected', 'true');
      await expect(indicator).toHaveCSS('transform', 'none');
      await expect(component.getByRole('tabpanel', { name: 'First', exact: true })).toHaveCSS('transform', 'none');
      await expect(component.getByRole('tabpanel', { name: 'First', exact: true })).toHaveCSS('opacity', '1');
      await second.focus();
      await second.press('Enter');
      await expect(second).toHaveAttribute('aria-selected', 'true');
      await expect(indicator).toHaveCSS('transform', 'none');
      await first.focus();
      await first.press('Space');
      await expect(first).toHaveAttribute('aria-selected', 'true');
      await expect(indicator).toHaveCSS('transform', 'none');
    });

    test('holds the keyboard target through controlled lag and stays instant after acceptance', async ({ page }) => {
      const tabs = page.getByRole('tablist', { name: 'BER-11 delayed acceptance' });
      const first = tabs.getByRole('tab', { name: 'First', exact: true });
      const second = tabs.getByRole('tab', { name: 'Second', exact: true });
      const indicator = tabs.locator('[data-tabs-indicator]');
      const component = page.locator('.es-tabs').filter({ has: tabs });
      await first.focus();
      await first.press('ArrowRight');
      await expect(second).toBeFocused();
      await expect(first).toHaveAttribute('aria-selected', 'true');
      await expect.poll(async () => second.getAttribute('aria-selected')).toBe('true');
      await expect(indicator).toHaveCSS('transform', 'none');
      await expect(component.getByRole('tabpanel', { name: 'Second', exact: true })).toHaveCSS('transform', 'none');
      await expect(component.getByRole('tabpanel', { name: 'Second', exact: true })).toHaveCSS('opacity', '1');
      await page.waitForTimeout(60);
      await expect(indicator).toHaveCSS('transform', 'none');
      await expect(component.getByRole('tabpanel', { name: 'Second', exact: true })).toHaveCSS('transform', 'none');
    });

    test('rejected keyboard intent recovers to an animated pointer selection and skips disabled tabs', async ({ page }) => {
      const tabs = page.getByRole('tablist', { name: 'BER-11 rejection' });
      const first = tabs.getByRole('tab', { name: 'First', exact: true });
      const second = tabs.getByRole('tab', { name: 'Second', exact: true });
      const blocked = tabs.getByRole('tab', { name: 'Blocked', exact: true });
      const indicator = tabs.locator('[data-tabs-indicator]');
      await expect(blocked).toBeDisabled();
      await first.focus();
      await first.press('ArrowRight');
      await expect(second).toBeFocused();
      await expect(first).toHaveAttribute('aria-selected', 'true');
      await page.waitForTimeout(220);
      await expect(first).toHaveAttribute('aria-selected', 'true');
      await second.click();
      await expect(second).toHaveAttribute('aria-selected', 'true');
      await page.waitForTimeout(50);
      expect(await indicator.evaluate(element => getComputedStyle(element).transform)).not.toBe('none');
      await second.press('ArrowRight');
      await expect(first).toBeFocused();
      await expect(first).toHaveAttribute('aria-selected', 'true');
    });

    test('isolates tab and panel ids across instances without document overflow', async ({ page }) => {
      const state = await page.getByTestId('ber11-fixture').evaluate(element => {
        const tabs = Array.from(element.querySelectorAll('[role="tab"]'));
        const panels = Array.from(element.querySelectorAll('[role="tabpanel"]'));
        const tabIds = tabs.map(tab => tab.id);
        const panelIds = panels.map(panel => panel.id);
        return {
          tabIds,
          panelIds,
          controlsMatch: tabs.every(tab => panelIds.includes(tab.getAttribute('aria-controls') ?? '')),
          labelledByMatch: panels.every(panel => tabIds.includes(panel.getAttribute('aria-labelledby') ?? '')),
          documentOverflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      expect(new Set(state.tabIds).size).toBe(state.tabIds.length);
      expect(new Set(state.panelIds).size).toBe(state.panelIds.length);
      expect(state.controlsMatch).toBe(true);
      expect(state.labelledByMatch).toBe(true);
      expect(state.documentOverflow).toBe(false);
    });

    test('re-measures after items change without widening the document', async ({ page }) => {
      const fixture = page.getByTestId('ber11-fixture');
      await fixture.getByRole('button', { name: 'Adicionar aba de teste', exact: true }).click();
      await expect(fixture.getByRole('tab', { name: 'Expanded', exact: true }).first()).toBeVisible();
      await expect.poll(async () => fixture.locator('.es-tabs-list').first().evaluate(element => element.scrollWidth)).toBeGreaterThan(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
      await fixture.getByRole('button', { name: 'Remover aba de teste', exact: true }).click();
      await expect(fixture.getByRole('tab', { name: 'Expanded', exact: true })).toHaveCount(0);
    });

    test('keeps tab lanes bounded at supported widths', async ({ page }) => {
      for (const width of [320, 360, 390, 768, 1280, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/?view=settings&theme=${theme}`);
        const tablist = page.getByRole('tablist');
        await expect(tablist).toBeVisible();
        const overflow = await tablist.evaluate(element => element.scrollWidth > element.clientWidth);
        expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
        expect(await page.getByRole('button', { name: 'Rolar abas para a direita', exact: true }).count()).toBe(overflow ? 1 : 0);
      }
    });
  });
}
