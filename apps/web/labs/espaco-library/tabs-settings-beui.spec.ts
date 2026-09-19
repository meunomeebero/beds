import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark'] as const) {
  test(`settings tabs keep the measured lane and indicator in ${theme}`, async ({ page }, testInfo) => {
    const width = testInfo.project.name === 'desktop' ? 1440 : 320;
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`/?view=settings&theme=${theme}`);
    await expect(page.getByRole('tablist')).toBeVisible();
    const tablist = page.getByRole('tablist');
    const tab = page.getByRole('tab', { name: 'Conta', exact: true });
    const panel = page.getByRole('tabpanel', { name: 'Conta' });
    const geometry = await tablist.evaluate(element => {
      const style = getComputedStyle(element);
      return { gap: style.gap, paddingInlineStart: style.paddingInlineStart, paddingInlineEnd: style.paddingInlineEnd, overflowX: style.overflowX };
    });
    expect(geometry.gap).toBe('4px');
    expect(geometry.paddingInlineStart).toBe('4px');
    expect(geometry.paddingInlineEnd).toBe('4px');
    expect(geometry.overflowX).toBe('auto');
    expect((await tab.boundingBox())!.height).toBe(48);
    expect(await tab.locator('[data-tabs-indicator]').evaluate(element => getComputedStyle(element).height)).toBe('2px');
    expect(await panel.evaluate(element => getComputedStyle(element).marginTop)).toBe('24px');
    expect(await tablist.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(width === 320);
    await tab.focus();
    await tab.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Preferências', exact: true })).toBeFocused();
    await page.getByRole('tab', { name: 'Conta', exact: true }).focus();
    await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
    await page.getByRole('tab', { name: 'Conta', exact: true }).press('ArrowLeft');
    await expect(page.getByRole('tab', { name: 'Preferências', exact: true })).toBeFocused();
  });

  test(`settings tabs preserve reduced-motion and forced-colors affordances in ${theme}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/?view=settings&theme=${theme}`);
    const tab = page.getByRole('tab', { name: 'Conta', exact: true });
    const indicator = tab.locator('[data-tabs-indicator]');
    await expect(indicator).toBeVisible();
    expect(await indicator.evaluate(element => getComputedStyle(element).transitionDuration)).toBe('0s');
    await page.emulateMedia({ forcedColors: 'active' });
    expect(await indicator.evaluate(element => getComputedStyle(element).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
  });
}
