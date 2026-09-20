import { expect, test, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const evidence = fileURLToPath(new URL('./evidence/decisions/', import.meta.url));
const accessTitle = 'Permitir acesso ao currículo?';
const batchTitle = 'Preparar 3 candidaturas?';
const questionTitle = 'Como você prefere trabalhar?';
const card = (page: Page, title: string) => page.getByRole('article', { name: title, exact: true });
const nextFrame = (page: Page) => page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())));

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

test('BER-30 keeps native groups controlled through lag/rejection and instance-scoped names', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/?view=decisions&theme=light');
  const fixture = page.getByRole('heading', { name: 'RadioGroup controlado', exact: true }).locator('..');
  const explicit = fixture.getByRole('group', { name: 'Preferência controlada com nome explícito', exact: true });
  const generated = fixture.getByRole('group', { name: 'Segunda instância com nome gerado', exact: true });
  const explicitInputs = explicit.locator('input[type="radio"]');
  const generatedInputs = generated.locator('input[type="radio"]');
  await expect(explicitInputs.first()).toHaveAttribute('name', 'ber30-custom-name');
  await expect(generatedInputs.first()).not.toHaveAttribute('name', 'ber30-custom-name');
  expect(await explicitInputs.first().getAttribute('name')).not.toBe(await generatedInputs.first().getAttribute('name'));

  const remote = explicit.getByRole('radio', { name: 'Remoto', exact: true });
  const hybrid = explicit.getByRole('radio', { name: 'Híbrido', exact: true });
  const office = explicit.getByRole('radio', { name: 'Presencial', exact: true });
  const attempts = fixture.getByRole('status');
  await hybrid.click();
  await expect(hybrid).toBeChecked();
  await expect(attempts).toContainText('Tentativas de callback: 1.');
  await fixture.getByRole('button', { name: 'Rejeitar escolha', exact: true }).click();
  await remote.click();
  await expect(hybrid).toBeChecked();
  await expect(remote).not.toBeChecked();
  await expect(attempts).toContainText('Tentativas de callback: 2.');
  await fixture.getByRole('button', { name: 'Definir presencial externamente', exact: true }).click();
  await expect(office).toBeChecked();
  await expect(attempts).toContainText('Tentativas de callback: 2.');
  await fixture.getByRole('button', { name: 'Atrasar escolha', exact: true }).click();
  await remote.click();
  expect(await office.isChecked()).toBe(true);
  await expect(remote).not.toBeChecked();
  await expect(attempts).toContainText('Tentativas de callback: 3.');
  await expect.poll(() => remote.isChecked()).toBe(true);
  await expect(generated.getByRole('radio', { name: 'Remoto', exact: true })).toBeChecked();
  await remote.click();
  await expect(attempts).toContainText('Tentativas de callback: 3.');

  await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
  await remote.focus();
  await remote.press('ArrowRight');
  await expect(hybrid).toBeChecked();
  await hybrid.press('ArrowLeft');
  await expect(remote).toBeChecked();
  await remote.press('End');
  await expect(office).toBeChecked();
  await remote.press('Home');
  await expect(remote).toBeChecked();
  await remote.press('Enter');
  await expect(attempts).toContainText('Tentativas de callback: 7.');
  await expect(explicit.getByRole('radio', { name: 'A definir — indisponível neste exemplo', exact: true })).toBeDisabled();
});

test('BER-30 keeps question rows static for keyboard selection and paints focus in forced colors', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/?view=decisions&theme=dark');
  const question = card(page, questionTitle);
  const group = question.getByRole('group', { name: questionTitle, exact: true });
  const remote = group.getByRole('radio', { name: 'Remoto', exact: true });
  const hybrid = group.getByRole('radio', { name: 'Híbrido', exact: true });
  await remote.focus();
  await remote.press('Space');
  await remote.press('ArrowDown');
  await expect(hybrid).toBeChecked();
  const transforms = await question.locator('.es-radio-option, .es-radio-number').evaluateAll(elements => elements.map(element => getComputedStyle(element).transform));
  expect(transforms.every(transform => transform === 'none')).toBe(true);
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await hybrid.focus();
  const hybridOption = question.locator('.es-radio-option').filter({ hasText: 'Híbrido' });
  await expect(hybridOption).toHaveCSS('outline-style', 'solid');
  await expect(hybridOption.locator('.es-radio-number')).toHaveCSS('outline-style', 'solid');
});

test('BER-30 glides only accepted pointer dots and drops stale rejected targets', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/?view=decisions&theme=light');
  const fixture = page.getByRole('heading', { name: 'RadioGroup controlado', exact: true }).locator('..');
  const group = fixture.getByRole('group', { name: 'Preferência controlada com nome explícito', exact: true });
  const remote = group.getByRole('radio', { name: 'Remoto', exact: true });
  const hybrid = group.getByRole('radio', { name: 'Híbrido', exact: true });
  const office = group.getByRole('radio', { name: 'Presencial', exact: true });
  const dot = (value: string) => group.locator(`input[value="${value}"]:checked + .es-radio-indicator .es-radio-dot`);
  await remote.scrollIntoViewIfNeeded();
  await hybrid.click();
  await expect.poll(() => dot('hybrid').getAttribute('style')).toMatch(/translate3d/);
  const glideTransform = await dot('hybrid').getAttribute('style');
  expect(glideTransform).not.toMatch(/translate3d\(0px, 0px/);
  await expect(hybrid).toBeChecked();

  await fixture.getByRole('button', { name: 'Rejeitar escolha', exact: true }).click();
  await remote.click();
  await expect(hybrid).toBeChecked();
  await fixture.getByRole('button', { name: 'Definir presencial externamente', exact: true }).click();
  await expect(office).toBeChecked();
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())));
  expect(await dot('office').getAttribute('style')).not.toContain('translate3d');

  await fixture.getByRole('button', { name: 'Atrasar escolha', exact: true }).click();
  await remote.click();
  await expect.poll(() => remote.isChecked()).toBe(true);
  await expect.poll(() => dot('remote').getAttribute('style')).toMatch(/translate3d/);
});

test('BER-30 keeps default keyboard navigation instant through immediate and delayed acceptance', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/?view=decisions&theme=light');
  const fixture = page.getByRole('heading', { name: 'RadioGroup controlado', exact: true }).locator('..');
  const group = fixture.getByRole('group', { name: 'Preferência controlada com nome explícito', exact: true });
  const remote = group.getByRole('radio', { name: 'Remoto', exact: true });
  const hybrid = group.getByRole('radio', { name: 'Híbrido', exact: true });
  const office = group.getByRole('radio', { name: 'Presencial', exact: true });
  const assertInstant = async () => {
    const transforms = await group.locator('.es-radio-option, .es-radio-dot').evaluateAll(elements => elements.map(element => getComputedStyle(element).transform));
    expect(transforms.every(transform => transform === 'none')).toBe(true);
    const styles = await group.locator('.es-radio-dot').evaluateAll(elements => elements.map(element => element.getAttribute('style') ?? ''));
    expect(styles.every(style => !style.includes('translate3d'))).toBe(true);
  };

  await remote.focus();
  await remote.press('ArrowRight');
  await expect(hybrid).toBeChecked();
  await nextFrame(page);
  await assertInstant();
  await hybrid.press('Home');
  await expect(remote).toBeChecked();
  await nextFrame(page);
  await assertInstant();
  await remote.press('End');
  await expect(office).toBeChecked();
  await nextFrame(page);
  await assertInstant();
  await hybrid.press('Space');
  await expect(hybrid).toBeChecked();
  await nextFrame(page);
  await assertInstant();

  await fixture.getByRole('button', { name: 'Atrasar escolha', exact: true }).click();
  await hybrid.focus();
  await hybrid.press('ArrowRight');
  expect(await hybrid.isChecked()).toBe(true);
  await nextFrame(page);
  await assertInstant();
  await expect.poll(() => office.isChecked()).toBe(true);
  await nextFrame(page);
  await assertInstant();
});

test('BER-30 applies the .92 pointer press frame to default options', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/?view=decisions&theme=light');
  const fixture = page.getByRole('heading', { name: 'RadioGroup controlado', exact: true }).locator('..');
  const group = fixture.getByRole('group', { name: 'Preferência controlada com nome explícito', exact: true });
  const hybrid = group.getByRole('radio', { name: 'Híbrido', exact: true });
  const option = group.locator('.es-radio-option').filter({ hasText: 'Híbrido' });
  await option.scrollIntoViewIfNeeded();
  const box = await option.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await nextFrame(page);
  const transform = await option.evaluate(element => getComputedStyle(element).transform);
  const scale = Number(transform.match(/^matrix\(([^,]+)/)?.[1]);
  expect(scale).toBeGreaterThan(0.9);
  expect(scale).toBeLessThan(0.95);
  await page.waitForTimeout(50);
  const settledPressScale = Number((await option.evaluate(element => getComputedStyle(element).transform)).match(/^matrix\(([^,]+)/)?.[1]);
  expect(settledPressScale).toBeCloseTo(0.92, 2);
  await page.mouse.up();
  await expect(hybrid).toBeChecked();
  await expect.poll(() => option.evaluate(element => getComputedStyle(element).transform)).toBe('none');
});

test('BER-30 follows a live reduced-motion toggle in the default RadioGroup', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/?view=decisions&theme=light');
  const fixture = page.getByRole('heading', { name: 'RadioGroup controlado', exact: true }).locator('..');
  const group = fixture.getByRole('group', { name: 'Preferência controlada com nome explícito', exact: true });
  const hybrid = group.getByRole('radio', { name: 'Híbrido', exact: true });
  const office = group.getByRole('radio', { name: 'Presencial', exact: true });
  const remote = group.getByRole('radio', { name: 'Remoto', exact: true });
  const dot = (value: string) => group.locator(`input[value="${value}"]:checked + .es-radio-indicator .es-radio-dot`);
  await hybrid.scrollIntoViewIfNeeded();
  const box = await hybrid.locator('..').boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.up();
  await expect.poll(() => dot('hybrid').getAttribute('style')).toMatch(/translate3d/);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
  await fixture.getByRole('button', { name: 'Aceitar agora', exact: true }).click();
  await office.click();
  await expect(office).toBeChecked();
  await nextFrame(page);
  expect(await dot('office').getAttribute('style')).not.toContain('translate3d');

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(() => page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(false);
  await remote.click();
  await expect.poll(() => dot('remote').getAttribute('style')).toMatch(/translate3d/);
});

test('BER-30 paints forced-colors focus on the default radio indicator', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.goto('/?view=decisions&theme=light');
  const fixture = page.getByRole('heading', { name: 'RadioGroup controlado', exact: true }).locator('..');
  const group = fixture.getByRole('group', { name: 'Preferência controlada com nome explícito', exact: true });
  const remote = group.getByRole('radio', { name: 'Remoto', exact: true });
  await remote.focus();
  await expect(group.locator('input:focus-visible + .es-radio-indicator')).toHaveCSS('outline-style', 'solid');
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
