import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const css = readFileSync(new URL('../src/hand-drawn-arrow.css', import.meta.url), 'utf8');
const tokens = readFileSync(new URL('../src/tokens.css', import.meta.url), 'utf8');

test('hand-drawn arrow keeps the note readable, hides the stroke and mirrors by direction', async () => {
  const server = await createServer({ root: fileURLToPath(new URL('../../../', import.meta.url)), configFile: false, plugins: [react()], resolve: { dedupe: ['react', 'react-dom'] }, server: { middlewareMode: true } });
  try {
    const { HandDrawnArrow } = await server.ssrLoadModule('/packages/beds/src/hand-drawn-arrow.tsx');
    const render = props => renderToStaticMarkup(React.createElement(HandDrawnArrow, props));

    const noted = render({ label: 'não fica de fora!' });
    assert.match(noted, /<span class="es-hand-arrow-label">não fica de fora!<\/span>/);
    assert.doesNotMatch(noted, /class="es-hand-arrow"[^>]*aria-hidden/);
    assert.match(noted, /<svg[^>]*aria-hidden="true"[^>]*focusable="false"/);
    assert.match(noted, /data-direction="down-left"[^>]*data-context="default"[^>]*data-tone="default"/);
    assert.doesNotMatch(noted, /transform=/, 'the base direction is not mirrored');

    assert.match(render({}), /class="es-hand-arrow"[^>]*aria-hidden="true"/, 'an arrow without a note is decorative');
    assert.match(render({ direction: 'down-right' }), /transform="translate\(64 0\) scale\(-1 1\)"/);
    assert.match(render({ direction: 'up-left' }), /transform="translate\(0 48\) scale\(1 -1\)"/);
    assert.match(render({ direction: 'up-right' }), /transform="translate\(64 48\) scale\(-1 -1\)"/);
    assert.match(render({ direction: 'left' }), /viewBox="0 0 64 28"[^>]*>.*<g>/);
    assert.match(render({ direction: 'right' }), /data-flat="true"[^>]*viewBox="0 0 64 28".*transform="translate\(64 0\) scale\(-1 1\)"/);

    const shapes = ['curve', 'loop', 'straight'].map(shape => render({ shape }).match(/ d="([^"]+)"/)[1]);
    assert.equal(new Set(shapes).size, 3, 'each shape draws a distinct stroke');

    assert.doesNotMatch(render({ drawIn: false }), /stroke-dasharray|opacity:0/, 'a static arrow renders fully without JavaScript');
  } finally { await server.close(); }
});

test('hand-drawn arrow uses the handwriting token and never hides the stroke in print or reduced motion', () => {
  assert.match(tokens, /@font-face\{font-family:'Espaco Caveat';[^}]*CaveatVariable\.woff2/);
  assert.match(tokens, /--font-hand:'Espaco Caveat'/);
  assert.match(css, /font-family: var\(--font-hand\)/);
  assert.match(css, /\[data-tone='brand'\] \.es-hand-arrow-mark \{ color: var\(--es-brand-ink\); \}/, 'brand colors only the decorative stroke');
  assert.match(tokens, /--es-brand-ink:color-mix\(in oklab,var\(--es-brand\) 70%,var\(--es-heading\)\);/, 'light brands keep ink on light surfaces');
  assert.match(tokens, /--es-brand-ink:var\(--es-brand\);/, 'dark theme uses the brand as-is');
  assert.match(css, /max-inline-size: 20ch;\s*text-wrap: balance;/, 'long notes wrap instead of overflowing');
  assert.match(css, /pointer-events: none/);
  for (const media of ['prefers-reduced-motion: reduce', 'print']) {
    assert.match(css, new RegExp(`@media \\(?${media.replace(/[()]/g, '\\$&')}\\)? \\{\\s*\\.es-hand-arrow-path \\{ opacity: 1 !important; stroke-dasharray: none !important; \\}`));
  }
});
