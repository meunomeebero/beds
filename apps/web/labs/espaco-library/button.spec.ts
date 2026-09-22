import { createServer, type ViteDevServer } from 'vite';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { expect, test, type Page } from '@playwright/test';

const viteConfig = fileURLToPath(new URL('./vite.config.ts', import.meta.url));
const repoRoot = fileURLToPath(new URL('../../../../', import.meta.url));

const probeSource = `
  import React, { useState } from 'react';
  import { createRoot, hydrateRoot } from 'react-dom/client';
  import { Button, DesignSystemProvider, IconButton, IconToggleButton } from 'beds';

  export function Probe() {
    const [expanded, setExpanded] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [acceptedCalls, setAcceptedCalls] = useState(0);
    const [rejectedCalls, setRejectedCalls] = useState(0);
    const [submitCount, setSubmitCount] = useState(0);
    const [resetCount, setResetCount] = useState(0);
    return <DesignSystemProvider brandColor="#d0f300" theme="light">
      <main>
        <form onSubmit={event => { event.preventDefault(); setSubmitCount(value => value + 1); }} onReset={() => setResetCount(value => value + 1)}>
          <Button label="Submit example" type="submit" onClick={() => undefined} />
          <Button label="Reset example" type="reset" onClick={() => undefined} />
          <Button label="Default example" onClick={() => undefined} />
          <Button label="Compact example" compact onClick={() => undefined} />
          <Button label="Welcome example" purpose="welcome" onClick={() => undefined} />
          <Button label="Connection example" purpose="connection" onClick={() => undefined} />
          <Button label="Busy example" busy onClick={() => undefined} />
          <Button label="Disabled example" disabled onClick={() => undefined} />
          <Button label="Disclosure example" aria-expanded={expanded} aria-controls="disclosure-panel" onClick={() => setExpanded(value => !value)} />
          <output data-testid="submit-count">{submitCount}</output>
          <output data-testid="reset-count">{resetCount}</output>
        </form>
        <div id="disclosure-panel" hidden={!expanded}>Disclosure content.</div>
        <IconButton label="Icon example" icon="Plus" onClick={() => undefined} />
        <IconButton label="Disabled icon example" icon="Plus" disabled onClick={() => undefined} />
        <IconToggleButton label="Accept toggle" icon="Bookmark" pressed={accepted} onPressedChange={next => { setAcceptedCalls(value => value + 1); setAccepted(next); }} />
        <IconToggleButton label="Reject toggle" icon="Bookmark" pressed={false} onPressedChange={() => setRejectedCalls(value => value + 1)} />
        <output data-testid="accepted-calls">{acceptedCalls}</output>
        <output data-testid="rejected-calls">{rejectedCalls}</output>
      </main>
    </DesignSystemProvider>;
  }

  if (typeof document !== 'undefined') {
    const root = document.getElementById('root');
    if (root) {
      if (root.childNodes.length) hydrateRoot(root, <Probe />);
      else createRoot(root).render(<Probe />);
      window.__buttonProbeReady = true;
    }
  }
`;

async function startProbeServer() {
  const server = await createServer({
    root: repoRoot,
    configFile: viteConfig,
    plugins: [{
      name: 'button-contract-probe',
      resolveId(source) { return source === '/button-probe.tsx' ? '/button-probe.tsx' : undefined; },
      load(id) { return id === '/button-probe.tsx' ? probeSource : undefined; },
      configureServer(vite) {
        vite.middlewares.use('/button-probe.html', async (request, response) => {
          const module = await vite.ssrLoadModule('/button-probe.tsx') as { Probe: React.ComponentType };
          const markup = renderToString(React.createElement(module.Probe));
          response.setHeader('Content-Type', 'text/html');
          response.end(await vite.transformIndexHtml(request.url ?? '/button-probe.html', `<!doctype html><html><body><div id="root">${markup}</div><script type="module" src="/button-probe.tsx"></script></body></html>`));
        });
      },
    }],
    server: { host: '127.0.0.1', port: 0, strictPort: false },
  });
  await server.listen();
  const address = server.httpServer?.address();
  if (!address || typeof address === 'string') throw new Error('Expected the button probe server to expose a TCP address.');
  return { server, url: `http://127.0.0.1:${address.port}/button-probe.html` };
}

let probe: { server: ViteDevServer; url: string };
test.beforeAll(async () => { probe = await startProbeServer(); });
test.afterAll(async () => { await probe.server.close(); });

async function openProbe(page: Page) {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto(probe.url);
  await expect(page.getByRole('button', { name: 'Default example', exact: true })).toBeVisible();
  return { pageErrors, consoleErrors };
}

test('Button family preserves native semantics, controlled state and isolated hydration', async ({ page }) => {
  const errors = await openProbe(page);
  await expect(page.getByRole('button', { name: 'Submit example', exact: true })).toHaveAttribute('type', 'submit');
  await expect(page.getByRole('button', { name: 'Reset example', exact: true })).toHaveAttribute('type', 'reset');
  await page.getByRole('button', { name: 'Submit example', exact: true }).click();
  await expect(page.getByTestId('submit-count')).toHaveText('1');
  await page.getByRole('button', { name: 'Reset example', exact: true }).click();
  await expect(page.getByTestId('reset-count')).toHaveText('1');

  const busy = page.getByRole('button', { name: 'Busy example', exact: true });
  await expect(busy).toBeDisabled();
  await expect(busy).toHaveAttribute('aria-busy', 'true');
  await expect(busy).toHaveText('Busy example');
  await expect(page.getByRole('button', { name: 'Disabled example', exact: true })).toBeDisabled();

  const disclosure = page.getByRole('button', { name: 'Disclosure example', exact: true });
  await expect(disclosure).toHaveAttribute('aria-expanded', 'false');
  await expect(disclosure).toHaveAttribute('aria-controls', 'disclosure-panel');
  await disclosure.press('Enter');
  await expect(disclosure).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#disclosure-panel')).toBeVisible();

  const accepted = page.getByRole('button', { name: 'Accept toggle', exact: true });
  const rejected = page.getByRole('button', { name: 'Reject toggle', exact: true });
  await expect(accepted).toHaveAttribute('aria-pressed', 'false');
  await expect(rejected).toHaveAttribute('aria-pressed', 'false');
  await accepted.press('Space');
  await rejected.press('Space');
  await expect(accepted).toHaveAttribute('aria-pressed', 'true');
  await expect(rejected).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByTestId('accepted-calls')).toHaveText('1');
  await expect(page.getByTestId('rejected-calls')).toHaveText('1');

  expect(errors.pageErrors).toEqual([]);
  expect(errors.consoleErrors).toEqual([]);
});

test('Button family keeps keyboard instant, pointer bounded and motion preference safe', async ({ page }) => {
  const errors = await openProbe(page);
  const button = page.getByRole('button', { name: 'Default example', exact: true });
  const pressChild = button.locator(':scope > span').first();
  const scale = () => pressChild.evaluate(element => {
    const transform = getComputedStyle(element).transform;
    return transform === 'none' ? 1 : new DOMMatrix(transform).a;
  });
  const before = await button.boundingBox();
  await button.focus();
  await page.keyboard.down('Enter');
  await page.waitForTimeout(20);
  expect(await scale()).toBe(1);
  await page.keyboard.up('Enter');
  await page.keyboard.down('Space');
  await page.waitForTimeout(20);
  expect(await scale()).toBe(1);
  await page.keyboard.up('Space');

  if (!before) throw new Error('Default button must be measurable.');
  const bounds = await button.boundingBox();
  expect(bounds?.width).toBe(before.width);
  expect(bounds?.height).toBe(before.height);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await button.hover();
  await page.mouse.down();
  await page.waitForTimeout(180);
  expect(await scale()).toBeCloseTo(0.97, 2);
  const pressedBounds = await button.boundingBox();
  expect(pressedBounds?.width).toBe(before.width);
  expect(pressedBounds?.height).toBe(before.height);
  await page.mouse.up();
  await page.waitForTimeout(180);
  expect(await scale()).toBe(1);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await button.hover();
  await page.mouse.down();
  await page.waitForTimeout(20);
  expect(await scale()).toBe(1);
  await page.mouse.up();

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await button.hover();
  await page.mouse.down();
  await page.waitForTimeout(180);
  expect(await scale()).toBeCloseTo(0.97, 2);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(20);
  expect(await scale()).toBe(1);
  await page.mouse.up();
  expect(await page.locator('.es-root').evaluate(element => getComputedStyle(element).direction)).toBe('ltr');

  expect(errors.pageErrors).toEqual([]);
  expect(errors.consoleErrors).toEqual([]);
});

test('Button family retains focus in forced colors, RTL bounds and coarse target geometry', async ({ page }, info) => {
  const errors = await openProbe(page);
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
  await expect(page.getByRole('button', { name: 'Icon example', exact: true })).toBeVisible();
  const focusables = [
    page.getByRole('button', { name: 'Default example', exact: true }),
    page.getByRole('button', { name: 'Icon example', exact: true }),
    page.getByRole('button', { name: 'Accept toggle', exact: true }),
  ];
  for (const control of focusables) {
    await control.focus();
    await control.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(control).toBeFocused();
    expect(await control.evaluate(element => parseFloat(getComputedStyle(element).outlineWidth)), await control.getAttribute('aria-label') ?? await control.textContent() ?? 'button').toBeGreaterThan(0);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  if (info.project.name === 'mobile') {
    for (const name of ['Default example', 'Compact example', 'Welcome example', 'Connection example', 'Icon example', 'Accept toggle']) {
      expect(Math.round((await page.getByRole('button', { name, exact: true }).boundingBox())?.height ?? 0), name).toBeGreaterThanOrEqual(44);
    }
  }

  expect(errors.pageErrors).toEqual([]);
  expect(errors.consoleErrors).toEqual([]);
});
