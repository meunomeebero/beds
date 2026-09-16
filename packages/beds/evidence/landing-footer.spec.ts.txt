import { expect, test, type Page } from '@playwright/test';

async function assertContrast(page: Page) {
  const pairs = await page.locator('.es-landing-footer h2,.es-landing-footer h3,.es-landing-footer p,.es-landing-footer a,.es-landing-footer-brand').evaluateAll(elements => elements.map(element => {
    const rgb = (value: string) => value.match(/[\d.]+/g)!.map(Number);
    const layers: number[][] = [];
    let node: Element | null = element;
    while (node) { layers.unshift(rgb(getComputedStyle(node).backgroundColor)); node = node.parentElement; }
    const bg = layers.reduce((base, color) => base.map((c, i) => c * (1 - (color[3] ?? 1)) + color[i] * (color[3] ?? 1)), [255, 255, 255]);
    const lum = (color: number[]) => color.slice(0, 3).map(c => c / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
    const foreground = rgb(getComputedStyle(element).color);
    return { text: element.textContent, ratio: (Math.max(lum(foreground), lum(bg)) + .05) / (Math.min(lum(foreground), lum(bg)) + .05) };
  }));
  // Decorative wash never under functional text: CTA has its own opaque fill.
  for (const pair of pairs) expect(pair.ratio, JSON.stringify(pair)).toBeGreaterThanOrEqual(4.5);
}

test('footer exposes named native navigation, keyboard focus and a real preview round trip', async ({ page }) => {
  await page.goto('/?view=landing-footer&theme=light');
  const footer = page.getByRole('contentinfo', { name: 'Curriculol', exact: true });
  await expect(footer).toBeVisible();
  await expect(footer.getByRole('navigation')).toHaveCount(2);
  await expect(footer.getByRole('link')).toHaveCount(6);
  const links = footer.getByRole('link');
  await links.first().focus();
  for (let index = 0; index < await links.count(); index++) {
    const link = links.nth(index);
    await expect(link).toBeFocused();
    expect(await link.evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none');
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    if (index < await links.count() - 1) await page.keyboard.press('Tab');
  }
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/view=onboarding/);
  await expect(page.getByRole('heading', { name: 'Prepare seu espaço' })).toBeVisible();
  await page.goBack();
  await expect(footer).toBeVisible();
  await footer.getByRole('link', { name: 'Blog', exact: true }).click();
  await expect(page).toHaveURL(/view=blog-post/);
  await expect(page.getByRole('heading', { name: 'Leituras para o próximo passo' })).toBeVisible();
  await page.goBack();
  await page.getByRole('button', { name: 'Escuro', exact: true }).click();
  await expect(page.locator('.es-root')).toHaveAttribute('data-theme', 'dark');
  await expect(footer.getByRole('link', { name: 'Preparar meu perfil' })).toHaveAttribute('href', '?view=onboarding&theme=dark');
});

test('both themes preserve geometry, contrast and long-content growth at desktop and narrow widths', async ({ page }, info) => {
  const widths = info.project.name === 'desktop' ? [1440, 768] : [390, 320];
  for (const theme of ['light', 'dark']) for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`/?view=landing-footer&theme=${theme}`);
    await page.evaluate(() => document.fonts.ready);
    await assertContrast(page);
    const action = page.getByRole('link', { name: 'Preparar meu perfil' });
    await action.hover();
    await page.mouse.down();
    await assertContrast(page);
    await page.mouse.move(0, 0);
    await page.mouse.up();
    await page.screenshot({ path: `apps/web/labs/espaco-library/evidence/landing-footer/${info.project.name}-${theme}-${width}.png`, fullPage: true });
    await page.goto(`/?view=landing-footer&theme=${theme}&preview=long`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.locator('.es-landing-footer h2,.es-landing-footer-brand,.es-landing-footer a,.es-landing-footer-wordmark').evaluateAll(elements => elements.every(el => el.scrollWidth <= el.clientWidth + 1))).toBe(true);
    await expect(page.getByRole('navigation', { name: 'Documentação da prévia' })).toBeVisible();
    await assertContrast(page);
  }
});

test('minimal data, reduced motion, RTL, zoom and high contrast keep the action reachable', async ({ page }, info) => {
  await page.goto('/?view=landing-footer&preview=minimal');
  await expect(page.getByRole('contentinfo').getByRole('link')).toHaveCount(0);
  await expect(page.getByRole('contentinfo').getByRole('navigation')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Seu próximo passo começa com a sua história.' })).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 640, height: 1000 });
  await page.goto('/?view=landing-footer&theme=dark&preview=long');
  await page.evaluate(() => { document.documentElement.style.zoom = '2'; document.documentElement.dir = 'rtl'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.getByRole('contentinfo').evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0);
  const action = page.getByRole('link', { name: 'Começar a organizar minhas experiências profissionais' });
  await action.focus();
  await action.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(action).toBeFocused();
  await page.screenshot({ path: `apps/web/labs/espaco-library/evidence/landing-footer/${info.project.name}-zoom-rtl.png`, fullPage: true });
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(page.locator('.es-landing-footer-glow')).toBeHidden();
  expect(await action.evaluate(el => parseFloat(getComputedStyle(el).outlineWidth))).toBeGreaterThan(0);
  await action.press('Enter');
  await expect(page).toHaveURL(/view=onboarding/);
});
