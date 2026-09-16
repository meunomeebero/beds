import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const evidence = fileURLToPath(new URL('./evidence/search-dialog/', import.meta.url));
const launch = async (page: Page) => {
  await page.getByRole('button', { name: 'Buscar currículos ou vagas', exact: true }).click();
  await expect(page.getByRole('combobox')).toBeFocused();
};
const scenario = async (page: Page, label: string) => {
  await page.getByRole('button', { name: 'Estado da demonstração' }).click();
  await page.getByRole('option', { name: label, exact: true }).click();
};

test('search entry, category, accent-insensitive query, open and keyboard return', async ({ page }) => {
  await page.goto('/?view=search');
  await launch(page);
  const input = page.getByRole('combobox');
  await expect(page.getByRole('option')).toHaveCount(7);
  await page.getByRole('button', { name: 'Vagas', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Vagas', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('option')).toHaveCount(4);
  await input.fill('senior atelie');
  await expect(page.getByRole('option')).toHaveCount(1);
  await input.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Product designer sênior', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Buscar currículos ou vagas' })).toBeFocused();
  await launch(page);
  await expect(input).toHaveValue('senior atelie');
  await input.fill('nenhumabc');
  await expect(page.getByText('Nenhum resultado encontrado')).toBeVisible();
  await page.getByRole('button', { name: 'Limpar busca' }).click();
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('');
  await expect(page.getByRole('option')).toHaveCount(7);
  // Text editing Home/End and composition must never open a result.
  await input.fill('designer');
  // macOS Home scrolls rather than moving the caret; keep platform defaults.
  expect(await input.evaluate(el => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true })))).toBe(true);
  await input.press('ArrowLeft');
  expect(await input.evaluate((el: HTMLInputElement) => el.selectionStart)).toBe(7);
  await input.dispatchEvent('keydown', { key: 'Enter', isComposing: true });
  await expect(page.locator('.es-search-dialog')).toBeVisible();
  await input.fill('');
  await input.press('ArrowUp');
  await expect(page.getByRole('option', { name: /Senior UX designer/ })).toHaveAttribute('aria-selected', 'true');
  await input.press('ArrowUp');
  await expect(page.getByRole('option', { name: /Designer de produto Norte/ })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Fechar busca' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Vagas', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Buscar currículos ou vagas' })).toBeFocused();
  await page.keyboard.press('Control+k');
  await expect(input).toBeFocused();
  await page.getByRole('option', { name: /UX researcher/ }).click({ force: true });
  await expect(page.locator('.es-search-dialog')).toBeVisible();
  await page.getByRole('option', { name: /Product designer sênior/ }).click();
  await expect(page.getByRole('dialog', { name: 'Product designer sênior', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await launch(page);
  await page.mouse.click(1, 1);
  await expect(page.locator('.es-search-dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Buscar currículos ou vagas' })).toBeFocused();
});

test('busy/error suppress stale items and recover; manual mode preserves caller results', async ({ page }) => {
  await page.goto('/?view=search');
  await scenario(page, 'Carregando');
  await launch(page);
  await expect(page.getByRole('option')).toHaveCount(0);
  await expect(page.getByRole('listbox')).toHaveAttribute('aria-busy', 'true');
  await page.getByRole('combobox').fill('lead');
  await page.getByRole('combobox').press('Enter');
  await expect(page.locator('.es-search-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await scenario(page, 'Erro recuperável');
  await launch(page);
  await expect(page.getByRole('status')).toContainText('Não foi possível buscar');
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('combobox')).toBeFocused();
  await expect(page.getByRole('combobox')).toHaveValue('lead');
  await expect(page.getByRole('option')).toHaveCount(2);
  await page.keyboard.press('Escape');
  await scenario(page, 'Resultados externos simulados');
  await launch(page);
  await page.getByRole('combobox').fill('termo não presente');
  await expect(page.getByRole('option')).toHaveCount(7);
  await page.keyboard.press('Escape');
  await scenario(page, 'Sem dados');
  await launch(page);
  await expect(page.getByText('Tente outro termo ou remova os filtros.')).toBeVisible();
});

test('light/dark, narrow, long text, RTL and zoom stay contained with visible focus', async ({ page }, info) => {
  await mkdir(evidence, { recursive: true });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const theme of ['light', 'dark']) {
    for (const width of [320, 390, 938, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/?view=search&theme=${theme}`);
      await launch(page);
      const dialog = page.locator('.es-search-dialog');
      await expect(dialog).toBeVisible();
      await expect(page.getByRole('combobox')).toHaveCSS('font-size', '16px');
      await expect(page.getByRole('combobox')).toHaveCSS('outline-width', '2px');
      const geometry = await dialog.evaluate(el => {
        const rect = el.getBoundingClientRect();
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, overflow: el.scrollWidth - el.clientWidth };
      });
      expect(geometry.left).toBeGreaterThanOrEqual(15);
      expect(geometry.right).toBeLessThanOrEqual(width - 15);
      expect(geometry.top).toBeGreaterThanOrEqual(15);
      expect(geometry.bottom).toBeLessThanOrEqual(885);
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      if (width <= 390) {
        const heights = await page.locator('.es-search-categories button,.es-search-dialog-header button').evaluateAll(els => els.map(el => el.getBoundingClientRect().height));
        expect(heights.every(height => height >= 44)).toBe(true);
      }
      if (width === 390 || width === 938) await page.screenshot({ path: `${evidence}/${info.project.name}-${theme}-${width}.png` });
      await page.keyboard.press('Escape');
      await scenario(page, 'Texto longo');
      await launch(page);
      expect(await dialog.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
      expect(await page.locator('.es-search-result-copy').first().evaluate(el => el.scrollHeight - el.clientHeight)).toBeLessThanOrEqual(1);
      await page.keyboard.press('Escape');
    }
  }
  await page.setViewportSize({ width: 640, height: 900 });
  await page.evaluate(() => { document.documentElement.style.zoom = '2'; document.documentElement.dir = 'rtl'; });
  await launch(page);
  expect(await page.locator('.es-search-dialog').evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
  const zoomBounds = await page.locator('.es-search-dialog').boundingBox();
  expect(zoomBounds!.x).toBeGreaterThanOrEqual(0);
  expect(zoomBounds!.y).toBeGreaterThanOrEqual(0);
  expect(zoomBounds!.x + zoomBounds!.width).toBeLessThanOrEqual(640);
  expect(zoomBounds!.y + zoomBounds!.height).toBeLessThanOrEqual(900);
  await page.screenshot({ path: `${evidence}/${info.project.name}-zoom-rtl.png` });
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await expect(page.locator('.es-search-result[data-active=true]')).toHaveCSS('outline-style', 'solid');
  expect(errors).toEqual([]);
});
