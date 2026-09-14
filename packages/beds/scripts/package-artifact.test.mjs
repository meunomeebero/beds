import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { compareArtifactTrees, smokePackedConsumer, validatePackedLayout } from './check-package-artifact.mjs';

const withDirectory = run => {
 const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'espaco-artifact-test-'));
 try { return run(directory); } finally { fs.rmSync(directory, { recursive:true, force:true }); }
};

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

test('consumer smoke resolves the extracted public dist entry, never source',()=>withDirectory(directory=>{
 const packageDirectory = path.join(directory, 'package');
 fs.mkdirSync(path.join(packageDirectory, 'dist'), { recursive:true });
 fs.writeFileSync(path.join(packageDirectory, 'package.json'), JSON.stringify({ name:'beds', type:'module', exports:{ '.':'./dist/index.js' } }));
 fs.writeFileSync(path.join(packageDirectory, 'dist', 'index.js'), 'export function DesignSystemProvider(){} export function Text(){} export function PageContentHeader(){} export function DataTable(){} export function Pagination(){} export function RadioGroup(){} export function FileUploadField(){} export function FilterSelect(){} export function HelpLabel(){} export function Carousel(){} export function FeatureCard(){}');
 smokePackedConsumer(packageDirectory);
}));

test('consumer smoke rejects a legacy manifest disguised by an install alias',()=>withDirectory(directory=>{
 fs.writeFileSync(path.join(directory, 'package.json'), JSON.stringify({name:'@espaco/ui'}));
 assert.throws(()=>smokePackedConsumer(directory), /Expected package name beds/);
}));
