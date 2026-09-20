import { createServer, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import { mkdtemp, rm } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const repoRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const feedbackSource = readFileSync(`${repoRoot}/packages/beds/src/feedback.tsx`, 'utf8');
const numberTickerSource = readFileSync(`${repoRoot}/packages/beds/src/number-ticker.tsx`, 'utf8');

async function withPublicLibrary<T>(render: (library: Record<string, any>) => T | Promise<T>) {
  const cacheDir = await mkdtemp(join(tmpdir(), 'beds-ber42-numeric-truth-'));
  let server: ViteDevServer | undefined;
  try {
    let cssModuleId = 0;
    server = await createServer({
      root: repoRoot,
      configFile: false,
      cacheDir,
      plugins: [react(), {
        name: 'ber42-numeric-truth-css-stub',
        enforce: 'pre',
        resolveId(source) { return source.endsWith('.css') ? `\0ber42-numeric-truth-css-${cssModuleId++}` : undefined; },
        load(id) { return id.startsWith('\0ber42-numeric-truth-css-') ? 'export default {};' : undefined; },
      }],
      resolve: { dedupe: ['react', 'react-dom'] },
    });
    const library = await server.ssrLoadModule('/packages/beds/src/index.ts') as Record<string, any>;
    return await render(library);
  } finally {
    if (server) await server.close();
    await rm(cacheDir, { recursive: true, force: true });
  }
}

function traceValues(trace: string | null) {
  return (trace ?? '').split(',').filter(Boolean).map(Number);
}

test('AnimatedNumber applies a post-mount reduced-motion change before a live update', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/?view=animated-number&theme=dark');
  const value = page.locator('.es-animated-number');

  await page.getByRole('button', { name: 'Pronto', exact: true }).click();
  await expect(value).toHaveText('42');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Atualizar 84', exact: true }).click();
  await expect(value).toHaveText('84', { timeout: 500 });
});

test('AnimatedNumber keeps unavailable and invalid states truthful', async ({ page }) => {
  await page.goto('/?view=animated-number&theme=light');
  const value = page.locator('.es-animated-number');

  await page.getByRole('button', { name: 'Inválido', exact: true }).click();
  await expect(value).toHaveText('Indisponível');
  expect(await value.getAttribute('data-frame-trace')).not.toContain('NaN');

  await page.getByRole('button', { name: 'Pronto', exact: true }).click();
  await expect(value).toHaveText('42');
  expect(traceValues(await value.getAttribute('data-frame-trace'))).not.toContain(0);
});

test('Metric and SegmentedMeter expose truthful unavailable states in the catalog', async ({ page }) => {
  await page.goto('/?view=components&theme=dark&brand=reference');
  await expect(page.getByRole('heading', { name: 'Componentes', exact: true })).toBeVisible();

  const metric = page.locator('.es-metric').first();
  await expect(metric.locator('strong')).toHaveText('128');

  const meter = page.locator('.es-segmented-meter').filter({ hasText: 'Medidor neutro' }).first();
  await page.getByRole('button', { name: 'Sem dado', exact: true }).click();
  await expect(meter.locator('.es-meter-label')).toContainText('—');
  await expect(meter.locator('[aria-valuenow]')).toHaveCount(0);
});

test('public NumberTicker renders one accessible fallback for every non-finite value in SSR', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'SSR contract runs once; browser behavior is covered by both projects.');
  await withPublicLibrary(library => {
    for (const invalid of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const markup = renderToStaticMarkup(React.createElement(library.NumberTicker, {
        value: invalid,
        prefix: '$',
        suffix: ' USD',
        format: () => { throw new Error('NumberTicker format must not run for non-finite input.'); },
      }));
      expect(markup).toBe('<span class="inline-flex items-center tabular-nums">—</span>');
    }
  });
});

test('public SegmentedMeter exposes aria-valuetext only for an available ratio in SSR', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'SSR contract runs once; browser behavior is covered by both projects.');
  await withPublicLibrary(library => {
    const available = renderToStaticMarkup(React.createElement(library.SegmentedMeter, {
      label: 'Créditos',
      value: 7,
      max: 10,
      valueText: '7 de 10 créditos',
    }));
    expect(available).toContain('aria-valuetext="7 de 10 créditos"');

    const unavailable = renderToStaticMarkup(React.createElement(library.SegmentedMeter, {
      label: 'Créditos',
      value: null,
      max: 10,
      valueText: '7 de 10 créditos',
    }));
    expect(unavailable).not.toContain('aria-valuetext=');
    expect(unavailable).not.toContain('aria-valuenow=');
  });
});

test('Metric keeps numeric animation typed and never reconstructs it from display text', () => {
  expect(feedbackSource).toContain('numericValue?: number;');
  expect(feedbackSource).toContain('formatValue?: (value: number) => string;');
  expect(feedbackSource).toContain('Number.isFinite(numericValue)');
  expect(feedbackSource).not.toMatch(/parseFloat\s*\(|Number\s*\(\s*value\s*\)/);
});

test('SegmentedMeter forwards an explicit valueText only for an available ratio', () => {
  expect(feedbackSource).toContain('valueText?: string');
  expect(feedbackSource).toContain('valueText={ratio === null ? undefined : valueText}');
});

test('NumberTicker has a localized finite-value boundary before numeric derivation', () => {
  const finiteGuard = numberTickerSource.indexOf('const finite = Number.isFinite(value);');
  const roundedValue = numberTickerSource.indexOf('const rounded = Math.round(value);');
  const fallback = numberTickerSource.indexOf('className="inline-flex items-center tabular-nums">—</span>');
  const glyphDerivation = numberTickerSource.indexOf('const glyphs = useMemo');
  const timeoutGuard = numberTickerSource.indexOf('if (!finite || !armed || entered) return;');
  const normalMarkup = numberTickerSource.indexOf('\n  return (', fallback);

  expect(finiteGuard).toBeGreaterThanOrEqual(0);
  expect(roundedValue).toBeGreaterThan(finiteGuard);
  expect(fallback).toBeGreaterThan(glyphDerivation);
  expect(fallback).toBeLessThan(normalMarkup);
  expect(timeoutGuard).toBeGreaterThanOrEqual(0);
});
