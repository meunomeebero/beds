import { expect, test } from '@playwright/test';

const longMessage = 'Não foi possível concluir a preparação do currículo. Revise os dados importados, tente novamente e mantenha esta notificação aberta para consultar todos os detalhes do problema.';

for (const theme of ['light', 'dark']) {
  test(`beUI stack preserves toast states, queue and recovery in ${theme}`, async ({ page }) => {
    await page.goto(`/?view=toast&theme=${theme}`);

    await page.getByRole('button', { name: 'Informação', exact: true }).click();
    const info = page.getByRole('status').filter({ hasText: 'Seu currículo foi salvo.' });
    await expect(info).toBeVisible();

    await page.getByRole('button', { name: 'Processando', exact: true }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Gerando currículo…' })).toBeVisible();
    await page.getByRole('button', { name: 'Concluir processo', exact: true }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Currículo pronto para revisar.' })).toBeVisible();
    await expect(page.getByText('Gerando currículo…')).toHaveCount(0);

    const actionTrigger = page.getByRole('button', { name: 'Com ação', exact: true });
    await actionTrigger.click();
    const alert = page.getByRole('alert').filter({ hasText: 'Não foi possível concluir.' });
    await expect(alert).toBeVisible();
    await alert.getByRole('button', { name: 'Tentar novamente' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Nova tentativa iniciada.' })).toBeVisible();
    await page.getByRole('status').filter({ hasText: 'Nova tentativa iniciada.' }).getByRole('button', { name: /^Fechar notificação:/ }).click();

    await page.goto(`/?view=toast&theme=${theme}`);
    await page.getByRole('button', { name: 'Informação', exact: true }).click();
    await page.evaluate((message) => {
      window.dispatchEvent(new CustomEvent('beds:toast', { detail: { id: 'beui-long', message, tone: 'info' } }));
    }, longMessage);
    const longToast = page.getByRole('status').filter({ hasText: longMessage });
    await expect(longToast).toBeVisible();
    await expect(longToast.locator('.es-toast-message')).toHaveText(longMessage);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    await page.setViewportSize({ width: 390, height: 600 });
    await page.getByRole('button', { name: 'Várias notificações', exact: true }).click();
    await expect(page.getByRole('alert')).toHaveCount(7);
    expect(await page.locator('.es-toast-region').evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('beUI dismissal restores focus to the triggering control', async ({ page }) => {
  await page.goto('/?view=toast&theme=dark');
  const actionTrigger = page.getByRole('button', { name: 'Com ação', exact: true });
  await actionTrigger.click();
  const alert = page.getByRole('alert').filter({ hasText: 'Não foi possível concluir.' });
  await alert.getByRole('button', { name: /^Fechar notificação:/ }).click();
  await expect(actionTrigger).toBeFocused();
  await expect(alert).toHaveCount(0);

  await page.getByRole('button', { name: 'Informação', exact: true }).click();
  await actionTrigger.click();
  const stackedAlert = page.getByRole('alert').filter({ hasText: 'Não foi possível concluir.' });
  const sibling = page.getByRole('status').filter({ hasText: 'Seu currículo foi salvo.' });
  const siblingDismiss = sibling.getByRole('button', { name: /^Fechar notificação:/ });
  await stackedAlert.getByRole('button', { name: /^Fechar notificação:/ }).click();
  await expect(siblingDismiss).toBeFocused();
  await siblingDismiss.click();
});

for (const theme of ['light', 'dark']) {
  test(`beUI timeout keeps the five-second minimum in ${theme}`, async ({ page }) => {
    test.setTimeout(15000);
    await page.goto(`/?view=toast&theme=${theme}`);
    await page.getByRole('button', { name: 'Informação', exact: true }).click();
    const info = page.getByRole('status').filter({ hasText: 'Seu currículo foi salvo.' });
    await expect(info).toBeVisible();
    await page.waitForTimeout(4000);
    await expect(info).toBeVisible();
    await page.waitForTimeout(1200);
    await expect(info).toHaveCount(0);
  });
}

for (const theme of ['light', 'dark']) {
  test(`beUI timeout pauses while focused in ${theme}`, async ({ page }) => {
    test.setTimeout(15000);
    await page.goto(`/?view=toast&theme=${theme}`);
    await page.getByRole('button', { name: 'Informação', exact: true }).click();
    const info = page.getByRole('status').filter({ hasText: 'Seu currículo foi salvo.' });
    await info.getByRole('button', { name: /^Fechar notificação:/ }).focus();
    await page.waitForTimeout(5200);
    await expect(info).toBeVisible();
    await page.keyboard.press('Tab');
    await page.waitForTimeout(5200);
    await expect(info).toHaveCount(0);
  });
}

for (const theme of ['light', 'dark']) {
  test(`beUI timeout pauses while hovered in ${theme}`, async ({ page }) => {
    test.setTimeout(15000);
    await page.goto(`/?view=toast&theme=${theme}`);
    await page.getByRole('button', { name: 'Informação', exact: true }).click();
    const info = page.getByRole('status').filter({ hasText: 'Seu currículo foi salvo.' });
    await page.locator('.es-toast-region').hover();
    await page.waitForTimeout(5200);
    await expect(info).toBeVisible();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(5200);
    await expect(info).toHaveCount(0);
  });
}

test('beUI stack uses a reduced-motion fallback and supports swipe dismissal', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?view=toast&theme=dark');
  await page.getByRole('button', { name: 'Informação', exact: true }).click();
  const toast = page.getByRole('status').filter({ hasText: 'Seu currículo foi salvo.' });
  await expect(toast).toBeVisible();
  await expect.poll(() => toast.evaluate(element => getComputedStyle(element).transform)).toBe('none');

  await toast.getByRole('button', { name: /^Fechar notificação:/ }).click();
  await expect(toast).toHaveCount(0);

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('button', { name: 'Informação', exact: true }).click();
  const swipeToast = page.getByRole('status').filter({ hasText: 'Seu currículo foi salvo.' });
  const box = await swipeToast.boundingBox();
  if (!box) throw new Error('Toast did not render a draggable surface.');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width + 120, box.y + box.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect(swipeToast).toHaveCount(0);
});
