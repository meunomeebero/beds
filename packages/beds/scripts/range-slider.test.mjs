import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));
const sourcePath = fileURLToPath(new URL('../src/range-slider.tsx', import.meta.url));

async function withRangeSlider(run) {
  const cacheDir = await mkdtemp(join(tmpdir(), 'beds-range-slider-'));
  let server;
  try {
    server = await createServer({ root: repoRoot, configFile: false, cacheDir, plugins: [react()], resolve: { dedupe: ['react', 'react-dom'] } });
    const [numeric, component] = await Promise.all([
      server.ssrLoadModule('/packages/beds/src/lib/range-slider.ts'),
      server.ssrLoadModule('/packages/beds/src/range-slider.tsx'),
    ]);
    return await run({ numeric, RangeSlider: component.RangeSlider });
  } finally {
    await server?.close();
    await rm(cacheDir, { recursive: true, force: true });
  }
}

test('off-grid maxima use one effective grid for controlled, uncontrolled and callback candidates', async () => {
  await withRangeSlider(async ({ numeric, RangeSlider }) => {
    const bounds = numeric.getRangeSliderBounds(0, 10, 6);
    assert.deepEqual(bounds, { min: 0, max: 6, step: 6 });
    assert.equal(numeric.normalizeRangeSliderValue(10, bounds), 6, 'candidate reported to onValueChange is legal');

    const props = { label: 'Units', min: 0, max: 10, step: 6, formatValue: value => `${value} units` };
    const controlled = renderToStaticMarkup(React.createElement(RangeSlider, { ...props, value: 10 }));
    const uncontrolled = renderToStaticMarkup(React.createElement(RangeSlider, { ...props, defaultValue: 10 }));
    for (const markup of [controlled, uncontrolled]) {
      assert.match(markup, /max="6"/);
      assert.match(markup, /value="6"/);
      assert.match(markup, /aria-valuetext="6 units"/);
      assert.match(markup, /<bdi>6 units<\/bdi>/);
    }
  });

  const source = await (await import('node:fs/promises')).readFile(sourcePath, 'utf8');
  assert.match(source, /const next = normalizeRangeSliderValue\(event\.currentTarget\.valueAsNumber, bounds\)/);
  assert.match(source, /onValueChange\?\.\(next\)/);
});
