import { expect, test, type Page } from '@playwright/test';

const route = '/?view=disclosures';

async function openDisclosure(page: Page, theme: 'light' | 'dark') {
  await page.goto(`${route}&theme=${theme}`);
  await expect(page.locator('.es-disclosure-text').first()).toBeVisible();
}

test.describe('Disclosure · beUI bouncy-accordion adaptation', () => {
  for (const theme of ['light', 'dark'] as const) {
    test(`${theme} preserves measured text disclosure, keyboard toggle and re-entry`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await openDisclosure(page, theme);
      const long = page.locator('.es-disclosure-text').first();
      const content = page.locator('.es-disclosure-content').first();
      const more = page.getByRole('button', { name: 'Ler mais', exact: true }).first();
      const clampedHeight = (await long.boundingBox())!.height;

      expect(clampedHeight).toBeLessThanOrEqual(40);
      await expect(more).toHaveAttribute('aria-expanded', 'false');
      await more.focus();
      await more.press('Enter');
      const less = page.getByRole('button', { name: 'Ler menos', exact: true }).first();
      await expect(less).toBeFocused();
      await expect(less).toHaveAttribute('aria-expanded', 'true');
      await expect(long).not.toHaveClass(/es-disclosure-text--clamped/);
      const textId = await long.getAttribute('id');
      expect(textId).toBeTruthy();
      await expect(less).toHaveAttribute('aria-controls', textId!);
      await expect.poll(async () => (await long.boundingBox())?.height ?? 0).toBeGreaterThan(clampedHeight + 20);
      await expect.poll(async () => (await content.boundingBox())?.height ?? 0).toBeGreaterThan(clampedHeight + 20);

      await less.press('Space');
      await expect(more).toBeFocused();
      await expect(more).toHaveAttribute('aria-expanded', 'false');
      await expect(long).toHaveClass(/es-disclosure-text--clamped/);
      expect((await long.boundingBox())!.height).toBeLessThanOrEqual(40);
      await expect(page.locator('.es-disclosure-text').nth(1)).toHaveText('Texto curto.');
      await expect(page.locator('.es-disclosure-text').nth(1).locator('..').getByRole('button')).toHaveCount(0);
    });

    test(`${theme} keeps passive labels and records truthful through collapse and expansion`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await openDisclosure(page, theme);

      const labels = page.locator('.es-label-field').first();
      const labelsMore = labels.getByRole('button', { name: /Ver todas/ });
      await expect(labels.locator('.es-label-field-item button, .es-label-field-item a')).toHaveCount(0);
      await expect(labelsMore).toHaveAttribute('aria-expanded', 'false');
      const before = await labels.locator('.es-label-field-item:visible').count();
      await labelsMore.press('Enter');
      await expect(labels.getByRole('button', { name: 'Mostrar menos' })).toBeFocused();
      await expect(labels.locator('.es-label-field-rest')).toHaveAttribute('data-expanded', 'true');
      const after = await labels.locator('.es-label-field-item:visible').count();
      expect(after).toBe(10);
      expect(after).toBeGreaterThan(before);
      await labels.getByRole('button', { name: 'Mostrar menos' }).press('Space');
      await expect(labels.getByRole('button', { name: /Ver todas/ })).toBeVisible();
      await expect(labels.locator('.es-label-field-rest')).toHaveAttribute('data-expanded', 'false');

      const recordsMore = page.getByRole('button', { name: 'Ver registros anteriores (4)', exact: true });
      await expect(recordsMore).toHaveAttribute('aria-expanded', 'false');
      await expect(page.getByText('Registro 4', { exact: true })).toHaveCount(0);
      await recordsMore.press('Enter');
      await expect(page.getByText('Registro 7', { exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Mostrar menos', exact: true }).last()).toBeVisible();
      await page.getByRole('button', { name: 'Mostrar menos', exact: true }).last().press('Space');
      await expect(page.getByText('Registro 4', { exact: true })).toHaveCount(0);
    });
  }

  test('reduced motion keeps disclosure content usable without spring transforms', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openDisclosure(page, 'light');
    const more = page.getByRole('button', { name: 'Ler mais', exact: true }).first();
    await more.press('Enter');
    await expect(page.getByRole('button', { name: 'Ler menos', exact: true }).first()).toBeVisible();
    await expect(page.locator('.es-disclosure-content').first()).toHaveCSS('transform', 'none');
  });
});
