#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { checkPackageDocs } from './check-docs.mjs';

const require = createRequire(import.meta.url);
const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function filesIn(directory, prefix = '') {
  if (!fs.existsSync(directory)) return new Map();
  const files = new Map();
  for (const entry of fs.readdirSync(directory, { withFileTypes:true }).sort((left, right) => left.name.localeCompare(right.name))) {
    const relative = path.join(prefix, entry.name);
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) for (const [child, body] of filesIn(absolute, relative)) files.set(child, body);
    else if (entry.isFile()) files.set(relative, fs.readFileSync(absolute));
  }
  return files;
}

function run(command, args, options) {
  const result = spawnSync(command, args, { encoding:'utf8', ...options });
  if (result.error) throw new Error(`${command} could not start: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed:\n${result.stderr || result.stdout}`);
  return result.stdout;
}

function typescriptNodeModules() {
  try { return path.dirname(path.dirname(require.resolve('typescript/package.json'))); }
  catch { throw new Error('TypeScript must be installed to rebuild an isolated artifact.'); }
}

/** Compares generated artifact directories exactly, including stale extra files. */
export function compareArtifactTrees(expectedDirectory, actualDirectory) {
  const expected = filesIn(expectedDirectory);
  const actual = filesIn(actualDirectory);
  const issues = [];
  for (const [relative, body] of expected) {
    if (!actual.has(relative)) issues.push({ code:'ARTIFACT_MISSING', path:relative });
    else if (!body.equals(actual.get(relative))) issues.push({ code:'ARTIFACT_STALE', path:relative });
  }
  for (const relative of actual.keys()) if (!expected.has(relative)) issues.push({ code:'ARTIFACT_EXTRA', path:relative });
  return issues;
}

function prepareRebuild(root) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'espaco-artifact-'));
  try {
    const stagedPackage = path.join(temporary, 'packages', 'beds');
    const sourceDocs = path.resolve(root, '../../docs/design/espaco-library');
    const sourceLab = path.resolve(root, '../../apps/web/labs/espaco-library');
    fs.mkdirSync(path.dirname(stagedPackage), { recursive:true });
    fs.cpSync(root, stagedPackage, { recursive:true, filter:source => !source.includes(`${path.sep}node_modules${path.sep}`) && !source.endsWith(`${path.sep}node_modules`) });
    fs.mkdirSync(path.dirname(path.join(temporary, 'docs', 'design', 'espaco-library')), { recursive:true });
    fs.cpSync(sourceDocs, path.join(temporary, 'docs', 'design', 'espaco-library'), { recursive:true });
    if (fs.existsSync(sourceLab)) {
      fs.mkdirSync(path.dirname(path.join(temporary, 'apps', 'web', 'labs', 'espaco-library')), { recursive:true });
      fs.cpSync(sourceLab, path.join(temporary, 'apps', 'web', 'labs', 'espaco-library'), { recursive:true });
    }
    fs.rmSync(path.join(stagedPackage, 'dist'), { recursive:true, force:true });
    fs.rmSync(path.join(stagedPackage, 'docs'), { recursive:true, force:true });
    fs.symlinkSync(typescriptNodeModules(), path.join(stagedPackage, 'node_modules'));
    run(process.execPath, [require.resolve('typescript/bin/tsc'), '-p', path.join(stagedPackage, 'tsconfig.build.json')], { cwd:stagedPackage });
    run(process.execPath, [path.join(stagedPackage, 'scripts', 'build-css.mjs')], { cwd:stagedPackage });
    return { temporary, stagedPackage };
  } catch (error) {
    fs.rmSync(temporary, { recursive:true, force:true });
    throw error;
  }
}

function requiredPackagePaths(root) {
  const docs = [...filesIn(path.resolve(root, '../../docs/design/espaco-library')).keys()]
    .filter(file => file.endsWith('.md'))
    .map(file => path.posix.join('package', 'docs', file));
  const fonts = [...filesIn(path.join(root, 'fonts')).keys()]
    .map(file => path.posix.join('package', 'fonts', file));
  return [
    'package/package.json',
    'package/README.md',
    'package/AGENTS.md',
    'package/dist/index.js',
    'package/dist/index.d.ts',
    'package/dist/styles.css',
    'package/dist/reset.css',
    ...docs,
    ...fonts,
  ];
}

export function validatePackedLayout(packageDirectory, requiredPaths) {
  return requiredPaths.filter(relative => !fs.existsSync(path.join(packageDirectory, relative))).map(relative => ({ code:'PACKED_FILE_MISSING', path:relative }));
}

/** Imports a package from a fresh consumer node_modules directory; no source alias is present. */
export function smokePackedConsumer(packageDirectory, { moduleRoot = null } = {}) {
  const manifest = JSON.parse(fs.readFileSync(path.join(packageDirectory, 'package.json'), 'utf8'));
  if (manifest.name !== 'beds') throw new Error(`Expected package name beds; received ${manifest.name}.`);
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'espaco-consumer-'));
  try {
    const consumerModules = path.join(temporary, 'node_modules');
    fs.mkdirSync(consumerModules, { recursive:true });
    fs.symlinkSync(packageDirectory, path.join(consumerModules, 'beds'));
    if (moduleRoot) fs.symlinkSync(moduleRoot, path.join(packageDirectory, 'node_modules'));
    const consumer = path.join(temporary, 'consumer.mjs');
    fs.writeFileSync(consumer, [
      "const resolved = import.meta.resolve('beds');",
      "if (!resolved.includes('/dist/index.js') || resolved.includes('/src/')) throw new Error(`Consumer resolved an invalid library entry: ${resolved}`);",
      "const library = await import('beds');",
      "for (const name of ['DesignSystemProvider', 'Text', 'PageContentHeader', 'DataTable', 'Pagination', 'FilterSelect', 'HelpLabel', 'Carousel', 'FeatureCard']) if (typeof library[name] !== 'function') throw new Error(`Missing public package export: ${name}`);",
      "console.log(resolved);",
    ].join('\n'));
    run(process.execPath, [consumer], { cwd:temporary });
  } finally { fs.rmSync(temporary, { recursive:true, force:true }); }
}

export function checkPackageArtifact({ root = PACKAGE_ROOT } = {}) {
  root = path.resolve(root);
  let rebuilt;
  try { rebuilt = prepareRebuild(root); }
  catch (error) {
    return {
      issues:[{ code:'ARTIFACT_REBUILD_FAILED', path:error.message }],
      packageVersion:JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version,
      smoke:'not-run',
    };
  }
  try {
    const issues = [
      ...compareArtifactTrees(path.join(rebuilt.stagedPackage, 'dist'), path.join(root, 'dist')),
      ...compareArtifactTrees(path.join(rebuilt.stagedPackage, 'docs'), path.join(root, 'docs')),
    ];
    if (issues.length) return { issues, packageVersion:JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version, smoke:'not-run' };

    const archiveDirectory = path.join(rebuilt.temporary, 'archive');
    fs.mkdirSync(archiveDirectory);
    const packed = JSON.parse(run('npm', ['pack', '--json', '--pack-destination', archiveDirectory, '--ignore-scripts'], { cwd:root }));
    const archive = path.join(archiveDirectory, packed[0]?.filename ?? '');
    if (!fs.existsSync(archive)) throw new Error('npm pack did not report a readable archive.');
    const extracted = path.join(rebuilt.temporary, 'extracted');
    fs.mkdirSync(extracted);
    run('tar', ['-xzf', archive, '-C', extracted], { cwd:root });
    const layoutIssues = validatePackedLayout(extracted, requiredPackagePaths(root));
    if (layoutIssues.length) return { issues:layoutIssues, packageVersion:packed[0]?.version, smoke:'not-run' };
    const docs = checkPackageDocs(path.join(extracted, 'package'));
    if (docs.issues.length) return { issues:docs.issues, packageVersion:packed[0]?.version, smoke:'not-run' };
    smokePackedConsumer(path.join(extracted, 'package'), { moduleRoot:typescriptNodeModules() });
    return { issues:[], packageVersion:packed[0]?.version, archiveSha256:crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex'), smoke:'passed' };
  } finally { fs.rmSync(rebuilt.temporary, { recursive:true, force:true }); }
}

if (process.argv[1] && fs.existsSync(process.argv[1]) && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  try {
    const result = checkPackageArtifact();
    for (const issue of result.issues) console.error(`[${issue.code}] ${issue.path}`);
    console.log(`Espaço package artifact: v${result.packageVersion}, ${result.issues.length} violations, consumer smoke ${result.smoke}.`);
    if (result.archiveSha256) console.log(`Packed archive SHA-256: ${result.archiveSha256}`);
    process.exitCode = result.issues.length ? 1 : 0;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
