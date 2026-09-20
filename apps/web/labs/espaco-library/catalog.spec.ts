import { expect, test, type Page } from '@playwright/test';

const catalogQuery = 'view=components&theme=dark&brand=curriculol&ber10=1&ber11=1&preserve=1';

function rgb(value: string) {
  const channels = value.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  if (!channels || channels.length !== 3) throw new Error(`Expected an opaque RGB color, received ${value}.`);
  return channels;
}

function luminance(value: number[]) {
  return value.slice(0, 3).map(channel => channel / 255).map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4).reduce((sum, channel, index) => sum + channel * [.2126, .7152, .0722][index], 0);
}

function contrastRatio(foreground: string, background: string) {
  const [lighter, darker] = [luminance(rgb(foreground)), luminance(rgb(background))].sort((left, right) => right - left);
  return (lighter + .05) / (darker + .05);
}

async function waitForCatalog(page: Page) {
  await expect(page.getByRole('heading', { name: 'Componentes', exact: true })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(700);
}

async function openNavigationOnMobile(page: Page) {
  const toggle = page.getByRole('button', { name: 'Navigation', exact: true });
  if (await toggle.isVisible()) await toggle.click();
}

async function expectNoPageOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({ innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(dimensions.scrollWidth, JSON.stringify(dimensions)).toBeLessThanOrEqual(dimensions.innerWidth);
}

test('catalog links preserve context and native history semantics', async ({ page }) => {
  const pageErrors: string[] = [];
  const unexpectedRequests: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('request', request => {
    const url = new URL(request.url());
    if (!['127.0.0.1', 'localhost'].includes(url.hostname) || !['GET', 'HEAD'].includes(request.method())) unexpectedRequests.push(`${request.method()} ${url.origin}${url.pathname}`);
  });

  await page.goto(`/?${catalogQuery}`);
  await waitForCatalog(page);
  const historyBeforeTheme = await page.evaluate(() => history.length);
  await page.getByRole('button', { name: 'Light', exact: true }).first().click();
  await expect(page.locator('.es-root')).toHaveAttribute('data-theme', 'light');
  expect(new URL(page.url()).searchParams.get('theme')).toBe('light');
  expect(await page.evaluate(() => history.length)).toBe(historyBeforeTheme);
  await openNavigationOnMobile(page);
  expect(await page.getByRole('link', { name: 'Quadro de vagas', exact: true }).count()).toBe(1);

  const historyBeforeReplace = await page.evaluate(() => history.length);
  await page.getByRole('button', { name: 'Tokens', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Tokens', exact: true })).toBeVisible();
  const replaced = new URL(page.url());
  expect(replaced.searchParams.get('view')).toBe('tokens');
  expect(replaced.searchParams.get('theme')).toBe('light');
  expect(replaced.searchParams.get('brand')).toBe('curriculol');
  expect(replaced.searchParams.get('ber10')).toBe('1');
  expect(replaced.searchParams.get('ber11')).toBe('1');
  expect(replaced.searchParams.get('preserve')).toBe('1');
  expect(await page.evaluate(() => history.length)).toBe(historyBeforeReplace);

  await page.goto(`/?${catalogQuery}`);
  await waitForCatalog(page);
  await openNavigationOnMobile(page);
  const kanban = page.getByRole('link', { name: 'Quadro de vagas', exact: true });
  const linkUrl = new URL(await kanban.getAttribute('href') ?? '', page.url());
  expect(linkUrl.searchParams.get('view')).toBe('kanban');
  expect(linkUrl.searchParams.get('theme')).toBe('dark');
  expect(linkUrl.searchParams.get('brand')).toBe('curriculol');
  expect(linkUrl.searchParams.get('ber10')).toBe('1');
  expect(linkUrl.searchParams.get('ber11')).toBe('1');
  expect(linkUrl.searchParams.get('preserve')).toBe('1');
  await kanban.click();
  await expect(page).toHaveURL(/view=kanban/);
  const forwardUrl = new URL(page.url());
  expect(forwardUrl.searchParams.get('brand')).toBe('curriculol');
  expect(forwardUrl.searchParams.get('ber10')).toBe('1');
  expect(forwardUrl.searchParams.get('ber11')).toBe('1');
  expect(forwardUrl.searchParams.get('preserve')).toBe('1');
  await page.goBack();
  await waitForCatalog(page);
  expect(new URL(page.url()).search).toBe(`?${catalogQuery}`);
  await page.goForward();
  await expect(page).toHaveURL(/view=kanban/);
  expect(new URL(page.url()).search).toBe(forwardUrl.search);

  expect(pageErrors).toEqual([]);
  expect(unexpectedRequests).toEqual([]);
});

test('catalog stays legible and bounded across themes and responsive widths', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The desktop project owns the explicit viewport matrix; mobile owns touch and drawer semantics.');
  for (const theme of ['light', 'dark'] as const) {
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ forcedColors: 'none', reducedMotion: 'no-preference' });
      await page.goto(`/?view=components&theme=${theme}&brand=reference`);
      await waitForCatalog(page);
      await expectNoPageOverflow(page);
      const heading = page.getByRole('heading', { name: 'Componentes', exact: true });
      const bounds = await heading.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      const colors = await heading.evaluate(element => ({ foreground: getComputedStyle(element).color, background: getComputedStyle(element.closest('.es-root')!).backgroundColor }));
      expect(contrastRatio(colors.foreground, colors.background), `${theme} ${width}px heading`).toBeGreaterThanOrEqual(4.5);
      if (width === 390) {
        const navigation = page.getByRole('button', { name: 'Navigation', exact: true });
        expect((await navigation.boundingBox())?.height).toBeGreaterThanOrEqual(44);
      }
    }
  }

  await page.setViewportSize({ width: 640, height: 1000 });
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.goto('/?view=components&theme=dark&brand=reference&ber10=1&ber11=1');
  await waitForCatalog(page);
  await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
  await expectNoPageOverflow(page);
  expect(await page.getByRole('heading', { name: 'Componentes', exact: true }).evaluate(element => getComputedStyle(element).direction)).toBe('rtl');
  expect(await page.locator('.es-nav-item').first().evaluate(element => getComputedStyle(element).transitionDuration)).toBe('0s');
  await page.emulateMedia({ forcedColors: 'none', reducedMotion: 'no-preference' });
  await page.evaluate(() => { document.documentElement.dir = 'ltr'; document.documentElement.style.zoom = '2'; });
  const zoomDiagnostic = await page.evaluate(() => ({ innerWidth, scrollWidth: document.documentElement.scrollWidth, zoom: document.documentElement.style.zoom }));
  await testInfo.attach('catalog-200-percent-zoom-proxy', { body: JSON.stringify(zoomDiagnostic, null, 2), contentType: 'application/json' });
  expect(zoomDiagnostic.zoom).toBe('2');
});
