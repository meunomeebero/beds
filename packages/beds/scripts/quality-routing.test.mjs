import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Routing integrity only. This does not execute skills or certify UI quality.
const packageRoot = new URL('../', import.meta.url);
const repositoryRoot = new URL('../../', packageRoot);
const skills = ['better-interface', 'better-accessibility', 'better-layout', 'better-writing', 'better-typography', 'better-colors', 'better-ui'];

function routingIssues(body) {
  return [
    ...skills.filter(skill => !body.includes('`' + skill + '`')),
    ...(!body.includes('automatically load and apply') ? ['automatic trigger'] : []),
    ...(!body.includes('before design/code decisions') ? ['entry timing'] : []),
    ...(!body.toLowerCase().includes('before handoff') ? ['handoff timing'] : []),
    ...(!/\]\([^)]*INTERFACE-QUALITY\.md\)/.test(body) ? ['single protocol link'] : []),
  ];
}

test('portable package agent entrypoint keeps automatic seven-skill routing', () => {
  assert.deepEqual(routingIssues(readFileSync(new URL('AGENTS.md', packageRoot), 'utf8')), []);
});

const hasRepository = existsSync(new URL('docs/design/espaco-library/INTERFACE-QUALITY.md', repositoryRoot));
test('author and catalog entrypoints keep the same automatic routing', { skip: !hasRepository && 'standalone artifact: repository entrypoints not shipped' }, () => {
  for (const path of ['AGENTS.md', 'apps/web/labs/espaco-library/AGENTS.md']) {
    assert.deepEqual(routingIssues(readFileSync(new URL(path, repositoryRoot), 'utf8')), [], path);
  }
});

test('routing assertions reject a missing domain, trigger, timing or owner link', () => {
  const valid = skills.map(skill => '`' + skill + '`').join(' ') + ' automatically load and apply before design/code decisions before handoff [owner](docs/INTERFACE-QUALITY.md)';
  assert.deepEqual(routingIssues(valid), []);
  for (const required of [...skills, 'automatically load and apply', 'before design/code decisions', 'before handoff', 'INTERFACE-QUALITY.md']) {
    assert.ok(routingIssues(valid.replace(required, 'removed')).length > 0, required);
  }
});

test('portable and canonical protocols agree after the package build', { skip: !hasRepository && 'standalone artifact: canonical source not shipped' }, () => {
  const relative = 'INTERFACE-QUALITY.md';
  const canonical = readFileSync(new URL('docs/design/espaco-library/' + relative, repositoryRoot), 'utf8');
  const portable = readFileSync(new URL('docs/' + relative, packageRoot), 'utf8');
  assert.equal(portable, canonical, fileURLToPath(packageRoot));
});
