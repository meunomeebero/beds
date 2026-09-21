import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark'] as const) {
  test(`navigation motion preserves the primary state contract in ${theme}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'The primary rail geometry is covered at desktop width.');
    await page.goto(`/?view=components&theme=${theme}`);
    await expect(page.getByRole('heading', { name: 'Componentes', exact: true })).toBeVisible();

    const sidebar = page.locator('.es-sidebar');
    await expect(sidebar).toHaveCSS('width', '264px');
    const active = sidebar.locator('.es-nav-item--active').first();
    const indicator = active.locator('.es-nav-active-indicator');
    await expect(active).toHaveAttribute('aria-current', 'page');
    await expect(indicator).toBeVisible();
    const geometry = await active.evaluate(element => {
      const bounds = element.getBoundingClientRect();
      const indicator = element.querySelector<HTMLElement>('.es-nav-active-indicator')!.getBoundingClientRect();
      const icon = element.querySelector<SVGElement>('.es-nav-content > svg')!;
      const style = getComputedStyle(icon);
      return { row: bounds.height, indicator: indicator.height, fill: style.fill, stroke: style.stroke };
    });
    expect(geometry.row).toBe(40);
    expect(geometry.indicator).toBeCloseTo(31, 0);
    expect(geometry.fill).not.toBe('none');
    expect(geometry.stroke).not.toBe('none');

    const inactive = sidebar.getByRole('button', { name: 'Chat · receita', exact: true });
    const inactiveIndicator = inactive.locator('.es-nav-active-indicator');
    expect(await inactiveIndicator.evaluate(element => getComputedStyle(element).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
    const longLabel = sidebar.getByRole('link', { name: 'Resultado da otimização', exact: true });
    await expect(longLabel.locator('.es-nav-label')).toHaveCSS('text-overflow', 'ellipsis');
    await expect(longLabel.locator('.es-nav-label')).toHaveCSS('overflow', 'hidden');
    await inactive.hover();
    expect(await inactiveIndicator.evaluate(element => getComputedStyle(element).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
    const box = await inactive.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    expect(await inactiveIndicator.evaluate(element => getComputedStyle(element).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
    await page.mouse.up();

    await page.goto(`/?view=components&theme=${theme}`);
    await expect(page.getByRole('heading', { name: 'Componentes', exact: true })).toBeVisible();
    const restoredActive = sidebar.locator('.es-nav-item--active').first();
    await page.getByRole('button', { name: 'Collapse sidebar', exact: true }).click();
    await expect(sidebar).toHaveCSS('width', '62px');
    await expect(restoredActive).toHaveAttribute('aria-label', 'Componentes');
    await page.getByRole('button', { name: 'Expand sidebar', exact: true }).click();
    await expect(sidebar).toHaveCSS('width', '264px');
  });

  test(`navigation drawer and locked item preserve logical accessibility in ${theme}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'The drawer contract is covered at mobile width.');
    await page.goto(`/?view=disclosures&theme=${theme}`, { waitUntil: 'commit' });
    const firstFrame = await page.locator('.recipe-app-shell').evaluate(element => {
      const bounds = element.getBoundingClientRect();
      return { grid: getComputedStyle(element).gridTemplateColumns, documentWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth, right: bounds.right };
    });
    expect(firstFrame.grid).not.toMatch(/^264px/);
    expect(firstFrame.documentWidth).toBeLessThanOrEqual(firstFrame.viewportWidth);
    expect(firstFrame.right).toBeLessThanOrEqual(firstFrame.viewportWidth);
    await expect(page.getByRole('heading', { name: 'Informações do perfil', exact: true })).toBeVisible();
    const trigger = page.getByRole('button', { name: 'Navegação', exact: true });
    await trigger.click();
    const sidebar = page.getByRole('dialog', { name: 'Navegação', exact: true });
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toHaveCSS('width', '264px');
    await expect(page.locator('.recipe-app-main')).toHaveAttribute('inert', '');

    const locked = sidebar.getByRole('button', { name: /Fórum\. O fórum está disponível/ });
    await expect(locked).toBeDisabled();
    await expect(locked).toHaveAttribute('aria-label', /O fórum está disponível/);
    await expect(locked.locator('.es-nav-active-indicator')).toHaveCount(0);
    const active = sidebar.getByRole('link', { name: 'Perfil', exact: true });
    await expect(active).toHaveAttribute('aria-current', 'page');
    await expect(active.locator('.es-nav-active-indicator')).toBeVisible();

    await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
    const logical = await sidebar.evaluate(element => {
      const style = getComputedStyle(element);
      return { left: style.left, right: style.right, borderInlineEnd: style.borderInlineEndWidth };
    });
    expect(logical.left).toBe(`${page.viewportSize()!.width - 264}px`);
    expect(logical.right).toBe('0px');
    expect(logical.borderInlineEnd).toBe('1px');

    await page.keyboard.press('Escape');
    await expect(sidebar).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });

  test(`navigation landmarks and forced-colors focus remain explicit in ${theme}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'The desktop rail and forced-colors landmark proof run at desktop width.');
    await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
    await page.goto(`/?view=components&theme=${theme}`);
    await expect(page.getByRole('heading', { name: 'Componentes', exact: true })).toBeVisible();
    const footer = page.locator('aside footer.es-sidebar-footer');
    await expect(footer).toHaveCount(1);
    await expect(footer).toHaveJSProperty('tagName', 'FOOTER');
    await expect(footer.getByRole('button', { name: 'Sobre esta demonstração', exact: true })).toBeVisible();
    const active = page.locator('.es-nav-item--active').first();
    await active.focus();
    await expect.poll(() => active.evaluate(element => {
      const style = getComputedStyle(element);
      return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth, transitionDuration: style.transitionDuration };
    })).toEqual({ outlineStyle: 'solid', outlineWidth: '1px', transitionDuration: '0s' });
    const skip = page.getByRole('link', { name: 'Ir para o conteúdo', exact: true });
    await skip.focus();
    await expect(skip).toHaveCSS('outline-style', 'solid');
    await expect(skip).toHaveCSS('outline-width', '2px');
  });
}
