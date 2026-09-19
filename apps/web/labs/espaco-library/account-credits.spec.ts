import { expect, test, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';
const evidence = fileURLToPath(new URL('./evidence/account-credits/', import.meta.url));

async function openMenu(page: Page) {
  await expect(page.getByRole('heading', { name: 'Créditos no menu do usuário', exact: true })).toBeVisible();
  const navigation = page.getByRole('button', { name: 'Navigation', exact: true });
  if (await navigation.isVisible()) await navigation.click();
  const trigger = page.getByRole('button', { name: 'Menu de Luísa Costa', exact: true });
  await trigger.focus(); await trigger.press('Enter');
  return page.getByRole('dialog', { name: 'Menu do usuário', exact: true });
}

test('account footer anatomy, both themes, keyboard recovery and local action', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const theme of ['light', 'dark']) {
    await page.goto('/?view=chat&theme=' + theme);
    if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Navigation', exact: true }).click();
    await page.getByRole('link', { name: 'Créditos no menu', exact: true }).click();
    const menu = await openMenu(page);
    const credits = menu.getByRole('region', { name: 'Plano de exemplo', exact: true });
    await expect(credits.getByText('12.500', { exact: true })).toBeVisible();
    await expect(credits.locator('.es-animated-number')).toHaveCount(0);
    const meter = credits.getByRole('meter', { name: 'Créditos', exact: true });
    await expect(meter).toHaveAttribute('aria-valuenow', '12500');
    await expect(meter).toHaveAttribute('aria-valuemax', '20000');
    await expect(meter.locator('span')).toHaveCount(28);
    await expect(meter.locator('[data-filled]')).toHaveCount(18);
    await expect(meter).toHaveCSS('height', '16px');
    expect(await meter.locator('span:not([data-filled])').first().evaluate(element => getComputedStyle(element).backgroundColor !== getComputedStyle(element.closest('.es-account-menu')!).backgroundColor)).toBe(true);
    await menu.screenshot({ path: evidence + `${info.project.name}-${theme}.png` });
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(page.getByRole('button', { name: 'Menu de Luísa Costa', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    const action = menu.getByRole('button', { name: 'Ver créditos', exact: true });
    await action.focus();
    await expect(action).toHaveCSS('outline-style', 'solid');
    expect((await action.boundingBox())!.height).toBeGreaterThanOrEqual(info.project.name === 'mobile' ? 44 : 36);
    await action.press('Enter');
    await expect(menu).toBeHidden();
    await expect(page.getByRole('status').filter({ hasText: 'Nenhuma compra' })).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('zero, unknown quota, unavailable, loading, error recovery and invalid number', async ({ page }) => {
  for (const [choice, text, count] of [
    ['Saldo zero', '0', 1], ['Sem limite informado', '12.500', 0],
    ['Indisponível', 'Saldo indisponível.', 0], ['Carregando', 'Consultando saldo…', 0],
    ['Dado inválido', 'Indisponível', 0], ['Erro com recuperação', 'Não foi possível consultar', 0],
  ] as const) {
    await page.goto('/?view=account-credits&theme=dark');
    await page.getByRole('button', { name: 'Estado do saldo' }).click();
    await page.getByRole('option', { name: choice, exact: true }).click();
    const menu = await openMenu(page);
    const credits = menu.locator('.es-account-credits');
    await expect(credits).toContainText(text);
    if (choice === 'Saldo zero') await expect(credits.locator('.es-animated-number')).toHaveCount(1);
    await expect(credits.getByRole('meter')).toHaveCount(count);
    if (choice === 'Saldo zero') {
      await expect(credits.getByRole('meter')).toHaveAttribute('aria-valuenow', '0');
      await expect(credits.locator('[data-filled]')).toHaveCount(0);
    }
    if (choice === 'Carregando') await expect(credits.getByRole('button', { name: 'Ver créditos' })).toBeDisabled();
    if (choice === 'Erro com recuperação') {
      await credits.getByRole('button', { name: 'Tentar novamente' }).click();
      await expect(credits.getByRole('meter')).toHaveAttribute('aria-valuenow', '12500');
      await expect(menu).toBeVisible();
    }
  }
});

test('long plan, narrow viewport, zoom and forced colors', async ({ page }, info) => {
  await page.goto('/?view=account-credits&theme=light');
  await page.getByRole('button', { name: 'Estado do saldo' }).click();
  await page.getByRole('option', { name: 'Conteúdo longo', exact: true }).click();
  await page.setViewportSize({ width: 320, height: 844 });
  const menu = await openMenu(page);
  await expect(menu).toContainText('123.456.789');
  await expect(menu).toContainText('equipes e projetos de carreira');
  expect(await menu.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  const action = menu.getByRole('button', { name: 'Ver créditos', exact: true });
  await action.focus();
  await expect(action).toBeInViewport();
  await menu.screenshot({ path: evidence + `${info.project.name}-320-long.png` });
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.evaluate(() => { document.body.style.zoom = '2'; });
  await action.focus();
  await expect(action).toBeInViewport();
  expect(await menu.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await expect(menu.locator('.es-account-credits')).toHaveCSS('border-top-style', 'solid');
  const meter = menu.getByRole('meter');
  const colors = await meter.locator('span').evaluateAll(elements => elements.map(element => getComputedStyle(element).backgroundColor));
  expect(new Set(colors).size).toBe(2);
});
