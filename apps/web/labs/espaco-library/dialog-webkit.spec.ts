import { expect, test } from '@playwright/test';

test.use({ browserName: 'webkit' });

test('WebKit modal form keeps every Tab inside and restores a keyboard opener', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/dialog-harness.html');
  const trigger = page.getByRole('button', { name: 'Open harness dialog', exact: true });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Harness dialog', exact: true });
  await expect(dialog.locator(':scope > .es-dialog-surface')).toHaveAttribute('data-phase', 'settled');
  await dialog.getByRole('textbox', { name: 'Draft body' }).focus();
  for (const key of ['Tab', 'Shift+Tab']) for (let index = 0; index < 14; index++) {
    await page.keyboard.press(key);
    expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
