import { expect, test, type Page } from '@playwright/test';

async function assertTextContrast(page: Page) {
  const pairs = await page.locator('.es-benefits h1,.es-benefits h2,.es-benefits p,.es-benefits a').evaluateAll(elements => elements.map(element => {
    const rgb = (value: string) => value.match(/[\d.]+/g)!.map(Number);
    const layers: number[][] = [];
    let node: Element | null = element;
    while (node) { layers.unshift(rgb(getComputedStyle(node).backgroundColor)); node = node.parentElement; }
    const bg = layers.reduce((base, color) => base.map((c, i) => c * (1 - (color[3] ?? 1)) + color[i] * (color[3] ?? 1)), [255, 255, 255]);
    const luminance = (color: number[]) => color.slice(0, 3).map(c => c / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
    const fg = rgb(getComputedStyle(element).color);
    return { text: element.textContent, ratio: (Math.max(luminance(fg), luminance(bg)) + .05) / (Math.min(luminance(fg), luminance(bg)) + .05) };
  }));
  // Brand wash is restricted to the decorative SVG, never behind functional text.
  for (const pair of pairs) expect(pair.ratio, JSON.stringify(pair)).toBeGreaterThanOrEqual(4.5);
  return Math.min(...pairs.map(pair => pair.ratio));
}

test('catalog entry, named content and native CTA keyboard round trip', async ({ page }) => {
  const errors: string[] = [];
  const mutations: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (!['GET', 'HEAD'].includes(request.method())) mutations.push(request.url()); });
  await page.goto('/?view=components&theme=light');
  if (page.viewportSize()!.width < 768) await page.getByRole('button', { name: 'Navigation', exact: true }).click();
  await page.getByRole('link', { name: 'Vantagens da landing', exact: true }).click();
  await expect(page).toHaveURL(/view=benefits/);
  const main = page.getByRole('main', { name: 'Da sua experiência à próxima candidatura.' });
  await expect(main).toBeVisible();
  await expect(main.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(main.getByRole('article')).toHaveCount(5);
  await expect(main.getByRole('heading', { level: 2 })).toHaveCount(5);
  await expect(main.getByRole('img')).toHaveCount(0);
  await expect(main.getByRole('button')).toHaveCount(0);
  const action = main.getByRole('link', { name: 'Preparar meu perfil' });
  await action.focus();
  expect(await action.evaluate(el => getComputedStyle(el).outlineWidth)).toBe('2px');
  expect((await action.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await action.press('Enter');
  await expect(page).toHaveURL(/view=onboarding/);
  await expect(page.getByRole('heading', { name: 'Prepare seu espaço' })).toBeVisible();
  await page.goBack();
  await expect(main).toBeVisible();
  await page.getByRole('button', { name: 'Escuro', exact: true }).click();
  await expect(page.locator('.es-root')).toHaveAttribute('data-theme', 'dark');
  await expect(action).toHaveAttribute('href', '?view=onboarding&theme=dark');
  expect(errors).toEqual([]);
  expect(mutations).toEqual([]);
});

test('bento geometry, full copy and contrast survive both themes and widths', async ({ page }, info) => {
  const widths = info.project.name === 'desktop' ? [1440, 768] : [390, 320];
  for (const theme of ['light', 'dark']) for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`/?view=benefits&theme=${theme}`);
    await page.evaluate(() => document.fonts.ready);
    const boxes = await page.locator('.es-benefit').evaluateAll(elements => elements.map(el => { const { x, y, width, height } = el.getBoundingClientRect(); return { x, y, width, height }; }));
    if (width >= 1008) {
      expect(boxes[0].y).toBe(boxes[1].y);
      expect(boxes[0].width).toBeCloseTo(boxes[1].width * 2 + 20, 0);
      expect(boxes[2].y).toBe(boxes[3].y);
      expect(boxes[3].y).toBe(boxes[4].y);
    } else if (width === 768) {
      expect(boxes[0].width).toBeGreaterThan(boxes[1].width);
      expect(boxes[1].y).toBe(boxes[2].y);
    } else {
      for (let i = 1; i < boxes.length; i++) expect(boxes[i].y).toBeGreaterThanOrEqual(boxes[i - 1].y + boxes[i - 1].height);
    }
    await assertTextContrast(page);
    const ids = await page.locator('.es-benefit-art radialGradient').evaluateAll(elements => elements.map(el => el.id));
    expect(new Set(ids).size).toBe(5);
    await page.screenshot({ path: `apps/web/labs/espaco-library/evidence/benefits/${info.project.name}-${theme}-${width}.png`, fullPage: true });
    await page.goto(`/?view=benefits&theme=${theme}&preview=long`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.locator('.es-benefits h1,.es-benefits h2,.es-benefits p,.es-benefits a').evaluateAll(elements => elements.every(el => el.scrollWidth <= el.clientWidth + 1))).toBe(true);
    const action = page.getByRole('main').getByRole('link');
    await action.hover();
    await page.mouse.down();
    await assertTextContrast(page);
    await page.mouse.move(0, 0);
    await page.mouse.up();
  }
});

test('optional content, RTL, zoom, reduced motion and forced colors retain meaning', async ({ page }, info) => {
  await page.goto('/?view=benefits&preview=empty');
  await expect(page.getByRole('main').getByRole('list')).toHaveCount(0);
  await expect(page.getByRole('main').getByRole('link')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.goto('/?view=benefits&preview=minimal');
  await expect(page.locator('.es-benefit').first().locator('.es-benefit-media')).toHaveCount(0);
  await expect(page.getByRole('main').getByRole('link')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 640, height: 1000 });
  await page.goto('/?view=benefits&theme=dark&preview=long');
  await page.evaluate(() => { document.documentElement.style.zoom = '2'; document.documentElement.dir = 'rtl'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.getByRole('main').evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0);
  const action = page.getByRole('main').getByRole('link');
  await action.focus();
  await expect(action).toBeFocused();
  await page.screenshot({ path: `apps/web/labs/espaco-library/evidence/benefits/${info.project.name}-zoom-rtl.png`, fullPage: true });
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(page.locator('.es-benefit-media').first()).toBeHidden();
  await expect(page.getByRole('main').getByRole('heading')).toHaveCount(6);
  expect(await action.evaluate(el => parseFloat(getComputedStyle(el).outlineWidth))).toBeGreaterThan(0);
  await action.press('Enter');
  await expect(page).toHaveURL(/view=onboarding/);
});
