import { expect, test, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const evidence = fileURLToPath(new URL('./evidence/upload/', import.meta.url));
const pdf = { name: 'Currículo.PDF', mimeType: 'application/pdf', buffer: Buffer.from('%PDF synthetic preview') };
const docx = { name: 'Experiências.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', buffer: Buffer.from('PK synthetic preview') };

async function dropFile(page: Page, name: string, content: string, type = 'application/pdf') {
  const transfer = await page.evaluateHandle(({ name, content, type }) => {
    const data = new DataTransfer();
    data.items.add(new File([content], name, { type }));
    return data;
  }, { name, content, type });
  await page.locator('.es-file-dropzone').dispatchEvent('dragenter', { dataTransfer: transfer });
  await page.locator('.es-file-dropzone').dispatchEvent('drop', { dataTransfer: transfer });
  await transfer.dispose();
}

test('catalog entry, keyboard picker, both themes, selection and focus recovery', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const theme of ['light', 'dark']) {
    await page.goto('/?view=components&theme=' + theme);
    if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Navigation', exact: true }).click();
    await page.getByRole('link', { name: 'Upload de currículo', exact: true }).click();
    const browse = page.getByRole('button', { name: 'Selecionar currículo', exact: true });
    await page.evaluate(() => document.fonts.ready);
    await browse.focus();
    await expect(browse).toHaveCSS('outline-style', 'solid');
    await expect(browse).toHaveAccessibleDescription('PDF ou Word (.docx) · até 5 MB');
    expect((await browse.boundingBox())!.height).toBeGreaterThanOrEqual(info.project.name === 'mobile' ? 44 : 40);
    await page.screenshot({ path: evidence + `${info.project.name}-${theme}-empty.png`, fullPage: true });
    const chooser = page.waitForEvent('filechooser');
    await browse.press('Enter');
    await (await chooser).setFiles(pdf);
    await expect(page.getByRole('list', { name: 'Sua trajetória começa aqui' })).toContainText(pdf.name);
    await page.getByRole('button', { name: 'Continuar prévia', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('ainda não estão conectadas');
    const remove = page.getByRole('button', { name: `Remover currículo: ${pdf.name}`, exact: true });
    await remove.focus();
    await remove.press('Enter');
    await expect(browse).toBeFocused();
    await expect(page.getByRole('status')).toContainText('O arquivo original não foi alterado');
    await page.locator('input[type=file]').setInputFiles(docx);
    await page.screenshot({ path: evidence + `${info.project.name}-${theme}-selected.png`, fullPage: true });
  }
  expect(errors).toEqual([]);
});

test('drop, invalid replacements, cancel and recovery preserve the selected document', async ({ page }) => {
  await page.goto('/?view=upload&theme=dark');
  const input = page.locator('input[type=file]');
  const list = page.getByRole('list', { name: 'Sua trajetória começa aqui' });
  await dropFile(page, 'currículo.pdf', '%PDF fixture');
  await expect(list).toContainText('currículo.pdf');
  // Canceled native selection must never emit an empty replacement.
  await input.setInputFiles([]);
  await expect(list).toContainText('currículo.pdf');
  for (const [file, message] of [
    [{ ...pdf, name: 'antigo.doc' }, 'salve uma cópia em PDF ou DOCX'],
    [{ ...pdf, buffer: Buffer.alloc(0) }, 'arquivo está vazio'],
    [{ ...pdf, buffer: Buffer.alloc(5 * 1024 * 1024 + 1) }, 'ultrapassa 5 MB'],
  ] as const) {
    await input.setInputFiles(file);
    await expect(page.getByRole('alert')).toContainText(message);
    await expect(page.getByRole('alert')).toContainText('anterior foi mantido');
    await expect(list).toContainText('currículo.pdf');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
  }
  await input.setInputFiles([pdf, docx]);
  await expect(page.getByRole('alert')).toContainText('um currículo por vez');
  await dropFile(page, 'documento.docx', 'PK fixture', docx.mimeType);
  await expect(list).toContainText('documento.docx');
  await expect(page.getByRole('alert')).toHaveCount(0);
  const nonFile = await page.evaluateHandle(() => { const data = new DataTransfer(); data.setData('text/plain', 'not a file'); return data; });
  await page.locator('.es-file-dropzone').dispatchEvent('drop', { dataTransfer: nonFile });
  await expect(list).toContainText('documento.docx');
  await nonFile.dispose();
  await page.goto('/?view=upload&preview=disabled');
  await expect(page.getByRole('button', { name: 'Selecionar currículo', exact: true })).toBeDisabled();
  await dropFile(page, 'currículo.pdf', '%PDF fixture');
  await expect(page.locator('.es-file-upload-list')).toHaveCount(0);
});

test('Lucy resume choice uses document field and accepts DOCX without a real import', async ({ page }) => {
  await page.goto('/?view=lucy&theme=dark');
  await page.getByRole('button', { name: /Importar currículo/ }).click();
  await expect(page.locator('.es-file-upload')).toHaveAttribute('data-purpose', 'document');
  await page.locator('input[type=file]').setInputFiles(docx);
  await page.getByRole('button', { name: 'Escolher outra opção', exact: true }).click();
  await page.getByRole('button', { name: /Importar currículo/ }).click();
  await expect(page.locator('.es-file-upload-list')).toContainText(docx.name);
  await page.getByRole('button', { name: 'Continuar prévia', exact: true }).click();
  await expect(page.getByText('O arquivo foi selecionado apenas nesta prévia, sem leitura ou envio.', { exact: false })).toBeVisible();
});

test('narrow, long filename, zoom, contrast, RTL and reduced motion', async ({ page }, info) => {
  for (const theme of ['light', 'dark']) {
    await page.goto('/?view=upload&theme=' + theme);
    const colors = await page.locator('.es-file-dropzone').evaluate(node => {
      const root = getComputedStyle(node.closest('.es-root')!);
      return { bg: root.getPropertyValue('--es-bg').trim(), fg: root.getPropertyValue('--es-secondary').trim() };
    });
    const lum = (hex: string) => {
      const rgb = hex.replace('#', '').match(/../g)!.map(x => parseInt(x, 16) / 255).map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4);
      return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2];
    };
    const pair = [lum(colors.bg), lum(colors.fg)].sort((a, b) => b - a);
    expect((pair[0] + .05) / (pair[1] + .05)).toBeGreaterThanOrEqual(4.5);
    const longName = 'Currículo de Luísa — experiências em pesquisa e design de produtos internacionais '.repeat(3) + '.pdf';
    await page.locator('input[type=file]').setInputFiles({ ...pdf, name: longName });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
      await expect(page.locator('.es-file-upload-list>li>span')).toHaveText(longName);
      await expect(page.locator('.es-file-upload-list>li>span')).toHaveCSS('white-space', 'normal');
    }
    await page.evaluate(() => document.documentElement.dir = 'rtl');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.evaluate(() => document.documentElement.dir = 'ltr');
    // CSS zoom stress at the desktop contract width; unlike browser zoom it
    // does not change viewport media queries. Narrow reflow is checked above.
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.evaluate(() => document.body.style.zoom = '2');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.screenshot({ path: evidence + `${info.project.name}-${theme}-zoom.png`, fullPage: true });
    await page.evaluate(() => document.body.style.zoom = '1');
  }
});
