import { expect, test, type Page } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';

declare global {
  interface Window {
    __bedsHydrationComplete?: boolean;
    __bedsMarkupReady?: boolean;
  }
}

const viteConfig = fileURLToPath(new URL('./vite.config.ts', import.meta.url));
const repoRoot = fileURLToPath(new URL('../../../../', import.meta.url));

function serverProbeProps() {
  return {
    value: 1.5,
    max: 3,
    delayedValue: 2.25,
  };
}

function createProbeElement(feedback: Record<string, any>, value = 1.5) {
  return React.createElement('main', { id: 'progress-data-list-probe' },
    React.createElement(feedback.DesignSystemProvider, { theme: 'light' },
      React.createElement('div', { id: 'progress-cases' },
        React.createElement(feedback.ProgressBar, { label: 'Fractional', value, max: 3 }),
        React.createElement(feedback.ProgressBar, { label: 'Below', value: -2, max: 3 }),
        React.createElement(feedback.ProgressBar, { label: 'Above', value: 8, max: 3 }),
        React.createElement(feedback.ProgressBar, { label: 'Zero', value: 0, max: 3 }),
        React.createElement(feedback.ProgressBar, { label: 'Null', value: null, max: 3 }),
        React.createElement(feedback.ProgressBar, { label: 'NaN', value: Number.NaN, max: 3 }),
        React.createElement(feedback.ProgressBar, { label: 'Infinity', value: Number.POSITIVE_INFINITY, max: 3 }),
        React.createElement(feedback.ProgressBar, { label: 'Bad max', value: 1, max: 0 }),
      ),
      React.createElement('div', { id: 'updates' },
        React.createElement(feedback.ProgressBar, { label: 'Delayed', value, max: 3 }),
        React.createElement('button', { type: 'button', id: 'propose-update' }, 'Propose update'),
        React.createElement('button', { type: 'button', id: 'accept-update' }, 'Accept update'),
        React.createElement('button', { type: 'button', id: 'reject-update' }, 'Reject update'),
      ),
      React.createElement(feedback.DataList, { label: 'Long named grouping' },
        React.createElement('a', { href: '#first' }, 'First item with a deliberately long label that must wrap instead of forcing horizontal overflow'),
        React.createElement('button', { type: 'button' }, 'Second item'),
      ),
      React.createElement(feedback.DataList, { label: 'Empty grouping' }, null),
    ),
  );
}

async function openProbe(page: Page, ssrMarkup?: string) {
  const source = `
    import React, { useState } from 'react';
    import { createRoot, hydrateRoot } from 'react-dom/client';
    import 'beds/styles.css';
    import { DataList, DesignSystemProvider, ProgressBar } from 'beds';
    function Probe() {
      const [value, setValue] = useState(1.5);
      const [pending, setPending] = useState(null);
      return <main id="progress-data-list-probe">
        <DesignSystemProvider theme="light">
          <div id="progress-cases">
            <ProgressBar label="Fractional" value={value} max={3} />
            <ProgressBar label="Below" value={-2} max={3} />
            <ProgressBar label="Above" value={8} max={3} />
            <ProgressBar label="Zero" value={0} max={3} />
            <ProgressBar label="Null" value={null} max={3} />
            <ProgressBar label="NaN" value={Number.NaN} max={3} />
            <ProgressBar label="Infinity" value={Number.POSITIVE_INFINITY} max={3} />
            <ProgressBar label="Bad max" value={1} max={0} />
          </div>
          <div id="updates">
            <ProgressBar label="Delayed" value={value} max={3} />
            <button type="button" id="propose-update" onClick={() => setPending(2.25)}>Propose update</button>
            <button type="button" id="accept-update" onClick={() => { if (pending !== null) setValue(pending); setPending(null); }}>Accept update</button>
            <button type="button" id="reject-update" onClick={() => setPending(null)}>Reject update</button>
          </div>
          <DataList label="Long named grouping">
            <a href="#first">First item with a deliberately long label that must wrap instead of forcing horizontal overflow</a>
            <button type="button">Second item</button>
          </DataList>
          <DataList label="Empty grouping" />
        </DesignSystemProvider>
      </main>;
    }
    const mount = () => {
      const root = document.getElementById('progress-data-list-root');
      if (!root) return;
      if (window.__bedsMarkupReady) hydrateRoot(root, <Probe />);
      else createRoot(root).render(<Probe />);
      window.__bedsHydrationComplete = true;
    };
    if (window.__bedsMarkupReady) mount();
    else {
      window.addEventListener('beds-markup-ready', mount, { once: true });
      mount();
    }
  `;
  const server = await createServer({
    root: repoRoot,
    configFile: viteConfig,
    plugins: [{
      name: 'progress-data-list-probe',
      resolveId(id) { return id === '/progress-data-list-probe.tsx' ? id : undefined; },
      load(id) { return id === '/progress-data-list-probe.tsx' ? source : undefined; },
      configureServer(vite) {
        vite.middlewares.use('/progress-data-list.html', async (request, response) => {
          response.setHeader('Content-Type', 'text/html; charset=utf-8');
          const ready = ssrMarkup ? '<script>window.__bedsMarkupReady = true;</script>' : '';
          const html = `<!doctype html><html><body>${ready}<div id="progress-data-list-root">${ssrMarkup ?? ''}</div><script type="module" src="/progress-data-list-probe.tsx"></script></body></html>`;
          response.end(await vite.transformIndexHtml(request.url ?? '/progress-data-list.html', html));
        });
      },
    }],
    server: { host: '127.0.0.1', port: 0, strictPort: false },
  });
  await server.listen();
  const address = server.httpServer?.address();
  if (!address || typeof address === 'string') throw new Error('Expected the evidence server to expose a TCP address.');
  await page.goto(`http://127.0.0.1:${address.port}/progress-data-list.html`);
  await expect(page.locator('#progress-data-list-probe')).toBeVisible();
  return server;
}

test('ProgressBar uses one exact normalized value for visible and native semantics', async ({ page }) => {
  const server = await openProbe(page);
  try {
    const bars = page.locator('.es-progress');
    await expect(bars).toHaveCount(9);
    expect(await bars.nth(0).locator('.es-meter-label').innerText()).toBe('Fractional\n1.5 / 3');
    expect(await bars.nth(0).locator('progress').getAttribute('value')).toBe('1.5');
    expect(await bars.nth(0).locator('progress').getAttribute('max')).toBe('3');
    expect(await bars.nth(1).locator('.es-meter-label').innerText()).toBe('Below\n0 / 3');
    expect(await bars.nth(2).locator('.es-meter-label').innerText()).toBe('Above\n3 / 3');
    expect(await bars.nth(3).locator('.es-meter-label').innerText()).toBe('Zero\n0 / 3');
    for (const label of ['Null', 'NaN', 'Infinity', 'Bad max']) {
      const bar = page.locator('.es-progress').filter({ hasText: label });
      await expect(bar).toContainText(`${label} — unavailable`);
      await expect(bar.locator('progress')).toHaveCount(0);
    }
  } finally {
    await server.close();
  }
});

test('controlled updates, two instances, DataList order, and hydration remain stable', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  const ssrServer = await createServer({ root: repoRoot, configFile: viteConfig, server: { host: '127.0.0.1', port: 0, strictPort: false } });
  await ssrServer.listen();
  const beds = await ssrServer.ssrLoadModule('/packages/beds/src/index.ts') as Record<string, any>;
  const ssrMarkup = renderToString(createProbeElement(beds, serverProbeProps().value));
  await (ssrServer as ViteDevServer).close();
  const server = await openProbe(page, ssrMarkup);
  try {
    await page.locator('#reject-update').click();
    await expect(page.locator('#updates .es-meter-label')).toContainText('1.5 / 3');
    await page.locator('#propose-update').click();
    await expect(page.locator('#updates .es-meter-label')).toContainText('1.5 / 3');
    await expect(page.locator('#updates progress')).toHaveAttribute('value', '1.5');
    await page.locator('#accept-update').click();
    await expect(page.locator('#updates .es-meter-label')).toContainText('2.25 / 3');
    await expect(page.locator('#updates progress')).toHaveAttribute('value', '2.25');

    const headings = page.locator('.es-data-list > h2');
    await expect(headings).toHaveText(['Long named grouping', 'Empty grouping']);
    expect(await page.locator('.es-data-list').first().locator('a, button').evaluateAll(elements => elements.map(element => element.textContent))).toEqual([
      'First item with a deliberately long label that must wrap instead of forcing horizontal overflow',
      'Second item',
    ]);
    await page.locator('.es-data-list').first().locator('a').focus();
    await expect(page.locator('.es-data-list').first().locator('a')).toBeFocused();

    await page.setViewportSize({ width: 320, height: 800 });
    await page.evaluate(() => { document.documentElement.dir = 'rtl'; document.documentElement.style.zoom = '2'; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.emulateMedia({ forcedColors: 'active' });
    await expect(page.locator('.es-progress').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.waitForFunction(() => window.__bedsHydrationComplete === true);
    expect(errors.filter(error => /hydration|mismatch/i.test(error))).toEqual([]);
  } finally {
    await server.close();
  }
});

test('SSR preserves exact fractional markup and unique DataList heading associations', async () => {
  const server = await createServer({ root: repoRoot, configFile: viteConfig, server: { host: '127.0.0.1', port: 0, strictPort: false } });
  await server.listen();
  try {
    const beds = await server.ssrLoadModule('/packages/beds/src/index.ts') as Record<string, any>;
    const markup = renderToString(createProbeElement(beds, serverProbeProps().value));
    expect(markup).toContain('Fractional</span><span>1.5<!-- --> / <!-- -->3</span>');
    expect(markup).toContain('value="1.5"');
    expect(markup).toContain('Zero</span><span>0<!-- --> / <!-- -->3</span>');
    expect(markup).toContain('Null<!-- --> — unavailable');
    const ids = [...markup.matchAll(/<h2 id="([^"]+)"/g)].map(match => match[1]);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
    expect(ids.every(id => markup.includes(`aria-labelledby="${id}"`))).toBe(true);
  } finally {
    await (server as ViteDevServer).close();
  }
});
