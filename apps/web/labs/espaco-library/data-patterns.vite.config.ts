import { mergeConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import base from './vite.config';

export default mergeConfig(base, {
  cacheDir: fileURLToPath(new URL('../../../../.cache/espaco-data-patterns-vite', import.meta.url)),
});
