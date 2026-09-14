import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark'] as const) {
  test.describe(`Form fields · ${theme}`, () => {
    test.beforeEach(async ({ page }) => {
      page.on('pageerror', error => { throw error; });
      await page.route('**/*', route => {
        const request = route.request();
        const url = new URL(request.url());
        if (!['127.0.0.1', 'localhost'].includes(url.hostname) || !['GET', 'HEAD'].includes(request.method())) {
          throw new Error(`Unexpected external or mutating request: ${request.method()} ${url.origin}${url.pathname}`);
        }
        return route.continue();
      });
      await page.goto(`/?theme=${theme}`);
      await expect(page.getByRole('heading', { name: 'Campos de formulário', exact: true })).toBeVisible();
    });

    test('RadioGroup keeps native keyboard selection, disabled state and error recovery', async ({ page }, testInfo) => {
      const group = page.getByRole('group', { name: 'Formato da análise', exact: true });
      const resume = group.getByRole('radio', { name: 'Currículo', exact: true });
      const profile = group.getByRole('radio', { name: 'Perfil do LinkedIn', exact: true });
      const unavailable = group.getByRole('radio', { name: 'Portfólio indisponível', exact: true });

      await page.getByRole('button', { name: 'Validar formato', exact: true }).click();
      await expect(group).toHaveAttribute('aria-invalid', 'true');
      await expect(group).toHaveAccessibleDescription(/Escolha um formato para continuar/);
      await resume.focus();
      await resume.press('ArrowRight');
      await expect(profile).toBeChecked();
      await expect(group).not.toHaveAttribute('aria-invalid');
      await expect(page.getByText('Formato selecionado: Perfil do LinkedIn.', { exact: true })).toBeVisible();
      await expect(unavailable).toBeDisabled();
      await expect(page.getByRole('group', { name: 'Formato indisponível', exact: true }).getByRole('radio', { name: 'Currículo' })).toBeDisabled();
      await page.screenshot({ path: testInfo.outputPath(`radio-${theme}.png`), fullPage: false });
    });

    test('FileUploadField handles picker, local drop, removal, disabled state and recovery', async ({ page }, testInfo) => {
      const field = page.locator('.es-file-upload').filter({ has: page.locator('input[aria-label="Arquivo de currículo"]') });
      const callbackOnlyForm = page.getByRole('form', { name: 'Contrato callback-only FileUploadField', exact: true });
      const dropzone = field.getByRole('group', { name: 'Arquivo de currículo', exact: true });
      const input = field.locator('input[type="file"]');
      const validate = page.getByRole('button', { name: 'Validar arquivo', exact: true });

      await expect(input).not.toHaveAttribute('name');
      await validate.click();
      await expect(input).toHaveAttribute('aria-invalid', 'true');
      await expect(dropzone).toHaveAccessibleDescription(/Selecione um arquivo para continuar/);
      await input.setInputFiles({ name: 'curriculo.pdf', mimeType: 'application/pdf', buffer: Buffer.from('currículo local') });
      await expect(field.getByText('curriculo.pdf', { exact: true })).toBeVisible();
      await expect.poll(() => input.evaluate(element => ({ files: element.files?.length, value: element.value }))).toEqual({ files: 0, value: '' });
      await expect.poll(() => callbackOnlyForm.evaluate(form => [...new FormData(form).entries()].map(([name]) => name))).toEqual([]);
      await expect(input).not.toHaveAttribute('aria-invalid');
      await field.getByRole('button', { name: 'Remover arquivo: curriculo.pdf', exact: true }).click();
      await expect(field.getByText('curriculo.pdf', { exact: true })).toHaveCount(0);

      await field.locator('.es-file-dropzone').evaluate(element => {
        const transfer = new DataTransfer();
        transfer.items.add(new File(['perfil local'], 'perfil.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
        element.dispatchEvent(new DragEvent('dragenter', { bubbles: true, dataTransfer: transfer }));
        element.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: transfer }));
      });
      await expect(field.getByText('perfil.docx', { exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Escolher arquivo indisponível', exact: true })).toBeDisabled();
      await page.screenshot({ path: testInfo.outputPath(`file-upload-${theme}.png`), fullPage: false });
    });
  });
}
