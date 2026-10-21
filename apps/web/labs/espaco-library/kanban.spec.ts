import { expect, test } from '@playwright/test';
import { coarsePointer } from './touch-target';

test('keyboard move updates columns and counts, retains focus and opens full details', async ({ page }) => {
  await page.goto('/?view=kanban&theme=dark');
  const toSend = page.getByRole('region', { name: 'Para enviar', exact: true });
  const closed = page.getByRole('region', { name: 'Não avançou', exact: true });
  await expect(toSend.getByRole('article')).toHaveCount(2);
  const menu = page.getByRole('button', { name: 'Mover Product designer na Norte', exact: true });
  await menu.press('Enter');
  await expect(page.getByRole('menuitem', { name: 'Mover para Em preparo' })).toHaveCount(0);
  await page.getByRole('menu').press('End');
  await page.getByRole('menu').press('Enter');
  await expect(closed.getByRole('article')).toHaveCount(1);
  await expect(toSend.getByRole('article')).toHaveCount(1);
  await expect(closed.locator('.es-kanban-count')).toHaveText('1');
  await expect(menu).toBeFocused();
  await expect(page.getByRole('status').filter({ hasText: 'movida para Não avançou' })).toHaveCount(1);
  // A calm outcome: no confetti, one undo toast.
  await expect(page.locator('.es-confetti')).toHaveCount(0);
  await page.getByRole('button', { name: 'Desfazer' }).click();
  await expect(toSend.getByRole('article')).toHaveCount(2);
  await expect(closed).toContainText('Nenhuma vaga nesta etapa');
  const open = toSend.getByRole('button', { name: 'Ver detalhes', exact: true }).first();
  await open.click();
  await expect(page.getByRole('dialog')).toContainText('Mover para');
  await page.keyboard.press('Escape');
  await expect(open).toBeFocused();
});

test('a real win celebrates once; reduced motion shows no confetti', async ({ page }) => {
  await page.goto('/?view=kanban&theme=light');
  const menu = page.getByRole('button', { name: 'Mover Product designer na Norte', exact: true });
  await menu.click();
  await page.getByRole('menuitem', { name: 'Mover para Em seleção' }).click();
  await expect(page.locator('.es-confetti')).toHaveCount(1);
  await expect(page.locator('.es-confetti')).toHaveAttribute('aria-hidden', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?view=kanban&theme=light');
  await page.getByRole('button', { name: 'Mover Product designer na Norte', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Mover para Conquistada' }).click();
  await expect(page.getByRole('button', { name: 'Desfazer' })).toBeVisible();
  await expect(page.locator('.es-confetti')).toHaveCount(0);
});

test('light/dark, mobile and long titles stay inside cards; board alone may scroll', async ({ page }, info) => {
  const widths = info.project.name === 'desktop' ? [1440, 768] : [390, 320];
  for (const theme of ['light', 'dark']) for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`/?view=kanban&theme=${theme}&preview=long`);
    await expect(page.getByRole('article')).toHaveCount(5);
    await expect(page.locator('.es-kanban-header h2')).toHaveCount(6);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.locator('.recipe-application-card').evaluateAll(cards => cards.every(card => card.scrollWidth <= card.clientWidth + 1))).toBe(true);
    const contrasts = await page.locator('.recipe-application-board h3>button,.recipe-application-company,.recipe-application-details li,.recipe-application-note>span,.es-kanban-count,.es-kanban-empty,.recipe-application-details-action').evaluateAll(elements => elements.map(element => {
      const rgba = (value: string) => value.match(/[\d.]+/g)!.map(Number);
      const layers: number[][] = [];
      let node: Element | null = element;
      while (node) { layers.unshift(rgba(getComputedStyle(node).backgroundColor)); node = node.parentElement; }
      const bg = layers.reduce((base, color) => base.map((c, i) => c * (1 - (color[3] ?? 1)) + color[i] * (color[3] ?? 1)), [255, 255, 255]);
      const lum = (rgb: number[]) => rgb.slice(0, 3).map(c => c / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
      const fg = rgba(getComputedStyle(element).color);
      return { text: element.textContent, ratio: (Math.max(lum(fg), lum(bg)) + .05) / (Math.min(lum(fg), lum(bg)) + .05) };
    }));
    for (const pair of contrasts) expect(pair.ratio, JSON.stringify(pair)).toBeGreaterThanOrEqual(4.5);
    const board = page.getByRole('region', { name: 'Vagas por status', exact: true });
    await expect(board).toHaveAttribute('tabindex', '0');
    // Columns keep their width and scroll sideways on every width; they never stack.
    const columns = await page.locator('.es-kanban-column').all();
    const first = await columns[0].boundingBox();
    const second = await columns[1].boundingBox();
    expect(Math.abs(second!.y - first!.y)).toBeLessThan(1);
    expect(first!.width).toBeLessThanOrEqual(width < 768 ? 320 : 360);
    if (width < 768) {
      const target = await page.getByRole('button', { name: /^Mover/ }).first().boundingBox();
      const floor = await coarsePointer(page) ? 44 : 32;
      expect(target!.width).toBeGreaterThanOrEqual(floor);
      expect(target!.height).toBeGreaterThanOrEqual(floor);
    }
    await page.screenshot({ path: `apps/web/labs/espaco-library/evidence/kanban/${info.project.name}-${theme}-${width}.png`, fullPage: true });
  }
});

test('read-only, unavailable score, empty and rejected moves do not invent outcomes', async ({ page }) => {
  await page.goto('/?view=kanban&preview=readonly');
  await expect(page.getByRole('button', { name: /^Mover/ })).toHaveCount(0);
  await expect(page.getByRole('article', { name: 'Design operations' }).getByRole('meter')).toHaveCount(0);
  await expect(page.getByRole('article', { name: 'Senior UX designer' }).getByRole('meter')).toHaveCount(0);
  await page.goto('/?view=kanban&preview=empty');
  await expect(page.getByRole('article')).toHaveCount(0);
  await expect(page.locator('.es-kanban-empty')).toHaveCount(6);
  await expect(page.locator('.es-kanban-count')).toHaveText(['0', '0', '0', '0', '0', '0']);
  await page.goto('/?view=kanban&preview=move-error');
  const menu = page.getByRole('button', { name: 'Mover Product designer na Norte', exact: true });
  await menu.click();
  await page.getByRole('menuitem', { name: 'Mover para Enviada' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Não foi possível mover' }).first()).toBeAttached();
  await expect(page.getByRole('region', { name: 'Para enviar', exact: true }).getByRole('article')).toHaveCount(2);
  await expect(page.locator('.es-confetti')).toHaveCount(0);
  await expect(menu).toBeFocused();
});

test('zoom, RTL and reduced motion preserve the same reading and control structure', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 640, height: 1000 });
  await page.goto('/?view=kanban&theme=light&preview=long');
  await page.evaluate(() => { document.documentElement.style.zoom = '2'; document.documentElement.dir = 'rtl'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole('article')).toHaveCount(5);
  await expect(page.locator('.recipe-application-sheet').first()).toHaveCSS('transition-duration', '0s');
  expect(await page.locator('.recipe-application-card').evaluateAll(cards => cards.every(card => card.scrollWidth <= card.clientWidth + 1))).toBe(true);
  await page.screenshot({ path: `apps/web/labs/espaco-library/evidence/kanban/${info.project.name}-zoom-rtl.png`, fullPage: true });
  await page.emulateMedia({ forcedColors: 'active' });
  const menu = page.getByRole('button', { name: /^Mover/ }).first();
  await menu.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(menu).toBeFocused();
  expect(await menu.evaluate(el => parseFloat(getComputedStyle(el).outlineWidth))).toBeGreaterThan(0);
});
