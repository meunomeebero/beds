import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark'] as const) {
  test.describe(`CommandPalette · ${theme}`, () => {
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

    test('beUI cursor/search adaptation preserves BEDS keyboard, disabled and focus contracts', async ({ page }) => {
      const trigger = page.getByRole('button', { name: 'Abrir comandos', exact: true });
      await trigger.click();
      const dialog = page.getByRole('dialog', { name: 'Comandos do catálogo' });
      const input = dialog.getByRole('combobox', { name: 'Comandos do catálogo' });
      const list = dialog.getByRole('listbox', { name: 'Comandos do catálogo' });
      await expect(input).toBeFocused();
      await expect(dialog).toHaveAttribute('aria-modal', 'true');
      const listId = await list.getAttribute('id');
      if (listId === null) throw new Error('Command list must expose an id for aria-controls.');
      await expect(input).toHaveAttribute('aria-controls', listId);

      await input.fill('Fund');
      const isMac = await page.evaluate(() => navigator.platform.includes('Mac'));
      await input.press('ArrowLeft');
      await expect(input).toHaveJSProperty('selectionStart', 3);
      await expect(input).toHaveJSProperty('selectionEnd', 3);
      await input.press('End');
      if (isMac) {
        await expect(input).toHaveJSProperty('selectionStart', 3);
        await expect(input).toHaveJSProperty('selectionEnd', 3);
        await input.press('Meta+ArrowRight');
      }
      await expect(input).toHaveJSProperty('selectionStart', 4);
      await expect(input).toHaveJSProperty('selectionEnd', 4);
      await expect(dialog.locator('[data-active="true"]')).toContainText('Fundamentos');
      await input.press('Home');
      if (isMac) {
        // macOS keeps Home as native document scrolling; Meta+ArrowLeft is its caret-start equivalent.
        await expect(input).toHaveJSProperty('selectionStart', 4);
        await expect(input).toHaveJSProperty('selectionEnd', 4);
        await input.press('Meta+ArrowLeft');
      }
      await expect(input).toHaveJSProperty('selectionStart', 0);
      await expect(input).toHaveJSProperty('selectionEnd', 0);
      await expect(dialog.locator('[data-active="true"]')).toContainText('Fundamentos');
      await input.fill('');
      await input.press('ArrowUp');
      await expect(dialog.locator('[data-active="true"]')).toContainText('Configurações');

      await input.fill('indisponível');
      await expect(dialog.getByRole('option')).toHaveAttribute('aria-disabled', 'true');
      await expect(input).not.toHaveAttribute('aria-activedescendant');
      await input.dispatchEvent('compositionstart');
      await input.dispatchEvent('keydown', { key: 'Enter', code: 'Enter', isComposing: true });
      await expect(dialog).toBeVisible();
      await input.dispatchEvent('compositionend');
      await input.press('Enter');
      await expect(dialog).toBeVisible();

      await input.fill('Configurações');
      await input.press('Enter');
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
      await expect(page.getByText('Comando demonstrativo selecionado: Configurações.', { exact: true })).toBeVisible();
    });

    test('keeps measured geometry, outside dismissal and reduced-motion behavior', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const trigger = page.getByRole('button', { name: 'Abrir comandos', exact: true });
      await trigger.click();
      const dialog = page.getByRole('dialog', { name: 'Comandos do catálogo' });
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveCSS('border-radius', '14px');
      await expect(dialog).toHaveCSS('background-color', theme === 'dark' ? 'rgb(32, 32, 32)' : 'rgb(255, 255, 255)');
      const bounds = await dialog.boundingBox();
      const viewport = page.viewportSize()!;
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(15);
      expect(bounds!.y).toBeGreaterThanOrEqual(15);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width - 15);
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height - 15);
      await page.mouse.click(1, 1);
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();

      await trigger.click();
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
    });
  });
}
