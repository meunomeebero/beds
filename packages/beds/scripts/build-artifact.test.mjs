import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./build-css.mjs', import.meta.url));
const order = ['tokens.css','foundation.css','controls.css','form-fields.css','overlays.css','layout.css','patterns.css','data.css','feedback.css','chat.css','technical.css','feature-card.css'];

test('package build fails closed when canonical documentation references a missing asset',()=>{
 const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'espaco-build-test-'));
 try {
  const fixturePackage = path.join(directory, 'packages', 'beds');
  const fixtureDocs = path.join(directory, 'docs', 'design', 'espaco-library');
  fs.mkdirSync(path.join(fixturePackage, 'scripts'), { recursive:true });
  fs.mkdirSync(path.join(fixturePackage, 'src'), { recursive:true });
  fs.mkdirSync(fixtureDocs, { recursive:true });
  fs.copyFileSync(script, path.join(fixturePackage, 'scripts', 'build-css.mjs'));
  for (const name of order) fs.writeFileSync(path.join(fixturePackage, 'src', name), '/* fixture */');
  fs.writeFileSync(path.join(fixturePackage, 'src', 'reset.css'), '/* reset */');
  fs.writeFileSync(path.join(fixtureDocs, 'README.md'), '[missing](../../../apps/web/labs/espaco-library/evidence/missing.png)');
  const result = spawnSync(process.execPath, [path.join(fixturePackage, 'scripts', 'build-css.mjs')], { encoding:'utf8', cwd:fixturePackage });
  assert.notEqual(result.status,0);
  assert.match(result.stderr, /Package documentation asset is missing/);
 } finally { fs.rmSync(directory, { recursive:true, force:true }); }
});
