import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const evidence = fileURLToPath(new URL('./evidence/drawer/', import.meta.url));
const launch = async (page: Page) => {
  await page.getByRole('button', { name: 'Ver detalhes', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Fechar detalhes' })).toBeFocused();
  await expect.poll(() => page.locator('.es-drawer').evaluate(element => {
    const transform = getComputedStyle(element).transform;
    return transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)';
  })).toBe(true);
};
const scenario = async (page: Page, label: string) => {
  await page.getByRole('button', { name: 'Estado da demonstração' }).click();
  await page.getByRole('option', { name: label, exact: true }).click();
};

test('drawer entry, local save, keyboard containment, nested dialog and focus return', async ({ page }) => {
  await page.goto('/?view=drawer');
  await launch(page);
  const drawer = page.locator('.es-drawer');
  expect(await drawer.evaluate(el => el.matches(':modal'))).toBe(true);
  await expect(drawer).toHaveAccessibleName('Product designer sênior');
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Salvar vaga', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Fechar detalhes' })).toBeFocused();
  await page.getByRole('button', { name: 'Ver origem' }).click();
  const nested = page.getByRole('dialog', { name: 'Origem da oportunidade' });
  await expect(nested).toBeVisible();
  await expect(nested.locator(':scope > .es-dialog-surface')).toHaveAttribute('data-phase', 'settled');
  await page.keyboard.press('Tab');
  await expect(nested.getByRole('button', { name: 'Fechar', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(nested).not.toBeVisible();
  await expect(drawer).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ver origem' })).toBeFocused();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await page.getByRole('button', { name: 'Salvar vaga', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Vaga salva nesta demonstração.');
  await page.keyboard.press('Escape');
  await expect(drawer).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Ver detalhes', exact: true })).toBeFocused();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await launch(page);
  await page.getByRole('button', { name: 'Remover das salvas' }).click();
  await expect(page.getByRole('status')).toContainText('removida');
  await page.getByRole('button', { name: 'Fechar detalhes' }).click();
  await expect(page.getByRole('button', { name: 'Ver detalhes', exact: true })).toBeFocused();
});

test('drawer states, recovery, long-content scrolling and outside dismissal', async ({ page }, info) => {
  await page.goto('/?view=drawer');
  await scenario(page, 'Carregando'); await launch(page);
  await expect(page.getByRole('status')).toHaveText('Carregando detalhes da vaga…');
  await expect(page.getByRole('button', { name: 'Salvar vaga' })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await scenario(page, 'Erro recuperável'); await launch(page);
  await expect(page.getByRole('alert')).toContainText('Tente novamente');
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('heading', { name: 'Sobre a oportunidade' })).toBeVisible();
  // Recovery cannot leave focus on the now-inert background.
  expect(await page.locator('.es-drawer').evaluate(el => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await scenario(page, 'Vaga indisponível'); await launch(page);
  await expect(page.getByRole('heading', { name: 'Esta vaga não está disponível' })).toBeVisible();
  await page.getByRole('button', { name: 'Voltar às vagas' }).click();
  await expect(page.getByRole('button', { name: 'Ver detalhes', exact: true })).toBeFocused();
  await scenario(page, 'Texto longo'); await launch(page);
  const region = page.getByRole('region', { name: 'Conteúdo dos detalhes' });
  await expect(region).toHaveAttribute('tabindex', '0');
  const before = await page.evaluate(() => window.scrollY);
  await region.focus(); await page.keyboard.press('End');
  await expect.poll(() => region.evaluate(el => el.scrollTop)).toBeGreaterThan(200);
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
  await expect(page.getByRole('button', { name: 'Fechar detalhes' })).toBeInViewport();
  await expect(page.getByRole('button', { name: 'Salvar vaga', exact: true })).toBeInViewport();
  await page.keyboard.press('Escape'); await launch(page);
  expect(await region.evaluate(el => el.scrollTop)).toBe(0);
  if (info.project.name === 'desktop') {
    // A drag starting inside must not be mistaken for a backdrop click.
    await page.locator('.es-drawer-heading').hover(); await page.mouse.down();
    await page.mouse.move(5, 150); await page.mouse.up();
    await expect(page.locator('.es-drawer')).toBeVisible();
    await page.mouse.click(5, 150);
    await expect(page.locator('.es-drawer')).not.toBeVisible();
  }
});

test('drawer light/dark, 320px, long labels, RTL, zoom and reduced motion', async ({ page }, info) => {
  await mkdir(evidence, { recursive: true });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const theme of ['light', 'dark']) {
    for (const width of [320, 390, 938, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/?view=drawer&theme=${theme}`); await launch(page);
      await page.evaluate(() => document.fonts.ready);
      const bounds = await page.locator('.es-drawer').boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
      expect(bounds!.height).toBe(900);
      expect(bounds!.width).toBe(width < 768 ? width : 672);
      const overflow = await page.locator('.es-drawer-body').evaluate(el => el.scrollWidth - el.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      const close = page.getByRole('button', { name: 'Fechar detalhes' });
      await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
      await expect(close).toBeFocused();
      await expect(close).toHaveCSS('outline-style', 'solid');
      await expect(close).toHaveCSS('outline-width', '2px');
      if (width < 768) {
        for (const name of ['Fechar detalhes', 'Ver origem', 'Salvar vaga']) {
          const target = await page.getByRole('button', { name, exact: true }).boundingBox();
          expect(target!.height).toBeGreaterThanOrEqual(44);
        }
      }
      if (width === 390 || width === 1440) await page.screenshot({ path: `${evidence}/${info.project.name}-${theme}-${width}.png` });
      await page.keyboard.press('Escape');
      await scenario(page, 'Texto longo'); await launch(page);
      const heading = page.locator('.es-drawer-heading h2');
      expect(await heading.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
      await expect(page.getByRole('button', { name: 'Salvar vaga', exact: true })).toBeInViewport();
    }
  }
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 640, height: 900 });
  await page.evaluate(() => { document.documentElement.dir = 'rtl'; document.documentElement.style.zoom = '2'; });
  await launch(page);
  const bounds = await page.locator('.es-drawer').boundingBox();
  expect(bounds!.x).toBe(0); expect(bounds!.y).toBe(0);
  expect(bounds!.width).toBeLessThanOrEqual(640); expect(bounds!.height).toBeLessThanOrEqual(900);
  await expect(page.getByRole('button', { name: 'Fechar detalhes' })).toBeInViewport();
  await expect(page.getByRole('button', { name: 'Salvar vaga', exact: true })).toBeInViewport();
  await page.screenshot({ path: `${evidence}/${info.project.name}-zoom-rtl.png` });
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Ver origem' })).toBeFocused();
  await expect(page.getByRole('button', { name: 'Ver origem' })).toBeInViewport();
  await expect(page.getByRole('button', { name: 'Fechar detalhes' })).toBeInViewport();
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Fechar detalhes' }).focus();
  await expect(page.getByRole('button', { name: 'Fechar detalhes' })).toHaveCSS('outline-style', 'solid');
  await expect(page.locator('.es-drawer')).toHaveCSS('animation-name', 'none');
  expect(errors).toEqual([]);
});
