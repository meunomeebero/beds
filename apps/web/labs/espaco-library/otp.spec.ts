import { test, expect, type Locator, type Page } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import { fileURLToPath } from 'node:url';

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

type DigitFrame = { text: string; y: number; blur: number; opacity: number; transform: string; filter: string };

async function readDigitFrame(locator: Locator): Promise<DigitFrame> {
  return locator.evaluate(node => {
    const style = getComputedStyle(node);
    const matrix = new DOMMatrixReadOnly(style.transform);
    const blur = Number(style.filter.match(/blur\(([-\d.]+)px\)/)?.[1] ?? 0);
    return { text: node.textContent ?? '', y: matrix.m42, blur, opacity: Number(style.opacity), transform: style.transform, filter: style.filter };
  });
}

async function readDigitFrames(locator: Locator): Promise<DigitFrame[]> {
  return locator.evaluateAll(nodes => nodes.map(node => {
    const style = getComputedStyle(node);
    const matrix = new DOMMatrixReadOnly(style.transform);
    const blur = Number(style.filter.match(/blur\(([-\d.]+)px\)/)?.[1] ?? 0);
    return { text: node.textContent ?? '', y: matrix.m42, blur, opacity: Number(style.opacity), transform: style.transform, filter: style.filter };
  }));
}

async function readIconFrame(locator: Locator) {
  return locator.evaluate(node => {
    const style = getComputedStyle(node);
    const matrix = new DOMMatrixReadOnly(style.transform);
    return { scale: matrix.a, opacity: Number(style.opacity), transform: style.transform };
  });
}

async function readTranslateX(locator: Locator) {
  return locator.evaluate(node => new DOMMatrixReadOnly(getComputedStyle(node).transform).m41);
}

async function readCaretOpacities(locator: Locator, duration: number) {
  return locator.evaluate(async (node, sampleDuration) => {
    const values: number[] = [];
    const start = performance.now();
    while (performance.now() - start < sampleDuration) {
      values.push(Number(getComputedStyle(node).opacity));
      await new Promise(requestAnimationFrame);
    }
    return values;
  }, duration);
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

test('OTP digit entry enforces y, blur and opacity, then settles to the same identity', async ({ page }) => {
  await page.goto('/?view=otp&theme=dark');
  const main = field(page, 'Código de acesso');
  const input = page.getByLabel('Código de acesso');
  const slot = main.locator('.es-otp-slot').first();
  await input.fill('1');
  const digit = slot.locator('.es-otp-digit');
  await expect(digit).toHaveCount(1);
  const entering = await readDigitFrame(digit);
  expect(entering.text).toBe('1');
  expect(entering.y).toBeGreaterThan(0.1);
  expect(entering.blur).toBeGreaterThan(0.1);
  expect(entering.opacity).toBeLessThan(1);
  await page.waitForTimeout(280);
  const settled = await readDigitFrame(digit);
  expect(settled.text).toBe(entering.text);
  expect(settled.y).toBeCloseTo(0, 1);
  expect(settled.blur).toBeCloseTo(0, 1);
  expect(settled.opacity).toBe(1);
  expect(settled.transform).toBe('none');
  expect(settled.filter).toBe('blur(0px)');
});

test('OTP rapid digit replacement and removal preserve intermediate exits and settled identity', async ({ page }) => {
  await page.goto('/?view=otp&theme=light');
  const main = field(page, 'Código de acesso');
  const input = page.getByLabel('Código de acesso');
  const slot = main.locator('.es-otp-slot').first();
  await input.fill('1');
  await page.waitForTimeout(280);

  await input.fill('2');
  await expect(slot.locator('.es-otp-digit')).toHaveCount(2);
  const replacing = await readDigitFrames(slot.locator('.es-otp-digit'));
  const oldDigit = replacing.find(frame => frame.text === '1');
  const newDigit = replacing.find(frame => frame.text === '2');
  expect(oldDigit).toBeDefined();
  expect(newDigit).toBeDefined();
  expect(oldDigit!.y).toBeLessThan(-0.1);
  expect(oldDigit!.blur).toBeGreaterThan(0.1);
  expect(oldDigit!.opacity).toBeLessThan(1);
  expect(newDigit!.y).toBeGreaterThan(0.1);
  expect(newDigit!.blur).toBeGreaterThan(0.1);
  expect(newDigit!.opacity).toBeLessThan(1);
  await page.waitForTimeout(280);
  await expect(slot.locator('.es-otp-digit')).toHaveCount(1);
  const replaced = await readDigitFrame(slot.locator('.es-otp-digit'));
  expect(replaced.text).toBe('2');
  expect(replaced.y).toBeCloseTo(0, 1);
  expect(replaced.blur).toBeCloseTo(0, 1);
  expect(replaced.opacity).toBe(1);

  await input.fill('');
  await page.waitForTimeout(32);
  await expect(slot.locator('.es-otp-digit')).toHaveCount(1);
  const removing = await readDigitFrame(slot.locator('.es-otp-digit'));
  expect(removing.text).toBe('2');
  expect(removing.y).toBeLessThan(-0.1);
  expect(removing.blur).toBeGreaterThan(0.1);
  expect(removing.opacity).toBeLessThan(1);
  await page.waitForTimeout(280);
  await expect(slot.locator('.es-otp-digit')).toHaveCount(0);
  await expect(slot.locator('.es-otp-placeholder')).toHaveCount(1);
});

test('OTP repeated error and recovery replays the shake and clears the invalid state', async ({ page }) => {
  await page.goto('/?view=otp&theme=dark');
  const main = field(page, 'Código de acesso');
  const input = page.getByLabel('Código de acesso');
  const group = main.locator('.es-otp-group').first();
  const error = page.getByRole('button', { name: 'Simular erro', exact: true });

  await input.fill('123456');
  await error.click();
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await page.waitForTimeout(48);
  expect(Math.abs(await readTranslateX(group))).toBeGreaterThan(0.1);
  await page.waitForTimeout(500);
  expect(await readTranslateX(group)).toBeCloseTo(0, 1);

  await input.press('End');
  await input.press('Backspace');
  await input.press('4');
  await expect(input).toHaveAttribute('aria-invalid', 'false');
  await error.click();
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await page.waitForTimeout(48);
  expect(Math.abs(await readTranslateX(group))).toBeGreaterThan(0.1);
  await page.waitForTimeout(500);
  expect(await readTranslateX(group)).toBeCloseTo(0, 1);

  await input.fill('');
  await input.fill('111111');
  await expect(input).toHaveAttribute('aria-invalid', 'false');
});

test('OTP success presence exposes entrance, exit and interruption intermediate frames', async ({ page }) => {
  await page.goto('/?view=otp&theme=dark');
  const main = field(page, 'Código de acesso');
  const input = page.getByLabel('Código de acesso');
  const success = page.getByRole('button', { name: 'Simular sucesso', exact: true });
  const error = page.getByRole('button', { name: 'Simular erro', exact: true });
  const icon = main.locator('.es-otp-success-icon');
  await input.fill('123456');

  await success.click();
  await expect(icon).toBeVisible();
  await page.waitForTimeout(32);
  const entering = await readIconFrame(icon);
  expect(entering.scale).toBeLessThan(1);
  expect(entering.opacity).toBeLessThan(1);
  await page.waitForTimeout(500);
  const settled = await readIconFrame(icon);
  expect(settled.scale).toBeCloseTo(1, 2);
  expect(settled.opacity).toBe(1);

  await error.click();
  await expect(icon).toHaveCount(1);
  await page.waitForTimeout(32);
  const exiting = await readIconFrame(icon);
  expect(exiting.scale).toBeLessThan(1);
  expect(exiting.opacity).toBeLessThan(1);
  await expect(icon).toHaveCount(0);

  await success.click();
  await page.waitForTimeout(32);
  await error.click();
  await expect(icon).toHaveCount(1);
  await page.waitForTimeout(32);
  const interruptedExit = await readIconFrame(icon);
  expect(interruptedExit.scale).toBeLessThan(1);
  expect(interruptedExit.opacity).toBeLessThan(1);
  await success.click();
  await expect(icon).toBeVisible();
  await page.waitForTimeout(32);
  const interruptedReentry = await readIconFrame(icon);
  expect(interruptedReentry.scale).toBeLessThan(1);
  expect(interruptedReentry.opacity).toBeLessThan(1);
  await page.waitForTimeout(500);
  const reentered = await readIconFrame(icon);
  expect(reentered.scale).toBeCloseTo(1, 2);
  expect(reentered.opacity).toBe(1);
  await expect(main.locator('.es-otp-success-icon')).toHaveCount(1);
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

test('OTP delayed controlled acceptance keeps the caller value until it accepts', async ({ page }) => {
  await page.goto('/?view=otp&fixture=delayed&theme=light');
  const input = page.getByLabel('Código com aceitação atrasada');
  await input.fill('1');
  await page.waitForTimeout(48);
  await expect(input).toHaveValue('');
  await expect(field(page, 'Código com aceitação atrasada').locator('.es-otp-digit')).toHaveCount(0);
  await page.waitForTimeout(140);
  await expect(input).toHaveValue('1');
  await expect(field(page, 'Código com aceitação atrasada').locator('.es-otp-digit')).toHaveText('1');
});

test('OTP normal caret blinks while reduced caret remains static', async ({ page }) => {
  await page.goto('/?view=otp&theme=dark');
  const input = page.getByLabel('Código de acesso');
  await input.focus();
  const caret = field(page, 'Código de acesso').locator('.es-otp-caret').first();
  await expect(caret).toHaveCount(1);
  const normal = await readCaretOpacities(caret, 1100);
  expect(Math.min(...normal)).toBeLessThan(0.9);
  expect(Math.max(...normal)).toBeGreaterThan(0.99);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await input.focus();
  const reducedCaret = field(page, 'Código de acesso').locator('.es-otp-caret').first();
  await expect(reducedCaret).toHaveCount(1);
  const reduced = await readCaretOpacities(reducedCaret, 300);
  expect(reduced.every(opacity => opacity === 1)).toBe(true);
});

test('OTP reduced motion settles digit, icon and shake across frames', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?view=otp&theme=light');
  const main = field(page, 'Código de acesso');
  const input = page.getByLabel('Código de acesso');
  await input.fill('1');
  const digit = main.locator('.es-otp-slot').first().locator('.es-otp-digit');
  const digitNow = await readDigitFrame(digit);
  await page.waitForTimeout(220);
  const digitLater = await readDigitFrame(digit);
  for (const frame of [digitNow, digitLater]) {
    expect(frame.y).toBeCloseTo(0, 1);
    expect(frame.blur).toBeCloseTo(0, 1);
    expect(frame.opacity).toBe(1);
  }

  await page.getByRole('button', { name: 'Simular erro', exact: true }).click();
  const group = main.locator('.es-otp-group').first();
  const shakeNow = await readTranslateX(group);
  await page.waitForTimeout(220);
  const shakeLater = await readTranslateX(group);
  expect(shakeNow).toBeCloseTo(0, 1);
  expect(shakeLater).toBeCloseTo(0, 1);

  await page.getByRole('button', { name: 'Simular sucesso', exact: true }).click();
  const icon = main.locator('.es-otp-success-icon');
  await expect(icon).toBeVisible();
  const iconNow = await readIconFrame(icon);
  await page.waitForTimeout(220);
  const iconLater = await readIconFrame(icon);
  for (const frame of [iconNow, iconLater]) {
    expect(frame.scale).toBeCloseTo(1, 2);
    expect(frame.opacity).toBe(1);
  }
});

test('OTP controlled instances hydrate from renderToString without warnings', async ({ page }) => {
  const viteConfig = fileURLToPath(new URL('./vite.config.ts', import.meta.url));
  const repoRoot = fileURLToPath(new URL('../../../../', import.meta.url));
  const hydrationPage = '/apps/web/labs/espaco-library/otp-hydration.html';
  const server = await createServer({ root: repoRoot, configFile: viteConfig, server: { host: '127.0.0.1', port: 0, strictPort: false } });
  await server.listen();
  try {
    const module = await server.ssrLoadModule('/apps/web/labs/espaco-library/otp-hydration-server.ts') as { renderOtpHydrationProbe: () => string };
    const address = server.httpServer?.address();
    if (!address || typeof address === 'string') throw new Error('Expected the OTP hydration Vite server to expose a TCP address.');
    const errors: string[] = [];
    page.on('console', message => { if (message.type() === 'error' || /warning/i.test(message.text())) errors.push(message.text()); });
    page.on('pageerror', error => errors.push(error.message));
    const origin = `http://127.0.0.1:${address.port}`;
    await page.goto(`${origin}${hydrationPage}`);
    await page.evaluate(markup => {
      document.getElementById('otp-hydration-root')!.innerHTML = markup;
      (window as Window & { __otpHydrationMarkupReady?: boolean }).__otpHydrationMarkupReady = true;
      window.dispatchEvent(new Event('otp-hydration-markup-ready'));
    }, module.renderOtpHydrationProbe());
    await page.waitForFunction(() => (window as Window & { __otpHydrationComplete?: boolean }).__otpHydrationComplete === true);
    expect(errors).toEqual([]);
    const inputs = page.locator('.es-otp-field input');
    await expect(inputs).toHaveCount(2);
    await expect(page.getByLabel('SSR código principal')).toHaveValue('123456');
    await expect(page.getByLabel('SSR código secundário')).toHaveValue('12');
    const ids = await inputs.evaluateAll(nodes => nodes.map(node => node.id));
    expect(new Set(ids).size).toBe(2);
    for (const id of ids) await expect(page.locator(`label[for="${id}"]`)).toHaveCount(1);
  } finally {
    await (server as ViteDevServer).close();
  }
});

test('OTP CSS zoom proxy is identified separately from real browser zoom', async ({ page }) => {
  test.info().annotations.push({ type: 'limitation', description: 'CSS zoom:2 proxy only; native browser zoom and physical devices remain unverified.' });
  await page.goto('/?view=otp&theme=dark');
  await page.evaluate(() => { document.body.style.zoom = '2'; });
  const main = field(page, 'Código de acesso');
  await expect(main.locator('.es-otp-slot')).toHaveCount(6);
  expect(await main.locator('.es-otp-slot').first().evaluate(node => getComputedStyle(node).fontVariantNumeric)).toContain('tabular-nums');
});

test('OTP forced colors preserves the active focus ring and status cues', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/?view=otp&theme=light');
  const main = field(page, 'Código de acesso');
  const input = page.getByLabel('Código de acesso');
  await input.focus();
  await expect(input).toBeFocused();
  const activeSlot = main.locator('.es-otp-slot[data-active="true"]');
  await expect(activeSlot).toHaveCount(1);
  const focus = await activeSlot.evaluate(node => {
    const style = getComputedStyle(node);
    return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth, outlineColor: style.outlineColor };
  });
  expect(focus.outlineStyle).toBe('solid');
  expect(focus.outlineWidth).toBe('2px');
  expect(focus.outlineColor).not.toBe('transparent');
  await input.fill('123456');
  await page.getByRole('button', { name: 'Simular erro', exact: true }).click();
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(main.getByRole('status')).toContainText('Código inválido');
  await expect(main.locator('.es-otp-slot').first()).toHaveCSS('border-color', /rgb|rgba/);
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
