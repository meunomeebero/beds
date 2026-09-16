import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  test(`OTP entry and recovery ${theme}`, async ({ page }) => {
    await page.goto(`/?view=otp&theme=${theme}`);
    const input = page.getByLabel('Código de acesso');
    const slots = await page.locator('.es-otp-slot').evaluateAll(nodes => nodes.map(node => { const r = node.getBoundingClientRect(); return { y:r.y, width:r.width }; }));
    expect(slots).toHaveLength(6);
    expect(new Set(slots.map(slot => slot.y)).size).toBe(1);
    expect(slots.every(slot => slot.width >= 24)).toBe(true);
    await input.fill('123456');
    await expect(input).toHaveValue('123456');
    await expect(input).toHaveAttribute('autocomplete', 'one-time-code');
    await page.getByRole('button', { name: 'Simular erro', exact: true }).click();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await input.focus();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('654321');
    await expect(input).toHaveAttribute('aria-invalid', 'false');
    await page.getByRole('button', { name: 'Simular verificação', exact: true }).click();
    await expect(input).toHaveAttribute('readonly', '');
    await page.getByRole('button', { name: 'Limpar', exact: true }).click();
    await input.focus();
    await page.keyboard.type('123');
    await page.keyboard.press('Backspace');
    await expect(input).toHaveValue('12');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `/tmp/beds-otp-${theme}-${test.info().project.name}.png` });
  });
}
