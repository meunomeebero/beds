import { expect, test, type Page } from '@playwright/test';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { createServer as createNetServer } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const requireFromSpec = createRequire(import.meta.url);
const worktreeRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const dependencyRoot = join(worktreeRoot, 'node_modules');
const optionListHarnessPort = 5321;

function resolveDependency(specifier: string) {
  return requireFromSpec.resolve(specifier, { paths: [dependencyRoot] });
}

async function assertPortAvailable(port: number) {
  await new Promise<void>((resolve, reject) => {
    const probe = createNetServer();
    probe.once('error', reject);
    probe.listen(port, '127.0.0.1', () => probe.close(() => resolve()));
  });
}

async function createOptionListHarness() {
  const tempRoot = await mkdtemp(join(tmpdir(), 'ber43-option-list-'));
  let server: { listen: () => Promise<unknown>; close: () => Promise<unknown> } | undefined;
  try {
    await writeFile(join(tempRoot, 'index.html'), '<!doctype html><html><body><main id="root"></main><script type="module" src="/main.jsx"></script></body></html>');
    await writeFile(join(tempRoot, 'main.jsx'), String.raw`
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { OptionList } from 'beds';

const h = React.createElement;

function Harness() {
  const [expanded, setExpanded] = useState({ alpha: false, beta: true });
  const [checked, setChecked] = useState({ alpha: false, beta: false });
  const [feedback, setFeedback] = useState({ alpha: '', beta: '' });
  const timers = useRef(new Set());
  useEffect(() => () => { timers.current.forEach(timer => window.clearTimeout(timer)); }, []);
  const schedule = callback => {
    const timer = window.setTimeout(() => { timers.current.delete(timer); callback(); }, 180);
    timers.current.add(timer);
  };
  const changeDisclosure = (id, next) => {
    if (id === 'alpha' && next) {
      setFeedback(current => ({ ...current, alpha: 'Alpha aguardando aceitação.' }));
      schedule(() => {
        setExpanded(current => ({ ...current, alpha: true }));
        setFeedback(current => ({ ...current, alpha: 'Alpha aceita.' }));
      });
      return;
    }
    if (id === 'beta' && !next) {
      setFeedback(current => ({ ...current, beta: 'Beta rejeitada; painel mantido aberto.' }));
      return;
    }
    setExpanded(current => ({ ...current, [id]: next }));
  };
  const changeSwitch = (id, next) => {
    if (id === 'alpha') {
      setFeedback(current => ({ ...current, alpha: 'Alpha aguardando aceitação.' }));
      schedule(() => {
        setChecked(current => ({ ...current, alpha: next }));
        setFeedback(current => ({ ...current, alpha: 'Alpha aceita.' }));
      });
      return;
    }
    setFeedback(current => ({ ...current, beta: 'Beta rejeitada; valor mantido.' }));
  };
  const items = [
    { id: 'alpha', title: 'Alpha', options: { title: 'Opções de Alpha', toggleLabel: 'Opções de Alpha', expanded: expanded.alpha, onExpandedChange: next => changeDisclosure('alpha', next), feedback: feedback.alpha, items: [
      { id: 'alpha-accepted', label: 'Aceitar alteração Alpha', description: 'A aceitação é controlada pelo host.', checked: checked.alpha, onChange: next => changeSwitch('alpha', next) },
    ] } },
    { id: 'beta', title: 'Beta', options: { title: 'Opções de Beta', toggleLabel: 'Opções de Beta', expanded: expanded.beta, onExpandedChange: next => changeDisclosure('beta', next), feedback: feedback.beta, items: [
      { id: 'beta-rejected', label: 'Rejeitar alteração Beta', checked: checked.beta, onChange: next => changeSwitch('beta', next) },
      { id: 'beta-disabled', label: 'Beta opção desabilitada', checked: true, disabled: true, onChange: () => undefined },
    ] } },
  ];
  return h(OptionList, { title: 'BER-43 OptionList harness', items, emptyMessage: 'Sem opções' });
}

createRoot(document.getElementById('root')).render(h(Harness));
`);

    const vite = await import(pathToFileURL(resolveDependency('vite')).href);
    const reactPluginModule = await import(pathToFileURL(resolveDependency('@vitejs/plugin-react')).href);
    const reactRoot = dirname(resolveDependency('react'));
    const reactDomRoot = dirname(resolveDependency('react-dom'));
    server = await vite.createServer({
      root: tempRoot,
      cacheDir: join(tempRoot, '.vite'),
      plugins: [reactPluginModule.default()],
      resolve: {
        alias: [
          { find: 'react/jsx-runtime', replacement: resolveDependency('react/jsx-runtime') },
          { find: 'react/jsx-dev-runtime', replacement: resolveDependency('react/jsx-dev-runtime') },
          { find: 'react-dom/client', replacement: resolveDependency('react-dom/client') },
          { find: 'motion/react', replacement: resolveDependency('motion/react') },
          { find: 'beds', replacement: join(worktreeRoot, 'packages/beds/src/index.ts') },
          { find: 'react', replacement: reactRoot },
          { find: 'react-dom', replacement: reactDomRoot },
        ],
        dedupe: ['react', 'react-dom'],
      },
      server: { host: '127.0.0.1', port: optionListHarnessPort, strictPort: true, fs: { allow: [tempRoot, worktreeRoot, dependencyRoot] } },
    });
    if (!server) throw new Error('OptionList harness server was not created.');
    return { tempRoot, server };
  } catch (error) {
    if (server) await server.close();
    await rm(tempRoot, { recursive: true, force: true });
    throw error;
  }
}

function trackFinancialRequests(page: Page) {
  const requests: string[] = [];
  const baseOrigin = new URL(process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5283').origin;
  page.on('request', request => {
    const url = new URL(request.url());
    const target = `${request.method()} ${url.pathname}`;
    const isNetworkAction = request.resourceType() === 'fetch' || request.resourceType() === 'xhr';
    if (url.origin !== baseOrigin || request.method() !== 'GET' || isNetworkAction && /\/api(?:\/|$)|billing|checkout|payment|subscription|purchase/.test(target)) requests.push(target);
  });
  return requests;
}

async function openCreditsMenu(page: Page) {
  const navigation = page.getByRole('button', { name: 'Navigation', exact: true });
  if (await navigation.isVisible()) await navigation.click();
  const trigger = page.getByRole('button', { name: 'Menu de Luísa Costa', exact: true });
  await trigger.focus();
  await trigger.press('Enter');
  return page.getByRole('dialog', { name: 'Menu do usuário', exact: true });
}

async function openCreditScenario(page: Page, choice?: string) {
  await page.goto('/?view=account-credits&theme=dark');
  if (choice) {
    await page.getByRole('button', { name: 'Estado do saldo' }).click();
    await page.getByRole('option', { name: choice, exact: true }).click();
  }
  return openCreditsMenu(page);
}

test('records keep literal data states and host-controlled option state', async ({ page }) => {
  const financialRequests = trackFinancialRequests(page);
  await page.goto('/?view=records&theme=dark');

  const table = page.getByRole('region', { name: 'Sincronização de dados', exact: true });
  await expect(table.locator('dt')).toHaveText(['Documentos sincronizados', 'Coleções sincronizadas']);
  await expect(table.locator('dd')).toHaveText(['15', '12']);
  await expect(table.getByRole('link', { name: 'Ver os 15 documentos no catálogo' })).toHaveAttribute('href', '?view=components');

  const literalStates = page.getByRole('region', { name: 'Valores indisponíveis e zero', exact: true });
  await expect(literalStates.locator('dd')).toHaveText(['0', 'Não informado']);
  await expect(literalStates.locator('dd').nth(0).getByRole('link')).toHaveCount(0);
  await expect(literalStates.locator('dd').nth(1).getByRole('link')).toHaveCount(0);

  await page.getByRole('switch', { name: 'Mostrar estado vazio', exact: true }).click();
  await expect(table.locator('dl')).toHaveCount(0);
  await expect(table).toContainText('Nenhum dado sincronizado neste exemplo.');
  await page.getByRole('switch', { name: 'Mostrar estado vazio', exact: true }).click();
  await expect(table.locator('dl')).toBeVisible();

  const list = page.getByRole('region', { name: 'Espaços conectados', exact: true });
  const disclosure = list.getByRole('button', { name: 'Opções do Estúdio de Carreira', exact: true });
  const documents = list.getByRole('switch', { name: 'Compartilhar documentos', exact: true });
  const updates = list.getByRole('switch', { name: 'Receber atualizações', exact: true });
  await expect(list.getByRole('listitem')).toHaveCount(3);
  await expect(disclosure).toHaveAttribute('aria-expanded', 'true');
  await expect(disclosure).toHaveAttribute('aria-controls', /.+/);
  await disclosure.click();
  await expect(disclosure).toHaveAttribute('aria-expanded', 'false');
  await expect(list.getByRole('switch')).toHaveCount(0);
  await expect(list.locator('.es-option-details')).toBeHidden();
  await disclosure.click();
  await expect(documents).toBeChecked();
  await expect(updates).not.toBeChecked();

  await documents.click();
  await expect(documents).not.toBeChecked();
  await expect(list.getByRole('status')).toHaveText('Compartilhamento desativado somente neste exemplo.');
  await disclosure.click();
  await disclosure.click();
  await expect(documents).not.toBeChecked();

  await page.getByRole('switch', { name: 'Desabilitar as opções', exact: true }).click();
  await expect(documents).toBeDisabled();
  await expect(updates).toBeDisabled();
  await documents.evaluate(element => (element as HTMLInputElement).click());
  await expect(documents).not.toBeChecked();
  await expect(list.getByRole('status')).toHaveText('Compartilhamento desativado somente neste exemplo.');

  expect(financialRequests).toEqual([]);
});

test('public OptionList keeps independent disclosures through controlled lag, rejection and collapse', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'The temporary harness owns exclusive port 5321 and runs once; the surrounding focal spec covers mobile.');
  await assertPortAvailable(optionListHarnessPort);
  let tempRoot: string | undefined;
  let server: { listen: () => Promise<unknown>; close: () => Promise<unknown> } | undefined;
  const requests: string[] = [];
  const harnessOrigin = `http://127.0.0.1:${optionListHarnessPort}`;
  try {
    const harness = await createOptionListHarness();
    tempRoot = harness.tempRoot;
    server = harness.server;
    await harness.server.listen();
    page.on('request', request => {
      const url = new URL(request.url());
      if (url.origin !== harnessOrigin || request.method() !== 'GET' || request.resourceType() === 'fetch' || request.resourceType() === 'xhr') requests.push(`${request.method()} ${url.href}`);
    });
    await page.goto(harnessOrigin);

    const list = page.getByRole('region', { name: 'BER-43 OptionList harness', exact: true });
    const alpha = list.getByRole('listitem').nth(0);
    const beta = list.getByRole('listitem').nth(1);
    const alphaDisclosure = alpha.getByRole('button', { name: 'Opções de Alpha', exact: true });
    const betaDisclosure = beta.getByRole('button', { name: 'Opções de Beta', exact: true });
    const alphaDetails = alpha.locator('.es-option-details');
    const betaDetails = beta.locator('.es-option-details');
    const alphaControls = await alphaDisclosure.getAttribute('aria-controls');
    const betaControls = await betaDisclosure.getAttribute('aria-controls');
    expect(alphaControls).toBeTruthy();
    expect(betaControls).toBeTruthy();
    expect(alphaControls).not.toBe(betaControls);
    await expect(list.locator('button button, button a, a button, a a')).toHaveCount(0);
    await expect(alphaDisclosure).toHaveAttribute('aria-expanded', 'false');
    await expect(betaDisclosure).toHaveAttribute('aria-expanded', 'true');
    await expect(alphaDetails).toBeHidden();
    await expect(betaDetails).toBeVisible();

    await alphaDisclosure.click();
    expect(await alphaDisclosure.getAttribute('aria-expanded')).toBe('false');
    await expect(alphaDetails).toBeHidden();
    await expect.poll(() => alphaDisclosure.getAttribute('aria-expanded'), { timeout: 1000 }).toBe('true');
    await expect(alphaDetails).toBeVisible();
    await expect(betaDisclosure).toHaveAttribute('aria-expanded', 'true');

    const alphaSwitch = alpha.getByRole('switch', { name: 'Aceitar alteração Alpha', exact: true });
    await expect(alphaSwitch).not.toBeChecked();
    await alphaSwitch.click();
    expect(await alphaSwitch.isChecked()).toBe(false);
    await expect.poll(() => alphaSwitch.isChecked(), { timeout: 1000 }).toBe(true);

    const betaRejected = beta.getByRole('switch', { name: 'Rejeitar alteração Beta', exact: true });
    const betaDisabled = beta.getByRole('switch', { name: 'Beta opção desabilitada', exact: true });
    await expect(betaRejected).not.toBeChecked();
    await betaRejected.click();
    await expect(betaRejected).not.toBeChecked();
    await expect(beta.getByRole('status')).toHaveText('Beta rejeitada; valor mantido.');
    await expect(betaDisabled).toBeDisabled();
    await betaDisabled.evaluate(element => (element as HTMLInputElement).click());
    await expect(betaDisabled).toBeChecked();

    await betaDisclosure.click();
    await expect(betaDisclosure).toHaveAttribute('aria-expanded', 'true');
    await expect(betaDetails).toBeVisible();
    await expect(beta.getByRole('status')).toHaveText('Beta rejeitada; painel mantido aberto.');

    await alphaDisclosure.click();
    await expect(alphaDisclosure).toHaveAttribute('aria-expanded', 'false');
    await expect(alphaDetails).toBeHidden();
    await expect(alpha.getByRole('switch')).toHaveCount(0);
    await expect(alphaDisclosure).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(betaDisclosure).toBeFocused();
    await expect(betaDisclosure).toHaveAttribute('aria-expanded', 'true');
    expect(requests).toEqual([]);
  } finally {
    if (server) await server.close();
    if (tempRoot) await rm(tempRoot, { recursive: true, force: true });
    await assertPortAvailable(optionListHarnessPort);
  }
});

test('pricing keeps typed literal terms and caller-owned local outcomes', async ({ page }) => {
  const financialRequests = trackFinancialRequests(page);
  await page.goto('/?view=pricing&theme=dark&brand=curriculol');

  const pro = page.locator('.es-pricing-card[data-featured="true"]');
  const starter = page.getByRole('article', { name: 'Essencial', exact: true });
  const price = pro.locator('.es-pricing-price');
  const action = pro.getByRole('button', { name: 'Escolher Pro', exact: true });
  await expect(price).toHaveText('R$ 49/mês');
  await expect(price.locator('.es-animated-number')).toHaveCount(0);
  await expect(action).toHaveAccessibleDescription('Cobrança mensal. Valor demonstrativo.');

  await action.click();
  await expect(action).toBeDisabled();
  await expect(starter.getByRole('button')).toBeDisabled();
  await expect(pro.getByRole('status')).toContainText('Nenhuma cobrança será realizada');
  await expect(price).toHaveText('R$ 49/mês');

  await page.getByRole('button', { name: 'Simular falha', exact: true }).click();
  await expect(action).toBeEnabled();
  await expect(pro.getByRole('status')).toContainText('nenhuma cobrança foi realizada');
  await expect(price).toHaveText('R$ 49/mês');
  await expect(pro.getByRole('listitem')).toHaveCount(3);

  await action.click();
  await page.getByRole('button', { name: 'Concluir simulação', exact: true }).click();
  await expect(pro.getByRole('status')).toContainText('Nenhuma assinatura foi criada');
  await expect(action).toBeDisabled();

  await page.getByRole('button', { name: 'Restaurar exemplos', exact: true }).click();
  await page.getByRole('switch', { name: 'Testar texto longo', exact: true }).click();
  await expect(price).toHaveText('R$ 1.249,90 por mês');
  await expect(price.locator('.es-animated-number')).toHaveCount(1);
  expect(financialRequests).toEqual([]);
});

test('account credits preserve literal balance, explicit limits and local recovery', async ({ page }) => {
  const financialRequests = trackFinancialRequests(page);
  let menu = await openCreditScenario(page);
  let credits = menu.getByRole('region', { name: 'Plano de exemplo', exact: true });
  await expect(credits.getByText('12.500', { exact: true })).toBeVisible();
  await expect(credits.getByRole('meter', { name: 'Créditos', exact: true })).toHaveAttribute('aria-valuenow', '12500');
  await expect(credits.getByRole('meter', { name: 'Créditos', exact: true })).toHaveAttribute('aria-valuemax', '20000');
  await expect(credits.locator('.es-animated-number')).toHaveCount(0);

  await menu.getByRole('button', { name: 'Ver créditos', exact: true }).click();
  await expect(menu).toBeHidden();
  await expect(page.getByRole('status').filter({ hasText: 'Nenhuma compra' })).toBeVisible();

  menu = await openCreditScenario(page, 'Saldo zero');
  credits = menu.locator('.es-account-credits');
  await expect(credits.getByText('0', { exact: true })).toBeVisible();
  await expect(credits.getByRole('meter', { name: 'Créditos', exact: true })).toHaveAttribute('aria-valuenow', '0');
  await expect(credits.locator('[data-filled]')).toHaveCount(0);
  menu = await openCreditScenario(page, 'Sem limite informado');
  credits = menu.locator('.es-account-credits');
  await expect(credits.getByText('12.500', { exact: true })).toBeVisible();
  await expect(credits.getByRole('meter')).toHaveCount(0);
  menu = await openCreditScenario(page, 'Carregando');
  credits = menu.locator('.es-account-credits');
  await expect(credits).toContainText('Consultando saldo…');
  await expect(credits.getByRole('meter')).toHaveCount(0);
  await expect(credits.locator('.es-animated-number')).toHaveCount(0);
  await expect(credits.getByRole('button', { name: 'Ver créditos', exact: true })).toBeDisabled();
  menu = await openCreditScenario(page, 'Erro com recuperação');
  credits = menu.locator('.es-account-credits');
  await expect(credits).toContainText('Não foi possível consultar');
  await expect(credits.getByRole('meter')).toHaveCount(0);
  await expect(credits.getByText('12.500', { exact: true })).toHaveCount(0);
  await credits.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
  await expect(credits.getByRole('meter', { name: 'Créditos', exact: true })).toHaveAttribute('aria-valuenow', '12500');
  await expect(credits.getByText('12.500', { exact: true })).toBeVisible();

  expect(financialRequests).toEqual([]);
});
