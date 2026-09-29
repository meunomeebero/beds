import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * `DesignSystemProvider fieldBorder`: `default` keeps the functional-contrast boundary on every
 * text-entry control; `soft` gives them the structural card border instead. Marks (checkbox,
 * switch, radio) always keep the functional boundary, and focus / error stay legible.
 */

/** Computed colour of `--es-border` (structural) and `--es-control-border` (functional) in the page's theme. */
async function tokens(page: Page) {
  return page.evaluate(() => {
    const root = document.querySelector('.es-root')!;
    const paint = (token: string) => {
      const probe = document.createElement('div');
      probe.style.cssText = `position:absolute;visibility:hidden;border:1px solid var(${token})`;
      root.appendChild(probe);
      const color = getComputedStyle(probe).borderTopColor;
      probe.remove();
      return color;
    };
    return { soft: paint('--es-border'), strong: paint('--es-control-border') };
  });
}

const border = (locator: Locator) => locator.evaluate(element => getComputedStyle(element).borderTopColor);

function textEntry(page: Page) {
  return {
    field: page.getByLabel('Nome do produto (exemplo)'),
    area: page.getByLabel('Nota do produto (exemplo)'),
    select: page.locator('.es-select[data-variant="input"] > .es-select-trigger').first(),
    search: page.locator('label:has(> input[type="search"])').first(),
  };
}

for (const theme of ['light', 'dark'] as const) {
  test(`default keeps the functional border on every text-entry control in ${theme}`, async ({ page }) => {
    await page.goto(`/?view=components&theme=${theme}`);
    await expect(page.locator('.es-root')).not.toHaveAttribute('data-field-border', /.+/);
    const { strong, soft } = await tokens(page);
    expect(strong).not.toBe(soft);
    for (const [name, locator] of Object.entries(textEntry(page))) {
      expect(await border(locator), name).toBe(strong);
    }
  });

  test(`soft gives text-entry controls the card border but marks keep the functional one in ${theme}`, async ({ page }) => {
    await page.goto(`/?view=components&theme=${theme}&fieldBorder=soft`);
    await expect(page.locator('.es-root').first()).toHaveAttribute('data-field-border', 'soft');
    const { strong, soft } = await tokens(page);
    expect(soft).not.toBe(strong);
    for (const [name, locator] of Object.entries(textEntry(page))) {
      expect(await border(locator), name).toBe(soft);
    }
    // Marks are what distinguishes checked from unchecked: they never soften.
    await page.getByRole('checkbox', { name: /^Incluir detalhes/ }).uncheck();
    expect(await border(page.locator('.es-checkbox-box').first()), 'checkbox').toBe(strong);
    expect(await border(page.locator('[role="switch"] + span').first()), 'switch').toBe(strong);
  });

  test(`soft fields still show focus and error clearly in ${theme}`, async ({ page }) => {
    await page.goto(`/?view=components&theme=${theme}&fieldBorder=soft`);
    const { soft } = await tokens(page);
    const { field } = textEntry(page);
    await field.focus();
    await page.keyboard.press('Tab');
    await field.focus();
    expect(await border(field), 'focus-visible border').not.toBe(soft);
    await expect(field).toHaveCSS('box-shadow', /rgba?\(.+\) 0px 0px 0px 3px/);
    await field.fill('erro');
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await page.locator('body').click({ position: { x: 4, y: 4 } });
    expect(await border(field), 'invalid border').not.toBe(soft);
  });

  test(`OTP slots and the file dropzone follow fieldBorder in ${theme}`, async ({ page }) => {
    // `purpose=default` selects the generic dropzone; the `document` purpose already uses the structural border.
    for (const [query, selector] of [['view=otp', '.es-otp-slot'], ['view=upload&purpose=default', '.es-file-dropzone']] as const) {
      await page.goto(`/?${query}&theme=${theme}`);
      const base = await tokens(page);
      expect(await border(page.locator(selector).first()), `${query} default`).toBe(base.strong);
      await page.goto(`/?${query}&theme=${theme}&fieldBorder=soft`);
      const soft = await tokens(page);
      expect(await border(page.locator(selector).first()), `${query} soft`).toBe(soft.soft);
    }
  });

  test(`the document dropzone keeps its structural border in both modes in ${theme}`, async ({ page }) => {
    for (const suffix of ['', '&fieldBorder=soft']) {
      await page.goto(`/?view=upload&theme=${theme}${suffix}`);
      const { soft } = await tokens(page);
      expect(await border(page.locator('.es-file-dropzone').first()), `document${suffix}`).toBe(soft);
    }
  });
}
