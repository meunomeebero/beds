import test from 'node:test';
import assert from 'node:assert/strict';
import { dialogMotion, drawerMotion } from '../dist/lib/modal-motion.js';
import { EASE_OUT, SPRING_PANEL } from '../dist/lib/ease.js';

test('default dialog and drawer motion retain the rc.11 contract', () => {
  assert.deepEqual(dialogMotion(true, false, 'default'), {
    initial: { opacity: 0, scale: 0.97 }, animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.18, ease: [0.23, 1, 0.32, 1] },
  });
  assert.deepEqual(dialogMotion(false, false, 'default').transition, { duration: 0.15, ease: EASE_OUT });
  assert.deepEqual(dialogMotion(true, true, 'default').animate, { opacity: 1, scale: 1 });
  assert.deepEqual(drawerMotion(true, false, 'default', '100%'), {
    initial: { x: '100%' }, animate: { x: 0 }, transition: SPRING_PANEL,
  });
  assert.deepEqual(drawerMotion(false, false, 'default', '-100%').animate, { x: '-100%' });
  assert.deepEqual(drawerMotion(false, true, 'default', '100%'), {
    initial: { opacity: 0, x: 0 }, animate: { opacity: 0, x: 0 },
    transition: { duration: 0.2, ease: EASE_OUT },
  });
});

test('elastic entry has one full-transform owner, a subtle spring and an independent opacity tween', () => {
  for (const [entry, start, end, bounce] of [
    [dialogMotion(true, false, 'elastic'), 'translateY(4px) scale(0.97)', 'translateY(0px) scale(1)', 0.2],
    [drawerMotion(true, false, 'elastic', '100%'), 'translateX(100%)', 'translateX(0%)', 0.16],
    [drawerMotion(true, false, 'elastic', '-100%'), 'translateX(-100%)', 'translateX(0%)', 0.16],
  ]) {
    assert.deepEqual(entry.initial, { opacity: 0, transform: start });
    assert.deepEqual(entry.animate, { opacity: 1, transform: end });
    assert.deepEqual(entry.transition.transform, { type: 'spring', duration: 0.26, bounce });
    assert.deepEqual(entry.transition.opacity, { duration: 0.14, ease: EASE_OUT });
    assert.equal('x' in entry.animate || 'y' in entry.animate || 'scale' in entry.animate, false);
  }
});

test('elastic dismissal is a short ease-out, never another bounce', () => {
  for (const exit of [dialogMotion(false, false, 'elastic'), drawerMotion(false, false, 'elastic', '100%')]) {
    assert.equal(exit.animate.opacity, 0);
    assert.deepEqual(exit.transition.transform, { duration: 0.15, ease: EASE_OUT });
    assert.equal('bounce' in exit.transition.transform, false);
  }
});

test('live reduced motion changes both targets: stops spatial motion without skipping exit opacity presence', () => {
  for (const open of [true, false]) for (const [full, reduced] of [
    [dialogMotion(open, false, 'elastic'), dialogMotion(open, true, 'elastic')],
    [drawerMotion(open, false, 'elastic', '100%'), drawerMotion(open, true, 'elastic', '100%')],
    [drawerMotion(open, false, 'elastic', '-100%'), drawerMotion(open, true, 'elastic', '-100%')],
  ]) {
    assert.deepEqual(reduced.initial, { opacity: 0, transform: 'none' });
    assert.deepEqual(reduced.animate, { opacity: [null, open ? 1 : 0], transform: 'none' });
    assert.notEqual(reduced.animate.transform, full.animate.transform, 'A transition-only change cannot cancel a running spring');
    assert.notDeepEqual(reduced.animate.opacity, full.animate.opacity, 'The replacement completion must wait for its opacity fade');
    assert.deepEqual(reduced.transition.transform, { duration: 0 });
    assert.deepEqual(reduced.transition.opacity, { duration: 0.14, ease: EASE_OUT });
  }
});

test('Dialog keeps the native shell still and assigns elastic motion to its inner surface', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { Dialog } = await import('../dist/index.js');
  const markup = renderToStaticMarkup(createElement(Dialog, { open: true, onOpenChange() {}, title: 'Details', motionPreset: 'elastic' }, 'Content'));
  const shell = markup.match(/<dialog[^>]+>/)?.[0];
  assert.ok(shell);
  assert.doesNotMatch(shell, /style=|transform/);
  assert.match(markup, /class="es-dialog-surface"[^>]*inert=""[^>]*style="[^"]*transform:translateY\(4px\) scale\(0\.97\)/);
});
