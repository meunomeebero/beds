import { expect, test } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const evidence = fileURLToPath(new URL('./evidence/', import.meta.url));

for (const theme of ['dark', 'light'] as const) {
  test(`ResponsiveGrid keeps two desktop columns and one mobile column in ${theme}`, async ({ page }, testInfo) => {
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/?view=components&theme=${theme}`);

      const grid = page.locator('.es-responsive-grid');
      const panels = grid.locator(':scope > .es-surface');
      await expect(grid).toBeVisible();
      await expect(panels).toHaveCount(2);
      await expect(grid).toHaveCSS('gap', '16px');
      await expect(grid).toHaveCSS('min-width', '0px');
      await expect(page.locator('.es-root')).toHaveAttribute('data-theme', theme);

      const geometry = await panels.evaluateAll(items => items.map(item => {
        const bounds = item.getBoundingClientRect();
        return { x: bounds.x, y: bounds.y, width: bounds.width };
      }));
      expect(geometry[0].width).toBeGreaterThan(0);
      expect(geometry[1].width).toBeGreaterThan(0);
      if (width <= 767) expect(geometry[1].y).toBeGreaterThan(geometry[0].y);
      else expect(geometry[1].x).toBeGreaterThan(geometry[0].x);

      await page.getByRole('button', { name: 'Abrir primeiro painel', exact: true }).focus();
      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name: 'Abrir segundo painel', exact: true })).toBeFocused();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.screenshot({ path: `${evidence}responsive-grid-${theme}-${width}-${testInfo.project.name}.png`, fullPage: false });
    }
  });
}
