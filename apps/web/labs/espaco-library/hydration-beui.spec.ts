import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import { fileURLToPath } from 'node:url';

const viteConfig = fileURLToPath(new URL('./vite.config.ts', import.meta.url));
const repoRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const hydrationPage = '/apps/web/labs/espaco-library/hydration.html';

test('AppShell hydrates on a mobile matchMedia snapshot without mismatch errors', async ({ page }) => {
  const server = await createServer({ root: repoRoot, configFile: viteConfig, server: { host: '127.0.0.1', port: 0, strictPort: false } });
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
    const shells = page.locator('.recipe-app-shell');
    await expect(shells).toHaveCount(2);
    const firstFrame = await shells.first().evaluate(element => ({
      grid: getComputedStyle(element).gridTemplateColumns,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: innerWidth,
    }));
    expect(firstFrame.grid).not.toMatch(/^264px/);
    expect(firstFrame.documentWidth).toBeLessThanOrEqual(firstFrame.viewportWidth);
    const segmented = page.getByRole('radiogroup');
    await expect(segmented).toHaveCount(2);
    const radioNames = await segmented.locator('input[type="radio"]').evaluateAll(inputs => inputs.map(input => input.getAttribute('name')));
    expect(new Set(radioNames).size).toBe(2);
    await expect(segmented.nth(0).locator('[data-segmented-indicator]')).toHaveCount(1);
    await expect(segmented.nth(1).locator('[data-segmented-indicator]')).toHaveCount(1);
    await segmented.nth(0).getByRole('radio', { name: 'Compact', exact: true }).press('ArrowRight');
    await expect(segmented.nth(0).getByRole('radio', { name: 'Comfortable', exact: true })).toBeChecked();
    await expect(segmented.nth(1).getByRole('radio', { name: 'Allow', exact: true })).toBeChecked();
    await expect(segmented.nth(0).locator('[data-segmented-indicator]')).toHaveCount(1);
    await expect(segmented.nth(1).locator('[data-segmented-indicator]')).toHaveCount(1);
    const shellIds = await page.locator('.recipe-app-shell aside').evaluateAll(asides => asides.map(aside => aside.id));
    expect(new Set(shellIds).size).toBe(2);
    const activeDock = page.getByRole('button', { name: 'Active dock action', exact: true });
    const disabledDock = page.getByRole('button', { name: 'Disabled dock action', exact: true });
    await expect(activeDock).toHaveAttribute('aria-pressed', 'true');
    await expect(disabledDock).toBeDisabled();
    await expect(disabledDock).toHaveAttribute('aria-label', 'Disabled dock action');
    const dockBounds = await activeDock.boundingBox();
    expect(dockBounds?.width).toBe(44);
    expect(dockBounds?.height).toBe(44);
    await page.getByRole('link', { name: 'Dock link', exact: true }).click();
    await expect(page).toHaveURL(/#dock-link$/);
    expect(errors.filter(error => /hydration|mismatch/i.test(error))).toEqual([]);
  } finally {
    await (server as ViteDevServer).close();
  }
});

test('Select and SegmentedControl hydrate under prefers-reduced-motion without mismatch errors', async ({ page }) => {
  const server = await createServer({ root: repoRoot, configFile: viteConfig, server: { host: '127.0.0.1', port: 0, strictPort: false } });
  await server.listen();
  try {
    const module = await server.ssrLoadModule('/apps/web/labs/espaco-library/hydration-server.ts') as { renderHydrationProbe: () => string };
    const address = server.httpServer?.address();
    if (!address || typeof address === 'string') throw new Error('Expected the hydration Vite server to expose a TCP address.');
    const errors: string[] = [];
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', error => errors.push(error.message));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`http://127.0.0.1:${address.port}${hydrationPage}`);
    await page.evaluate(markup => {
      document.getElementById('hydration-root')!.innerHTML = markup;
      (window as Window & { __bedsHydrationMarkupReady?: boolean }).__bedsHydrationMarkupReady = true;
      window.dispatchEvent(new Event('beds-hydration-markup-ready'));
    }, module.renderHydrationProbe());
    await page.waitForFunction(() => (window as Window & { __bedsHydrationComplete?: boolean }).__bedsHydrationComplete === true);
    const period = page.getByRole('button', { name: /Hydration period/ }).first();
    await period.click();
    await page.getByRole('option', { name: 'Last 7 days', exact: true }).click();
    await expect(period).toContainText('Last 7 days');
    expect(errors.filter(error => /hydrat|mismatch|did not match|didn't match/i.test(error))).toEqual([]);
  } finally {
    await (server as ViteDevServer).close();
  }
});
