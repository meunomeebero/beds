import { expect, test } from '@playwright/test';

for (const [width, theme] of [[1440, 'light'], [320, 'dark']] as const) {
  test(`hand-drawn arrow catalog fits ${width}px ${theme} and loads the handwriting face`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`/?view=hand-drawn-arrow&theme=${theme}&preview=long`);
    await expect(page.locator('.es-hand-arrow')).toHaveCount(27);
    await expect.poll(() => page.evaluate(() => document.fonts.check("22px 'Espaco Caveat'"))).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    await expect(page.locator('.es-hand-arrow-label').first()).toHaveCSS('font-family', /Espaco Caveat/);
  });
}

test('notes stay readable, strokes stay decorative and never steal clicks', async ({ page }) => {
  await page.goto('/?view=hand-drawn-arrow&theme=light');
  const hero = page.locator('.es-hand-arrow').first();
  await expect(hero.getByText('não fica de fora!')).toBeVisible();
  await expect(hero).not.toHaveAttribute('aria-hidden');
  await expect(hero.locator('svg')).toHaveAttribute('aria-hidden', 'true');
  await expect(hero).toHaveCSS('pointer-events', 'none');
  await expect(page.locator('.es-hand-arrow:not(:has(.es-hand-arrow-label))')).toHaveAttribute('aria-hidden', 'true');
});

test('reduced motion shows every stroke finished without waiting for the viewport', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?view=hand-drawn-arrow&theme=dark');
  const last = page.locator('.es-hand-arrow-path').last();
  await expect(last).toHaveCSS('opacity', '1');
  await expect(last).toHaveCSS('stroke-dasharray', 'none');
});

test('draw-in finishes once the arrow enters the viewport', async ({ page }) => {
  await page.goto('/?view=hand-drawn-arrow&theme=light');
  const path = page.locator('.es-hand-arrow-path').first();
  await expect(path).toHaveCSS('opacity', '1', { timeout: 3000 });
});
