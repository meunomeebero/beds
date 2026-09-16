import { expect, test } from '@playwright/test';

const route = '/?view=disclosures';

test('broken avatar recovers to initials once, then retries on a changed source', async ({ page }) => {
  await page.goto(route);
  const profile = page.locator('.es-avatar--profile').first();
  await expect(profile).toHaveAttribute('aria-label', 'Marina Costa');
  await expect(profile).toHaveText('MC');
  // The broken URL must not render a broken-image frame or retry loop.
  const requests: string[] = [];
  page.on('request', request => { if (request.url().includes('quebrada')) requests.push(request.url()); });
  await page.waitForTimeout(300);
  expect(requests.length).toBeLessThanOrEqual(1);
  // A changed source retries from scratch (identity stays account-linked).
  await page.getByRole('button', { name: 'Trocar foto' }).click();
  await expect(profile.locator('img')).toHaveCount(1);
  // Account variant renders the recovered source with the same identity.
  await expect(page.locator('.es-avatar--account').first().locator('img')).toHaveCount(1);
});

test('DisclosureText adds the toggle only on measured overflow and keeps it after collapse', async ({ page }) => {
  await page.goto(route);
  const expanders = page.getByRole('button', { name: 'Ler mais' });
  // Short content: no toggle, full text present.
  await expect(page.getByText('Texto curto.', { exact: true })).toBeVisible();
  await expect(expanders).toHaveCount(1);
  // Long content: clamped at 2 lines, toggle reveals the full text.
  const long = page.locator('.es-disclosure-text').first();
  const clampedHeight = await long.evaluate(element => element.getBoundingClientRect().height);
  expect(clampedHeight).toBeLessThanOrEqual(40);
  await expanders.first().click();
  await expect(page.getByRole('button', { name: 'Ler menos' })).toBeVisible();
  const expandedHeight = await long.evaluate(element => element.getBoundingClientRect().height);
  expect(expandedHeight).toBeGreaterThan(clampedHeight + 20);
  await page.getByRole('button', { name: 'Ler menos' }).first().click();
  await expect(page.getByRole('button', { name: 'Ler mais' }).first()).toBeVisible();
  expect(await long.evaluate(element => element.getBoundingClientRect().height)).toBeLessThanOrEqual(40);
});

test('LabelField discloses the measured remainder with the real count, labels stay inert', async ({ page }, testInfo) => {
  await page.goto(route);
  const longField = page.locator('.es-label-field').first();
  // Labels never become buttons or filters.
  await expect(longField.locator('.es-label-field-item button, .es-label-field-item a')).toHaveCount(0);
  const hidden = await longField.getByRole('button', { name: /Ver todas/ }).textContent();
  expect(hidden).toMatch(/Ver todas \((\d+)\)/);
  const before = await longField.locator('.es-label-field-item:visible').count();
  await longField.getByRole('button', { name: /Ver todas/ }).click();
  await expect(longField.getByRole('button', { name: 'Mostrar menos' })).toBeVisible();
  const after = await longField.locator('.es-label-field-item:visible').count();
  expect(after).toBe(10);
  expect(after).toBeGreaterThan(before);
  await longField.getByRole('button', { name: 'Mostrar menos' }).click();
  await expect(longField.getByRole('button', { name: /Ver todas/ })).toBeVisible();
  // Short field: everything visible, no toggle.
  const shortField = page.locator('.es-label-field').filter({ hasText: 'Uma habilidade' });
  await expect(shortField.locator('.es-label-field-item')).toHaveCount(2);
  await expect(shortField.getByRole('button')).toHaveCount(0);
});

test('DisclosedRecords removes collapsed records from the document and reveals the real remainder', async ({ page }) => {
  await page.goto(route);
  const more = page.getByRole('button', { name: 'Ver registros anteriores (4)' });
  await expect(more).toBeVisible();
  await expect(page.getByText('Registro 4', { exact: true })).toHaveCount(0);
  await more.click();
  await expect(page.getByText('Registro 7', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Mostrar menos' }).click();
  await expect(page.getByText('Registro 4', { exact: true })).toHaveCount(0);
});

test('locked NavItem stays visible, non-interactive and explains itself', async ({ page }, testInfo) => {
  await page.goto(route);
  if (testInfo.project.name === 'mobile') await page.getByRole('button', { name: 'Navegação', exact: true }).click();
  const locked = page.getByRole('button', { name: /Fórum\. O fórum está disponível/ });
  await expect(locked).toBeDisabled();
  await expect(locked).toHaveAttribute('title', 'O fórum está disponível para contas com créditos ativos.');
  await expect(locked).toHaveCSS('opacity', '0.55');
  // Nearby unlocked rows keep working.
  await expect(page.getByRole('link', { name: 'Perfil', exact: true })).toBeVisible();
});

test('TextLink renders native semantics and external links are safe', async ({ page }) => {
  await page.goto(route);
  const external = page.getByRole('link', { name: 'Perfil público' });
  await expect(external).toHaveAttribute('href', 'https://example.com/perfil');
  await expect(external).toHaveAttribute('target', '_blank');
  await expect(external).toHaveAttribute('rel', /noopener/);
  const internal = page.getByRole('link', { name: 'Página interna' });
  await expect(internal).not.toHaveAttribute('target', '_blank');
  await expect(page.getByRole('link', { name: '+55 11 99999-9999' })).toHaveAttribute('href', 'tel:+5511999999999');
});
