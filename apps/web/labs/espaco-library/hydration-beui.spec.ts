import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import { fileURLToPath } from 'node:url';

const viteConfig = fileURLToPath(new URL('./vite.config.ts', import.meta.url));
const hydrationPage = '/apps/web/labs/espaco-library/hydration.html';

test('AppShell hydrates on a mobile matchMedia snapshot without mismatch errors', async ({ page }) => {
  const server = await createServer({ configFile: viteConfig, server: { host: '127.0.0.1', port: 0, strictPort: false } });
  await server.listen();
  try {
    const module = await server.ssrLoadModule('/apps/web/labs/espaco-library/hydration-server.ts') as { renderHydrationProbe: () => string };
    const address = server.httpServer?.address();
    if (!address || typeof address === 'string') throw new Error('Expected the hydration Vite server to expose a TCP address.');
    const errors: string[] = [];
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width: 390, height: 844 });
    const origin = `http://127.0.0.1:${address.port}`;
    await page.goto(`${origin}${hydrationPage}`);
    await page.evaluate(markup => {
      document.getElementById('hydration-root')!.innerHTML = markup;
      (window as Window & { __bedsHydrationMarkupReady?: boolean }).__bedsHydrationMarkupReady = true;
      window.dispatchEvent(new Event('beds-hydration-markup-ready'));
    }, module.renderHydrationProbe());
    await page.waitForFunction(() => (window as Window & { __bedsHydrationComplete?: boolean }).__bedsHydrationComplete === true);
    expect(errors.filter(error => /hydration|mismatch/i.test(error))).toEqual([]);
    const firstFrame = await page.locator('.es-app-shell').evaluate(element => ({
      grid: getComputedStyle(element).gridTemplateColumns,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: innerWidth,
    }));
    expect(firstFrame.grid).not.toMatch(/^264px/);
    expect(firstFrame.documentWidth).toBeLessThanOrEqual(firstFrame.viewportWidth);
  } finally {
    await (server as ViteDevServer).close();
  }
});
