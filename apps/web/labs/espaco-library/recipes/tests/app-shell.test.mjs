import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SidebarHeader, NavItem } from 'beds';
import { loadRecipe } from './load-recipe.mjs';

const { AppShell } = await loadRecipe('app-shell');
test('app shell recipe composes public navigation and one skip-linked main', () => {
  const markup = renderToStaticMarkup(h(AppShell, {
    collapsed: false, onCollapsedChange() {}, mobileOpen: false, onMobileOpenChange() {},
    navigationLabel: 'Project navigation', contentWidth: 'dashboard',
    sidebar: h(SidebarHeader, null, h(NavItem, { label: 'Overview', icon: 'Home', href: '/overview' })),
  }, h('h1', null, 'Example app')));
  assert.equal((markup.match(/<main\b/g) ?? []).length, 1);
  assert.match(markup, /<nav[^>]*aria-label="Project navigation"/);
  const target = markup.match(/class="recipe-skip-link" href="#([^"]+)"/)?.[1];
  assert.ok(target);
  assert.ok(markup.includes(`<main id="${target}"`));
  assert.match(markup, /recipe-page--dashboard/);
  assert.doesNotMatch(markup, /style="grid-template-columns/);
});
