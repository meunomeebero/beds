// Machine-readable public API for agents: every exported component, its props (type, required,
// allowed literal values, JSDoc), its canonical doc and the declared CSS tokens. Derived from the
// TypeScript program and COMPONENTS.md so it cannot drift from the shipped code.
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ts = createRequire(import.meta.url)('typescript');
const root = fileURLToPath(new URL('../', import.meta.url));
const entry = root + 'src/index.ts';

async function componentDocs() {
  const docs = new Map();
  let body = '';
  for (const candidate of [root + '../../docs/design/espaco-library/COMPONENTS.md', root + 'docs/COMPONENTS.md']) {
    try { await access(candidate); body = await readFile(candidate, 'utf8'); break; } catch {}
  }
  for (const line of body.split('\n')) {
    const row = line.match(/^\|\s*`([A-Z]\w*)`/);
    if (!row || docs.has(row[1])) continue;
    const link = line.match(/\]\(([A-Z][\w-]*\.md)(#[^)]*)?\)/);
    docs.set(row[1], `docs/${link ? link[1] + (link[2] ?? '') : 'COMPONENTS.md'}`);
  }
  return docs;
}

function literalValues(type) {
  const parts = type.isUnion() ? type.types : [type];
  const values = [];
  for (const part of parts) {
    if (part.isStringLiteral() || part.isNumberLiteral()) values.push(part.value);
    else if (part.flags & ts.TypeFlags.BooleanLiteral || part.flags & ts.TypeFlags.Undefined) continue;
    else return undefined;
  }
  return values.length ? values : undefined;
}

/** One level of fields for object and array-of-object props, e.g. SegmentedControl options → { id, label, disabled? }. */
function objectFields(checker, type, location) {
  const target = checker.isArrayType(type) ? checker.getTypeArguments(type)[0] : type;
  if (!target || !(target.flags & ts.TypeFlags.Object) || target.getCallSignatures().length) return undefined;
  const declared = target.aliasSymbol ?? target.getSymbol();
  const file = declared?.declarations?.[0]?.getSourceFile().fileName ?? '';
  if (!file || file.includes('node_modules')) return undefined;
  const fields = checker.getPropertiesOfType(target).map(field => {
    const fieldDeclaration = field.valueDeclaration ?? field.declarations?.[0];
    const fieldType = checker.getNonNullableType(checker.getTypeOfSymbolAtLocation(field, fieldDeclaration ?? location));
    const values = literalValues(fieldType);
    return { name: field.getName(), required: !(field.flags & ts.SymbolFlags.Optional), type: fieldDeclaration?.type?.getText() ?? checker.typeToString(fieldType), ...(values ? { values } : {}) };
  });
  return fields.length ? fields : undefined;
}

export async function buildManifest() {
  const program = ts.createProgram([entry], { jsx: ts.JsxEmit.ReactJSX, strict: true, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, target: ts.ScriptTarget.ES2022, skipLibCheck: true });
  const checker = program.getTypeChecker();
  const moduleSymbol = checker.getSymbolAtLocation(program.getSourceFile(entry));
  const docs = await componentDocs();
  const components = [];
  const utilities = [];
  for (const exported of checker.getExportsOfModule(moduleSymbol)) {
    const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
    const name = exported.getName();
    if (!(symbol.flags & (ts.SymbolFlags.Function | ts.SymbolFlags.Variable))) continue;
    const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
    if (!declaration) continue;
    const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
    const signature = type.getCallSignatures()[0];
    const summary = ts.displayPartsToString(symbol.getDocumentationComment(checker)).split('\n')[0] || undefined;
    if (!/^[A-Z]/.test(name) || !signature) { utilities.push(name); continue; }
    const param = signature.getParameters()[0];
    const props = [];
    if (param) {
      const propsType = checker.getTypeOfSymbolAtLocation(param, declaration);
      for (const prop of checker.getPropertiesOfType(propsType)) {
        const propDeclaration = prop.valueDeclaration ?? prop.declarations?.[0];
        if (!propDeclaration || propDeclaration.getSourceFile().fileName.includes('node_modules')) continue;
        const propType = checker.getTypeOfSymbolAtLocation(prop, propDeclaration);
        const values = literalValues(checker.getNonNullableType(propType));
        const description = ts.displayPartsToString(prop.getDocumentationComment(checker)) || undefined;
        const fields = objectFields(checker, checker.getNonNullableType(propType), propDeclaration);
        props.push({
          name: prop.getName(),
          required: !(prop.flags & ts.SymbolFlags.Optional),
          type: propDeclaration.type?.getText() ?? checker.typeToString(checker.getNonNullableType(propType), undefined, ts.TypeFormatFlags.NoTruncation),
          ...(values ? { values } : {}),
          ...(fields ? { fields } : {}),
          ...(description ? { description } : {}),
        });
      }
    }
    components.push({ name, ...(summary ? { summary } : {}), doc: docs.get(name) ?? 'docs/COMPONENTS.md', props });
  }
  const tokensCss = await readFile(root + 'src/tokens.css', 'utf8');
  const providerSource = await readFile(root + 'src/foundation.tsx', 'utf8');
  const runtimeTokens = [...providerSource.matchAll(/'(--es-[\w-]+)':/g)].map(match => match[1]);
  const tokens = [...new Set([...[...tokensCss.matchAll(/(--[\w-]+)\s*:/g)].map(match => match[1]), ...runtimeTokens])].sort();
  const { version } = JSON.parse(await readFile(root + 'package.json', 'utf8'));
  components.sort((a, b) => a.name.localeCompare(b.name));
  return {
    $schema: 'beds-manifest/1',
    package: 'beds',
    version,
    rules: [
      'DesignSystemProvider needs theme and a deliberate brandColor (docs/FOUNDATIONS.md#contrast-color--mandatory-choice).',
      'BEDS components take no className/style/spreads; only the listed props and values.',
      'Apps own page layout CSS on their own selectors; never target .es-* or redefine --es-* tokens (read them freely).',
      'Search beUI before building a missing piece; keep product compositions in the app.',
      'Every motion needs a reduced-motion path; verify light/dark, 320px and keyboard focus in a browser.',
    ],
    components,
    utilities: utilities.sort(),
    tokens,
  };
}

if (process.argv[1] && realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1])) {
  const manifest = await buildManifest();
  await mkdir(root + 'dist', { recursive: true });
  await writeFile(root + 'dist/manifest.json', JSON.stringify(manifest, null, 1) + '\n');
  console.log(`BEDS manifest: ${manifest.components.length} components, ${manifest.tokens.length} tokens.`);
}
