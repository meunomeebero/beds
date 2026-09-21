import { test, expect } from '@playwright/test';

test('theme flips preserve navigation contrast and isolate sibling providers', async ({ page }) => {
  await page.goto('/theme-transition.html');
  for (const label of ['Alternar e medir', 'Alternar e medir', 'Alternar rapidamente e medir']) {
    await page.getByRole('button', { name: label, exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('Medição concluída');
    await expect(page.getByRole('alert')).toHaveCount(0);
    const result = JSON.parse(await page.locator('#resultado').innerText());
    expect(result.frames).toBe(24);
    expect(result.minContrast).toBeGreaterThanOrEqual(4.5);
    expect(result.initialSuppression).toBe(true);
    expect(result.finalSuppression).toBe(false);
    expect(result.finalDuration).toBe('0.15s, 0.15s');
    expect(result.peerSuppressed).toBe(false);
    expect(result.peerBackgrounds).toEqual(['rgb(255, 255, 255)']);
    for (const color of result.foregrounds) {
      expect(['rgb(106, 105, 102)', 'rgb(148, 148, 148)']).toContain(color);
    }
    if (label.includes('rapidamente')) expect(result.themes.sort()).toEqual(['dark', 'light']);
  }
});
