import { readFile, writeFile, mkdir, readdir, copyFile, access, unlink } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const root = fileURLToPath(new URL('../', import.meta.url));
const tailwindCli = createRequire(import.meta.url).resolve('@tailwindcss/cli/package.json').replace(/package\.json$/, 'dist/index.mjs');
// tokens, then component stylesheets, then Tailwind utilities compiled from src/tailwind.css against src/**/*.tsx.
// Single source of truth for stylesheet order, shared with build-artifact.test.mjs. Append new component CSS there.
const order = JSON.parse(await readFile(new URL('./css-order.json', import.meta.url), 'utf8'));
const unlisted = (await readdir(root + 'src')).filter(name => name.endsWith('.css') && !['reset.css','tailwind.css'].includes(name) && !order.includes(name));
if (unlisted.length) throw new Error(`Component stylesheet missing from scripts/css-order.json: ${unlisted.join(', ')}`);
await mkdir(root + 'dist', { recursive:true });
// These modules moved to app-owned recipes. TypeScript does not remove outputs
// for deleted sources; do not accidentally ship the previous implementation.
for (const name of ['landing', 'landing-footer', 'benefits', 'onboarding', 'checkout', 'processing', 'results', 'chat-workspace', 'payment-confirmation', 'application-card', 'application-board']) {
 for (const ext of ['js', 'd.ts']) {
  try { await unlink(root + `dist/${name}.${ext}`); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
 }
}
const tailwind = execFileSync(process.execPath, [tailwindCli, '--input', root + 'src/tailwind.css', '--cwd', root + 'src', '--minify'], { encoding:'utf8', stdio:['ignore','pipe','inherit'] });
// Utilities ship unlayered and last: BEDS component CSS and consumer legacy CSS are unlayered, and an
// unlayered rule always beats a layered one, so keeping @layer would let any .es-root rule override a utility.
function unwrapUtilities(output) {
 const start = output.indexOf('@layer utilities{');
 if (start === -1) return { support:output.trim(), utilities:'' }; // no utility referenced yet
 const open = start + '@layer utilities{'.length;
 let depth = 1, close = open;
 while (depth && close < output.length) { const char = output[close++]; if (char === '{') depth++; else if (char === '}') depth--; }
 return { support:(output.slice(0, start) + output.slice(close)).trim(), utilities:output.slice(open, close - 1) };
}
const { support, utilities } = unwrapUtilities(tailwind);
const sheets = await Promise.all(order.map(name => readFile(root + 'src/' + name,'utf8')));
await writeFile(root + 'dist/styles.css', [...sheets, support, utilities].join('\n'));
await copyFile(root + 'src/reset.css', root + 'dist/reset.css');
const sourceDocs = root + '../../docs/design/espaco-library/';
let hasSourceDocs = true;
try {
 await access(sourceDocs);
} catch (error) {
 if (error.code !== 'ENOENT') throw error;
 hasSourceDocs = false;
}

async function sourceDocumentFiles(directory, prefix = '') {
 const files = [];
 for (const entry of await readdir(directory, { withFileTypes:true })) {
  const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
  if (entry.isDirectory()) files.push(...await sourceDocumentFiles(directory + entry.name + '/', relative));
  else if (/\.(md|json)$/.test(entry.name)) files.push(relative);
 }
 return files;
}

if (hasSourceDocs) {
 await mkdir(root + 'docs', { recursive:true });
 for (const relative of await sourceDocumentFiles(sourceDocs)) {
  const name = relative.split('/').pop();
  const destination = root + 'docs/' + relative;
  await mkdir(destination.slice(0, destination.lastIndexOf('/')), { recursive:true });
  if (!name.endsWith('.md')) {
   await copyFile(sourceDocs + relative, destination);
   continue;
  }
  let body = (await readFile(sourceDocs + relative,'utf8'))
   .replaceAll('../../../packages/beds/', '../')
   .replaceAll('../espaco-system/MARKETER-REFERENCE.md', 'PROVENANCE.md');
  // Keep linked application examples/evidence readable in the standalone package.
  const labPrefix = '../../../apps/web/labs/espaco-library/';
  for (const match of body.matchAll(/\]\(\.\.\/\.\.\/\.\.\/apps\/web\/labs\/espaco-library\/([^)]+)\)/g)) {
   const relative = match[1];
   const filename = relative.replace(/^evidence\//, '').replace(/\.(tsx?|jsx?)$/, '.$1.txt');
   const destination = 'evidence/' + filename;
   const sourceAsset = root + '../../apps/web/labs/espaco-library/' + relative;
   try { await access(sourceAsset); }
   catch (error) {
    if (error.code === 'ENOENT') throw new Error(`Package documentation asset is missing: ${sourceAsset}`);
    throw error;
   }
   await mkdir(root + destination.slice(0, destination.lastIndexOf('/')), { recursive:true });
   await copyFile(sourceAsset, root + destination);
   body = body.replaceAll(labPrefix + relative, '../' + destination);
  }
  await writeFile(destination, body);
 }
}
// ESM exports must resolve in Node and bundlers; preserve React/lucide peer imports.
for (const name of await readdir(root + 'dist')) {
 if (!/\.(js|d\.ts)$/.test(name)) continue;
 const path = root + 'dist/' + name;
 const code = await readFile(path,'utf8');
 await writeFile(path, code.replace(/(from\s+['"])(\.\/[^'"]+?)(['"])/g, (_,a,b,c) => a + (/\.js$/.test(b)?b:b+'.js') + c).replace(/^import ['"]\.\/[^'"]+\.css['"];?\n/gm,''));
}
