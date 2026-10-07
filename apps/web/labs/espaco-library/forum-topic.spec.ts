import { createServer, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import { mkdtemp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test, type Page } from '@playwright/test';
const evidence = fileURLToPath(new URL('./evidence/forum-topic/', import.meta.url));
const repoRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const topicTitle = 'O que vocês priorizam em um portfólio?';
const list = (page: Page) => page.getByRole('list', { name: 'Conversas da comunidade', exact: true });

async function renderEmptyList() {
  const cacheDir = await mkdtemp(join(tmpdir(), 'beds-ber52-forum-'));
  let server: ViteDevServer | undefined;
  try {
    let cssModuleId = 0;
    server = await createServer({
      root: repoRoot,
      configFile: false,
      cacheDir,
      plugins: [react(), {
        name: 'ber52-forum-css-stub',
        enforce: 'pre',
        resolveId(source) { return source.endsWith('.css') ? `\0ber52-forum-css-${cssModuleId++}` : undefined; },
        load(id) { return id.startsWith('\0ber52-forum-css-') ? 'export default {};' : undefined; },
      }],
      resolve: { dedupe: ['react', 'react-dom'] },
    });
    const module = await server.ssrLoadModule('/packages/beds/src/index.ts') as Record<string, any>;
    return renderToStaticMarkup(React.createElement(module.ForumTopicList, { label: 'Conversas vazias' }));
  } finally {
    if (server) await server.close();
    await rm(cacheDir, { recursive: true, force: true });
  }
}

async function assertListContract(page: Page, expectedInteractiveCounts: number[]) {
  const topics = list(page);
  await expect(topics.locator(':scope > li')).toHaveCount(expectedInteractiveCounts.length);
  expect(await topics.locator(':scope > li').evaluateAll(items => items.map(item => item.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])').length))).toEqual(expectedInteractiveCounts);
  await expect(topics.locator('a a,a button,button a,button button')).toHaveCount(0);
}

async function example(page: Page, name: string) {
  await page.getByRole('button', { name: /^Estado do exemplo:/ }).click();
  await page.getByRole('option', { name, exact: true }).click();
}

async function contrast(page: Page) {
  return list(page).locator('.es-forum-topic').first().evaluate(card => {
    const rgba = (value: string) => value.match(/[\d.]+/g)!.map(Number);
    const layers: number[][] = [];
    let node: Element | null = card;
    while (node) { layers.unshift(rgba(getComputedStyle(node).backgroundColor)); node = node.parentElement; }
    const bg = layers.reduce((base, color) => base.map((c, i) => c * (1 - (color[3] ?? 1)) + color[i] * (color[3] ?? 1)), [255, 255, 255]);
    const lum = (rgb: number[]) => rgb.slice(0, 3).map(c => c / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
    return ['title', 'byline', 'excerpt', 'meta'].map(part => {
      const fg = rgba(getComputedStyle(card.querySelector('.es-forum-topic-' + part)!).color);
      return { part, ratio: (Math.max(lum(fg), lum(bg)) + .05) / (Math.min(lum(fg), lum(bg)) + .05), fg, bg };
    });
  });
}

test('SSR keeps an empty public list named with no list items', async () => {
  const markup = await renderEmptyList();
  expect(markup).toContain('<ul');
  expect(markup).toContain('aria-label="Conversas vazias"');
  expect(markup.match(/<li\b/g) ?? []).toHaveLength(0);
});

test('catalog entry, portraits, keyboard detail, selection and native link', async ({ page }, info) => {
  const errors: string[] = [];
  const consoleMessages: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'warning' || message.type() === 'error') consoleMessages.push(message.text()); });
  for (const theme of ['light', 'dark']) {
    await page.goto('/?view=chat&theme=' + theme);
    if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Navigation', exact: true }).click();
    await page.getByRole('link', { name: 'Cards do fórum', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Fórum', exact: true })).toBeVisible();
    await assertListContract(page, [1, 1, 1, 1]);
    const first = list(page).getByRole('button', { name: topicTitle, exact: true });
    await expect(first).toHaveAccessibleDescription(/Marina Costa Não lido/);
    await expect(first.locator('img')).toHaveJSProperty('complete', true);
    expect(await first.locator('img').evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect(first.locator('.es-avatar')).toHaveCSS('width', '40px');
    await expect(list(page).locator('.es-avatar').last()).toHaveText('PS');
    for (const measurement of await contrast(page)) expect(measurement.ratio, JSON.stringify(measurement)).toBeGreaterThanOrEqual(4.5);
    await first.focus();
    await expect(first).toHaveCSS('outline-style', 'solid');
    await expect(first).toHaveCSS('outline-width', '2px');
    await first.press('Enter');
    const drawer = page.getByRole('dialog', { name: topicTitle, exact: true });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText(/uma visão mais ampla do trabalho/)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
    await expect(first).toBeFocused();
    await expect(first).toHaveAttribute('aria-current', 'true');
    await expect(first).not.toContainText('Não lido');
    for (const measurement of await contrast(page)) expect(measurement.ratio, JSON.stringify(measurement)).toBeGreaterThanOrEqual(4.5);
    await first.press('Space');
    await expect(drawer).toBeVisible();
    await drawer.getByRole('button', { name: 'Fechar detalhes', exact: true }).click();
    await page.mouse.move(0, 0);
    await list(page).screenshot({ path: evidence + `${info.project.name}-${theme}.png` });
    await page.getByRole('button', { name: 'Restaurar exemplos', exact: true }).click();
    await first.hover();
    for (const measurement of await contrast(page)) expect(measurement.ratio, JSON.stringify(measurement)).toBeGreaterThanOrEqual(4.5);
    await page.mouse.down();
    for (const measurement of await contrast(page)) expect(measurement.ratio, JSON.stringify(measurement)).toBeGreaterThanOrEqual(4.5);
    await page.mouse.move(0, 0); await page.mouse.up();
  }
  const link = page.getByRole('link', { name: 'Abrir o tópico em uma página', exact: true });
  await expect(link).toHaveAttribute('href', /view=forum.*topic=portfolio/);
  if (info.project.name === 'desktop') {
    const [newPage] = await Promise.all([page.context().waitForEvent('page'), link.click({ button: 'middle' })]);
    await expect(newPage.getByRole('dialog', { name: topicTitle, exact: true })).toBeVisible();
    await newPage.close();
  } else {
    await link.click();
    await expect(page).toHaveURL(/topic=portfolio/);
    await expect(page.getByRole('dialog', { name: topicTitle, exact: true })).toBeVisible();
  }
  expect(errors).toEqual([]);
  expect(consoleMessages).toEqual([]);
});

test('image failure and recovery; loading, empty and error states', async ({ page }) => {
  await page.goto('/?view=forum&theme=dark');
  await example(page, 'Avatar indisponível');
  const avatar = list(page).locator('.es-avatar').first();
  await expect(avatar).toHaveText('MC');
  await expect(avatar.locator('img')).toHaveCount(0);
  await example(page, 'Conversas');
  await expect(avatar.locator('img')).toHaveJSProperty('complete', true);
  await example(page, 'Carregando');
  await expect(page.getByText('Carregando conversas…', { exact: true })).toBeVisible();
  await expect(list(page)).toHaveCount(0);
  await example(page, 'Vazio');
  await expect(list(page)).toHaveCount(0);
  await page.getByRole('button', { name: 'Restaurar tópicos', exact: true }).click();
  await assertListContract(page, [1, 1, 1, 1]);
  await example(page, 'Erro recuperável');
  await expect(page.getByText(/Tente novamente para recuperar/)).toBeVisible();
  await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
  await expect(list(page).getByRole('listitem')).toHaveCount(4);
});

test('320px reflow, long content, RTL, zoom and forced colors', async ({ page }, info) => {
  await page.goto('/?view=forum&theme=dark');
  await example(page, 'Texto longo');
  for (const width of [1440, 820, 600, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const first = list(page).getByRole('button').first();
    const metrics = await first.evaluate(card => {
      const box = card.getBoundingClientRect();
      return [...card.querySelectorAll('.es-forum-topic-title,.es-forum-topic-byline,.es-forum-topic-meta')].every(item => {
        const rect = item.getBoundingClientRect(); return rect.left >= box.left && rect.right <= box.right && item.scrollWidth <= item.clientWidth + 1;
      });
    });
    expect(metrics).toBe(true);
    expect((await first.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  await list(page).screenshot({ path: evidence + `${info.project.name}-320-long.png` });
  await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const avatar = await list(page).locator('.es-avatar').first().boundingBox();
  const content = await list(page).locator('.es-forum-topic-content').first().boundingBox();
  expect(avatar!.x).toBeGreaterThan(content!.x);
  await page.evaluate(() => { document.documentElement.dir = 'ltr'; document.documentElement.style.zoom = '2'; });
  await page.setViewportSize({ width: 800, height: 1000 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  const first = list(page).getByRole('button').first();
  await first.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await list(page).getByRole('button').first().focus();
  await expect(list(page).getByRole('button').first()).toHaveCSS('outline-style', 'solid');
});
