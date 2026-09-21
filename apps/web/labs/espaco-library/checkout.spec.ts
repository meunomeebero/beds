import { expect, test, type Locator, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { checkoutCredits, checkoutExample, checkoutMoney, checkoutStorageKey, checkoutTotalCents, type CheckoutRecord } from './checkout-fixtures';

const evidence = fileURLToPath(new URL('./evidence/checkout/', import.meta.url));
const audits = new WeakMap<Page, { errors: string[]; blockedRequests: string[] }>();

test.beforeEach(async ({ page, baseURL }) => {
  const audit = { errors: [] as string[], blockedRequests: [] as string[] };
  audits.set(page, audit);
  page.on('pageerror', error => audit.errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') audit.errors.push(message.text()); });
  const origin = new URL(baseURL!).origin;
  await page.route('**/*', route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin !== origin || !['GET', 'HEAD'].includes(request.method())) {
      audit.blockedRequests.push(`${request.method()} ${url.origin}${url.pathname}`);
      return route.abort('blockedbyclient');
    }
    return route.continue();
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
});

test.afterEach(async ({ page }, info) => {
  const audit = audits.get(page)!;
  await info.attach('console-and-network', { body: JSON.stringify(audit), contentType: 'application/json' });
  expect(audit.blockedRequests, 'The checkout preview must not make external or mutating requests').toEqual([]);
  expect(audit.errors, 'No uncaught errors or console errors').toEqual([]);
});

async function openCheckout(page: Page, options: { theme?: 'light' | 'dark'; query?: string } = {}) {
  await page.goto(`/?view=checkout&theme=${options.theme ?? 'light'}${options.query ? `&${options.query}` : ''}`);
  const screen = page.locator('.recipe-checkout');
  await expect(screen).toBeVisible();
  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(screen.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await page.evaluate(() => document.fonts.ready);
  return screen;
}

async function assertFits(page: Page, screen: Locator) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), 'No page-level horizontal overflow').toBe(true);
  const clipped = await screen.locator('h1,h2,h3,p,button,a,dt,dd,label').evaluateAll(elements => elements
    .filter(element => element.getClientRects().length && !element.matches('.es-visually-hidden') && !element.closest('[aria-hidden="true"]'))
    .filter(element => element.scrollWidth > element.clientWidth + 1 && getComputedStyle(element).display !== 'inline')
    .map(element => ({ text: element.textContent?.slice(0, 100), width: element.clientWidth, scroll: element.scrollWidth })));
  expect(clipped, 'Checkout copy and controls must wrap without clipping').toEqual([]);
}

async function assertTouchTargets(screen: Locator) {
  // The recipe uses each component's target contract, not a private CSS override.
  const minimum = await screen.evaluate(() => matchMedia('(pointer:coarse)').matches ? 44 : 32);
  for (const target of await screen.locator('button:visible,a:visible,.es-radio-option:visible').all()) {
    const bounds = (await target.boundingBox())!;
    const label = (await target.innerText()).slice(0, 80);
    // Ignore browser sub-pixel noise: CSS 44px can measure as 43.99997px.
    expect(Math.round(bounds.width * 100) / 100, `${label}: width`).toBeGreaterThanOrEqual(minimum);
    expect(Math.round(bounds.height * 100) / 100, `${label}: height`).toBeGreaterThanOrEqual(minimum);
  }
  for (const input of await screen.locator('input:not([type=radio]):visible').all()) {
    expect(Number.parseFloat(await input.evaluate(element => getComputedStyle(element).fontSize)), 'Input text avoids mobile zoom').toBeGreaterThanOrEqual(16);
    expect((await input.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
}

async function sampledContrast(screen: Locator) {
  const pairs = await screen.locator('h1,h2,h3,p,button:not(:disabled),a,input:not([type=radio]),legend,.es-field > label,.es-radio-option > span:last-child,.es-notice strong,.es-code-label,.recipe-payment-description,dt,dd,code').evaluateAll(elements => {
    const channels = (value: string) => value.match(/[\d.]+/g)!.map(Number);
    const over = (foreground: number[], background: number[]) => background.map((value, index) => value * (1 - (foreground[3] ?? 1)) + foreground[index] * (foreground[3] ?? 1));
    const luminance = (color: number[]) => color.slice(0, 3).map(value => value / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
    return elements.filter(element => element.getClientRects().length && !element.matches('.es-visually-hidden') && !element.closest('[aria-hidden="true"]')).map(element => {
      const layers: number[][] = [];
      let node: Element | null = element;
      while (node) { layers.unshift(channels(getComputedStyle(node).backgroundColor)); node = node.parentElement; }
      const background = layers.reduce((base, layer) => over(layer, base), [255, 255, 255]);
      const foreground = over(channels(getComputedStyle(element).color), background);
      const values = [luminance(foreground), luminance(background)];
      return { text: element.textContent?.slice(0, 80), ratio: (Math.max(...values) + .05) / (Math.min(...values) + .05) };
    });
  });
  for (const pair of pairs) expect(pair.ratio, JSON.stringify(pair)).toBeGreaterThanOrEqual(4.5);
  return pairs;
}

async function expectNativeModal(page: Page, dialog: Locator, trigger: Locator) {
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(element => element.matches(':modal')), 'Dialog enters the native modal top layer').toBe(true);
  expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
  const controls = dialog.locator('button:not([disabled]),a[href],input:not([disabled]),[tabindex="0"]');
  await controls.last().focus();
  await page.keyboard.press('Tab');
  await expect(controls.first()).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(controls.last()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveCSS('outline-style', 'solid');
}

const priceFor = (quantity: number) => checkoutMoney(checkoutTotalCents(quantity));
const submitFor = (screen: Locator, quantity = 1, method: 'pix' | 'card' = 'pix') => screen.getByRole('button', { name: method === 'pix' ? `Gerar Pix de ${priceFor(quantity)}` : `Continuar com cartão — ${priceFor(quantity)}`, exact: true });

async function createPending(page: Page, screen: Locator, quantity = 1, method: 'pix' | 'card' = 'pix') {
  await submitFor(screen, quantity, method).click();
  await expect(screen.getByRole('status').filter({ hasText: 'Aguardando confirmação do pagamento' })).toBeVisible();
  await expect(page.getByRole('main')).toBeFocused();
  await expect(screen.getByRole('heading', { name: 'Pagamento confirmado · demonstração', exact: true })).toHaveCount(0);
}

async function revealControls(screen: Locator) {
  const show = screen.getByRole('button', { name: 'Mostrar controles de demonstração', exact: true });
  if (await show.count()) await show.click();
  await expect(screen.getByRole('button', { name: 'Ocultar controles de demonstração', exact: true })).toHaveAttribute('aria-expanded', 'true');
}

async function readRecord(page: Page, destination: 'analysis' | 'optimization' | 'components' = 'components') {
  return page.evaluate(key => {
    const value = sessionStorage.getItem(key);
    return value ? JSON.parse(value) as CheckoutRecord : null;
  }, checkoutStorageKey(destination));
}

async function clearDemoOrders(page: Page) {
  await page.evaluate(keys => keys.forEach(key => sessionStorage.removeItem(key)), ['analysis', 'optimization', 'components'].map(value => checkoutStorageKey(value as 'analysis' | 'optimization' | 'components')));
}

test('catalog entry, preset prices and custom quantities use the same validated checkout contract', async ({ page }) => {
  await page.goto('/?view=components&theme=light');
  if (page.viewportSize()!.width < 768) await page.getByRole('button', { name: 'Navigation', exact: true }).click();
  const entry = page.getByRole('link', { name: 'Checkout', exact: true });
  await entry.focus();
  await entry.press('Enter');
  await expect(page).toHaveURL(/view=checkout/);
  const screen = page.locator('.recipe-checkout');
  await expect(screen).toBeVisible();
  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  const choices = screen.getByRole('group', { name: 'Quantidade de créditos', exact: true });
  for (const quantity of [1, 10, 50]) {
    await choices.getByRole('radio', { name: `${checkoutCredits(quantity)} — ${priceFor(quantity)}`, exact: true }).check();
    await expect(screen.locator('.recipe-order-total dd')).toHaveText(priceFor(quantity));
    await expect(submitFor(screen, quantity)).toBeVisible();
  }
  await choices.getByRole('radio', { name: 'Outra quantidade', exact: true }).check();
  const custom = screen.getByRole('textbox', { name: 'Quantidade de créditos personalizada', exact: true });
  for (const quantity of [1, 2, 37, 100]) {
    await custom.fill(String(quantity));
    await expect(screen.locator('.recipe-order-total dd')).toHaveText(priceFor(quantity));
    await expect(submitFor(screen, quantity)).toBeVisible();
  }
  for (const invalid of ['', '0', '101', '1.5', '-1', 'abc']) {
    await custom.fill(invalid);
    await expect(screen.locator('.recipe-order-total dd')).toHaveText('—');
    await screen.getByRole('button', { name: 'Gerar Pix', exact: true }).click();
    await expect(custom).toBeFocused();
    await expect(custom).toHaveAttribute('aria-invalid', 'true');
    await expect(custom).toHaveAccessibleDescription(/Escolha uma quantidade inteira de 1 a 100/);
    expect(await readRecord(page)).toBeNull();
  }
  await openCheckout(page, { query: 'quantity=101&paid=true' });
  await expect(custom).toHaveAttribute('aria-invalid', 'true');
  await expect(screen.locator('.recipe-order-total dd')).toHaveText('—');
  await expect(screen.getByRole('heading', { name: 'Pagamento confirmado · demonstração', exact: true })).toHaveCount(0);
});

test('Pix validates fictional CPF while card collects no personal or card fields and creation retries preserve selection', async ({ page }) => {
  const screen = await openCheckout(page, { theme: 'dark', query: 'quantity=10&preview=create-error' });
  const cpf = screen.getByRole('textbox', { name: 'CPF de demonstração', exact: true });
  await expect(cpf).toHaveValue(checkoutExample.cpf);
  await expect(cpf).toHaveAccessibleDescription(/Não informe seu documento real.*não é salvo/);
  await cpf.fill('111.111.111-11');
  await submitFor(screen, 10).click();
  await expect(cpf).toBeFocused();
  await expect(cpf).toHaveAttribute('aria-invalid', 'true');
  await expect(cpf).toHaveAccessibleDescription(/11 dígitos de demonstração/);
  expect(await readRecord(page)).toBeNull();
  await screen.getByRole('radio', { name: 'Cartão de crédito', exact: true }).check();
  await expect(screen.getByRole('textbox')).toHaveCount(0);
  await expect(screen).toContainText('os dados do cartão são preenchidos no Asaas');
  await submitFor(screen, 10, 'card').click();
  await expect(screen.getByRole('alert')).toContainText('nenhum valor foi cobrado e sua seleção foi mantida');
  await expect(screen.getByRole('radio', { name: 'Cartão de crédito', exact: true })).toBeChecked();
  await expect(screen.getByRole('radio', { name: `${checkoutCredits(10)} — ${priceFor(10)}`, exact: true })).toBeChecked();
  await expect(screen.locator('.recipe-order-total dd')).toHaveText(priceFor(10));
  expect(await readRecord(page)).toBeNull();
  await createPending(page, screen, 10, 'card');
  await expect(screen.getByRole('textbox')).toHaveCount(0);
  await expect(screen).toContainText('não coleta número, validade, CVV ou CPF');
  expect(await readRecord(page)).toMatchObject({ quantity: 10, method: 'card', state: 'pending' });
});

test('pending survives reload without CPF and neither URL flags nor elapsed time confirms payment', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-16T12:00:00Z') });
  let screen = await openCheckout(page, { query: 'quantity=1&paid=true&status=CONFIRMED&return=analysis' });
  await expect(submitFor(screen)).toBeVisible();
  await createPending(page, screen);
  const original = (await readRecord(page, 'analysis'))!;
  expect(Object.keys(original).sort()).toEqual(['createdAt', 'method', 'order', 'quantity', 'state', 'version']);
  const stored = await page.evaluate(() => JSON.stringify({ session: { ...sessionStorage }, local: { ...localStorage } }));
  expect(stored).not.toContain(checkoutExample.cpf);
  expect(stored).not.toContain(checkoutExample.cpf.replace(/\D/g, ''));
  await page.evaluate(() => {
    Object.defineProperty(navigator.clipboard, 'writeText', { configurable: true, value: async (value: string) => { document.documentElement.dataset.copiedDemo = value; } });
  });
  await screen.getByRole('button', { name: 'Copiar código ilustrativo', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-copied-demo', checkoutExample.code);
  await expect(screen.getByRole('status').filter({ hasText: 'Código ilustrativo copiado. Não use no banco.' })).toBeVisible();
  await page.clock.fastForward(20 * 60 * 1000);
  expect(await readRecord(page, 'analysis')).toEqual(original);
  await expect(screen.getByRole('heading', { name: 'Pagamento confirmado · demonstração', exact: true })).toHaveCount(0);
  await page.reload();
  screen = page.locator('.recipe-checkout');
  await expect(screen.getByRole('status').filter({ hasText: 'Aguardando confirmação do pagamento' })).toBeVisible();
  expect(await readRecord(page, 'analysis')).toEqual(original);
  await expect(screen.getByText(`Pedido ${original.order}.`, { exact: false })).toBeVisible();
  await expect(screen.getByRole('textbox')).toHaveCount(0);
  await expect(screen.getByRole('button', { name: /^Gerar Pix/ })).toHaveCount(0);
});

test('pending delay and lookup errors recover the same order and ended payment requires an explicit restart', async ({ page }) => {
  const screen = await openCheckout(page, { query: 'quantity=50' });
  await createPending(page, screen, 50);
  const original = (await readRecord(page))!;
  await revealControls(screen);
  for (const [simulation, state, text] of [
    ['Simular espera prolongada', 'slow', 'A espera não significa que o pagamento expirou'],
    ['Simular falha na consulta', 'status-error', 'Se já pagou, não pague novamente'],
  ] as const) {
    await screen.getByRole('button', { name: simulation, exact: true }).click();
    await expect(page.getByRole('main')).toBeFocused();
    await expect(screen).toContainText(text);
    expect(await readRecord(page)).toMatchObject({ order: original.order, state });
    await screen.getByRole('button', { name: 'Consultar pagamento novamente', exact: true }).click();
    expect(await readRecord(page)).toEqual(original);
    await expect(screen.getByRole('status').filter({ hasText: 'Aguardando confirmação do pagamento' })).toBeVisible();
    await expect(screen.locator('.recipe-order-total dd')).toHaveText(priceFor(50));
  }
  await screen.getByRole('button', { name: 'Simular pagamento encerrado', exact: true }).click();
  await expect(screen.getByRole('heading', { name: 'Este pagamento foi encerrado', exact: true })).toBeVisible();
  await expect(screen).toContainText('não pague outra vez');
  await expect(screen.getByRole('button', { name: 'Copiar código ilustrativo', exact: true })).toHaveCount(0);
  await expect(screen.getByRole('heading', { name: 'Pagamento confirmado · demonstração', exact: true })).toHaveCount(0);
  await screen.getByRole('button', { name: 'Voltar às formas de pagamento', exact: true }).click();
  await expect(page.getByRole('main')).toBeFocused();
  expect(await readRecord(page)).toBeNull();
  await expect(submitFor(screen, 50)).toBeVisible();
  await expect(screen.locator('.recipe-order-total dd')).toHaveText(priceFor(50));
});

test('only explicit confirmation shows a truthful persistent receipt and context return does not grant real credits', async ({ page }) => {
  const screen = await openCheckout(page, { theme: 'dark', query: 'quantity=10&return=analysis' });
  await createPending(page, screen, 10);
  const original = (await readRecord(page, 'analysis'))!;
  await revealControls(screen);
  await screen.getByRole('button', { name: 'Simular confirmação do pagamento', exact: true }).click();
  await expect(page.getByRole('main')).toBeFocused();
  await expect(screen.getByRole('heading', { level: 1 })).toBeInViewport();
  await expect(screen.getByRole('heading', { name: 'Pagamento confirmado · demonstração', exact: true })).toBeVisible();
  await expect(screen.getByRole('heading', { name: 'Pagamento confirmado · demonstração', exact: true })).toBeInViewport();
  await expect(screen.getByText('Recibo DEMO — sem validade fiscal', { exact: true })).toBeVisible();
  await expect(screen).toContainText('Nenhum saldo real foi alterado');
  await expect(screen).toContainText(priceFor(10));
  expect(await readRecord(page, 'analysis')).toEqual({ ...original, state: 'confirmed' });
  await expect(screen.getByRole('button', { name: /^Gerar Pix|Simular confirmação/ })).toHaveCount(0);
  await expect(screen.getByRole('button', { name: /nota fiscal/i })).toHaveCount(0);
  await page.reload();
  await expect(screen.getByRole('heading', { name: 'Pagamento confirmado · demonstração', exact: true })).toBeVisible();
  await expect(screen.locator('.recipe-payment-confirmation')).not.toHaveAttribute('data-animate');
  expect(await readRecord(page, 'analysis')).toEqual({ ...original, state: 'confirmed' });
  const back = screen.getByRole('link', { name: 'Voltar ao resultado da análise', exact: true }).last();
  await expect(back).toHaveAttribute('href', '?view=analysis-result&theme=dark');
  await back.click();
  await expect(page).toHaveURL(/view=analysis-result&theme=dark/);
  await expect(page.getByRole('button', { name: 'Comprar 1 crédito por R$ 5,90', exact: true })).toBeVisible();
  await expect(page.getByText('10 créditos disponíveis · demonstração', { exact: true })).toHaveCount(0);
});

test('keyboard payment and informational dialogs trap focus, Escape preserves order and explicit change restores the form', async ({ page }) => {
  const screen = await openCheckout(page, { theme: 'dark', query: 'quantity=10' });
  for (const [label, title] of [['Termos', 'Termos · prévia de interface'], ['Privacidade', 'Privacidade · prévia de interface'], ['Ajuda com o pagamento', 'Ajuda com o pagamento']] as const) {
    const trigger = screen.getByRole('button', { name: label, exact: true });
    await trigger.focus();
    await trigger.press('Enter');
    const dialog = page.getByRole('dialog', { name: title, exact: true });
    await assertTouchTargets(dialog);
    await expectNativeModal(page, dialog, trigger);
  }
  const pix = screen.getByRole('radio', { name: 'Pix', exact: true });
  await pix.focus();
  await pix.press('ArrowRight');
  await expect(screen.getByRole('radio', { name: 'Cartão de crédito', exact: true })).toBeChecked();
  await page.keyboard.press('ArrowLeft');
  await expect(pix).toBeChecked();
  await createPending(page, screen, 10);
  const original = await readRecord(page);
  const change = screen.getByRole('button', { name: 'Trocar forma de pagamento', exact: true });
  await change.focus();
  await change.press('Enter');
  await expectNativeModal(page, page.getByRole('dialog', { name: 'Conferiu o pagamento anterior?', exact: true }), change);
  expect(await readRecord(page)).toEqual(original);
  await change.click();
  await page.getByRole('dialog').getByRole('button', { name: 'Não paguei · escolher outra forma', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('main')).toBeFocused();
  await expect(submitFor(screen, 10)).toBeVisible();
  expect(await readRecord(page)).toBeNull();
});

test('light and dark checkout, pending and receipt reflow with readable text and adaptive control targets', async ({ page }, info) => {
  const widths = info.project.name === 'desktop' ? [1440, 768] : [390, 320];
  await openCheckout(page);
  for (const theme of ['light', 'dark'] as const) for (const width of widths) {
    await clearDemoOrders(page);
    await page.setViewportSize({ width, height: 1000 });
    const screen = await openCheckout(page, { theme });
    await expect(page.locator('.es-root')).toHaveAttribute('data-theme', theme);
    for (const state of ['form', 'pending', 'confirmed'] as const) {
      if (state === 'pending') await createPending(page, screen);
      if (state === 'confirmed') {
        await revealControls(screen);
        await screen.getByRole('button', { name: 'Simular confirmação do pagamento', exact: true }).click();
        await expect(screen.getByRole('heading', { name: 'Pagamento confirmado · demonstração', exact: true })).toBeVisible();
      }
      await assertFits(page, screen);
      await assertTouchTargets(screen);
      const contrast = await sampledContrast(screen);
      await info.attach(`${theme}-${width}-${state}-contrast`, { body: JSON.stringify(contrast), contentType: 'application/json' });
      await page.screenshot({ path: evidence + `${theme}-${width}-${state}.png`, fullPage: true, animations: 'disabled' });
    }
  }
});

test('reduced motion, forced colors and a 200% zoom proxy preserve checkout and payment recovery controls', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openCheckout(page);
  for (const theme of ['light', 'dark'] as const) {
    await clearDemoOrders(page);
    await page.setViewportSize({ width: 640, height: 1000 });
    const screen = await openCheckout(page, { theme });
    // Harness-only approximation; this is not native browser zoom or a physical-device check.
    await page.evaluate(() => { document.documentElement.style.zoom = '2'; });
    await assertFits(page, screen);
    const radio = screen.getByRole('radio', { name: 'Pix', exact: true });
    await page.emulateMedia({ forcedColors: 'active' });
    await radio.focus();
    const option = screen.locator('.es-radio-option').filter({ has: page.getByRole('radio', { name: 'Pix', exact: true }) });
    await expect(option.locator('.es-radio-indicator')).toHaveCSS('outline-style', 'solid');
    await expect(option.locator('.es-radio-indicator')).not.toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
    await radio.press('ArrowRight');
    await expect(screen.getByRole('radio', { name: 'Cartão de crédito', exact: true })).toBeChecked();
    await page.keyboard.press('ArrowLeft');
    await page.emulateMedia({ forcedColors: 'none' });
    await createPending(page, screen);
    await assertFits(page, screen);
    await revealControls(screen);
    await screen.getByRole('button', { name: 'Simular confirmação do pagamento', exact: true }).click();
    const confirmation = screen.locator('.recipe-payment-confirmation');
    await expect(confirmation).toBeVisible();
    expect(await confirmation.evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length), 'Reduced motion leaves the receipt static').toBe(0);
    await assertFits(page, screen);
    await page.screenshot({ path: evidence + `${info.project.name}-${theme}-reduced-zoom-200.png`, fullPage: true, animations: 'disabled' });
    await page.evaluate(() => { document.documentElement.style.zoom = ''; });
  }
});
