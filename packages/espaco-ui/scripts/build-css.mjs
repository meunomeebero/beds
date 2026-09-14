import { readFile, writeFile, mkdir, readdir, copyFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const order = ['tokens.css','foundation.css','controls.css','form-fields.css','overlays.css','layout.css','patterns.css','data.css','feedback.css','chat.css','technical.css','feature-card.css'];
await mkdir(root + 'dist', { recursive:true });
await writeFile(root + 'dist/styles.css', (await Promise.all(order.map(name => readFile(root + 'src/' + name,'utf8')))).join('\n'));
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
   .replaceAll('../../../packages/espaco-ui/', '../')
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
