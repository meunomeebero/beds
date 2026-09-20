import { expect, test } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const evidence = fileURLToPath(new URL('./evidence/tooltip-beui/', import.meta.url));

async function settleTooltipScreenshot(page: import('@playwright/test').Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
}

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
    await settleTooltipScreenshot(page);
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

test('tooltip stays bounded at 320px and survives a fresh hydration pass', async ({ page }, info) => {
  await page.setViewportSize({ width: 320, height: 640 });
  page.on('pageerror', error => { throw error; });
  page.on('console', message => {
    if (message.type() === 'warning' && /hydration/i.test(message.text())) throw new Error(message.text());
  });
  await page.goto('/?view=components&theme=light');
  const trigger = page.getByRole('button', { name: 'Ação com tooltip', exact: true });
  if (info.project.name === 'mobile') await trigger.tap();
  else await trigger.hover();
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toBeVisible();
  const describedBy = await trigger.getAttribute('aria-describedby');
  expect(describedBy).toBeTruthy();
  expect(await page.locator('[role="tooltip"]').evaluateAll(nodes => new Set(nodes.map(node => node.id)).size)).toBe(1);
  const bounds = await tooltip.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(8);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(312);
  expect(bounds!.y).toBeGreaterThanOrEqual(8);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(632);

  await page.reload();
  const freshTrigger = page.getByRole('button', { name: 'Ação com tooltip', exact: true });
  if (info.project.name === 'mobile') await freshTrigger.tap();
  else await freshTrigger.hover();
  const freshTooltip = page.getByRole('tooltip');
  await expect(freshTooltip).toBeVisible();
  await expect(freshTrigger).toHaveAttribute('aria-describedby', await freshTooltip.getAttribute('id') ?? '');
});

test('tooltip switches to reduced motion and remains legible in forced colors', async ({ page }) => {
  await page.goto('/?view=components&theme=dark');
  const trigger = page.getByRole('button', { name: 'Ação com tooltip', exact: true });
  await trigger.focus();
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await expect(tooltip).toHaveCSS('transform', 'none');
  await expect(tooltip).toHaveCSS('filter', 'none');
  await expect(tooltip).toHaveCSS('opacity', '1');
  await expect.poll(() => tooltip.evaluate(element => element.getAnimations().length)).toBe(0);
  await expect(tooltip).toContainText('Adicionar um exemplo local');
});
