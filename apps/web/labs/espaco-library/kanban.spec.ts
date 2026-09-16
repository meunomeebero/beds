import { expect, test } from '@playwright/test';

test('keyboard move updates columns and counts, retains focus and opens full details', async ({ page }) => {
  await page.goto('/?view=kanban&theme=dark');
  const saved = page.getByRole('region', { name: 'Salvas', exact: true });
  const sent = page.getByRole('region', { name: 'Enviadas', exact: true });
  await expect(saved.getByRole('article')).toHaveCount(2);
  const menu = page.getByRole('button', { name: 'Mover Product designer na Norte', exact: true });
  await menu.press('Enter');
  await expect(page.getByRole('menuitem', { name: 'Mover para Em preparação' })).toHaveCount(0);
  await page.getByRole('menu').press('End');
  await page.getByRole('menu').press('Enter');
  await expect(sent.getByRole('article')).toHaveCount(1);
  await expect(saved.getByRole('article')).toHaveCount(1);
  await expect(sent.locator('.es-application-board-count')).toHaveText('1 vaga');
  await expect(menu).toBeFocused();
  await expect(page.getByRole('status').last()).toContainText('movida para Enviadas');
  const open = sent.getByRole('button', { name: 'Ver detalhes', exact: true });
  await open.click();
  await expect(page.getByRole('dialog')).toContainText('R$ 10 mil – R$ 14 mil');
  await page.keyboard.press('Escape');
  await expect(open).toBeFocused();
  await menu.click();
  await page.getByRole('menuitem', { name: 'Mover para Salvas' }).click();
  await expect(saved.getByRole('article')).toHaveCount(2);
  await expect(sent.getByRole('article')).toHaveCount(0);
  await expect(menu).toBeFocused();
  await expect(sent).toContainText('As vagas que você marcar como enviadas');
});

test('light/dark, mobile and long titles stay inside cards; board alone may scroll', async ({ page }, info) => {
  const widths = info.project.name === 'desktop' ? [1440, 768] : [390, 320];
  for (const theme of ['light', 'dark']) for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`/?view=kanban&theme=${theme}&preview=long`);
    await expect(page.getByRole('article')).toHaveCount(5);
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(width >= 768 ? 5 : 4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.locator('.es-application-card').evaluateAll(cards => cards.every(card => card.scrollWidth <= card.clientWidth + 1))).toBe(true);
    const contrasts = await page.locator('.es-application-board h3>button,.es-application-company,.es-application-details li,.es-application-note>span,.es-application-board-count,.es-application-board-empty,.es-application-details-action').evaluateAll(elements => elements.map(element => {
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
    const overflowing = await board.evaluate(el => el.scrollWidth > el.clientWidth + 1);
    if (overflowing) await expect(board).toHaveAttribute('tabindex', '0');
    else await expect(board).not.toHaveAttribute('tabindex');
    if (width < 768) {
      const columns = await page.locator('.es-application-board-column').all();
      const first = await columns[0].boundingBox();
      const second = await columns[1].boundingBox();
      expect(second!.y).toBeGreaterThan(first!.y + first!.height);
      const target = await page.getByRole('button', { name: /^Mover/ }).first().boundingBox();
      expect(target!.width).toBeGreaterThanOrEqual(44);
      expect(target!.height).toBeGreaterThanOrEqual(44);
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
  await expect(page.locator('.es-application-board-empty')).toHaveCount(4);
  await expect(page.locator('.es-application-board-count')).toHaveText(['0 vagas', '0 vagas', '0 vagas', '0 vagas']);
  await page.goto('/?view=kanban&preview=move-error');
  const menu = page.getByRole('button', { name: 'Mover Product designer na Norte', exact: true });
  await menu.click();
  await page.getByRole('menuitem', { name: 'Mover para Enviadas' }).click();
  await expect(page.getByRole('status').last()).toContainText('Não foi possível mover');
  await expect(page.getByRole('region', { name: 'Salvas', exact: true }).getByRole('article')).toHaveCount(2);
  await expect(menu).toBeFocused();
});

test('zoom, RTL and reduced motion preserve the same reading and control structure', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 640, height: 1000 });
  await page.goto('/?view=kanban&theme=light&preview=long');
  await page.evaluate(() => { document.documentElement.style.zoom = '2'; document.documentElement.dir = 'rtl'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole('article')).toHaveCount(5);
  await expect(page.locator('.es-application-sheet').first()).toHaveCSS('transition-duration', '0s');
  expect(await page.locator('.es-application-card').evaluateAll(cards => cards.every(card => card.scrollWidth <= card.clientWidth + 1))).toBe(true);
  await page.screenshot({ path: `apps/web/labs/espaco-library/evidence/kanban/${info.project.name}-zoom-rtl.png`, fullPage: true });
  await page.emulateMedia({ forcedColors: 'active' });
  const menu = page.getByRole('button', { name: /^Mover/ }).first();
  await menu.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(menu).toBeFocused();
  expect(await menu.evaluate(el => parseFloat(getComputedStyle(el).outlineWidth))).toBeGreaterThan(0);
});
