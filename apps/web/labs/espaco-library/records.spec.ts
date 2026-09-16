import { expect, test } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const evidence = fileURLToPath(new URL('./evidence/records/', import.meta.url));

test('catalog entry, semantic pairs, list identity and transparent geometry', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const theme of ['dark', 'light']) {
    await page.goto('/?view=chat&theme=' + theme);
    if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Navigation', exact: true }).click();
    await page.getByRole('button', { name: 'Dados e opções', exact: true }).click();
    await expect(page).toHaveURL(/view=records/);
    await page.evaluate(() => document.fonts.ready);
    const table = page.getByRole('region', { name: 'Sincronização de dados' });
    await expect(table.locator('dt')).toHaveText(['Documentos sincronizados', 'Coleções sincronizadas']);
    await expect(table.locator('dd')).toHaveText(['15', '12']);
    await expect(table.getByRole('link', { name: 'Ver os 15 documentos no catálogo' })).toHaveAttribute('href', '?view=components');
    const list = page.getByRole('region', { name: 'Espaços conectados' });
    await expect(list.getByRole('listitem')).toHaveCount(3);
    await expect(list.getByRole('group', { name: 'Permissões do espaço' })).toBeVisible();
    for (const frame of [table.locator('dl'), list.locator('ul')]) {
      await expect(frame).toHaveCSS('border-radius', '20px');
      await expect(frame).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    }
    await expect(list.locator('.es-option-details')).toHaveCSS('border-radius', '12px');
    const disclosure = list.getByRole('button');
    expect((await disclosure.boundingBox())!.height).toBeGreaterThanOrEqual(info.project.name === 'mobile' ? 44 : 32);
    await expect(list.locator('button a, a button')).toHaveCount(0);
    await expect(page.getByRole('region', { name: 'Valores indisponíveis e zero' }).locator('dd')).toHaveText(['0', 'Não informado']);
    await table.screenshot({ path: evidence + `${info.project.name}-${theme}-definitions.png` });
    await list.screenshot({ path: evidence + `${info.project.name}-${theme}-options.png` });
    await page.screenshot({ path: evidence + `${info.project.name}-${theme}.png`, fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('disclosure keyboard, controlled options, disabled and empty re-entry', async ({ page }) => {
  await page.goto('/?view=records&theme=dark');
  const list = page.getByRole('region', { name: 'Espaços conectados' });
  const toggle = list.getByRole('button', { name: 'Opções do Estúdio de Carreira' });
  const documents = list.getByRole('switch', { name: 'Compartilhar documentos', exact: true });
  await expect(documents).toHaveAccessibleDescription('Disponibilize os documentos preparados para as pessoas do espaço.');
  await toggle.focus();
  await toggle.press('Enter');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(list.getByRole('switch')).toHaveCount(0);
  await expect(list.locator('.es-option-details')).toBeHidden();
  await toggle.press('Space');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await toggle.press('Tab');
  await expect(documents).toBeFocused();
  await expect(documents.locator('+ .es-switch-track')).toHaveCSS('outline-style', 'solid');
  await documents.press('Space');
  await expect(documents).not.toBeChecked();
  await expect(list.getByRole('status')).toHaveText('Compartilhamento desativado somente neste exemplo.');
  await toggle.click();
  await toggle.click();
  await expect(documents).not.toBeChecked();
  await page.getByRole('switch', { name: 'Desabilitar as opções' }).click();
  await expect(documents).toBeDisabled();
  await expect(list.getByRole('switch', { name: 'Receber atualizações' })).toBeDisabled();
  await expect(toggle).toBeEnabled();
  await page.getByRole('switch', { name: 'Mostrar estado vazio' }).click();
  await expect(list.getByRole('list')).toHaveCount(0);
  await expect(list).toContainText('Nenhum espaço conectado neste exemplo.');
  const table = page.getByRole('region', { name: 'Sincronização de dados' });
  await expect(table.locator('dl')).toHaveCount(0);
  await expect(table).toContainText('Nenhum dado sincronizado neste exemplo.');
  await page.getByRole('button', { name: 'Restaurar exemplos' }).click();
  await expect(documents).toBeEnabled();
  await expect(documents).toBeChecked();
  await list.getByRole('link', { name: 'Documentos no catálogo' }).click();
  await expect(page).toHaveURL(/view=components/);
  await expect(page.getByRole('heading', { name: 'Componentes', exact: true })).toBeVisible();
});

test('long copy, narrow containers, RTL, zoom and forced colors', async ({ page }, info) => {
  for (const theme of ['dark', 'light']) {
    await page.goto('/?view=records&theme=' + theme);
    await page.getByRole('switch', { name: 'Testar texto longo' }).click();
    const list = page.getByRole('region', { name: 'Espaços conectados' });
    const table = page.getByRole('region', { name: 'Sincronização de dados' });
    for (const width of [320, 390, 938, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      for (const section of [list, table]) {
        expect(await section.evaluate(element => [...element.querySelectorAll('dt,dd,fieldset,legend,.es-option-identity,.es-toggle-copy,.es-option-meta')].every(child => child.scrollWidth <= child.clientWidth + 1))).toBe(true);
      }
      if (width === 320) await list.screenshot({ path: evidence + `${info.project.name}-${theme}-long-320.png` });
    }
    await page.evaluate(() => { document.documentElement.dir = 'rtl'; document.documentElement.style.zoom = '2'; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await list.screenshot({ path: evidence + `${info.project.name}-${theme}-zoom-rtl.png` });
    await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
    const toggle = list.getByRole('button');
    await toggle.focus();
    await toggle.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveCSS('outline-style', 'solid');
    await expect(list.locator('.es-option-details')).toHaveCSS('outline-style', 'solid');
    await toggle.press('Space');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await page.emulateMedia({ forcedColors: 'none', reducedMotion: 'no-preference' });
  }
});
