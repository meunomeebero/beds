import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const controlsPath = fileURLToPath(new URL('../src/controls.tsx', import.meta.url));

test('control surface and switch colors compile to their existing semantic tokens', async () => {
  const css = await readFile(new URL('../dist/styles.css', import.meta.url), 'utf8');
  for (const [utility, property, token] of [
    ['bg-surface', 'background-color', 'surface'],
    ['bg-field', 'background-color', 'field'],
    ['text-input-text', 'color', 'input-text'],
    ['bg-subtle', 'background-color', 'subtle'],
    ['border-border-subtle', 'border-color', 'border-subtle'],
    ['text-bg', 'color', 'bg'],
    ['bg-switch-off', 'background-color', 'switch-off'],
    ['bg-switch-thumb', 'background-color', 'switch-thumb'],
    ['bg-switch-thumb-on', 'background-color', 'switch-thumb-on'],
  ]) {
    assert.ok(css.includes(`.${utility}{${property}:var(--es-${token})}`), utility);
  }
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { Switch } = await import('../dist/index.js');
  for (const checked of [false, true]) {
    const markup = renderToStaticMarkup(createElement(Switch, { label: 'Setting', checked, onChange() {} }));
    assert.ok(markup.includes(checked ? 'bg-switch-thumb-on' : 'bg-switch-thumb"'));
  }
});

test('named background utilities in runtime TSX have a declared Tailwind color', async () => {
  const theme = await readFile(new URL('../src/tailwind.css', import.meta.url), 'utf8');
  const colors = new Set([...theme.matchAll(/--color-([a-z][\w-]*):/g)].map(match => match[1]));
  const failures = [];
  async function visitDirectory(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const url = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
      if (entry.isDirectory()) await visitDirectory(url);
      else if (entry.name.endsWith('.tsx')) {
        const source = ts.createSourceFile(entry.name, await readFile(url, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
        function visit(node) {
          if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
            for (const token of node.text.split(/\s+/)) {
              // Arbitrary values and dynamically assembled classes are outside this bounded check.
              if (token.includes('[')) continue;
              const name = token.split(':').at(-1).match(/^bg-([a-z][a-z0-9-]*)(?:\/\d+)?$/)?.[1];
              if (name && !colors.has(name)) failures.push(`${entry.name}: ${token}`);
            }
          }
          ts.forEachChild(node, visit);
        }
        visit(source);
      }
    }
  }
  await visitDirectory(new URL('../src/', import.meta.url));
  assert.deepEqual(failures, [], 'A named background class without --color-* silently disappears during compilation');
});

test('theme transitions freeze locally through a paint and restore on cleanup or rapid flips', async () => {
  const { suppressThemeTransitions } = await import('../dist/lib/suppress-theme-transitions.js');
  const queue = new Map();
  let serial = 0;
  const attributes = new Set();
  const log = [];
  const root = {
    ownerDocument: { defaultView: {
      requestAnimationFrame: callback => { queue.set(++serial, callback); return serial; },
      cancelAnimationFrame: id => queue.delete(id),
    } },
    setAttribute: name => { attributes.add(name); log.push('disable'); },
    removeAttribute: name => attributes.delete(name),
    get offsetHeight() { log.push('flush'); return 100; },
  };
  const tick = () => { const pending = [...queue.values()]; queue.clear(); pending.forEach(callback => callback()); };
  const cleanup = suppressThemeTransitions(root);
  assert.deepEqual(log, ['disable', 'flush']);
  tick();
  assert.ok(attributes.has('data-theme-switching'));
  tick();
  assert.equal(attributes.size, 0);
  cleanup();
  const cancel = suppressThemeTransitions(root);
  cancel();
  assert.equal(queue.size, 0);
  assert.equal(attributes.size, 0);
  const latest = suppressThemeTransitions(root);
  tick();
  assert.ok(attributes.has('data-theme-switching'));
  latest();
  assert.equal(queue.size, 0);
  assert.equal(attributes.size, 0);
  const css = await readFile(new URL('../src/foundation.css', import.meta.url), 'utf8');
  assert.match(css, /\.es-root\[data-theme-switching\][^{}]+\{transition:none!important\}/);
});

test('IconButton forwards semantic popup attributes and DropdownMenu reuses its styled control', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { IconButton, DropdownMenu } = await import('../dist/index.js');
  const markup = renderToStaticMarkup(createElement(IconButton, {
    label: 'Open menu', icon: 'MoreHorizontal', onClick() {},
    'aria-haspopup': 'menu', 'aria-expanded': true, 'aria-controls': 'example-menu',
  }));
  assert.match(markup, /aria-haspopup="menu"/);
  assert.match(markup, /aria-expanded="true"/);
  assert.match(markup, /aria-controls="example-menu"/);
  const dropdown = renderToStaticMarkup(createElement(DropdownMenu, {
    label: 'Actions', open: false, onOpenChange() {}, items: [], onSelect() {},
  }));
  assert.match(dropdown, /class="es-icon-button [^"]*min-h-8 min-w-8/);
  assert.match(dropdown, /pointer-coarse:min-h-11 pointer-coarse:min-w-11/);
  assert.match(dropdown, /aria-haspopup="menu" aria-expanded="false"/);
});

test('exported Text typography metadata matches component CSS', async () => {
  const { typography } = await import('../dist/tokens.js');
  const css = await readFile(new URL('../src/foundation.css', import.meta.url), 'utf8');
  const roles = { pageTitle: 'page-title', sectionTitle: 'section-title', chatTitle: 'chat-title',
    body: 'body', bodySmall: 'body-small', label: 'label', option: 'option',
    caption: 'caption', overline: 'overline' };
  for (const [key, variant] of Object.entries(roles)) {
    const rule = css.match(new RegExp(`\\.es-text--${variant}\\{([^}]+)\\}`))?.[1];
    assert.ok(rule, `Missing CSS role ${variant}`);
    for (const [property, metadataKey] of [['font-size', 'size'], ['line-height', 'line'], ['font-weight', 'weight']]) {
      const value = rule.match(new RegExp(`${property}:([\\d.]+)`))?.[1];
      assert.equal(Number(value), typography[key][metadataKey], `${variant} ${property}`);
    }
  }
});

test('public MeterSegments preserves zero, unknown state and bounded progress independently of page recipes', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { MeterSegments } = await import('../dist/index.js');
  const render = props => renderToStaticMarkup(createElement(MeterSegments, { label: 'Storage usage', ...props }));
  assert.match(render({ value: 0 }), /role="meter"[^>]*aria-valuenow="0"/);
  assert.match(render({ value: 150, role: 'progressbar' }), /role="progressbar"[^>]*aria-valuenow="100"/);
  const unknown = render({ value: null });
  assert.match(unknown, /role="img"[^>]*aria-label="Storage usage: unavailable"/);
  assert.doesNotMatch(unknown, /aria-valuenow/);
  assert.match(render({ value: 63, animateFill: true }), /aria-valuenow="63"/);
});

test('RadioGroup owns usable label targets without a page-specific override', async () => {
  const css = await readFile(new URL('../src/form-fields.css', import.meta.url), 'utf8');
  assert.match(css, /\.es-radio-option\{[^}]*min-height:32px/);
  assert.match(css, /@media\(pointer:coarse\)\{\.es-root \.es-radio-option\{min-height:44px\}\}/);
  assert.match(css, /\.es-radio-group>legend\{margin-block-end:8px\}/);
});

test('Switch reduced motion changes duration, never the checked position', async () => {
  const source = await readFile(controlsPath, 'utf8');
  const component = source.slice(source.indexOf('export function Switch'), source.indexOf('type Choice'));
  assert.match(component, /animate=\{\{ insetInlineStart: checked \? 14 : 0 \}\}/);
  assert.match(component, /relative block h-4 w-4/);
  assert.match(component, /transition=\{reduce \? \{ duration: 0 \}/);
});

test('settings Tabs do not resize unrelated child controls', async () => {
  const css = await readFile(new URL('../src/controls.css', import.meta.url), 'utf8');
  assert.doesNotMatch(css, /\.es-tabs\[data-variant="settings"\][^{]*(?:\.es-switch|:where\(input|\.es-select-trigger|\.es-theme-toggle|\.es-text-link)/);
  const overlays = await readFile(new URL('../src/overlays.css', import.meta.url), 'utf8');
  assert.match(overlays, /@media\(pointer:coarse\)\{\.es-root \.es-select\[data-variant\]>\.es-select-trigger\{min-height:44px\}\}/);
});

test('Select label flex does not stretch its animated chevron', async () => {
  const css = await readFile(new URL('../src/overlays.css', import.meta.url), 'utf8');
  assert.match(css, /\.es-select-trigger>span:not\(\[aria-hidden\]\)\{flex:1;/);
  assert.match(css, /\.es-select-trigger>span\[aria-hidden\]\{display:inline-flex;flex:none;/);
  assert.doesNotMatch(css, /\.es-select-trigger>span\{flex:1/);
});

async function controlClass(name) {
  const source = await readFile(controlsPath, 'utf8');
  const match = source.match(new RegExp(`const ${name} = '([^']*)';`));
  assert.ok(match, `Expected ${name} to be declared`);
  return match[1];
}

test('SegmentedControl remains option-sized until constrained by its container', async () => {
  for (const name of ['SEGMENTED_PILL', 'SEGMENTED_JOINED']) {
    const classes = await controlClass(name);
    assert.match(classes, /\bw-fit\b/);
    assert.match(classes, /\bmax-w-full\b/);
    assert.match(classes, /\boverflow-x-auto\b/);
  }
});

test('Tabs use the semantic muted text role and visibly distinguish disabled tabs', async () => {
  const activity = await controlClass('TABS_TAB_ACTIVITY');
  const connection = await controlClass('TABS_TAB_CONNECTION');
  const source = await readFile(controlsPath, 'utf8');

  assert.match(activity, /\btext-muted-foreground\b/);
  assert.doesNotMatch(activity, /\btext-secondary\b/);
  for (const classes of [activity, connection]) {
    assert.match(classes, /\bdisabled:opacity-50\b/);
    assert.match(classes, /\bdisabled:cursor-not-allowed\b/);
  }
  assert.match(source, /es-settings-tab[^']*disabled:opacity-50/);
  assert.match(source, /disabled=\{item\.disabled\}/);
});

test('DateField keeps native date, bounds and shared field recovery semantics', async () => {
  const source = await readFile(controlsPath, 'utf8');

  assert.match(source, /export const DateField = forwardRef<HTMLInputElement, DateFieldProps>/);
  assert.match(source, /type="date"/);
  assert.match(source, /min=\{min\} max=\{max\} required=\{required\}/);
  assert.match(source, /DateField[\s\S]*?aria-invalid=\{Boolean\(error\) \|\| undefined\}[\s\S]*?aria-describedby=\{describedBy\}/);
  assert.match(source, /DateField[\s\S]*?<FieldNotes id=\{id\} description=\{description\} error=\{error\} reserveErrorLine=\{reserveErrorLine\}/);
});
