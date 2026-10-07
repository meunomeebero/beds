import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const retrieved = '2026-09-19';
const indexUrl = 'https://beui.dev/r';
const hash = (text) => crypto.createHash('sha256').update(Buffer.from(text)).digest('hex');

async function get(url) {
  try {
    const response = await fetch(url, { redirect: 'follow' });
    const text = await response.text();
    return { url, status: response.status, ok: response.ok, contentType: response.headers.get('content-type'), bytes: Buffer.byteLength(text), sha256: response.ok ? hash(text) : null, text };
  } catch (error) {
    return { url, status: 0, ok: false, contentType: null, bytes: 0, sha256: null, error: String(error) };
  }
}

const index = await get(indexUrl);
if (!index.ok) throw new Error(`beUI index failed: ${index.status}`);
const registry = JSON.parse(index.text);
const components = registry.components ?? [];
const queue = [...components];
const records = [];
const workers = Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const component = queue.shift();
    const item = await get(`https://beui.dev/r/${component.slug}.json`);
    const raw = await get(`https://beui.dev/r/${component.slug}/raw`);
    let itemJson = null;
    if (item.ok) {
      try { itemJson = JSON.parse(item.text); } catch { itemJson = null; }
    }
    records.push({
      slug: component.slug,
      name: component.name,
      category: component.category,
      indexUpdatedAt: component.updated_at,
      detailUrl: component.detail_url,
      rawUrl: component.raw_url,
      registryUrl: `https://beui.dev/r/${component.slug}.json`,
      retrieved,
      registry: { status: item.status, ok: item.ok, sha256: item.sha256, bytes: item.bytes, contentType: item.contentType, license: itemJson?.license ?? itemJson?.metadata?.license ?? null, json: itemJson },
      raw: { status: raw.status, ok: raw.ok, sha256: raw.sha256, bytes: raw.bytes, contentType: raw.contentType },
    });
  }
});
await Promise.all(workers);
records.sort((a, b) => a.slug.localeCompare(b.slug));
const output = { schemaVersion: 'ber-23-beui-registry-audit@1.0', retrieved, index: { url: indexUrl, status: index.status, sha256: index.sha256, componentCount: components.length }, components: records };
fs.writeFileSync(path.join(root, 'work/ber23-registry-audit.json'), `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ indexStatus: index.status, componentCount: components.length, registryOk: records.filter((x) => x.registry.ok).length, registryFailed: records.filter((x) => !x.registry.ok).length, rawOk: records.filter((x) => x.raw.ok).length, rawFailed: records.filter((x) => !x.raw.ok).length, licenses: [...new Set(records.map((x) => x.registry.license).filter(Boolean))] }, null, 2));
