import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark'] as const) {
  test(`data patterns are controlled and readable in ${theme}`, async ({ page }, info) => {
    const pageErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto(`/data-patterns.html?theme=${theme}`);
    await expect(page.getByRole('heading', { name: 'Padrões de dados', exact: true })).toBeVisible();
    await expect(page.locator('.es-root')).toHaveAttribute('data-theme', theme);
    await expect(page.getByRole('table', { name: 'Projetos de exemplo' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Itens', exact: true })).toHaveCSS('text-align', 'right');
    await expect(page.getByText('Fluxo de integração com um título deliberadamente longo para validar quebra de texto', { exact: true })).toHaveCSS('overflow-wrap', 'anywhere');
    await expect(page.getByLabel('Não disponível')).toBeVisible();
    const table = page.getByRole('table', { name: 'Projetos de exemplo' });
    await expect(table).toHaveCSS('min-width', '640px');
    expect(await table.evaluate(element => element.getBoundingClientRect().width)).toBeGreaterThanOrEqual(640);
    await expect(page.locator('.es-data-table-scroll')).toHaveCSS('overflow-x', 'auto');
    const scrollRegion = page.locator('.es-data-table-scroll');
    await expect(scrollRegion).toHaveCount(1);
    const overflows = await scrollRegion.evaluate(element => element.scrollWidth > element.clientWidth);
    expect(overflows).toBe(info.project.name === 'mobile');
    await expect(scrollRegion).toHaveAttribute('tabindex', overflows ? '0' : '-1');
    expect(await scrollRegion.evaluate(element => element.scrollLeft)).toBe(0);
    if (overflows) {
      await scrollRegion.focus();
      await expect(scrollRegion).toBeFocused();
      await scrollRegion.press('ArrowRight');
      await expect.poll(() => scrollRegion.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
    }

    await page.getByRole('button', { name: 'Carregar', exact: true }).click();
    await expect(page.getByRole('table', { name: 'Projetos de exemplo' })).toHaveAttribute('aria-busy', 'true');
    await expect(page.getByRole('table', { name: 'Projetos de exemplo' }).getByRole('status')).toContainText('Carregando projetos de exemplo');
    await page.getByRole('button', { name: 'Mostrar vazio', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Nenhum projeto de exemplo', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Adicionar projeto de exemplo', exact: true }).click();
    await expect(page.getByRole('row')).toHaveCount(3);
    await page.getByRole('button', { name: 'Mostrar erro', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Não foi possível mostrar os projetos');
    await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
    await expect(page.getByRole('row')).toHaveCount(3);

    const pagination = page.getByRole('navigation', { name: 'Paginação dos projetos de exemplo', exact: true });
    await expect(pagination.locator('.es-pagination-summary')).toHaveAttribute('aria-live', 'polite');
    await expect(pagination).toContainText('Página 2 de 3');
    await pagination.getByRole('button', { name: 'Próxima', exact: true }).click();
    await expect(pagination).toContainText('Página 3 de 3');
    await expect(pagination.getByRole('button', { name: 'Próxima', exact: true })).toBeDisabled();
    await pagination.getByRole('button', { name: 'Anterior', exact: true }).click();
    await expect(pagination).toContainText('Página 2 de 3');
    await expect(page.locator('input[type="checkbox"], input[type="radio"], [aria-sort]')).toHaveCount(0);

    const rail = page.getByRole('region', { name: 'Trilho manual de exemplos', exact: true });
    await expect(rail).toHaveCSS('overflow-x', 'auto');
    await expect(rail.getByText('Primeiro cartão de exemplo', { exact: true })).toBeVisible();
    expect(await rail.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true);
    await expect(rail).toHaveAttribute('tabindex', '0');
    await rail.focus();
    await rail.press('ArrowRight');
    await expect.poll(() => rail.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
    await expect(page.getByRole('heading', { name: 'Atividade de exemplo', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Fila de exemplo', exact: true })).toBeVisible();
    await expect(page.locator('.es-collection-card')).toHaveCount(5);
    await expect(page.locator('.es-activity-panel')).toHaveCount(2);
    await expect(page.getByRole('region', { name: 'Atividade de exemplo', exact: true }).locator(':scope > .es-divider')).toHaveCount(0);
    await expect(page.getByRole('region', { name: 'Fila de exemplo', exact: true }).locator(':scope > .es-divider')).toHaveCount(1);

    const toggle = page.getByRole('button', { name: 'Selecionar item de exemplo', exact: true });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');

    const list = page.getByRole('region', { name: '10 itens da fila de exemplo', exact: true });
    await expect(list.getByText('Item 10 da fila de exemplo', { exact: true })).toBeVisible();
    await expect(list).toHaveCSS('overflow-y', 'auto');
    expect(await list.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true);
    await expect(list).toHaveAttribute('tabindex', '0');
    await list.focus();
    await list.press('ArrowDown');
    await expect.poll(() => list.evaluate(element => element.scrollTop)).toBeGreaterThan(0);

    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    expect(pageErrors).toEqual([]);
    await page.screenshot({ path: info.outputPath(`data-patterns-${theme}.png`), fullPage: true });
  });

  test(`data table remains contained in RTL and a 200% zoom proxy in ${theme}`, async ({ page }) => {
    await page.goto(`/data-patterns.html?theme=${theme}`);
    const root = page.locator('.es-root');
    const dataTable = page.locator('.es-data-table');
    const scrollRegion = page.locator('.es-data-table-scroll');

    await dataTable.evaluate(element => element.setAttribute('dir', 'rtl'));
    await expect(dataTable).toHaveAttribute('dir', 'rtl');
    expect(await page.evaluate(() => document.body.scrollWidth > innerWidth)).toBe(false);
    const rtlOverflows = await scrollRegion.evaluate(element => element.scrollWidth > element.clientWidth);
    await expect(scrollRegion).toHaveAttribute('tabindex', rtlOverflows ? '0' : '-1');
    if (rtlOverflows) {
      await scrollRegion.focus();
      await expect(scrollRegion).toBeFocused();
    }

    await root.evaluate(element => {
      (element as HTMLElement).style.zoom = '2';
    });
    expect(await page.evaluate(() => document.body.scrollWidth > innerWidth)).toBe(false);
    await expect(page.getByRole('table', { name: 'Projetos de exemplo' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Paginação dos projetos de exemplo', exact: true })).toBeVisible();
  });

  test(`data patterns remain usable with forced colors in ${theme}`, async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    await page.goto(`/data-patterns.html?theme=${theme}`);

    const table = page.getByRole('table', { name: 'Projetos de exemplo' });
    const pagination = page.getByRole('navigation', { name: 'Paginação dos projetos de exemplo', exact: true });
    await expect(table).toBeVisible();
    await expect(pagination.locator('.es-pagination-summary')).toHaveAttribute('aria-live', 'polite');
    await pagination.getByRole('button', { name: 'Próxima', exact: true }).focus();
    await expect(pagination.getByRole('button', { name: 'Próxima', exact: true })).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });

  test(`pagination normalizes invalid values and derives a consistent summary in ${theme}`, async ({ page }) => {
    for (const { pageValue, pageCount, summary, nextSummary } of [
      { pageValue: '0', pageCount: '3', summary: 'Página 1 de 3', nextSummary: 'Página 2 de 3' },
      { pageValue: '-2', pageCount: '3', summary: 'Página 1 de 3', nextSummary: 'Página 2 de 3' },
      { pageValue: 'Infinity', pageCount: '3', summary: 'Página 1 de 3', nextSummary: 'Página 2 de 3' },
      { pageValue: 'NaN', pageCount: '3', summary: 'Página 1 de 3', nextSummary: 'Página 2 de 3' },
      { pageValue: '1.7', pageCount: '3.8', summary: 'Página 1 de 3', nextSummary: 'Página 2 de 3' },
      { pageValue: '2', pageCount: 'Infinity', summary: 'Página 1 de 1', nextSummary: undefined },
      { pageValue: '2', pageCount: 'NaN', summary: 'Página 1 de 1', nextSummary: undefined },
    ]) {
      await page.goto(`/data-patterns.html?theme=${theme}&page=${pageValue}&pageCount=${pageCount}`);
      const pagination = page.getByRole('navigation', { name: 'Paginação dos projetos de exemplo', exact: true });
      await expect(pagination.locator('.es-pagination-summary')).toHaveAttribute('aria-live', 'polite');
      await expect(pagination).toContainText(summary);
      const next = pagination.getByRole('button', { name: 'Próxima', exact: true });
      if (nextSummary) {
        await expect(pagination.getByRole('button', { name: 'Anterior', exact: true })).toBeDisabled();
        await next.click();
        await expect(pagination).toContainText(nextSummary);
      } else {
        await expect(pagination.getByRole('button', { name: 'Anterior', exact: true })).toBeDisabled();
        await expect(next).toBeDisabled();
      }
    }
  });
}
