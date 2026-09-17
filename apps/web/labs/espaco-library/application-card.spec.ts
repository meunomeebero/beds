import { expect, test } from '@playwright/test';

test('status badges stay quiet, readable and contained; compact tags remain unchanged', async ({ page }, info) => {
  for (const theme of ['light', 'dark']) for (const width of [320, 938, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`/?view=application-card&theme=${theme}`);
    const labels = page.locator('.es-badge[data-purpose="status"]');
    await expect(labels).toHaveCount(9);
    for (const label of await labels.all()) {
      await expect(label).toHaveCSS('font-size', '12px');
      await expect(label).toHaveCSS('line-height', '18px');
      await expect(label).toHaveCSS('font-weight', '400');
      await expect(label).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(label).toHaveCSS('box-shadow', 'none');
      await expect(label).toHaveCSS('border-top-width', '0px');
      expect(await label.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      expect(await label.evaluate(el => getComputedStyle(el, '::before').width)).toBe('6px');
      expect(await label.evaluate(el => (el as HTMLElement).tabIndex)).toBe(-1);
    }
    await expect(page.getByText('Novo', { exact: true })).toHaveCSS('font-size', '12px');
    const ready = page.getByRole('article').first();
    const [status, selection] = await Promise.all([ready.locator('.es-badge').boundingBox(), ready.getByRole('checkbox').boundingBox()]);
    expect(status!.x + status!.width).toBeLessThanOrEqual(selection!.x);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 938) await page.screenshot({ path: `apps/web/labs/espaco-library/evidence/status-badge/${info.project.name}-${theme}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 640, height: 1000 });
  await page.evaluate(() => {
    document.documentElement.style.zoom = '2';
    document.querySelectorAll('.es-badge[data-purpose="status"] > span').forEach(el => { el.textContent = 'Pronta para enviar após a revisão dos documentos'; });
  });
  expect(await page.locator('.es-badge[data-purpose="status"]').evaluateAll(elements => elements.every(el => el.scrollWidth <= el.clientWidth + 1))).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `apps/web/labs/espaco-library/evidence/status-badge/${info.project.name}-long-zoom.png`, fullPage: true });
});

test('application card preserves semantics, long content, image recovery and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const theme of ['dark', 'light']) {
    await page.goto(`/?view=application-card&theme=${theme}`);
    const cards = page.getByRole('article');
    await expect(cards).toHaveCount(4);
    const ready = cards.first();
    await expect(ready.locator('img')).toHaveCount(0);
    await expect(ready.locator('.es-application-company-mark')).toHaveText('AD');
    await expect(cards.nth(1).getByRole('meter')).toHaveAttribute('aria-valuenow', '88');
    await expect(cards.nth(2).getByRole('meter')).toHaveCount(0);
    await expect(cards.nth(3).getByRole('meter')).toHaveCount(0);
    await ready.getByRole('checkbox').check();
    await expect(page.getByRole('status')).toContainText('1 candidatura selecionada');
    await ready.getByRole('button', { name: /Abrir anotação/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(ready.getByRole('button', { name: /Abrir anotação/ })).toBeFocused();
    await ready.getByRole('button', { name: 'Marcar como enviada' }).click();
    await expect(ready).toContainText('Enviada');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await cards.nth(1).evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    expect(await ready.locator('.es-application-sheet').evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');
  }
});
