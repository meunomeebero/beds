import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const controlsPath = fileURLToPath(new URL('../src/controls.tsx', import.meta.url));

async function controlClass(name) {
  const source = await readFile(controlsPath, 'utf8');
  const match = source.match(new RegExp(`const ${name} = '([^']*)';`));
  assert.ok(match, `Expected ${name} to be declared`);
  return match[1];
}

test('SegmentedControl remains option-sized until constrained by its container', async () => {
  for (const name of ['SEGMENTED_PILL', 'SEGMENTED_JOINED']) {
    const classes = await controlClass(name);
    assert.match(classes, /\bw-fit\b/);
    assert.match(classes, /\bmax-w-full\b/);
    assert.match(classes, /\boverflow-x-auto\b/);
  }
});

test('Tabs use the semantic muted text role and visibly distinguish disabled tabs', async () => {
  const activity = await controlClass('TABS_TAB_ACTIVITY');
  const connection = await controlClass('TABS_TAB_CONNECTION');
  const source = await readFile(controlsPath, 'utf8');

  assert.match(activity, /\btext-muted-foreground\b/);
  assert.doesNotMatch(activity, /\btext-secondary\b/);
  for (const classes of [activity, connection]) {
    assert.match(classes, /\bdisabled:opacity-50\b/);
    assert.match(classes, /\bdisabled:cursor-not-allowed\b/);
  }
  assert.match(source, /es-settings-tab[^']*disabled:opacity-50/);
  assert.match(source, /disabled=\{item\.disabled\}/);
});
