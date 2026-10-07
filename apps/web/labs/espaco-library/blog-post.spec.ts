import { createServer, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import { mkdtemp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test, type Page } from '@playwright/test';

const evidence = fileURLToPath(new URL('./evidence/blog-post/', import.meta.url));
const repoRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const feed = (page: Page) => page.getByRole('list', { name: 'Artigos de demonstração' });
const firstTitle = 'Um currículo que conta a sua história';

async function renderEmptyList() {
  const cacheDir = await mkdtemp(join(tmpdir(), 'beds-ber52-blog-'));
  let server: ViteDevServer | undefined;
  try {
    let cssModuleId = 0;
    server = await createServer({
      root: repoRoot,
      configFile: false,
      cacheDir,
      plugins: [react(), {
        name: 'ber52-blog-css-stub',
        enforce: 'pre',
        resolveId(source) { return source.endsWith('.css') ? `\0ber52-blog-css-${cssModuleId++}` : undefined; },
        load(id) { return id.startsWith('\0ber52-blog-css-') ? 'export default {};' : undefined; },
      }],
      resolve: { dedupe: ['react', 'react-dom'] },
    });
    const module = await server.ssrLoadModule('/packages/beds/src/index.ts') as Record<string, any>;
    return renderToStaticMarkup(React.createElement(module.BlogPostList, { label: 'Artigos vazios' }));
  } finally {
    if (server) await server.close();
    await rm(cacheDir, { recursive: true, force: true });
  }
}

async function assertListContract(page: Page, expectedInteractiveCounts: number[]) {
  const list = feed(page);
  await expect(list.locator(':scope>li')).toHaveCount(expectedInteractiveCounts.length);
  expect(await list.locator(':scope>li').evaluateAll(items => items.map(item => item.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])').length))).toEqual(expectedInteractiveCounts);
  await expect(list.locator('a a,a button,button a,button button')).toHaveCount(0);
}

async function contrast(page: Page) {
  return feed(page).locator('h2,p,time,bdi,.es-blog-post-meta>span,.es-blog-post-tags>li').evaluateAll(elements => elements.map(element => {
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

test('SSR keeps an empty public list named with no list items', async () => {
  const markup = await renderEmptyList();
  expect(markup).toContain('<ul');
  expect(markup).toContain('aria-label="Artigos vazios"');
  expect(markup.match(/<li\b/g) ?? []).toHaveLength(0);
});

test('catalog entry, native article links, semantic metadata and full text recovery', async ({ page, context }, info) => {
  const errors: string[] = [];
  const consoleMessages: string[] = [];
  const writes: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'warning' || message.type() === 'error') consoleMessages.push(message.text()); });
  page.on('request', request => { if (request.method() !== 'GET') writes.push(request.url()); });
  for (const theme of ['light', 'dark']) {
    await page.goto('/?view=chat&theme=' + theme);
    if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Navigation', exact: true }).click();
    await page.getByRole('link', { name: 'Posts do blog', exact: true }).click();
    const links = feed(page).getByRole('link');
    await expect(links).toHaveCount(3);
    await assertListContract(page, [1, 1, 1]);
    await expect(feed(page).getByRole('heading', { level: 2 })).toHaveCount(3);
    await expect(feed(page).locator('time').first()).toHaveAttribute('datetime', '2026-09-15');
    await expect(feed(page).getByRole('img')).toHaveCount(0);
    await expect(links.last().locator('.es-blog-card-media')).toHaveCount(0);
    await expect(links.first().locator('button,a,[tabindex]')).toHaveCount(0);
    for (const pair of await contrast(page)) expect(pair.ratio, JSON.stringify(pair)).toBeGreaterThanOrEqual(4.5);
    await links.first().hover();
    for (const pair of await contrast(page)) expect(pair.ratio, JSON.stringify(pair)).toBeGreaterThanOrEqual(4.5);
    await links.first().focus();
    await expect(links.first()).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('Tab');
    await expect(links.nth(1)).toBeFocused();
    await links.nth(1).blur();
    await page.mouse.move(0, 0);
    await page.screenshot({ path: evidence + `${info.project.name}-${theme}.png`, fullPage: true });
    const summary = await links.first().locator('p').textContent();
    await links.first().press('Enter');
    await expect(page.getByRole('heading', { name: firstTitle, level: 1 })).toBeVisible();
    await expect(page.getByText(summary!, { exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Voltar para os artigos' }).click();
    await expect(feed(page)).toBeVisible();
    const popupPromise = context.waitForEvent('page');
    await feed(page).getByRole('link').first().click({ button: 'middle' });
    const popup = await popupPromise;
    await expect(popup.getByRole('heading', { name: firstTitle, level: 1 })).toBeVisible();
    await popup.close();
  }
  expect(errors).toEqual([]);
  expect(consoleMessages).toEqual([]);
  expect(writes).toEqual([]);
});

test('reserved thumbnail loading, failure, source recovery and cached re-entry', async ({ page }, info) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/assets/blog-resume.svg', async route => { await gate; await route.continue(); });
  await page.goto('/?view=blog-post&theme=light', { waitUntil: 'domcontentloaded' });
  const media = page.locator('.es-blog-card-media').first();
  try {
    await expect(media).toHaveAttribute('aria-busy', 'true');
    const before = await media.boundingBox();
    release();
    await expect(media).toHaveAttribute('data-state', 'ready');
    expect(await media.boundingBox()).toEqual(before);
  } finally { release(); }
  await page.goto('/?view=blog-post&theme=dark&preview=image-error');
  await expect(media).toHaveAttribute('data-state', 'unavailable');
  await expect(feed(page).getByRole('link', { name: firstTitle })).toBeVisible();
  await expect(media.getByRole('img')).toHaveCount(0);
  await page.screenshot({ path: evidence + `${info.project.name}-image-error.png`, fullPage: true });
  await page.getByRole('button', { name: 'Restaurar imagens' }).click();
  await expect(media).toHaveAttribute('data-state', 'ready');
  await expect(media).not.toHaveAttribute('aria-busy');
  await feed(page).getByRole('link').first().click();
  // The explicit failure-fixture URL intentionally resets its scenario on remount.
  await page.getByRole('link', { name: 'Voltar para os artigos' }).click();
  await expect(media).toHaveAttribute('data-state', 'ready');
  await feed(page).getByRole('link').first().click();
  await page.goBack();
  await expect(media).toHaveAttribute('data-state', 'ready');
});

test('long copy, 320px, RTL, zoom proxy, pressed contrast and forced colors', async ({ page }, info) => {
  for (const theme of ['light', 'dark']) {
    await page.goto(`/?view=blog-post&theme=${theme}&preview=long`);
    for (const width of [1440, 800, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await feed(page).evaluate(element => [...element.querySelectorAll('.es-blog-post,h2,p,.es-blog-post-meta,.es-blog-post-tags>li')].every(child => child.scrollWidth <= child.clientWidth + 1))).toBe(true);
    }
    const link = feed(page).getByRole('link').first();
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await expect(link.locator('h2')).toHaveCSS('overflow', 'visible');
    await expect(link.locator('p')).toHaveCSS('-webkit-line-clamp', '2');
    await page.screenshot({ path: evidence + `${info.project.name}-${theme}-320.png`, fullPage: true });
    await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
    const media = await link.locator('.es-blog-card-media').boundingBox();
    const copy = await link.locator('.es-blog-post-content').boundingBox();
    expect(media!.x).toBeGreaterThan(copy!.x);
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.evaluate(() => { document.documentElement.dir = 'ltr'; document.documentElement.style.zoom = '2'; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await link.hover();
    await page.mouse.down();
    for (const pair of await contrast(page)) expect(pair.ratio, JSON.stringify(pair)).toBeGreaterThanOrEqual(4.5);
    await page.mouse.move(0, 0);
    await page.mouse.up();
    await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
    await page.keyboard.press('Tab');
    await link.focus();
    await expect(link).toHaveCSS('outline-style', 'solid');
    await expect(link).toHaveCSS('outline-width', '2px');
    expect(await link.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
    await page.emulateMedia({ forcedColors: 'none', reducedMotion: 'no-preference' });
  }
});
