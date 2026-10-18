import { expect, test } from '@playwright/test';
import { coarsePointer } from './touch-target';

// Historical AI chat geometry is retained where applicable. Catalog recipes now
// live in their own navigation group, not alongside public component shortcuts.
for (const theme of ['light', 'dark'] as const) {
  test(`AI chat sidebar hierarchy and current ${theme} semantic colors stay fixed`, async ({ page }, info) => {
    await page.goto(`/?view=chat&theme=${theme}&brand=orange`);
    await expect(page.getByRole('heading', { name: 'How can I help you today?' })).toBeVisible();
    if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Navigation', exact: true }).click();
    const sidebar = page.locator('.es-sidebar');
    await expect(sidebar).toHaveCSS('width', '264px');
    await expect(sidebar).toHaveCSS('padding', '9px 12px 0px');
    await expect(sidebar).toHaveCSS('background-color', theme === 'dark' ? 'rgb(25, 25, 25)' : 'rgb(251, 250, 249)');
    await expect(page.locator('.recipe-app-shell')).toHaveCSS('background-color', theme === 'dark' ? 'rgb(25, 25, 25)' : 'rgb(255, 255, 255)');

    const profile = page.getByRole('button', { name: 'Workspace workspace menu', exact: true });
    await expect(profile).toHaveCSS('height', '40px');
    await expect(profile).toHaveCSS('font-size', '14px');
    await expect(profile).toHaveCSS('font-weight', '400');
    await expect(profile.locator('.es-avatar')).toHaveCSS('width', '17px');
    await expect(profile.locator('.es-brand-mark')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Buscar no catálogo', exact: true })).toHaveCSS('width', '32px');

    const primary = page.locator('.es-sidebar-section--primary');
    const chat = sidebar.getByRole('button', { name: 'Chat · receita', exact: true });
    const components = primary.getByRole('button', { name: 'Componentes', exact: true });
    await expect(chat).toHaveAttribute('aria-current', 'page');
    await expect(primary.getByRole('button', { name: 'Chat · receita', exact: true })).toHaveCount(0);
    await expect(sidebar.getByRole('heading', { name: 'Exemplos de app', exact: true })).toBeVisible();

    // The selected row takes the heading colour; a selected primary row also fills its glyph (knocked out in the sidebar colour).
    const selected = theme === 'dark' ? 'rgb(212, 212, 212)' : 'rgb(55, 53, 46)';
    const quiet = theme === 'dark' ? 'rgb(148, 148, 148)' : 'rgb(106, 105, 102)';
    const sidebarColor = theme === 'dark' ? 'rgb(25, 25, 25)' : 'rgb(251, 250, 249)';
    await expect(chat.locator('svg')).toHaveCSS('fill', 'none');
    await expect(chat.locator('svg')).toHaveCSS('stroke', selected);
    await expect(components.locator('svg')).toHaveCSS('fill', 'none');
    await expect(components.locator('svg')).toHaveCSS('stroke', quiet);
    await components.click();
    if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Navigation', exact: true }).click();
    await expect(components).toHaveAttribute('aria-current', 'page');
    await expect(components.locator('svg')).toHaveCSS('fill', selected);
    await expect(components.locator('svg')).toHaveCSS('stroke', sidebarColor);
    await expect(chat.locator('svg')).toHaveCSS('stroke', quiet);
    await chat.click();
    if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Navigation', exact: true }).click();
    await expect(chat.locator('svg')).toHaveCSS('stroke', selected);
    await expect(components.locator('svg')).toHaveCSS('fill', 'none');
    await expect(components.locator('svg')).toHaveCSS('stroke', quiet);

    const item = sidebar.getByRole('button', { name: 'Tokens', exact: true });
    await expect(item.locator('svg')).toHaveCSS('fill', 'none');
    await expect(item).toHaveCSS('height', await coarsePointer(page) ? '44px' : '36px');
    await expect(item).toHaveCSS('font-size', '14px');
    await expect(item).toHaveCSS('font-weight', '500');
    await expect(item).toHaveCSS('gap', '10px');
    await expect(item.locator('svg')).toHaveCSS('width', '16px');
    await expect(item).toHaveCSS('color', theme === 'dark' ? 'rgb(148, 148, 148)' : 'rgb(106, 105, 102)');
    await expect(sidebar.locator('.es-sidebar-section--default').first()).toHaveCSS('margin-top', '17px');

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
