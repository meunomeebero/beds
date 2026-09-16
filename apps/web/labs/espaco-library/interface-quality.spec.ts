import { expect, test, type Locator } from '@playwright/test';

async function contrast(locator: Locator, property: 'color' | 'borderTopColor') {
  return locator.evaluate((element, property) => {
    const rgb = (value: string) => value.match(/[\d.]+/g)!.map(Number);
    const layers: number[][] = [];
    for (let node: Element | null = property === 'color' ? element : element.parentElement; node; node = node.parentElement) layers.unshift(rgb(getComputedStyle(node).backgroundColor));
    const bg = layers.reduce((base, color) => base.map((c, i) => c * (1 - (color[3] ?? 1)) + color[i] * (color[3] ?? 1)), [255, 255, 255]);
    const luminance = (color: number[]) => color.slice(0, 3).map(c => c / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
    const fg = rgb(getComputedStyle(element)[property]);
    const painted = bg.map((c, i) => c * (1 - (fg[3] ?? 1)) + fg[i] * (fg[3] ?? 1));
    return (Math.max(luminance(painted), luminance(bg)) + .05) / (Math.min(luminance(painted), luminance(bg)) + .05);
  }, property);
}

for (const theme of ['light', 'dark']) {
  test(`shared boundaries and validation remain legible in ${theme}`, async ({ page }, info) => {
    await page.goto(`/?view=components&theme=${theme}`);
    const measures: Record<string, number> = {};
    for (const selector of ['.es-text-input:not(:disabled)', '.es-text-area', '.es-search-field', '.es-checkbox-box', '.es-switch-track']) {
      const element = page.locator(selector).first();
      if (selector === '.es-checkbox-box') await page.getByRole('checkbox', { name: /^Incluir detalhes/ }).uncheck();
      measures[selector] = await contrast(element, 'borderTopColor');
      expect(measures[selector], selector).toBeGreaterThanOrEqual(3);
    }
    const toggle = page.getByRole('switch', { name: 'Notificações do exemplo' });
    await toggle.check();
    expect(await contrast(page.locator('.es-switch-track').first(), 'borderTopColor')).toBeGreaterThanOrEqual(3);
    await page.goto(`/?view=decisions&theme=${theme}`);
    measures.radio = await contrast(page.locator('.es-radio-indicator').last(), 'borderTopColor');
    expect(measures.radio).toBeGreaterThanOrEqual(3);
    await page.goto(`/?view=settings&theme=${theme}`);
    const field = page.getByRole('textbox', { name: 'Nome de usuário' });
    await field.fill('!');
    await field.press('Enter');
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    measures.errorText = await contrast(page.locator('.es-field-error'), 'color');
    expect(measures.errorText).toBeGreaterThanOrEqual(4.5);
    await page.screenshot({ path: `apps/web/labs/espaco-library/evidence/settings/quality-${theme}-${info.project.name}.png`, fullPage: true });
    await info.attach('rendered-contrast', { body: JSON.stringify(measures, null, 2), contentType: 'application/json' });
  });

  test(`skip navigation and crowded collapsed rail work in ${theme}`, async ({ page }, info) => {
    await page.goto(`/?view=components&theme=${theme}`);
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Ir para o conteúdo' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await skip.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();
    if (info.project.name === 'desktop') {
      await page.setViewportSize({ width: 1024, height: 600 });
      await page.getByRole('button', { name: 'Collapse sidebar', exact: true }).click();
      const expand = page.getByRole('button', { name: 'Expand sidebar', exact: true });
      await expand.click();
      await expect(page.locator('.es-sidebar')).toHaveCSS('width', '264px');
    }
  });
}

test('toast persistence, recovery focus, readable copy and bounded queue', async ({ page }) => {
  await page.clock.install();
  await page.goto('/?view=toast&theme=dark');
  const action = page.getByRole('button', { name: 'Com ação' });
  await action.click();
  await page.mouse.move(0, 0);
  await page.clock.fastForward(12000);
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByRole('button', { name: /^Fechar notificação:/ }).click();
  await expect(action).toBeFocused();
  await page.getByRole('button', { name: 'Informação', exact: true }).click();
  await page.mouse.move(0, 0);
  await page.clock.fastForward(4000);
  await expect(page.getByText('Seu currículo foi salvo.', { exact: true })).toBeVisible();
  await page.clock.fastForward(1100);
  await expect(page.getByText('Seu currículo foi salvo.', { exact: true })).toHaveCount(0);
  await page.setViewportSize({ width: page.viewportSize()!.width, height: 600 });
  await page.getByRole('button', { name: 'Várias notificações' }).click();
  await page.mouse.move(0, 0);
  await page.clock.fastForward(12000);
  await expect(page.getByRole('alert')).toHaveCount(7);
  expect(await page.locator('.es-toast-region').evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
  const last = page.getByRole('alert').last();
  await last.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('alert')).toHaveCount(6);
  await expect(page.getByText('Nova tentativa iniciada.')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
