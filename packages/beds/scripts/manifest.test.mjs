import test from 'node:test';
import assert from 'node:assert/strict';
import { buildManifest } from './build-manifest.mjs';

const manifest = await buildManifest();
const component = name => manifest.components.find(entry => entry.name === name);

test('manifest lists every public component with props and a doc', () => {
  assert.equal(manifest.$schema, 'beds-manifest/1');
  assert.ok(manifest.components.length > 50);
  for (const entry of manifest.components) {
    assert.match(entry.doc, /^docs\/[A-Z][\w-]*\.md/, entry.name);
    assert.ok(Array.isArray(entry.props), entry.name);
  }
});

test('manifest exposes required props, allowed literal values and object fields', () => {
  const provider = component('DesignSystemProvider');
  assert.deepEqual(provider.props.find(prop => prop.name === 'brandColor')?.required, true);
  assert.deepEqual(provider.props.find(prop => prop.name === 'theme')?.values, ['light', 'dark']);
  const options = component('SegmentedControl').props.find(prop => prop.name === 'options');
  assert.deepEqual(options.fields.map(field => field.name), ['id', 'label', 'disabled']);
  const arrow = component('HandDrawnArrow');
  assert.equal(arrow.doc, 'docs/HAND-DRAWN-ARROW.md');
  assert.deepEqual(arrow.props.find(prop => prop.name === 'shape')?.values, ['curve', 'loop', 'straight']);
});

test('manifest never advertises styling escapes and lists declared tokens', () => {
  for (const entry of manifest.components) for (const prop of entry.props) assert.ok(!['className', 'style'].includes(prop.name), `${entry.name}.${prop.name}`);
  for (const token of ['--es-brand', '--es-brand-ink', '--font-hand']) assert.ok(manifest.tokens.includes(token), token);
});
