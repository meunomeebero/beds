import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('form and processing recipes do not resize reused BEDS controls through native selectors', async () => {
  const onboarding = await readFile(new URL('../onboarding.css', import.meta.url), 'utf8');
  const checkout = await readFile(new URL('../checkout.css', import.meta.url), 'utf8');
  const processing = await readFile(new URL('../processing.css', import.meta.url), 'utf8');
  assert.doesNotMatch(onboarding, /\.recipe-onboarding-fields\s+(?:input|textarea)/);
  assert.doesNotMatch(onboarding, /\.recipe-onboarding-actions\s+button/);
  assert.doesNotMatch(checkout, /\.recipe-checkout\s+(?:input|button)\b/);
  assert.doesNotMatch(processing, /\.recipe-processing\s+:is\(\.recipe-processing-actions,\.recipe-processing-playback\)\s*>\s*button/);
  assert.match(onboarding, /\.recipe-onboarding-actions\s*\{[^}]*flex-direction:\s*column/);
});
