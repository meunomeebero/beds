import { expect, test } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const evidence = fileURLToPath(new URL('./evidence/onboarding/', import.meta.url));

test('catalog entry, both themes, keyboard validation and exact live preview', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const theme of ['light', 'dark']) {
    await page.goto('/?view=chat&theme=' + theme);
    if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Navigation', exact: true }).click();
    await page.getByRole('link', { name: 'Onboarding', exact: true }).click();
    await expect(page).toHaveURL(/view=onboarding/);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Prepare seu espaço');
    const form = page.getByRole('form', { name: 'Prepare seu espaço' });
    const name = page.getByRole('textbox', { name: 'Nome', exact: true });
    const submit = form.getByRole('button', { name: 'Continuar', exact: true });
    await expect(submit).toBeEnabled();
    await name.focus();
    await name.press('Enter');
    await expect(name).toHaveAttribute('aria-invalid', 'true');
    await expect(name).toBeFocused();
    await expect(name).toHaveAccessibleDescription('Informe seu nome para continuar.');
    await expect(name).toHaveCSS('outline-style', 'solid');
    await name.fill('Luísa Costa');
    await expect(name).not.toHaveAttribute('aria-invalid', 'true');
    await name.press('Tab');
    await expect(page.getByRole('textbox', { name: 'Título profissional (opcional)' })).toBeFocused();
    await page.keyboard.type('Product designer');
    await expect(page.locator('.es-onboarding-window-header')).toContainText('Luísa Costa');
    await expect(page.locator('.es-onboarding-window-content')).toContainText('Product designer');
    await expect(page.locator('.es-onboarding-preview')).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('.es-onboarding-preview button, .es-onboarding-preview input, .es-onboarding-preview a')).toHaveCount(0);
    await page.keyboard.press('Tab');
    await page.keyboard.type('São Paulo');
    await page.keyboard.press('Tab');
    await page.keyboard.type('seusite.com');
    await page.keyboard.press('Tab');
    await expect(submit).toBeFocused();
    await expect(submit).toHaveCSS('outline-style', 'solid');
    await submit.press('Enter');
    await expect(form.getByRole('status')).toHaveText('Prévia confirmada. Nenhum dado foi enviado.');
    await expect(name).toHaveValue('Luísa Costa');
    await expect(page.locator('.es-onboarding-card')).toHaveCSS('border-radius', '24px');
    await expect(page.locator('.es-onboarding-card')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    expect((await submit.boundingBox())!.height).toBeGreaterThanOrEqual(info.project.name === 'mobile' ? 44 : 40);
    await page.screenshot({ path: evidence + `${info.project.name}-${theme}.png`, fullPage: true });
  }
  expect(errors).toEqual([]);
});

test('form failure, retry, pending lock and explicit simulation completion', async ({ page }) => {
  await page.goto('/?view=onboarding&theme=dark');
  const form = page.getByRole('form');
  await page.getByRole('textbox', { name: 'Nome', exact: true }).fill('Luísa Costa');
  await page.getByRole('button', { name: 'Resultado simulado' }).click();
  await page.getByRole('option', { name: 'Erro', exact: true }).click();
  await form.getByRole('button', { name: 'Continuar', exact: true }).click();
  await expect(form.getByRole('alert')).toHaveText(/Seus campos foram mantidos/);
  await page.getByRole('button', { name: 'Resultado simulado' }).click();
  await page.getByRole('option', { name: 'Sucesso', exact: true }).click();
  await form.getByRole('button', { name: 'Continuar', exact: true }).click();
  await expect(form.getByRole('status')).toHaveText(/Prévia confirmada/);
  await expect(form.getByRole('alert')).toBeEmpty();
  await page.getByRole('button', { name: 'Resultado simulado' }).click();
  await page.getByRole('option', { name: 'Aguardando', exact: true }).click();
  await form.getByRole('button', { name: 'Continuar', exact: true }).click();
  await expect(form).toHaveAttribute('aria-busy', 'true');
  for (const input of await form.getByRole('textbox').all()) await expect(input).toBeDisabled();
  await expect(form.getByRole('button', { name: 'Continuar', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Concluir simulação' }).click();
  await expect(form).not.toHaveAttribute('aria-busy', 'true');
  await expect(form.getByRole('textbox', { name: 'Nome', exact: true })).toBeEnabled();
  await expect(form.getByRole('textbox', { name: 'Nome', exact: true })).toHaveValue('Luísa Costa');
  await expect(form.getByRole('status')).toContainText('Nenhum dado foi enviado.');
});

test('narrow reflow, long copy, RTL, zoom and reduced motion', async ({ page }, info) => {
  for (const theme of ['light', 'dark']) {
    await page.goto('/?view=onboarding&theme=' + theme);
    await page.getByRole('textbox', { name: 'Nome', exact: true }).fill('Luísa Albuquerque Costa dos Santos');
    for (const width of [1440, 820, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const preview = page.locator('.es-onboarding-preview');
      if (width >= 820) await expect(preview).toBeVisible();
      else await expect(preview).toBeHidden();
      if (width <= 767) await expect(page.getByRole('textbox', { name: 'Nome', exact: true })).toHaveCSS('font-size', '16px');
    }
    await page.getByRole('button', { name: 'Continuar', exact: true }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: evidence + `${info.project.name}-${theme}-320.png`, fullPage: true });
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.evaluate(() => {
      document.documentElement.dir = 'rtl';
      document.body.style.zoom = '2';
      document.querySelector('h1')!.textContent = 'Configure seu espaço profissional e suas próximas oportunidades';
      document.querySelector('.es-onboarding-actions button span')!.textContent = 'Continuar para a próxima etapa de configuração';
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('button', { name: 'Continuar para a próxima etapa de configuração' })).toBeVisible();
    await page.screenshot({ path: evidence + `${info.project.name}-${theme}-zoom.png`, fullPage: true });
    await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
    await expect(page.locator('.es-onboarding-card')).toHaveCSS('border-top-style', 'solid');
    expect(await page.locator('.es-onboarding-preview').evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
    await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'none' });
  }
});
