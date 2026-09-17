import { readFile, writeFile, mkdir, readdir, copyFile, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const root = fileURLToPath(new URL('../', import.meta.url));
const tailwindCli = createRequire(import.meta.url).resolve('@tailwindcss/cli/package.json').replace(/package\.json$/, 'dist/index.mjs');
// tokens, then component stylesheets, then Tailwind utilities compiled from src/tailwind.css against src/**/*.tsx.
const order = ['tokens.css','foundation.css','controls.css','form-fields.css','decisions.css','overlays.css','layout.css','patterns.css','disclosure.css','data.css','feedback.css','chat.css','technical.css','feature-card.css','empty-state-card.css','pricing.css','records.css','input-otp.css','paged-carousel.css','toast.css','application-card.css','application-board.css','onboarding.css','account-credits.css','forum-topic.css','date-item.css','payment-confirmation.css','blog-post.css','landing-footer.css','benefits.css','landing.css','processing.css','results.css','checkout.css'];
await mkdir(root + 'dist', { recursive:true });
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

if (hasSourceDocs) {
 await mkdir(root + 'docs', { recursive:true });
 for (const name of await readdir(sourceDocs)) {
  if (!name.endsWith('.md')) continue;
  let body = (await readFile(sourceDocs + name,'utf8'))
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
  await writeFile(root + 'docs/' + name, body);
 }
}
// ESM exports must resolve in Node and bundlers; preserve React/lucide peer imports.
for (const name of await readdir(root + 'dist')) {
 if (!/\.(js|d\.ts)$/.test(name)) continue;
 const path = root + 'dist/' + name;
 const code = await readFile(path,'utf8');
 await writeFile(path, code.replace(/(from\s+['"])(\.\/[^'"]+?)(['"])/g, (_,a,b,c) => a + (/\.js$/.test(b)?b:b+'.js') + c).replace(/^import ['"]\.\/[^'"]+\.css['"];?\n/gm,''));
}
