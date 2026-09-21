import { readFile } from 'node:fs/promises';
import ts from 'typescript';

// SSR-only harness. CSS is exercised separately by the browser suite.
export async function loadRecipe(name) {
  if (!/^[a-z-]+$/.test(name)) throw new Error('Invalid recipe name');
  const source = await readFile(new URL(`../${name}.tsx`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  const code = outputText
    .replace(/^import ['"]\.\/[^'"]+\.css['"];?\n/gm, '')
    .replace(/(from\s+)(['"])([^'"]+)\2/g, (_, prefix, quote, specifier) => {
      if (specifier.startsWith('.')) throw new Error(`Recipe test needs an explicit dependency: ${specifier}`);
      return prefix + quote + import.meta.resolve(specifier) + quote;
    });
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}
