import { test, expect } from '@playwright/test';

test('native settings form submits with Enter and exposes caller validation in both themes', async ({ page }) => {
  for (const theme of ['light', 'dark']) {
    await page.goto('/?view=settings-form&theme=' + theme);
    const form = page.getByRole('form', { name: 'Editar identidade' });
    await form.getByRole('button', { name: 'Salvar nome' }).click();
    const field = form.getByRole('textbox', { name: 'Nome', exact: true });
    await expect(field).toBeFocused();
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(field).toHaveAccessibleDescription('Informe um nome.');
    await field.fill('Uma identidade com um nome muito longo para conferir os limites do formulário');
    await field.press('Enter');
    await expect(page.getByRole('status')).toHaveText('Nome salvo nesta demonstração.');
    await expect(field).not.toHaveAttribute('aria-invalid', 'true');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
