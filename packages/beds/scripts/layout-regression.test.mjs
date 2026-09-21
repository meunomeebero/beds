import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const layoutPath = fileURLToPath(new URL('../src/layout.tsx', import.meta.url));

test('visually hidden labels have direction-safe containment without negative margins', async () => {
  const css = await readFile(new URL('../src/foundation.css', import.meta.url), 'utf8');
  const hidden = css.match(/\.es-sr-only\{([^}]+)\}/)[1];
  assert.match(hidden, /position:absolute/);
  assert.match(hidden, /inset-inline-start:0/);
  assert.match(hidden, /(?:^|;)margin:0(?:;|$)/);
  assert.match(hidden, /clip-path:inset\(50%\)/);
  assert.doesNotMatch(hidden, /display:none|visibility:hidden/);
});

test('content panels grow and do not override nested list containment', async () => {
  const css = await readFile(new URL('../src/layout.css', import.meta.url), 'utf8');
  const panel = css.match(/\.es-activity-panel\{([^}]+)\}/)[1];
  const body = css.match(/\.es-activity-panel-body\{([^}]+)\}/)[1];
  const identity = css.match(/\.es-collection-card-identity>span\{([^}]+)\}/)[1];
  assert.match(panel, /min-block-size:260px/);
  assert.doesNotMatch(panel, /(?:^|;)block-size:/);
  assert.doesNotMatch(body, /overflow:hidden/);
  assert.doesNotMatch(css, /es-activity-panel-body>\.es-stack/);
  assert.match(identity, /overflow-wrap:anywhere/);
  assert.doesNotMatch(identity, /ellipsis|nowrap|overflow:hidden/);
});

test('Sidebar works independently of a page and exposes only host-owned controls', async () => {
  const { createElement: h } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { Sidebar, SidebarHeader, NavItem } = await import('../dist/index.js');
  const render = props => renderToStaticMarkup(h(Sidebar, { label: 'Example destinations', ...props },
    h(SidebarHeader, null, 'Example identity'),
    h(NavItem, { label: 'Documents', icon: 'FileText', href: '/documents', active: true })));
  const standalone = render({});
  assert.match(standalone, /<nav[^>]*aria-label="Example destinations"/);
  assert.match(standalone, /aria-current="page"[^>]*href="\/documents"/);
  assert.match(standalone, /title="Documents"/);
  assert.doesNotMatch(standalone, /<main|role="dialog"|Collapse sidebar|Expand sidebar/);
  assert.match(render({ collapsed: true, onCollapsedChange() {} }), /aria-label="Expand sidebar"/);
  assert.match(render({ onDismiss() {} }), /aria-label="Close navigation"/);
});

test('compact navigation centers the icon and does not force a 42px row into its parent', async () => {
  const css = await readFile(new URL('../src/layout.css', import.meta.url), 'utf8');
  assert.match(css, /\.es-sidebar\[data-collapsed\] \.es-nav-content\{justify-content:center\}/);
  assert.match(css, /\.es-sidebar\[data-collapsed\] \.es-nav-item\{[^}]*width:100%/);
  assert.doesNotMatch(css, /es-app-shell--collapsed/);
});

test('Surface exposes a narrow semantic target without creating a tab stop', async () => {
  const source = await readFile(layoutPath, 'utf8');

  assert.match(source, /export type SurfaceProps = \{[\s\S]*?id\?: string;[\s\S]*?focusTarget\?: boolean;/);
  assert.match(source, /export function Surface\(\{ children, role = 'panel', id, focusTarget = false \}: SurfaceProps\)/);
  assert.match(source, /<div id=\{id\} tabIndex=\{focusTarget \? -1 : undefined\} className=\{`es-surface es-surface--\$\{role\}`\}>/);
});
