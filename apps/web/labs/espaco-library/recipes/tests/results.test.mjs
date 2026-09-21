import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadRecipe } from './load-recipe.mjs';
const { ResultScore, ResultOffer, ResultFindings } = await loadRecipe('results');

const score = props => renderToStaticMarkup(createElement(ResultScore, { label: 'ATS', description: 'Estimate', locale: 'pt-BR', ...props }));

test('result evidence preserves zero and omits unknown or invalid meters and deltas', () => {
  assert.match(score({ value: 0 }), /aria-valuenow="0"/);
  for (const value of [null, NaN, Infinity, -1, 101]) {
    const markup = score({ value, before: 62 });
    assert.doesNotMatch(markup, /role="meter"|data-outcome=/);
    assert.match(markup, /—/);
  }
  assert.doesNotMatch(score({ value: 86, before: null }), /data-outcome=/);
});

test('result deltas never round a fractional regression into improvement or neutrality', () => {
  const regression = score({ value: 62.1, before: 62.4 });
  assert.match(regression, /data-outcome="regression"/);
  assert.match(regression, /−0,3 pts/);
  assert.match(regression, /62,1/);
  assert.match(score({ value: 62.001, before: 62.002 }), /−&lt;0,01 pts/);
  assert.match(score({ value: 62, before: 62 }), /data-outcome="neutral"/);
});

test('offers use native navigation and associate complete terms; unstyled lists retain semantics', () => {
  const markup = renderToStaticMarkup(createElement(ResultOffer, {
    eyebrow: 'Next', title: 'Prepare', description: 'Own your work', price: 'R$ 5,90',
    terms: 'One-time', note: 'No expiry', items: ['Resume'], primaryAction: { label: 'Continue', href: '/checkout' },
  }));
  assert.match(markup, /<a[^>]*href="\/checkout"[^>]*aria-describedby="[^"]+-price [^"]+-terms [^"]+-note"/);
  assert.match(markup, /<ul role="list">/);
  const findings = renderToStaticMarkup(createElement(ResultFindings, { title: 'Findings', items: [{ id: 'one', title: 'Evidence', description: 'Details' }] }));
  assert.match(findings, /<ul role="list">/);
});
