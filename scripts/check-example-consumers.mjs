import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { checkConsumerPaths } from '../packages/beds/scripts/check-consumer.mjs';

const catalog = fileURLToPath(new URL('../apps/web/labs/espaco-library/', import.meta.url));
// Catalog.tsx owns documentation chrome. Every standalone composition and
// reusable example is a consumer, including newly added untracked files.
const roots = [
  fileURLToPath(new URL('../packages/beds/examples/consumer.tsx', import.meta.url)),
  ...readdirSync(catalog).filter(name => /(?:Page|Examples)\.tsx$/.test(name)).map(name => catalog + name),
];
const result = checkConsumerPaths(roots);
for (const issue of result.issues) console.error(`${issue.file}:${issue.line} [${issue.code}] ${issue.message}`);
console.log(`BEDS example consumers: ${roots.length} roots, ${result.files} files, ${result.issues.length} violations.`);
process.exitCode = result.issues.length ? 1 : 0;
