import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  test(`toast states and update ${theme}`, async ({ page }) => {
    await page.goto(`/?view=toast&theme=${theme}`);
    await page.getByRole('button', { name: 'Processando' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Gerando currículo…' })).toBeVisible();
    await page.getByRole('button', { name: 'Concluir processo' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Currículo pronto para revisar.' })).toBeVisible();
    await expect(page.getByText('Gerando currículo…')).toHaveCount(0);
    await page.getByRole('button', { name: 'Com ação' }).click();
    const alert = page.getByRole('alert');
    await expect(alert).toContainText('Não foi possível concluir.');
    await alert.getByRole('button', { name: 'Tentar novamente' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Nova tentativa iniciada.' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `/tmp/beds-toast-${theme}-${test.info().project.name}.png` });
  });
}
