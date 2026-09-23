import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { compareArtifactTrees, requiredPackagePaths, smokePackedConsumer, validatePackedLayout } from './check-package-artifact.mjs';
import { checkPackageDocs } from './check-docs.mjs';

const withDirectory = run => {
 const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'espaco-artifact-test-'));
 try { return run(directory); } finally { fs.rmSync(directory, { recursive:true, force:true }); }
};

function writeFixture(root, relative, body = 'fixture') {
 const target = path.join(root, relative);
 fs.mkdirSync(path.dirname(target), { recursive:true });
 fs.writeFileSync(target, body);
}

test('artifact parity detects stale, missing and extra generated files',()=>withDirectory(directory=>{
 const expected = path.join(directory, 'expected');
 const actual = path.join(directory, 'actual');
 fs.mkdirSync(expected); fs.mkdirSync(actual);
 fs.writeFileSync(path.join(expected, 'same.js'), 'same');
 fs.writeFileSync(path.join(expected, 'stale.js'), 'new');
 fs.writeFileSync(path.join(expected, 'missing.js'), 'required');
 fs.writeFileSync(path.join(actual, 'same.js'), 'same');
 fs.writeFileSync(path.join(actual, 'stale.js'), 'old');
 fs.writeFileSync(path.join(actual, 'extra.js'), 'obsolete');
 const codes = new Set(compareArtifactTrees(expected, actual).map(issue=>issue.code));
 assert.deepEqual(codes, new Set(['ARTIFACT_STALE','ARTIFACT_MISSING','ARTIFACT_EXTRA']));
}));

test('packed-layout check requires API, CSS and documentation files',()=>withDirectory(directory=>{
 fs.mkdirSync(path.join(directory, 'package', 'dist'), { recursive:true });
 fs.writeFileSync(path.join(directory, 'package', 'dist', 'index.js'), 'export {}');
 const issues = validatePackedLayout(directory, ['package/dist/index.js', 'package/dist/styles.css', 'package/docs/README.md']);
 assert.deepEqual(issues.map(issue=>issue.path), ['package/dist/styles.css', 'package/docs/README.md']);
}));

test('package manifest ships every skill file and the layout gate detects any omitted file',()=>withDirectory(directory=>{
 const root = path.join(directory, 'source', 'packages', 'beds');
 const manifest = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
 writeFixture(root, 'package.json', JSON.stringify({ name:'beds', version:'0.0.0-test', files:manifest.files }));
 writeFixture(root, 'README.md', '[skill](skills/example/SKILL.md)');
 writeFixture(root, 'AGENTS.md', '[docs](docs/README.md)');
 writeFixture(root, 'docs/README.md', '[skill](../skills/example/SKILL.md)');
 for (const file of ['index.js', 'index.d.ts', 'styles.css', 'reset.css', 'manifest.json']) writeFixture(root, `dist/${file}`);
 const skillFiles = [
  ['skills/example/SKILL.md', '[principles](references/principles.md)'],
  ['skills/example/references/principles.md', '[example](../assets/example.txt) [docs](../../../docs/README.md)'],
  ['skills/example/agents/openai.yaml', 'interface:\n  display_name: Example'],
  ['skills/example/assets/example.txt', 'Example asset'],
 ];
 for (const [file, body] of skillFiles) writeFixture(root, file, body);
 const required = requiredPackagePaths(root);
 assert.deepEqual(required.filter(file=>file.startsWith('package/skills/')).sort(), skillFiles.map(([file])=>`package/${file}`).sort());

 const packed = spawnSync('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', directory, '--cache', path.join(directory, 'npm-cache')], { cwd:root, encoding:'utf8' });
 assert.equal(packed.status, 0, packed.stderr || packed.error?.message);
 const archive = path.join(directory, JSON.parse(packed.stdout)[0].filename);
 const extracted = path.join(directory, 'extracted');
 fs.mkdirSync(extracted);
 const unpacked = spawnSync('tar', ['-xzf', archive, '-C', extracted], { encoding:'utf8' });
 assert.equal(unpacked.status, 0, unpacked.stderr || unpacked.error?.message);
 assert.deepEqual(validatePackedLayout(extracted, required), []);
 assert.deepEqual(checkPackageDocs(path.join(extracted, 'package')).issues, []);

 for (const [file, body] of skillFiles) {
  const relative = `package/${file}`;
  assert.equal(fs.readFileSync(path.join(extracted, relative), 'utf8'), body);
  fs.unlinkSync(path.join(extracted, relative));
  assert.deepEqual(validatePackedLayout(extracted, required), [{ code:'PACKED_FILE_MISSING', path:relative }]);
  writeFixture(extracted, relative, body);
 }
}));

test('required package paths allow fixtures without an optional skills directory',()=>withDirectory(directory=>{
 const required = requiredPackagePaths(path.join(directory, 'packages', 'beds'));
 assert.ok(required.includes('package/dist/index.js'));
 assert.ok(!required.some(file=>file.startsWith('package/skills/')));
}));

test('consumer smoke resolves the extracted public dist entry, never source',()=>withDirectory(directory=>{
 const packageDirectory = path.join(directory, 'package');
 fs.mkdirSync(path.join(packageDirectory, 'dist'), { recursive:true });
 fs.writeFileSync(path.join(packageDirectory, 'package.json'), JSON.stringify({ name:'beds', type:'module', exports:{ '.':'./dist/index.js' } }));
 fs.writeFileSync(path.join(packageDirectory, 'dist', 'index.js'), 'export function DesignSystemProvider(){} export function Text(){} export function PageHeader(){} export function DataTable(){} export function Pagination(){} export function RadioGroup(){} export function FileUploadField(){} export function FilterSelect(){} export function HelpLabel(){} export function Carousel(){} export function FeatureCard(){}');
 smokePackedConsumer(packageDirectory);
}));

test('consumer smoke rejects a legacy manifest disguised by an install alias',()=>withDirectory(directory=>{
 fs.writeFileSync(path.join(directory, 'package.json'), JSON.stringify({name:'@espaco/ui'}));
 assert.throws(()=>smokePackedConsumer(directory), /Expected package name beds/);
}));
