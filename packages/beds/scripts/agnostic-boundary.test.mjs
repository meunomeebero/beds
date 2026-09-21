import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);

const hasRepositoryDocs = existsSync(new URL('../../docs/design/espaco-library/AGNOSTIC-DS.md', root));
for (const readmePath of ['README.md', '../../README.md', 'docs/CONSUMER-CONTRACT.md', 'docs/API-BOUNDARIES.md']) test(`${readmePath} usage typechecks against the current public package`, {
  skip: readmePath.startsWith('../../') && !hasRepositoryDocs ? 'standalone package: repository README is not shipped' : false,
}, () => {
  const readme = readFileSync(new URL(readmePath, root), 'utf8');
  const sample = readme.match(/```tsx\n([\s\S]*?)```/)?.[1];
  assert.ok(sample, 'README needs a runnable TSX usage example');
  const file = fileURLToPath(new URL('examples/readme-usage.tsx', root));
  const options = { noEmit: true, strict: true, skipLibCheck: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext, jsx: ts.JsxEmit.ReactJSX };
  const host = ts.createCompilerHost(options);
  const originalRead = host.readFile.bind(host);
  const originalExists = host.fileExists.bind(host);
  host.readFile = path => path === file ? sample : originalRead(path);
  host.fileExists = path => path === file || originalExists(path);
  const program = ts.createProgram([file], options, host);
  const errors = ts.getPreEmitDiagnostics(program);
  assert.equal(errors.length, 0, ts.formatDiagnosticsWithColorAndContext(errors, { getCanonicalFileName: path => path, getCurrentDirectory: () => fileURLToPath(root), getNewLine: () => '\n' }));
});

test('former page guides identify recipe ownership before API and historical review', () => {
  for (const [file, module] of [
    ['LANDING-PAGE.md', 'landing'],
    ['LANDING-FOOTER.md', 'landing-footer'],
    ['BENEFITS.md', 'benefits'],
    ['ONBOARDING.md', 'onboarding'],
  ]) {
    const doc = readFileSync(new URL('docs/' + file, root), 'utf8');
    const notice = doc.indexOf('## Current ownership — optional app recipe');
    const api = doc.indexOf('## Optional recipe');
    assert.ok(notice >= 0 && api > notice, file + ': recipe ownership must precede its API');
    assert.ok(doc.includes('not exported from `beds`'), file);
    assert.ok(doc.includes('recipes/' + module + '.tsx'), file);
    assert.match(doc, /pre-extraction snapshot only/);
    assert.doesNotMatch(doc, /## Public (?:API|contract)|No consumer CSS/);
  }
});

test('component map marks extracted flow sections as non-exported app recipes', () => {
  const doc = readFileSync(new URL('docs/COMPONENTS.md', root), 'utf8');
  for (const heading of ['Checkout — 3', 'Results — 5', 'Processing — 1', 'Landing composition — 7', 'Landing benefits — 2', 'Landing footer — 1', 'Onboarding — 1']) {
    const section = doc.split('## ' + heading + '\n')[1]?.split('\n## ')[0];
    assert.ok(section, heading);
    assert.match(section, /^\s*Optional app recipe, not exported from `beds`\./, heading);
  }
});

test('every public value and type has an explicit ownership classification', () => {
  const index = ts.createSourceFile('index.ts', readFileSync(new URL('src/index.ts', root), 'utf8'), ts.ScriptTarget.Latest, true);
  const doc = readFileSync(new URL('docs/API-BOUNDARIES.md', root), 'utf8');
  const retained = doc.split('## Retained exports')[1].split('## Borderline decisions')[0];
  for (const node of index.statements) {
    if (!ts.isExportDeclaration(node)) continue;
    assert.ok(node.exportClause && ts.isNamedExports(node.exportClause), 'Wildcard exports need explicit classification');
    for (const symbol of node.exportClause.elements) {
      assert.ok(retained.includes('`' + symbol.name.text + '`'), `Unclassified export: ${symbol.name.text}`);
    }
  }
});

test('generic page heading has no home-page preset or identity sizing', () => {
  const source = readFileSync(new URL('src/layout.tsx', root), 'utf8');
  const header = source.slice(source.indexOf('export function PageHeader'), source.indexOf('export function SectionHeader'));
  assert.doesNotMatch(header, /purpose|home/);
  assert.doesNotMatch(readFileSync(new URL('dist/styles.css', root), 'utf8'), /es-page-header--home/);
});

test('page-inset composition is absent while generic heading remains usable', () => {
  for (const file of ['src/index.ts', 'dist/index.d.ts', 'src/layout.tsx']) {
    const source = readFileSync(new URL(file, root), 'utf8');
    assert.doesNotMatch(source, /\bPageContentHeader\b/);
    assert.match(source, /\bPageHeader\b/);
  }
  const css = readFileSync(new URL('dist/styles.css', root), 'utf8');
  assert.doesNotMatch(css, /\.(?:es|recipe)-page-content-header/);
  assert.match(css, /\.es-page-header h1,/);
  assert.match(css, /\.es-page-header p,/);
});

test('guided chat page and focus policy are not public component behavior', () => {
  for (const file of ['src/index.ts', 'dist/index.d.ts', 'src/chat.tsx']) {
    assert.doesNotMatch(readFileSync(new URL(file, root), 'utf8'), /\bChatThread\b|previousStep|stepKey/);
  }
  const css = readFileSync(new URL('dist/styles.css', root), 'utf8');
  assert.doesNotMatch(css, /\.(?:es|recipe)-chat-(?:thread|transcript|next|notice)\b/);
});

test('core tokens do not prescribe application page widths or breakpoints', async () => {
  const { geometry } = await import('../dist/tokens.js');
  for (const key of ['sidebar', 'rail', 'breakpoint', 'mobileGutter', 'desktopGutter', 'chat', 'home', 'dashboard']) {
    assert.equal(Object.hasOwn(geometry, key), false, key);
  }
  assert.equal(geometry.readingWidth, 640);
  const css = readFileSync(new URL('dist/styles.css', root), 'utf8');
  assert.doesNotMatch(css, /--es-(?:sidebar|rail|chat|home|dashboard)-width/);
});
const recipes = ['landing', 'landing-footer', 'benefits', 'onboarding', 'checkout', 'processing', 'results', 'chat-workspace', 'payment-confirmation', 'application-card', 'application-board'];

test('navigation remains public without shipping the application shell', () => {
  for (const file of ['src/index.ts', 'dist/index.d.ts']) {
    const index = readFileSync(new URL(file, root), 'utf8');
    assert.match(index, /\bSidebar\b/);
    assert.match(index, /\bNavItem\b/);
    assert.doesNotMatch(index, /\bAppShell\b/);
  }
  const source = readFileSync(new URL('src/layout.tsx', root), 'utf8');
  assert.doesNotMatch(source, /matchMedia|gridTemplateColumns|contentWidth|mobileOpen|ShellContext/);
  const css = readFileSync(new URL('dist/styles.css', root), 'utf8');
  assert.doesNotMatch(css, /\.(?:es|recipe)-(?:app-shell|app-main|mobile-bar|sidebar-backdrop|page--(?:chat|home|dashboard))\b/);
});

test('pricing keeps its individual card but not the comparison composition', () => {
  for (const file of ['src/index.ts', 'dist/index.d.ts']) {
    const index = readFileSync(new URL(file, root), 'utf8');
    assert.match(index, /\bPricingCard\b/);
    assert.doesNotMatch(index, /\bPricingSection(?:Props)?\b|\bPricingPlan\b/);
  }
  const css = readFileSync(new URL('dist/styles.css', root), 'utf8');
  assert.doesNotMatch(css, /\.(?:es|recipe)-pricing-(?:section|intro|mark|grid)\b/);
  assert.match(css, /\.es-pricing-card\b/);
});

test('extracted page recipes are absent from the runtime source and barrel', () => {
  const index = readFileSync(new URL('src/index.ts', root), 'utf8');
  for (const recipe of recipes) {
    assert.equal(existsSync(new URL(`src/${recipe}.tsx`, root)), false, recipe);
    assert.equal(existsSync(new URL(`src/${recipe}.css`, root)), false, recipe);
    assert.ok(!index.includes(`from './${recipe}'`), recipe);
  }
});

test('built package removes stale page recipe modules and styles', () => {
  const css = readFileSync(new URL('dist/styles.css', root), 'utf8');
  assert.doesNotMatch(css, /58svh|\.es-chat-layout|\.es-chat-compose-region|\.es-chat-suggestions|\.es-chat-recent/);
  assert.doesNotMatch(readFileSync(new URL('dist/index.d.ts', root), 'utf8'), /\bChatLayout\b|\bChatWorkspace\b/);
  for (const recipe of recipes) {
    for (const ext of ['js', 'd.ts']) assert.equal(existsSync(new URL(`dist/${recipe}.${ext}`, root)), false, `${recipe}.${ext}`);
    // Results uses singular .es-result; ResultsStatus is a separate component.
    const prefix = recipe === 'results' ? 'result' : recipe;
    assert.doesNotMatch(css, new RegExp(`\\.es-${prefix}(?:-[\\w-]+)?(?![\\w-])`), recipe);
  }
});
