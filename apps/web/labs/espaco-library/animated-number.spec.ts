import { expect, test } from '@playwright/test';

test('null and non-finite values never flash a fabricated frame before ready', async ({ page }) => {
  await page.goto('/?view=animated-number&theme=dark');
  const value = page.locator('.es-animated-number');
  const state = page.getByTestId('animated-number-state');
  await expect(value).toHaveText('Indisponível');

  await page.getByRole('button', { name: 'Pronto', exact: true }).click();
  await expect(value).toHaveText('42');
  expect(await state.getAttribute('data-frame-trace')).not.toContain('0');

  await page.reload();
  await page.getByRole('button', { name: 'Inválido', exact: true }).click();
  await expect(value).toHaveText('Indisponível');
  await page.getByRole('button', { name: 'Pronto', exact: true }).click();
  await expect(value).toHaveText('42');
  expect(await state.getAttribute('data-frame-trace')).not.toContain('0');
});

test('startOnView and reduced motion keep the ready first frame truthful', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?view=animated-number&theme=light');
  await page.getByRole('button', { name: 'Iniciar imediatamente', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Iniciar ao entrar', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Pronto', exact: true }).click();
  await expect(page.getByTestId('animated-number-state')).toHaveAttribute('data-frame-trace', /^(?!.*0)/);
  await page.getByRole('button', { name: 'Atualizar 84', exact: true }).click();
  await expect(page.getByTestId('animated-number-state')).toHaveAttribute('data-frame-trace', /84$/);
  await page.locator('[aria-label="Número animado"]').scrollIntoViewIfNeeded();
  await expect(page.locator('.es-animated-number')).toHaveText('84');
});
