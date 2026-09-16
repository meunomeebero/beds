import { expect, test, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const evidence = fileURLToPath(new URL('./evidence/empty-state/', import.meta.url));
const clearTitle = 'Tudo em dia por aqui';

async function choose(page: Page, label: string, option: string) {
  await page.getByRole('button', { name: new RegExp('^' + label + ':') }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
}

test('catalog entry presents a quiet illustrated state in both themes', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const theme of ['light', 'dark']) {
    await page.goto('/?view=chat&theme=' + theme);
    if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Navigation', exact: true }).click();
    await page.getByRole('button', { name: 'Estado vazio', exact: true }).click();
    await expect(page).toHaveURL(/view=empty-state/);
    const card = page.getByRole('article', { name: clearTitle });
    await card.scrollIntoViewIfNeeded();
    const media = card.locator('.es-empty-state-card-media');
    await expect(media).toHaveAttribute('data-state', 'ready');
    await expect(card).toHaveAccessibleDescription('Nenhum processo pendente. Seus próximos passos podem esperar um pouco.');
    await expect(card.getByRole('heading', { level: 2 })).toHaveText(clearTitle);
    await expect(card.getByRole('button')).toHaveCount(0);
    await expect(card.getByRole('img')).toHaveCount(0);
    await expect(card).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(card).toHaveCSS('border-radius', '24px');
    await expect(card).toHaveCSS('padding', '8px');
    await expect(card.locator('.es-empty-state-card-icon')).toHaveCSS('width', '32px');
    await expect(media).toHaveCSS('border-radius', '16px');
    await expect(card.getByRole('heading')).toHaveCSS('font-size', '18px');
    await expect(card.getByRole('heading')).toHaveCSS('font-weight', '500');
    await expect(card.locator('p')).toHaveCSS('line-height', '22px');
    const shape = (await media.boundingBox())!;
    expect(shape.width / shape.height).toBeCloseTo(15 / 7, 1);
    expect((await card.boundingBox())!.width).toBeLessThanOrEqual(480);
    await page.screenshot({ path: evidence + `${info.project.name}-${theme}.png`, fullPage: true });
    await card.screenshot({ path: evidence + `${info.project.name}-${theme}-detail.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('optional action, image recovery and compact alternative remain independent', async ({ page }, info) => {
  await page.goto('/?view=empty-state&theme=dark');
  await choose(page, 'Situação', 'Primeiro uso');
  const card = page.getByRole('article');
  const action = card.getByRole('button', { name: 'Buscar vagas', exact: true });
  await action.focus();
  await action.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(action).toBeFocused();
  await expect(action).toHaveCSS('outline-style', 'solid');
  await action.press('Enter');
  await expect(page.getByRole('status')).toContainText('Nenhuma consulta foi enviada');
  expect((await action.boundingBox())!.height).toBeGreaterThanOrEqual(info.project.name === 'mobile' ? 44 : 40);
  await choose(page, 'Situação', 'Ação em espera');
  const busy = card.getByRole('button');
  await expect(busy).toBeDisabled();
  await expect(busy).toHaveAttribute('aria-busy', 'true');
  await busy.click({ force: true });
  await expect(page.getByRole('status')).toHaveText('');
  await choose(page, 'Situação', 'Ação indisponível');
  await expect(action).toBeDisabled();
  await action.click({ force: true });
  await expect(page.getByRole('status')).toHaveText('');
  await choose(page, 'Situação', 'Primeiro uso');
  await page.getByRole('switch', { name: 'Ilustração apenas decorativa' }).click();
  const media = card.locator('.es-empty-state-card-media');
  await expect(media).toHaveAttribute('data-state', 'ready');
  const height = (await card.boundingBox())!.height;
  await choose(page, 'Ilustração', 'Falha ao carregar');
  await expect(media).toHaveAttribute('data-state', 'unavailable');
  await expect(media.getByRole('img')).toHaveAccessibleName(/Ilustração de uma lista organizada/);
  await expect(media).toContainText('Ilustração indisponível');
  expect((await card.boundingBox())!.height).toBe(height);
  await card.screenshot({ path: evidence + `${info.project.name}-image-failure.png` });
  await choose(page, 'Ilustração', 'Sem arquivo');
  await expect(media.locator('img')).toHaveCount(0);
  expect((await card.boundingBox())!.height).toBe(height);
  await action.click();
  await expect(page.getByRole('status')).toContainText('Nenhuma consulta foi enviada');
  await choose(page, 'Ilustração', 'Disponível');
  await expect(media).toHaveAttribute('data-state', 'ready');
  expect((await card.boundingBox())!.height).toBe(height);
  await page.getByRole('switch', { name: 'Ilustração apenas decorativa' }).click();
  await choose(page, 'Ilustração', 'Falha ao carregar');
  await expect(media).toHaveAttribute('data-state', 'unavailable');
  await expect(media.getByRole('img')).toHaveCount(0);
  await expect(media).toHaveText('');
  await choose(page, 'Situação', 'Compacto existente');
  await expect(page.locator('.es-empty-state-card')).toHaveCount(0);
  await expect(page.getByText('Nenhum processo em andamento', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Restaurar exemplo' }).click();
  await expect(page.getByRole('article', { name: clearTitle }).locator('.es-empty-state-card-media')).toHaveAttribute('data-state', 'ready');
});

test('long copy stays contained across widths, direction and text magnification', async ({ page }, info) => {
  for (const theme of ['light', 'dark']) {
    await page.goto('/?view=empty-state&theme=' + theme);
    await choose(page, 'Situação', 'Texto longo');
    const card = page.getByRole('article');
    for (const width of [320, 390, 938, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await card.scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await card.evaluate(element => [...element.querySelectorAll('h2,p,button')].every(child => child.scrollWidth <= child.clientWidth + 1 && child.scrollHeight <= child.clientHeight + 1))).toBe(true);
      const button = card.getByRole('button');
      expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(width < 768 ? 44 : 40);
      if (width === 320) await card.screenshot({ path: evidence + `${info.project.name}-${theme}-long-320.png` });
    }
    await page.evaluate(() => { document.documentElement.dir = 'rtl'; document.documentElement.style.zoom = '2'; });
    await card.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await card.screenshot({ path: evidence + `${info.project.name}-${theme}-zoom-rtl.png` });
    await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
    await card.getByRole('button').focus();
    await card.getByRole('button').press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(card.getByRole('button')).toBeFocused();
    await expect(card.getByRole('button')).toHaveCSS('outline-style', 'solid');
    await expect(card).toHaveCSS('outline-style', 'solid');
    await page.emulateMedia({ forcedColors: 'none', reducedMotion: 'no-preference' });
  }
});

test('pending artwork reserves space and never blocks the optional action', async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route(/\/assets\/empty-state-light\.svg(?:\?.*)?$/, async route => { await pending; await route.continue(); });
  try {
    await page.goto('/?view=empty-state&theme=light', { waitUntil: 'domcontentloaded' });
    await choose(page, 'Situação', 'Primeiro uso');
    const card = page.getByRole('article');
    await card.scrollIntoViewIfNeeded();
    const media = card.locator('.es-empty-state-card-media');
    await expect(media).toHaveAttribute('aria-busy', 'true');
    const height = (await card.boundingBox())!.height;
    await card.getByRole('button', { name: 'Buscar vagas' }).click();
    await expect(page.getByRole('status')).toContainText('Nenhuma consulta foi enviada');
    release();
    await expect(media).toHaveAttribute('data-state', 'ready');
    expect((await card.boundingBox())!.height).toBe(height);
  } finally { release(); }
});
