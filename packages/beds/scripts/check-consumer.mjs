#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const CODE = /\.(?:[cm]?[jt]sx?)$/i;
const STYLE = /\.(?:css|scss|sass|less|styl|stylus)$/i;
const SKIP = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.next']);
const FONT_PROPS = new Set(['font', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'fontVariant', 'fontStretch', 'fontKerning', 'fontFeatureSettings', 'fontVariationSettings', 'lineHeight', 'letterSpacing', 'textTransform', 'textDecoration', 'textShadow']);
const SPACING_PROPS = new Set(['density', 'gap', 'rowGap', 'columnGap', 'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'inset', 'top', 'right', 'bottom', 'left', 'width', 'minWidth', 'maxWidth', 'height', 'minHeight', 'maxHeight', 'radius', 'borderRadius']);
const COLOR_PROPS = new Set(['color', 'background', 'backgroundColor', 'border', 'borderColor', 'boxShadow', 'fill', 'stroke', 'outlineColor', 'opacity', 'transform', 'zIndex']);
const ICON_PROPS = new Set(['size', 'strokeWidth', 'strokeLinecap', 'strokeLinejoin', 'viewBox']);
const VISUAL_PROPS = new Set(['className', 'style', 'css', 'sx', 'tw', 'as', 'asChild', 'dangerouslySetInnerHTML', ...FONT_PROPS, ...SPACING_PROPS, ...COLOR_PROPS, ...ICON_PROPS]);
const NAMED_SEMANTIC_VISUAL_PROPS = new Map([
  ['Stack', new Map([['gap', new Set(['tight', 'default', 'section'])]])],
  ['Inline', new Map([['gap', new Set(['tight', 'default'])]])],
]);
const STYLE_MODULE = /^(?:styled-components|styled-jsx|@emotion(?:\/|$)|@stitches(?:\/|$)|@vanilla-extract(?:\/|$)|@pandacss(?:\/|$)|twin\.macro|tailwindcss|@tailwindcss(?:\/|$)|goober|linaria|@linaria(?:\/|$)|lucide(?:-|\/|$)|react-icons(?:\/|$)|@phosphor-icons(?:\/|$)|@heroicons(?:\/|$)|@radix-ui\/react-icons)/;
const COLOR = /^(?:#[\da-f]{3,8}|(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color|color-mix)\s*\()/i;
const STYLE_KEYS = new Set([...VISUAL_PROPS, 'background', 'backgroundColor', 'border', 'borderColor', 'fill', 'stroke', 'boxShadow', 'font', 'fontStyle', 'fontVariant', 'textShadow', 'outlineColor']);

function visualPropIssue(name) {
  if (FONT_PROPS.has(name)) return ['FONT_OVERRIDE', `Consumer prop ${name} overrides library typography.`];
  if (SPACING_PROPS.has(name)) return ['SPACING_OVERRIDE', `Consumer prop ${name} overrides library geometry.`];
  if (COLOR_PROPS.has(name)) return ['COLOR_OVERRIDE', `Consumer prop ${name} overrides fixed library colors.`];
  if (ICON_PROPS.has(name)) return ['ICON_OVERRIDE', `Consumer prop ${name} overrides the fixed icon contract.`];
  return ['VISUAL_PROP', `Consumer prop ${name} bypasses the design contract.`];
}

function namedSemanticValues(component, prop) {
  return NAMED_SEMANTIC_VISUAL_PROPS.get(component)?.get(prop);
}

function resolveLocal(from, specifier) {
  const base = path.resolve(path.dirname(from), specifier);
  const candidates = [base, ...['.tsx', '.ts', '.jsx', '.js', '.mts', '.mjs', '/index.tsx', '/index.ts', '/index.jsx', '/index.js'].map(ext => base + ext)];
  return candidates.find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
}

/** Audit explicitly supplied UI roots; local imports are included transitively. No files are written. */
export function checkConsumerPaths(inputs) {
  if (!inputs.length) throw new Error('Supply at least one explicit consumer file or directory.');
  const queue = [];
  const seen = new Set();
  const issues = [];
  let files = 0;
  const report = (file, code, message, source, node) => {
    const pos = source && node ? source.getLineAndCharacterOfPosition(node.getStart(source)) : { line: 0, character: 0 };
    issues.push({ file, line: pos.line + 1, column: pos.character + 1, code, message });
  };
  const enqueue = input => {
    const absolute = path.resolve(input);
    if (!fs.existsSync(absolute)) { report(absolute, 'MISSING_PATH', 'Configured consumer path does not exist.'); return; }
    const real = fs.realpathSync(absolute);
    if (seen.has(real)) return;
    seen.add(real);
    if (fs.statSync(real).isDirectory()) {
      for (const entry of fs.readdirSync(real).sort()) if (!SKIP.has(entry)) enqueue(path.join(real, entry));
    } else if (CODE.test(real) || STYLE.test(real)) queue.push(real);
  };
  inputs.forEach(enqueue);

  for (let index = 0; index < queue.length; index++) {
    const file = queue[index];
    files++;
    if (STYLE.test(file)) {
      // Apps own layout, not BEDS internals. This is a bounded source check,
      // not a CSS parser or proof of rendered accessibility.
      const css = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      if (/\.es-[\w-]+|--es-[\w-]+\s*:/.test(css)) report(file, 'PRIVATE_LIBRARY_STYLE', 'Use app-owned selectors and read BEDS tokens; do not override private .es-* selectors or declare --es-* properties.');
      continue;
    }
    const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, /x$/i.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    for (const error of source.parseDiagnostics) report(file, 'PARSE_ERROR', ts.flattenDiagnosticMessageText(error.messageText, ' '));
    const imports = new Map();
    const constants = new Map();
    const localComponents = new Set();
    const issue = (node, code, message) => report(file, code, message, source, node);
    const registerImport = (specifier, node) => {
      if (specifier === '@espaco/ui' || specifier.startsWith('@espaco/ui/')) issue(node, 'LEGACY_PACKAGE_IMPORT', 'Import from beds; the previous package name is not an alias.');
      if (specifier === 'beds/styles.css' || specifier === 'beds/reset.css' || specifier === 'beds/tokens' || specifier === 'beds/manifest.json') return;
      if (specifier.startsWith('beds/')) issue(node, 'PRIVATE_LIBRARY_IMPORT', 'Use the public beds entry, beds/tokens metadata, beds/manifest.json, or fixed styles.css/reset.css exports.');
      if (specifier.startsWith('.')) {
        const resolved = resolveLocal(file, specifier);
        if (!resolved) issue(node, 'UNRESOLVED_LOCAL_IMPORT', `Cannot audit local dependency ${specifier}.`);
        else enqueue(resolved);
        return resolved;
      }
    };
    for (const statement of source.statements) {
      if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
        const module = statement.moduleSpecifier.text;
        const local = registerImport(module, statement);
        const clause = statement.importClause;
        if (clause?.name) imports.set(clause.name.text, { module, local, exported: 'default' });
        if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings)) imports.set(clause.namedBindings.name.text, { module, local, exported: '*' });
        if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) for (const binding of clause.namedBindings.elements) imports.set(binding.name.text, { module, local, exported: binding.propertyName?.text ?? binding.name.text });
      }
      if (ts.isExportDeclaration(statement) && statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)) registerImport(statement.moduleSpecifier.text, statement);
      if (ts.isFunctionDeclaration(statement) && statement.name) localComponents.add(statement.name.text);
      if (ts.isVariableStatement(statement)) for (const declaration of statement.declarationList.declarations) if (ts.isIdentifier(declaration.name)) {
        if (statement.declarationList.flags & ts.NodeFlags.Const) constants.set(declaration.name.text, declaration.initializer);
        if (declaration.initializer && (ts.isArrowFunction(declaration.initializer) || ts.isFunctionExpression(declaration.initializer))) localComponents.add(declaration.name.text);
      }
    }
    const unwrap = node => {
      while (node && (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isNonNullExpression(node))) node = node.expression;
      return node;
    };
    const staticString = (node, visited = new Set()) => {
      node = unwrap(node);
      if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
      if (ts.isIdentifier(node) && constants.has(node.text) && !visited.has(node.text)) return staticString(constants.get(node.text), new Set([...visited, node.text]));
    };
    const importOf = node => {
      node = unwrap(node);
      if (ts.isIdentifier(node)) return imports.get(node.text);
      if (ts.isPropertyAccessExpression(node)) {
        const base = importOf(node.expression);
        if (base?.exported === '*' || (base?.module === 'react' && base.exported === 'default')) return { ...base, exported: node.name.text };
      }
    };
    const isProvider = node => { const info = importOf(node); return info?.module === 'beds' && info.exported === 'DesignSystemProvider'; };
    const validBrand = (node, visited = new Set()) => {
      node = unwrap(node);
      if (!node) return false;
      if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return /^#[\da-f]{6}$/i.test(node.text);
      if (ts.isIdentifier(node) && constants.has(node.text) && !visited.has(node.text)) return validBrand(constants.get(node.text), new Set([...visited, node.text]));
      if (ts.isPropertyAccessExpression(node)) {
        const info = importOf(node.expression);
        const base = unwrap(ts.isIdentifier(node.expression) ? constants.get(node.expression.text) : node.expression);
        if (base && ts.isObjectLiteralExpression(base)) {
          const property = base.properties.find(item => ts.isPropertyAssignment(item) && item.name.getText(source).replace(/^['"]|['"]$/g, '') === node.name.text);
          if (property) return validBrand(property.initializer, visited);
        }
      }
      return false;
    };
    const checkTag = node => {
      const tag = node.tagName;
      const text = tag.getText(source);
      const info = importOf(tag);
      // A DS is not the owner of every HTML element in the application.
      // Native layout, identity artwork and app-owned compositions are allowed.
      if (info?.module !== 'beds') return;
      if (isProvider(tag) && !node.attributes.properties.some(attribute => !ts.isJsxSpreadAttribute(attribute) && attribute.name.getText(source) === 'brandColor')) issue(tag, 'BRAND_REQUIRED', 'DesignSystemProvider needs brandColor: choose this product\'s contrast color (FOUNDATIONS.md, "Contrast color — mandatory choice").');
      for (const attribute of node.attributes.properties) {
        if (ts.isJsxSpreadAttribute(attribute)) { issue(attribute, 'JSX_SPREAD', 'Use explicit props; spreads can hide visual escape hatches.'); continue; }
        const name = attribute.name.getText(source);
        const allowedValues = namedSemanticValues(info?.module === 'beds' ? info.exported : undefined, name);
        if (allowedValues) {
          const initializer = attribute.initializer && (ts.isJsxExpression(attribute.initializer) ? attribute.initializer.expression : attribute.initializer);
          const value = staticString(initializer);
          if (!value || !allowedValues.has(value)) issue(attribute, 'SEMANTIC_VARIANT_CONTRACT', `Consumer prop ${name} must use one of: ${[...allowedValues].join(', ')}.`);
        } else if (VISUAL_PROPS.has(name) || name.startsWith('data-style')) {
          const [code, message] = visualPropIssue(name);
          issue(attribute, code, message);
        }
        if (name === 'brandColor') {
          const value = attribute.initializer && (ts.isJsxExpression(attribute.initializer) ? attribute.initializer.expression : attribute.initializer);
          if (!isProvider(tag) || !validBrand(value)) issue(attribute, 'BRAND_CONTRACT', 'brandColor is provider-only: #RRGGBB literal or same-file const preset owned by the app.');
        }
      }
    };
    const visit = node => {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) checkTag(node);
      if (ts.isPropertyAssignment(node)) {
        const name = node.name.getText(source).replace(/^['"]|['"]$/g, '');
        const value = unwrap(node.initializer);
        if (name.startsWith('--es-')) issue(node, 'PRIVATE_LIBRARY_STYLE', 'App styles may read but not redefine private BEDS tokens.');
      }
      if (ts.isCallExpression(node)) {
        const call = node.expression.getText(source);
        if (node.expression.kind === ts.SyntaxKind.ImportKeyword || call === 'require') {
          const first = node.arguments[0];
          if (!first || !ts.isStringLiteral(first)) issue(node, 'DYNAMIC_IMPORT', 'Dynamic dependency cannot be statically audited; use a static import.');
          else registerImport(first.text, node);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  if (!files) report(path.resolve(inputs[0]), 'EMPTY_SCOPE', 'No source/style files found; configure the actual consumer UI roots.');
  return { files, issues };
}

if (process.argv[1] && fs.existsSync(process.argv[1]) && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  const inputs = process.argv.slice(2);
  if (inputs.includes('--help')) {
    console.log('Usage: node check-consumer.mjs <consumer-file-or-directory> [...]\nScans explicit UI roots and local imports. Apps own composition; BEDS owns its public component contract. This is not an accessibility or CSS-safety certification.');
  } else {
    try {
      const result = checkConsumerPaths(inputs);
      for (const item of result.issues) console.error(`${item.file}:${item.line}:${item.column} [${item.code}] ${item.message}`);
      console.log(`Espaço consumer contract: ${result.files} files, ${result.issues.length} violations.`);
      process.exitCode = result.issues.length ? 1 : 0;
    } catch (error) { console.error(error.message); process.exitCode = 1; }
  }
}
