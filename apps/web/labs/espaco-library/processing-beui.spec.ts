import { expect, test, type Locator, type Page } from '@playwright/test';
import { processingFixtures, type ProcessingDemoKind } from './processing-fixtures';

const kinds: ProcessingDemoKind[] = ['analysis', 'optimization'];
const flows = {
  analysis: { view: 'analysis-loading', entry: 'Analisar um currículo', start: 'Iniciar análise de demonstração' },
  optimization: { view: 'optimization-loading', entry: 'Otimizar um currículo', start: 'Iniciar otimização de demonstração' },
} as const;

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.clock.install({ time: new Date('2026-09-19T12:00:00Z') });
});

async function start(page: Page, kind: ProcessingDemoKind, theme: 'light' | 'dark' = 'light') {
  const flow = flows[kind];
  await page.goto(`/?view=${flow.view}&theme=${theme}`);
  await expect(page.getByRole('heading', { name: flow.entry, exact: true })).toBeVisible();
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
  await page.getByRole('button', { name: flow.start, exact: true }).click();
  const screen = page.locator('.recipe-processing');
  await expect(screen).toHaveAttribute('data-state', 'running');
  return screen;
}

async function advanceToScores(page: Page, durationSeconds: number) {
  const target = durationSeconds * 1000 * .67 + 5000;
  for (let elapsed = 0; elapsed < target; elapsed += 5000) {
    await page.clock.runFor(Math.min(5000, target - elapsed));
  }
}

function scores(screen: Locator) {
  return screen.locator('.recipe-processing-scores');
}

test.describe('ProcessingView · beUI todo-list adaptation', () => {
  for (const kind of kinds) for (const theme of ['light', 'dark'] as const) {
    test(`${kind} ${theme} keeps final score text stable while ATS segments fill`, async ({ page }) => {
      const fixture = processingFixtures[kind];
      const screen = await start(page, kind, theme);
      await advanceToScores(page, fixture.durationSeconds);
      const scoreRegion = scores(screen);
      await expect(scoreRegion).toBeVisible();

      const expected = fixture.scores.map(score => String(score.value));
      const before = await scoreRegion.locator('.es-meter-label > span:last-child').allTextContents();
      expect(before).toEqual(expected);
      const ariaValues = await scoreRegion.locator('.es-segmented-bars').evaluateAll(elements => elements.map(element => element.getAttribute('aria-valuenow')));
      expect(ariaValues).toEqual(expected);
      const meter = scoreRegion.locator('.es-segmented-bars').first();
      expect(await meter.evaluate(element => getComputedStyle(element).clipPath)).toMatch(/inset/);

      await page.clock.runFor(120);
      await expect(scoreRegion.locator('.es-meter-label > span:last-child')).toHaveText(expected);
      expect(await meter.evaluate(element => getComputedStyle(element).clipPath)).toMatch(/inset/);
    });
  }

  test('pause freezes a segment fill and resume lets the visual finish without changing its value', async ({ page }) => {
    const fixture = processingFixtures.analysis;
    const screen = await start(page, 'analysis', 'dark');
    await advanceToScores(page, fixture.durationSeconds);
    const meter = scores(screen).locator('.es-segmented-bars').first();
    await expect(meter).toBeVisible();
    await page.clock.runFor(40);
    await screen.getByRole('button', { name: 'Pausar apresentação', exact: true }).click();
    await expect(screen).toHaveAttribute('data-motion-paused', 'true');
    const pausedClip = await meter.evaluate(element => getComputedStyle(element).clipPath);
    const pausedRightInset = Number(pausedClip.match(/inset\(0px ([\d.]+)%/)?.[1]);
    await page.clock.runFor(120);
    const currentRightInset = Number((await meter.evaluate(element => getComputedStyle(element).clipPath)).match(/inset\(0px ([\d.]+)%/)?.[1]);
    expect(currentRightInset).toBeCloseTo(pausedRightInset, 2);
    await screen.getByRole('button', { name: 'Retomar apresentação', exact: true }).click();
    await page.clock.runFor(120);
    const resumedRightInset = Number((await meter.evaluate(element => getComputedStyle(element).clipPath)).match(/inset\(0px ([\d.]+)%/)?.[1]);
    expect(resumedRightInset).toBeCloseTo(0, 2);
    await expect(meter).toHaveAttribute('aria-valuenow', String(fixture.scores[0].value));
  });

  test('terminal-first scores render fully filled without an entrance animation', async ({ page }) => {
    const screen = await start(page, 'analysis', 'dark');
    await page.getByRole('button', { name: 'Simular conclusão', exact: true }).click();
    await expect(screen).toHaveAttribute('data-state', 'success');
    await expect(screen).toHaveAttribute('data-motion-paused', 'true');
    const scoreRegion = scores(screen);
    await expect(scoreRegion).toBeVisible();
    for (const meter of await scoreRegion.locator('.es-segmented-bars').all()) {
      expect(await meter.evaluate(element => getComputedStyle(element).clipPath)).toMatch(/inset\(0px 0(?:\.0+)?%/);
      expect(await meter.evaluate(element => element.getAnimations().length)).toBe(0);
    }
  });

  test('reduced motion keeps the todo status marks and ATS fill static', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const fixture = processingFixtures.optimization;
    const screen = await start(page, 'optimization', 'light');
    await advanceToScores(page, fixture.durationSeconds);
    const scoreRegion = scores(screen);
    await expect(scoreRegion).toBeVisible();
    for (const meter of await scoreRegion.locator('.es-segmented-bars').all()) {
      expect(await meter.evaluate(element => getComputedStyle(element).clipPath)).toBe('none');
      expect(await meter.evaluate(element => element.getAnimations().length)).toBe(0);
    }
    for (const mark of await screen.locator('.recipe-processing-step-icon > span').all()) {
      expect(await mark.evaluate(element => getComputedStyle(element).transform)).toBe('none');
      expect(await mark.evaluate(element => element.getAnimations().length)).toBe(0);
    }
    expect(await screen.locator('.recipe-processing-transcript li').count()).toBe(fixture.chapters.length);
  });
});
