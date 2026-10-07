import { expect, test, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const evidence = fileURLToPath(new URL('./evidence/pricing/', import.meta.url));
const title = 'Um plano para cada momento';

async function chooseImage(page: Page, option: string) {
  await page.getByRole('button', { name: /^Imagem:/ }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
}

test('real catalog entry preserves pricing hierarchy, geometry and one emphasized action', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const theme of ['light', 'dark']) {
    await page.goto('/?view=chat&theme=' + theme + '&brand=curriculol');
    if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Navigation', exact: true }).click();
    await page.getByRole('button', { name: 'Precificação', exact: true }).click();
    await expect(page).toHaveURL(/view=pricing/);
    const section = page.getByRole('region', { name: title });
    await expect(section.getByRole('heading', { level: 1 })).toHaveText(title);
    await expect(section.getByRole('heading', { level: 2 })).toHaveText(['Essencial', 'Pro']);
    const cards = section.getByRole('article');
    await expect(cards).toHaveCount(2);
    await expect(section.locator('[data-featured=true]')).toHaveCount(1);
    for (const card of await cards.all()) {
      await card.scrollIntoViewIfNeeded();
      await expect(card.locator('.es-pricing-card-media')).toHaveAttribute('data-state', 'ready');
      await expect(card).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(card).toHaveCSS('border-radius', '24px');
      await expect(card.locator('.es-pricing-content')).toHaveCSS('padding', '20px');
      await expect(card.getByRole('heading')).toHaveCSS('font-family', /Inter/);
      await expect(card.getByRole('heading')).toHaveCSS('font-weight', '500');
      await expect(card.getByRole('listitem')).toHaveCount(3);
      await expect(card.getByRole('img')).toHaveCount(0);
      const media = (await card.locator('.es-pricing-card-media').boundingBox())!;
      expect(media.width / media.height).toBeCloseTo(4, 1);
      expect((await card.getByRole('button').boundingBox())!.height).toBeGreaterThanOrEqual(info.project.name === 'mobile' ? 44 : 40);
    }
    const pro = section.getByRole('article', { name: 'Pro', exact: true });
    await expect(pro.getByRole('button')).toHaveAccessibleDescription('Cobrança mensal. Valor demonstrativo.');
    await expect(pro.locator('.es-pricing-price')).toHaveText('R$ 49/mês');
    const positions = await cards.evaluateAll(elements => elements.map(element => ({ top: element.getBoundingClientRect().top, actionY: element.querySelector('button')!.getBoundingClientRect().top })));
    if (info.project.name === 'desktop') {
      expect(positions[0].top).toBe(positions[1].top);
      expect(positions[0].actionY).toBe(positions[1].actionY);
    } else expect(positions[1].top).toBeGreaterThan(positions[0].top);
    await section.screenshot({ path: evidence + `${info.project.name}-${theme}-detail.png` });
    await page.screenshot({ path: evidence + `${info.project.name}-${theme}.png`, fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('selection is explicit, recoverable and never creates an actual subscription', async ({ page }, info) => {
  await page.goto('/?view=pricing&theme=dark&brand=curriculol');
  const pro = page.getByRole('article', { name: 'Pro', exact: true });
  const starter = page.getByRole('article', { name: 'Essencial', exact: true });
  const action = pro.getByRole('button');
  await action.focus();
  await action.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(action).toBeFocused();
  await expect(action).toHaveCSS('outline-style', 'solid');
  await action.press('Enter');
  await expect(action).toHaveAttribute('aria-busy', 'true');
  await expect(action).toBeDisabled();
  await expect(starter.getByRole('button')).toBeDisabled();
  await expect(pro.getByRole('status')).toContainText('Nenhuma cobrança será realizada');
  await page.getByRole('button', { name: 'Simular falha' }).click();
  await expect(action).toBeEnabled();
  await expect(pro.getByRole('status')).toContainText('Escolha o plano novamente');
  await expect(pro.getByRole('listitem')).toHaveCount(3);
  await expect(pro.locator('.es-pricing-price')).toHaveText('R$ 49/mês');
  await pro.screenshot({ path: evidence + `${info.project.name}-recovery.png` });
  await action.click();
  await page.getByRole('button', { name: 'Concluir simulação' }).click();
  await expect(pro.getByRole('status')).toContainText('Nenhuma assinatura foi criada');
  await expect(action).toBeDisabled();
  await expect(starter.getByRole('button')).toBeEnabled();
  await page.getByRole('button', { name: 'Restaurar exemplos' }).click();
  await expect(action).toBeEnabled();
  await expect(pro.getByRole('status')).toHaveText('');
  await page.getByRole('switch', { name: 'Essencial como plano atual' }).click();
  await expect(starter.getByRole('button', { name: 'Plano atual' })).toBeDisabled();
  await expect(starter.getByRole('button')).toHaveAccessibleDescription('Sem cobrança neste exemplo. Plano atual apenas nesta demonstração.');
});

test('price motion uses a typed controlled amount and never parses the literal label', async ({ page }) => {
  await page.goto('/?view=pricing&theme=dark&brand=curriculol');
  const price = page.locator('.es-pricing-card[data-featured=true] .es-pricing-price');
  await expect(price).toHaveText('R$ 49/mês');
  await expect(price.locator('.es-animated-number')).toHaveCount(0);

  await page.getByRole('switch', { name: 'Testar texto longo' }).click();
  await expect(price.locator('.es-animated-number')).toHaveCount(1);
  await expect(price).toHaveText('R$ 1.249,90 por mês');
});

test('long prices and copy reflow, with single-plan and empty-benefit alternatives', async ({ page }, info) => {
  for (const theme of ['light', 'dark']) {
    await page.goto('/?view=pricing&theme=' + theme + '&brand=curriculol');
    await page.getByRole('switch', { name: 'Testar texto longo' }).click();
    const section = page.getByRole('region', { name: title });
    for (const width of [320, 390, 938, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await section.scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await section.evaluate(element => [...element.querySelectorAll('h1,h2,p,li,button,bdi')].every(child => child.scrollWidth <= child.clientWidth + 1 && child.scrollHeight <= child.clientHeight + 1))).toBe(true);
      for (const button of await section.getByRole('button').all()) expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(width < 768 ? 44 : 40);
      if (width === 320) {
        const lastCard = section.getByRole('article').last();
        const heading = (await lastCard.getByRole('heading').boundingBox())!;
        const price = (await lastCard.locator('.es-pricing-price').boundingBox())!;
        expect(price.y).toBeGreaterThanOrEqual(heading.y + heading.height);
        await section.screenshot({ path: evidence + `${info.project.name}-${theme}-long-320.png` });
      }
    }
    await page.getByRole('switch', { name: 'Mostrar apenas um plano' }).click();
    await expect(section.getByRole('article')).toHaveCount(1);
    const bounds = (await section.boundingBox())!;
    const cardBounds = (await section.getByRole('article').boundingBox())!;
    expect(Math.abs((cardBounds.x + cardBounds.width / 2) - (bounds.x + bounds.width / 2))).toBeLessThanOrEqual(1);
    await page.getByRole('switch', { name: 'Ocultar lista de benefícios' }).click();
    await expect(section.getByRole('list')).toHaveCount(0);
    await expect(section.getByRole('button')).toBeEnabled();
    await page.evaluate(() => { document.documentElement.dir = 'rtl'; document.documentElement.style.zoom = '2'; });
    await section.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await section.screenshot({ path: evidence + `${info.project.name}-${theme}-zoom-rtl.png` });
    await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
    const action = section.getByRole('button');
    await action.focus();
    await action.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(action).toBeFocused();
    await expect(action).toHaveCSS('outline-style', 'solid');
    await expect(section.getByRole('article')).toHaveCSS('outline-style', 'solid');
    await page.emulateMedia({ forcedColors: 'none', reducedMotion: 'no-preference' });
  }
});

test('media loading, broken source and cached re-entry preserve the offer', async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route(/\/assets\/pricing-starter\.svg(?:\?.*)?$/, async route => {
    if (route.request().resourceType() === 'image') await pending;
    await route.continue();
  });
  try {
    await page.goto('/?view=pricing&theme=light', { waitUntil: 'domcontentloaded' });
    const card = page.getByRole('article', { name: 'Essencial', exact: true });
    await card.scrollIntoViewIfNeeded();
    const media = card.locator('.es-pricing-card-media');
    await expect(media).toHaveAttribute('aria-busy', 'true');
    const size = (await media.boundingBox())!;
    await expect(card.getByRole('button')).toBeEnabled();
    await expect(card.locator('.es-pricing-price')).toHaveText('Grátis');
    release();
    await expect(media).toHaveAttribute('data-state', 'ready');
    await chooseImage(page, 'Falha ao carregar');
    await expect(media).toHaveAttribute('data-state', 'unavailable');
    await expect(media.getByRole('img')).toHaveCount(0);
    expect((await media.boundingBox())!.height).toBe(size.height);
    await expect(card.getByRole('listitem')).toHaveCount(3);
    await chooseImage(page, 'Sem arquivo');
    await expect(media.locator('img')).toHaveCount(0);
    expect((await media.boundingBox())!.height).toBe(size.height);
    await card.getByRole('button').click();
    await expect(card.getByRole('status')).toContainText('Nenhuma cobrança');
    await page.getByRole('button', { name: 'Restaurar exemplos' }).click();
    await expect(media).toHaveAttribute('data-state', 'ready');
    expect((await media.boundingBox())!.height).toBe(size.height);
  } finally { release(); }
});
