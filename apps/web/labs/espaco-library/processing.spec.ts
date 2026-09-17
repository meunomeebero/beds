import { expect, test, type Locator, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { processingFixtures, type ProcessingDemoKind } from './processing-fixtures';

const evidence = fileURLToPath(new URL('./evidence/processing/', import.meta.url));
const flows = {
  analysis: { view: 'analysis-loading', link: 'Análise em andamento', entry: 'Analisar um currículo', start: 'Iniciar análise de demonstração', steps: 'Etapas da análise' },
  optimization: { view: 'optimization-loading', link: 'Otimização em andamento', entry: 'Otimizar um currículo', start: 'Iniciar otimização de demonstração', steps: 'Etapas da otimização' },
} as const;
const kinds: ProcessingDemoKind[] = ['analysis', 'optimization'];
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
  await page.clock.install({ time: new Date('2026-09-16T12:00:00Z') });
});

test.afterEach(async ({ page }, info) => {
  const audit = audits.get(page)!;
  await info.attach('console-and-network', { body: JSON.stringify(audit), contentType: 'application/json' });
  expect(audit.blockedRequests, 'The synthetic flow must not make external or mutating requests').toEqual([]);
  expect(audit.errors, 'No uncaught errors or console errors').toEqual([]);
});

async function freezeBeforeStart(page: Page) {
  // Let initial module loading finish before freezing, then use runFor only.
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
}

async function start(page: Page, kind: ProcessingDemoKind, options: { theme?: 'light' | 'dark'; long?: boolean } = {}) {
  const flow = flows[kind];
  await page.goto(`/?view=${flow.view}&theme=${options.theme ?? 'light'}${options.long ? '&preview=long' : ''}`);
  await expect(page.getByRole('heading', { name: flow.entry, exact: true })).toBeVisible();
  await freezeBeforeStart(page);
  const trigger = page.getByRole('button', { name: flow.start, exact: true });
  await trigger.focus();
  await trigger.press('Enter');
  await expect(page.getByRole('main').locator('.es-processing')).toBeVisible();
  return page.getByRole('main').locator('.es-processing');
}

function master(screen: Locator) {
  return screen.getByRole('progressbar', { name: 'Progresso estimado', exact: true });
}

async function masterValue(screen: Locator) {
  return Number(await master(screen).getAttribute('aria-valuenow'));
}

async function assertFits(page: Page, screen: Locator) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  const clipped = await screen.locator('h1,h2,h3,p,button,summary').evaluateAll(elements => elements
    .filter(element => element.getClientRects().length && !element.matches('.es-visually-hidden') && !element.closest('[aria-hidden="true"]'))
    .filter(element => element.scrollWidth > element.clientWidth + 1 && getComputedStyle(element).display !== 'inline')
    .map(element => ({ text: element.textContent, width: element.clientWidth, scroll: element.scrollWidth })));
  expect(clipped).toEqual([]);
}

async function measureContrast(screen: Locator) {
  const pairs = await screen.locator('h1,h2,h3,p,button,summary,.es-processing-step-heading > span,.es-processing-progress-label strong').evaluateAll(elements => {
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
      return { text: element.textContent?.slice(0, 70), ratio: (Math.max(...values) + .05) / (Math.min(...values) + .05) };
    });
  });
  for (const pair of pairs) expect(pair.ratio, JSON.stringify(pair)).toBeGreaterThanOrEqual(4.5);
  return pairs;
}

test('real catalog entry and start controls expose the processing flow and optional details', async ({ page }) => {
  for (const kind of kinds) {
    const flow = flows[kind];
    await page.goto('/?view=components&theme=light');
    if (page.viewportSize()!.width < 768) await page.getByRole('button', { name: 'Navigation', exact: true }).click();
    const link = page.getByRole('link', { name: flow.link, exact: true });
    await link.focus();
    await link.press('Enter');
    await expect(page).toHaveURL(new RegExp(`view=${flow.view}`));
    await expect(page.getByRole('heading', { name: flow.entry, exact: true })).toBeVisible();
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await freezeBeforeStart(page);
    const trigger = page.getByRole('button', { name: flow.start, exact: true });
    await trigger.focus();
    await trigger.press('Enter');
    const screen = page.getByRole('main').locator('.es-processing');
    await expect(screen).toHaveAttribute('data-state', 'running');
    await expect(screen.getByRole('heading', { level: 1 })).toHaveText(processingFixtures[kind].title);
    await expect(screen.getByRole('list', { name: flow.steps, exact: true }).getByRole('listitem')).toHaveCount(5);
    await expect(master(screen)).toHaveAttribute('aria-valuemin', '0');
    await expect(master(screen)).toHaveAttribute('aria-valuemax', '100');
    expect(await masterValue(screen)).toBeLessThan(100);
    await expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');

    for (const selector of ['.es-processing-details', '.es-processing-transcript']) {
      const disclosure = screen.locator(selector);
      const summary = disclosure.locator('summary');
      await expect(disclosure).not.toHaveAttribute('open', '');
      await summary.focus();
      await summary.press('Enter');
      await expect(disclosure).toHaveAttribute('open', '');
      await expect(summary).toBeFocused();
      await expect(summary).toHaveCSS('outline-style', 'solid');
      await summary.press('Space');
      await expect(disclosure).not.toHaveAttribute('open', '');
    }
  }
});

test('90s and 75s presentations preserve five stage boundaries and wait below completion', async ({ page }, info) => {
  for (const kind of kinds) {
    const fixture = processingFixtures[kind];
    const screen = await start(page, kind);
    const steps = screen.getByRole('list', { name: flows[kind].steps, exact: true }).getByRole('listitem');
    const phaseDuration = fixture.durationSeconds * 1000 / 5;
    let elapsed = 0;
    const runTo = async (time: number) => { await page.clock.runFor(time - elapsed); elapsed = time; };

    for (let index = 0; index < 5; index++) {
      if (index > 0) {
        await runTo(index * phaseDuration - 250);
        await expect(steps.nth(index)).toHaveAttribute('data-state', 'pending');
        await expect(steps.nth(index).getByRole('progressbar')).toHaveAttribute('value', '0');
      }
      await runTo(index * phaseDuration + 500);
      await expect(steps.nth(index)).toHaveAttribute('data-state', 'active');
      await expect(steps.nth(index)).toHaveAttribute('aria-current', 'step');
      expect(Number(await steps.nth(index).getByRole('progressbar').getAttribute('value'))).toBeGreaterThan(0);
      await runTo(index * phaseDuration + 10_250);
      await expect(steps.nth(index).getByRole('progressbar')).toHaveAttribute('value', '100');
      expect(await masterValue(screen)).toBeLessThan(100);
    }

    await runTo(fixture.durationSeconds * 1000 + 500);
    await expect(screen).toHaveAttribute('data-state', 'waiting');
    await expect(master(screen)).toHaveAttribute('aria-valuenow', '95');
    await expect(screen.locator('.es-processing-story-copy h2')).toHaveText(fixture.chapters.at(-1)!.title);
    const finalPresentation = await steps.allTextContents();
    await page.clock.runFor(30_000);
    await expect(screen).toHaveAttribute('data-state', 'waiting');
    await expect(master(screen)).toHaveAttribute('aria-valuenow', '95');
    expect(await steps.allTextContents()).toEqual(finalPresentation);
    await expect(page.getByRole('heading', { name: fixture.resultTitle, exact: true })).toHaveCount(0);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await screen.screenshot({ path: evidence + `${info.project.name}-${kind}-waiting.png`, animations: 'disabled' });
  }
});

test('pause freezes phases and narration while estimated progress keeps advancing', async ({ page }) => {
  for (const kind of kinds) {
    const screen = await start(page, kind, { theme: 'dark' });
    await page.clock.runFor(2500);
    const pause = screen.getByRole('button', { name: 'Pausar apresentação', exact: true });
    await pause.focus();
    await pause.press('Enter');
    const resume = screen.getByRole('button', { name: 'Retomar apresentação', exact: true });
    await expect(resume).toBeFocused();
    await expect(screen).toHaveAttribute('data-motion-paused', 'true');
    const stages = screen.locator('.es-processing-steps');
    const snapshot = await stages.innerHTML();
    const chapter = await screen.locator('.es-processing-story-copy').innerText();
    const before = await masterValue(screen);
    await page.clock.runFor(20_000);
    expect(await stages.innerHTML()).toBe(snapshot);
    expect(await screen.locator('.es-processing-story-copy').innerText()).toBe(chapter);
    expect(await masterValue(screen)).toBeGreaterThan(before);
    await resume.press('Enter');
    await page.clock.runFor(10_000);
    expect(await stages.innerHTML()).not.toBe(snapshot);
    await expect(screen.locator('.es-processing-story-copy h2')).toHaveText(processingFixtures[kind].chapters[1].title);
  }
});

test('only explicit completion reveals success and explicit result navigation preserves re-entry', async ({ page }, info) => {
  for (const kind of kinds) {
    const fixture = processingFixtures[kind];
    const screen = await start(page, kind, { theme: 'dark' });
    await page.clock.runFor(2000);
    const beforeURL = page.url();
    await page.getByRole('button', { name: 'Simular conclusão', exact: true }).click();
    await expect(screen).toHaveAttribute('data-state', 'success');
    await expect(screen.getByRole('heading', { level: 1 })).toHaveText(fixture.resultTitle);
    await expect(master(screen)).toHaveAttribute('aria-valuenow', '100');
    await expect(page).toHaveURL(beforeURL);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    const result = screen.getByRole('button', { name: 'Ver resultado de demonstração', exact: true });
    await screen.screenshot({ path: evidence + `${info.project.name}-${kind}-success.png`, animations: 'disabled' });
    await result.focus();
    await result.press('Enter');
    await expect(page).toHaveURL(new RegExp(`view=${kind}-result&theme=dark`));
    await expect(page.locator('.es-result')).toBeVisible();
    await page.goto(beforeURL);
    await expect(page.getByRole('heading', { name: flows[kind].entry, exact: true })).toBeVisible();
    await expect(page.locator('.es-processing')).toHaveCount(0);
    await page.getByRole('button', { name: flows[kind].start, exact: true }).click();
    await expect(screen).toHaveAttribute('data-state', 'running');
    expect(await masterValue(screen)).toBeLessThan(20);
    await expect(screen.locator('.es-processing-story-copy h2')).toHaveText(fixture.chapters[0].title);
    await expect(screen.getByRole('button', { name: 'Ver resultado de demonstração', exact: true })).toHaveCount(0);
  }
});

test('extended wait, failure, retry and manual review offer distinct recovery paths', async ({ page }, info) => {
  for (const kind of kinds) {
    const screen = await start(page, kind);
    await page.clock.runFor(22_000);
    await page.getByRole('button', { name: 'Simular espera prolongada', exact: true }).click();
    await expect(screen).toHaveAttribute('data-state', 'waiting');
    await expect(screen.locator('.es-processing-message')).toBeVisible();
    expect(await masterValue(screen)).toBeLessThan(100);
    await page.getByRole('button', { name: 'Simular falha', exact: true }).click();
    await expect(screen).toHaveAttribute('data-state', 'error');
    await expect(screen.getByRole('alert')).not.toBeEmpty();
    await expect(screen.getByRole('button', { name: 'Tentar novamente', exact: true })).toBeVisible();
    await screen.screenshot({ path: evidence + `${info.project.name}-${kind}-error.png`, animations: 'disabled' });
    const retry = screen.getByRole('button', { name: 'Tentar novamente', exact: true });
    await retry.focus();
    await retry.press('Enter');
    await expect(screen).toHaveAttribute('data-state', 'running');
    expect(await masterValue(screen)).toBeLessThan(20);
    await expect(screen.locator('.es-processing-story-copy h2')).toHaveText(processingFixtures[kind].chapters[0].title);
    await expect(screen.getByRole('alert')).toBeEmpty();
    await page.getByRole('button', { name: 'Simular revisão manual', exact: true }).click();
    await expect(screen).toHaveAttribute('data-state', 'error');
    await expect(screen.getByRole('alert')).not.toBeEmpty();
    await expect(screen.getByRole('button', { name: 'Tentar novamente', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Voltar à prévia', exact: true })).toBeVisible();
    await screen.screenshot({ path: evidence + `${info.project.name}-${kind}-manual-review.png`, animations: 'disabled' });
  }
});

test('both themes support long content, narrow widths, reduced motion and a 200% zoom proxy', async ({ page }, info) => {
  const widths = info.project.name === 'desktop' ? [1440, 768] : [390, 320];
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const kind of kinds) for (const theme of ['light', 'dark'] as const) for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    const screen = await start(page, kind, { theme, long: true });
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.es-root')).toHaveAttribute('data-theme', theme);
    await assertFits(page, screen);
    await expect(screen.locator('.es-processing-scan')).toHaveCSS('animation-name', 'none');
    expect(await screen.evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length)).toBe(0);
    for (const button of await screen.getByRole('button').all()) expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    const contrast = await measureContrast(screen);
    await info.attach(`${kind}-${theme}-${width}-contrast`, { body: JSON.stringify(contrast), contentType: 'application/json' });
    await screen.screenshot({ path: evidence + `${kind}-${theme}-${width}-long-reduced.png`, animations: 'disabled' });
    if (kind === 'analysis' && theme === 'light' && width === widths[0]) {
      const before = await masterValue(screen);
      await page.clock.runFor(22_000);
      await expect(screen.locator('.es-processing-story-copy h2')).toHaveText(processingFixtures.analysis.chapters[0].title);
      expect(await masterValue(screen)).toBeGreaterThan(before);
      await expect(screen.locator('.es-processing-steps > li').first().getByRole('progressbar')).toHaveAttribute('value', '100');
    }
  }

  for (const theme of ['light', 'dark'] as const) {
    await page.setViewportSize({ width: 640, height: 1000 });
    const screen = await start(page, 'optimization', { theme, long: true });
    // Test harness only: CSS zoom approximates 200%; native browser zoom remains unverified.
    await page.evaluate(() => { document.documentElement.style.zoom = '2'; });
    await assertFits(page, screen);
    const summary = screen.locator('.es-processing-transcript summary');
    await summary.focus();
    await summary.press('Enter');
    await expect(screen.locator('.es-processing-transcript')).toHaveAttribute('open', '');
    await expect(summary).toBeFocused();
    await assertFits(page, screen);
    await screen.screenshot({ path: evidence + `${info.project.name}-${theme}-zoom-200.png`, animations: 'disabled' });
    await page.emulateMedia({ forcedColors: 'active' });
    await summary.focus();
    await expect(summary).toHaveCSS('outline-style', 'solid');
    await expect(screen.locator('.es-processing-art')).toBeHidden();
    await page.evaluate(() => { document.documentElement.style.zoom = ''; });
    await page.emulateMedia({ forcedColors: 'none' });
  }
});
