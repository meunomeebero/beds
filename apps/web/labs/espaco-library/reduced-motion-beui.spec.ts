import { expect, test } from '@playwright/test';

test('reduced-motion preference is SSR-safe and updates the dialog lifecycle live', async ({ page }) => {
  await page.goto('/?view=components&theme=light');
  await expect(page.getByRole('heading', { name: 'Componentes', exact: true })).toBeVisible();

  await page.emulateMedia({ reducedMotion: 'reduce' });
  const trigger = page.getByRole('button', { name: 'Abrir diálogo', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Configuração demonstrativa', exact: true });
  const surface = dialog.locator('.es-dialog-surface');
  await expect(surface).toHaveAttribute('data-phase', 'settled');
  await expect(surface).toHaveCSS('pointer-events', 'auto');

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(surface).toHaveAttribute('data-phase', 'settled');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await trigger.click();
  await expect(surface).toHaveAttribute('data-phase', 'settled');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});
