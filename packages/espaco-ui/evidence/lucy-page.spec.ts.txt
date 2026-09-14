import { expect, test, type Page, type TestInfo } from '@playwright/test';

// Lucy changes composition and labels, preserving @espaco/ui 0.1.1.
// The legacy page is not a geometry, font or screenshot baseline.
const themes = ['dark', 'light'] as const;
type Theme = typeof themes[number];
const title = /Como posso ajudar você\?/;
const prompts = ['Adaptar meu currículo a uma vaga', 'Entender minha análise ATS', 'Revisar meu resumo profissional'];

async function ready(page: Page, theme: Theme, alias = false) {
  await page.goto(alias ? `/?view=home&tab=lucy&theme=${theme}` : `/?view=lucy&theme=${theme}`);
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}
async function openNavigation(page: Page) {
  const opener = page.getByRole('button', { name: 'Navegação', exact: true });
  if (await opener.isVisible()) await opener.click();
}
async function capture(page: Page, info: TestInfo, name: string) {
  const path = info.outputPath(`${name}-${info.project.name}.png`);
  await page.screenshot({ path, animations: 'disabled', caret: 'hide' });
  await info.attach(`${name}-${info.project.name}`, { path, contentType: 'image/png' });
}

test('Lucy composes Portuguese content with the existing DS in both themes', async ({ page }, info) => {
  await page.goto('/?view=components');
  await expect(page.getByRole('heading', { name: 'Componentes', exact: true })).toBeVisible();
  const catalogNavigation = page.getByRole('button', { name: 'Navigation', exact: true });
  if (await catalogNavigation.isVisible()) await catalogNavigation.click();
  await page.getByRole('link', { name: 'Página da Lucy', exact: true }).click();
  await expect(page).toHaveURL(/\?view=lucy$/);
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  for (const theme of themes) {
    await ready(page, theme);
    const root = page.locator('.es-root');
    const shell = page.locator('.es-app-shell');
    const composer = page.locator('.es-composer');
    const heading = page.getByRole('heading', { name: title, exact: true });
    await expect(root).toHaveAttribute('data-theme', theme);
    await expect(shell).toHaveCSS('background-color', theme === 'dark' ? 'rgb(25, 25, 25)' : 'rgb(255, 255, 255)');
    await expect(shell).toHaveCSS('border-radius', '0px');
    await expect(root).toHaveCSS('font-family', /Espaco Inter/);
    await expect(page.locator('[data-variant="workspace"], .es-shell-presentation--workspace, .ds-root')).toHaveCount(0);
    const shellBounds = await shell.boundingBox();
    expect(shellBounds!.x).toBe(0); expect(shellBounds!.y).toBe(0);
    expect(shellBounds!.width).toBe(page.viewportSize()!.width);
    await expect(page.locator('.es-chat-layout')).toHaveCSS('max-width', '640px');
    await expect(heading).toHaveCSS('font-size', '16px');
    await expect(heading).toHaveCSS('line-height', '24px');
    await expect(heading).toHaveCSS('font-weight', '500');
    await expect(heading).toHaveCSS('color', theme === 'dark' ? 'rgb(212, 212, 212)' : 'rgb(55, 53, 46)');
    await expect(composer).toHaveCSS('border-radius', '20px');
    await expect(composer.locator('form')).toHaveCSS('min-height', '120px');
    await expect(composer.locator('form')).toHaveCSS('background-color', theme === 'dark' ? 'rgb(25, 25, 25)' : 'rgb(255, 255, 255)');
    await expect(composer.locator('textarea')).toHaveCSS('font-size', '14px');
    await expect(composer.locator('textarea')).toHaveCSS('line-height', '22.4px');
    const composerBounds = await composer.boundingBox();
    expect(composerBounds!.width).toBe(info.project.name === 'mobile' ? 358 : 640);
    await expect(page.getByRole('textbox', { name: 'Mensagem', exact: true })).toHaveAttribute('placeholder', 'Converse com a Lucy sobre seu próximo passo…');
    await expect(page.locator('.es-suggestion')).toHaveText(prompts);
    await expect(page.getByRole('button', { name: 'Nova conversa', exact: true })).toBeVisible();
    const mark = heading.locator('.es-brand-mark');
    await expect(mark.locator('rect').first()).toHaveCSS('fill', 'rgb(255, 161, 51)');
    await expect(mark.locator('rect')).toHaveCount(3);
    const bars = await mark.locator('rect').evaluateAll(elements => elements.map(element => ({ width: element.getAttribute('width'), height: element.getAttribute('height'), y: element.getAttribute('y') ?? '0' })));
    expect(bars).toEqual([{ width: '18', height: '4', y: '0' }, { width: '18', height: '4', y: '7' }, { width: '18', height: '4', y: '14' }]);
    await capture(page, info, `lucy-${theme}`);

    await openNavigation(page);
    const sidebar = page.locator('.es-sidebar');
    await expect(sidebar).toHaveCSS('width', '264px');
    await expect(sidebar).toHaveCSS('background-color', theme === 'dark' ? 'rgb(25, 25, 25)' : 'rgb(251, 250, 249)');
    await expect(sidebar.getByRole('button', { name: 'Marina Costa workspace menu', exact: true })).toBeVisible();
    const primary = sidebar.locator('.es-sidebar-section--primary');
    await expect(primary.getByRole('button')).toHaveText(['Início', 'Lucy']);
    await expect(primary.getByRole('button', { name: 'Lucy', exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(primary.getByRole('button', { name: 'Lucy', exact: true }).locator('svg')).toHaveCSS('fill', theme === 'dark' ? 'rgb(206, 206, 206)' : 'rgb(55, 53, 46)');
    await expect(primary.getByRole('button', { name: 'Início', exact: true }).locator('svg')).toHaveCSS('fill', 'none');
    expect(await primary.getByRole('button', { name: 'Lucy', exact: true }).evaluate(element => getComputedStyle(element, '::before').height)).toBe('31px');
    for (const copy of ['Seu espaço', 'Currículos', 'Análises', 'LinkedIn', 'Oportunidades', 'Buscar vagas', 'Candidaturas', 'Conversas', 'Próximo passo na carreira']) {
      await expect(sidebar.getByText(copy, { exact: true })).toBeVisible();
    }
    const item = sidebar.getByRole('button', { name: 'Currículos', exact: true });
    await expect(item).toHaveCSS('min-height', '31px');
    await expect(item).toHaveCSS('font-size', '14px');
    await expect(item).toHaveCSS('font-weight', '400');
    const credits = sidebar.locator('.es-sidebar-footer').getByRole('button', { name: '8 créditos', exact: true });
    await expect(credits).toBeVisible();
    const creditBounds = await credits.boundingBox(); const sidebarBounds = await sidebar.boundingBox();
    expect(sidebarBounds!.y + sidebarBounds!.height - creditBounds!.y - creditBounds!.height).toBeLessThanOrEqual(13);
    expect(creditBounds!.y).toBeGreaterThan(sidebarBounds!.y + sidebarBounds!.height * 0.8);
    if (info.project.name === 'mobile') await capture(page, info, `lucy-navigation-${theme}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  }
});

test('Lucy suggestions, context and local replies use existing controls', async ({ page }) => {
  const externalRequests: string[] = [];
  page.on('request', request => {
    if (['fetch', 'xhr'].includes(request.resourceType()) && !request.url().startsWith('http://127.0.0.1:5283/')) externalRequests.push(request.url());
  });
  for (const theme of themes) {
    await ready(page, theme);
    const input = page.getByRole('textbox', { name: 'Mensagem', exact: true });
    const send = page.getByRole('button', { name: 'Send message', exact: true });
    await expect(send).toBeDisabled();
    await page.getByRole('button', { name: prompts[0], exact: true }).click();
    await expect(input).toHaveValue(prompts[0]); await expect(send).toBeEnabled();
    const context = page.getByRole('button', { name: /^Contexto:/ });
    for (const option of ['Meu currículo', 'Vaga de interesse', 'Nenhum contexto']) {
      await context.click();
      await page.getByRole('option', { name: option, exact: true }).click();
      await expect(context).toContainText(option);
    }
    await send.click();
    await expect(page.locator('.es-chat-message[data-role="user"]')).toHaveText(prompts[0]);
    await expect(page.locator('.es-chat-message[data-role="assistant"]')).toContainText('Resposta de demonstração. Nenhuma IA foi chamada.');
    await expect(input).toBeVisible(); await expect(input).toHaveValue(''); await expect(send).toBeDisabled();
    await page.getByRole('button', { name: 'Nova conversa', exact: true }).click();
    await expect(page.locator('.es-chat-message')).toHaveCount(0);
    await expect(input).toHaveValue('');
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  }
  expect(externalRequests).toEqual([]);
});

test('Lucy account, collapse and drawer preserve existing DS behavior in both themes', async ({ page }, info) => {
  for (const theme of themes) {
    await ready(page, theme, true); await openNavigation(page);
    const sidebar = page.locator('.es-sidebar');
    const trigger = sidebar.getByRole('button', { name: 'Marina Costa workspace menu', exact: true });
    await trigger.click();
    const menu = page.locator('.es-account-menu');
    await expect(menu).toBeVisible();
    await expect(menu).toHaveCSS('width', '280px'); await expect(menu).toHaveCSS('border-radius', '12px');
    await expect(menu.locator('.es-account-action').first()).toHaveCSS('height', info.project.name === 'mobile' ? '44px' : '30px');
    await expect(menu.locator('.es-account-identity')).toHaveCSS('height', '48px');
    await expect(menu.locator('.es-account-identity strong')).toHaveCSS('font-weight', '400');
    await expect(menu.getByRole('radio', { name: theme === 'dark' ? 'Dark' : 'Light', exact: true })).toBeChecked();
    await capture(page, info, `lucy-account-${theme}`);
    await menu.getByRole('radio', { name: theme === 'dark' ? 'Light' : 'Dark', exact: true }).check();
    await expect(page.locator('.es-root')).toHaveAttribute('data-theme', theme === 'dark' ? 'light' : 'dark');
    await expect(menu).toBeVisible(); await page.keyboard.press('Escape');
    await expect(menu).not.toBeVisible(); await expect(trigger).toBeFocused();
    if (info.project.name === 'mobile') {
      await expect(page.locator('.es-app-main')).toHaveAttribute('inert', '');
      await page.keyboard.press('Escape'); await expect(sidebar).not.toBeVisible();
      await expect(page.getByRole('button', { name: 'Navegação', exact: true })).toBeFocused();
      await openNavigation(page); await sidebar.getByRole('button', { name: 'Lucy', exact: true }).click();
      await expect(sidebar).not.toBeVisible(); await expect(page.locator('.es-app-main')).not.toHaveAttribute('inert');
    } else {
      await sidebar.getByRole('button', { name: 'Collapse sidebar', exact: true }).click();
      await expect(sidebar).toHaveCSS('width', '62px');
      await sidebar.getByRole('button', { name: 'Expand sidebar', exact: true }).click();
      await expect(sidebar).toHaveCSS('width', '264px');
    }
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  }
});
