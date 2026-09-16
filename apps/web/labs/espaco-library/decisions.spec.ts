import { expect, test, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const evidence = fileURLToPath(new URL('./evidence/decisions/', import.meta.url));
const accessTitle = 'Permitir acesso ao currículo?';
const batchTitle = 'Preparar 3 candidaturas?';
const questionTitle = 'Como você prefere trabalhar?';
const card = (page: Page, title: string) => page.getByRole('article', { name: title, exact: true });

test('real catalog entry: three quiet cards, passive badges and unchanged compact radios', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const theme of ['dark', 'light']) {
    await page.goto('/?view=chat&theme=' + theme);
    if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Navigation', exact: true }).click();
    await page.getByRole('button', { name: 'Perguntas e aprovações', exact: true }).click();
    await expect(page).toHaveURL(/view=decisions/);
    await expect(page.getByRole('article')).toHaveCount(3);
    for (const title of [accessTitle, batchTitle, questionTitle]) {
      const item = card(page, title);
      await expect(item).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(item).toHaveCSS('border-radius', '24px');
      await expect(item).toHaveCSS('padding', '16px');
      await expect(item.getByRole('status')).toHaveText('');
      await expect(item.locator('.es-decision-status')).not.toHaveAttribute('role');
      await expect(item.getByRole('heading', { level: 2 })).toHaveText(title);
      expect((await item.boundingBox())!.width).toBeLessThanOrEqual(640);
      const buttons = await item.getByRole('button').all();
      for (const button of buttons) expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(info.project.name === 'mobile' ? 44 : 40);
    }
    const question = card(page, questionTitle);
    await expect(question.getByRole('radio', { checked: true })).toHaveCount(0);
    await expect(question.getByRole('radio', { name: /A definir/ })).toBeDisabled();
    await expect(card(page, batchTitle).locator('dt')).toHaveText(['Currículos', 'Cartas de apresentação', 'Total']);
    await expect(card(page, batchTitle).locator('dd')).toHaveText(['3 arquivos', '3 arquivos', '6 arquivos']);
    const classic = page.getByRole('group', { name: 'Controle compacto existente' });
    await expect(classic.getByRole('radio', { name: 'E-mail' })).toBeChecked();
    await expect(classic.locator('.es-radio-number')).toHaveCount(0);
    await expect(classic.locator('.es-radio-indicator')).toHaveCount(2);
    await expect(classic.locator('.es-radio-indicator').first()).toHaveCSS('width', '16px');
    await classic.getByRole('radio', { name: 'E-mail' }).focus();
    await page.keyboard.press('ArrowDown');
    await expect(classic.getByRole('radio', { name: 'Telefone' })).toBeChecked();
    await expect(card(page, questionTitle).getByRole('radio', { checked: true })).toHaveCount(0);
    await card(page, accessTitle).screenshot({ path: evidence + `${info.project.name}-${theme}-approval.png` });
    await card(page, batchTitle).screenshot({ path: evidence + `${info.project.name}-${theme}-details.png` });
    await question.screenshot({ path: evidence + `${info.project.name}-${theme}-question.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('approval is explicit; processing locks choices, failure recovers, skip and deny stay distinct', async ({ page }) => {
  await page.goto('/?view=decisions&theme=dark');
  const access = card(page, accessTitle);
  const allow = access.getByRole('button', { name: 'Permitir', exact: true });
  await allow.focus();
  await allow.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(allow).toBeFocused();
  await expect(allow).toHaveCSS('outline-style', 'solid');
  await allow.press('Enter');
  await expect(access.locator('.es-decision-status')).toHaveText('Confirmando');
  for (const action of await access.getByRole('button').all()) await expect(action).toBeDisabled();
  await expect(access.getByRole('status')).toContainText('Nenhuma operação real foi iniciada');
  await page.getByRole('button', { name: 'Simular falha de acesso' }).click();
  await expect(access.locator('.es-decision-status')).toHaveText('Não confirmado');
  await expect(allow).toBeEnabled();
  await expect(access.getByRole('status')).toContainText('Tente novamente');
  await allow.click();
  await page.getByRole('button', { name: 'Concluir simulação de acesso' }).click();
  await expect(access.locator('.es-decision-status')).toHaveText('Confirmado');
  await expect(allow).toBeDisabled();
  const batch = card(page, batchTitle);
  await batch.getByRole('button', { name: 'Pular', exact: true }).click();
  await expect(batch.locator('.es-decision-status')).toHaveText('Pulado');
  await expect(batch.getByRole('status')).toContainText('Nenhum documento foi criado');
  await expect(batch.getByRole('button', { name: 'Permitir', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Restaurar exemplos' }).click();
  await access.getByRole('button', { name: 'Negar', exact: true }).click();
  await expect(access.locator('.es-decision-status')).toHaveText('Negado');
  await expect(access.getByRole('status')).toContainText('Nenhum arquivo foi consultado');
  await page.getByRole('button', { name: 'Restaurar exemplos' }).click();
  await access.getByRole('button', { name: 'Sempre permitir', exact: true }).click();
  await expect(access.getByRole('status')).toContainText('Nenhuma preferência foi salva');
});

test('question separates native selection from confirmation and preserves the answer through recovery', async ({ page }, info) => {
  await page.goto('/?view=decisions&theme=light');
  const question = card(page, questionTitle);
  const confirm = question.getByRole('button', { name: 'Confirmar resposta' });
  const remote = question.getByRole('radio', { name: 'Remoto', exact: true });
  const hybrid = question.getByRole('radio', { name: 'Híbrido', exact: true });
  await confirm.click();
  await expect(question.getByRole('alert')).toHaveText('Escolha uma opção antes de confirmar.');
  await expect(question.getByRole('group')).toHaveAttribute('aria-invalid', 'true');
  await expect(question.getByRole('group')).toHaveAccessibleDescription('Escolha uma opção antes de confirmar.');
  await expect(remote).toBeFocused();
  await remote.press('Space');
  await remote.press('ArrowDown');
  await expect(hybrid).toBeChecked();
  await expect(question.getByRole('alert')).toHaveCount(0);
  await hybrid.press('ArrowDown');
  await expect(question.getByRole('radio', { name: 'Presencial', exact: true })).toBeChecked();
  await page.keyboard.press('ArrowDown');
  await expect(remote).toBeChecked();
  await expect(question.locator('.es-decision-status')).toHaveText('Confirmação');
  await expect(question.getByRole('status')).toHaveText('');
  await expect(question.locator('.es-radio-option').first()).toHaveCSS('outline-style', 'solid');
  await question.screenshot({ path: evidence + `${info.project.name}-selected-focus.png` });
  await remote.press('Tab');
  await expect(confirm).toBeFocused();
  await confirm.press('Enter');
  await expect(question.locator('.es-decision-status')).toHaveText('Confirmando');
  for (const input of await question.getByRole('radio').all()) await expect(input).toBeDisabled();
  await expect(question.getByRole('button', { name: 'Pular' })).toBeDisabled();
  await page.getByRole('button', { name: 'Simular falha da resposta' }).click();
  await expect(remote).toBeChecked();
  await expect(remote).toBeEnabled();
  await expect(question.getByRole('status')).toContainText('Tente novamente');
  await confirm.click();
  await page.getByRole('button', { name: 'Concluir simulação da resposta' }).click();
  await expect(remote).toBeChecked();
  await expect(confirm).toBeDisabled();
  await page.getByRole('button', { name: 'Restaurar exemplos' }).click();
  await remote.check();
  await page.getByRole('switch', { name: 'Testar pergunta sem opções' }).click();
  await expect(question.getByRole('radio')).toHaveCount(0);
  await confirm.click();
  await expect(question.getByRole('alert')).toContainText('Nenhuma opção disponível');
  await expect(question.getByRole('form')).toBeFocused();
  await expect(question.locator('.es-decision-status')).toHaveText('Confirmação');
  await question.getByRole('button', { name: 'Pular' }).click();
  await expect(question.locator('.es-decision-status')).toHaveText('Pulado');
  await expect(question.getByRole('alert')).toHaveCount(0);
});

test('long copy reflows, touch targets remain usable and forced colors retains selection', async ({ page }, info) => {
  for (const theme of ['light', 'dark']) {
    await page.goto('/?view=decisions&theme=' + theme);
    await page.getByRole('switch', { name: 'Testar texto longo' }).click();
    for (const width of [320, 390, 938, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      for (const item of await page.getByRole('article').all()) {
        await item.scrollIntoViewIfNeeded();
        expect(await item.evaluate(element => [...element.querySelectorAll('h2,p,button,dt,dd,label,.es-decision-status')].every(child => child.scrollWidth <= child.clientWidth + 1))).toBe(true);
        for (const action of await item.getByRole('button').all()) expect((await action.boundingBox())!.height).toBeGreaterThanOrEqual(width < 768 ? 44 : 40);
      }
      if (width === 320) await page.getByRole('article').first().screenshot({ path: evidence + `${info.project.name}-${theme}-long-320.png` });
    }
    await page.evaluate(() => { document.documentElement.dir = 'rtl'; document.documentElement.style.zoom = '2'; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    const question = page.getByRole('article').last();
    await question.screenshot({ path: evidence + `${info.project.name}-${theme}-zoom-rtl.png` });
    await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
    const first = question.getByRole('radio').first();
    await first.focus();
    await first.press('Space');
    await expect(first).toBeChecked();
    await expect(question.locator('.es-radio-option').first()).toHaveCSS('outline-style', 'solid');
    await expect(question.locator('.es-radio-number').first()).toHaveCSS('outline-style', 'solid');
    await expect(question.locator('.es-decision-status')).toHaveCSS('outline-style', 'solid');
    await page.emulateMedia({ forcedColors: 'none', reducedMotion: 'no-preference' });
  }
});
