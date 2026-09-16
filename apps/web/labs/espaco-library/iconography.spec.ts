import { expect, test, type Locator, type Page } from '@playwright/test';
import { createElement, type ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BarChart3, Briefcase, ChartColumn, ChevronRight, Coins, FileText, Globe, Home, House, MessageCircle, Plug, Plus, Sparkles, UserRound, type LucideProps } from 'lucide-react';

type Glyph = ComponentType<LucideProps>;

function markup(glyph: Glyph) { return renderToStaticMarkup(createElement(glyph, { strokeWidth: 1.5 })); }

async function expectGlyph(icon: Locator, glyph: Glyph, size: number) {
  await expect(icon).toHaveClass(/\blucide\b/);
  await expect(icon).toHaveAttribute('viewBox', '0 0 24 24');
  await expect(icon).toHaveAttribute('stroke-width', '1.5');
  await expect(icon).toHaveCSS('stroke-width', '1.5px');
  await expect(icon).toHaveCSS('width', `${size}px`);
  await expect(icon).toHaveCSS('height', `${size}px`);
  await expect(icon).toHaveAttribute('aria-hidden', 'true');
  const shapes = await icon.evaluate((element, expectedMarkup) => {
    const expected = new DOMParser().parseFromString(expectedMarkup, 'image/svg+xml').documentElement;
    const signature = (root: Element) => [...root.querySelectorAll('path,rect,circle,line,polyline,polygon,ellipse')].map(shape => ({
      tag: shape.tagName,
      geometry: Object.fromEntries([...shape.attributes].filter(attribute => ['d', 'points', 'x', 'y', 'x1', 'x2', 'y1', 'y2', 'width', 'height', 'cx', 'cy', 'r', 'rx', 'ry'].includes(attribute.name)).map(attribute => [attribute.name, attribute.value])),
    }));
    return { actual: signature(element), expected: signature(expected) };
  }, markup(glyph));
  expect(shapes.actual).toEqual(shapes.expected);
}

async function openSidebar(page: Page, label: string) {
  const opener = page.getByRole('button', { name: label, exact: true });
  if (await opener.isVisible()) await opener.click();
}

for (const theme of ['dark', 'light'] as const) {
  test(`Lucide iconography is shared by Lucy and catalog in ${theme}`, async ({ page }) => {
    await page.goto(`/?view=lucy&theme=${theme}`);
    await expect(page.getByRole('heading', { name: 'Como você prefere começar?' })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);

    const choices = page.locator('.es-chat-option-icon');
    await expect(choices).toHaveCount(3);
    for (const [index, glyph] of [Globe, MessageCircle, FileText].entries()) {
      await expectGlyph(choices.nth(index).locator('svg'), glyph, 16);
    }
    await openSidebar(page, 'Navegação');
    const sidebar = page.locator('.es-sidebar');
    for (const item of [
      { label: 'Início', glyph: House }, { label: 'Lucy', glyph: MessageCircle },
      { label: 'Próximo passo na carreira', glyph: MessageCircle },
      { label: 'Análises', glyph: ChartColumn }, { label: 'LinkedIn', glyph: UserRound },
      { label: 'Candidaturas', glyph: Briefcase }, { label: '8 créditos', glyph: Coins },
    ]) await expectGlyph(sidebar.getByRole('button', { name: item.label, exact: true }).locator('svg'), item.glyph, 16);
    await expect(sidebar).toHaveCSS('width', '264px');
    await expect(page.locator('.es-root')).toHaveCSS('font-family', /Espaco Inter/);
    await expect(sidebar).toHaveCSS('background-color', theme === 'dark' ? 'rgb(25, 25, 25)' : 'rgb(251, 250, 249)');

    await page.goto(`/?view=components&theme=${theme}`);
    await expect(page.getByRole('heading', { name: 'Componentes', exact: true })).toBeVisible();
    const iconDemo = page.locator('.es-surface').filter({ has: page.getByRole('heading', { name: 'Icon · Avatar · BrandMark', exact: true }) });
    for (const [index, entry] of [{ glyph: Home, size: 14 }, { glyph: Plus, size: 16 }, { glyph: ChevronRight, size: 12 }, { glyph: Sparkles, size: 20 }].entries()) {
      await expectGlyph(iconDemo.locator('.es-icon').nth(index), entry.glyph, entry.size);
    }
    const integration = page.locator('.es-integration-row').filter({ has: page.getByRole('heading', { name: 'Integração de exemplo', exact: true }) });
    await expectGlyph(integration.locator('.es-integration-mark svg'), Plug, 20);
    await openSidebar(page, 'Navigation');
    await expectGlyph(page.locator('.es-sidebar').getByRole('button', { name: 'Medidas da referência', exact: true }).locator('svg'), BarChart3, 16);
    await expect(page.locator('svg.es-icon:not(.lucide)')).toHaveCount(0);
    const divergentStrokes = await page.locator('svg.es-icon').evaluateAll(icons => icons.filter(icon => icon.getAttribute('stroke-width') !== '1.5' || getComputedStyle(icon).strokeWidth !== '1.5px').map(icon => icon.getAttribute('class')));
    expect(divergentStrokes).toEqual([]);
  });
}
