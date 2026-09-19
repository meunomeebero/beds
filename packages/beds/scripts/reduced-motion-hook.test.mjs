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
