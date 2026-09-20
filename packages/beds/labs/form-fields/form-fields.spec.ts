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
      const firstRemove = field.getByRole('button', { name: 'Remover arquivo: curriculo.pdf', exact: true });
      await firstRemove.focus();
      await firstRemove.press('Enter');
      await expect(field.getByText('curriculo.pdf', { exact: true })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Escolher arquivo', exact: true })).toBeFocused();
      // The native value reset permits selecting the same File again after removal.
      await input.setInputFiles({ name: 'curriculo.pdf', mimeType: 'application/pdf', buffer: Buffer.from('currículo local') });
      await expect(field.getByText('curriculo.pdf', { exact: true })).toBeVisible();

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

    test('FileUploadField keeps duplicate entry identity and blocks every drop navigation path', async ({ page }) => {
      const field = page.locator('.es-file-upload').filter({ has: page.locator('input[aria-label="Arquivo de currículo"]') });
      const input = field.locator('input[type="file"]');
      const list = field.getByRole('list', { name: 'Arquivo de currículo', exact: true });
      const dropzone = field.locator('.es-file-dropzone');

      const ids = await page.locator('.es-file-dropzone[role="group"]').evaluateAll(elements => elements.map(element => element.getAttribute('aria-labelledby')));
      expect(ids).toHaveLength(2);
      expect(new Set(ids).size).toBe(2);

      const sameObject = await input.evaluate(element => {
        const file = new File(['same object'], 'duplicado.pdf', { type: 'application/pdf', lastModified: 1700000000000 });
        const transfer = new DataTransfer();
        transfer.items.add(file);
        transfer.items.add(file);
        element.files = transfer.files;
        const result = element.files?.[0] === element.files?.[1];
        element.dispatchEvent(new Event('change', { bubbles: true }));
        return result;
      });
      expect(sameObject).toBeTruthy();
      await expect(list.getByRole('listitem')).toHaveCount(2);
      const sameObjectKeys = await list.getByRole('listitem').evaluateAll(items => items.map(item => item.getAttribute('data-file-entry')));
      expect(sameObjectKeys[0]).not.toBe(sameObjectKeys[1]);
      const sameObjectRemove = list.getByRole('button', { name: 'Remover arquivo: duplicado.pdf', exact: true });
      await sameObjectRemove.first().focus();
      await sameObjectRemove.first().press('Enter');
      await expect(list.getByRole('listitem')).toHaveCount(1);
      await expect(list.getByRole('listitem')).toHaveAttribute('data-file-entry', sameObjectKeys[1]!);
      await expect(list.getByRole('button', { name: 'Remover arquivo: duplicado.pdf', exact: true })).toBeFocused();

      const distinctObjects = await input.evaluate(element => {
        const first = new File(['same metadata'], 'mesmo.pdf', { type: 'application/pdf', lastModified: 1700000000001 });
        const second = new File(['same metadata'], 'mesmo.pdf', { type: 'application/pdf', lastModified: 1700000000001 });
        const transfer = new DataTransfer();
        transfer.items.add(first);
        transfer.items.add(second);
        element.files = transfer.files;
        const result = element.files?.[0] !== element.files?.[1];
        element.dispatchEvent(new Event('change', { bubbles: true }));
        return result;
      });
      expect(distinctObjects).toBeTruthy();
      await expect(list.getByRole('listitem')).toHaveCount(2);
      const distinctKeys = await list.getByRole('listitem').evaluateAll(items => items.map(item => item.getAttribute('data-file-entry')));
      await list.getByRole('button', { name: 'Remover arquivo: mesmo.pdf', exact: true }).first().press('Enter');
      await expect(list.getByRole('listitem')).toHaveCount(1);
      await expect(list.getByRole('listitem')).toHaveAttribute('data-file-entry', distinctKeys[1]!);

      const assertDropBoundary = async (payload: 'file' | 'text') => page.evaluate(payloadType => {
        const dropzone = document.querySelector('.es-file-upload .es-file-dropzone')!;
        const transfer = new DataTransfer();
        if (payloadType === 'file') transfer.items.add(new File(['drop'], 'drop.pdf', { type: 'application/pdf' }));
        else transfer.setData('text/plain', 'not a file');
        let bubbled = false;
        const listener = () => { bubbled = true; };
        document.addEventListener('drop', listener);
        const event = new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer });
        dropzone.dispatchEvent(event);
        document.removeEventListener('drop', listener);
        return { defaultPrevented: event.defaultPrevented, bubbled };
      }, payload);

      await expect.poll(() => assertDropBoundary('file')).toEqual({ defaultPrevented: true, bubbled: false });
      await expect.poll(() => assertDropBoundary('text')).toEqual({ defaultPrevented: true, bubbled: false });
      await page.goto(`/?theme=${theme}&removal=reject`);
      const rejectedField = page.locator('.es-file-upload').filter({ has: page.locator('input[aria-label="Arquivo de currículo"]') });
      const rejectedInput = rejectedField.locator('input[type="file"]');
      await rejectedInput.setInputFiles({ name: 'rejeitado.pdf', mimeType: 'application/pdf', buffer: Buffer.from('reject') });
      const rejectedRemove = rejectedField.getByRole('button', { name: 'Remover arquivo: rejeitado.pdf', exact: true });
      await rejectedRemove.focus();
      await rejectedRemove.press('Enter');
      await expect(rejectedField.getByText('rejeitado.pdf', { exact: true })).toBeVisible();
      await expect(rejectedField.getByRole('button', { name: 'Remover arquivo: rejeitado.pdf', exact: true })).toBeFocused();

      await page.goto(`/?theme=${theme}&removal=lag`);
      const laggedField = page.locator('.es-file-upload').filter({ has: page.locator('input[aria-label="Arquivo de currículo"]') });
      const laggedInput = laggedField.locator('input[type="file"]');
      await laggedInput.setInputFiles({ name: 'atrasado.pdf', mimeType: 'application/pdf', buffer: Buffer.from('lag') });
      const laggedRemove = laggedField.getByRole('button', { name: 'Remover arquivo: atrasado.pdf', exact: true });
      await laggedRemove.focus();
      await laggedRemove.press('Enter');
      await expect(laggedRemove).toBeFocused();
      await expect(laggedField.getByText('atrasado.pdf', { exact: true })).toHaveCount(0);
      await expect(laggedField.getByRole('button', { name: 'Escolher arquivo', exact: true })).toBeFocused();

      await page.goto(`/?theme=${theme}&preview=disabled`);
      const disabledDrop = page.locator('.es-file-upload').filter({ has: page.locator('input[aria-label="Arquivo indisponível"]') }).locator('.es-file-dropzone');
      const disabledBoundary = await disabledDrop.evaluate(dropzone => {
        const transfer = new DataTransfer();
        transfer.items.add(new File(['drop'], 'disabled.pdf', { type: 'application/pdf' }));
        let bubbled = false;
        const listener = () => { bubbled = true; };
        document.addEventListener('drop', listener);
        const event = new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer });
        dropzone.dispatchEvent(event);
        document.removeEventListener('drop', listener);
        return { defaultPrevented: event.defaultPrevented, bubbled };
      });
      expect(disabledBoundary).toEqual({ defaultPrevented: true, bubbled: false });
    });
  });
}
