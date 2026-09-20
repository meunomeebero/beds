import { expect, test, type Locator } from '@playwright/test';

async function readMotionState(node: Locator) {
  return node.evaluate(element => {
    const descendants = [element, ...Array.from(element.querySelectorAll('*'))];
    return {
      runningAnimations: element.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length,
      transforms: descendants.map(item => getComputedStyle(item).transform).filter(value => value !== 'none' && !/^matrix(?:3d)?\(1(?:, 0){3,}/.test(value)),
      filters: descendants.map(item => getComputedStyle(item).filter).filter(value => value !== 'none' && value !== 'blur(0px)'),
    };
  });
}

for (const theme of ['light', 'dark'] as const) {
  test(`Badge responds to a mounted reduced-motion preference change in ${theme}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(`/?view=application-card&theme=${theme}`);

    const card = page.getByRole('article').first();
    const badge = card.locator('.es-application-status .es-badge');
    const label = badge.locator('.es-badge-label');
    await expect(label).toHaveText('Pronta para enviar');
    await expect.poll(() => page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(false);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect.poll(() => page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);

    await card.getByRole('button', { name: 'Marcar como enviada', exact: true }).click();
    await expect(label).toHaveText('Enviada');
    await expect(badge.getByText('Pronta para enviar', { exact: true })).toHaveCount(0);

    const reducedState = await readMotionState(badge);
    expect(reducedState.runningAnimations).toBe(0);
    expect(reducedState.transforms).toEqual([]);
    expect(reducedState.filters).toEqual([]);
  });
}

test('Feedback states retain redundant names and honest indeterminate semantics', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?view=components&theme=dark');

  const statusDots = page.locator('.es-status-dot');
  await expect(statusDots).toHaveCount(4);
  for (const dot of await statusDots.all()) {
    await expect(dot).toHaveRole('img');
    await expect(dot).toHaveAccessibleName(/.+/);
    await expect(dot).toHaveAttribute('data-status', /.+/);
  }

  const notice = page.locator('.es-notice').first();
  await expect(notice).toHaveRole('status');
  await expect(notice).toHaveAccessibleName('Estado demonstrativo');
  await expect(notice).toHaveAccessibleDescription('Esta mensagem pode ser dispensada.');
  const dismiss = notice.getByRole('button', { name: 'Dismiss notification', exact: true });
  await dismiss.focus();
  await expect(dismiss).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(notice).toHaveCount(0);

  const loading = page.getByRole('status', { name: 'Carregamento demonstrativo', exact: true });
  await expect(loading).toBeVisible();
  await expect(loading).not.toHaveAttribute('aria-valuenow', /.+/);
  await expect(loading.locator('svg')).toHaveCSS('transform', 'none');
  expect(await loading.innerText()).not.toMatch(/\d/);

  const skeletons = page.locator('.es-skeleton');
  await expect(skeletons).toHaveCount(3);
  for (const skeleton of await skeletons.all()) {
    await expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    await expect(skeleton).not.toHaveAttribute('role', /.+/);
  }
});

test('EmptyStateCard keeps one truthful media path and an explicit local action', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?view=empty-state&preview=folder&theme=light');

  const card = page.locator('.es-empty-state-card');
  await expect(card).toHaveCount(1);
  await expect(card.locator('.es-empty-folder')).toHaveCount(1);
  await expect(card.locator('.es-empty-folder-art')).toHaveAttribute('aria-hidden', 'true');

  const action = card.getByRole('button', { name: 'Buscar vagas', exact: true });
  await expect(action).toBeVisible();
  await expect(action).not.toHaveAttribute('aria-busy', 'true');
  await action.focus();
  await expect(action).toBeFocused();
  await action.click();
  await expect(page.getByText('Busca de vagas selecionada nesta demonstração. Nenhuma consulta foi enviada.', { exact: true })).toBeVisible();
});
