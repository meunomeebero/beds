import { expect, test } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const evidence = fileURLToPath(new URL('./evidence/', import.meta.url));

test('tooltip preserves trigger semantics and clamps its portal surface', async ({ page }, info) => {
  for (const theme of ['dark', 'light']) {
    await page.goto('/?view=components&theme=' + theme);
    const trigger = page.getByRole('button', { name: 'Ação com tooltip', exact: true });
    await expect(trigger).not.toHaveAttribute('aria-describedby', /.+/);

    if (info.project.name === 'mobile') await trigger.tap();
    else await trigger.hover();

    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toContainText('Adicionar um exemplo local');
    await expect(trigger).toHaveAttribute('aria-describedby', await tooltip.getAttribute('id') ?? '');
    await expect(tooltip).toHaveCSS('border-radius', '8px');
    await page.waitForTimeout(320);
    const bounds = await tooltip.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(8);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width - 8);
    expect(bounds!.y).toBeGreaterThanOrEqual(8);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height - 8);
    await page.screenshot({ path: evidence + `tooltip-${info.project.name}-${theme}.png` });

    await page.keyboard.press('Escape');
    await expect(tooltip).toHaveCount(0);
    await expect(trigger).not.toHaveAttribute('aria-describedby', /.+/);

    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await trigger.focus();
    await expect(tooltip).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(tooltip).toHaveCount(0);
    await expect(trigger).toBeFocused();

    if (info.project.name === 'mobile') {
      await trigger.tap();
      await expect(tooltip).toBeVisible();
      await trigger.tap();
      await expect(tooltip).toHaveCount(0);
    } else {
      await page.mouse.move(0, 0);
      await trigger.hover();
      await expect(tooltip).toBeVisible();
      await page.getByRole('heading', { name: 'Componentes', exact: true }).click();
      await expect(tooltip).toHaveCount(0);
    }
  }
});

test('tooltip reduces to an opacity-only entrance', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?view=components&theme=dark');
  const trigger = page.getByRole('button', { name: 'Ação com tooltip', exact: true });
  await trigger.focus();
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveCSS('transform', 'none');
  await expect(tooltip).toHaveCSS('filter', 'none');
});
