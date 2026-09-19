import { expect, test, type Page } from '@playwright/test';

async function openAccountMenu(page: Page) {
  const navigation = page.getByRole('button', { name: 'Navigation', exact: true });
  if (await navigation.isVisible()) await navigation.click();
  const trigger = page.getByRole('button', { name: 'Workspace workspace menu', exact: true });
  await trigger.click();
  return { trigger, menu: page.getByRole('dialog', { name: 'Account menu', exact: true }) };
}

for (const theme of ['light', 'dark'] as const) {
  test(`AccountMenu keeps context-menu keyboard behavior and focus recovery in ${theme}`, async ({ page }) => {
    await page.goto(`/?view=chat&theme=${theme}`);
    const { trigger, menu } = await openAccountMenu(page);
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('button', { name: 'Account settings', exact: true })).toBeFocused();
    await expect(menu.locator('.es-account-active')).toHaveCount(1);

    await page.keyboard.press('ArrowDown');
    await expect(menu.getByRole('button', { name: 'Integrations', exact: true })).toBeFocused();
    await page.keyboard.press('Home');
    await expect(menu.getByRole('button', { name: 'Account settings', exact: true })).toBeFocused();
    await page.keyboard.press('End');
    await expect(menu.getByRole('button', { name: 'View example', exact: true })).toBeFocused();
    await expect(menu.locator('.es-account-active')).toHaveCount(0);
    await page.keyboard.press('a');
    await expect(menu.getByRole('button', { name: 'Account settings', exact: true })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.keyboard.press('e');
    await expect(menu.getByRole('button', { name: 'Example studio', exact: true })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });

  test(`AccountMenu keeps controlled theme/workspace choices and reduced motion in ${theme}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/?view=chat&theme=${theme}`);
    const { menu } = await openAccountMenu(page);
    await expect(menu).toBeVisible();

    const appearance = menu.getByRole('radiogroup', { name: 'Appearance', exact: true });
    await appearance.getByRole('radio', { name: theme === 'light' ? 'Dark' : 'Light', exact: true }).check();
    await expect(page.locator('.es-root')).toHaveAttribute('data-theme', theme === 'light' ? 'dark' : 'light');
    await expect(menu).toBeVisible();
    await appearance.getByRole('radio', { name: theme === 'light' ? 'Dark' : 'Light', exact: true }).focus();
    await expect(menu.locator('.es-account-active')).toHaveCount(0);

    await menu.getByRole('button', { name: 'Example studio', exact: true }).click();
    await expect(menu).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Example studio workspace menu', exact: true })).toBeFocused();

    await page.getByRole('button', { name: 'Example studio workspace menu', exact: true }).click();
    await menu.getByRole('button', { name: 'Account settings', exact: true }).focus();
    await page.keyboard.press('ArrowDown');
    await expect(menu.getByRole('button', { name: 'Integrations', exact: true })).toBeFocused();
    const state = await menu.locator('.es-account-active').evaluate(element => ({
      transitionDuration: getComputedStyle(element).transitionDuration,
      transform: getComputedStyle(element).transform,
      animationName: getComputedStyle(element).animationName,
    }));
    expect(state.transitionDuration).toBe('0s');
    expect(state.transform).toBe('none');
    expect(state.animationName).toBe('none');
  });
}
