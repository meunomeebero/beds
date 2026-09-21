import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadRecipe } from './load-recipe.mjs';

test('home greeting remains an optional app recipe with caller-owned identity', async () => {
  const { HomeHeader } = await loadRecipe('home-header');
  const html = renderToStaticMarkup(createElement(HomeHeader, {
    title: 'Welcome', description: 'Example only',
    leading: createElement('img', { src: '/owned.svg', alt: 'Example identity' }),
  }));
  assert.match(html, /<h1>Welcome<\/h1>/);
  assert.match(html, /alt="Example identity"/);
  assert.doesNotMatch(html, /class="es-|Curriculol|Lucy/);
});

test('page header recipe preserves caller heading, description and native action', async () => {
  const { PageContentHeader } = await loadRecipe('page-content-header');
  const html = renderToStaticMarkup(createElement(PageContentHeader, {
    title: 'Connections', description: 'Manage local examples',
    actions: createElement('button', { type: 'button' }, 'Open guide'),
  }));
  assert.match(html, /<h1>Connections<\/h1>/);
  assert.match(html, /<p>Manage local examples<\/p>/);
  assert.match(html, /<button type="button">Open guide<\/button>/);
  assert.doesNotMatch(html, /class="es-/);
});
