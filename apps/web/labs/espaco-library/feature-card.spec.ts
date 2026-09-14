import { expect, test, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const evidence = fileURLToPath(new URL('./evidence/', import.meta.url));
const title = 'Seu próximo passo começa aqui';

async function choose(page: Page, label: string, option: string) {
  await page.getByRole('button', { name: new RegExp('^' + label + ':') }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
}

test('catalog entry opens the reusable feature card with fixed light and dark geometry', async ({ page }, info) => {
  for (const theme of ['light', 'dark']) {
    await page.goto('/?view=chat&theme=' + theme);
    if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Navigation', exact: true }).click();
    await page.getByRole('button', { name: 'Card de apresentação', exact: true }).click();
    await expect(page).toHaveURL(/view=feature-card/);
    const card = page.getByRole('article', { name: title });
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator('.es-feature-card-media')).toHaveAttribute('data-state', 'ready');
    await expect(card).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(card).toHaveCSS('border-radius', '24px');
    await expect(card).toHaveCSS('padding', '8px');
    await expect(card.locator('.es-feature-card-media')).toHaveCSS('border-radius', '16px');
    await expect(card.getByRole('heading')).toHaveCSS('font-size', '18px');
    await expect(card.getByRole('heading')).toHaveCSS('font-weight', '600');
    await expect(card.locator('.es-feature-card-copy>p')).toHaveCSS('line-height', '22px');
    const shape = await card.locator('.es-feature-card-media').boundingBox();
    expect(shape!.width / shape!.height).toBeCloseTo(1.5, 1);
    const width = (await card.boundingBox())!.width;
    expect(width).toBeLessThanOrEqual(360);
    const primary = card.getByRole('button', { name: 'Montar meu perfil' });
    expect((await primary.boundingBox())!.height).toBeGreaterThanOrEqual(info.project.name === 'mobile' ? 44 : 40);
    await page.screenshot({ path: evidence + `feature-card-${theme}-${info.project.name}.png`, fullPage: true });
    await card.screenshot({ path: evidence + `feature-card-detail-${theme}-${info.project.name}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('actions are keyboard accessible, caller controlled and block busy or disabled activation', async ({ page }) => {
  await page.goto('/?view=feature-card');
  const card = page.getByRole('article', { name: title });
  const primary = card.getByRole('button', { name: 'Montar meu perfil' });
  await primary.focus();
  await expect(primary).toHaveCSS('outline-style', 'solid');
  await primary.press('Enter');
  await expect(page.getByRole('status')).toContainText('Exemplo iniciado');
  await primary.press('Tab');
  const secondary = card.getByRole('button', { name: 'Saiba mais' });
  await expect(secondary).toBeFocused();
  await secondary.press('Space');
  await expect(page.getByRole('status')).toContainText('A aplicação decide');
  await page.getByRole('button', { name: 'Restaurar exemplo' }).click();
  await choose(page, 'Ação principal', 'Em espera');
  const busy = card.getByRole('button', { name: 'Preparando seu perfil' });
  await expect(busy).toBeDisabled();
  await expect(busy).toHaveAttribute('aria-busy', 'true');
  await busy.click({ force: true });
  await expect(page.getByRole('status')).toHaveCount(0);
  await expect(secondary).toBeEnabled();
  await choose(page, 'Ação principal', 'Desabilitada');
  await expect(primary).toBeDisabled();
  await primary.click({ force: true });
  await expect(page.getByRole('status')).toHaveCount(0);
  await choose(page, 'Ação principal', 'Disponível');
  await primary.click();
  await expect(page.getByRole('status')).toContainText('Exemplo iniciado');
});

test('image failure, empty source and cached re-entry preserve geometry and actions', async ({ page }, info) => {
  await page.goto('/?view=feature-card&theme=dark');
  const card = page.getByRole('article', { name: title });
  const media = card.locator('.es-feature-card-media');
  await card.scrollIntoViewIfNeeded();
  await expect(media).toHaveAttribute('data-state', 'ready');
  const height = (await card.boundingBox())!.height;
  await choose(page, 'Imagem do exemplo', 'Falha ao carregar');
  await expect(media).toHaveAttribute('data-state', 'unavailable');
  await expect(media.getByRole('img')).toHaveAccessibleName(/Conversa ilustrativa/);
  await expect(media).toContainText('Prévia indisponível');
  expect((await card.boundingBox())!.height).toBe(height);
  await card.screenshot({ path: evidence + `feature-card-unavailable-${info.project.name}.png` });
  await choose(page, 'Imagem do exemplo', 'Sem arquivo');
  await expect(media.locator('img')).toHaveCount(0);
  expect((await card.boundingBox())!.height).toBe(height);
  await card.getByRole('button', { name: 'Montar meu perfil' }).click();
  await expect(page.getByRole('status')).toContainText('Exemplo iniciado');
  await choose(page, 'Imagem do exemplo', 'Imagem disponível');
  await expect(media).toHaveAttribute('data-state', 'ready');
  await expect(media.locator('img')).toBeVisible();
  expect((await card.boundingBox())!.height).toBe(height);
  await page.getByRole('switch', { name: 'Imagem apenas decorativa' }).click();
  await expect(media.locator('img')).toHaveAttribute('alt', '');
  await choose(page, 'Imagem do exemplo', 'Falha ao carregar');
  await expect(media).toHaveAttribute('data-state', 'unavailable');
  await expect(media.getByRole('img')).toHaveCount(0);
});

test('long copy, one action and responsive widths retain all content', async ({ page }) => {
  for (const theme of ['light', 'dark']) {
    await page.goto('/?view=feature-card&theme=' + theme);
    await page.getByRole('switch', { name: 'Testar texto longo' }).click();
    await page.getByRole('switch', { name: 'Mostrar ação secundária' }).click();
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const card = page.getByRole('article');
      await expect(card.getByRole('button')).toHaveCount(1);
      await expect(card.getByRole('button')).toHaveText('Começar a organizar minha trajetória');
      await card.scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const fits = await card.evaluate(element => [...element.querySelectorAll('h2,p,button')].every(child => child.scrollWidth <= child.clientWidth + 1 && child.scrollHeight <= child.clientHeight + 1));
      expect(fits).toBe(true);
    }
  }
});

test('pending image reserves its space without blocking the primary action', async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route(/\/assets\/feature-onboarding\.svg(?:\?.*)?$/, async route => { await pending; await route.continue(); });
  await page.goto('/?view=feature-card', { waitUntil: 'domcontentloaded' });
  const card = page.getByRole('article', { name: title });
  await card.scrollIntoViewIfNeeded();
  const media = card.locator('.es-feature-card-media');
  try {
    await expect(media).toHaveAttribute('aria-busy', 'true');
    const before = (await card.boundingBox())!.height;
    await card.getByRole('button', { name: 'Montar meu perfil' }).click();
    await expect(page.getByRole('status')).toContainText('Exemplo iniciado');
    release();
    await expect(media).toHaveAttribute('data-state', 'ready');
    expect((await card.boundingBox())!.height).toBe(before);
  } finally { release(); }
});
