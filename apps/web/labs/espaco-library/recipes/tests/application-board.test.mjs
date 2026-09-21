import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const source = readFileSync(fileURLToPath(new URL('../application-board.tsx', import.meta.url)), 'utf8');

test('ApplicationBoard intersects only host-declared destinations with per-item moveTo', () => {
  assert.match(source, /export type ApplicationBoardDestination = \{ id: string; label: string \}/);
  assert.match(source, /destinations\?: readonly ApplicationBoardDestination\[\]/);
  assert.match(source, /const destinationCatalog = destinations \?\? columns\.map\(column => \(\{ id: column\.id, label: column\.label \}\)\)/);
  assert.match(source, /destinationCatalog\.filter\(destination => destination\.id !== column\.id && moveTo\?\.includes\(destination\.id\)\)/);
  assert.match(source, /if \(!options\.some\(option => option\.id === target\)\) return/);
  assert.doesNotMatch(source, /\b(?:Active|Closed)\b/);
});

test('ApplicationBoard returns focus to a stable heading only when the moved card disappears', () => {
  assert.match(source, /const headings = useRef\(new Map<string, HTMLHeadingElement>\(\)\)/);
  assert.match(source, /const reachedDestination = columns\.some\(column => column\.id === pending\.destinationId/);
  assert.match(source, /if \(reachedDestination && card\)/);
  assert.match(source, /else if \(!card\) \{/);
  assert.match(source, /headings\.current\.get\(pending\.sourceColumnId\)/);
  assert.match(source, /tabIndex=\{-1\}/);
  assert.match(source, /<p className="recipe-application-sr-only" role="status">\{announcement\}<\/p>/);
  assert.doesNotMatch(source, /setAnnouncement/);
});
