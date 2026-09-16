import { fileURLToPath } from 'node:url';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const themes = ['dark', 'light'] as const;
type Theme = typeof themes[number];
const evidenceDirectory = fileURLToPath(new URL('./evidence/', import.meta.url));

async function ready(page: Page, theme: Theme) {
  await page.goto(`/?view=mcp&theme=${theme}`);
  await expect(page.getByRole('heading', { name: 'MCP do Curriculol', exact: true })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

async function openNavigation(page: Page) {
  const opener = page.getByRole('button', { name: 'Navegação', exact: true });
  if (await opener.isVisible()) await opener.click();
}

async function capture(page: Page, info: TestInfo, name: string) {
  const path = `${evidenceDirectory}${name}-${info.project.name}.png`;
  await page.screenshot({ path, animations: 'disabled', caret: 'hide' });
  await info.attach(`${name}-${info.project.name}`, { path, contentType: 'image/png' });
}

test('MCP composition keeps the DS shell and its measured connection anatomy in both themes', async ({ page }, info) => {
  for (const theme of themes) {
    await ready(page, theme);
    const root = page.locator('.es-root');
    const shell = page.locator('.es-app-shell');
    await expect(root).toHaveAttribute('data-theme', theme);
    await expect(shell).toHaveCSS('background-color', theme === 'dark' ? 'rgb(25, 25, 25)' : 'rgb(255, 255, 255)');
    await expect(page.locator('.es-page')).toHaveCSS('max-width', '720px');
    await expect(page.getByRole('heading', { name: 'MCP do Curriculol', exact: true })).toHaveCSS('font-size', '15px');
    await expect(page.getByRole('heading', { name: 'MCP do Curriculol', exact: true })).toHaveCSS('line-height', '24px');
    await expect(page.locator('.es-page-outer')).toHaveCSS('padding-top', '16px');
    await expect(page.getByRole('radio', { name: 'Pedir aprovação', exact: true })).toBeChecked();
    await expect(page.getByRole('tab', { name: 'Claude', exact: true })).toHaveAttribute('aria-selected', 'true');
    const connectionTabs = page.locator('.es-tabs[data-variant="connection"]');
    await expect(connectionTabs).toHaveCSS('border-top-left-radius', '16px');
    await expect(connectionTabs.locator('.es-tabs-connection-strip')).toHaveCSS('padding-top', '8px');
    await expect(connectionTabs.getByRole('tablist')).toHaveCSS('border-top-left-radius', '10px');
    await expect(connectionTabs.getByRole('tablist')).toHaveCSS('min-height', '36px');
    await expect(connectionTabs.getByRole('tabpanel')).toHaveCSS('padding-top', '16px');
    await expect(connectionTabs.getByRole('tabpanel')).toHaveCSS('padding-left', info.project.name === 'mobile' ? '16px' : '32px');
    const tabWidths = await connectionTabs.getByRole('tab').evaluateAll(tabs => tabs.map(tab => tab.getBoundingClientRect().width));
    expect(Math.max(...tabWidths) - Math.min(...tabWidths)).toBeLessThan(1);
    await expect(page.getByText('A escolha desta tela não é salva.', { exact: true })).toHaveCount(0);
    await capture(page, info, `mcp-content-${theme}`);
    await openNavigation(page);
    const sidebar = page.locator('.es-sidebar');
    await expect(sidebar.getByRole('button', { name: 'MCP', exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(sidebar.getByRole('button', { name: 'MCP', exact: true }).locator('svg')).toHaveCSS('fill', 'none');
    await expect(sidebar.locator('.es-sidebar-footer').getByRole('button', { name: '8 créditos', exact: true })).toBeVisible();
    if (info.project.name === 'mobile') await capture(page, info, `mcp-navigation-${theme}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  }
});

test('MCP client, approval and redirect URL controls are local and require no network service', async ({ page }) => {
  const externalRequests: string[] = [];
  page.on('request', request => {
    if (['fetch', 'xhr'].includes(request.resourceType()) && !request.url().startsWith('http://127.0.0.1:5283/')) externalRequests.push(request.url());
  });
  await ready(page, 'dark');
  await page.getByRole('radio', { name: 'Aplicar diretamente', exact: true }).check();
  await expect(page.getByRole('radio', { name: 'Aplicar diretamente', exact: true })).toBeChecked();
  await page.getByRole('tab', { name: 'ChatGPT', exact: true }).click();
  await expect(page.getByRole('tabpanel').filter({ hasText: 'Adicione o endpoint remoto ao conector MCP' })).toBeVisible();
  await page.getByRole('tab', { name: 'Codex', exact: true }).click();
  const codexCommand = page.locator('code').filter({ hasText: "codex mcp add curriculol --url 'https://api.curricu.lol/mcp'" });
  await expect(codexCommand).toBeVisible();
  await expect(codexCommand).toContainText("codex mcp login curriculol --scopes 'profile.read,credits.read,job.search,job.apply,email.send'");
  const redirect = page.getByRole('textbox', { name: 'URL de redirecionamento OAuth', exact: true });
  await redirect.fill('not-a-url');
  await page.getByRole('button', { name: 'Adicionar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Use uma URL HTTPS ou o callback local');
  await redirect.fill('http://127.0.0.1/callback');
  await page.getByRole('button', { name: 'Adicionar', exact: true }).click();
  await expect(page.locator('.es-notice')).toContainText('URL de retorno adicionada apenas nesta prévia');
  await expect(page.getByRole('region', { name: 'URLs permitidas nesta prévia', exact: true })).toContainText('http://127.0.0.1/callback');
  await page.getByRole('button', { name: 'Simular criação de credenciais', exact: true }).click();
  await expect(page.locator('.es-notice')).toContainText('Nenhuma credencial foi criada');
  expect(externalRequests).toEqual([]);
});

test('Portuguese copy feedback recovers without clipped keyboard focus', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await ready(page, 'light');
  const copy = page.getByRole('button', { name: /^Copiar / }).first();
  await copy.focus();
  await expect(copy).toHaveCSS('outline-offset', '-3px');
  const live = page.locator('.es-code-field').first().getByRole('status');
  await expect(live).toHaveCount(1);
  await page.evaluate(() => {
    Object.defineProperty(navigator.clipboard, 'writeText', { configurable: true, value: async () => { throw new Error('Synthetic clipboard failure'); } });
  });
  await copy.click();
  await expect(page.getByRole('alert')).toContainText('copie manualmente');
  await page.evaluate(() => {
    Object.defineProperty(navigator.clipboard, 'writeText', { configurable: true, value: async () => {} });
  });
  await copy.click();
  await expect(copy).toContainText('Copiado');
  await expect(live).toContainText('Copiado para a área de transferência');
  await expect(page.getByRole('alert')).toHaveCount(0);
});
