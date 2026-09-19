import { expect, test, type Page } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import { fileURLToPath } from 'node:url';

const viteConfig = fileURLToPath(new URL('./vite.config.ts', import.meta.url));
const repoRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const probePage = '/apps/web/labs/espaco-library/reduced-motion.html';

type MatchMediaHarnessOptions = { legacy: boolean; initialReduced: boolean };
type HarnessWindow = Window & { __reducedMotionHarness: { setMatches: (value: boolean) => void; listenerCount: () => number } };

async function installMatchMediaHarness(page: Page, options: MatchMediaHarnessOptions) {
  await page.addInitScript(({ legacy, initialReduced }) => {
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    const media = {
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
    } as MediaQueryList & { setMatches: (value: boolean) => void };
    let matches = initialReduced;
    Object.defineProperty(media, 'matches', { configurable: false, get: () => matches });
    media.setMatches = value => {
      matches = value;
      const event = { matches: value, media: media.media } as MediaQueryListEvent;
      listeners.forEach(listener => listener(event));
    };
    if (legacy) {
      Object.assign(media, {
        addListener: (listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
        removeListener: (listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
      });
    } else {
      Object.assign(media, {
        addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
        removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
      });
    }
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => media,
    });
    Object.defineProperty(window, '__reducedMotionHarness', {
      configurable: true,
      value: {
        setMatches: (value: boolean) => media.setMatches(value),
        listenerCount: () => listeners.size,
      },
    });
  }, options);
}

async function loadProbe(page: Page) {
  const server = await createServer({ root: repoRoot, configFile: viteConfig, server: { host: '127.0.0.1', port: 0, strictPort: false } });
  await server.listen();
  const address = server.httpServer?.address();
  if (!address || typeof address === 'string') throw new Error('Expected the reduced-motion Vite server to expose a TCP address.');
  const module = await server.ssrLoadModule('/apps/web/labs/espaco-library/reduced-motion-server.ts') as { renderReducedMotionProbe: () => string };
  const errors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${address.port}${probePage}`);
  await page.evaluate(markup => {
    document.getElementById('reduced-motion-root')!.innerHTML = markup;
    (window as Window & { __reducedMotionMarkupReady?: boolean }).__reducedMotionMarkupReady = true;
    window.dispatchEvent(new Event('reduced-motion-markup-ready'));
  }, module.renderReducedMotionProbe());
  await page.waitForFunction(() => (window as Window & { __reducedMotionHydrated?: boolean }).__reducedMotionHydrated === true);
  return { server, errors };
}

test('SSR false snapshot hydrates to live modern matchMedia state and cleans up', async ({ page }) => {
  await installMatchMediaHarness(page, { legacy: false, initialReduced: true });
  const { server, errors } = await loadProbe(page);
  try {
    await expect(page.getByTestId('reduced-motion-value')).toHaveText('true');
    expect(await page.evaluate(() => (window as unknown as HarnessWindow).__reducedMotionHarness.listenerCount())).toBe(1);
    await page.evaluate(() => (window as unknown as HarnessWindow).__reducedMotionHarness.setMatches(false));
    await expect(page.getByTestId('reduced-motion-value')).toHaveText('false');
    await page.evaluate(() => (window as unknown as HarnessWindow).__reducedMotionHarness.setMatches(true));
    await expect(page.getByTestId('reduced-motion-value')).toHaveText('true');
    await page.getByRole('button', { name: 'Unmount probe', exact: true }).click();
    await expect(page.getByTestId('probe-state')).toHaveText('unmounted');
    await expect.poll(() => page.evaluate(() => (window as unknown as HarnessWindow).__reducedMotionHarness.listenerCount())).toBe(0);
    expect(errors.filter(error => /hydration|mismatch/i.test(error))).toEqual([]);
  } finally {
    await (server as ViteDevServer).close();
  }
});

test('legacy matchMedia listener fallback receives live changes and cleans up', async ({ page }) => {
  await installMatchMediaHarness(page, { legacy: true, initialReduced: false });
  const { server, errors } = await loadProbe(page);
  try {
    await expect(page.getByTestId('reduced-motion-value')).toHaveText('false');
    expect(await page.evaluate(() => (window as unknown as HarnessWindow).__reducedMotionHarness.listenerCount())).toBe(1);
    await page.evaluate(() => (window as unknown as HarnessWindow).__reducedMotionHarness.setMatches(true));
    await expect(page.getByTestId('reduced-motion-value')).toHaveText('true');
    await page.getByRole('button', { name: 'Unmount probe', exact: true }).click();
    await expect.poll(() => page.evaluate(() => (window as unknown as HarnessWindow).__reducedMotionHarness.listenerCount())).toBe(0);
    expect(errors.filter(error => /hydration|mismatch/i.test(error))).toEqual([]);
  } finally {
    await (server as ViteDevServer).close();
  }
});
