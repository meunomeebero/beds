import { expect, test, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const evidence = fileURLToPath(new URL('./evidence/score-meter/', import.meta.url));
async function select(page: Page, label: string, option: string) {
  await page.getByRole('button', { name: new RegExp('^' + label + ':') }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
}

test('ATS, FIT and compatibility share the vertical segmented anatomy without changing scores', async ({ page }, info) => {
  for (const theme of ['light', 'dark']) {
    await page.goto('/?view=application-card&theme=' + theme);
    await page.evaluate(() => document.fonts.ready);
    const card = page.getByRole('article').first();
    const meter = card.getByRole('meter');
    await expect(meter).toHaveAccessibleName('ATS do currículo');
    await expect(meter).toHaveAttribute('aria-valuenow', '92');
    await expect(meter).toHaveAttribute('aria-valuetext', '92 de 100 pontos');
    await expect(card.locator('.recipe-application-delta')).toHaveText('+24 pts');
    await expect(meter.locator(':scope > span')).toHaveCount(28);
    await expect(meter.locator('[data-filled]')).toHaveCount(25);
    await expect(meter).toHaveCSS('height', '16px');
    await expect(meter).toHaveCSS('column-gap', '2px');
    await expect(meter.locator('span').first()).toHaveCSS('border-radius', '2px');
    const generic = page.getByRole('meter', { name: 'Medidor compartilhado' });
    expect(await meter.evaluate(el => getComputedStyle(el.firstElementChild!).backgroundColor)).toBe(await generic.evaluate(el => getComputedStyle(el.firstElementChild!).backgroundColor));
    await card.screenshot({ path: evidence + `${info.project.name}-${theme}-ats.png` });
    await select(page, 'Tipo da nota', 'Compatibilidade');
    await expect(meter).toHaveAccessibleName('Compatibilidade');
    await expect(meter).toHaveAttribute('aria-valuenow', '92');
    await expect(card.locator('.recipe-application-delta')).toHaveCount(0);
    await card.screenshot({ path: evidence + `${info.project.name}-${theme}-match.png` });
    await select(page, 'Tipo da nota', 'FIT');
    await expect(meter).toHaveAccessibleName('FIT do perfil');
    await expect(meter.locator('[data-filled]')).toHaveCount(25);
    await expect(page.getByRole('article').nth(2).getByRole('meter')).toHaveCount(0);
    await expect(page.getByRole('article').nth(3).getByRole('meter')).toHaveCount(0);
  }
});

test('boundaries preserve zero, maximum and unknown without upward rounding in scores', async ({ page }) => {
  await page.goto('/?view=application-card&theme=dark');
  const meter = page.getByRole('article').first().getByRole('meter');
  const generic = page.getByRole('meter', { name: 'Medidor compartilhado' });
  for (const value of [0, 1, 29, 99, 100]) {
    await select(page, 'Nota do exemplo', String(value));
    await expect(meter).toHaveAttribute('aria-valuenow', String(value));
    await expect(meter).toHaveAttribute('aria-valuetext', `${value} de 100 pontos`);
    await expect(meter.locator('[data-filled]')).toHaveCount(Math.floor(value / 100 * 28));
    await expect(generic.locator('[data-filled]')).toHaveCount(Math.round(value / 100 * 28));
  }
  for (const value of ['-1', '101', 'Inválida']) {
    await select(page, 'Nota do exemplo', value);
    await expect(meter).toHaveCount(0);
  }
  await expect(page.locator('.es-segmented-meter [role=img]')).toHaveAccessibleName('Medidor compartilhado: unavailable');
  await expect(page.locator('.es-segmented-meter [data-filled]')).toHaveCount(0);
  await select(page, 'Nota do exemplo', '92');
  await expect(meter).toHaveAttribute('aria-valuenow', '92');
});

test('card and meter reflow, retain focusable explanation, and survive forced colors', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const theme of ['dark', 'light']) {
    await page.goto('/?view=application-card&theme=' + theme);
    const card = page.getByRole('article').first();
    const meter = card.getByRole('meter');
    for (const width of [320, 390, 938, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const bounds = (await meter.boundingBox())!;
      const last = (await meter.locator('span').last().boundingBox())!;
      expect(last.x + last.width).toBeLessThanOrEqual(bounds.x + bounds.width + 1);
      expect(await meter.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      if (width === 320) await card.screenshot({ path: evidence + `${info.project.name}-${theme}-320.png` });
    }
    const help = card.getByRole('button', { name: 'ATS do currículo', exact: true });
    await help.focus();
    await help.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(help).toBeFocused();
    await expect(help).toHaveCSS('outline-style', 'solid');
    await expect(page.getByRole('tooltip')).toContainText('Não é uma probabilidade de contratação');
    await page.keyboard.press('Escape');
    await page.evaluate(() => { document.documentElement.dir = 'rtl'; document.documentElement.style.zoom = '2'; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await card.screenshot({ path: evidence + `${info.project.name}-${theme}-zoom-rtl.png` });
    await page.emulateMedia({ forcedColors: 'active' });
    await expect(meter.locator('span').last()).toHaveCSS('border-top-style', 'solid');
    const fills = await meter.evaluate(el => [getComputedStyle(el.firstElementChild!).backgroundColor, getComputedStyle(el.lastElementChild!).backgroundColor]);
    expect(fills[0]).not.toBe(fills[1]);
    await card.screenshot({ path: evidence + `${info.project.name}-${theme}-forced-colors.png` });
    await page.emulateMedia({ forcedColors: 'none' });
  }
});
