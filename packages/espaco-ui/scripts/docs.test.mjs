import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkDocs, checkPackageDocs } from './check-docs.mjs';

function fixture(run) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'espaco-docs-test-'));
  try { run(root, (name, body) => {
    const target = path.join(root, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, body);
    return target;
  }); }
  finally { fs.rmSync(root, { recursive: true, force: true }); }
}

test('checks untracked and nested Markdown without requiring a Git repository', () => fixture((root, write) => {
  write('docs/README.md', '[child](nested/new.md)');
  write('docs/nested/new.md', '[missing](lost.png)');
  const result = checkDocs({ inputs: [path.join(root, 'docs')] });
  assert.equal(result.files, 2);
  assert.deepEqual(result.issues.map(issue => issue.code), ['DOC_LINK_MISSING']);
}));

test('accepts relative assets, encoded spaces, angle links and reference definitions', () => fixture((root, write) => {
  const index = write('README.md', '[one](a%20b.txt) [two](<a b.txt>)\n[three]: a%20b.txt\n[web](https://example.com) [local](#heading)\n```md\n[example](not-a-real-file)\n```');
  write('a b.txt', 'asset');
  const result = checkDocs({ inputs: [index] });
  assert.equal(result.links, 3);
  assert.deepEqual(result.issues, []);
}));

test('fails closed on missing or empty scopes', () => fixture((root) => {
  assert.ok(checkDocs({ inputs: [path.join(root, 'missing')] }).issues.some(issue => issue.code === 'DOC_SCOPE_MISSING'));
  assert.ok(checkDocs({ inputs: [root] }).issues.some(issue => issue.code === 'DOC_SCOPE_EMPTY'));
}));

test('requires every canonical document in its declared index', () => fixture((root, write) => {
  const index = write('docs/README.md', '[present](PRESENT.md)');
  write('docs/PRESENT.md', '# Present');
  write('docs/NEW.md', '# Unindexed');
  const result = checkDocs({ inputs: [root], indexes: [{ index, directory: path.join(root, 'docs') }] });
  assert.deepEqual(result.issues.map(issue => issue.code), ['DOC_NOT_INDEXED']);
}));

test('packed docs cannot depend on an existing repository file outside the package', () => fixture((root, write) => {
  write('product.md', '# Product policy');
  write('package/README.md', '[protocol](docs/README.md)');
  write('package/AGENTS.md', '# Package rules');
  write('package/docs/README.md', '[product](../../product.md)');
  const result = checkPackageDocs(path.join(root, 'package'));
  assert.deepEqual(result.issues.map(issue => issue.code), ['DOC_OUTSIDE_PACKAGE']);
}));

test('packed docs pass with only bundled targets and no source repository', () => fixture((root, write) => {
  write('README.md', '[map](docs/README.md)');
  write('AGENTS.md', '[map](docs/README.md)');
  write('docs/README.md', '[code](../evidence/example.tsx.txt)');
  write('evidence/example.tsx.txt', 'example');
  assert.deepEqual(checkPackageDocs(root).issues, []);
}));

test('CLI invoked through a workspace symlink still rejects a missing target', () => fixture((root, write) => {
  const linked = path.join(root, 'linked-check-docs.mjs');
  fs.symlinkSync(fileURLToPath(new URL('./check-docs.mjs', import.meta.url)), linked);
  const document = write('NEW.md', '[missing](not-here.md)');
  const result = spawnSync(process.execPath, [linked, document], { encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /DOC_LINK_MISSING/);
}));
