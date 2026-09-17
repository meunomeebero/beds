import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CheckoutLayout, OrderSummary, CheckoutSection } from '../dist/index.js';

test('checkout layout has one named main, native return and summary before purchase fields', () => {
  const markup = renderToStaticMarkup(createElement(CheckoutLayout, {
    title: 'Your purchase', description: 'Review first', back: { label: 'Return', href: '/result' },
    summary: createElement(OrderSummary, { title: 'Summary', items: [], total: { label: 'Total', value: '0' }, terms: 'One-time' }),
    children: createElement(CheckoutSection, { title: 'Payment', children: 'Form slot' }),
  }));
  assert.equal((markup.match(/<main\b/g) ?? []).length, 1);
  assert.match(markup, /<main[^>]*aria-labelledby=/);
  assert.match(markup, /<a href="\/result"/);
  assert.ok(markup.indexOf('es-order-summary') < markup.indexOf('es-checkout-section'));
  assert.match(markup, /<dd><bdi>0<\/bdi><\/dd>/);
  assert.doesNotMatch(markup, /data-has-summary="false"|undefined/);
});

test('order summary retains literal terms and prices without claiming payment or fiscal issuance', () => {
  const markup = renderToStaticMarkup(createElement(OrderSummary, {
    title: 'Summary', items: [{ id: 'one', label: 'Credits', value: '1' }],
    total: { label: 'Total', value: 'R$ 5,90' }, terms: 'One-time; no subscription',
    benefits: ['Resume + letter'], note: 'Synthetic',
  }));
  assert.match(markup, /aria-live="polite" aria-atomic="true"/);
  assert.match(markup, /<dt>Credits<\/dt><dd><bdi>1<\/bdi>/);
  assert.match(markup, /<ul role="list">/);
  assert.match(markup, /One-time; no subscription/);
  assert.doesNotMatch(markup, /es-payment-success|invoice|<button|<form/);
});
