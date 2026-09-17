#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = fileURLToPath(new URL('../', import.meta.url));

function markdownFiles(input, issues) {
  if (!fs.existsSync(input)) {
    issues.push({ code: 'DOC_SCOPE_MISSING', path: input });
    return [];
  }
  if (fs.statSync(input).isDirectory()) {
    return fs.readdirSync(input, { withFileTypes: true }).flatMap(entry =>
      entry.isSymbolicLink() ? [] : markdownFiles(path.join(input, entry.name), issues));
  }
  return input.endsWith('.md') ? [input] : [];
}

// Repository docs use inline Markdown links or reference definitions. Ignore code
// fences, remote URLs and fragment semantics; this is a file-integrity gate.
function localTargets(file) {
  const body = fs.readFileSync(file, 'utf8').replace(/(`{3,}|~{3,})[^\n]*\n[\s\S]*?\1/g, '');
  const targets = [];
  const pattern = /\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+["'][^\n]*?["'])?\s*\)|^\s*\[[^\]]+\]:\s*(?:<([^>]+)>|(\S+))/gm;
  for (const match of body.matchAll(pattern)) {
    const raw = match[1] ?? match[2] ?? match[3] ?? match[4];
    if (/^(?:[a-z][\w+.-]*:|\/\/|#)/i.test(raw)) continue;
    const relative = decodeURIComponent(raw.split(/[?#]/)[0]);
    if (relative) targets.push(path.resolve(path.dirname(file), relative));
  }
  return targets;
}

/** Reads the filesystem, never git ls-files; untracked docs are included. */
export function checkDocs({ inputs, boundary, indexes = [] }) {
  const issues = [];
  const files = [...new Set(inputs.flatMap(input => markdownFiles(path.resolve(input), issues)))];
  if (!files.length) issues.push({ code: 'DOC_SCOPE_EMPTY', path: inputs.join(', ') });
  let links = 0;
  for (const file of files) {
    let targets;
    try { targets = localTargets(file); }
    catch (error) {
      issues.push({ code: 'DOC_PARSE_FAILED', path: `${file}: ${error.message}` });
      continue;
    }
    for (const target of targets) {
      links++;
      const relative = boundary && path.relative(path.resolve(boundary), target);
      const outside = boundary && (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative));
      if (outside) issues.push({ code: 'DOC_OUTSIDE_PACKAGE', path: `${file} -> ${target}` });
      else if (!fs.existsSync(target)) issues.push({ code: 'DOC_LINK_MISSING', path: `${file} -> ${target}` });
    }
  }
  for (const { index, directory } of indexes) {
    if (!fs.existsSync(index)) {
      issues.push({ code: 'DOC_INDEX_MISSING', path: index });
      continue;
    }
    const indexed = new Set(localTargets(index));
    for (const file of markdownFiles(directory, issues)) {
      if (file !== index && !indexed.has(file)) issues.push({ code: 'DOC_NOT_INDEXED', path: `${index} -> ${file}` });
    }
  }
  return { files: files.length, links, issues };
}

function packageDocInputs(root) {
  const skills = path.join(root, 'skills');
  return [
    path.join(root, 'README.md'),
    path.join(root, 'AGENTS.md'),
    path.join(root, 'docs'),
    ...(fs.existsSync(skills) ? [skills] : []),
  ];
}

export function checkPackageDocs(root) {
  return checkDocs({ inputs: packageDocInputs(root), boundary: root });
}

if (process.argv[1] && fs.existsSync(process.argv[1]) && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  try {
    const explicit = process.argv.slice(2);
    const canonical = path.resolve(packageRoot, '../../docs/design/espaco-library');
    const hasCanonical = fs.existsSync(canonical);
    const result = explicit.length
      ? checkDocs({ inputs: explicit })
      : checkDocs({
          inputs: [...packageDocInputs(packageRoot), ...(hasCanonical ? [canonical] : [])],
          indexes: hasCanonical ? [
            { index: path.join(canonical, 'README.md'), directory: canonical },
            { index: path.resolve(packageRoot, '../../README.md'), directory: canonical },
          ] : [],
        });
    for (const issue of result.issues) console.error(`[${issue.code}] ${issue.path}`);
    console.log(`Espaço docs: ${result.files} Markdown files, ${result.links} local targets, ${result.issues.length} violations. Filesystem scope includes untracked files; URLs and fragment semantics not checked.`);
    process.exitCode = result.issues.length ? 1 : 0;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
