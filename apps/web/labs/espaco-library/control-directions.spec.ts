import { expect, test } from '@playwright/test';

for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  test(`switch remains contained and mirrors direction with ${reducedMotion}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto('/control-directions.html');
    for (const theme of ['light', 'dark']) {
      if (theme === 'dark') await page.getByRole('button', { name: 'Toggle theme' }).click();
      for (const checked of [false, true, false]) {
        const control = page.getByRole('switch', { name: 'rtl notifications', exact: true });
        if (await control.isChecked() !== checked) await control.press('Space');
        for (const direction of ['ltr', 'rtl']) {
          const input = page.getByRole('switch', { name: `${direction} notifications`, exact: true });
          await expect(input).toBeChecked({ checked });
          await expect.poll(() => input.evaluate(element => {
            const track = element.parentElement!.querySelector<HTMLElement>('[aria-hidden]')!;
            const thumb = track.querySelector<HTMLElement>('span')!;
            const outer = track.getBoundingClientRect(), inner = thumb.getBoundingClientRect();
            return {
              contained: inner.left >= outer.left && inner.right <= outer.right,
              offset: getComputedStyle(thumb).insetInlineStart,
              opaque: getComputedStyle(thumb).backgroundColor !== 'rgba(0, 0, 0, 0)',
            };
          })).toEqual({ contained: true, offset: checked ? '14px' : '0px', opaque: true });
          await expect(page.getByRole('switch', { name: `${direction} unavailable`, exact: true })).toBeDisabled();
        }
      }
    }
  });
}
