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

test('public toast API upserts by id and dismissToast closes the current note', async ({ page }) => {
  await page.goto('/?view=toast&theme=dark');
  await page.evaluate(async () => {
    const moduleName = '/@id/beds';
    const { toast } = await import(/* @vite-ignore */ moduleName);
    toast({ id: 'ber-34-public-api', message: 'Estado inicial.', tone: 'info', lifetime: 0 });
    toast({ id: 'ber-34-public-api', message: 'Estado atualizado.', tone: 'success', lifetime: 0 });
  });

  const note = page.locator('[data-toast-id="ber-34-public-api"]');
  await expect(note).toHaveCount(1);
  await expect(note).toHaveRole('status');
  await expect(note).toContainText('Estado atualizado.');
  await expect(page.getByText('Estado inicial.', { exact: true })).toHaveCount(0);

  await page.evaluate(async () => {
    const moduleName = '/@id/beds';
    const { dismissToast } = await import(/* @vite-ignore */ moduleName);
    dismissToast('ber-34-public-api');
  });
  await expect(note).toHaveCount(0);
});

test('public lifetime semantics keep zero persistent and non-finite on the default clock', async ({ page }) => {
  test.setTimeout(15000);
  await page.goto('/?view=toast&theme=dark');
  await page.evaluate(async () => {
    const moduleName = '/@id/beds';
    const { toast } = await import(/* @vite-ignore */ moduleName);
    toast({ id: 'ber-34-non-finite', message: 'Timeout padrão.', tone: 'info', lifetime: Number.NaN });
    toast({ id: 'ber-34-persistent', message: 'Sem expiração.', tone: 'info', lifetime: 0 });
  });

  await page.waitForTimeout(4000);
  await expect(page.getByText('Timeout padrão.', { exact: true })).toBeVisible();
  await expect(page.getByText('Sem expiração.', { exact: true })).toBeVisible();
  await page.waitForTimeout(1200);
  await expect(page.getByText('Timeout padrão.', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Sem expiração.', { exact: true })).toBeVisible();
});

test('toast queue remains readable at 320px RTL and forced colors', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/?view=toast&theme=dark');
  await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
  await page.getByRole('button', { name: 'Várias notificações' }).click();

  const region = page.locator('.es-toast-region');
  await expect(region).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(7);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const lastAction = page.getByRole('button', { name: 'Tentar novamente' }).last();
  await lastAction.focus();
  await lastAction.press('Tab');
  const keyboardClose = page.locator('.es-toast-dismiss:focus');
  await expect(keyboardClose).toHaveCount(1);
  await expect(keyboardClose).toHaveCSS('outline-style', 'solid');
});
