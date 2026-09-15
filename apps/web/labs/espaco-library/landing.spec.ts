import { expect, test } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const evidence = fileURLToPath(new URL('./evidence/', import.meta.url));

test('LandingPage centers the 1180px lane with fixed insets', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?view=landing');
  const lane = page.locator('.es-landing');
  await expect(lane).toBeVisible();
  await expect(page.locator('main.es-landing')).toHaveCount(1);
  await expect(lane).toHaveCSS('max-width', '1180px');
  const bounds = await lane.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right, inner: window.innerWidth };
  });
  expect(Math.round(bounds.left)).toBe(Math.round((bounds.inner - 1180) / 2));

  await page.setViewportSize({ width: 360, height: 800 });
  const insets = await lane.evaluate(element => {
    const style = getComputedStyle(element);
    return { left: element.getBoundingClientRect().left, padding: style.paddingLeft };
  });
  expect(insets.padding).toBe('16px');
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('PromoHero: three asymmetric columns on desktop, center-first stacking below', async ({ page }, testInfo) => {
  for (const width of [360, 800, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/?view=landing');
    const hero = page.locator('.es-promo-hero');
    await expect(hero).toBeVisible();
    const slots = await hero.evaluate(element => {
      const order = ['leading', 'center', 'trailing'] as const;
      return order.map(slot => {
        const node = element.querySelector(`.es-promo-hero-${slot}`);
        return node ? node.getBoundingClientRect() : null;
      });
    });
    expect(slots.every(bounds => bounds && bounds.width > 0)).toBe(true);
    if (width >= 1024) {
      const [leading, center, trailing] = slots;
      expect(leading!.right).toBeLessThanOrEqual(center!.left + 1);
      expect(center!.right).toBeLessThanOrEqual(trailing!.left + 1);
      expect(center!.width).toBeGreaterThanOrEqual(500);
      expect(center!.width).toBeLessThanOrEqual(540);
    } else if (width >= 768) {
      // Center row first, then the two panels side by side.
      expect(slots[1]!.top).toBeLessThan(slots[0]!.top);
      expect(slots[0]!.top).toBeCloseTo(slots[2]!.top, 0);
      expect(slots[0]!.x).toBeLessThan(slots[2]!.x);
    } else {
      // Ordem de leitura mobile: centro primeiro, depois os painéis na ordem fornecida.
      expect(slots[1]!.top).toBeLessThan(slots[0]!.top);
      expect(slots[1]!.bottom).toBeLessThanOrEqual(slots[0]!.top + 1);
      expect(slots[0]!.bottom).toBeLessThanOrEqual(slots[2]!.top + 1);
    }
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: `${evidence}promo-hero-${width}-${testInfo.project.name}.png`, fullPage: false });
  }
});

test('RankedList renders semantic ordered items with responsive columns', async ({ page }, testInfo) => {
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/?view=landing');
    const list = page.getByRole('list', { name: 'Exemplo de ranking' });
    await expect(list).toBeVisible();
    const tag = await list.evaluate(element => element.tagName);
    expect(tag.toLowerCase()).toBe('ol');
    const items = list.locator(':scope > li');
    await expect(items).toHaveCount(6);
    await expect(items.first().locator('.es-surface')).toBeVisible();

    const columns = await list.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length);
    if (width >= 1024) expect(columns).toBe(3);
    else if (width >= 768) expect(columns).toBe(2);
    else expect(columns).toBe(1);

    // Every card action keeps the 44px hit target.
    const target = await list.locator('.es-button[data-touch-target]').first().evaluate(element => ({
      height: element.getBoundingClientRect().height,
      width: element.getBoundingClientRect().width,
    }));
    expect(target.height).toBeGreaterThanOrEqual(44);
    expect(target.width).toBeGreaterThanOrEqual(44);

    await page.screenshot({ path: `${evidence}ranked-list-${width}-${testInfo.project.name}.png`, fullPage: false });
  }
});

test('Avatar falls back to initials when the image fails and lazy loads offscreen media', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?view=landing');
  // O segundo card usa um src propositalmente inexistente: recuperação única para iniciais.
  const cards = page.getByRole('list', { name: 'Exemplo de ranking' }).locator(':scope > li');
  const brokenAvatar = cards.nth(1).locator('.es-avatar').first();
  await cards.first().scrollIntoViewIfNeeded();
  await expect(brokenAvatar).toHaveText('BC', { ignoreCase: true });
  const lazyImages = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLImageElement>('.es-avatar img[loading="lazy"]')).length,
  );
  expect(lazyImages).toBeGreaterThanOrEqual(1);
  await page.screenshot({ path: `${evidence}avatar-fallback-${testInfo.project.name}.png`, fullPage: false });
});