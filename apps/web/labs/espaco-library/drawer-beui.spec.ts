import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const evidence = fileURLToPath(new URL('./evidence/drawer-beui/', import.meta.url));

test('beUI Drawer adaptation preserves modal motion, focus and scroll lock', async ({ page }, info) => {
  await page.goto('/?view=drawer&theme=dark');
  const trigger = page.getByRole('button', { name: 'Ver detalhes', exact: true });
  await expect(page.locator('.es-drawer')).not.toBeVisible();
  await trigger.click();
  const drawer = page.locator('.es-drawer');
  await expect(drawer).toBeVisible();
  await expect(drawer).toHaveAccessibleName('Product designer sênior');
  await expect(page.getByRole('button', { name: 'Fechar detalhes' })).toBeFocused();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await expect.poll(() => drawer.evaluate(element => ['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(getComputedStyle(element).transform))).toBe(true);
  await mkdir(evidence, { recursive: true });
  await page.screenshot({ path: `${evidence}/${info.project.name}-dark.png` });

  await page.keyboard.press('Escape');
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  expect(await drawer.evaluate(element => element.matches(':modal'))).toBe(true);
  await trigger.evaluate(element => (element as HTMLElement).click());
  await expect(page.getByRole('button', { name: 'Fechar detalhes' })).toBeFocused();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await page.keyboard.press('Escape');
  await expect(drawer).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
});

test('beUI Drawer adaptation keeps reduced motion and inline-end RTL geometry', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?view=drawer&theme=light');
  await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
  const trigger = page.getByRole('button', { name: 'Ver detalhes', exact: true });
  await trigger.click();
  const drawer = page.locator('.es-drawer');
  await expect(drawer).toBeVisible();
  await expect(drawer).toHaveCSS('transform', 'none');
  const bounds = await drawer.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBe(0);
  expect(bounds!.width).toBe(page.viewportSize()!.width < 768 ? page.viewportSize()!.width : 672);
  await expect(page.getByRole('button', { name: 'Fechar detalhes' })).toBeInViewport();
  await page.keyboard.press('Escape');
  await expect(drawer).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
