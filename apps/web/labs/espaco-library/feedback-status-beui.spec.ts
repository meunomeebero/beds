import { expect, test } from '@playwright/test';

test.describe('Feedback, status, loading and notifications', () => {
  for (const theme of ['light', 'dark'] as const) {
    test(`keeps feedback names and status semantics in ${theme}`, async ({ page }) => {
      await page.goto(`/?view=components&theme=${theme}`);

      const loading = page.getByRole('status', { name: 'Carregamento demonstrativo', exact: true });
      await expect(loading).toBeVisible();
      await expect(loading).toHaveAttribute('aria-labelledby', /.+/);
      await expect(loading).not.toHaveAttribute('aria-label', /.+/);
      await expect(loading.locator('svg')).toHaveAttribute('aria-hidden', 'true');

      const notices = page.locator('.es-notice');
      await expect(notices).toHaveCount(1);
      await expect(notices.first()).toHaveRole('status');
      await expect(notices.first()).toHaveAccessibleName('Estado demonstrativo');
      await expect(notices.first()).toHaveAccessibleDescription('Esta mensagem pode ser dispensada.');
      await expect(notices.first()).toHaveAttribute('aria-labelledby', /.+/);
      await expect(notices.first()).toHaveAttribute('aria-describedby', /.+/);

      await page.getByRole('button', { name: 'Ação do cabeçalho', exact: true }).click();
      await expect(notices).toHaveCount(2);
      const labelledBy = await notices.evaluateAll(elements => elements.map(element => element.getAttribute('aria-labelledby')));
      const describedBy = await notices.evaluateAll(elements => elements.map(element => element.getAttribute('aria-describedby')));
      expect(new Set(labelledBy).size).toBe(2);
      expect(new Set(describedBy).size).toBe(2);
      const dismissButtons = notices.getByRole('button', { name: 'Dismiss notification', exact: true });
      await expect(dismissButtons).toHaveCount(2);
      await dismissButtons.first().focus();
      await expect(dismissButtons.first()).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(notices).toHaveCount(1);
    });
  }

  test('uses a static reduced-motion loader and preserves unavailable meter semantics', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?view=components&theme=dark');

    const loading = page.getByRole('status', { name: 'Carregamento demonstrativo', exact: true });
    await expect(loading.locator('svg')).toHaveCSS('transform', 'none');

    const meter = page.getByRole('meter', { name: 'Medidor neutro', exact: true });
    await expect(meter).toHaveAttribute('aria-valuenow', '68');
    await page.getByRole('button', { name: 'Sem dado', exact: true }).click();
    await expect(meter).toHaveCount(0);
    const unavailable = page.getByRole('img', { name: 'Medidor neutro: unavailable', exact: true });
    await expect(unavailable).toBeVisible();
    await expect(unavailable).not.toHaveAttribute('aria-valuenow');
  });

  test('updates the mounted loader when reduced motion changes', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/?view=components&theme=dark');
    const spinner = page.getByRole('status', { name: 'Carregamento demonstrativo', exact: true }).locator('svg');
    await expect.poll(() => spinner.evaluate(element => getComputedStyle(element).transform)).not.toBe('none');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect.poll(() => spinner.evaluate(element => getComputedStyle(element).transform)).toBe('none');
  });

  test('gives compact empty-state actions a visible keyboard focus and touch target', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?view=components&theme=light');
    const emptyState = page.locator('.es-empty-state').filter({ hasText: 'Nenhum item neste exemplo' });
    const action = emptyState.getByRole('button', { name: 'Adicionar item de exemplo', exact: true });
    await action.focus();
    await expect(action).toBeFocused();
    await expect(action).toHaveCSS('outline-style', 'solid');
    expect((await action.boundingBox())!.height).toBeGreaterThanOrEqual(44);

    await page.emulateMedia({ forcedColors: 'active' });
    await expect(action).toHaveCSS('outline-style', 'solid');
    await expect(page.locator('.es-notice').first()).toHaveCSS('border-top-style', 'solid');
  });

  test('keeps toast alerts distinct from polite status and dismisses after an action', async ({ page }) => {
    await page.goto('/?view=toast&theme=dark');
    await page.getByRole('button', { name: 'Com ação', exact: true }).click();
    const region = page.locator('.es-toast-region');
    await expect(region).not.toHaveAttribute('aria-live', /.+/);
    const alert = page.getByRole('alert').filter({ hasText: 'Não foi possível concluir.' });
    await expect(alert).toBeVisible();
    await alert.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
    await expect(alert).toHaveCount(0);
    await expect(page.getByRole('status').filter({ hasText: 'Nova tentativa iniciada.' })).toBeVisible();
  });

  test('dismisses a toast even when its action throws', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/?view=toast&theme=dark');
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('beds:toast', {
        detail: {
          id: 'ber-14-throwing-action',
          message: 'Ação com erro sintético.',
          tone: 'error',
          action: { label: 'Executar ação com erro', onClick: () => { throw new Error('synthetic toast action failure'); } },
        },
      }));
    });
    const alert = page.getByRole('alert').filter({ hasText: 'Ação com erro sintético.' });
    await expect(alert).toBeVisible();
    await alert.getByRole('button', { name: 'Executar ação com erro', exact: true }).click();
    await expect(alert).toHaveCount(0);
    expect(errors).toContain('synthetic toast action failure');
  });
});
