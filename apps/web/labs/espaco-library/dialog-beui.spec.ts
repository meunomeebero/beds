import { expect, test } from '@playwright/test';

const probe = '/dialog-harness.html';

test.describe('Dialog center-morph native lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    page.on('pageerror', error => { throw error; });
    await page.goto(probe);
  });

  test('opens as a native labelled modal, gates entry focus, traps Tab and returns focus on Escape', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const trigger = page.getByRole('button', { name: 'Open harness dialog', exact: true });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Harness dialog', exact: true });
    const surface = dialog.locator(':scope > .es-dialog-surface');
    await expect(dialog).toHaveAttribute('data-motion', 'full');
    await expect(dialog).toBeVisible();
    expect(await dialog.evaluate(element => element.matches(':modal'))).toBe(true);
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAccessibleName('Harness dialog');

    const entry = await page.evaluate(() => {
      const shell = document.querySelector<HTMLDialogElement>('.es-dialog-shell');
      const inner = document.querySelector<HTMLElement>('.es-dialog-surface');
      return {
        shellFocused: document.activeElement === shell,
        phase: inner?.dataset.phase,
        inert: inner?.hasAttribute('inert'),
        pointerEvents: inner ? getComputedStyle(inner).pointerEvents : null,
      };
    });
    expect(entry.shellFocused).toBe(true);
    expect(entry.phase).toBe('entry-inert');
    expect(entry.inert).toBe(true);
    expect(entry.pointerEvents).toBe('none');

    await expect(surface).toHaveAttribute('data-phase', 'settled');
    await expect(surface).not.toHaveAttribute('inert');
    await dialog.getByRole('button', { name: 'Commit action', exact: true }).focus();
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button', { name: 'Fechar', exact: true })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(dialog.getByRole('button', { name: 'Commit action', exact: true })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });

  test('requires the shell as both pointer press and release target', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Open harness dialog', exact: true });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Harness dialog', exact: true });
    const surface = dialog.locator(':scope > .es-dialog-surface');
    await expect(surface).toHaveAttribute('data-phase', 'settled');
    const bounds = await surface.boundingBox();
    if (!bounds) throw new Error('Expected the dialog surface to have a bounding box.');
    const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };

    await page.mouse.move(1, 1);
    await page.mouse.down();
    await page.mouse.move(center.x, center.y);
    await page.mouse.up();
    await expect(dialog).toBeVisible();

    await page.mouse.move(center.x, center.y);
    await page.mouse.down();
    await page.mouse.move(1, 1);
    await page.mouse.up();
    await expect(dialog).toBeVisible();

    await page.mouse.click(1, 1);
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });

  test('keeps reduced-motion entry interactive and responds to a live preference change', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const trigger = page.getByRole('button', { name: 'Open harness dialog', exact: true });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Harness dialog', exact: true });
    const surface = dialog.locator(':scope > .es-dialog-surface');
    await expect(surface).toHaveAttribute('data-phase', 'entry-inert');
    const fullMotionDuration = await page.evaluate(() => {
      const animation = document.querySelector<HTMLElement>('.es-dialog-surface')?.getAnimations()[0];
      return animation?.effect instanceof KeyframeEffect ? animation.effect.getTiming().duration : null;
    });
    expect(fullMotionDuration).toBe(430);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(dialog).toHaveAttribute('data-motion', 'reduced');
    await expect(surface).toHaveAttribute('data-phase', 'settled');
    await expect(surface).not.toHaveAttribute('inert');
    await expect(surface).toHaveCSS('pointer-events', 'auto');
    await page.keyboard.press('Escape');
    const reducedMotionExitDurations = await page.evaluate(() => document.querySelector<HTMLElement>('.es-dialog-surface')?.getAnimations().map(animation => animation.effect instanceof KeyframeEffect ? animation.effect.getTiming().duration : null) ?? []);
    expect(reducedMotionExitDurations).toContain(140);
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await trigger.click();
    await expect(surface).toHaveAttribute('data-phase', 'settled');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(dialog).toHaveAttribute('data-motion', 'full');
    await expect(surface).toHaveAttribute('data-phase', 'settled');
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveAttribute('data-phase', 'exiting');
    const fullMotionExitDurations = await page.evaluate(() => document.querySelector<HTMLElement>('.es-dialog-surface')?.getAnimations().map(animation => animation.effect instanceof KeyframeEffect ? animation.effect.getTiming().duration : null) ?? []);
    expect(fullMotionExitDurations).toContain(430);
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });

  test('supports nested lifecycle without stealing the surviving modal focus', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Open harness dialog', exact: true });
    await trigger.click();
    const outer = page.getByRole('dialog', { name: 'Harness dialog', exact: true });
    const nestedTrigger = page.getByRole('button', { name: 'Open nested dialog', exact: true });
    await nestedTrigger.click();
    const nested = page.getByRole('dialog', { name: 'Nested harness dialog', exact: true });
    await expect(nested).toBeVisible();
    expect(await nested.evaluate(element => element.matches(':modal'))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(nested).not.toBeVisible();
    await expect(nestedTrigger).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(outer).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });

  test('reverses a controlled exit before completion without restoring opener focus or duplicating the shell', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Open harness dialog', exact: true });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Harness dialog', exact: true });
    const surface = dialog.locator(':scope > .es-dialog-surface');
    await expect(surface).toHaveAttribute('data-phase', 'settled');
    await dialog.getByRole('button', { name: 'Delay close', exact: true }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('dialog-status')).toHaveText('close-requested');
    await expect(dialog).toHaveAttribute('data-phase', 'exiting');
    await expect(page.getByTestId('dialog-status')).toHaveText('close-committed');
    await expect(dialog).toBeVisible();
    await page.getByRole('button', { name: 'Reopen during exit', exact: true }).evaluate(button => (button as HTMLButtonElement).click());
    await expect(page.getByTestId('dialog-status')).toHaveText('reopened');
    await expect(dialog).toBeVisible();
    expect(await page.evaluate(() => document.activeElement !== document.querySelector<HTMLButtonElement>('button[aria-label="Open harness dialog"]'))).toBe(true);
    await expect.poll(() => page.locator('dialog.es-dialog-shell[open]').count()).toBe(1);
    await expect(surface).toHaveAttribute('data-phase', 'entry-inert');
    await expect(surface).toHaveAttribute('data-phase', 'settled');
    await expect(surface).not.toHaveAttribute('inert');
    await expect(surface).toHaveCSS('pointer-events', 'auto');
  });

  test('preserves native state when the caller rejects or delays close and tolerates trigger removal', async ({ page }) => {
    const reject = page.getByRole('button', { name: 'Reject close', exact: true }).first();
    const trigger = page.getByRole('button', { name: 'Open harness dialog', exact: true });
    await reject.click();
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Harness dialog', exact: true });
    await expect(dialog.locator(':scope > .es-dialog-surface')).toHaveAttribute('data-phase', 'settled');
    await dialog.getByRole('button', { name: 'Commit action', exact: true }).click();
    await expect(dialog).toBeVisible();
    await expect(page.getByTestId('dialog-status')).toHaveText('close-rejected');

    await dialog.getByRole('button', { name: 'Allow close', exact: true }).click();
    await dialog.getByRole('button', { name: 'Delay close', exact: true }).click();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();
    await expect(page.getByTestId('dialog-status')).toHaveText('close-requested');
    await expect(dialog).not.toBeVisible({ timeout: 1000 });

    await trigger.click();
    await page.getByRole('dialog', { name: 'Harness dialog', exact: true }).getByRole('button', { name: 'Remove trigger', exact: true }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Harness dialog', exact: true })).not.toBeVisible({ timeout: 1000 });
  });
});
