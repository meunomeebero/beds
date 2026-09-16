import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  test(`paged carousel navigation ${theme}`, async ({ page }) => {
    await page.goto(`/?view=paged-carousel&theme=${theme}`);
    const carousel = page.getByRole('region', { name: 'Etapas de introdução' });
    const previous = page.getByRole('button', { name: 'Etapa anterior' });
    const next = page.getByRole('button', { name: 'Próxima etapa' });
    await expect(carousel).toBeVisible();
    await expect(previous).toBeDisabled();
    await expect(next).toBeEnabled();
    await next.click();
    await expect(page.getByRole('group', { name: 'Etapa 2 de 3' })).toHaveAttribute('aria-current', 'true');
    await carousel.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('group', { name: 'Etapa 3 de 3' })).toHaveAttribute('aria-current', 'true');
    await expect(next).toBeDisabled();
    await expect(previous).toBeEnabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `/tmp/beds-paged-carousel-${theme}-${test.info().project.name}.png` });
  });
}
