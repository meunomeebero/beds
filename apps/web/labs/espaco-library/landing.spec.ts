import { expect, test, type Page } from '@playwright/test';

async function textContrast(page: Page) {
  const pairs = await page.locator('.recipe-landing :is(h1,h2,h3,h4,p,a,button,summary)').evaluateAll(elements => elements.filter(el => el.getClientRects().length && !el.closest('[aria-hidden="true"]')).map(element => {
    const rgb = (value: string) => value.match(/[\d.]+/g)!.map(Number);
    const layers: number[][] = [];
    let node: Element | null = element;
    while (node) { layers.unshift(rgb(getComputedStyle(node).backgroundColor)); node = node.parentElement; }
    const bg = layers.reduce((base, color) => base.map((c, i) => c * (1 - (color[3] ?? 1)) + color[i] * (color[3] ?? 1)), [255, 255, 255]);
    const luminance = (color: number[]) => color.slice(0, 3).map(c => c / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
    const fg = rgb(getComputedStyle(element).color);
    return { text: element.textContent?.slice(0, 60), ratio: (Math.max(luminance(fg), luminance(bg)) + .05) / (Math.min(luminance(fg), luminance(bg)) + .05) };
  }));
  for (const pair of pairs) expect(pair.ratio, JSON.stringify(pair)).toBeGreaterThanOrEqual(4.5);
  return Math.min(...pairs.map(pair => pair.ratio));
}

test('catalog entry, landmarks, product demo and recovery are keyboard operable', async ({ page }) => {
  const errors: string[] = [];
  const mutations: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (!['GET', 'HEAD'].includes(request.method())) mutations.push(request.url()); });
  await page.goto('/?view=components&theme=light');
  if (page.viewportSize()!.width < 768) await page.getByRole('button', { name: 'Navigation', exact: true }).click();
  await page.getByRole('link', { name: 'Landing do Curriculol', exact: true }).click();
  await expect(page).toHaveURL(/view=landing/);
  await expect(page).toHaveTitle(/Curriculol/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A vaga muda. Seu currículo também.');
  await expect(page.getByRole('contentinfo')).toHaveCount(1);
  await expect(page.getByRole('banner').getByRole('link', { name: 'Curriculol', exact: true })).toHaveCount(1);
  const skip = page.getByRole('link', { name: 'Pular para o conteúdo' });
  await skip.focus(); await skip.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  const resume = page.getByRole('tab', { name: 'Currículo', exact: true });
  const letter = page.getByRole('tab', { name: 'Carta de apresentação' });
  await resume.focus(); await resume.press('End');
  await expect(letter).toBeFocused();
  await expect(letter).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: 'Carta de apresentação' })).toContainText('Olá, equipe Órbita.');
  await letter.press('Home'); await expect(resume).toHaveAttribute('aria-selected', 'true');
  const details = page.getByRole('button', { name: 'Conhecer a vaga de exemplo' });
  await details.focus(); await details.press('Enter');
  await expect(page.getByRole('dialog')).toContainText('Nenhuma candidatura será enviada.');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(details).toBeFocused();
  if (page.viewportSize()!.width < 768) {
    const menu = page.locator('.recipe-landing-mobile-nav summary');
    await menu.focus(); await menu.press('Enter');
    await expect(page.locator('.recipe-landing-mobile-nav')).toHaveAttribute('open', '');
    await page.keyboard.press('Escape'); await expect(menu).toBeFocused();
    await expect(page.locator('.recipe-landing-mobile-nav')).not.toHaveAttribute('open', '');
    await menu.press('Enter');
  }
  await page.getByRole('link', { name: 'Créditos', exact: true }).filter({ visible: true }).click();
  await expect(page).toHaveURL(/#creditos$/);
  await expect(page.locator('#creditos')).toBeInViewport();
  await expect(page.locator('.recipe-landing-mobile-nav')).not.toHaveAttribute('open', '');
  const question = page.locator('summary').filter({ hasText: 'O que posso fazer de graça?' });
  await question.focus(); await question.press('Enter');
  await expect(page.locator('details[open]')).toContainText('confirma seu e-mail');
  await question.press('Space'); await expect(page.locator('details[open]')).toHaveCount(0);
  expect(errors).toEqual([]); expect(mutations).toEqual([]);
});

test('primary CTA opens the existing local upload and round-trips without a provider', async ({ page }) => {
  await page.goto('/?view=landing&theme=dark');
  const start = page.locator('.recipe-landing-primary');
  await start.focus(); await start.press('Enter');
  await expect(page).toHaveURL(/view=upload&theme=dark/);
  await expect(page.getByRole('heading', { name: 'Sua trajetória começa aqui' })).toBeVisible();
  await expect(page.getByText('Demonstração local. O arquivo não é lido, enviado ou salvo.')).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Usar tema claro' }).click();
  await expect(page.locator('.es-root')).toHaveAttribute('data-theme', 'light');
  await expect(start).toHaveAttribute('href', '?view=upload&theme=light');
  await page.getByRole('link', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(/view=otp&theme=light/);
  await expect(page.getByRole('heading', { name: 'Código de verificação' })).toBeVisible();
  await page.goBack();
  await page.getByRole('link', { name: 'Conhecer o fluxo de candidatura' }).click();
  await expect(page).toHaveURL(/view=kanban/);
  await page.goBack();
  await expect(start).toBeVisible();
});

test('responsive geometry and computed contrast in both themes', async ({ page }, info) => {
  const widths = info.project.name === 'desktop' ? [1440, 768] : [390, 320];
  for (const theme of ['light', 'dark']) for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`/?view=landing&theme=${theme}`);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const clips = await page.locator('.recipe-landing :is(h1,h2,h3,h4,p,a,summary)').evaluateAll(elements => elements.filter(el => el.getClientRects().length && el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).display !== 'inline').map(el => ({ text: el.textContent, width: el.clientWidth, scroll: el.scrollWidth })));
    expect(clips).toEqual([]);
    const primary = page.locator('.recipe-landing-primary');
    expect((await primary.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    const minimumContrast = await textContrast(page);
    await info.attach(`contrast-${theme}-${width}`, { body: JSON.stringify({ minimumContrast }), contentType: 'application/json' });
    await primary.hover(); await page.mouse.down(); await textContrast(page); await page.mouse.move(0, 0); await page.mouse.up();
    await page.locator('#creditos').scrollIntoViewIfNeeded();
    await expect.poll(() => page.locator('#creditos img').evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `apps/web/labs/espaco-library/evidence/landing/${theme}-${width}.png`, fullPage: true });
    if (width === 1440) await page.screenshot({ path: `apps/web/labs/espaco-library/evidence/landing/${theme}-first-fold.png` });
    if (width === 390) await page.locator('.recipe-landing-hero').screenshot({ path: `apps/web/labs/espaco-library/evidence/landing/${theme}-mobile-hero.png` });
  }
});

test('reduced motion, interrupted disclosure, zoom proxy and forced colors', async ({ page }, info) => {
  await page.goto('/?view=landing&theme=dark');
  const question = page.locator('.recipe-landing-faq summary').first();
  await question.focus();
  await question.press('Enter'); await question.press('Enter'); await question.press('Enter');
  await expect(page.locator('details[open]')).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await question.locator('svg').evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');
  const animations = await page.getByRole('main').evaluate(el => el.getAnimations({ subtree: true }).map(animation => ({ state: animation.playState, target: (animation.effect as KeyframeEffect)?.target?.outerHTML?.slice(0, 140) })));
  await info.attach('reduced-motion-animations', { body: JSON.stringify(animations), contentType: 'application/json' });
  await expect.poll(() => page.getByRole('main').evaluate(el => el.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length)).toBe(0);
  await page.setViewportSize({ width: 640, height: 1000 });
  await page.evaluate(() => { document.documentElement.style.zoom = '2'; document.documentElement.dir = 'rtl'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `apps/web/labs/espaco-library/evidence/landing/${info.project.name}-zoom-rtl.png`, fullPage: true });
  await page.emulateMedia({ forcedColors: 'active' });
  await question.focus();
  expect(await question.evaluate(el => getComputedStyle(el).outlineWidth)).toBe('2px');
  await expect(page.locator('details[open]')).toContainText('confirma seu e-mail');
  await question.press('Enter'); await expect(page.locator('details[open]')).toHaveCount(0);
});

test('product demo responds to available container width, not just viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/?view=landing&theme=light');
  const demo = page.locator('.recipe-product-demo');
  // Test harness only: simulate embedding the public component in a narrow host.
  await demo.evaluate(element => { element.style.width = '320px'; });
  const context = (await page.locator('.recipe-product-demo-context').boundingBox())!;
  const result = (await page.locator('.recipe-product-demo-result').boundingBox())!;
  expect(result.y).toBeGreaterThanOrEqual(context.y + context.height);
  expect(await demo.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
});
