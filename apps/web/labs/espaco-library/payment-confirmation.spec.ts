import { expect, test, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const evidence = fileURLToPath(new URL('./evidence/payment-confirmation/', import.meta.url));
const component = (page: Page) => page.getByRole('region', { name: 'Pagamento confirmado', exact: true });
const paper = (page: Page) => page.locator('.es-payment-paper');

async function freezePaper(page: Page, time: number) {
  await paper(page).evaluate((element, value) => {
    const animation = element.getAnimations()[0];
    if (!animation) throw new Error('Expected receipt animation');
    animation.pause();
    animation.currentTime = value;
  }, time);
}

async function contrast(page: Page) {
  return component(page).locator('h2,p,dt,dd,.es-payment-description,.es-payment-merchant,.es-button').evaluateAll(elements => elements.filter(element => element.textContent?.trim()).map(element => {
    const rgba = (value: string) => value.match(/[\d.]+/g)!.map(Number);
    const layers: number[][] = [];
    let node: Element | null = element;
    while (node) { layers.unshift(rgba(getComputedStyle(node).backgroundColor)); node = node.parentElement; }
    const bg = layers.reduce((base, color) => base.map((c, i) => c * (1 - (color[3] ?? 1)) + color[i] * (color[3] ?? 1)), [255, 255, 255]);
    const lum = (rgb: number[]) => rgb.slice(0, 3).map(c => c / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
    const fg = rgba(getComputedStyle(element).color);
    return { text: element.textContent, ratio: (Math.max(lum(fg), lum(bg)) + .05) / (Math.min(lum(fg), lum(bg)) + .05) };
  }));
}

test('catalog entry, paper sequence, immediate invoice action and focus recovery', async ({ page }, info) => {
  const errors: string[] = [];
  const writes: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (request.method() !== 'GET') writes.push(request.url()); });
  for (const theme of ['light', 'dark']) {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/?view=chat&theme=' + theme);
    if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Navigation', exact: true }).click();
    await page.getByRole('link', { name: 'Pagamento confirmado', exact: true }).click();
    await expect(component(page)).toBeVisible();
    await expect(component(page).getByRole('heading', { name: 'Pagamento confirmado' })).toBeVisible();
    const animation = await paper(page).evaluate(element => element.getAnimations()[0].effect!.getTiming());
    expect(animation.duration).toBe(1600);
    expect(animation.iterations).toBe(1);
    await freezePaper(page, 120);
    const start = await paper(page).boundingBox();
    const action = component(page).getByRole('button', { name: 'Ver nota fiscal' });
    const actionStart = (await action.boundingBox())!.y - (await component(page).boundingBox())!.y;
    await expect(action).toBeEnabled();
    await action.focus();
    await expect(action).toHaveCSS('outline-style', 'solid');
    await action.press('Enter');
    await expect(page.getByRole('dialog', { name: 'Nota fiscal — demonstração' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(action).toBeFocused();
    await action.blur();
    await freezePaper(page, 360);
    const mid = await paper(page).boundingBox();
    await page.screenshot({ path: evidence + `${info.project.name}-${theme}-printing.png`, fullPage: true });
    await freezePaper(page, 1720);
    const end = await paper(page).boundingBox();
    expect(mid!.y).toBeGreaterThan(start!.y);
    expect(end!.y).toBeGreaterThan(mid!.y);
    expect((await action.boundingBox())!.y - (await component(page).boundingBox())!.y).toBeCloseTo(actionStart, 1);
    for (const pair of await contrast(page)) expect(pair.ratio, JSON.stringify(pair)).toBeGreaterThanOrEqual(4.5);
    await expect(component(page).getByText('Exemplo sem validade fiscal.', { exact: true })).toBeVisible();
    await page.screenshot({ path: evidence + `${info.project.name}-${theme}.png`, fullPage: true });
    await page.getByRole('button', { name: 'Rever animação' }).click();
    await page.getByRole('button', { name: 'Rever animação' }).click();
    expect(await paper(page).evaluate(element => element.getAnimations().length)).toBe(1);
    // A changed system preference during the sequence reveals the final state immediately.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(paper(page)).toHaveCSS('animation-name', 'none');
    await expect(paper(page)).toHaveCSS('transform', 'none');
  }
  expect(errors).toEqual([]);
  expect(writes).toEqual([]);
});

test('invoice pending/error/recovery never changes payment and never replays paper', async ({ page }, info) => {
  await page.goto('/?view=payment-confirmation&theme=dark');
  await freezePaper(page, 1720);
  await page.getByRole('button', { name: 'Nota em emissão', exact: true }).click();
  await expect(component(page).getByRole('status')).toContainText('ainda está em emissão');
  await expect(component(page).getByRole('button', { name: 'Ver nota fiscal' })).toHaveCount(0);
  await expect(component(page).getByRole('heading')).toHaveText('Pagamento confirmado');
  await page.getByRole('button', { name: 'Simular erro da nota' }).click();
  await expect(component(page).getByRole('status')).toContainText('você não será cobrado de novo');
  await page.screenshot({ path: evidence + `${info.project.name}-error.png`, fullPage: true });
  await component(page).getByRole('button', { name: 'Tentar novamente' }).press('Enter');
  await expect(component(page).getByRole('status')).toHaveText('Sua nota fiscal está disponível.');
  expect(await paper(page).evaluate(element => element.getAnimations()[0].currentTime)).toBe(1720);
  await component(page).getByRole('button', { name: 'Ver nota fiscal' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('long content, reflow, RTL, zoom and static restored receipt', async ({ page }, info) => {
  for (const theme of ['light', 'dark']) {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/?view=payment-confirmation&theme=${theme}&preview=long`);
    for (const width of [1440, 800, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await component(page).evaluate(element => [...element.querySelectorAll('p,dt,dd,span,button')].every(child => child.scrollWidth <= child.clientWidth + 1))).toBe(true);
    }
    expect((await component(page).getByRole('button').boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await page.screenshot({ path: evidence + `${info.project.name}-${theme}-320.png`, fullPage: true });
    await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
    const term = await page.locator('.es-payment-rows dt').first().boundingBox();
    const value = await page.locator('.es-payment-rows dd').first().boundingBox();
    expect(term!.x).toBeGreaterThan(value!.x);
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.evaluate(() => { document.documentElement.dir = 'ltr'; document.documentElement.style.zoom = '2'; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await component(page).getByRole('button').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.emulateMedia({ forcedColors: 'active' });
    await component(page).getByRole('button').focus();
    await expect(component(page).getByRole('button')).toHaveCSS('outline-style', 'solid');
    await expect(paper(page)).toHaveCSS('animation-name', 'none');
    await page.emulateMedia({ forcedColors: 'none', reducedMotion: 'no-preference' });
    await page.goto(`/?view=payment-confirmation&theme=${theme}&motion=off`);
    await expect(paper(page)).toHaveCSS('animation-name', 'none');
  }
});
