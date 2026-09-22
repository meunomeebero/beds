import { expect, test } from '@playwright/test';

const fill = (page: import('@playwright/test').Page, index = 0) => page.locator('.es-expanding-button-accent').nth(index).evaluate(node => node.getBoundingClientRect().width);
const pill = (page: import('@playwright/test').Page, index = 0) => page.locator('.es-expanding-button').nth(index).evaluate(node => node.getBoundingClientRect().width);

for (const [width, theme] of [[1440, 'light'], [320, 'dark']] as const) {
  test(`expanding button catalog fits ${width}px ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`/?view=expanding-button&theme=${theme}`);
    await expect(page.locator('.es-expanding-button')).toHaveCount(7);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });
}

test('one accessible name per button and a decorative fill', async ({ page }) => {
  await page.goto('/?view=expanding-button&theme=light');
  await expect(page.getByRole('button', { name: 'Entrar com X' })).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Começar agora' })).toBeVisible();
  await expect(page.locator('.es-expanding-button-accent').first()).toHaveAttribute('aria-hidden', 'true');
  await expect(page.getByRole('button', { name: 'Indisponível' })).toBeDisabled();
  await page.getByRole('button', { name: 'Entrar com X' }).first().click();
  await expect(page.getByRole('status').filter({ hasText: 'Cliques' })).toHaveText('Cliques: 1');
});

test('the fill grows on hover and keyboard focus', async ({ page, isMobile }) => {
  test.skip(isMobile, 'hover applies only to fine pointers');
  await page.goto('/?view=expanding-button&theme=light');
  const resting = await fill(page);
  expect(resting).toBeLessThan(40);
  await page.locator('.es-expanding-button').first().hover();
  await expect.poll(() => fill(page), { timeout: 3000 }).toBeGreaterThan((await pill(page)) - 10);
  await page.mouse.move(1, 1);
  await expect.poll(() => fill(page), { timeout: 3000 }).toBeLessThan(40);
  await page.locator('.es-expanding-button').first().focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect.poll(() => fill(page), { timeout: 3000 }).toBeGreaterThan((await pill(page)) - 10);
});

test('touch taps press without expanding', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'touch only');
  await page.goto('/?view=expanding-button&theme=light');
  await expect(page.locator('.es-expanding-button').first()).toHaveCSS('height', '44px');
  await page.locator('.es-expanding-button').first().tap();
  await expect(page.locator('.es-expanding-button').first()).not.toHaveAttribute('data-expanded');
});

test('reduced motion switches the fill instantly', async ({ page, isMobile }) => {
  test.skip(isMobile, 'hover applies only to fine pointers');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?view=expanding-button&theme=dark');
  await page.locator('.es-expanding-button').first().hover();
  await page.waitForTimeout(50);
  expect(await fill(page)).toBeGreaterThan((await pill(page)) - 10);
});
