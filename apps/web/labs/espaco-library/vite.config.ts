import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../../../', import.meta.url));

/** Mirror scripts/build-css.mjs: utilities ship unlayered so they beat unlayered .es-root rules in dev exactly as in dist.
 *  Runs after the Tailwind plugin, so the module is already the CSS string inside Vite's dev/build wrapper or raw CSS. */
function unlayerUtilities(css: string) {
 const match = /@layer utilities\s*\{/.exec(css);
 if (!match) return css;
 const start = match.index, open = start + match[0].length;
 let depth = 1, close = open;
 while (depth && close < css.length) { const char = css[close++]; if (char === '{') depth++; else if (char === '}') depth--; }
 return css.slice(0, start) + css.slice(close) + '\n' + css.slice(open, close - 1);
}
function unlayeredUtilities(): Plugin {
 return {
  name:'beds-unlayered-utilities', enforce:'post',
  transform(code, id) {
   if (!/\.css(?:\?.*)?$/.test(id) || !/@layer utilities/.test(code)) return null;
   const wrapped = /const __vite__css = (".*?")\n/s.exec(code);
   if (!wrapped) return { code: unlayerUtilities(code), map:null };
   const css = JSON.parse(wrapped[1]) as string;
   return { code: code.replace(wrapped[1], JSON.stringify(unlayerUtilities(css))), map:null };
  },
 };
}

export default defineConfig({
 plugins:[react(), tailwindcss(), unlayeredUtilities()],envDir:false,
 resolve:{alias:[
  {find:'beds/styles.css',replacement:fileURLToPath(new URL('./styles.css',import.meta.url))},
  {find:'beds',replacement:root+'packages/beds/src/index.ts'},
 ],dedupe:['react','react-dom']},
 server:{host:'127.0.0.1',port:5283,strictPort:true,fs:{allow:[root]}},
 build:{outDir:'dist',emptyOutDir:true},
});
