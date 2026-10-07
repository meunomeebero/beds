import { expect, test, type Page } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';

const viteConfig = fileURLToPath(new URL('./vite.config.ts', import.meta.url));
const repoRoot = fileURLToPath(new URL('../../../../', import.meta.url));

async function withSsrModule<T>(run: (foundation: Record<string, any>) => T | Promise<T>) {
  const server = await createServer({ root: repoRoot, configFile: viteConfig, server: { host: '127.0.0.1', port: 0, strictPort: false } });
  await server.listen();
  try {
    const foundation = await server.ssrLoadModule('/packages/beds/src/foundation.tsx') as Record<string, any>;
    return await run(foundation);
  } finally {
    await (server as ViteDevServer).close();
  }
}

test('provider SSR keeps theme, brand and context instances isolated', async () => {
  await withSsrModule(foundation => {
    const Probe = ({ label }: { label: string }) => {
      const value = foundation.useDesignSystem() as { theme: string; brandColor: string };
      return React.createElement('output', { 'data-probe': label }, `${value.theme}|${value.brandColor}`);
    };
    const markup = renderToString(React.createElement('main', null,
      React.createElement(foundation.DesignSystemProvider, { theme: 'light' }, React.createElement(Probe, { label: 'light' })),
      React.createElement(foundation.DesignSystemProvider, { theme: 'dark', brandColor: '#111111' },
        React.createElement(Probe, { label: 'dark' }),
        React.createElement(foundation.BrandMark, { label: 'Second brand' }),
        React.createElement(foundation.ThemeToggle, { label: 'Appearance' }),
      ),
    ));

    expect(markup).toContain('data-probe="light">light|#d0f300');
    expect(markup).toContain('data-probe="dark">dark|#111111');
    expect(markup).toContain('--es-on-brand:#ffffff');
    expect((markup.match(/aria-labelledby="([^"]+)"/g) ?? []).length).toBe(1);
    expect(markup.match(/<button[^>]+disabled=""/g) ?? []).toHaveLength(2);

    expect(() => renderToString(React.createElement(foundation.DesignSystemProvider, { theme: 'light', brandColor: '#fff' }, 'invalid'))).toThrow(/brandColor/);
    expect(() => renderToString(React.createElement(foundation.DesignSystemProvider, { theme: 'sepia' }, 'invalid'))).toThrow(/theme/);
    expect(() => renderToString(React.createElement(Probe, { label: 'outside' }))).toThrow(/DesignSystemProvider/);
  });
});

async function openFoundationProbe(page: Page) {
  const probeSource = `
    import React, { useState } from 'react';
    import { createRoot } from 'react-dom/client';
    import 'beds/styles.css';
    import { Avatar, BrandMark, DesignSystemProvider, Icon, Text, TextLink, ThemeToggle } from 'beds';
    const variants = ['page-title', 'section-title', 'chat-title', 'body', 'body-small', 'label', 'caption', 'overline', 'option', 'metric'];
    function Probe() {
      const [theme, setTheme] = useState('light');
      const [src, setSrc] = useState('/foundation/avatar-a.png');
      return <DesignSystemProvider theme={theme} onThemeChange={setTheme}>
        <main className="foundation-fixture">
          <ThemeToggle label="Appearance" lightLabel="Light" darkLabel="Dark" />
          <button type="button" id="avatar-a" onClick={() => setSrc('/foundation/avatar-a.png')}>Avatar A</button>
          <button type="button" id="avatar-b" onClick={() => setSrc('/foundation/avatar-b.png')}>Avatar B</button>
          <Avatar name="Ada Lovelace" src={src} purpose="profile" />
      <BrandMark label="Foundation brand" />
          <TextLink href="https://example.com/foundation" external>External foundation link</TextLink>
          <div className="foundation-texts">{variants.map(variant => <Text key={variant} variant={variant}>Long {variant} text for wrapping and contrast.</Text>)}</div>
          <div className="foundation-icons"><Icon name="Home" purpose="navigation" /><Icon name="Plus" purpose="action" /><Icon name="ChevronRight" purpose="small" /><Icon name="Sparkles" purpose="feature" /></div>
        </main>
      </DesignSystemProvider>;
    }
    createRoot(document.getElementById('root')).render(<Probe />);
  `;
  const server = await createServer({
    root: repoRoot,
    configFile: viteConfig,
    plugins: [{
      name: 'foundation-evidence-probe',
      resolveId(source) { return source === '/foundation-probe.tsx' ? '/foundation-probe.tsx' : undefined; },
      load(id) { return id === '/foundation-probe.tsx' ? probeSource : undefined; },
      configureServer(vite) {
        vite.middlewares.use('/foundation-probe.html', async (request, response) => {
          response.setHeader('Content-Type', 'text/html');
          const html = '<!doctype html><html><body><div id="root"></div><script type="module" src="/foundation-probe.tsx"></script></body></html>';
          response.end(await vite.transformIndexHtml(request.url ?? '/foundation-probe.html', html));
        });
      },
    }],
    server: { host: '127.0.0.1', port: 0, strictPort: false },
  });
  await server.listen();
  const address = server.httpServer?.address();
  if (!address || typeof address === 'string') throw new Error('Expected the foundation evidence server to expose a TCP address.');
  await page.route('**/foundation/avatar-*.png', route => route.fulfill({ status: 404, contentType: 'image/png', body: 'missing' }));
  await page.goto(`http://127.0.0.1:${address.port}/foundation-probe.html`);
  await expect(page.locator('.foundation-fixture')).toBeVisible();
  return server;
}

test('foundation primitives preserve semantic text, fixed icon purposes and keyboard focus under stress', async ({ page }) => {
  const server = await openFoundationProbe(page);
  try {
    const texts = page.locator('.foundation-texts .es-text');
    await expect(texts).toHaveCount(10);
    expect(await texts.evaluateAll(elements => elements.map(element => element.tagName))).toEqual(['H1', 'H2', 'H2', 'SPAN', 'SPAN', 'SPAN', 'SPAN', 'SPAN', 'SPAN', 'SPAN']);
    const sizes = await texts.evaluateAll(elements => elements.map(element => [getComputedStyle(element).fontSize, getComputedStyle(element).lineHeight]));
    expect(sizes).toEqual([['16px', '20px'], ['13px', '20px'], ['16px', '24px'], ['14px', '21px'], ['13px', '20px'], ['13px', '16px'], ['12px', '16px'], ['12px', '16px'], ['13px', '16px'], ['24px', '30px']]);

    const themeButtons = page.getByRole('group', { name: 'Appearance' }).getByRole('button');
    await expect(themeButtons.nth(0)).toHaveAttribute('aria-pressed', 'true');
    await expect(themeButtons.nth(1)).toHaveAttribute('aria-pressed', 'false');
    const storageBefore = await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }));
    await themeButtons.nth(1).click();
    await expect(page.locator('.es-root')).toHaveAttribute('data-theme', 'dark');
    await expect(themeButtons.nth(1)).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }))).toEqual(storageBefore);
    await page.reload();
    await expect(page.locator('.es-root')).toHaveAttribute('data-theme', 'light');

    await expect(page.locator('.foundation-icons .es-icon')).toHaveCount(4);
    expect(await page.locator('.foundation-icons .es-icon').evaluateAll(elements => elements.map(element => ({ width: getComputedStyle(element).width, height: getComputedStyle(element).height, stroke: element.getAttribute('stroke-width'), hidden: element.getAttribute('aria-hidden') })))).toEqual([
      { width: '14px', height: '14px', stroke: '1.5', hidden: 'true' },
      { width: '16px', height: '16px', stroke: '1.5', hidden: 'true' },
      { width: '12px', height: '12px', stroke: '1.5', hidden: 'true' },
      { width: '20px', height: '20px', stroke: '1.5', hidden: 'true' },
    ]);

    const contrast = await texts.evaluateAll(elements => elements.map(element => {
      const parse = (value: string) => value.match(/[\d.]+/g)!.map(Number);
      const foreground = parse(getComputedStyle(element).color);
      const background = parse(getComputedStyle(element.closest('.es-root')!).backgroundColor);
      const luminance = (rgb: number[]) => rgb.slice(0, 3).map(channel => channel / 255).map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4).reduce((sum, channel, index) => sum + channel * [.2126, .7152, .0722][index], 0);
      return (Math.max(luminance(foreground), luminance(background)) + .05) / (Math.min(luminance(foreground), luminance(background)) + .05);
    }));
    expect(Math.min(...contrast)).toBeGreaterThanOrEqual(4.5);

    await page.setViewportSize({ width: 640, height: 800 });
    await page.evaluate(() => { document.documentElement.dir = 'rtl'; document.documentElement.style.zoom = '2'; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.emulateMedia({ forcedColors: 'active' });
    await expect(texts.first()).toBeVisible();
    const link = page.getByRole('link', { name: 'External foundation link' });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await link.focus();
    await expect(link).toBeFocused();
    expect(await link.evaluate(element => parseFloat(getComputedStyle(element).outlineWidth))).toBeGreaterThan(0);
  } finally {
    await page.close();
    await server.close();
  }
});

test('Avatar does not retry a previously failed source after source re-entry', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => { if (/foundation\/avatar-[ab]\.png$/.test(request.url())) requests.push(request.url()); });
  const server = await openFoundationProbe(page);
  try {
    const avatar = page.locator('.es-avatar--profile');
    await expect(avatar).toHaveText('AL');
    await page.getByRole('button', { name: 'Avatar B' }).click();
    await expect(avatar).toHaveText('AL');
    await page.getByRole('button', { name: 'Avatar A' }).click();
    await expect(avatar).toHaveText('AL');
    expect(requests.filter(url => url.endsWith('avatar-a.png'))).toHaveLength(1);
    expect(requests.filter(url => url.endsWith('avatar-b.png'))).toHaveLength(1);
  } finally {
    await page.close();
    await server.close();
  }
});
