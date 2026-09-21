#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FORBIDDEN = new Set([
  'className', 'style', 'css', 'sx', 'tw', 'as', 'asChild', 'dangerouslySetInnerHTML',
  'font', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'fontVariant', 'fontStretch',
  'fontKerning', 'fontFeatureSettings', 'fontVariationSettings', 'lineHeight', 'letterSpacing',
  'textTransform', 'textDecoration', 'textShadow',
  'density', 'gap', 'rowGap', 'columnGap', 'padding', 'paddingTop', 'paddingRight', 'paddingBottom',
  'paddingLeft', 'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'inset',
  'top', 'right', 'bottom', 'left', 'width', 'minWidth', 'maxWidth', 'height', 'minHeight',
  'maxHeight', 'radius', 'borderRadius',
  'color', 'background', 'backgroundColor', 'border', 'borderColor', 'boxShadow', 'fill', 'stroke',
  'outlineColor', 'opacity', 'transform', 'zIndex',
  'size', 'strokeWidth', 'strokeLinecap', 'strokeLinejoin', 'viewBox',
]);
const NAMED_SEMANTIC_VISUAL_PROPS = new Map([
  ['Stack', new Map([['gap', new Set(['tight', 'default', 'section'])]])],
  ['Inline', new Map([['gap', new Set(['tight', 'default'])]])],
]);
/** Motion contract: interaction motion is expressed with motion/react, not CSS. Stylesheets still carrying
 *  CSS transitions/keyframes are listed here until their component migrates; the list only shrinks. */
const CSS_MOTION_ALLOWLIST = new Set([
  'application-card.css', 'checkout.css', 'empty-state-card.css', 'form-fields.css', 'input-otp.css',
  'landing.css', 'layout.css', 'overlays.css', 'paged-carousel.css', 'payment-confirmation.css', 'processing.css',
  'results.css', 'toast.css',
]);
/** Legibility floor: no product text below 12px (badges, metadata, tooltips included). */
const MIN_FONT_SIZE_PX = 12;

function isNamedSemanticVisualProp(component, prop) {
  return NAMED_SEMANTIC_VISUAL_PROPS.get(component)?.has(prop) ?? false;
}

function collect(directory) {
  if (!fs.existsSync(directory)) throw new Error(`Missing package source: ${directory}`);
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? collect(path.join(directory, entry.name)) : [path.join(directory, entry.name)]).sort();
}

/** Read-only package/API/token gate. Canonical token files must be configured explicitly. */
export function checkLibrary({ root = DEFAULT_ROOT, tokens = [] } = {}) {
  root = path.resolve(root);
  if (!tokens.length) throw new Error('Supply canonical token CSS with --tokens <path-relative-to-package>.');
  const canonical = new Set(tokens.map(file => path.resolve(root, file)));
  for (const file of canonical) if (!fs.existsSync(file)) throw new Error(`Missing configured token file: ${file}`);
  const files = collect(path.join(root, 'src'));
  const sources = files.filter(file => /\.[cm]?tsx?$/.test(file));
  const css = files.filter(file => file.endsWith('.css'));
  const entry = path.join(root, 'src', 'index.ts');
  if (!sources.includes(entry)) throw new Error('Public src/index.ts is missing; cannot audit the exported API.');
  if (!css.length) throw new Error('No package CSS found; cannot audit tokens.');
  const issues = [];
  const issue = (file, code, message, line = 1) => issues.push({ file, line, code, message });
  for (const file of files) if (/\.(?:[cm]?jsx?|scss|sass|less|styl|stylus)$/.test(file)) issue(file, 'UNSUPPORTED_LIBRARY_SOURCE', 'Library runtime uses audited TypeScript and CSS; this source format is outside the gate.');
  const program = ts.createProgram(sources, {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX, strict: true, skipLibCheck: true, noEmit: true, esModuleInterop: true, allowSyntheticDefaultImports: true,
  });
  const checker = program.getTypeChecker();
  const entrySource = program.getSourceFile(entry);
  const module = checker.getSymbolAtLocation(entrySource);
  if (!module) throw new Error('Public entry has no module exports; cannot audit the API.');
  for (const diagnostic of [...program.getSyntacticDiagnostics(), ...program.getSemanticDiagnostics()].filter(item => item.category === ts.DiagnosticCategory.Error)) {
    const file = diagnostic.file?.fileName ?? entry;
    const line = diagnostic.file && diagnostic.start !== undefined ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1 : 1;
    issue(file, 'TYPE_ERROR', ts.flattenDiagnosticMessageText(diagnostic.messageText, ' '), line);
  }
  let components = 0;
  const checked = new Set();
  for (const exported of checker.getExportsOfModule(module)) {
    const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
    const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
    if (!declaration) continue;
    const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
    const signatures = type.getCallSignatures();
    if (!/^[A-Z]/.test(exported.name) || !signatures.length) continue;
    components++;
    for (const signature of signatures) {
      const parameter = signature.parameters[0];
      if (!parameter) continue;
      const props = checker.getTypeOfSymbolAtLocation(parameter, parameter.valueDeclaration ?? declaration);
      const location = declaration.getSourceFile();
      const line = location.getLineAndCharacterOfPosition(declaration.getStart(location)).line + 1;
      if (props.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown) || props.getStringIndexType()) issue(location.fileName, 'OPEN_PROPS', `${exported.name} exposes unrestricted props; use an explicit contract.`, line);
      for (const prop of props.getProperties()) {
        const key = `${exported.name}:${prop.name}`;
        if (checked.has(key)) continue;
        checked.add(key);
        if (FORBIDDEN.has(prop.name) && !isNamedSemanticVisualProp(exported.name, prop.name)) issue(location.fileName, 'PUBLIC_VISUAL_ESCAPE', `${exported.name}.${prop.name} exposes consumer styling.`, line);
        if (prop.name === 'brandColor' && exported.name !== 'DesignSystemProvider') issue(location.fileName, 'BRAND_OWNERSHIP', `${exported.name}.brandColor must be owned only by DesignSystemProvider.`, line);
      }
    }
  }
  if (!components) issue(entry, 'NO_COMPONENTS', 'No public React component functions found; gate scope is incomplete.');

  const declarations = new Set();
  const references = [];
  for (const file of css) {
    const original = fs.readFileSync(file, 'utf8');
    const text = original.replace(/\/\*[\s\S]*?\*\//g, match => ' '.repeat(match.length));
    for (const match of text.matchAll(/(?:^|[;{])\s*(--[\w-]+)\s*:/g)) declarations.add(match[1]);
    for (const match of text.matchAll(/var\(\s*(--[\w-]+)/g)) references.push({ file, token: match[1], line: text.slice(0, match.index).split('\n').length });
    if (!canonical.has(file)) {
      const lineOf = index => text.slice(0, index).split('\n').length;
      const base = path.basename(file);
      if (base !== 'tailwind.css' && !CSS_MOTION_ALLOWLIST.has(base)) {
        // Disabling a transition is an accessibility safeguard, not new CSS motion.
        for (const match of text.matchAll(/@keyframes\b|(?:^|[;{\s])transition(?:-[a-z]+)?\s*:(?!\s*none\s*(?:!important\s*)?[;}])/g)) issue(file, 'CSS_MOTION', 'Interaction motion belongs in motion/react; this stylesheet is not in the CSS motion allowlist.', lineOf(match.index));
      }
      for (const match of text.matchAll(/font-size\s*:\s*(\d+(?:\.\d+)?)px|font\s*:[^;{}]*?\b(\d+(?:\.\d+)?)px\s*\//g)) {
        const size = Number(match[1] ?? match[2]);
        if (size < MIN_FONT_SIZE_PX) issue(file, 'FONT_SIZE_FLOOR', `${size}px text is below the ${MIN_FONT_SIZE_PX}px legibility floor.`, lineOf(match.index));
      }
      for (const match of text.matchAll(/#[\da-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\s*\(/gi)) issue(file, 'RAW_COLOR', 'Color values belong in a configured canonical token stylesheet.', text.slice(0, match.index).split('\n').length);
      const withoutFontFaces = text.replace(/@font-face\s*\{[^}]*\}/g, match => ' '.repeat(match.length));
      for (const match of withoutFontFaces.matchAll(/font-family\s*:\s*([^;}]+)/g)) if (!/^(?:var\(|inherit\s*$)/.test(match[1])) issue(file, 'RAW_FONT', 'Component font family must resolve through the canonical Inter token.', text.slice(0, match.index).split('\n').length);
    }
  }
  // Provider writes these two sanctioned runtime custom properties from the validated brand input.
  declarations.add('--es-brand');
  declarations.add('--es-on-brand');
  for (const ref of references) if (!declarations.has(ref.token)) issue(ref.file, 'UNDECLARED_TOKEN', `${ref.token} is used but not declared in package CSS or the provider brand contract.`, ref.line);
  for (const file of canonical) if (!css.includes(file)) issue(file, 'TOKENS_OUTSIDE_SOURCE', 'Canonical token file must be part of scanned src/ CSS.');
  return { files: sources.length + css.length, components, tokens: declarations.size, issues };
}

if (process.argv[1] && fs.existsSync(process.argv[1]) && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2);
  if (args.includes('--help')) console.log('Usage: node check-library.mjs [--root <package>] --tokens <canonical-css> [--tokens <canonical-css> ...]');
  else {
    try {
      const options = { root: DEFAULT_ROOT, tokens: [] };
      for (let index = 0; index < args.length; index++) {
        const argument = args[index];
        if (argument === '--root' && args[index + 1]) options.root = args[++index];
        else if (argument === '--tokens' && args[index + 1]) options.tokens.push(args[++index]);
        else throw new Error(`Unknown or incomplete argument: ${argument}`);
      }
      const result = checkLibrary(options);
      for (const item of result.issues) console.error(`${item.file}:${item.line} [${item.code}] ${item.message}`);
      console.log(`Espaço library contract: ${result.components} public components, ${result.tokens} declared tokens, ${result.issues.length} violations.`);
      process.exitCode = result.issues.length ? 1 : 0;
    } catch (error) { console.error(error.message); process.exitCode = 1; }
  }
}
