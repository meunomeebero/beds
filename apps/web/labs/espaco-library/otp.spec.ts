import { test, expect, type Page } from '@playwright/test';

async function paste(page: Page, label: string, value: string) {
  await page.getByLabel(label).evaluate((node, text) => {
    const transfer = new DataTransfer();
    transfer.setData('text/plain', text);
    node.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, clipboardData: transfer }));
  }, value);
}

function field(page: Page, label: string) {
  return page.locator('.es-otp-field').filter({ has: page.getByLabel(label) });
}

for (const theme of ['light', 'dark']) {
  test(`OTP entry, paste and recovery ${theme}`, async ({ page }) => {
    await page.goto(`/?view=otp&theme=${theme}`);
    const main = field(page, 'Código de acesso');
    const input = page.getByLabel('Código de acesso');
    const slots = main.locator('.es-otp-slot');
    const initial = await slots.evaluateAll(nodes => nodes.map(node => {
      const rect = node.getBoundingClientRect();
      return { x: rect.x + window.scrollX, y: rect.y + window.scrollY, width: rect.width, height: rect.height };
    }));
    expect(initial).toHaveLength(6);
    expect(new Set(initial.map(slot => slot.y)).size).toBe(1);
    expect(initial.every(slot => slot.width >= 24 && slot.height >= 24)).toBe(true);
    await expect(input).toHaveAttribute('autocomplete', 'one-time-code');
    await expect(input).toHaveAttribute('inputmode', 'numeric');

    await input.fill('123456');
    await expect(input).toHaveValue('123456');
    await expect(page.getByText('onComplete observado: 1')).toBeVisible();
    await input.press('End');
    await input.press('Backspace');
    await expect(input).toHaveValue('12345');
    await input.press('6');
    await expect(input).toHaveValue('123456');
    await expect(page.getByText('onComplete observado: 2')).toBeVisible();

    await page.getByRole('button', { name: 'Limpar', exact: true }).click();
    await input.focus();
    await paste(page, 'Código de acesso', '12 3-4x56-789');
    await expect(input).toHaveValue('123456');
    await input.fill('');
    await input.focus();
    await paste(page, 'Código de acesso', '9999999999');
    await expect(input).toHaveValue('999999');

    await page.getByRole('button', { name: 'Simular erro', exact: true }).click();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(main.getByRole('status')).toContainText('Código inválido');
    await input.fill('654321');
    await expect(input).toHaveAttribute('aria-invalid', 'false');
    await page.getByRole('button', { name: 'Simular verificação', exact: true }).click();
    await expect(input).toHaveAttribute('readonly', '');
    await expect(input).toHaveAttribute('aria-busy', 'true');
    await page.getByRole('button', { name: 'Simular sucesso', exact: true }).click();
    await expect(input).toHaveAttribute('readonly', '');
    await expect(main.locator('.es-otp-success-icon')).toBeVisible();
    await expect(main.getByRole('status')).toContainText('Código confirmado');
    await page.waitForTimeout(500);
    const settled = await slots.evaluateAll(nodes => nodes.map(node => {
      const rect = node.getBoundingClientRect();
      return { x: rect.x + window.scrollX, y: rect.y + window.scrollY, width: rect.width, height: rect.height };
    }));
    settled.forEach((slot, index) => {
      expect(slot.x).toBeCloseTo(initial[index].x, 1);
      expect(slot.y).toBeCloseTo(initial[index].y, 1);
      expect(slot.width).toBeCloseTo(initial[index].width, 1);
      expect(slot.height).toBeCloseTo(initial[index].height, 1);
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    await page.getByRole('button', { name: 'Limpar', exact: true }).click();
    await expect(input).toHaveValue('');
    await input.focus();
    await input.press('1');
    await expect(input).toHaveValue('1');
    await input.press('Backspace');
    await expect(input).toHaveValue('');
  });

  test(`OTP lengths, custom groups and disabled state ${theme}`, async ({ page }) => {
    await page.goto(`/?view=otp&theme=${theme}`);
    for (const [label, length] of [['Código curto (4 dígitos)', 4], ['Código de acesso', 6], ['Código dividido (8 dígitos)', 8]] as const) {
      const input = page.getByLabel(label);
      await expect(field(page, label).locator('.es-otp-slot')).toHaveCount(length);
      await input.fill('123456789');
      await expect(input).toHaveValue('123456789'.slice(0, length));
    }
    const split = field(page, 'Código dividido (8 dígitos)');
    await expect(split.locator('.es-otp-group')).toHaveCount(2);
    await expect(split.locator('.es-otp-separator')).toHaveCount(1);
    await expect(page.getByLabel('Código indisponível')).toBeDisabled();
    await expect(page.getByLabel('Código indisponível')).toHaveAttribute('aria-describedby', /description/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('OTP motion has intermediate and settled frames', async ({ page }) => {
  await page.goto('/?view=otp&theme=dark');
  const main = field(page, 'Código de acesso');
  const input = page.getByLabel('Código de acesso');
  await input.fill('1');
  await page.waitForTimeout(60);
  const digitDuring = await main.locator('.es-otp-digit').first().evaluate(node => ({
    transform: getComputedStyle(node).transform,
    filter: getComputedStyle(node).filter,
    opacity: getComputedStyle(node).opacity,
  }));
  expect(digitDuring.transform !== 'none' || digitDuring.filter !== 'none' || digitDuring.opacity !== '1').toBe(true);
  await page.waitForTimeout(260);
  await expect(main.locator('.es-otp-digit').first()).toHaveText('1');
  const digitSettled = await main.locator('.es-otp-digit').first().evaluate(node => ({
    transform: getComputedStyle(node).transform,
    filter: getComputedStyle(node).filter,
    opacity: getComputedStyle(node).opacity,
  }));
  expect(digitSettled.opacity).toBe('1');
  await input.fill('123456');
  await page.getByRole('button', { name: 'Simular erro', exact: true }).click();
  await page.waitForTimeout(60);
  const shakeDuring = await main.locator('.es-otp-group').evaluate(node => getComputedStyle(node).transform);
  expect(shakeDuring).not.toBe('none');
  await page.waitForTimeout(500);
  await expect(main.locator('.es-otp-group')).toHaveCSS('transform', 'none');
});

test('OTP success presence animates, exits and re-enters', async ({ page }) => {
  await page.goto('/?view=otp&theme=dark');
  const main = field(page, 'Código de acesso');
  const input = page.getByLabel('Código de acesso');
  const success = page.getByRole('button', { name: 'Simular sucesso', exact: true });
  const error = page.getByRole('button', { name: 'Simular erro', exact: true });
  await input.fill('123456');

  await success.click();
  const icon = main.locator('.es-otp-success-icon');
  await expect(icon).toBeVisible();
  await page.waitForTimeout(32);
  const entering = await icon.evaluate(node => ({
    transform: getComputedStyle(node).transform,
    opacity: getComputedStyle(node).opacity,
  }));
  expect(entering.transform !== 'none' || entering.opacity !== '1').toBe(true);
  await page.waitForTimeout(500);
  const settled = await icon.evaluate(node => ({
    transform: getComputedStyle(node).transform,
    opacity: getComputedStyle(node).opacity,
  }));
  expect(settled.opacity).toBe('1');

  await error.click();
  await expect(icon).toHaveCount(0);
  await success.click();
  await expect(icon).toBeVisible();
  await page.waitForTimeout(500);
  await expect(icon).toHaveCSS('opacity', '1');
  await expect(main.locator('.es-otp-success-icon')).toHaveCount(1);
});

test('OTP success presence interruption settles the latest status', async ({ page }) => {
  await page.goto('/?view=otp&theme=light');
  const main = field(page, 'Código de acesso');
  const input = page.getByLabel('Código de acesso');
  const success = page.getByRole('button', { name: 'Simular sucesso', exact: true });
  const error = page.getByRole('button', { name: 'Simular erro', exact: true });
  await input.fill('123456');
  await success.click();
  await page.waitForTimeout(32);
  await error.click();
  await page.waitForTimeout(48);
  await success.click();
  const icon = main.locator('.es-otp-success-icon');
  await expect(icon).toBeVisible();
  await page.waitForTimeout(500);
  await expect(icon).toHaveCSS('opacity', '1');
  await expect(main.locator('.es-otp-success-icon')).toHaveCount(1);
});

test('OTP reduced motion is static and success settles inline', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?view=otp&theme=light');
  const main = field(page, 'Código de acesso');
  const input = page.getByLabel('Código de acesso');
  await input.fill('123456');
  const reducedDigit = await main.locator('.es-otp-digit').first().evaluate(node => ({
    transform: getComputedStyle(node).transform,
    filter: getComputedStyle(node).filter,
    opacity: getComputedStyle(node).opacity,
  }));
  expect(reducedDigit.filter).toBe('none');
  expect(reducedDigit.opacity).toBe('1');
  await page.getByRole('button', { name: 'Simular sucesso', exact: true }).click();
  await expect(main.locator('.es-otp-success-icon')).toBeVisible();
  const iconStyle = await main.locator('.es-otp-success-icon').evaluate(node => ({ transform: getComputedStyle(node).transform, opacity: getComputedStyle(node).opacity }));
  expect(iconStyle.opacity).toBe('1');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('OTP controlled rejection keeps caller value and instances isolated', async ({ page }) => {
  await page.goto('/?view=otp&theme=dark');
  const main = page.getByLabel('Código de acesso');
  const short = page.getByLabel('Código curto (4 dígitos)');
  await page.getByRole('button', { name: 'Rejeitar alterações', exact: true }).click();
  await main.fill('123');
  await expect(main).toHaveValue('');
  await expect(short).toHaveValue('');
  await page.getByRole('button', { name: 'Aceitar alterações', exact: true }).click();
  await main.fill('123');
  await expect(main).toHaveValue('123');
  await expect(short).toHaveValue('');
});

test('OTP CSS zoom proxy is identified separately from real browser zoom', async ({ page }) => {
  test.info().annotations.push({ type: 'limitation', description: 'CSS zoom:2 proxy only; native browser zoom and physical devices remain unverified.' });
  await page.goto('/?view=otp&theme=dark');
  await page.evaluate(() => { document.body.style.zoom = '2'; });
  const main = field(page, 'Código de acesso');
  await expect(main.locator('.es-otp-slot')).toHaveCount(6);
  expect(await main.locator('.es-otp-slot').first().evaluate(node => getComputedStyle(node).fontVariantNumeric)).toContain('tabular-nums');
});

test('OTP forced colors keeps structural focus and status cues', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/?view=otp&theme=light');
  const main = field(page, 'Código de acesso');
  const input = page.getByLabel('Código de acesso');
  await input.focus();
  await expect(input).toBeFocused();
  await input.fill('123456');
  await page.getByRole('button', { name: 'Simular erro', exact: true }).click();
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(main.getByRole('status')).toContainText('Código inválido');
  const colors = await main.locator('.es-otp-slot').first().evaluate(node => ({
    borderColor: getComputedStyle(node).borderColor,
    outlineColor: getComputedStyle(node).outlineColor,
  }));
  expect(colors.borderColor).toBeTruthy();
  expect(colors.outlineColor).toBeTruthy();
});

for (const theme of ['light', 'dark']) {
  test(`OTP success text and icon contrast ${theme}`, async ({ page }) => {
    await page.goto(`/?view=otp&theme=${theme}`);
    const main = field(page, 'Código de acesso');
    await page.getByLabel('Código de acesso').fill('123456');
    await page.getByRole('button', { name: 'Simular sucesso', exact: true }).click();
    await expect(main.locator('.es-otp-success-icon')).toBeVisible();
    const contrast = await main.getByRole('status').evaluate(node => {
      const parse = (color: string) => color.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
      const luminance = (color: number[]) => color.map(channel => channel / 255).map(channel => channel <= .03928 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4).reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
      const ratio = (foreground: string, background: string) => {
        const a = luminance(parse(foreground));
        const b = luminance(parse(background));
        return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
      };
      const root = node.closest('.es-root');
      const background = root ? getComputedStyle(root).backgroundColor : 'rgb(255, 255, 255)';
      const icon = node.querySelector('.es-otp-success-icon');
      return {
        text: ratio(getComputedStyle(node).color, background),
        icon: icon ? ratio(getComputedStyle(icon).color, background) : 0,
        background,
      };
    });
    expect(contrast.text).toBeGreaterThanOrEqual(4.5);
    expect(contrast.icon).toBeGreaterThanOrEqual(4.5);
  });
}

for (const theme of ['light', 'dark']) {
  test(`OTP evidence capture ${theme}`, async ({ page }, testInfo) => {
    await page.goto(`/?view=otp&theme=${theme}`);
    await page.getByLabel('Código de acesso').fill('123456');
    await page.getByRole('button', { name: 'Simular sucesso', exact: true }).click();
    await expect(field(page, 'Código de acesso').locator('.es-otp-success-icon')).toBeVisible();
    await page.screenshot({
      path: `apps/web/labs/espaco-library/evidence/otp/${testInfo.project.name}-${theme}.png`,
      fullPage: true,
    });
  });
}
