import { expect, test, type Page } from '@playwright/test';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import React from 'react';
import { renderToString } from 'react-dom/server';

const viteConfig = fileURLToPath(new URL('./vite.config.ts', import.meta.url));
const repoRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const overlayProbeSource = `
import React, { useEffect, useState } from 'react';
import { hydrateRoot } from 'react-dom/client';
import 'beds/styles.css';
import { DesignSystemProvider, DropdownMenu, Select, Tooltip } from 'beds';

const selectOptions = [{ id: 'auto', label: 'Auto' }, { id: 'review', label: 'Review' }];
const menuItems = [
  { id: 'review', label: 'Revisar exemplo' },
  { id: 'review-long', label: 'Revisão longa' },
  { id: 'disabled', label: 'Revisar indisponível', disabled: true },
];

export function OverlayProbe() {
  const [rejectedValue, setRejectedValue] = useState('auto');
  const [rejectedRequest, setRejectedRequest] = useState('none');
  const [delayedValue, setDelayedValue] = useState('auto');
  const [delayedRequest, setDelayedRequest] = useState('none');
  const [delayedProposal, setDelayedProposal] = useState(null);
  const [rejectedMenuRequested, setRejectedMenuRequested] = useState(false);
  const [menuAOpen, setMenuAOpen] = useState(false);
  const [menuBOpen, setMenuBOpen] = useState(false);
  const [menuSelection, setMenuSelection] = useState('none');
  useEffect(() => {
    (window as Window & { __ber39OverlayHydrated?: boolean }).__ber39OverlayHydrated = true;
  }, []);
  return <DesignSystemProvider theme="light">
    <main>
      <h1>Overlay probe</h1>
      <p data-testid="rejected-request">{rejectedRequest}</p>
      <p data-testid="delayed-request">{delayedRequest}</p>
      <p data-testid="rejected-menu-request">{String(rejectedMenuRequested)}</p>
      <p data-testid="menu-selection">{menuSelection}</p>
      <Select label="Rejected Select" value={rejectedValue} options={selectOptions} onChange={value => setRejectedRequest(value)} />
      <Select label="Delayed Select" value={delayedValue} options={selectOptions} onChange={value => { setDelayedRequest(value); setDelayedProposal(value); }} />
      <button type="button" onClick={() => { if (delayedProposal) { setDelayedValue(delayedProposal); setDelayedProposal(null); } }}>Aceitar seleção atrasada</button>
      <DropdownMenu label="Rejected Menu" open={false} onOpenChange={() => setRejectedMenuRequested(true)} items={menuItems} onSelect={() => {}} />
      <DropdownMenu label="Controlled Menu A" open={menuAOpen} onOpenChange={setMenuAOpen} items={menuItems} onSelect={setMenuSelection} />
      <DropdownMenu label="Controlled Menu B" open={menuBOpen} onOpenChange={setMenuBOpen} items={menuItems} onSelect={setMenuSelection} />
      <Tooltip label="Tooltip A description"><button type="button">Tooltip A</button></Tooltip>
      <Tooltip label="Tooltip B description"><button type="button">Tooltip B</button></Tooltip>
    </main>
  </DesignSystemProvider>;
}

if (typeof window !== 'undefined') {
  window.addEventListener('ber39-overlay-markup-ready', () => {
    hydrateRoot(document.getElementById('ber39-overlay-root')!, <OverlayProbe />);
  }, { once: true });
}
`;

async function openOverlayProbe(page: Page) {
  const cacheDir = await mkdtemp(join(tmpdir(), 'ber39-overlay-vite-'));
  const server = await createServer({
    root: repoRoot,
    configFile: viteConfig,
    cacheDir,
    plugins: [{
      name: 'ber39-overlay-probe',
      resolveId(source) { return source === '/ber39-overlay-probe.tsx' ? source : undefined; },
      load(id) { return id === '/ber39-overlay-probe.tsx' ? overlayProbeSource : undefined; },
      configureServer(vite) {
        vite.middlewares.use('/ber39-overlay-probe.html', async (request, response) => {
          response.setHeader('Content-Type', 'text/html');
          const html = '<!doctype html><html><body><div id="ber39-overlay-root"></div><script type="module" src="/ber39-overlay-probe.tsx"></script></body></html>';
          response.end(await vite.transformIndexHtml(request.url ?? '/ber39-overlay-probe.html', html));
        });
      },
    }],
    server: { host: '127.0.0.1', port: 0, strictPort: false },
  });
  try {
    await server.listen();
    const address = server.httpServer?.address();
    if (!address || typeof address === 'string') throw new Error('Expected the overlay probe server to expose a TCP address.');
    const module = await server.ssrLoadModule('/ber39-overlay-probe.tsx') as { OverlayProbe: React.ComponentType };
    const errors: string[] = [];
    page.on('console', message => { if (message.type() === 'error' || message.type() === 'warning') errors.push(message.text()); });
    page.on('pageerror', error => errors.push(error.message));
    const origin = `http://127.0.0.1:${address.port}`;
    await page.goto(`${origin}/ber39-overlay-probe.html`);
    await page.evaluate(markup => {
      document.getElementById('ber39-overlay-root')!.innerHTML = markup;
      window.dispatchEvent(new Event('ber39-overlay-markup-ready'));
    }, renderToString(React.createElement(module.OverlayProbe)));
    await page.waitForFunction(() => (window as Window & { __ber39OverlayHydrated?: boolean }).__ber39OverlayHydrated === true);
    return { errors, close: async () => { await server.close(); await rm(cacheDir, { recursive: true, force: true }); } };
  } catch (error) {
    await server.close();
    await rm(cacheDir, { recursive: true, force: true });
    throw error;
  }
}

for (const theme of ['light', 'dark'] as const) {
  test.describe(`DropdownMenu / HelpLabel · ${theme}`, () => {
    test.beforeEach(async ({ page }) => {
      page.on('pageerror', error => { throw error; });
      await page.route('**/*', route => {
        const request = route.request();
        const url = new URL(request.url());
        if (!['127.0.0.1', 'localhost'].includes(url.hostname) || !['GET', 'HEAD'].includes(request.method())) {
          throw new Error(`Unexpected external or mutating request: ${request.method()} ${url.origin}${url.pathname}`);
        }
        return route.continue();
      });
      await page.goto(`/?view=components&theme=${theme}`);
      await expect(page.getByRole('heading', { name: 'Componentes', exact: true })).toBeVisible();
    });

    test('DropdownMenu typeahead selects enabled items and skips disabled matches', async ({ page }) => {
      const trigger = page.getByRole('button', { name: 'Menu de ações', exact: true });
      await trigger.scrollIntoViewIfNeeded();
      await trigger.focus();
      await trigger.press('ArrowDown');
      const menu = page.getByRole('menu', { name: 'Menu de ações', exact: true });
      await expect(menu).toBeFocused();
      await expect(menu.locator('[data-active="true"]')).toContainText('Revisar exemplo');
      await menu.press('d');
      await expect(menu.locator('[data-active="true"]')).toContainText('Revisar exemplo');
      await menu.press('r');
      await expect(menu.locator('[data-active="true"]')).toContainText('Revisar exemplo');
      await menu.press('Enter');
      await expect(menu).toHaveCount(0);
      await expect(trigger).toBeFocused();
      await expect(page.getByText('Exemplo marcado para revisão.', { exact: true })).toBeVisible();
    });

    test('HelpLabel exposes its description on hover, focus and Escape dismissal', async ({ page }, info) => {
      await page.goto(`/data-patterns.html?theme=${theme}`);
      const help = page.getByRole('button', { name: 'Atividade no período', exact: true });
      const tooltip = page.getByRole('tooltip');
      if (info.project.name === 'mobile') await help.tap();
      else await help.hover();
      await expect(tooltip).toContainText('Operações concluídas');
      await expect(help).toHaveAttribute('aria-describedby', await tooltip.getAttribute('id') ?? '');
      await page.keyboard.press('Escape');
      await expect(tooltip).toHaveCount(0);
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
      await help.focus();
      await expect(tooltip).toBeVisible();
      await help.press('Escape');
      await expect(tooltip).toHaveCount(0);
      await expect(help).toBeFocused();
    });
  });
}

test('Select, DropdownMenu and Tooltip retain controlled authority, instance IDs and SSR hydration', async ({ page }) => {
  const { close, errors } = await openOverlayProbe(page);
  try {
    await expect(page.getByRole('heading', { name: 'Overlay probe', exact: true })).toBeVisible();
    expect(errors.filter(error => /hydration|mismatch|warning/i.test(error))).toEqual([]);

    const rejectedSelect = page.getByRole('button', { name: 'Rejected Select: Auto', exact: true });
    await rejectedSelect.press('ArrowDown');
    await page.getByRole('listbox', { name: 'Rejected Select', exact: true }).getByRole('option', { name: 'Review', exact: true }).click();
    await expect(page.getByTestId('rejected-request')).toHaveText('review');
    await expect(page.getByRole('button', { name: 'Rejected Select: Auto', exact: true })).toBeVisible();

    const delayedSelect = page.getByRole('button', { name: 'Delayed Select: Auto', exact: true });
    await delayedSelect.press('ArrowDown');
    const delayedList = page.getByRole('listbox', { name: 'Delayed Select', exact: true });
    const firstSelectId = await delayedList.getAttribute('id');
    await delayedList.getByRole('option', { name: 'Review', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Delayed Select: Auto', exact: true })).toBeVisible();
    await expect(page.getByTestId('delayed-request')).toHaveText('review');
    await page.getByRole('button', { name: 'Aceitar seleção atrasada', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Delayed Select: Review', exact: true })).toBeVisible();

    await rejectedSelect.press('ArrowDown');
    const rejectedList = page.getByRole('listbox', { name: 'Rejected Select', exact: true });
    const secondSelectId = await rejectedList.getAttribute('id');
    expect(firstSelectId).toBeTruthy();
    expect(secondSelectId).toBeTruthy();
    expect(firstSelectId).not.toBe(secondSelectId);
    await page.keyboard.press('Escape');

    const rejectedMenu = page.getByRole('button', { name: 'Rejected Menu', exact: true });
    await rejectedMenu.press('ArrowDown');
    await expect(page.getByRole('menu', { name: 'Rejected Menu', exact: true })).toHaveCount(0);
    await expect(page.getByTestId('rejected-menu-request')).toHaveText('true');

    const menuA = page.getByRole('button', { name: 'Controlled Menu A', exact: true });
    await menuA.press('ArrowDown');
    const openMenuA = page.getByRole('menu', { name: 'Controlled Menu A', exact: true });
    await expect(openMenuA).toBeFocused();
    await openMenuA.press('r');
    await expect(openMenuA.locator('[data-active="true"]')).toContainText('Revisar exemplo');
    await openMenuA.press('r');
    await expect(openMenuA.locator('[data-active="true"]')).toContainText('Revisão longa');
    await page.waitForTimeout(550);
    await openMenuA.press('r');
    await expect(openMenuA.locator('[data-active="true"]')).toContainText('Revisar exemplo');
    const firstMenuId = await menuA.getAttribute('aria-controls');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu', { name: 'Controlled Menu A', exact: true })).toHaveCount(0);

    const menuB = page.getByRole('button', { name: 'Controlled Menu B', exact: true });
    await menuB.press('ArrowDown');
    const secondMenuId = await menuB.getAttribute('aria-controls');
    expect(firstMenuId).toBeTruthy();
    expect(secondMenuId).toBeTruthy();
    expect(firstMenuId).not.toBe(secondMenuId);
    await page.keyboard.press('Escape');

    const tooltipA = page.getByRole('button', { name: 'Tooltip A', exact: true });
    await tooltipA.focus();
    const firstTooltip = page.getByRole('tooltip', { name: 'Tooltip A description', exact: true });
    await expect(firstTooltip).toBeVisible();
    const firstTooltipId = await tooltipA.getAttribute('aria-describedby');
    await page.keyboard.press('Escape');
    const tooltipB = page.getByRole('button', { name: 'Tooltip B', exact: true });
    await tooltipB.focus();
    const secondTooltip = page.getByRole('tooltip', { name: 'Tooltip B description', exact: true });
    await expect(secondTooltip).toBeVisible();
    const secondTooltipId = await tooltipB.getAttribute('aria-describedby');
    expect(firstTooltipId).toBeTruthy();
    expect(secondTooltipId).toBeTruthy();
    expect(firstTooltipId).not.toBe(secondTooltipId);
    expect(errors).toEqual([]);
  } finally {
    await close();
  }
});

test('Select collision remains contained in RTL at a CSS 200% zoom proxy', async ({ page }) => {
  test.info().annotations.push({ type: 'limitation', description: 'CSS zoom:2 proxy only; native browser zoom and physical devices remain unvalidated.' });
  await page.setViewportSize({ width: 640, height: 1000 });
  await page.goto('/?view=components&theme=light');
  await page.evaluate(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.style.zoom = '2';
  });
  const trigger = page.getByRole('button', { name: 'Modo de trabalho: Auto', exact: true });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.press('ArrowDown');
  const list = page.getByRole('listbox', { name: 'Modo de trabalho', exact: true });
  await expect(list).toBeVisible();
  const bounds = await list.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, viewportWidth: innerWidth, viewportHeight: innerHeight };
  });
  expect(bounds.left).toBeGreaterThanOrEqual(0);
  expect(bounds.right).toBeLessThanOrEqual(bounds.viewportWidth);
  expect(bounds.top).toBeGreaterThanOrEqual(0);
  expect(bounds.bottom).toBeLessThanOrEqual(bounds.viewportHeight);
});
