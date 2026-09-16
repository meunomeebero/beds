import { expect, test, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const evidence = fileURLToPath(new URL('./evidence/empty-state/', import.meta.url));
async function choose(page: Page, option: string) {
  await page.getByRole('button', { name: /^Situação:/ }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
}

test('real catalog entry, independent action and interruptible decorative flight', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/?view=chat&theme=dark');
  if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Navigation', exact: true }).click();
  await page.getByRole('button', { name: 'Estado vazio', exact: true }).click();
  await choose(page, 'Sem candidaturas');
  const card = page.getByRole('article', { name: 'Sua primeira candidatura começa aqui' });
  const art = card.locator('.es-empty-folder');
  const fly = art.locator('.es-empty-folder-fly').first();
  const pause = art.getByRole('button', { name: 'Pausar animação' });
  await pause.scrollIntoViewIfNeeded();
  await expect(art).toHaveAttribute('data-paused', 'false');
  await expect(fly).toHaveCSS('animation-play-state', 'running');
  await expect(card.getByRole('img')).toHaveCount(0);
  const before = await fly.evaluate(el => getComputedStyle(el).transform);
  await expect.poll(() => fly.evaluate(el => getComputedStyle(el).transform)).not.toBe(before);
  await pause.focus();
  await pause.press('Enter');
  const resume = art.getByRole('button', { name: 'Retomar animação' });
  await expect(resume).toBeFocused();
  await expect(fly).toHaveCSS('animation-play-state', 'paused');
  const frozen = await fly.evaluate(el => getComputedStyle(el).transform);
  await page.waitForTimeout(150);
  expect(await fly.evaluate(el => getComputedStyle(el).transform)).toBe(frozen);
  expect((await resume.boundingBox())!.height).toBeGreaterThanOrEqual(info.project.name === 'mobile' ? 44 : 32);
  await resume.press('Shift+Tab');
  const action = card.getByRole('button', { name: 'Buscar vagas' });
  await expect(action).toBeFocused();
  await action.press('Enter');
  await expect(page.getByRole('status')).toContainText('Nenhuma consulta foi enviada');
  await expect(fly).toHaveCSS('animation-play-state', 'paused');
  await resume.click();
  await expect(fly).toHaveCSS('animation-play-state', 'running');
  await choose(page, 'Sem vagas');
  await page.getByRole('button', { name: 'Rever filtros', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Revisão de filtros selecionada');
  await page.getByRole('button', { name: 'Restaurar exemplo' }).click();
  await expect(page.locator('.es-empty-folder')).toHaveCount(0);
  await choose(page, 'Sem candidaturas');
  await expect(page.locator('.es-empty-folder-fly').first()).toHaveCSS('animation-name', 'es-empty-folder-flight-one');
  expect(errors).toEqual([]);
});

test('both themes, narrow/long content, reduced motion, zoom and forced colors', async ({ page }, info) => {
  for (const theme of ['light', 'dark']) {
    await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'none' });
    await page.goto('/?view=empty-state&preview=folder&theme=' + theme + '&brand=curriculol');
    const card = page.getByRole('article');
    const art = card.locator('.es-empty-folder');
    await expect(art.getByRole('button')).toHaveCount(0);
    await expect(art.locator('.es-empty-folder-fly').first()).toHaveCSS('animation-name', 'none');
    await expect(art.locator('.es-empty-folder-wings').first()).toHaveCSS('animation-name', 'none');
    await card.screenshot({ path: evidence + `${info.project.name}-${theme}-folder.png` });
    await choose(page, 'Pasta com texto longo');
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await card.scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await card.evaluate(el => [...el.querySelectorAll('h2,p,button')].every(child => child.scrollWidth <= child.clientWidth + 1))).toBe(true);
    }
    await page.evaluate(() => { document.documentElement.style.zoom = '2'; document.documentElement.dir = 'rtl'; });
    await card.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await card.screenshot({ path: evidence + `${info.project.name}-${theme}-folder-zoom.png` });
    await page.emulateMedia({ forcedColors: 'active' });
    await expect(art.locator('svg').first()).toBeHidden();
    const action = card.getByRole('button', { name: /Explorar oportunidades/ });
    await action.focus();
    await action.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(action).toBeFocused();
    await expect(action).toHaveCSS('outline-style', 'solid');
    await page.evaluate(() => { document.documentElement.style.zoom = ''; document.documentElement.dir = ''; });
  }
});

test('offscreen and hidden-document guards preserve a deliberate pause', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/?view=empty-state&preview=folder&theme=dark');
  const art = page.locator('.es-empty-folder');
  await art.scrollIntoViewIfNeeded();
  await expect(art).toHaveAttribute('data-paused', 'false');
  // Synthetic visibility events exercise the same lifecycle used by real tabs.
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(art).toHaveAttribute('data-paused', 'true');
  await page.evaluate(() => { delete (document as unknown as { visibilityState?: string }).visibilityState; document.dispatchEvent(new Event('visibilitychange')); });
  await expect(art).toHaveAttribute('data-paused', 'false');
  await art.getByRole('button', { name: 'Pausar animação' }).click();
  await page.setViewportSize({ width: 390, height: 240 });
  await page.getByRole('heading', { name: 'Um pouco de espaço' }).scrollIntoViewIfNeeded();
  await expect.poll(() => art.evaluate(el => el.getBoundingClientRect().top >= innerHeight)).toBe(true);
  await art.scrollIntoViewIfNeeded();
  await expect(art).toHaveAttribute('data-paused', 'true');
  await art.getByRole('button', { name: 'Retomar animação' }).click();
  await expect(art).toHaveAttribute('data-paused', 'false');
  await page.getByRole('heading', { name: 'Um pouco de espaço' }).scrollIntoViewIfNeeded();
  await expect(art).toHaveAttribute('data-paused', 'true');
  await art.scrollIntoViewIfNeeded();
  await expect(art).toHaveAttribute('data-paused', 'false');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(art.locator('.es-empty-folder-fly').first()).toHaveCSS('animation-name', 'none');
});
