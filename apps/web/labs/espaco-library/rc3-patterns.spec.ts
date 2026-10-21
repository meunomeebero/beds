import { expect, test } from '@playwright/test';

test('score board: only a celebrated gain shows "+N"; no pair shows no number', async ({ page }) => {
  await page.goto('/?view=result-patterns&theme=light');
  const boards = page.locator('.es-score-board');
  await expect(boards).toHaveCount(3);
  await expect(boards.nth(0).locator('.es-score-board-gain')).toHaveCount(1);
  await expect(boards.nth(1).locator('.es-score-board-gain')).toHaveCount(0);
  await expect(boards.nth(1).locator('.es-score-meter [data-state=gain]')).toHaveCount(0);
  await expect(boards.nth(1).locator('b[data-up]')).toHaveCount(0);
  await expect(boards.nth(2).locator('.es-score-board-number')).toHaveCount(0);
  await expect(boards.nth(2)).toContainText('O crédito voltou');
  await expect(boards.nth(0).locator('.es-sr-only')).toHaveText(/Antes 51, agora 72/);
  await expect(boards.nth(0).locator('.es-score-board-number')).toHaveText(/^72/, { timeout: 8000 });
});

test('choice chips answer each tap; locked stays checked; yes/no saves per row', async ({ page }) => {
  await page.goto('/?view=result-patterns&theme=dark');
  const group = page.getByRole('group', { name: 'O pedido cita, o documento não mostra' });
  const figma = group.getByRole('checkbox', { name: 'Figma' });
  await expect(figma).toBeChecked();
  await group.getByRole('checkbox', { name: 'Acessibilidade' }).press('Space');
  await expect(group.getByRole('checkbox', { name: 'Acessibilidade' })).toBeChecked();
  await expect(page.locator('.es-choice-status').first()).toContainText('2 itens confirmados');
  await expect(group.getByRole('checkbox', { name: /Design tokens/ })).toBeDisabled();
  await page.getByRole('radio', { name: 'Sim' }).nth(1).check();
  await expect(page.getByRole('radio', { name: 'Sim' }).nth(1)).toBeChecked();
});

test('coupon applies on Enter without leaving the page; the board scrolls sideways on phones', async ({ page }, info) => {
  await page.goto('/?view=commerce&theme=light');
  await page.getByRole('button', { name: 'Tem um cupom?' }).first().click();
  const field = page.getByRole('textbox', { name: 'Cupom de desconto' }).first();
  await expect(field).toBeFocused();
  await field.fill('bemvindo');
  await field.press('Enter');
  await expect(page).toHaveURL(/view=commerce/);
  await expect(page.getByText('BEMVINDO aplicado', { exact: false }).first()).toBeVisible();
  if (info.project.name !== 'mobile') return;
  await page.goto('/?view=kanban&theme=dark');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.locator('.es-kanban').evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true);
});
