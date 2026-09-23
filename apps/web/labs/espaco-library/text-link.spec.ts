import { expect, test } from '@playwright/test';

const underline = (page: import('@playwright/test').Page, name: string) => page.locator('nav[aria-label="Exemplo de navegação"]').getByText(name, { exact: true }).evaluate(node => getComputedStyle(node).backgroundSize);

for (const [width, theme] of [[1440, 'light'], [320, 'dark']] as const) {
  test(`nav links fit ${width}px ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`/?view=disclosures&theme=${theme}`);
    await expect(page.locator('.es-text-link[data-purpose=nav]')).toHaveCount(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });
}

test('nav underline draws on hover and keyboard focus, never on a disabled button', async ({ page, isMobile }) => {
  test.skip(isMobile, 'hover applies only to fine pointers');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?view=disclosures&theme=light');
  expect(await underline(page, 'Como funciona')).toBe('0% 1.5px');
  await page.getByRole('link', { name: 'Como funciona' }).hover();
  await expect.poll(() => underline(page, 'Como funciona')).toBe('100% 1.5px');
  await page.mouse.move(0, 0);
  await expect.poll(() => underline(page, 'Como funciona')).toBe('0% 1.5px');
  await page.getByRole('link', { name: 'Como funciona' }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: /Blog/ })).toBeFocused();
  await expect.poll(() => underline(page, 'Blog')).toBe('100% 1.5px');
  await page.getByRole('button', { name: 'Indisponível' }).hover({ force: true });
  const disabled = page.locator('nav[aria-label="Exemplo de navegação"]').getByText('Indisponível', { exact: true });
  expect(await disabled.evaluate(node => getComputedStyle(node).backgroundImage)).toBe('none');
});

test('LinkButton is a real button with the link look', async ({ page }) => {
  await page.goto('/?view=disclosures&theme=dark');
  const help = page.getByRole('button', { name: 'Abrir ajuda' });
  await help.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status').filter({ hasText: 'Ajuda aberta' })).toHaveText('Ajuda aberta: 1');
  await expect(page.getByRole('button', { name: 'Indisponível' })).toBeDisabled();
});
