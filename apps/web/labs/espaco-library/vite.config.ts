import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../../../', import.meta.url));
export default defineConfig({
 plugins:[react()],envDir:false,
 resolve:{alias:[
  {find:'beds/styles.css',replacement:fileURLToPath(new URL('./styles.css',import.meta.url))},
  {find:'beds',replacement:root+'packages/beds/src/index.ts'},
 ],dedupe:['react','react-dom']},
 server:{host:'127.0.0.1',port:5283,strictPort:true,fs:{allow:[root]}},
 build:{outDir:'dist',emptyOutDir:true},
});

