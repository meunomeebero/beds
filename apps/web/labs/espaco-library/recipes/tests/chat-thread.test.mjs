import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadRecipe } from './load-recipe.mjs';

test('guided chat recipe preserves page heading, stable status and caller-owned next step', async () => {
  const { ChatThread } = await loadRecipe('chat-thread');
  const html = renderToStaticMarkup(createElement(ChatThread, {
    title: 'Support conversation', stepKey: 'choose', notice: 'Local preview',
    interaction: createElement('button', { type: 'button' }, 'Continue'),
  }, createElement('p', null, 'Transcript')));
  assert.match(html, /<h1[^>]*>Support conversation<\/h1>/);
  assert.match(html, /role="status"><\/p>/);
  assert.ok(html.indexOf('Transcript') < html.indexOf('Continue'));
  assert.match(html, /Local preview/);
  assert.doesNotMatch(html, /autofocus|class="es-/i);
});

test('guided chat focus policy is local and skips initial mount without private component selectors', async () => {
  const source = await readFile(new URL('../chat-thread.tsx', import.meta.url), 'utf8');
  assert.match(source, /if \(previousStep.current === stepKey\) return/);
  assert.match(source, /target\?\.focus\(\)/);
  assert.doesNotMatch(source, /\.es-|addEventListener|scrollIntoView/);
});
