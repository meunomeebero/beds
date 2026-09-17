import { test, expect, type Locator } from '@playwright/test';

async function expectWithinViewport(popup: Locator) {
  const bounds = await popup.boundingBox();
  const viewport = popup.page().viewportSize()!;
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(15);
  expect(bounds!.y).toBeGreaterThanOrEqual(15);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width - 15);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height - 15);
}

for (const theme of ['light', 'dark'] as const) {
  test.describe(`Portable controls · ${theme}`, () => {
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

    test('Select preserves measured geometry, skips disabled options and restores focus', async ({ page }, testInfo) => {
      const trigger = page.getByRole('button', { name: 'Modo de trabalho: Auto', exact: true });
      await trigger.scrollIntoViewIfNeeded();
      await expect(trigger).toHaveCSS('min-height', '28px');
      await expect(page.getByRole('button', { name: 'Modo indisponível: Auto' })).toBeDisabled();
      await trigger.focus();
      await trigger.press('ArrowDown');
      const popup = page.getByRole('listbox', { name: 'Modo de trabalho', exact: true });
      await expect(popup).toBeFocused();
      await expect(popup).toHaveCSS('background-color', theme === 'dark' ? 'rgb(32, 32, 32)' : 'rgb(255, 255, 255)');
      await expect(popup).toHaveCSS('border-radius', '10px');
      expect((await popup.boundingBox())!.width).toBe(260);
      await expectWithinViewport(popup);
      expect(await popup.evaluate(element => element.matches(':popover-open'))).toBe(true);
      await expect(popup.getByRole('option', { name: /^Unavailable/ })).toHaveAttribute('aria-disabled', 'true');
      await popup.press('End');
      await expect(popup.locator('[data-active="true"]')).toContainText('Review a project with a deliberately long name');
      await popup.press('ArrowDown');
      await expect(popup.locator('[data-active="true"]')).toContainText('Auto');
      await popup.press('ArrowUp');
      await expect(popup.locator('[data-active="true"]')).toContainText('Review a project with a deliberately long name');
      await page.screenshot({ path: testInfo.outputPath(`select-${theme}.png`), fullPage: false });
      await popup.press('Home');
      await popup.press('ArrowDown');
      await popup.press('Enter');
      const selected = page.getByRole('button', { name: 'Modo de trabalho: Review', exact: true });
      await expect(selected).toBeFocused();
      await expect(page.getByText('Modo selecionado: Review.', { exact: true })).toBeVisible();
      await selected.press('Enter');
      await popup.press('Escape');
      await expect(popup).toHaveCount(0);
      await expect(selected).toBeFocused();
    });

    test('Dropdown and dialog dismiss correctly with keyboard, outside click and focus return', async ({ page }, testInfo) => {
      const menuTrigger = page.getByRole('button', { name: 'Menu de ações', exact: true });
      await menuTrigger.scrollIntoViewIfNeeded();
      await menuTrigger.focus();
      await menuTrigger.press('ArrowDown');
      const menu = page.getByRole('menu', { name: 'Menu de ações' });
      await expect(menu).toBeFocused();
      expect((await menu.boundingBox())!.width).toBe(160);
      await expectWithinViewport(menu);
      await menu.press('End');
      await expect(menu.locator('[data-active="true"]')).toContainText('Revisar exemplo');
      await expect(menu.getByRole('menuitem', { name: 'Ação indisponível' })).toHaveAttribute('aria-disabled', 'true');
      await menu.press('Enter');
      await expect(menu).toHaveCount(0);
      await expect(menuTrigger).toBeFocused();
      await expect(page.getByText('Exemplo marcado para revisão.', { exact: true })).toBeVisible();
      await menuTrigger.click();
      await menu.press('Tab');
      await expect(menu).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Ação com tooltip' })).toBeFocused();
      await menuTrigger.click();
      await page.getByRole('heading', { name: 'Menus e sobreposições', exact: true }).click();
      await expect(menu).toHaveCount(0);

      const dialogTrigger = page.getByRole('button', { name: 'Abrir diálogo', exact: true });
      await dialogTrigger.click();
      const dialog = page.getByRole('dialog', { name: 'Configuração demonstrativa' });
      await expect(dialog).toBeVisible();
      await expectWithinViewport(dialog);
      await expect(dialog).toHaveCSS('background-color', theme === 'dark' ? 'rgb(32, 32, 32)' : 'rgb(255, 255, 255)');
      const backgroundScroll = await page.evaluate(() => window.scrollY);
      await page.mouse.move(1, 1);
      await page.mouse.wheel(0, 240);
      const scrollAfterWheel = await page.evaluate(() => new Promise<number>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(window.scrollY)))));
      expect(scrollAfterWheel).toBe(backgroundScroll);
      const close = dialog.getByRole('button', { name: 'Fechar', exact: true });
      const save = dialog.getByRole('button', { name: 'Salvar diálogo' });
      await close.focus();
      await close.press('Shift+Tab');
      await expect(save).toBeFocused();
      await save.press('Tab');
      await expect(close).toBeFocused();
      await dialog.getByRole('textbox', { name: 'Nome no diálogo' }).fill('Exemplo revisado');
      await page.screenshot({ path: testInfo.outputPath(`dialog-${theme}.png`), fullPage: false });
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      await expect(dialogTrigger).toBeFocused();
      await dialogTrigger.click();
      await save.click();
      await expect(dialog).not.toBeVisible();
      await expect(dialogTrigger).toBeFocused();
      await expect(page.getByText('Diálogo salvo localmente: Exemplo revisado.', { exact: true })).toBeVisible();
      await dialogTrigger.click();
      await page.mouse.click(1, 1);
      await expect(dialog).not.toBeVisible();
      await expect(dialogTrigger).toBeFocused();
    });

    test('Command search filters, handles empty results, skips disabled actions and returns focus', async ({ page }) => {
      const trigger = page.getByRole('button', { name: 'Abrir comandos', exact: true });
      await trigger.click();
      const dialog = page.getByRole('dialog', { name: 'Comandos do catálogo' });
      const input = dialog.getByRole('combobox', { name: 'Comandos do catálogo' });
      await expect(input).toBeFocused();
      await expectWithinViewport(dialog);
      await input.press('End');
      await expect(dialog.locator('[data-active="true"]')).toContainText('Configurações');
      await input.press('ArrowDown');
      await expect(dialog.locator('[data-active="true"]')).toContainText('Fundamentos');
      await input.fill('resultado inexistente');
      await expect(dialog.getByRole('status')).toHaveText('Nenhum comando encontrado.');
      await input.press('Enter');
      await expect(dialog).toBeVisible();
      await input.fill('indisponível');
      await expect(dialog.getByRole('option')).toHaveAttribute('aria-disabled', 'true');
      await input.press('Enter');
      await expect(dialog).toBeVisible();
      await input.fill('Configurações');
      await input.press('Enter');
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
      await expect(page.getByText('Comando demonstrativo selecionado: Configurações.', { exact: true })).toBeVisible();
      await trigger.click();
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
    });

    test('Finite source variants preserve contextual geometry and welcome behavior', async ({ page }, testInfo) => {
      const touch = testInfo.project.name === 'mobile'; // coarse-pointer targets grow to 44px by contract (FOUNDATIONS objective fixes)
      const pill = page.getByRole('radiogroup', { name: 'Densidade demonstrativa' });
      const joined = page.getByRole('radiogroup', { name: 'Política do exemplo' });
      expect((await pill.boundingBox())!.height).toBe(24);
      expect((await joined.boundingBox())!.height).toBe(36); // joined segmented selector keeps contextual density on touch
      await joined.getByRole('radio', { name: 'Confirmar', exact: true }).focus();
      await page.keyboard.press('Space');
      await expect(joined.getByRole('radio', { name: 'Confirmar', exact: true })).toBeChecked();
      expect((await page.getByRole('tablist', { name: 'Seções do exemplo' }).boundingBox())!.height).toBe(touch ? 50 : 30);
      const connection = page.getByRole('tablist', { name: 'Clientes do exemplo' });
      expect((await connection.boundingBox())!.height).toBe(36); // connection strip keeps contextual density on touch
      await connection.getByRole('tab', { name: 'Web', exact: true }).click();
      await expect(page.getByRole('tabpanel', { name: 'Web', exact: true })).toBeVisible();
      const field = page.getByRole('textbox', { name: 'Endereço do exemplo', exact: true });
      expect((await field.boundingBox())!.height).toBe(40); // connection variant keeps its contextual 40px; 16px touch font still applies
      await expect(field).toHaveCSS('border-radius', '10px');
      await expect(field).toHaveCSS('font-size', touch ? '16px' : '14px');
      const connect = page.getByRole('button', { name: 'Conectar exemplo', exact: true });
      expect((await connect.boundingBox())!.height).toBe(40); // connection variant keeps its contextual 40px
      await expect(connect).toHaveCSS('border-radius', '10px');
      const trigger = page.getByRole('button', { name: 'Abrir boas-vindas', exact: true });
      await trigger.click();
      const welcome = page.getByRole('dialog', { name: 'Boas-vindas ao exemplo', exact: true });
      await expectWithinViewport(welcome);
      expect((await welcome.boundingBox())!.width).toBe(Math.min(480, page.viewportSize()!.width - 32));
      await expect(welcome).toHaveCSS('border-radius', '24px');
      await expect(welcome.getByRole('heading', { name: 'Boas-vindas ao exemplo', exact: true })).toHaveCSS('font-size', '18px');
      expect((await welcome.locator('.es-dialog-artwork').boundingBox())!.height).toBe(200);
      const action = welcome.getByRole('button', { name: 'Conhecer o exemplo', exact: true });
      expect((await action.boundingBox())!.height).toBe(40); // welcome variant keeps its contextual 40px
      await expect(action).toHaveCSS('border-radius', '12px');
      await page.screenshot({ path: testInfo.outputPath(`welcome-${theme}.png`), fullPage: false });
      await action.click();
      await expect(welcome).not.toBeVisible();
      await expect(trigger).toBeFocused();
      await expect(page.getByText('Exemplo de boas-vindas concluído.', { exact: true })).toBeVisible();
    });

    test('Fields recover from errors and native choices retain controlled keyboard state', async ({ page }) => {
      const name = page.getByRole('textbox', { name: 'Nome do exemplo', exact: true });
      await page.getByRole('button', { name: 'Limpar nome', exact: true }).click();
      await page.getByRole('button', { name: 'Salvar exemplo', exact: true }).click();
      await expect(name).toHaveAttribute('aria-invalid', 'true');
      await expect(name).toBeFocused();
      await expect(name).toHaveAttribute('name', 'example-name');
      await expect(name).toHaveAttribute('autocomplete', 'name');
      await expect(name).toHaveAttribute('spellcheck', 'false');
      await expect(name).toHaveAccessibleDescription(/Informe um nome para salvar o exemplo/);
      await name.fill('Projeto revisado');
      await expect(name).not.toHaveAttribute('aria-invalid');
      await page.getByRole('button', { name: 'Salvar exemplo', exact: true }).click();
      await expect(page.getByText('Exemplo salvo apenas nesta demonstração.', { exact: true })).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'Campo indisponível' })).toBeDisabled();
      await expect(page.getByRole('textbox', { name: 'Identificador de somente leitura' })).not.toBeEditable();
      const checkbox = page.getByRole('checkbox', { name: /^Incluir detalhes/ });
      await expect(checkbox).toBeChecked();
      await checkbox.focus();
      await checkbox.press('Space');
      await expect(checkbox).not.toBeChecked();
      const toggle = page.getByRole('switch', { name: 'Notificações do exemplo', exact: true });
      await toggle.focus();
      await toggle.press('Space');
      await expect(toggle).toBeChecked();
      await expect(page.getByText('Notificações ativadas neste exemplo.', { exact: true })).toBeVisible();
      const tabs = page.getByRole('tablist', { name: 'Seções do exemplo' });
      await tabs.getByRole('tab', { name: 'Visão geral' }).focus();
      await page.keyboard.press('ArrowRight');
      await expect(tabs.getByRole('tab', { name: 'Detalhes' })).toBeFocused();
      await expect(page.getByRole('tabpanel', { name: 'Detalhes' })).toBeVisible();
      await page.keyboard.press('ArrowRight');
      await expect(tabs.getByRole('tab', { name: 'Visão geral' })).toBeFocused();
      const segments = page.getByRole('radiogroup', { name: 'Densidade demonstrativa' });
      await segments.getByRole('radio', { name: 'Compacto', exact: true }).focus();
      await page.keyboard.press('ArrowRight');
      await expect(segments.getByRole('radio', { name: 'Confortável' })).toBeChecked();
      expect((await segments.boundingBox())!.height).toBe(24);
      await page.getByRole('searchbox', { name: 'Buscar exemplos' }).fill('sem correspondência');
      await expect(page.getByRole('searchbox', { name: 'Buscar exemplos' })).toHaveAttribute('name', 'example-search');
      await expect(page.getByRole('searchbox', { name: 'Buscar exemplos' })).toHaveAttribute('autocomplete', 'off');
      await expect(page.getByText('Nenhum exemplo encontrado.', { exact: true })).toBeVisible();
    });
  });
}
