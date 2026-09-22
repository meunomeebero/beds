import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const sourcePath = fileURLToPath(new URL('../src/lib/hooks/use-reduced-motion.ts', import.meta.url));

test('reduced-motion hook uses a stable external-store contract with an SSR false snapshot', async () => {
  const source = await readFile(sourcePath, 'utf8');

  assert.match(source, /useSyncExternalStore\(subscribe, getSnapshot, getServerSnapshot\)/);
  assert.match(source, /const getServerSnapshot = \(\) => false/);
  assert.match(source, /matchMedia\(REDUCED_MOTION_QUERY\)/);
  assert.match(source, /addEventListener\('change', onChange\)/);
  assert.match(source, /removeEventListener\('change', onChange\)/);
  assert.match(source, /addListener\?\.\(onChange\)/);
  assert.match(source, /removeListener\?\.\(onChange\)/);
});

test('components never read motion\'s useReducedMotion, which is null on the server and hydrates differently', async () => {
  const { readdir } = await import('node:fs/promises');
  const srcDir = fileURLToPath(new URL('../src/', import.meta.url));
  const offenders = [];
  for (const entry of await readdir(srcDir, { recursive: true })) {
    if (!/\.tsx?$/.test(entry)) continue;
    if (/\buseReducedMotion\b/.test(await readFile(srcDir + entry, 'utf8'))) offenders.push(entry);
  }
  assert.deepEqual(offenders, [], 'use useReducedMotionPreference from lib/hooks/use-reduced-motion');
});
