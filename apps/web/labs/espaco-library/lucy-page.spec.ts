import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const choices = ['Importar dados do LinkedIn', 'Descrever experiências', 'Importar currículo'];
const evidence = fileURLToPath(new URL('./evidence/lucy-guided/', import.meta.url));
async function capture(page: Page, info: TestInfo, name: string) {
  await mkdir(evidence, { recursive: true });
  await page.screenshot({ path: evidence + info.project.name + '-' + name + '.png', fullPage: true, animations: 'disabled' });
}
async function ready(page: Page, theme = 'dark', extra = '') {
  await page.goto('/?view=lucy&theme=' + theme + extra);
  await expect(page.getByRole('heading', { name: 'Conversa com Lucy', exact: true })).toHaveCount(1);
  await page.evaluate(() => document.fonts.ready);
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
}

test('catalog entry; three native options; both themes and measured contrast', async ({ page }, info) => {
  await page.goto('/?view=components');
  const nav = page.getByRole('button', { name: 'Navigation', exact: true });
  if (await nav.isVisible()) await nav.click();
  await page.getByRole('link', { name: 'Página da Lucy', exact: true }).click();
  await expect(page.locator('.es-chat-options')).toBeVisible();
  for (const theme of ['dark', 'light']) {
    await ready(page, theme);
    const buttons = page.locator('.es-chat-options button');
    await expect(buttons).toHaveCount(3);
    for (const [index, label] of choices.entries()) {
      await expect(buttons.nth(index)).toHaveAccessibleName(label);
      expect((await buttons.nth(index).boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    await expect(page.getByRole('textbox')).toHaveCount(0);
    await expect(page.locator('input[type=file]')).toHaveCount(0);
    await expect(page.locator('.es-chat-message[data-role=user]')).toHaveCount(0);
    await expect(page.locator('.es-chat-message[data-role=assistant] .es-conversation-content')).toHaveCSS('border-width', '0px');
    await buttons.first().focus(); await expect(buttons.first()).toHaveCSS('outline-width', '2px');
    await capture(page, info, theme);
    const ratios = await page.locator('.es-chat-option-copy>span').evaluateAll(elements => {
      const rgb = (text: string) => text.match(/[\d.]+/g)!.map(Number);
      const luminance = (color: number[]) => color.slice(0, 3).map(c => c / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
      return elements.map(element => {
        const fg = luminance(rgb(getComputedStyle(element).color));
        const bg = luminance(rgb(getComputedStyle(element.closest('ul')!).backgroundColor));
        return (Math.max(fg, bg) + .05) / (Math.min(fg, bg) + .05);
      });
    });
    expect(Math.min(...ratios)).toBeGreaterThanOrEqual(4.5);
    await noOverflow(page);
  }
});

test('keyboard, validation, draft re-entry, local reply and explicit reset', async ({ page }, info) => {
  const requests: string[] = [];
  page.on('request', request => { if (['fetch', 'xhr'].includes(request.resourceType())) requests.push(request.url()); });
  await ready(page);
  await page.getByRole('button', { name: choices[1], exact: true }).focus();
  await page.keyboard.press('Space');
  const input = page.getByRole('textbox', { name: 'Suas experiências' });
  await expect(input).toBeFocused();
  await page.getByRole('button', { name: 'Enviar mensagem' }).click();
  await expect(input).toHaveAttribute('aria-invalid', 'true'); await expect(input).toBeFocused();
  await input.fill('Trabalhei com atendimento por três anos.');
  await input.press('Shift+Enter'); await input.press('A');
  const draft = await input.inputValue(); expect(draft).toContain('\nA');
  await page.getByRole('button', { name: 'Escolher outra opção' }).click();
  await expect(page.getByRole('button', { name: choices[0], exact: true })).toBeFocused();
  await page.getByRole('button', { name: choices[1], exact: true }).click();
  await expect(input).toHaveValue(draft);
  await input.press('Enter'); await expect(input).toHaveValue('');
  await expect(page.locator('.es-chat-message[data-role=user]').last()).toHaveText(draft);
  await expect(page.locator('.es-chat-message[data-role=assistant]').last()).toContainText('Para completar seu relato');
  await capture(page, info, 'conversation');
  await input.fill('Rascunho preservado.');
  await page.getByRole('button', { name: 'Nova conversa', exact: true }).click();
  await page.getByRole('button', { name: 'Manter conversa' }).click();
  await expect(input).toHaveValue('Rascunho preservado.');
  await page.getByRole('button', { name: 'Nova conversa', exact: true }).click();
  await page.getByRole('button', { name: 'Começar nova prévia', exact: true }).click();
  await expect(page.locator('.es-chat-options button')).toHaveCount(3);
  await expect(page.locator('.es-chat-message')).toHaveCount(1);
  expect(requests).toEqual([]);
});

test('progressive file selection: invalid, remove, draft persistence and preview', async ({ page }, info) => {
  await ready(page, 'light');
  for (const [choice, label, browseLabel, emptyError, typeError] of [
    [choices[0], 'PDF do LinkedIn', 'Selecionar PDF', 'Selecione um PDF', 'não esteja vazio'],
    [choices[2], 'Importar currículo', 'Selecionar currículo', 'Selecione um currículo em PDF ou DOCX', 'Use um arquivo PDF ou Word (.docx)'],
  ]) {
    await page.getByRole('button', { name: choice, exact: true }).click();
    await expect(page.getByRole('button', { name: browseLabel, exact: true })).toBeFocused();
    await page.getByRole('button', { name: 'Continuar prévia' }).click();
    await expect(page.getByRole('alert')).toContainText(emptyError);
    const input = page.locator('input[type=file]');
    await expect(input).toHaveAccessibleName(label);
    await input.setInputFiles({ name: 'arquivo.txt', mimeType: 'text/plain', buffer: Buffer.from('invalid') });
    await expect(page.getByRole('alert')).toContainText(typeError);
    await input.setInputFiles({ name: 'experiencias.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7 demo only') });
    await expect(page.getByRole('alert')).toHaveCount(0);
    await page.getByRole('button', { name: 'Remover arquivo: experiencias.pdf' }).click();
    await expect(page.locator('.es-file-upload-list')).toHaveCount(0);
    await input.setInputFiles({ name: 'experiencias.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7 demo only') });
    await capture(page, info, choice === choices[0] ? 'linkedin' : 'resume');
    await page.getByRole('button', { name: 'Escolher outra opção' }).click();
    await page.getByRole('button', { name: choice, exact: true }).click();
    await expect(page.locator('.es-file-upload-list')).toContainText('experiencias.pdf');
    await page.getByRole('button', { name: 'Continuar prévia' }).click();
    await expect(page.locator('.es-chat-message[data-role=assistant]').last()).toContainText('sem leitura ou envio');
    await expect(page.locator('.es-chat-options')).toHaveCount(0);
    await page.getByRole('button', { name: 'Escolher outra opção' }).click();
  }
});

test('320px, zoom, RTL, loading interruption and retry', async ({ page }, info) => {
  for (const theme of ['light', 'dark']) {
    await ready(page, theme);
    for (const width of [1440, 820, 600, 390, 320]) {
      await page.setViewportSize({ width, height: 900 }); await noOverflow(page);
      for (const row of await page.locator('.es-chat-options button').all()) {
        const box = (await row.boundingBox())!;
        expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
      }
    }
    await capture(page, info, theme + '-320');
    await page.evaluate(() => document.documentElement.dir = 'rtl');
    const row = page.locator('.es-chat-options button').first();
    expect((await row.locator('.es-chat-option-icon').boundingBox())!.x).toBeGreaterThan((await row.locator('.es-chat-option-copy').boundingBox())!.x);
    await noOverflow(page);
    await page.evaluate(() => { document.documentElement.dir = 'ltr'; document.documentElement.style.zoom = '2'; });
    await page.setViewportSize({ width: 800, height: 1000 }); await noOverflow(page);
    await page.getByRole('button', { name: choices[1], exact: true }).click();
    await page.getByRole('textbox', { name: 'Suas experiências' }).fill('Experiência profissional '.repeat(60));
    await noOverflow(page);
  }
  await ready(page, 'dark', '&preview=loading');
  await expect(page.getByRole('textbox')).toBeDisabled();
  await page.getByRole('button', { name: 'Interromper prévia' }).click();
  await expect(page.getByRole('textbox')).toBeEnabled();
  await ready(page, 'dark', '&preview=error');
  await page.getByRole('button', { name: choices[1], exact: true }).click();
  await page.getByRole('textbox').fill('Texto preservado');
  await page.getByRole('button', { name: 'Enviar mensagem' }).click();
  await expect(page.getByRole('alert')).toContainText('Falha simulada');
  await expect(page.getByRole('textbox')).toHaveValue('Texto preservado');
  await page.getByRole('button', { name: 'Enviar mensagem' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.getByRole('textbox').focus();
  await expect(page.locator('.es-composer form')).toHaveCSS('outline-width', '2px');
});

test('account theme, escape and sidebar collapse remain usable', async ({ page }, info) => {
  await ready(page);
  const opener = page.getByRole('button', { name: 'Navegação', exact: true });
  if (await opener.isVisible()) await opener.click();
  const sidebar = page.locator('.es-sidebar');
  const trigger = sidebar.getByRole('button', { name: 'Marina Costa workspace menu', exact: true });
  await trigger.click();
  const menu = page.locator('.es-account-menu');
  await expect(menu).toHaveCSS('width', '280px'); await expect(menu).toHaveCSS('border-radius', '12px');
  await menu.getByRole('radio', { name: 'Light', exact: true }).check();
  await expect(page.locator('.es-root')).toHaveAttribute('data-theme', 'light');
  await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
  if (info.project.name === 'mobile') {
    await page.keyboard.press('Escape'); await expect(opener).toBeFocused();
  } else {
    await sidebar.getByRole('button', { name: 'Collapse sidebar' }).click();
    await expect(sidebar).toHaveCSS('width', '62px');
    await sidebar.getByRole('button', { name: 'Expand sidebar' }).click();
    await expect(sidebar).toHaveCSS('width', '264px');
  }
  await expect(page.locator('.es-chat-options')).toBeVisible();
});
