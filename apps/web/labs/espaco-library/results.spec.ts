import { expect, test, type Locator, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import type { ResultMode, ResultPreview } from './results-fixtures';

const evidence = fileURLToPath(new URL('./evidence/results/', import.meta.url));
const buyLabel = 'Comprar 1 crédito por R$ 5,90';
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
  expect(audit.blockedRequests, 'The result preview must not make external or mutating requests').toEqual([]);
  expect(audit.errors, 'No uncaught errors or console errors').toEqual([]);
});

async function openResult(page: Page, mode: ResultMode, preview: ResultPreview = 'default', theme: 'light' | 'dark' = 'light') {
  await page.goto(`/?view=${mode}-result&theme=${theme}&preview=${preview}`);
  const screen = page.getByRole('main').locator('.es-result');
  await expect(screen).toBeVisible();
  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(screen.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await page.evaluate(() => document.fonts.ready);
  return screen;
}

async function assertFits(page: Page, screen: Locator) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), 'No page-level horizontal overflow').toBe(true);
  const clipped = await screen.locator('h1,h2,h3,p,button,a.es-button,strong,.es-result-offer-price > span').evaluateAll(elements => elements
    .filter(element => element.getClientRects().length && !element.matches('.es-visually-hidden') && !element.closest('[aria-hidden="true"]'))
    .filter(element => element.scrollWidth > element.clientWidth + 1 && getComputedStyle(element).display !== 'inline')
    .map(element => ({ text: element.textContent, width: element.clientWidth, scroll: element.scrollWidth })));
  expect(clipped, 'Result copy and actions must wrap without clipping').toEqual([]);
}

async function assertLocalSearchPreview(page: Page, screen: Locator, label: string) {
  const resultURL = page.url();
  const proof = (await screen.locator('.es-result-score').textContent())!;
  const trigger = screen.getByRole('button', { name: label, exact: true });
  await trigger.focus();
  await trigger.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Buscar outra vaga · demonstração', exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(/não.*conectad/);
  await expect(dialog.getByRole('button', { name: buyLabel, exact: true })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page).toHaveURL(resultURL);
  await expect(screen.locator('.es-result-score')).toHaveText(proof);
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveCSS('outline-style', 'solid');
}

async function sampledContrast(screen: Locator) {
  const pairs = await screen.locator('h1,h2,h3,p,.es-button,.es-result-score-values strong,.es-result-score-values small,.es-result-score-delta,.es-result-offer-eyebrow,.es-result-offer-price > span,.es-result-offer li > span').evaluateAll(elements => {
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

test('eligible free analysis survives checkout cancellation, failure and one explicit mock purchase', async ({ page }) => {
  const screen = await openResult(page, 'analysis');
  const score = screen.locator('.es-result-score');
  const proof = (await score.textContent())!;
  const findings = await screen.locator('.es-result-findings').allTextContents();
  const originalURL = page.url();
  await screen.getByRole('tab', { name: 'Vanellope', exact: true }).click();
  const report = (await screen.getByRole('tabpanel').textContent())!;
  const buy = screen.getByRole('button', { name: buyLabel, exact: true });
  await expect(buy).toHaveAccessibleDescription(/R\$ 5,90.*compra única, sem assinatura.*Créditos não expiram/);
  await buy.click();
  let checkout = page.getByRole('dialog', { name: 'Confira sua compra · demonstração', exact: true });
  await expect(checkout.getByText('R$ 5,90', { exact: true })).toBeVisible();
  await expect(checkout.getByText('1 crédito · compra única, sem assinatura. Créditos não expiram.', { exact: true })).toBeVisible();
  await expect(checkout.getByRole('heading', { name: '1 crédito de demonstração disponível' })).toHaveCount(0);
  await checkout.getByRole('button', { name: 'Cancelar compra', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(buy).toBeFocused();
  await expect(buy).toBeVisible();
  await expect(score).toHaveText(proof);
  await expect(screen.getByRole('tabpanel')).toHaveText(report);
  await buy.click();
  checkout = page.getByRole('dialog');
  await checkout.getByRole('button', { name: 'Simular falha no pagamento', exact: true }).click();
  await expect(checkout.getByRole('alert')).toContainText('Nenhum valor foi cobrado');
  await expect(checkout.getByRole('heading', { name: '1 crédito de demonstração disponível' })).toHaveCount(0);
  await checkout.getByRole('button', { name: 'Simular pagamento de R$ 5,90', exact: true }).click();
  await expect(checkout).toHaveAccessibleName('Compra de demonstração concluída');
  expect(await checkout.evaluate(element => element.contains(document.activeElement))).toBe(true);
  await expect(checkout.getByRole('heading', { name: '1 crédito de demonstração disponível', exact: true })).toBeVisible();
  await expect(checkout.getByText('Recibo ilustrativo — sem validade fiscal', { exact: true })).toBeVisible();
  await expect(checkout.getByRole('button', { name: 'Simular pagamento de R$ 5,90', exact: true })).toHaveCount(0);
  await checkout.getByRole('button', { name: 'Voltar ao resultado', exact: true }).click();
  await expect(page.getByRole('main')).toBeFocused();
  await expect(page).toHaveURL(originalURL);
  await expect(score).toHaveText(proof);
  expect(await screen.locator('.es-result-findings').allTextContents()).toEqual(findings);
  await expect(screen.getByRole('tabpanel')).toHaveText(report);
  await expect(buy).toHaveCount(0);
  await expect(screen.getByText('1 crédito disponível · demonstração', { exact: true })).toBeVisible();
  await expect(screen.getByRole('link', { name: 'Usar 1 crédito · iniciar prévia', exact: true })).toHaveAttribute('href', '?view=optimization-loading&theme=light');
});

test('anonymous readers see free proof and unlock reports without buying credits', async ({ page }) => {
  const screen = await openResult(page, 'analysis', 'anonymous');
  await expect(screen.locator('.es-result-score-current strong')).toHaveText('62/100');
  await expect(screen.getByRole('heading', { name: 'Dê contexto às suas entregas', exact: true })).toBeVisible();
  await expect(screen.getByRole('tablist')).toHaveCount(0);
  await screen.getByRole('button', { name: 'Simular acesso aos relatórios grátis', exact: true }).click();
  const account = page.getByRole('dialog', { name: 'Guarde a análise na sua conta', exact: true });
  await expect(account).toContainText('Identificar-se não compra créditos');
  await expect(account.getByRole('textbox')).toHaveCount(0);
  await account.getByRole('button', { name: 'Simular identificação', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('main')).toBeFocused();
  const anya = screen.getByRole('tab', { name: 'Anya', exact: true });
  await expect(anya).toHaveAttribute('aria-selected', 'true');
  await anya.focus();
  await anya.press('ArrowRight');
  const vanellope = screen.getByRole('tab', { name: 'Vanellope', exact: true });
  await expect(vanellope).toBeFocused();
  await expect(vanellope).toHaveAttribute('aria-selected', 'true');
  await expect(screen.getByRole('tabpanel')).toContainText('a otimização não cria experiência');
  await expect(screen.getByRole('button', { name: buyLabel, exact: true })).toBeVisible();
  await expect(screen.getByText(/crédito disponível · demonstração/)).toHaveCount(0);
});

test('balance, existing work and poor or excellent fit choose appropriate non-purchase actions', async ({ page }) => {
  for (const preview of ['credits', 'existing', 'low-fit', 'excellent', 'balance-error'] as const) {
    const screen = await openResult(page, 'analysis', preview, 'dark');
    await expect(screen.getByRole('button', { name: buyLabel, exact: true })).toHaveCount(0);
    await expect(screen.locator('.es-result-offer-price').getByText('R$ 5,90', { exact: true })).toHaveCount(0);
    if (preview === 'credits') {
      await expect(screen.getByText('2 créditos disponíveis · demonstração', { exact: true })).toBeVisible();
      await expect(screen.getByRole('link', { name: 'Usar 1 crédito · iniciar prévia', exact: true })).toHaveAttribute('href', '?view=optimization-loading&theme=dark');
    } else if (preview === 'existing') {
      await screen.getByRole('link', { name: 'Abrir currículo otimizado', exact: true }).click();
      await expect(page).toHaveURL(/view=optimization-result&theme=dark/);
      await expect(page.getByRole('button', { name: 'Ver currículo · prévia', exact: true })).toBeVisible();
    } else if (preview === 'balance-error') {
      await expect(screen).toContainText('Isso não significa que seu saldo terminou.');
      await screen.getByRole('button', { name: 'Atualizar saldo de demonstração', exact: true }).click();
      await expect(page.getByRole('main')).toBeFocused();
      await expect(screen.getByText('2 créditos disponíveis · demonstração', { exact: true })).toBeVisible();
      await expect(screen.getByRole('button', { name: buyLabel, exact: true })).toHaveCount(0);
    } else {
      await expect(screen.locator('.es-result-score-current strong')).toHaveText(preview === 'low-fit' ? '28/100' : '96/100');
      await expect(screen.getByRole('tabpanel')).toContainText(preview === 'low-fit' ? 'não têm evidências' : 'Preserve a versão');
      await assertLocalSearchPreview(page, screen, 'Buscar outra vaga');
    }
  }
  const optimization = await openResult(page, 'optimization', 'credits', 'dark');
  await expect(optimization.getByRole('button', { name: buyLabel, exact: true })).toHaveCount(0);
  await assertLocalSearchPreview(page, optimization, 'Buscar a próxima vaga');
  await expect(optimization.getByText('2 créditos disponíveis · demonstração', { exact: true })).toBeVisible();
});

test('already-paid optimization keeps both document previews and recovery available at zero balance', async ({ page }) => {
  const screen = await openResult(page, 'optimization');
  await expect(screen.locator('.es-result-score-delta')).toHaveText('+24 pts');
  await expect(screen.getByText('Seu resultado atual já está pago. A compra é opcional, para a próxima vaga.', { exact: true })).toBeVisible();
  for (const label of ['Ver currículo · prévia', 'Ver carta', 'Revisar currículo'] as const) {
    await screen.getByRole('button', { name: label, exact: true }).click();
    const document = page.getByRole('dialog');
    await expect(document).toContainText('não existe arquivo real para baixar nem edição persistida');
    await expect(document.locator('.es-document-preview')).toBeVisible();
    await expect(document.getByRole('button', { name: buyLabel, exact: true })).toHaveCount(0);
    await document.getByRole('button', { name: 'Simular falha de entrega', exact: true }).click();
    await expect(document.getByRole('alert')).toContainText('nenhum crédito será usado');
    await expect(document.locator('.es-document-preview')).toBeVisible();
    await document.getByRole('button', { name: 'Tentar entrega novamente · prévia', exact: true }).click();
    await expect(document.getByRole('alert')).toHaveCount(0);
    await document.getByRole('button', { name: 'Voltar ao resultado', exact: true }).click();
    await expect(screen.getByRole('button', { name: label, exact: true })).toBeVisible();
    await expect(screen.getByText(/crédito disponível · demonstração/)).toHaveCount(0);
  }
  await expect(screen.getByRole('button', { name: buyLabel, exact: true })).toBeVisible();
});

test('missing, regression and partial evidence remain honest and recover without a new payment', async ({ page }) => {
  for (const mode of ['analysis', 'optimization'] as const) {
    const screen = await openResult(page, mode, 'missing');
    await expect(screen.locator('.es-result-score-current strong')).toHaveText('—/100');
    await expect(screen.locator('.es-result-score-delta')).toHaveCount(0);
    await expect(screen.getByRole('meter')).toHaveCount(0);
    await expect(screen.locator('.es-result-findings')).toHaveCount(0);
    await expect(screen.getByRole('button', { name: buyLabel, exact: true })).toHaveCount(0);
    await expect(screen.getByText(/· leitura indisponível$/, { exact: false })).toHaveCount(4);
    if (mode === 'optimization') {
      await screen.getByRole('button', { name: 'Ver currículo · prévia', exact: true }).click();
      await expect(page.getByRole('dialog').locator('.es-document-preview')).toBeVisible();
      await page.keyboard.press('Escape');
    } else await expect(screen.getByRole('tablist')).toHaveCount(0);
    await screen.getByRole('button', { name: 'Tentar carregar novamente', exact: true }).click();
    await expect(screen.locator('.es-result-score-current strong')).toHaveText(mode === 'analysis' ? '62/100' : '86/100');
    await expect(screen.getByRole('heading', { name: 'Os achados não chegaram', exact: true })).toHaveCount(0);
  }
  const regression = await openResult(page, 'optimization', 'regression');
  await expect(regression.locator('.es-result-score-previous strong')).toHaveText('86/100');
  await expect(regression.locator('.es-result-score-current strong')).toHaveText('62/100');
  await expect(regression.locator('.es-result-score-delta')).toHaveText('−24 pts');
  await expect(regression.locator('.es-result-score-delta')).toHaveAttribute('data-outcome', 'regression');
  await expect(regression.getByRole('button', { name: buyLabel, exact: true })).toHaveCount(0);
  await regression.getByRole('button', { name: 'Revisar currículo sem novo pagamento', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Revisão do currículo · demonstração', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  for (const mode of ['analysis', 'optimization'] as const) {
    const partial = await openResult(page, mode, 'partial');
    await expect(partial.getByText('Impacto · leitura indisponível', { exact: true })).toBeVisible();
    await expect(partial.getByRole('meter', { name: /Impacto/ })).toHaveCount(0);
    await expect(partial).toContainText('sem média ou diferença presumida');
  }
});

test('result dialogs are keyboard reachable, trap focus and restore it on Escape', async ({ page }) => {
  for (const mode of ['analysis', 'optimization'] as const) {
    const screen = await openResult(page, mode, 'default', 'dark');
    const trigger = screen.getByRole('button', { name: mode === 'analysis' ? buyLabel : 'Ver currículo · prévia', exact: true });
    await trigger.focus();
    await trigger.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    expect(await dialog.evaluate(element => element.matches(':modal')), 'Native dialog must enter the modal top layer').toBe(true);
    expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
    const focusable = dialog.locator('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]');
    await focusable.last().focus();
    await page.keyboard.press('Tab');
    await expect(focusable.first()).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(focusable.last()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveCSS('outline-style', 'solid');
  }
});

test('both themes reflow at desktop, tablet and narrow widths with readable contrast and 44px result actions', async ({ page }, info) => {
  const widths = info.project.name === 'desktop' ? [1440, 768] : [390, 320];
  for (const mode of ['analysis', 'optimization'] as const) for (const theme of ['light', 'dark'] as const) for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    const screen = await openResult(page, mode, 'default', theme);
    await expect(page.locator('.es-root')).toHaveAttribute('data-theme', theme);
    await assertFits(page, screen);
    for (const action of await screen.locator('.es-button').all()) {
      const bounds = (await action.boundingBox())!;
      // Ignore sub-pixel floating point noise from the entry transform (43.99997px).
      expect(Math.round(bounds.height * 100) / 100, await action.innerText()).toBeGreaterThanOrEqual(44);
      expect(Math.round(bounds.width * 100) / 100, await action.innerText()).toBeGreaterThanOrEqual(44);
    }
    const contrast = await sampledContrast(screen);
    await info.attach(`${mode}-${theme}-${width}-contrast`, { body: JSON.stringify(contrast), contentType: 'application/json' });
    await page.screenshot({ path: evidence + `${mode}-${theme}-${width}.png`, fullPage: true, animations: 'disabled' });
  }
});

test('entry motion is optional and content remains usable with reduced motion and a 200% zoom proxy', async ({ page }, info) => {
  let screen = await openResult(page, 'analysis');
  await expect(screen.locator('.es-result-overview')).toHaveCSS('animation-name', 'es-result-enter');
  await expect(screen.locator('.es-result-overview')).toHaveCSS('animation-duration', '0.22s');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const mode of ['analysis', 'optimization'] as const) for (const theme of ['light', 'dark'] as const) {
    await page.setViewportSize({ width: 640, height: 1000 });
    screen = await openResult(page, mode, 'default', theme);
    // Harness-only approximation. Native browser zoom and physical assistive technology remain unverified.
    await page.evaluate(() => { document.documentElement.style.zoom = '2'; });
    await expect(screen.locator('.es-result-overview')).toHaveCSS('animation-name', 'none');
    expect(await screen.evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length)).toBe(0);
    await assertFits(page, screen);
    const trigger = screen.getByRole('button', { name: mode === 'analysis' ? buyLabel : 'Ver currículo · prévia', exact: true });
    await trigger.focus();
    await trigger.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await assertFits(page, dialog);
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    await page.screenshot({ path: evidence + `${info.project.name}-${mode}-${theme}-reduced-zoom-200.png`, fullPage: true, animations: 'disabled' });
    await page.evaluate(() => { document.documentElement.style.zoom = ''; });
  }
});
