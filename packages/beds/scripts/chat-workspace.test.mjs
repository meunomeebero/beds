import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const chatSource = readFileSync(fileURLToPath(new URL('../src/chat.tsx', import.meta.url)), 'utf8');
const feedbackSource = readFileSync(fileURLToPath(new URL('../src/feedback.tsx', import.meta.url)), 'utf8');
const technicalSource = readFileSync(fileURLToPath(new URL('../src/technical.tsx', import.meta.url)), 'utf8');

test('ChatComposer protects IME confirmation and disables cancellation with the host control', async () => {
  assert.match(chatSource, /event\.nativeEvent\.isComposing \|\| event\.nativeEvent\.keyCode === 229/);
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { ChatComposer } = await import('../dist/index.js');
  const render = disabled => renderToStaticMarkup(createElement(ChatComposer, {
    label: 'Message', value: 'Draft', onChange() {}, onSubmit() {}, onCancel() {},
    busy: true, disabled, cancelLabel: 'Cancel test',
  }));
  assert.match(render(true), /<button[^>]*aria-label="Cancel test"[^>]*disabled=""/);
  assert.doesNotMatch(render(false), /<button[^>]*aria-label="Cancel test"[^>]*disabled/);
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
