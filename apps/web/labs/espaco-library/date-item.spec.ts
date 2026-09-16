import { expect, test, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const evidence = fileURLToPath(new URL('./evidence/date-item/', import.meta.url));
const title = 'Conversa com a equipe de produto';
const list = (page: Page) => page.getByRole('list', { name: 'Exemplos de compromissos' });

async function measureContrast(page: Page) {
  return page.locator('.es-date-item-title,.es-date-item-month,.es-date-item-day,.es-date-item-description,.es-date-item-status .es-badge').evaluateAll(elements => elements.map(element => {
    const rgba = (value: string) => value.match(/[\d.]+/g)!.map(Number);
    const layers: number[][] = [];
    let node: Element | null = element;
    while (node) { layers.unshift(rgba(getComputedStyle(node).backgroundColor)); node = node.parentElement; }
    const bg = layers.reduce((base, color) => base.map((c, i) => c * (1 - (color[3] ?? 1)) + color[i] * (color[3] ?? 1)), [255, 255, 255]);
    const lum = (rgb: number[]) => rgb.slice(0, 3).map(c => c / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
    const fg = rgba(getComputedStyle(element).color);
    return { text: element.textContent, ratio: (Math.max(lum(fg), lum(bg)) + .05) / (Math.min(lum(fg), lum(bg)) + .05) };
  }));
}

test('catalog entry, calendar anatomy, keyboard detail and native destinations in both themes', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const theme of ['light', 'dark']) {
    await page.goto('/?view=chat&theme=' + theme);
    if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Navigation', exact: true }).click();
    await page.getByRole('link', { name: 'Itens com data', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Compromissos', exact: true })).toBeVisible();
    await expect(list(page).getByRole('listitem')).toHaveCount(4);
    const button = list(page).getByRole('button', { name: title, exact: true });
    await expect(button).toHaveAccessibleDescription('22 de outubro de 2026 Em breve');
    await expect(button.locator('time')).toHaveAttribute('datetime', '2026-10-22');
    await expect(button.locator('.es-date-item-month')).toHaveText('out');
    await expect(button.locator('.es-date-item-day')).toHaveText('22');
    await expect(list(page).getByRole('listitem').nth(2).locator('.es-date-item')).toHaveJSProperty('tagName', 'DIV');
    await expect(list(page).getByRole('listitem').nth(3).locator('.es-date-item-day')).toHaveText('9');
    for (const pair of await measureContrast(page)) expect(pair.ratio, JSON.stringify(pair)).toBeGreaterThanOrEqual(4.5);
    await button.focus();
    await expect(button).toHaveCSS('outline-style', 'solid');
    await expect(button).toHaveCSS('outline-width', '2px');
    await button.press('Enter');
    const drawer = page.getByRole('dialog', { name: title });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText('22 de outubro de 2026', { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(button).toBeFocused();
    await button.press('Space');
    await expect(drawer).toBeVisible();
    await page.keyboard.press('Escape');
    await button.blur();
    await page.mouse.move(0, 0);
    await page.screenshot({ path: evidence + `${info.project.name}-${theme}.png`, fullPage: true });
    await button.hover();
    for (const pair of await measureContrast(page)) expect(pair.ratio, JSON.stringify(pair)).toBeGreaterThanOrEqual(4.5);
    await page.mouse.down();
    for (const pair of await measureContrast(page)) expect(pair.ratio, JSON.stringify(pair)).toBeGreaterThanOrEqual(4.5);
    await page.mouse.move(0, 0); await page.mouse.up();
  }
  const link = list(page).getByRole('link', { name: 'Revisão de portfólio', exact: true });
  await expect(link).toHaveAttribute('href', /item=portfolio/);
  if (info.project.name === 'desktop') {
    const [other] = await Promise.all([page.context().waitForEvent('page'), link.click({ button: 'middle' })]);
    await expect(other.getByRole('dialog', { name: 'Revisão de portfólio' })).toBeVisible();
    await other.close();
  } else {
    await link.click();
    await expect(page.getByRole('dialog', { name: 'Revisão de portfólio' })).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('long labels, 320px reflow, RTL, zoom stress and system preferences', async ({ page }, info) => {
  for (const theme of ['light', 'dark']) {
    await page.goto(`/?view=date-item&theme=${theme}&preview=long`);
    for (const width of [1440, 800, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const first = list(page).getByRole('button');
      expect((await first.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      expect(await first.evaluate(item => [...item.querySelectorAll('.es-date-item-title,.es-date-item-status,.es-date-item-calendar')].every(part => {
        const rect = part.getBoundingClientRect(), box = item.getBoundingClientRect();
        return rect.left >= box.left && rect.right <= box.right && part.scrollWidth <= part.clientWidth + 1;
      }))).toBe(true);
    }
    await page.screenshot({ path: evidence + `${info.project.name}-${theme}-320-long.png`, fullPage: true });
    await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
    const date = await page.locator('.es-date-item-calendar').first().boundingBox();
    const content = await page.locator('.es-date-item-content').first().boundingBox();
    expect(date!.x).toBeGreaterThan(content!.x);
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.evaluate(() => { document.documentElement.dir = 'ltr'; document.documentElement.style.zoom = '2'; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await list(page).getByRole('button').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
    await list(page).getByRole('button').focus();
    await expect(list(page).getByRole('button')).toHaveCSS('outline-style', 'solid');
    await page.emulateMedia({ forcedColors: 'none', reducedMotion: 'no-preference' });
  }
});
