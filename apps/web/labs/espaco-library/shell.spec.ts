import { expect, test, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const evidence = fileURLToPath(new URL('./evidence/', import.meta.url));

async function openNavigation(page: Page) {
  const toggle = page.getByRole('button', { name: 'Navigation', exact: true });
  if (await toggle.isVisible()) await toggle.click();
}

async function expectNoOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, elements: [...document.querySelectorAll<HTMLElement>('body *')].filter(element => {
    const bounds = element.getBoundingClientRect();
    return bounds.width > 0 && (bounds.right > innerWidth + 1 || bounds.left < -1) && getComputedStyle(element).position !== 'fixed';
  }).slice(0, 5).map(element => ({ tag: element.tagName, classes: element.className, right: element.getBoundingClientRect().right })) }));
  expect(overflow.scrollWidth, JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.width);
}

function relativeLuminance(hex: string) {
  const channels = hex.slice(1).match(/../g)!.map(value => parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}

function contrastRatio(foreground: string, background: string) {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort((left, right) => right - left);
  return (lighter + .05) / (darker + .05);
}

function rgbToHex(value: string) {
  const channels = value.match(/\d+/g)?.slice(0, 3).map(Number);
  if (!channels || channels.length !== 3) throw new Error(`Expected an opaque RGB color, received ${value}.`);
  return `#${channels.map(channel => channel.toString(16).padStart(2, '0')).join('')}`;
}

for (const theme of ['light', 'dark'] as const) {
  test(`account menu uses the approved compact finish and controlled ${theme} appearance`, async ({ page }, testInfo) => {
    await page.goto(`/?view=chat&theme=${theme}`);
    await page.getByRole('heading', { name: 'How can I help you today?' }).waitFor();
    await openNavigation(page);
    const trigger = page.getByRole('button', { name: 'Workspace workspace menu', exact: true });
    await trigger.click();
    const menu = page.getByRole('dialog', { name: 'Account menu', exact: true });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('button', { name: 'Account settings', exact: true })).toBeFocused();
    await expect(menu.getByRole('radio', { name: theme === 'light' ? 'Light' : 'Dark', exact: true })).toBeChecked();

    const geometry = await menu.evaluate(element => {
      const action = element.querySelector<HTMLElement>('.es-account-action')!;
      const themeSwitch = element.querySelector<HTMLElement>('.es-segmented-control')!;
      const bounds = element.getBoundingClientRect();
      return { width: bounds.width, left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom, radius: getComputedStyle(element).borderRadius, font: getComputedStyle(action).fontSize, row: action.getBoundingClientRect().height, icon: action.querySelector('svg')!.getBoundingClientRect().width, themeHeight: themeSwitch.getBoundingClientRect().height };
    });
    expect(geometry.width).toBe(280);
    expect(geometry.font).toBe('13px');
    expect(geometry.row).toBe(testInfo.project.name === 'mobile' ? 44 : 30);
    expect(geometry.icon).toBe(14);
    expect(geometry.radius).toBe('12px');
    expect(geometry.themeHeight).toBe(testInfo.project.name === 'mobile' ? 44 : 24);
    await expect(menu).toHaveCSS('padding', '0px');
    await expect(menu).toHaveCSS('border-top-width', '1px');
    await expect(menu).toHaveCSS('font-family', /Espaco Inter/);
    await expect(menu.locator('.es-account-action').first()).toHaveCSS('font-weight', '400');
    await expect(menu.locator('.es-account-action').first()).toHaveCSS('line-height', '19.5px');
    await expect(menu.locator('.es-account-avatar')).toHaveCSS('width', '24px');
    await expect(menu.locator('.es-account-identity')).toHaveCSS('border-bottom-width', '1px');
    await expect(menu.locator('.es-account-action--all-workspaces')).toHaveCSS('margin-top', '4px');
    await expect(menu.locator('.es-account-action--all-workspaces')).toHaveCSS('background-color', theme === 'dark' ? 'rgb(38, 38, 38)' : 'rgb(237, 236, 233)');
    await expect(menu.locator('.es-segmented-choice > span').first()).toHaveCSS('min-height', testInfo.project.name === 'mobile' ? '40px' : '20px');
    expect(geometry.left).toBeGreaterThanOrEqual(0);
    expect(geometry.right).toBeLessThanOrEqual(page.viewportSize()!.width);
    expect(geometry.bottom).toBeLessThanOrEqual(page.viewportSize()!.height);
    await page.screenshot({ path: `${evidence}account-${theme}-${testInfo.project.name}.png` });

    await menu.getByRole('radio', { name: theme === 'light' ? 'Dark' : 'Light', exact: true }).check();
    await expect(page.locator('.es-root')).toHaveAttribute('data-theme', theme === 'light' ? 'dark' : 'light');
    await expect(menu).toBeVisible();
    await expect(menu).toHaveCSS('background-color', theme === 'light' ? 'rgb(32, 32, 32)' : 'rgb(255, 255, 255)');
    await menu.getByRole('button', { name: 'Example studio', exact: true }).click();
    await expect(menu).not.toBeVisible();
    const nextTrigger = page.getByRole('button', { name: 'Example studio workspace menu', exact: true });
    await expect(nextTrigger).toBeFocused();
    await nextTrigger.click();
    await expect(menu.getByRole('button', { name: 'Example studio', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Shift+Tab');
    await expect(menu.getByRole('button', { name: 'View example', exact: true })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(menu.getByRole('button', { name: 'Account settings', exact: true })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).not.toBeVisible();
    await expect(nextTrigger).toBeFocused();
    await nextTrigger.click();
    const outsideAction = page.getByRole('button', { name: 'Sobre esta demonstração', exact: true });
    await outsideAction.click();
    await expect(menu).not.toBeVisible();
    await expect(outsideAction).toBeFocused();
    if (testInfo.project.name === 'mobile') {
      await expect(page.getByRole('dialog', { name: 'Navigation', exact: true })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog', { name: 'Navigation', exact: true })).not.toBeVisible();
      await expect(page.getByRole('button', { name: 'Navigation', exact: true })).toBeFocused();
    }
  });

  test(`shell collapse and mobile drawer keep ${theme} dimensions`, async ({ page }, testInfo) => {
    await page.goto(`/?view=chat&theme=${theme}`);
    await page.getByRole('heading', { name: 'How can I help you today?' }).waitFor();
    const sidebar = page.locator('.es-sidebar');
    if (testInfo.project.name === 'desktop') {
      await expect(sidebar).toHaveCSS('width', '264px');
      await expect(page.locator('.es-content-header')).toHaveCSS('height', '48px');
      await page.getByRole('button', { name: 'Collapse sidebar', exact: true }).click();
      await expect(sidebar).toHaveCSS('width', '62px');
      await page.getByRole('button', { name: 'Workspace workspace menu', exact: true }).click();
      await expect(page.getByRole('dialog', { name: 'Account menu', exact: true })).toBeVisible();
      await page.screenshot({ path: `${evidence}collapsed-account-${theme}.png` });
      await page.keyboard.press('Escape');
      await page.getByRole('button', { name: 'Expand sidebar', exact: true }).click();
      await expect(sidebar).toHaveCSS('width', '264px');
    } else {
      await expect(sidebar).not.toBeVisible();
      await openNavigation(page);
      await expect(sidebar).toHaveCSS('width', '264px');
      await expect(page.locator('.es-app-main')).toHaveAttribute('inert', '');
      await page.getByRole('button', { name: 'Componentes', exact: true }).click();
      await expect(sidebar).not.toBeVisible();
      await expect(page.getByRole('heading', { name: 'Componentes', exact: true })).toBeVisible();
      await expect(page.locator('.es-app-main')).not.toHaveAttribute('inert');
    }
    await expectNoOverflow(page);
  });

  test(`mobile drawer restores the navigation trigger after ${theme} close paths`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Focus restoration is a mobile drawer contract.');
    await page.goto(`/?view=chat&theme=${theme}`);
    await page.getByRole('heading', { name: 'How can I help you today?' }).waitFor();
    const trigger = page.getByRole('button', { name: 'Navigation', exact: true });
    const sidebar = page.getByRole('dialog', { name: 'Navigation', exact: true });
    await trigger.focus();
    await trigger.press('Enter');
    await expect(sidebar).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(sidebar).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await sidebar.getByRole('button', { name: 'Close navigation', exact: true }).click();
    await expect(sidebar).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(sidebar).toBeVisible();
    await page.mouse.click(380, 420);
    await expect(sidebar).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(sidebar).toBeVisible();
    await page.keyboard.press('Escape');
    await trigger.press('Enter');
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toHaveCSS('width', '264px');
    await sidebar.getByRole('button', { name: 'Close navigation', exact: true }).click();
    await expect(trigger).toBeFocused();
  });

  test(`shell follows live viewport changes without losing ${theme} drawer isolation`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Live breakpoint changes are exercised from the desktop project.');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/?view=chat&theme=${theme}`);
    await page.getByRole('heading', { name: 'How can I help you today?' }).waitFor();
    const sidebar = page.locator('.es-sidebar');
    const main = page.locator('.es-app-main');
    await expect(sidebar).toHaveCSS('width', '264px');
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('.es-mobile-bar')).toBeVisible();
    await expect(sidebar).not.toBeVisible();
    await expect(main).not.toHaveAttribute('inert');
    await page.setViewportSize({ width: 1024, height: 844 });
    await expect(page.locator('.es-mobile-bar')).not.toBeVisible();
    await expect(sidebar).toHaveCSS('width', '264px');
    await expect(main).not.toHaveAttribute('inert');
    await page.getByRole('button', { name: 'Collapse sidebar', exact: true }).click();
    await expect.poll(() => page.locator('.es-app-shell').evaluate(element => element.getAnimations().length)).toBe(0);
    await expect(sidebar).toHaveCSS('width', '62px');
    await page.getByRole('button', { name: 'Expand sidebar', exact: true }).click();
    await expect.poll(() => page.locator('.es-app-shell').evaluate(element => element.getAnimations().length)).toBe(0);
    await expect(sidebar).toHaveCSS('width', '264px');
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('.es-mobile-bar')).toBeVisible();
    await expect(sidebar).not.toBeVisible();
    await page.setViewportSize({ width: 320, height: 844 });
    await expect(page.locator('.es-mobile-bar')).toBeVisible();
    await page.evaluate(() => { document.documentElement.style.zoom = '2'; });
    const zoomBounds = await page.evaluate(() => ({ viewport: innerWidth, body: document.body.scrollWidth }));
    expect(zoomBounds.body, `CSS zoom proxy should stay within the logical viewport: ${JSON.stringify(zoomBounds)}`).toBeLessThanOrEqual(zoomBounds.viewport);
    await page.evaluate(() => { document.documentElement.style.zoom = ''; });
    await expectNoOverflow(page);
  });

  test(`secondary text roles meet contrast on every ${theme} surface`, async ({ page }) => {
    await page.goto(`/?view=chat&theme=${theme}`);
    await page.getByRole('heading', { name: 'How can I help you today?' }).waitFor();
    const roles = await page.locator('.es-root').evaluate((element, currentTheme) => {
      const style = getComputedStyle(element);
      return {
        secondary: style.getPropertyValue('--es-secondary').trim(),
        badgeText: style.getPropertyValue('--es-on-badge').trim(),
        backgrounds: currentTheme === 'light' ? ['--es-bg', '--es-sidebar', '--es-subtle'] : ['--es-bg', '--es-surface', '--es-subtle', '--es-raised'],
        values: ['--es-bg', '--es-sidebar', '--es-subtle', '--es-surface', '--es-raised', '--es-badge'].reduce<Record<string, string>>((result, token) => ({ ...result, [token]: style.getPropertyValue(token).trim() }), {}),
      };
    }, theme);
    for (const token of roles.backgrounds) expect(contrastRatio(roles.secondary, roles.values[token])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(roles.badgeText, roles.values['--es-badge'])).toBeGreaterThanOrEqual(4.5);
  });

  test(`functional badges and placeholders meet contrast in ${theme}`, async ({ page }) => {
    await page.goto(`/?view=components&theme=${theme}`);
    await page.getByRole('heading', { name: 'Componentes', exact: true }).waitFor();
    const colors = await page.locator('.es-root').evaluate(root => {
      const placeholder = root.querySelector<HTMLInputElement>('input[data-purpose]')!;
      return {
        placeholder: getComputedStyle(placeholder, '::placeholder').color,
        field: getComputedStyle(placeholder).backgroundColor,
        badges: [...root.querySelectorAll<HTMLElement>('.es-badge[data-tone]:not([data-tone="neutral"])')].map(badge => ({
          tone: badge.dataset.tone,
          color: getComputedStyle(badge).color,
          background: getComputedStyle(badge).backgroundColor,
          marker: getComputedStyle(badge).boxShadow,
          markerColor: getComputedStyle(badge).getPropertyValue(`--es-badge-${badge.dataset.tone}-marker`).trim(),
        })),
      };
    });
    expect(contrastRatio(rgbToHex(colors.placeholder), rgbToHex(colors.field))).toBeGreaterThanOrEqual(4.5);
    for (const badge of colors.badges) {
      expect(contrastRatio(rgbToHex(badge.color), rgbToHex(badge.background))).toBeGreaterThanOrEqual(4.5);
      expect(badge.marker).not.toBe('none');
      expect(badge.markerColor, `${theme} ${badge.tone} marker`).toMatch(/^#[\da-f]{6}$/i);
      expect(contrastRatio(badge.markerColor, rgbToHex(badge.background)), `${theme} ${badge.tone} marker`).toBeGreaterThanOrEqual(3);
    }
  });

  test(`mobile touch press keeps recent-item text readable in ${theme}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Pressed touch state is exercised by the mobile touch project.');
    await page.goto(`/?view=components&theme=${theme}`);
    const item = page.getByRole('button', { name: /Documento de exemplo/ });
    await item.scrollIntoViewIfNeeded();
    await expect(item).toBeVisible();
    expect(await page.evaluate(() => navigator.maxTouchPoints)).toBeGreaterThan(0);
    const bounds = await item.boundingBox();
    if (!bounds) throw new Error('RecentItem must be measurable before touch input.');
    try {
      await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      await page.mouse.down();
      await expect(item).toHaveCSS('color', theme === 'light' ? 'rgb(55, 53, 46)' : 'rgb(206, 206, 206)');
      await expect(item).toHaveCSS('background-color', theme === 'light' ? 'rgb(219, 216, 210)' : 'rgba(255, 255, 255, 0.047)');
      expect(contrastRatio(theme === 'light' ? '#37352e' : '#cecece', theme === 'light' ? '#dbd8d2' : '#242424')).toBeGreaterThanOrEqual(4.5);
      await page.screenshot({ path: testInfo.outputPath(`recent-item-pressed-${theme}.png`), fullPage: false });
    } finally {
      await page.mouse.up();
    }
  });

  test(`catalog layouts fit all ${theme} viewport widths`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Viewport loop covers the CSS breakpoints; mobile project covers touch and drawer interactions.');
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/?view=chat&theme=${theme}`);
      await page.getByRole('heading', { name: 'How can I help you today?' }).waitFor();
      await expectNoOverflow(page);
      await page.screenshot({ path: `${evidence}chat-${theme}-${width}.png` });
      await openNavigation(page);
      await page.getByRole('button', { name: 'Componentes', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Componentes', exact: true })).toBeVisible();
      await expectNoOverflow(page);
      await page.screenshot({ path: `${evidence}components-${theme}-${width}.png` });
      await openNavigation(page);
      await page.getByRole('button', { name: 'Tokens', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Tokens', exact: true })).toBeVisible();
      await expectNoOverflow(page);
    }
  });
}
