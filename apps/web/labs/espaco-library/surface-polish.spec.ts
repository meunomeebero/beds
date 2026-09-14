import { expect, test } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const evidence = fileURLToPath(new URL('./evidence/', import.meta.url));

test('transparent panel/card defaults are fixed in both themes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const theme of ['dark', 'light']) {
    await page.goto('/data-patterns.html?theme=' + theme);
    const panel = page.locator('.es-surface:has(> .es-activity-panel)').first();
    const card = page.locator('.es-surface:has(> .es-collection-card)').first();
    await expect(panel).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(panel).toHaveCSS('border-radius', '20px');
    await expect(panel).toHaveCSS('padding', '16px');
    await expect(card).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(card).toHaveCSS('border-radius', '24px');
    await expect(card).toHaveCSS('padding', '20px');
    const still = page.getByRole('region', { name: 'Carrossel sem excedente', exact: true });
    await expect(still).toHaveAttribute('tabindex', '-1');
    await expect(still.locator('..').getByRole('button')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('filter selector preserves keyboard selection, disabled options and focus', async ({ page }, info) => {
  for (const theme of ['dark', 'light']) {
    await page.goto('/data-patterns.html?theme=' + theme);
    const trigger = page.getByRole('button', { name: 'Período da atividade: Últimos 30 dias', exact: true });
    await expect(trigger).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(trigger).toHaveCSS('border-radius', '8px');
    await expect(trigger.locator('svg')).toHaveCount(2);
    await expect(page.getByRole('button', { name: 'Filtro indisponível: Últimos 30 dias' })).toBeDisabled();
    await trigger.press('ArrowDown');
    const list = page.getByRole('listbox', { name: 'Período da atividade' });
    await expect(list).toBeVisible();
    await list.press('ArrowUp');
    const active = await list.getAttribute('aria-activedescendant');
    await expect(page.locator('[id="' + active + '"]')).toHaveText('Últimos 7 dias');
    await list.press('Enter');
    const selected = page.getByRole('button', { name: 'Período da atividade: Últimos 7 dias' });
    await expect(selected).toBeFocused();
    await selected.click();
    await expect(list.getByRole('option', { name: 'Últimos 14 dias' })).toBeDisabled();
    await list.getByRole('option', { name: 'Últimos 14 dias' }).click({ force: true });
    await expect(list).toBeVisible();
    await list.press('End');
    await list.press('Enter');
    const last = page.getByRole('button', { name: 'Período da atividade: Últimos 90 dias' });
    await expect(last).toBeFocused();
    await last.click();
    const box = await list.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(16);
    expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width - 15);
    await page.screenshot({ path: evidence + 'filter-select-' + info.project.name + '-' + theme + '.png' });
    await list.press('Escape');
    await expect(list).toHaveCount(0);
    await expect(last).toBeFocused();
    await last.click();
    await page.getByRole('heading', { name: 'Padrões de dados', exact: true }).click();
    await expect(list).toHaveCount(0);
  }
});

test('content shells remain transparent and selection survives soft hover', async ({ page }, info) => {
  for (const theme of ['dark', 'light']) {
    await page.goto('/?view=components&theme=' + theme);
    for (const selector of ['.es-settings-group', '.es-integration-row', '.es-plan-card', '.es-tabs[data-variant="connection"]']) {
      await expect(page.locator(selector).first()).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    }
    await expect(page.locator('.es-settings-group').first()).toHaveCSS('border-radius', '20px');
    await expect(page.locator('.es-plan-card').first()).toHaveCSS('border-radius', '20px');
    if (info.project.name === 'desktop') {
      const nav = page.locator('.es-nav-item--active').first();
      const background = await nav.evaluate(el => getComputedStyle(el).backgroundColor);
      await expect(nav).toHaveCSS('transition-duration', '0.15s, 0.15s');
      await nav.hover();
      await expect(nav).toHaveCSS('background-color', background);
    }
    const tab = page.getByRole('tab', { name: 'Visão geral', exact: true });
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    await expect(tab).toHaveCSS('transition-duration', '0.15s, 0.15s, 0.15s');
    const tabBackground = await tab.evaluate(el => getComputedStyle(el).backgroundColor);
    if (info.project.name === 'desktop') {
      await tab.hover();
      await expect(tab).toHaveCSS('background-color', tabBackground);
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(tab).toHaveCSS('transition-duration', '0s');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  }
});

test('dotted help supports hover, keyboard, touch and dismissals', async ({ page }, info) => {
  for (const theme of ['dark', 'light']) {
    await page.goto('/data-patterns.html?theme=' + theme);
    const help = page.getByRole('button', { name: 'Atividade no período', exact: true });
    await expect(help).toHaveCSS('border-bottom-style', 'dotted');
    const tooltip = page.getByRole('tooltip');
    if (info.project.name === 'mobile') await help.tap();
    else await help.hover();
    await expect(tooltip).toContainText('Operações concluídas');
    const bounds = await tooltip.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(16);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width - 15);
    await page.screenshot({ path: evidence + 'help-label-' + info.project.name + '-' + theme + '.png' });
    await page.keyboard.press('Escape');
    await expect(tooltip).toHaveCount(0);
    await page.mouse.move(0, 0);
    await page.getByRole('heading', { name: 'Padrões de dados', exact: true }).click();
    await page.keyboard.press('Tab');
    await help.focus();
    await expect(tooltip).toBeVisible();
    await expect(help).toHaveAttribute('aria-describedby', await tooltip.getAttribute('id') ?? '');
    await help.press('Escape');
    await expect(tooltip).toHaveCount(0);
    await expect(help).toBeFocused();
    await page.getByRole('heading', { name: 'Padrões de dados', exact: true }).click();
    if (info.project.name === 'mobile') {
      await help.tap();
      await expect(tooltip).toBeVisible();
      await help.tap();
      await expect(tooltip).toHaveCount(0);
    }
  }
});

test('carousel loops forward without controls and preserves interruption and reduced motion', async ({ page }, info) => {
  await page.setViewportSize({ width: page.viewportSize()!.width, height: 600 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/data-patterns.html?theme=dark');
  const rail = page.getByRole('region', { name: 'Carrossel de exemplos', exact: true });
  const wrapper = rail.locator('..');
  await expect(wrapper).toHaveAttribute('data-moving', 'false');
  await rail.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(wrapper).toHaveAttribute('data-moving', 'true');
  const initial = await rail.evaluate(el => el.scrollLeft);
  await expect.poll(() => rail.evaluate(el => el.scrollLeft)).toBeGreaterThan(initial + 2);
  if (info.project.name === 'desktop') {
    await rail.hover();
    await expect(wrapper).toHaveAttribute('data-moving', 'false');
    const paused = await rail.evaluate(el => el.scrollLeft);
    await page.waitForTimeout(240);
    expect(await rail.evaluate(el => el.scrollLeft)).toBe(paused);
    await page.mouse.move(0, 0);
    await expect(wrapper).toHaveAttribute('data-moving', 'true');
  }
  await expect(wrapper.locator('.es-carousel-controls')).toHaveCount(0);
  const period = await rail.locator('.es-carousel-copy').first().evaluate(el => el.getBoundingClientRect().width + 16);
  for (let cycle = 0; cycle < 3; cycle++) {
    await rail.evaluate((el, width) => { el.scrollLeft = width * 2 - 2; }, period);
    const values = await rail.evaluate(el => new Promise<number[]>(resolve => {
      const points: number[] = [];
      const sample = () => { points.push(el.scrollLeft); if (points.length < 32) requestAnimationFrame(sample); else resolve(points); };
      requestAnimationFrame(sample);
    }));
    expect(values.some((value, i) => i > 0 && value < values[i - 1] - period / 2)).toBe(true);
    const deltas = values.slice(1).map((value, i) => (value - values[i] + period) % period);
    expect(Math.max(...deltas)).toBeLessThanOrEqual(3);
    expect(deltas.reduce((a, b) => a + b, 0)).toBeGreaterThan(2);
  }
  await rail.focus();
  await expect(wrapper).toHaveAttribute('data-moving', 'false');
  await rail.press('Space');
  await rail.evaluate(el => (el as HTMLElement).blur());
  await expect(wrapper).toHaveAttribute('data-playback', 'paused');
  await rail.focus();
  await rail.press('Space');
  await rail.press('ArrowRight');
  await rail.evaluate(el => (el as HTMLElement).blur());
  await expect(wrapper).toHaveAttribute('data-moving', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(wrapper).toHaveAttribute('data-moving', 'false');
  await expect(rail).toHaveCSS('scrollbar-width', 'none');
  await expect(rail).toHaveCSS('scroll-snap-type', 'none');
  await rail.focus();
  const manualStart = await rail.evaluate(el => el.scrollLeft);
  await rail.press('ArrowRight');
  await expect.poll(() => rail.evaluate(el => el.scrollLeft)).toBeGreaterThan(manualStart);
  await expect(wrapper).toHaveAttribute('data-moving', 'false');
  await expect(rail.getByRole('button', { name: /^Marcar / })).toHaveCount(5);
  await page.screenshot({ path: evidence + `carousel-loop-${info.project.name}.png`, fullPage: true });
});

test('loop copies share selection and expose one keyboard set without moving clicked cards', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/data-patterns.html?theme=light');
  const rail = page.getByRole('region', { name: 'Carrossel de exemplos', exact: true });
  await rail.scrollIntoViewIfNeeded();
  const copy = rail.locator('.es-carousel-copy').nth(2);
  const action = copy.locator('button').first();
  await rail.evaluate(el => { const width = el.querySelector('.es-carousel-copy')!.getBoundingClientRect().width + 16; el.scrollLeft = width * 2 - 80; });
  const before = await action.boundingBox();
  await action.click();
  await expect(action).toHaveAttribute('aria-pressed', 'true');
  await expect(copy).not.toHaveAttribute('aria-hidden', 'true');
  await expect(rail.getByRole('button', { name: /^Marcar / })).toHaveCount(5);
  expect(Math.abs((await action.boundingBox())!.x - before!.x)).toBeLessThanOrEqual(1);
  await expect(rail.locator('.es-carousel-copy').nth(1).locator('button').first()).toHaveAttribute('aria-pressed', 'true');
  await expect(rail.locator('.es-carousel-copy').nth(1).locator('button').first()).toHaveAttribute('tabindex', '-1');
  await action.press('Tab');
  await expect(copy.locator('button').nth(1)).toBeFocused();
  const duplicateIds = await rail.evaluate(el => {
    const ids = [...el.querySelectorAll('[id]')].map(node => node.id);
    return ids.length !== new Set(ids).size;
  });
  expect(duplicateIds).toBe(false);
  await page.setViewportSize({ width: 320, height: 840 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
