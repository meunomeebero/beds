import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const css = readFileSync(new URL('../src/foundation.css', import.meta.url), 'utf8');

test('TextLink and LinkButton share one link contract with an inline or nav purpose', async () => {
  const server = await createServer({ root: fileURLToPath(new URL('../../../', import.meta.url)), configFile: false, plugins: [react()], resolve: { dedupe: ['react', 'react-dom'] }, server: { middlewareMode: true } });
  try {
    const { TextLink, LinkButton } = await server.ssrLoadModule('/packages/beds/src/foundation.tsx');
    const link = props => renderToStaticMarkup(React.createElement(TextLink, { href: '/x', ...props }, 'Como funciona'));
    const button = props => renderToStaticMarkup(React.createElement(LinkButton, { label: 'Abrir ajuda', onClick: () => {}, ...props }));

    assert.match(link(), /^<a class="es-text-link" data-purpose="inline" href="\/x"><span class="es-text-link-label">Como funciona<\/span><\/a>$/);
    assert.match(link({ purpose: 'nav' }), /data-purpose="nav"/);
    assert.match(link({ purpose: 'nav' }), /class="es-text-link-label" style="background-size:0% 1.5px"/, 'nav starts with no underline and renders the same markup on the server');
    assert.match(link({ external: true }), /target="_blank" rel="noopener noreferrer"/);

    assert.match(button(), /^<button type="button" class="es-text-link es-link-button" data-purpose="inline">/);
    assert.match(button({ purpose: 'nav', disabled: true }), /disabled=""/);
    assert.doesNotMatch(button({ purpose: 'nav', disabled: true }), /background-size/, 'a disabled link button never draws the underline');
  } finally { await server.close(); }
});

test('link styles keep prose links recognizable and the nav underline tokenized', () => {
  assert.match(css, /\.es-text-link\{[^}]*text-decoration:underline/, 'inline links stay underlined without color');
  assert.match(css, /\.es-text-link\[data-purpose=nav\]\{text-decoration:none\}/);
  assert.match(css, /\[data-purpose=nav\]>\.es-text-link-label\{[^}]*linear-gradient\(currentColor,currentColor\)/, 'the underline follows the text color, not a brand fill');
  assert.match(css, /\[data-purpose=nav\]:dir\(rtl\)>\.es-text-link-label\{background-position:100% 100%\}/, 'RTL draws from the inline start');
  assert.match(css, /\.es-text-link:focus-visible\{outline:2px solid var\(--es-focus\)/);
  assert.match(css, /forced-colors:active\)\{[^}]*\[data-active\]\{text-decoration:underline\}/);
  assert.doesNotMatch(css.match(/\.es-link-button\{[^}]*\}/)[0], /padding:[^0]/);
});
