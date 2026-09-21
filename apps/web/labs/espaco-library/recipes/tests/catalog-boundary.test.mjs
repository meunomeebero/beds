import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('catalog separates app examples and avoids a named product brand preset', async () => {
  const source = await readFile(new URL('../../Catalog.tsx', import.meta.url), 'utf8');
  const coreStart = source.indexOf('<SidebarSection label="Biblioteca de componentes">');
  const examplesStart = source.indexOf('<SidebarSection label="Exemplos de app">');
  assert.ok(coreStart > 0 && examplesStart > coreStart);
  const core = source.slice(coreStart, examplesStart);
  assert.doesNotMatch(core, /Landing do Curriculol|Onboarding|Página da Lucy|Checkout/);
  assert.match(source.slice(examplesStart), /Chat · receita/);
  assert.match(source, /id: 'orange', label: 'Laranja · exemplo'/);
  assert.doesNotMatch(source, /id: 'curriculol', label:/);
  assert.match(source, /PageContentHeader · receita de app/);
  assert.match(source, /\? initialView : 'components'/);
});
