import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import ts from '/Users/robertojunior/Documents/dev/me/bero/beds/node_modules/typescript/lib/typescript.js';

const root = process.cwd();
const srcRoot = path.join(root, 'packages/beds/src');
const indexPath = path.join(srcRoot, 'index.ts');
const priorPath = '/Users/robertojunior/Documents/Codex/2026-09-19/beds-tech-lead/outputs/BER-9-export-task-matrix.json';
const ownerPath = '/Users/robertojunior/Documents/Codex/2026-09-19/beds-tech-lead/outputs/BER-9-owner-reconciliation.json';

const rel = (file) => path.relative(root, file).split(path.sep).join('/');
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const sourceFiles = fs.readdirSync(srcRoot).filter((name) => /\.(ts|tsx)$/.test(name)).map((name) => path.join(srcRoot, name)).sort();
const catalogRoot = path.join(root, 'apps/web/labs/espaco-library');
const catalogFiles = fs.existsSync(catalogRoot)
  ? fs.readdirSync(catalogRoot, { recursive: true }).filter((name) => /\.(ts|tsx)$/.test(name)).map((name) => path.join(catalogRoot, name)).sort()
  : [];

const compilerOptions = {
  jsx: ts.JsxEmit.ReactJSX,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Node10,
  target: ts.ScriptTarget.ES2022,
  allowJs: false,
  skipLibCheck: true,
  strict: false,
  noResolve: false,
  baseUrl: root,
  typeRoots: ['/Users/robertojunior/Documents/dev/me/bero/beds/node_modules/@types'],
  paths: {
    react: ['/Users/robertojunior/Documents/dev/me/bero/beds/node_modules/react'],
    'react/jsx-runtime': ['/Users/robertojunior/Documents/dev/me/bero/beds/node_modules/react/jsx-runtime'],
    'motion/react': ['/Users/robertojunior/Documents/dev/me/bero/beds/node_modules/motion/react'],
  },
};
const program = ts.createProgram([indexPath], compilerOptions);
const checker = program.getTypeChecker();
const indexSource = program.getSourceFile(indexPath);
if (!indexSource) throw new Error(`Could not parse ${indexPath}`);

function lineOf(node) {
  return ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart()).line + 1;
}

function symbolForExport(name, exportDecl) {
  const local = exportDecl.name ?? exportDecl;
  const symbol = checker.getSymbolAtLocation(local);
  if (!symbol) return null;
  return (symbol.flags & ts.SymbolFlags.Alias) ? checker.getAliasedSymbol(symbol) : symbol;
}

function literalMembers(type) {
  if (!type || !type.isUnion()) return null;
  const values = [];
  for (const member of type.types) {
    if (member.flags & ts.TypeFlags.StringLiteral) values.push(member.value);
    else if (member.flags & ts.TypeFlags.NumberLiteral) values.push(member.value);
    else return null;
  }
  return values.length ? values : null;
}

function aliasDeclaration(typeNode) {
  if (!ts.isTypeReferenceNode(typeNode)) return null;
  const symbol = checker.getSymbolAtLocation(typeNode.typeName);
  if (!symbol) return null;
  const resolved = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
  return resolved.declarations?.[0] ?? null;
}

function literalMembersFromNode(typeNode, seen = new Set()) {
  if (!typeNode) return null;
  const direct = literalMembers(checker.getTypeAtLocation(typeNode));
  if (direct) return direct;
  if (ts.isParenthesizedTypeNode(typeNode)) return literalMembersFromNode(typeNode.type, seen);
  if (ts.isTypeReferenceNode(typeNode)) {
    const declaration = aliasDeclaration(typeNode);
    if (!declaration || seen.has(declaration)) return null;
    seen.add(declaration);
    if (ts.isTypeAliasDeclaration(declaration)) return literalMembersFromNode(declaration.type, seen);
  }
  return null;
}

function propTypeNodeFromDeclaration(declaration) {
  if (ts.isFunctionDeclaration(declaration) || ts.isMethodDeclaration(declaration)) return declaration.parameters[0]?.type ?? null;
  if (!ts.isVariableDeclaration(declaration)) return null;
  const initializer = declaration.initializer;
  if (initializer && ts.isCallExpression(initializer) && initializer.typeArguments?.length) {
    return initializer.typeArguments.at(-1) ?? null;
  }
  if (initializer && (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer))) return initializer.parameters[0]?.type ?? null;
  return null;
}

function collectPropVariants(typeNode, variants, seen = new Set()) {
  if (!typeNode) return;
  if (ts.isParenthesizedTypeNode(typeNode)) return collectPropVariants(typeNode.type, variants, seen);
  if (ts.isIntersectionTypeNode(typeNode) || ts.isUnionTypeNode(typeNode)) {
    for (const member of typeNode.types) collectPropVariants(member, variants, seen);
    return;
  }
  if (ts.isTypeReferenceNode(typeNode)) {
    const declaration = aliasDeclaration(typeNode);
    if (!declaration || seen.has(declaration)) return;
    seen.add(declaration);
    if (ts.isTypeAliasDeclaration(declaration)) return collectPropVariants(declaration.type, variants, seen);
    if (ts.isInterfaceDeclaration(declaration)) return collectPropVariants(ts.factory.createTypeLiteralNode(declaration.members), variants, seen);
  }
  if (!ts.isTypeLiteralNode(typeNode)) return;
  for (const member of typeNode.members) {
    if (!ts.isPropertySignature(member) || !member.type || !member.name) continue;
    const values = literalMembersFromNode(member.type);
    if (values && values.length <= 100) variants.push({ prop: member.name.getText().replace(/^['"]|['"]$/g, ''), values, sourceLine: lineOf(member), type: compact(member.type.getText(), 220) });
  }
}

function typeText(type, node) {
  return checker.typeToString(type, node, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope)
    .replace(/\s+/g, ' ')
    .trim();
}

function declarationSummary(symbol, declaration) {
  const node = declaration;
  if (ts.isFunctionDeclaration(node)) {
    return `function ${node.name?.getText() ?? symbol.name}(${node.parameters.map((p) => p.getText()).join(', ')})`;
  }
  if (ts.isVariableDeclaration(node)) {
    const t = checker.getTypeOfSymbolAtLocation(symbol, node);
    return `const ${symbol.name}: ${typeText(t, node)}`;
  }
  if (ts.isClassDeclaration(node)) return `class ${node.name?.getText() ?? symbol.name}`;
  if (ts.isTypeAliasDeclaration(node)) return `type ${node.name.getText()} = ${node.type.getText()}`;
  if (ts.isInterfaceDeclaration(node)) return `interface ${node.name.getText()} { ${node.members.map((m) => m.getText()).join(' ')} }`;
  if (ts.isEnumDeclaration(node)) return `enum ${node.name.getText()}`;
  return node.getText().split(/\r?\n/)[0];
}

function compact(text, max = 360) {
  const normalized = String(text).replace(/\s+/g, ' ').trim();
  return normalized.length > max ? `${normalized.slice(0, max - 1)}…` : normalized;
}

function getApiAndVariants(symbol, declaration, kind) {
  const variants = [];
  if (kind === 'type') {
    if (ts.isTypeAliasDeclaration(declaration)) {
      const values = literalMembers(checker.getTypeAtLocation(declaration.type));
      if (values) variants.push({ prop: '(exported type)', values, sourceLine: lineOf(declaration), type: declaration.type.getText() });
    }
    return { api: compact(declarationSummary(symbol, declaration)), variants };
  }
  collectPropVariants(propTypeNodeFromDeclaration(declaration), variants);
  if (variants.length) return { api: compact(declarationSummary(symbol, declaration)), variants };
  const valueType = checker.getTypeOfSymbolAtLocation(symbol, declaration);
  const signature = valueType.getCallSignatures?.()[0];
  if (signature?.parameters?.length) {
    const param = signature.parameters[0];
    const paramType = checker.getTypeOfSymbolAtLocation(param, declaration);
    for (const property of checker.getPropertiesOfType(paramType)) {
      const propertyType = checker.getTypeOfSymbolAtLocation(property, declaration);
      const values = literalMembers(propertyType);
      if (values && values.length <= 100) variants.push({ prop: property.name, values, sourceLine: lineOf(property.valueDeclaration ?? property.declarations?.[0] ?? declaration), type: typeText(propertyType, declaration) });
    }
  }
  return { api: compact(declarationSummary(symbol, declaration)), variants };
}

function localImports(file) {
  const source = program.getSourceFile(file);
  if (!source) return [];
  const deps = [];
  source.forEachChild((node) => {
    if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) return;
    const value = node.moduleSpecifier.text;
    if (!value.startsWith('.')) return;
    const resolved = ts.resolveModuleName(value, file, compilerOptions, ts.sys).resolvedModule?.resolvedFileName;
    if (resolved && resolved.startsWith(srcRoot)) deps.push(rel(resolved));
  });
  return [...new Set(deps)].sort();
}

function consumerMatches(name) {
  const pattern = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`);
  return catalogFiles.filter((file) => pattern.test(fs.readFileSync(file, 'utf8'))).map(rel);
}

function familyFor(file) {
  return path.basename(file).replace(/\.(tsx?|jsx?)$/, '');
}

const rows = [];
for (const statement of indexSource.statements) {
  if (!ts.isExportDeclaration(statement) || !statement.exportClause || !ts.isNamedExports(statement.exportClause)) continue;
  const reexportModule = ts.isStringLiteral(statement.moduleSpecifier) ? statement.moduleSpecifier.text : null;
  for (const specifier of statement.exportClause.elements) {
    const name = specifier.name.text;
    const isType = statement.isTypeOnly || specifier.isTypeOnly;
    const symbol = symbolForExport(specifier, specifier);
    const declaration = symbol?.declarations?.[0];
    const sourceFile = declaration?.getSourceFile()?.fileName;
    const resolvedSource = sourceFile && sourceFile.startsWith(root) ? rel(sourceFile) : sourceFile ? rel(sourceFile) : null;
    const kind = isType ? 'type' : (name[0] === name[0]?.toUpperCase() && name[0] !== name[0]?.toLowerCase() ? 'component' : 'runtime');
    const extracted = declaration ? getApiAndVariants(symbol, declaration, kind) : { api: null, variants: [] };
    rows.push({
      order: rows.length + 1,
      export: name,
      kind,
      family: resolvedSource ? familyFor(resolvedSource) : (reexportModule?.replace(/^\.\//, '') ?? 'unknown'),
      sourceFile: resolvedSource,
      sourceLine: declaration ? lineOf(declaration) : null,
      indexLine: lineOf(statement),
      reexportModule,
      api: extracted.api,
      variants: extracted.variants,
      consumers: consumerMatches(name),
      dependencies: resolvedSource ? localImports(sourceFile) : [],
    });
  }
}

const prior = JSON.parse(fs.readFileSync(priorPath, 'utf8'));
const ownerReconciliation = JSON.parse(fs.readFileSync(ownerPath, 'utf8'));
const priorByName = new Map(prior.exports.map((row) => [row.name, row]));
const currentByName = new Map(rows.map((row) => [row.export, row]));
const added = rows.filter((row) => !priorByName.has(row.export)).map((row) => row.export);
const removed = prior.exports.filter((row) => !currentByName.has(row.name)).map((row) => row.name);
const changed = rows.filter((row) => {
  const old = priorByName.get(row.export);
  if (!old) return false;
  return old.kind !== row.kind || old.sourceFile !== row.sourceFile || JSON.stringify(old.variants.map((v) => ({ prop: v.prop, values: v.values }))) !== JSON.stringify(row.variants.map((v) => ({ prop: v.prop, values: v.values })));
}).map((row) => ({ export: row.export, previous: { kind: priorByName.get(row.export).kind, sourceFile: priorByName.get(row.export).sourceFile, variants: priorByName.get(row.export).variants.map((v) => ({ prop: v.prop, values: v.values })) }, current: { kind: row.kind, sourceFile: row.sourceFile, variants: row.variants.map((v) => ({ prop: v.prop, values: v.values })) } }));

const sourceHashRows = [...new Set([...sourceFiles, indexPath, ...catalogFiles])].sort().map((file) => ({ path: rel(file), sha256: sha256(file) }));
const result = {
  snapshot: { base: 'd5f7f15693e51f8a4234ecb366bc8b2ad44ab545', head: 'd5f7f15693e51f8a4234ecb366bc8b2ad44ab545', workingTree: 'clean' },
  counts: { exports: rows.length, components: rows.filter((r) => r.kind === 'component').length, runtime: rows.filter((r) => r.kind === 'runtime').length, types: rows.filter((r) => r.kind === 'type').length, variantMembers: rows.reduce((n, r) => n + r.variants.reduce((m, v) => m + v.values.length, 0), 0) },
  rows,
  comparison: { baselineArtifact: priorPath, added, removed, changed, baselineCounts: prior.counts },
  ownerReconciliation: { sourceArtifact: ownerPath, verifiedAt: ownerReconciliation.verifiedAt, owners: ownerReconciliation.owners },
  sourceHashes: sourceHashRows,
};
fs.writeFileSync(path.join(root, 'work/ber9-extract.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ counts: result.counts, added, removed, changed: changed.length, changedNames: changed.map((x) => x.export), owners: ownerReconciliation.owners.length }, null, 2));
