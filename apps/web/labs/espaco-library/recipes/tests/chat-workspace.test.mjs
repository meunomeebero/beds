import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const source = readFileSync(fileURLToPath(new URL('../chat-workspace.tsx', import.meta.url)), 'utf8');

test('ChatWorkspace remains a controlled presentation boundary', () => {
  for (const contract of ['messages: readonly ChatWorkspaceMessage[]', 'draft: string', 'onDraftChange: (value: string) => void', 'onSubmit: (draft: string) => void']) {
    assert.match(source, new RegExp(contract.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.doesNotMatch(source, /\b(?:fetch|EventSource|WebSocket)\s*\(/);
  assert.doesNotMatch(source, /from\s+['"](?:beui|@\/components)['"]/);
});

test('ChatWorkspace keeps the incremental announcement available and protects composition', () => {
  assert.match(source, /event\.nativeEvent\.isComposing/);
  assert.match(source, /event\.nativeEvent\.keyCode === 229/);
  assert.match(source, /aria-live=\{messageStreaming \? 'polite' : 'off'\}/);
  assert.doesNotMatch(source, /<section aria-label=\{label\} aria-busy=/);
  assert.doesNotMatch(source, /<article[^>]+aria-busy=/);
});

test('ChatWorkspace supports recovery and non-motion states', () => {
  assert.match(source, /role="alert"/);
  assert.match(source, /onCancel/);
  assert.match(source, /onRetry/);
  assert.match(source, /useReducedMotion\(\)/);
  assert.match(source, /forced-colors:focus-visible:outline-\[Highlight\]/);
});
