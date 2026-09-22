import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const css = readFileSync(new URL('../src/expanding-button.css', import.meta.url), 'utf8');

test('expanding button renders one named button with a decorative accent copy', async () => {
  const server = await createServer({ root: fileURLToPath(new URL('../../../', import.meta.url)), configFile: false, plugins: [react()], resolve: { dedupe: ['react', 'react-dom'] }, server: { middlewareMode: true } });
  try {
    const { ExpandingButton } = await server.ssrLoadModule('/packages/beds/src/expanding-button.tsx');
    const render = props => renderToStaticMarkup(React.createElement(ExpandingButton, { label: 'Entrar', ...props }));

    const plain = render({});
    assert.equal(plain.match(/<button/g).length, 1);
    assert.match(plain, /^<button[^>]*type="button"[^>]*class="es-expanding-button"[^>]*data-context="default"/);
    assert.doesNotMatch(plain, /aria-label=|data-expanded/, 'the visible label names the button and it starts collapsed');
    assert.match(plain, /class="es-expanding-button-accent" aria-hidden="true"/, 'the duplicated label inside the accent is hidden from assistive tech');
    assert.equal(plain.match(/es-expanding-button-label">Entrar</g).length, 2);
    assert.match(plain, /lucide-arrow-right/, 'ArrowRight is the default glyph');

    const branded = render({ mark: React.createElement('svg', { 'data-mark': 'x' }), icon: 'Check', accessibleLabel: 'Entrar com X', context: 'hero', type: 'submit' });
    assert.match(branded, /aria-label="Entrar com X"/);
    assert.match(branded, /type="submit"/);
    assert.match(branded, /data-context="hero"/);
    assert.match(branded, /data-mark="x"/);
    assert.doesNotMatch(branded, /lucide-check/, 'a mark replaces the icon');

    assert.match(render({ disabled: true }), /<button[^>]*disabled=""/);
  } finally { await server.close(); }
});

test('expanding button keeps brand colors on tokens and stays usable without motion or color', () => {
  assert.match(css, /\.es-expanding-button-chip \{[^}]*background: var\(--es-brand\);[^}]*color: var\(--es-on-brand\);/);
  assert.match(css, /\.es-expanding-button-accent \{[^}]*background: var\(--es-brand\);[^}]*pointer-events: none;/);
  assert.match(css, /\.es-expanding-button:focus-visible \{ outline: 2px solid var\(--es-focus\);/);
  assert.match(css, /@media \(pointer: coarse\) \{\s*\.es-expanding-button\[data-context='default'\] \{ block-size: 44px; \}/, 'touch targets reach 44px');
  assert.match(css, /@media \(forced-colors: active\) \{[^}]*border: 1px solid ButtonText;/);
  assert.doesNotMatch(css, /box-shadow|gradient|#[0-9a-f]{3,8}\b/i, 'no decorative shadow, gradient or raw color');
});
