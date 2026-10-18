import type { Locator, Page } from '@playwright/test';

/**
 * Touch floors follow the live pointer, not the project name: Chromium drops the mobile project's
 * `pointer: coarse` emulation after a full-page screenshot, so later measurements see a fine pointer.
 * Coarse pointers: md buttons grow to 44px and compact pills extend their hit area to 44px.
 */
export const coarsePointer = (page: Page) => page.evaluate(() => matchMedia('(pointer: coarse)').matches);

/** Border box plus the negative-inset `::before` hit area compact pills add on coarse pointers. */
export const hitBox = (target: Locator) => target.evaluate(element => {
  const box = element.getBoundingClientRect();
  const before = getComputedStyle(element, '::before');
  const extended = before.content !== 'none' && before.position === 'absolute';
  const outset = (value: string) => extended ? Math.max(0, -(parseFloat(value) || 0)) : 0;
  return { width: box.width + outset(before.left) + outset(before.right), height: box.height + outset(before.top) + outset(before.bottom) };
});
