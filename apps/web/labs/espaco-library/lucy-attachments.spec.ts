import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const evidence = fileURLToPath(new URL('./evidence/lucy-attachments/', import.meta.url));
const fixture = (name = 'currículo.pdf') => ({ name, mimeType: 'application/pdf', buffer: Buffer.from('%PDF demo metadata only') });
async function capture(page: Page, info: TestInfo, name: string) {
  await mkdir(evidence, { recursive: true });
  await page.screenshot({ path: `${evidence}${info.project.name}-${name}.png`, fullPage: true, animations: 'disabled' });
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  const composer = page.locator('.es-composer');
  expect(await composer.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
}

test('attachment anatomy; light/dark, long names, RTL, zoom and keyboard focus', async ({ page }, info) => {
  for (const theme of ['dark', 'light']) {
    await page.goto(`/?view=lucy&preview=attachments&theme=${theme}`);
    await page.evaluate(() => document.fonts.ready);
    const list = page.getByRole('list', { name: 'Anexos da mensagem' });
    await expect(list.getByRole('listitem')).toHaveCount(3);
    await expect(page.locator('.es-composer')).toHaveCSS('border-radius', '24px');
    const form = page.locator('.es-composer form');
    expect((await list.boundingBox())!.y).toBeLessThan((await form.boundingBox())!.y);
    const contrast = await list.locator('bdi').first().evaluate(element => {
      const rgb = (value: string) => value.match(/[\d.]+/g)!.map(Number);
      const luminance = (color: number[]) => color.slice(0, 3).map(c => c / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
      const fg = luminance(rgb(getComputedStyle(element).color));
      const bg = luminance(rgb(getComputedStyle(element.closest('li')!).backgroundColor));
      return (Math.max(fg, bg) + .05) / (Math.min(fg, bg) + .05);
    });
    expect(contrast).toBeGreaterThanOrEqual(4.5);
    await capture(page, info, theme);
    await page.setViewportSize({ width: 320, height: 900 });
    const longName = 'Experiências-profissionais-e-resultados-completos-2026-日本語-العربية.pdf';
    await page.locator('input[type=file]').setInputFiles(fixture(longName));
    await expect(list.locator('bdi').last()).toHaveText(longName);
    await expect(list.locator('bdi').last()).toHaveCSS('overflow-wrap', 'anywhere');
    await noOverflow(page);
    for (const button of await list.getByRole('button').all()) {
      const box = (await button.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44);
      await button.focus(); await expect(button).toHaveCSS('outline-width', '2px');
    }
    await capture(page, info, theme + '-320');
    await page.evaluate(() => document.documentElement.dir = 'rtl');
    await noOverflow(page);
    await page.evaluate(() => { document.documentElement.dir = 'ltr'; document.documentElement.style.zoom = '2'; });
    await page.setViewportSize({ width: 800, height: 1000 }); await noOverflow(page);
    await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
    await list.getByRole('button').first().focus();
    await expect(list.getByRole('button').first()).toHaveCSS('outline-width', '2px');
    await page.emulateMedia({ forcedColors: 'none', reducedMotion: 'no-preference' });
    await page.setViewportSize(info.project.use.viewport!);
  }
});

test('real attach action, cancel, duplicate names, removal, draft recovery and local-only submission', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => { if (['fetch', 'xhr'].includes(request.resourceType())) requests.push(request.url()); });
  await page.goto('/?view=lucy&theme=dark&preview=error');
  await page.getByRole('button', { name: 'Descrever experiências', exact: true }).click();
  const editor = page.getByRole('textbox', { name: 'Suas experiências' });
  await editor.fill('Destaque meus resultados.');
  const picker = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Anexar arquivos' }).click();
  await (await picker).setFiles([fixture(), fixture('portfolio.pdf')]);
  await expect(editor).toHaveValue('Destaque meus resultados.'); await expect(editor).toBeFocused();
  const list = page.getByRole('list', { name: 'Anexos da mensagem' });
  await expect(list.getByRole('listitem')).toHaveCount(2);
  await page.locator('input[type=file]').setInputFiles([]);
  await expect(list.getByRole('listitem')).toHaveCount(2);
  await page.locator('input[type=file]').setInputFiles(fixture());
  await expect(list.getByRole('listitem')).toHaveCount(3);
  await list.getByRole('button', { name: 'Remover currículo.pdf' }).first().focus();
  await page.keyboard.press('Space');
  await expect(list.getByRole('button', { name: 'Remover portfolio.pdf' })).toBeFocused();
  await expect(list.getByRole('button', { name: 'Remover currículo.pdf' })).toHaveCount(1);
  await page.locator('input[type=file]').setInputFiles({ name: 'vazio.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(0) });
  await expect(page.getByRole('alert')).toContainText('O rascunho e os anexos anteriores foram mantidos');
  await expect(list.getByRole('listitem')).toHaveCount(2);
  await page.getByRole('button', { name: 'Escolher outra opção' }).click();
  await page.getByRole('button', { name: 'Descrever experiências', exact: true }).click();
  await expect(list.getByRole('listitem')).toHaveCount(2);
  await page.getByRole('button', { name: 'Nova conversa', exact: true }).click();
  await page.getByRole('button', { name: 'Manter conversa' }).click();
  await expect(list.getByRole('listitem')).toHaveCount(2);
  await page.getByRole('button', { name: 'Enviar mensagem' }).click();
  await expect(page.getByRole('alert')).toContainText('Falha simulada');
  await expect(list.getByRole('listitem')).toHaveCount(2);
  await expect(editor).toHaveValue('Destaque meus resultados.');
  await page.getByRole('button', { name: 'Enviar mensagem' }).click();
  await expect(list).toHaveCount(0); await expect(editor).toHaveValue('');
  await expect(page.locator('.es-chat-message[data-role=assistant]').last()).toContainText('não foram lidos nem enviados');
  await page.locator('input[type=file]').setInputFiles(fixture());
  await list.getByRole('button').click(); await expect(editor).toBeFocused();
  await page.locator('input[type=file]').setInputFiles(fixture());
  await page.getByRole('button', { name: 'Enviar mensagem' }).click();
  await expect(list).toHaveCount(0);
  await page.goto('/?view=lucy&preview=loading');
  await expect(page.getByRole('button', { name: 'Anexar arquivos' })).toBeDisabled();
  await page.getByRole('button', { name: 'Interromper prévia' }).click();
  await expect(page.getByRole('button', { name: 'Anexar arquivos' })).toBeEnabled();
  expect(requests).toEqual([]);
});
