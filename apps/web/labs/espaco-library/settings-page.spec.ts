import { test, expect, type Page } from '@playwright/test';

async function noPageOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

async function contrast(page: Page) {
  const pairs = await page.locator('.es-tab-panel:not([hidden]) h2,.es-tab-panel:not([hidden]) h3,.es-tab-panel:not([hidden]) p,.es-tab-panel:not([hidden]) .es-text,.es-settings-tab-label,.es-tab-panel:not([hidden]) label,.es-tab-panel:not([hidden]) .es-button').evaluateAll(elements => elements.map(el => {
    const rgb = (value: string) => value.match(/[\d.]+/g)!.map(Number);
    const layers: number[][] = [];
    for (let node: Element | null = el; node; node = node.parentElement) layers.unshift(rgb(getComputedStyle(node).backgroundColor));
    const bg = layers.reduce((base, color) => base.map((c, i) => c * (1 - (color[3] ?? 1)) + color[i] * (color[3] ?? 1)), [255, 255, 255]);
    const lum = (color: number[]) => color.slice(0, 3).map(c => c / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
    const fg = lum(rgb(getComputedStyle(el).color));
    return { text: el.textContent, ratio: (Math.max(fg, lum(bg)) + .05) / (Math.min(fg, lum(bg)) + .05) };
  }));
  for (const pair of pairs) expect(pair.ratio, JSON.stringify(pair)).toBeGreaterThanOrEqual(4.5);
}

test('settings tabs preserve draft, keyboard order, validation, save and local preferences', async ({ page }) => {
  await page.goto('/?view=settings&theme=light');
  const account = page.getByRole('tab', { name: 'Conta', exact: true });
  const preferences = page.getByRole('tab', { name: 'Preferências', exact: true });
  const field = page.getByRole('textbox', { name: 'Nome de usuário', exact: true });
  await field.fill('rascunho');
  await account.focus();
  await account.press('ArrowRight');
  await expect(preferences).toBeFocused();
  await expect(preferences).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('tabpanel', { name: 'Preferências' })).toBeFocused();
  await page.getByRole('button', { name: 'Escuro', exact: true }).click();
  await expect(page.locator('.es-root')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('switch', { name: 'Efeitos sonoros', exact: true }).uncheck();
  await page.getByRole('button', { name: /Idioma da interface/ }).click();
  await page.getByRole('option', { name: 'English (US)' }).click();
  await preferences.focus();
  await preferences.press('End');
  await expect(page.getByRole('tab', { name: 'Privacidade' })).toBeFocused();
  await page.keyboard.press('Home');
  await expect(account).toBeFocused();
  await expect(field).toHaveValue('rascunho');
  await field.fill('!');
  await field.press('Enter');
  await expect(field).toBeFocused();
  await expect(field).toHaveAttribute('aria-invalid', 'true');
  await expect(field).toHaveAccessibleDescription(/Use de 3 a 24/);
  await field.fill(' LUISA_COSTA ');
  await field.press('Enter');
  await expect(field).toHaveValue('luisa_costa');
  await expect(page.getByRole('status')).toHaveText('Nome de usuário salvo apenas nesta prévia.');
  await field.fill('outro_nome');
  await page.getByRole('button', { name: 'Descartar edição' }).click();
  await expect(field).toHaveValue('luisa_costa');
  await preferences.click();
  await expect(page.getByRole('switch', { name: 'Efeitos sonoros', exact: true })).not.toBeChecked();
  await expect(page.getByRole('button', { name: /Idioma da interface/ })).toHaveText(/English \(US\)/);
  await page.getByRole('tab', { name: 'Notificações', exact: true }).click();
  await expect(page.getByRole('switch')).toHaveCount(9);
  await page.getByRole('switch', { name: 'Currículo pronto', exact: true }).uncheck();
  await account.click();
  await page.getByRole('tab', { name: 'Notificações', exact: true }).click();
  await expect(page.getByRole('switch', { name: 'Currículo pronto', exact: true })).not.toBeChecked();
});

test('settings anatomy stays clean, legible and contained in both themes and narrow widths', async ({ page }, info) => {
  for (const theme of ['light', 'dark']) for (const width of info.project.name === 'desktop' ? [1440, 768] : [390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`/?view=settings&theme=${theme}`);
    await page.evaluate(() => document.fonts.ready);
    await page.mouse.move(0, 0);
    await noPageOverflow(page);
    await contrast(page);
    const tab = page.getByRole('tab', { name: 'Conta', exact: true });
    expect((await tab.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    expect(await tab.evaluate(el => getComputedStyle(el, '::after').height)).toBe('2px');
    expect(await page.getByRole('tabpanel', { name: 'Conta' }).getByRole('region', { name: 'Sua conta' }).evaluate(el => getComputedStyle(el).borderWidth)).toBe('0px');
    if (width < 768) {
      expect(await page.getByRole('textbox').evaluate(el => getComputedStyle(el).fontSize)).toBe('16px');
      expect((await page.getByRole('button', { name: 'Salvar nome' }).boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    await page.screenshot({ path: `apps/web/labs/espaco-library/evidence/settings/${info.project.name}-${theme}-${width}.png`, fullPage: true });
    for (const label of ['Preferências', 'Notificações', 'Privacidade']) {
      await page.getByRole('tab', { name: label, exact: true }).click();
      await noPageOverflow(page);
      await contrast(page);
      if (width === 1440 && theme === 'dark' || width === 320 && theme === 'light') {
        await page.screenshot({ path: `apps/web/labs/espaco-library/evidence/settings/${info.project.name}-${theme}-${width}-${label}.png`, fullPage: true });
      }
    }
    await page.goto(`/?view=settings&theme=${theme}&preview=long`);
    await noPageOverflow(page);
    expect(await page.locator('.es-settings-control').evaluateAll(els => els.every(el => el.scrollWidth <= el.clientWidth + 1))).toBe(true);
    await page.getByRole('tab', { name: 'Conta', exact: true }).focus();
    await page.keyboard.press('End');
    await expect(page.getByRole('tab', { name: 'Privacidade' })).toBeInViewport();
  }
});

test('confirmation is reversible, synthetic, focused; loading and error have recovery', async ({ page }) => {
  const mutations: string[] = [];
  page.on('request', request => { if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method())) mutations.push(request.url()); });
  await page.goto('/?view=settings&theme=dark');
  await page.getByRole('tab', { name: 'Privacidade' }).click();
  const trigger = page.getByRole('button', { name: 'Excluir conta', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Excluir conta?' });
  await expect(dialog.getByRole('button', { name: 'Fechar', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Cancelar' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole('button', { name: 'Simular exclusão' }).click();
  await expect(page.getByRole('status')).toHaveText('Exclusão simulada. Sua conta permanece intacta.');
  await page.getByRole('button', { name: 'Limpar memória' }).click();
  await page.getByRole('button', { name: 'Simular limpeza' }).click();
  await expect(page.getByRole('status')).toHaveText('Limpeza simulada. Nenhuma memória foi apagada.');
  for (const state of ['error', 'loading']) {
    await page.goto(`/?view=settings&state=${state}`);
    await expect(page.getByRole('tablist')).toHaveCount(0);
    await page.getByRole('button', { name: state === 'error' ? 'Tentar novamente' : 'Concluir carregamento da prévia' }).click();
    await expect(page.getByRole('textbox', { name: 'Nome de usuário' })).toBeVisible();
  }
  expect(mutations).toEqual([]);
});

test('settings support high contrast, reduced motion, RTL and a 200 percent reflow proxy', async ({ page }, info) => {
  await page.setViewportSize({ width: 640, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?view=settings&theme=dark&preview=long');
  await page.evaluate(() => { document.documentElement.style.zoom = '2'; document.documentElement.dir = 'rtl'; });
  await noPageOverflow(page);
  const account = page.getByRole('tab', { name: 'Conta', exact: true });
  await account.focus();
  await account.press('ArrowLeft');
  await expect(page.getByRole('tab', { name: 'Preferências' })).toBeFocused();
  await page.keyboard.press('Home');
  await expect(account).toBeFocused();
  expect(await account.evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');
  expect(await account.evaluate(el => parseFloat(getComputedStyle(el).outlineWidth))).toBeGreaterThan(0);
  await page.screenshot({ path: `apps/web/labs/espaco-library/evidence/settings/${info.project.name}-zoom-rtl.png`, fullPage: true });
  await page.emulateMedia({ forcedColors: 'active' });
  expect(await account.evaluate(el => getComputedStyle(el, '::after').backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
  await page.keyboard.press('End');
  await expect(page.getByRole('tab', { name: 'Privacidade' })).toBeInViewport();
});
