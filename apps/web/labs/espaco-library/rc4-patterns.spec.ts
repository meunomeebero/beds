import { expect, test } from '@playwright/test';

test('section editor: one card open, chip input refuses a repeat, save closes the card', async ({ page }) => {
  await page.goto('/?view=document-editor&theme=light&pane=side');
  await page.getByRole('button', { name: 'Editar Competências' }).click();
  const field = page.getByRole('textbox', { name: 'Novo item' });
  await field.fill('figma');
  await field.press('Enter');
  await expect(page.getByText('Este item já está na lista.')).toBeVisible();
  await field.fill('Roteiros de teste');
  await field.press('Enter');
  await expect(page.getByRole('button', { name: 'Remover Roteiros de teste' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Salvar também no perfil' })).toBeVisible();
  // Another card while dirty asks before discarding.
  await page.getByRole('button', { name: 'Editar Idiomas' }).click();
  await expect(page.getByRole('dialog', { name: 'Descartar as alterações?' })).toBeVisible();
  await page.getByRole('button', { name: 'Continuar editando' }).click();
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(page.getByRole('button', { name: 'Editar Competências' })).toBeVisible();
  await expect(page.locator('.es-doc-sheet')).toContainText('Roteiros de teste');
});

test('rating strip: a star only selects; the receipt takes focus and a low score asks what next', async ({ page }) => {
  await page.goto('/?view=document-editor&theme=dark&pane=side');
  const submit = page.getByRole('button', { name: 'Enviar avaliação' });
  await expect(submit).toBeDisabled();
  await page.getByRole('radio', { name: '2 estrelas' }).check({ force: true });
  await submit.click();
  await expect(page.getByRole('status').filter({ hasText: 'Avaliação enviada.' })).toBeFocused();
  await expect(page.getByRole('button', { name: 'Revisar seções' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Envie feedback' })).toBeVisible();
});

test('board drag: pointer drop moves a card into an allowed stage; keyboard picks up, moves and drops', async ({ page }, info) => {
  test.skip(info.project.name === 'mobile', 'pointer drag measured on desktop; phones use the 250ms touch hold');
  await page.goto('/?view=kanban&theme=light');
  const saved = page.locator('[data-kanban-column="saved"]');
  await expect(saved.locator('[data-kanban-card]')).toHaveCount(2);
  const handle = page.getByRole('button', { name: 'Arrastar Product designer sênior' });
  const from = (await handle.boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + 20, from.y + 10, { steps: 3 });
  const target = (await saved.locator('.es-kanban-cards').boundingBox())!;
  await page.mouse.move(target.x + target.width / 2, target.y + 20, { steps: 15 });
  await expect(page.locator('.es-kanban-slot')).toHaveCount(1);
  await expect(page.locator('.es-kanban-overlay')).toHaveCount(1);
  await page.mouse.up();
  await expect(saved.locator('[data-kanban-card]')).toHaveCount(3);
  await expect(saved.locator('[data-kanban-card]').first()).toHaveAttribute('data-kanban-card', 'atelie');

  // Keyboard: Space picks up, ArrowDown chooses the next position, Space drops (a reorder inside the stage).
  const keyboardHandle = page.getByRole('button', { name: 'Arrastar Product designer', exact: true });
  await keyboardHandle.focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowDown');
  await expect(page.getByText('Solte na posição 3 de Para enviar.')).toBeAttached();
  await page.keyboard.press('Space');
  await expect(saved.locator('[data-kanban-card]').nth(2)).toHaveAttribute('data-kanban-card', 'norte');
});

test('deferrals closed: pressed chip toggles, quiet link with a dot, struck list price', async ({ page }) => {
  await page.goto('/?view=editing&theme=light');
  const chip = page.getByRole('button', { name: 'AutoCAD' });
  await expect(chip).toHaveAttribute('aria-pressed', 'false');
  await chip.click();
  await expect(chip).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.es-link-button[data-purpose=quiet][data-dot] .es-link-dot')).toHaveCount(1);
  await page.goto('/?view=commerce&theme=dark');
  await expect(page.locator('s.es-struck-price')).toHaveText('R$ 59,00');
  await expect(page.locator('s.es-struck-price')).toHaveAttribute('aria-hidden', 'true');
});
