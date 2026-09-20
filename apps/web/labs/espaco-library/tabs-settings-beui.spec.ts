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
    const edgeLeft = page.getByRole('button', { name: 'Rolar abas para a esquerda', exact: true });
    const edgeRight = page.getByRole('button', { name: 'Rolar abas para a direita', exact: true });
    const expectTabClearOfEnabledEdge = async (target: typeof tab) => {
      const targetBox = await target.boundingBox();
      for (const edge of [edgeLeft, edgeRight]) {
        if (await edge.count() === 0 || await edge.isDisabled()) continue;
        const edgeBox = await edge.boundingBox();
        expect(targetBox!.x + targetBox!.width <= edgeBox!.x || edgeBox!.x + edgeBox!.width <= targetBox!.x).toBe(true);
      }
    };
    if (width === 320) {
      await expect(edgeLeft).toBeVisible();
      await expect(edgeRight).toBeVisible();
      await expect(edgeLeft).toBeDisabled();
      await expect(edgeRight).toBeEnabled();
      const leftBox = await edgeLeft.boundingBox();
      const rightBox = await edgeRight.boundingBox();
      expect(leftBox!.x).toBeLessThan(rightBox!.x);
      await expect(page.locator('.es-tabs-edge-fade[data-edge="left"]')).toHaveCount(0);
      await expect(page.locator('.es-tabs-edge-fade[data-edge="right"]')).toHaveCount(1);
    } else {
      await expect(edgeLeft).toHaveCount(0);
      await expect(edgeRight).toHaveCount(0);
    }
    await tab.focus();
    await expectTabClearOfEnabledEdge(tab);
    await tab.press('ArrowRight');
    const middleTab = page.getByRole('tab', { name: 'Preferências', exact: true });
    await expect(middleTab).toBeFocused();
    await expectTabClearOfEnabledEdge(middleTab);
    await page.getByRole('tab', { name: 'Conta', exact: true }).focus();
    await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
    await page.getByRole('tab', { name: 'Conta', exact: true }).press('ArrowLeft');
    await expect(page.getByRole('tab', { name: 'Preferências', exact: true })).toBeFocused();
    if (width === 320) {
      const before = await tablist.evaluate(element => element.scrollLeft);
      await page.getByRole('tab', { name: 'Preferências', exact: true }).press('End');
      const endTab = page.getByRole('tab', { name: 'Privacidade', exact: true });
      await expect(endTab).toBeFocused();
      const rtlLeftBox = await edgeLeft.boundingBox();
      const rtlRightBox = await edgeRight.boundingBox();
      expect(rtlLeftBox!.x).toBeLessThan(rtlRightBox!.x);
      await expectTabClearOfEnabledEdge(endTab);
      const leftFade = page.locator('.es-tabs-edge-fade[data-edge="left"]');
      const rightFade = page.locator('.es-tabs-edge-fade[data-edge="right"]');
      expect(await leftFade.count() + await rightFade.count()).toBe(1);
      const activeEdgeKind = await edgeLeft.isEnabled() ? 'left' : 'right';
      const activeEdge = activeEdgeKind === 'left' ? edgeLeft : edgeRight;
      const beforeTabBox = await endTab.boundingBox();
      await activeEdge.click();
      await expect.poll(async () => endTab.boundingBox()).not.toEqual(beforeTabBox);
      const afterTabBox = await endTab.boundingBox();
      if (activeEdgeKind === 'left') expect(afterTabBox!.x).toBeGreaterThan(beforeTabBox!.x);
      else expect(afterTabBox!.x).toBeLessThan(beforeTabBox!.x);
      await expect(activeEdge).toBeDisabled();
      await expect(page.locator(`.es-tabs-edge-fade[data-edge="${activeEdgeKind}"]`)).toHaveCount(0);
      const after = await tablist.evaluate(element => element.scrollLeft);
      await page.waitForTimeout(60);
      await expect.poll(async () => tablist.evaluate(element => element.scrollLeft)).toBe(after);
      expect(after).not.toBe(before);
    }
  });

  test(`settings tabs preserve reduced-motion and forced-colors affordances in ${theme}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/?view=settings&theme=${theme}`);
    const tab = page.getByRole('tab', { name: 'Conta', exact: true });
    const indicator = tab.locator('[data-tabs-indicator]');
    await expect(indicator).toBeVisible();
    expect(await indicator.evaluate(element => ({ animations: element.getAnimations().length, transform: getComputedStyle(element).transform }))).toEqual({ animations: 0, transform: 'none' });
    await page.getByRole('tab', { name: 'Preferências', exact: true }).click();
    const nextIndicator = page.getByRole('tab', { name: 'Preferências', exact: true }).locator('[data-tabs-indicator]');
    await expect(nextIndicator).toBeVisible();
    expect(await nextIndicator.evaluate(element => ({ animations: element.getAnimations().length, transform: getComputedStyle(element).transform }))).toEqual({ animations: 0, transform: 'none' });
    await page.emulateMedia({ forcedColors: 'active' });
    expect(await nextIndicator.evaluate(element => getComputedStyle(element).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
  });

  test(`settings tabs stay bounded under the 200% zoom proxy in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 1000 });
    await page.goto(`/?view=settings&theme=${theme}`);
    await page.evaluate(() => { document.documentElement.style.zoom = '2'; document.documentElement.dir = 'rtl'; });
    await expect(page.getByRole('tablist')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await page.getByRole('tab', { name: 'Conta', exact: true }).focus();
    await page.getByRole('tab', { name: 'Conta', exact: true }).press('ArrowLeft');
    await expect(page.getByRole('tab', { name: 'Preferências', exact: true })).toBeFocused();
  });
}
