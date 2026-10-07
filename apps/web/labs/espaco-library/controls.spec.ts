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
      await expect(dialog.locator(':scope > .es-dialog-surface')).toHaveCSS('background-color', theme === 'dark' ? 'rgb(32, 32, 32)' : 'rgb(255, 255, 255)');
      await expect(dialog).toHaveAttribute('data-phase', 'open');
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
      const compact = segments.getByRole('radio', { name: 'Compacto', exact: true });
      const comfortable = segments.getByRole('radio', { name: 'Confortável' });
      await compact.focus();
      await compact.press('ArrowRight');
      await expect(comfortable).toBeChecked();
      await expect(comfortable).toBeFocused();
      await comfortable.press('ArrowRight');
      await expect(compact).toBeChecked();
      await expect(compact).toBeFocused();
      expect((await segments.boundingBox())!.height).toBe(24);
      const joined = page.getByRole('radiogroup', { name: 'Política do exemplo' });
      const allow = joined.getByRole('radio', { name: 'Permitir', exact: true });
      const confirm = joined.getByRole('radio', { name: 'Confirmar', exact: true });
      await allow.focus();
      await allow.press('ArrowDown');
      await expect(confirm).toBeChecked();
      await expect(confirm).toBeFocused();
      await confirm.press('Home');
      await expect(allow).toBeChecked();
      await expect(allow).toBeFocused();
      await allow.press('End');
      await expect(confirm).toBeChecked();
      await expect(confirm).toBeFocused();
      await confirm.press('ArrowUp');
      await expect(allow).toBeChecked();
      await expect(allow).toBeFocused();
      await expect(segments.locator('[data-segmented-indicator]')).toHaveCount(1);
      await expect(joined.locator('[data-segmented-indicator]')).toHaveCount(1);
      await page.getByRole('searchbox', { name: 'Buscar exemplos' }).fill('sem correspondência');
      await expect(page.getByRole('searchbox', { name: 'Buscar exemplos' })).toHaveAttribute('name', 'example-search');
      await expect(page.getByRole('searchbox', { name: 'Buscar exemplos' })).toHaveAttribute('autocomplete', 'off');
      await expect(page.getByText('Nenhum exemplo encontrado.', { exact: true })).toBeVisible();
    });

    test('SegmentedControl keeps focus, controlled acceptance and disabled skipping independent', async ({ page }) => {
      await page.goto(`/?view=components&theme=${theme}&ber10=1`);
      const skip = page.getByRole('radiogroup', { name: 'BER-10 disabled skip' });
      const first = skip.getByRole('radio', { name: 'First', exact: true });
      const blocked = skip.getByRole('radio', { name: 'Blocked', exact: true });
      const last = skip.getByRole('radio', { name: 'Last', exact: true });
      await expect(blocked).toBeDisabled();
      await first.focus();
      await first.press('ArrowRight');
      await expect(last).toBeFocused();
      await expect(last).toBeChecked();
      await expect(skip.locator('[data-segmented-indicator]')).toHaveCount(1);

      const delayed = page.getByRole('radiogroup', { name: 'BER-10 delayed acceptance' });
      const delayedFirst = delayed.getByRole('radio', { name: 'First', exact: true });
      const delayedSecond = delayed.getByRole('radio', { name: 'Second', exact: true });
      await delayedFirst.focus();
      await delayedFirst.press('ArrowRight');
      await expect(delayedSecond).toBeFocused();
      await expect(delayedFirst).toBeChecked();
      await expect(delayedSecond).not.toBeChecked();
      const delayedIndicator = delayed.locator('[data-segmented-indicator]');
      await expect.poll(async () => delayedSecond.isChecked()).toBe(true);
      await expect(delayedSecond).toBeChecked();
      await expect(delayedIndicator).toHaveCSS('transform', 'none');
      await page.waitForTimeout(60);
      await expect(delayedIndicator).toHaveCSS('transform', 'none');

      const rejected = page.getByRole('radiogroup', { name: 'BER-10 rejection' });
      const rejectedFirst = rejected.getByRole('radio', { name: 'First', exact: true });
      const rejectedSecond = rejected.getByRole('radio', { name: 'Second', exact: true });
      await rejectedFirst.focus();
      await rejectedFirst.press('ArrowRight');
      await expect(rejectedSecond).toBeFocused();
      await expect(rejectedFirst).toBeChecked();
      await expect(rejectedSecond).not.toBeChecked();
      await page.waitForTimeout(240);
      await expect(rejectedFirst).toBeChecked();
      await expect(rejected.locator('[data-segmented-indicator]')).toHaveCount(1);

      const pointerRecovery = page.getByRole('radiogroup', { name: 'BER-10 rejected keyboard then pointer' });
      const pointerFirst = pointerRecovery.getByRole('radio', { name: 'First', exact: true });
      const pointerSecond = pointerRecovery.getByRole('radio', { name: 'Second', exact: true });
      await pointerFirst.focus();
      await pointerFirst.press('ArrowRight');
      await expect(pointerSecond).toBeFocused();
      await expect(pointerFirst).toBeChecked();
      const pointerVisual = pointerSecond.locator('xpath=following-sibling::span');
      const pointerBounds = await pointerVisual.boundingBox();
      expect(pointerBounds).not.toBeNull();
      await page.mouse.click(pointerBounds!.x + pointerBounds!.width / 2, pointerBounds!.y + pointerBounds!.height / 2);
      await expect(pointerSecond).toBeChecked();
      const pointerIndicator = pointerRecovery.locator('[data-segmented-indicator]');
      await page.waitForTimeout(10);
      const pointerFrame0 = await pointerIndicator.evaluate(element => getComputedStyle(element).transform);
      await page.waitForTimeout(50);
      const pointerFrame50 = await pointerIndicator.evaluate(element => getComputedStyle(element).transform);
      expect(pointerFrame50).not.toBe(pointerFrame0);
      expect(pointerFrame50).not.toBe('none');

      const sibling = page.getByRole('radiogroup', { name: 'BER-10 sibling instance' });
      await expect(sibling.getByRole('radio', { name: 'First', exact: true })).toBeChecked();
      await expect(sibling.locator('[data-segmented-indicator]')).toHaveCount(1);
    });

    test('SegmentedControl exposes settling, interruption, press feedback and reduced motion states', async ({ page }, testInfo) => {
      const segments = page.getByRole('radiogroup', { name: 'Densidade demonstrativa' });
      const compact = segments.getByRole('radio', { name: 'Compacto', exact: true });
      const comfortable = segments.getByRole('radio', { name: 'Confortável', exact: true });
      const compactVisual = compact.locator('xpath=following-sibling::span');
      await compact.focus();
      await expect(compactVisual).toHaveCSS('outline-width', '2px');
      await expect(compactVisual).toHaveCSS('outline-offset', '-2px');
      const focusPaint = await compactVisual.evaluate(element => {
        const visual = element.getBoundingClientRect();
        const group = element.parentElement?.parentElement?.getBoundingClientRect();
        const styles = getComputedStyle(element);
        const width = Number.parseFloat(styles.outlineWidth);
        const offset = Number.parseFloat(styles.outlineOffset);
        return { left: visual.left - width - offset, right: visual.right + width + offset, groupLeft: group?.left, groupRight: group?.right, viewport: innerWidth };
      });
      expect(focusPaint.left).toBeGreaterThanOrEqual(focusPaint.groupLeft!);
      expect(focusPaint.right).toBeLessThanOrEqual(focusPaint.groupRight!);
      expect(focusPaint.right).toBeLessThanOrEqual(focusPaint.viewport);
      await page.screenshot({ path: testInfo.outputPath(`segmented-focus-${theme}-${testInfo.project.name}.png`), fullPage: false });
      const compactBounds = await compactVisual.boundingBox();
      expect(compactBounds).not.toBeNull();
      await page.mouse.move(compactBounds!.x + compactBounds!.width / 2, compactBounds!.y + compactBounds!.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(30);
      const pressedTransform = await compactVisual.evaluate(element => getComputedStyle(element).transform);
      expect(pressedTransform).not.toBe('none');
      await page.mouse.up();
      await page.waitForTimeout(220);
      await expect(compactVisual).toHaveCSS('transform', 'none');

      const comfortableBounds = await comfortable.locator('xpath=following-sibling::span').boundingBox();
      expect(comfortableBounds).not.toBeNull();
      await page.mouse.click(comfortableBounds!.x + comfortableBounds!.width / 2, comfortableBounds!.y + comfortableBounds!.height / 2);
      await expect(comfortable).toBeChecked();
      const indicator = segments.locator('[data-segmented-indicator]');
      await page.waitForTimeout(10);
      const frame0 = await indicator.evaluate(element => ({ x: element.getBoundingClientRect().x, transform: getComputedStyle(element).transform }));
      await page.waitForTimeout(50);
      const frame50 = await indicator.evaluate(element => ({ x: element.getBoundingClientRect().x, transform: getComputedStyle(element).transform }));
      expect(frame50.x).not.toBe(frame0.x);
      expect(frame50.transform).not.toBe(frame0.transform);
      await comfortable.press('ArrowLeft');
      await expect(compact).toBeChecked();
      await expect(compact).toBeFocused();
      await expect(indicator).toHaveCSS('transform', 'none');
      await page.waitForTimeout(16);
      await expect(indicator).toHaveCSS('transform', 'none');

      await comfortable.focus();
      await comfortable.press('Space');
      await expect(comfortable).toBeChecked();
      await expect(indicator).toHaveCSS('transform', 'none');
      await page.waitForTimeout(16);
      await expect(indicator).toHaveCSS('transform', 'none');

      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload();
      const reducedSegments = page.getByRole('radiogroup', { name: 'Densidade demonstrativa' });
      const reducedCompact = reducedSegments.getByRole('radio', { name: 'Compacto', exact: true });
      const reducedComfortable = reducedSegments.getByRole('radio', { name: 'Confortável', exact: true });
      await reducedCompact.press('ArrowRight');
      await expect(reducedComfortable).toBeChecked();
      const reducedIndicator = reducedSegments.locator('[data-segmented-indicator]');
      await expect(reducedIndicator).toHaveCSS('transform', 'none');
      await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'active' });
      await page.reload();
      const forcedCompact = page.getByRole('radiogroup', { name: 'Densidade demonstrativa' }).getByRole('radio', { name: 'Compacto', exact: true });
      const forcedVisual = forcedCompact.locator('xpath=following-sibling::span');
      await forcedCompact.focus();
      await expect(forcedVisual).toHaveCSS('outline-width', '2px');
      await expect(forcedVisual).toHaveCSS('outline-offset', '-2px');
      await expect(forcedVisual).toHaveCSS('outline-style', 'solid');
      await page.screenshot({ path: testInfo.outputPath(`segmented-focus-forced-${theme}-${testInfo.project.name}.png`), fullPage: false });
    });

    test('SegmentedControl preserves historical arrow order in RTL', async ({ page }) => {
      await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
      const segments = page.getByRole('radiogroup', { name: 'Densidade demonstrativa' });
      const compact = segments.getByRole('radio', { name: 'Compacto', exact: true });
      const comfortable = segments.getByRole('radio', { name: 'Confortável', exact: true });
      await compact.focus();
      await compact.press('ArrowRight');
      await expect(comfortable).toBeFocused();
      await expect(comfortable).toBeChecked();
    });

    test('SegmentedControl keeps RTL focus and content inside a narrow lane', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 844 });
      await page.goto(`/?view=components&theme=${theme}&ber10=1`);
      await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
      const group = page.getByRole('radiogroup', { name: 'BER-10 long labels' });
      const shortOption = group.getByRole('radio', { name: 'Short', exact: true });
      const endOption = group.getByRole('radio', { name: 'Another localized choice', exact: true });
      await shortOption.press('End');
      await expect(endOption).toBeFocused();
      await expect(endOption).toBeChecked();
      const state = await endOption.locator('xpath=following-sibling::span').evaluate(element => {
        const visual = element.getBoundingClientRect();
        const group = element.parentElement?.parentElement?.getBoundingClientRect();
        const text = element.querySelector('span.relative')?.getBoundingClientRect();
        const styles = getComputedStyle(element);
        const width = Number.parseFloat(styles.outlineWidth);
        const offset = Number.parseFloat(styles.outlineOffset);
        return { textLeft: text?.left, textRight: text?.right, paintLeft: visual.left - width - offset, paintRight: visual.right + width + offset, groupLeft: group?.left, groupRight: group?.right, scrollLeft: element.parentElement?.parentElement?.scrollLeft };
      });
      expect(state.textLeft).toBeGreaterThanOrEqual(state.groupLeft!);
      expect(state.textRight).toBeLessThanOrEqual(state.groupRight!);
      expect(state.paintLeft).toBeGreaterThanOrEqual(state.groupLeft! - 1);
      expect(state.paintRight).toBeLessThanOrEqual(state.groupRight! + 1);
      expect(state.scrollLeft).not.toBe(0);
    });

    test('SegmentedControl keeps a long localized option reachable at 320px', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 844 });
      await page.goto(`/?view=components&theme=${theme}&ber10=1`);
      const group = page.getByRole('radiogroup', { name: 'BER-10 long labels' });
      const shortOption = group.getByRole('radio', { name: 'Short', exact: true });
      const middleOption = group.getByRole('radio', { name: 'Long localized choice', exact: true });
      const endOption = group.getByRole('radio', { name: 'Another localized choice', exact: true });
      await expect(middleOption).toBeVisible();
      await expect(endOption).toBeVisible();
      const bounds = await group.evaluate(element => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, right: rect.right, scrollWidth: element.scrollWidth, clientWidth: element.clientWidth };
      });
      expect(bounds.left).toBeGreaterThanOrEqual(0);
      expect(bounds.right).toBeLessThanOrEqual(320);
      expect(bounds.scrollWidth).toBeGreaterThan(bounds.clientWidth);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);

      await shortOption.focus();
      await shortOption.press('ArrowRight');
      await expect(middleOption).toBeFocused();
      await expect(middleOption).toBeChecked();
      await middleOption.press('ArrowRight');
      await expect(endOption).toBeFocused();
      await expect(endOption).toBeChecked();
      await expect.poll(async () => group.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
      await page.waitForTimeout(600);
      const alignment = await group.evaluate(element => {
        const input = element.querySelector('input:checked');
        const visual = input?.nextElementSibling;
        const indicator = visual?.querySelector('[data-segmented-indicator]');
        if (!visual || !indicator) return null;
        const visualRect = visual.getBoundingClientRect();
        const indicatorRect = indicator.getBoundingClientRect();
        const groupRect = element.getBoundingClientRect();
        return { leftDelta: Math.abs(visualRect.left - indicatorRect.left), rightDelta: Math.abs(visualRect.right - indicatorRect.right), groupLeft: groupRect.left, groupRight: groupRect.right, visualLeft: visualRect.left, visualRight: visualRect.right };
      });
      expect(alignment).not.toBeNull();
      expect(alignment!.leftDelta).toBeLessThanOrEqual(1);
      expect(alignment!.rightDelta).toBeLessThanOrEqual(1);
      expect(alignment!.visualLeft).toBeGreaterThanOrEqual(alignment!.groupLeft);
      expect(alignment!.visualRight).toBeLessThanOrEqual(alignment!.groupRight);
      await endOption.press('Home');
      await expect(shortOption).toBeFocused();
      await expect.poll(async () => group.evaluate(element => element.scrollLeft)).toBeLessThanOrEqual(8);
      await shortOption.press('End');
      await expect(endOption).toBeFocused();
      await expect.poll(async () => group.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload();
      const reducedGroup = page.getByRole('radiogroup', { name: 'BER-10 long labels' });
      const reducedShort = reducedGroup.getByRole('radio', { name: 'Short', exact: true });
      const reducedEnd = reducedGroup.getByRole('radio', { name: 'Another localized choice', exact: true });
      await reducedShort.press('End');
      await expect(reducedEnd).toBeFocused();
      const reducedScroll = await reducedGroup.evaluate(element => element.scrollLeft);
      await page.waitForTimeout(60);
      await expect.poll(async () => reducedGroup.evaluate(element => element.scrollLeft)).toBe(reducedScroll);
    });

    test('SegmentedControl exposes oversized text without document overflow', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 844 });
      await page.goto(`/?view=components&theme=${theme}&ber10=1`);
      const group = page.getByRole('radiogroup', { name: 'BER-10 oversized label' });
      const shortOption = group.getByRole('radio', { name: 'Short', exact: true });
      const longOption = group.getByRole('radio', { name: 'An intentionally oversized localized label wider than the narrow lane', exact: true });
      await shortOption.press('ArrowRight');
      await expect(longOption).toBeFocused();
      await expect(longOption).toBeChecked();
      await expect.poll(async () => group.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
      const state = await group.evaluate(element => {
        const input = element.querySelector('input:checked');
        const visual = input?.nextElementSibling;
        const indicator = visual?.querySelector('[data-segmented-indicator]');
        const groupRect = element.getBoundingClientRect();
        const visualRect = visual?.getBoundingClientRect();
        return {
          text: visual?.textContent,
          scrollLeft: element.scrollLeft,
          maxScroll: element.scrollWidth - element.clientWidth,
          groupLeft: groupRect.left,
          groupRight: groupRect.right,
          visualLeft: visualRect?.left,
          visualRight: visualRect?.right,
          indicatorLeft: indicator?.getBoundingClientRect().left,
          indicatorRight: indicator?.getBoundingClientRect().right,
          outlineWidth: visual && getComputedStyle(visual).outlineWidth,
          outlineOffset: visual && getComputedStyle(visual).outlineOffset,
        };
      });
      expect(state.text).toContain('An intentionally oversized localized label wider than the narrow lane');
      expect(state.scrollLeft).toBeGreaterThan(0);
      expect(state.scrollLeft).toBeLessThanOrEqual(state.maxScroll);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
      expect(state.outlineWidth).toBe('2px');
      expect(state.outlineOffset).toBe('-2px');
      expect(state.visualRight).toBeGreaterThan(state.groupLeft);
      expect(state.visualLeft).toBeLessThan(state.groupRight);
      await longOption.press('ArrowLeft');
      await expect(shortOption).toBeFocused();
      await expect.poll(async () => group.evaluate(element => element.scrollLeft)).toBeLessThanOrEqual(8);
    });
  });
}
