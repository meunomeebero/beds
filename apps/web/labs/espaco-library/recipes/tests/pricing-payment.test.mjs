import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadRecipe } from './load-recipe.mjs';

const { PricingSection } = await loadRecipe('pricing-section');
const { PaymentConfirmation } = await loadRecipe('payment-confirmation');
const render = (Component, props) => renderToStaticMarkup(createElement(Component, props));
const plan = id => ({
  id, title: id, description: 'Example offer', image: { src: '', alt: '' },
  price: { label: '$0', description: 'One-time fixture' },
  featuresLabel: 'Included', features: [], featured: true,
  action: { label: `Choose ${id}`, href: `/plans/${id}` },
});

test('comparison recipe owns heading hierarchy and first-featured policy', () => {
  const markup = render(PricingSection, { title: 'Compare', headingLevel: 1, plans: [plan('one'), plan('two')] });
  assert.match(markup, /<h1[^>]*>Compare<\/h1>/);
  assert.equal((markup.match(/<h2\b/g) ?? []).length, 2);
  assert.equal((markup.match(/data-featured="true"/g) ?? []).length, 1);
  assert.match(markup, /href="\/plans\/two"/);
  const empty = render(PricingSection, { title: 'No offers', plans: [] });
  assert.doesNotMatch(empty, /recipe-pricing-grid|<article/);
});

const receiptProps = {
  title: 'Payment confirmed', merchant: 'Example merchant', purchase: { label: 'Example purchase' },
  receipt: { title: 'Receipt', items: [], total: { label: 'Total', value: '$0' } },
  animate: false,
};

test('receipt preserves zero and does not invent invoice actions or animation', () => {
  const markup = render(PaymentConfirmation, receiptProps);
  assert.match(markup, /<bdi>\$0<\/bdi>/);
  assert.doesNotMatch(markup, /data-animate=|<button/);
  const pending = render(PaymentConfirmation, { ...receiptProps, invoice: { state: 'pending', message: 'Document pending' } });
  assert.match(pending, /role="status"[^>]*data-state="pending"/);
  assert.match(pending, /Document pending/);
  assert.doesNotMatch(pending, /<button/);
});

test('receipt recipe supports a standalone H1 without changing embedded heading defaults', () => {
  for (const level of [1, 2, 3]) {
    const markup = render(PaymentConfirmation, { ...receiptProps, headingLevel: level });
    assert.match(markup, new RegExp('<h' + level + '[^>]*>Payment confirmed</h' + level + '>'));
  }
  assert.match(render(PaymentConfirmation, receiptProps), /<h2[^>]*>Payment confirmed<\/h2>/);
});

test('receipt forwards caller-controlled busy and disabled actions', () => {
  const markup = render(PaymentConfirmation, {
    ...receiptProps,
    invoice: { state: 'error', message: 'Document unavailable', action: { label: 'Retry document', onClick() {}, busy: true } },
    continueAction: { label: 'Continue', onClick() {}, disabled: true },
  });
  assert.equal((markup.match(/<button\b/g) ?? []).length, 2);
  assert.equal((markup.match(/ disabled=""/g) ?? []).length, 2);
  assert.match(markup, /aria-describedby="[^"]+-invoice"/);
});
