import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./build-css.mjs', import.meta.url));
const realTailwind = fileURLToPath(new URL('../src/tailwind.css', import.meta.url));
const realNodeModules = fileURLToPath(new URL('../../../node_modules', import.meta.url));
const order = ['tokens.css','foundation.css','controls.css','form-fields.css','decisions.css','overlays.css','layout.css','patterns.css','disclosure.css','data.css','feedback.css','chat.css','technical.css','feature-card.css','empty-state-card.css','pricing.css','records.css','input-otp.css','paged-carousel.css','toast.css','application-card.css','application-board.css','onboarding.css','account-credits.css','forum-topic.css','date-item.css','payment-confirmation.css','blog-post.css','landing-footer.css','benefits.css','landing.css','processing.css','results.css'];
order.push('checkout.css');

/** Temp monorepo with the real Tailwind toolchain (symlinked node_modules) and fixture stylesheets. */
function fixture({ docs = null, sources = {} } = {}) {
 const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'espaco-build-test-'));
 const fixturePackage = path.join(directory, 'packages', 'beds');
 fs.mkdirSync(path.join(fixturePackage, 'scripts'), { recursive:true });
 fs.mkdirSync(path.join(fixturePackage, 'src'), { recursive:true });
 fs.symlinkSync(realNodeModules, path.join(directory, 'node_modules'), 'dir');
 fs.copyFileSync(script, path.join(fixturePackage, 'scripts', 'build-css.mjs'));
 fs.copyFileSync(realTailwind, path.join(fixturePackage, 'src', 'tailwind.css'));
 for (const name of order) fs.writeFileSync(path.join(fixturePackage, 'src', name), `/* fixture ${name} */`);
 fs.writeFileSync(path.join(fixturePackage, 'src', 'reset.css'), '/* reset */');
 for (const [name, body] of Object.entries(sources)) fs.writeFileSync(path.join(fixturePackage, 'src', name), body);
 if (docs !== null) {
  const fixtureDocs = path.join(directory, 'docs', 'design', 'espaco-library');
  fs.mkdirSync(fixtureDocs, { recursive:true });
  fs.writeFileSync(path.join(fixtureDocs, 'README.md'), docs);
 }
 const run = () => spawnSync(process.execPath, [path.join(fixturePackage, 'scripts', 'build-css.mjs')], { encoding:'utf8', cwd:fixturePackage });
 const cleanup = () => fs.rmSync(directory, { recursive:true, force:true });
 return { fixturePackage, run, cleanup };
}

test('package build fails closed when canonical documentation references a missing asset',()=>{
 const { run, cleanup } = fixture({ docs:'[missing](../../../apps/web/labs/espaco-library/evidence/missing.png)' });
 try {
  const result = run();
  assert.notEqual(result.status,0);
  assert.match(result.stderr, /Package documentation asset is missing/);
 } finally { cleanup(); }
});

test('package build emits tokens, component CSS, then unlayered Tailwind utilities in BEDS geometry',()=>{
 const { fixturePackage, run, cleanup } = fixture({ sources:{ 'controls.css':'.es-root .es-button{color:red}', 'probe.tsx':'export const probe = "h-9 rounded-lg text-sm bg-primary";' } });
 try {
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  const css = fs.readFileSync(path.join(fixturePackage, 'dist', 'styles.css'), 'utf8');
  assert.ok(css.indexOf('/* fixture tokens.css */') < css.indexOf('.es-root .es-button{color:red}'), 'tokens precede component CSS');
  assert.ok(css.indexOf('.es-root .es-button{color:red}') < css.indexOf('.h-9{height:36px}'), 'utilities come after component CSS');
  assert.doesNotMatch(css, /@layer utilities/, 'utilities must be unlayered so they can beat unlayered .es-root rules');
  assert.match(css, /\.rounded-lg\{border-radius:var\(--radius\)\}/);
  assert.match(css, /\.text-sm\{font-size:13px;line-height:var\(--tw-leading,20px\)\}/);
  assert.match(css, /\.bg-primary\{background-color:var\(--primary\)\}/);
 } finally { cleanup(); }
});
