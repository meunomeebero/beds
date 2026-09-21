import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark'] as const) {
  test(`Badge keeps compact tag geometry and tone markers in ${theme}`, async ({ page }) => {
    await page.goto(`/?view=components&theme=${theme}`);
    await expect(page.getByRole('heading', { name: 'Componentes', exact: true })).toBeVisible();

    const badges = page.locator('.es-badge[data-purpose="tag"]');
    await expect(badges).toHaveCount(6);
    await expect(badges.first()).toHaveCSS('border-radius', '4px');
    await expect(badges.first()).toHaveCSS('padding', '1px 5px');
    await expect(badges.first()).toHaveCSS('font-size', '12px');
    await expect(badges.first()).toHaveCSS('line-height', '16px');

    const tones = await badges.evaluateAll(elements => elements.map(element => ({
      tone: element.getAttribute('data-tone'),
      purpose: element.getAttribute('data-purpose'),
      text: element.textContent?.trim(),
      label: element.querySelector('.es-badge-label')?.textContent?.trim(),
    })));
    expect(tones.filter(item => item.purpose === 'tag').map(item => item.tone)).toEqual(expect.arrayContaining(['neutral', 'success', 'warning', 'error', 'info']));
    expect(tones.every(item => item.text === item.label)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test(`Badge preserves status anatomy and reduced-motion behavior in ${theme}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/?view=application-card&theme=${theme}`);

    const statuses = page.locator('.es-badge[data-purpose="status"]');
    await expect(statuses).toHaveCount(9);
    for (const status of await statuses.all()) {
      await expect(status).toHaveCSS('font-size', '12px');
      await expect(status).toHaveCSS('line-height', '18px');
      await expect(status).toHaveCSS('font-weight', '400');
      await expect(status).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(status).toHaveCSS('border-top-width', '0px');
      await expect(status.locator('.es-badge-label')).toHaveCount(1);
      await expect(status.locator('.es-badge-marker')).toHaveCount(1);
      await expect(status.locator('.es-badge-marker-dot')).toHaveCount(1);
      await expect(status.locator('.es-badge-marker-dot')).toHaveCSS('width', '6px');
      await expect(status).toHaveCSS('box-shadow', 'none');
      const markerState = await status.evaluate(element => {
        const pseudo = getComputedStyle(element, '::before');
        const marker = getComputedStyle(element.querySelector<HTMLElement>('.es-badge-marker-dot')!);
        return { pseudoWidth: pseudo.width, pseudoBackground: pseudo.backgroundColor, pseudoVisibility: pseudo.visibility, markerBackground: marker.backgroundColor };
      });
      expect(markerState.pseudoWidth).toBe('6px');
      expect(markerState.pseudoBackground).toBe('rgba(0, 0, 0, 0)');
      expect(markerState.pseudoVisibility).toBe('hidden');
      expect(markerState.markerBackground).not.toBe('rgba(0, 0, 0, 0)');
      expect(await status.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
    }

    const motionState = await statuses.first().locator('.es-badge-label > span:not(.es-badge-marker)').evaluate(element => ({
      animationName: getComputedStyle(element).animationName,
      filter: getComputedStyle(element).filter,
    }));
    expect(motionState.animationName).toBe('none');
    expect(motionState.filter).toBe('none');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  for (const reducedMotion of [false, true]) {
    test(`Badge rolls its status label on card transition in ${theme} (${reducedMotion ? 'reduced' : 'full'} motion)`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: reducedMotion ? 'reduce' : 'no-preference' });
      await page.goto(`/?view=application-card&theme=${theme}`);

      const card = page.getByRole('article').first();
      const badge = card.locator('.recipe-application-status .es-badge');
      await expect(badge.locator('.es-badge-label')).toHaveText('Pronta para enviar');
      await expect(badge.locator('.es-badge-marker-dot')).toHaveCount(1);

      await card.getByRole('button', { name: 'Marcar como enviada' }).click();
      await expect(badge.locator('.es-badge-label')).toHaveText('Enviada');
      await expect(badge.getByText('Pronta para enviar', { exact: true })).toHaveCount(0);
      await expect(badge.locator('.es-badge-label > span:not(.es-badge-marker)')).toHaveCount(1);
      await expect(badge.locator('.es-badge-marker')).toHaveCount(1);
      await expect(badge.locator('.es-badge-marker-dot')).toHaveCount(1);
      await expect(badge.locator('.es-badge-marker-dot')).toHaveAttribute('data-tone', 'success');
      await expect(card).toContainText('Enviada');

      const motionState = await badge.locator('.es-badge-label > span:not(.es-badge-marker)').evaluate(element => ({
        animationName: getComputedStyle(element).animationName,
        filter: getComputedStyle(element).filter,
        transform: getComputedStyle(element).transform,
      }));
      expect(motionState.animationName).toBe('none');
      if (reducedMotion) {
        expect(motionState.filter).toBe('none');
        expect(motionState.transform).toBe('none');
      }
    });
  }
}
