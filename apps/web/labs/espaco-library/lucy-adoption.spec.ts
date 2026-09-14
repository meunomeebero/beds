import { expect, test } from '@playwright/test';

// User-selected Lucy preview, measured at5282 on2026-09-12.
// This contract replaces the original Marketer sidebar/dark defaults.
for (const theme of ['light', 'dark'] as const) {
  test(`Lucy sidebar hierarchy and current ${theme} semantic colors stay fixed`, async ({ page }, info) => {
    await page.goto(`/?view=chat&theme=${theme}&brand=curriculol`);
    await expect(page.getByRole('heading', { name: 'How can I help you today?' })).toBeVisible();
    if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Navigation', exact: true }).click();
    const sidebar = page.locator('.es-sidebar');
    await expect(sidebar).toHaveCSS('width', '264px');
    await expect(sidebar).toHaveCSS('padding', '9px 12px 0px');
    await expect(sidebar).toHaveCSS('background-color', theme === 'dark' ? 'rgb(25, 25, 25)' : 'rgb(251, 250, 249)');
    await expect(page.locator('.es-app-shell')).toHaveCSS('background-color', theme === 'dark' ? 'rgb(25, 25, 25)' : 'rgb(255, 255, 255)');

    const profile = page.getByRole('button', { name: 'Workspace workspace menu', exact: true });
    await expect(profile).toHaveCSS('height', '40px');
    await expect(profile).toHaveCSS('font-size', '14px');
    await expect(profile).toHaveCSS('font-weight', '400');
    await expect(profile.locator('.es-avatar')).toHaveCSS('width', '17px');
    await expect(profile.locator('.es-brand-mark')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Buscar no catálogo', exact: true })).toHaveCSS('width', '32px');

    const primary = page.locator('.es-sidebar-section--primary');
    const chat = primary.getByRole('button', { name: 'Chat', exact: true });
    const components = primary.getByRole('button', { name: 'Componentes', exact: true });
    await expect(chat).toHaveAttribute('aria-current', 'page');
    await expect(chat).toHaveCSS('height', '40px');
    const bounds = await chat.boundingBox();
    const sibling = await components.boundingBox();
    expect(sibling!.y).toBe(bounds!.y);
    expect(sibling!.x - bounds!.x - bounds!.width).toBeCloseTo(4, 1);
    const pill = await chat.evaluate(element => {
      const css = getComputedStyle(element, '::before');
      return { height: css.height, radius: css.borderRadius, background: css.backgroundColor };
    });
    expect(pill).toEqual({ height: '31px', radius: '30px', background: theme === 'dark' ? 'rgb(42, 42, 42)' : 'rgb(237, 236, 233)' });

    const selectedFill = theme === 'dark' ? 'rgb(206, 206, 206)' : 'rgb(55, 53, 46)';
    const selectedStroke = theme === 'dark' ? 'rgb(25, 25, 25)' : 'rgb(251, 250, 249)';
    await expect(chat.locator('svg')).toHaveCSS('fill', selectedFill);
    await expect(chat.locator('svg')).toHaveCSS('stroke', selectedStroke);
    await expect(components.locator('svg')).toHaveCSS('fill', 'none');
    await components.click();
    if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Navigation', exact: true }).click();
    await expect(components).toHaveAttribute('aria-current', 'page');
    await expect(components.locator('svg')).toHaveCSS('fill', selectedFill);
    await expect(chat.locator('svg')).toHaveCSS('fill', 'none');
    await chat.click();
    if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Navigation', exact: true }).click();
    await expect(chat.locator('svg')).toHaveCSS('fill', selectedFill);
    await expect(components.locator('svg')).toHaveCSS('fill', 'none');

    const item = sidebar.getByRole('button', { name: 'Tokens', exact: true });
    await expect(item.locator('svg')).toHaveCSS('fill', 'none');
    await expect(item).toHaveCSS('height', '31px');
    await expect(item).toHaveCSS('font-size', '14px');
    await expect(item).toHaveCSS('font-weight', '400');
    await expect(item).toHaveCSS('gap', '11px');
    await expect(item.locator('svg')).toHaveCSS('width', '16px');
    await expect(item).toHaveCSS('color', theme === 'dark' ? 'rgb(148, 148, 148)' : 'rgb(106, 105, 102)');
    await expect(sidebar.locator('.es-sidebar-section--default')).toHaveCSS('margin-top', '17px');

    // Source hover is translucent and distinct from the selected pill.
    if (info.project.name === 'desktop') {
      await item.hover();
      await expect(item).toHaveCSS('background-color', theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgb(230, 228, 224)');
    }
    await item.click();
    await expect(page.getByRole('heading', { name: 'Tokens', exact: true })).toBeVisible();
    if (info.project.name === 'mobile') await expect(sidebar).not.toBeVisible();
  });
}
