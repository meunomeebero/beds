import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const source = readFileSync(fileURLToPath(new URL('../src/chat-workspace.tsx', import.meta.url)), 'utf8');
const chatSource = readFileSync(fileURLToPath(new URL('../src/chat.tsx', import.meta.url)), 'utf8');
const feedbackSource = readFileSync(fileURLToPath(new URL('../src/feedback.tsx', import.meta.url)), 'utf8');
const technicalSource = readFileSync(fileURLToPath(new URL('../src/technical.tsx', import.meta.url)), 'utf8');

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

test('public control fallbacks use PT-BR while host localization remains optional', () => {
  assert.match(chatSource, /sendLabel = 'Enviar mensagem'/);
  assert.match(chatSource, /attachLabel = 'Adicionar anexo ou contexto'/);
  assert.match(chatSource, /sendLabel\?: string; attachLabel\?: string;/);
  assert.match(feedbackSource, /dismissLabel = 'Dispensar notificação'/);
  assert.match(feedbackSource, /dismissLabel\?: string/);
  for (const fallback of [
    "copy: 'Copiar'",
    "copying: 'Copiando'",
    "copied: 'Copiado'",
    'copyLabel: label => `Copiar ${label}`',
    "success: 'Copiado para a área de transferência'",
    "error: 'Não foi possível copiar. Selecione o valor e copie manualmente ou tente novamente.'",
  ]) assert.match(technicalSource, new RegExp(fallback.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(technicalSource, /messages\?: CodeSnippetMessages/);
});
