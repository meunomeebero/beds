import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const extraction = JSON.parse(fs.readFileSync(path.join(root, 'work/ber9-extract.json'), 'utf8'));
const priorPath = '/Users/robertojunior/Documents/Codex/2026-09-19/beds-tech-lead/outputs/BER-9-export-task-matrix.json';
const ownerPath = '/Users/robertojunior/Documents/Codex/2026-09-19/beds-tech-lead/outputs/BER-9-owner-reconciliation.json';
const prior = JSON.parse(fs.readFileSync(priorPath, 'utf8'));
const ownerReconciliation = JSON.parse(fs.readFileSync(ownerPath, 'utf8'));
const priorByName = new Map(prior.exports.map((row) => [row.name, row]));
const ownerByName = new Map(ownerReconciliation.owners.map((row) => [row.export, row]));
const sha256 = (fileOrBuffer) => crypto.createHash('sha256').update(Buffer.isBuffer(fileOrBuffer) ? fileOrBuffer : fs.readFileSync(fileOrBuffer)).digest('hex');
const rel = (file) => path.relative(root, file).split(path.sep).join('/');

const docs = {
  readme: 'docs/design/espaco-library/README.md',
  components: 'docs/design/espaco-library/COMPONENTS.md',
  states: 'docs/design/espaco-library/STATES.md',
  governance: 'docs/design/espaco-library/GOVERNANCE.md',
  provenance: 'docs/design/espaco-library/PROVENANCE.md',
  notices: 'THIRD-PARTY-NOTICES.md',
  opportunities: 'docs/design/espaco-library/BEUI-OPPORTUNITIES-2026-09-16.md',
  validation: 'docs/design/espaco-library/VALIDATION.md',
  f3: 'docs/design/espaco-library/F3-MIGRATION-DECISIONS.md',
  processing: 'docs/design/espaco-library/PROCESSING.md',
};

function sourceRecord({ slug, date, raw, registry, status = 'ADAPTED', notes = '', rawUrl = `https://beui.dev/r/${slug}/raw`, registryUrl = `https://beui.dev/r/${slug}.json`, localComment = null, observedRaw = null }) {
  return {
    status,
    slug,
    rawUrl,
    registryUrl,
    license: 'MIT',
    retrieved: date,
    rawSha256: raw ?? null,
    registrySha256: registry ?? null,
    localSourceCommentSha256: localComment,
    observedRawSha256: observedRaw,
    notes,
  };
}
function noSource(status = 'NOT_RECORDED') {
  return { status, slug: null, rawUrl: null, registryUrl: null, license: null, retrieved: null, rawSha256: null, registrySha256: null, localSourceCommentSha256: null, observedRawSha256: null, notes: 'No beUI source/hash/license/date is recorded for this public export in the audited provenance sources.' };
}

const beui = new Map();
const assign = (names, record) => names.forEach((name) => beui.set(name, record));
assign(['Button', 'IconButton', 'IconToggleButton'], sourceRecord({ slug: 'button-base', date: '2026-09-17', registryUrl: null, status: 'ADAPTED_HASH_NOT_RECORDED', notes: 'Motion/disabled intent adopted; BEDS geometry/API retained. Notices provide URL/license/date but no raw or registry SHA-256.' }));
assign(['TextField', 'TextAreaField', 'SearchField'], sourceRecord({ slug: 'input', date: '2026-09-17', registryUrl: null, status: 'ADAPTED_HASH_NOT_RECORDED', notes: 'Field state intent adopted; BEDS geometry/API retained. Notices provide URL/license/date but no raw or registry SHA-256.' }));
assign(['Checkbox'], sourceRecord({ slug: 'checkbox', date: '2026-09-17', registryUrl: null, status: 'ADAPTED_HASH_NOT_RECORDED', notes: 'Native checkbox semantics retained; motion intent adapted. Notices provide URL/license/date but no SHA-256.' }));
assign(['Switch'], sourceRecord({ slug: 'switch', date: '2026-09-17', registryUrl: null, status: 'ADAPTED_HASH_NOT_RECORDED', notes: 'Native switch semantics retained; thumb travel adapted. Notices provide URL/license/date but no SHA-256.' }));
assign(['SegmentedControl'], sourceRecord({ slug: 'radio', date: '2026-09-17', registryUrl: null, status: 'ADAPTED_HASH_MISSING', notes: 'beUI modified: native radio retained and BEDS keyboard navigation added. No raw/registry SHA-256 is recorded in the audited notices.' }));
assign(['Tabs'], sourceRecord({ slug: 'tabs', date: '2026-09-19', raw: '7e3def75375631d855187fd39dcc4398e6f16313149d2be21375a2eae5a7d649', registry: '486f271a0b4de568ba5382e1c5bd602a69ff19385c528460a506845e9a749803', status: 'ADAPTED_HASH_MATCHED', notes: 'Shared indicator and reduced-motion intent adapted; BEDS tab semantics, keyboard, RTL, scroll and geometry retained.' }));
assign(['Dock', 'DockItem', 'DockSeparator'], sourceRecord({ slug: 'dock', date: '2026-09-18', registryUrl: null, status: 'ADAPTED_HASH_NOT_RECORDED', notes: 'Source pasted/adapted with BEDS touch/API boundary; notices provide URL/license/date but no SHA-256.' }));
assign(['AnimatedNumber'], sourceRecord({ slug: 'number', date: '2026-09-16', registryUrl: null, status: 'ADAPTED_HASH_NOT_RECORDED', notes: 'Typed numeric motion only; no fabricated score. Notices provide URL/license/date but no SHA-256.' }));
assign(['NumberTicker'], sourceRecord({ slug: 'number-ticker', date: '2026-09-18', registryUrl: null, status: 'ADAPTED_HASH_NOT_RECORDED', notes: 'Live numeric/count use only; public styling escapes removed. Notices provide URL/license/date but no SHA-256.' }));
assign(['ProcessingView'], sourceRecord({ slug: 'todo-list', date: '2026-09-19', raw: 'ee3b0baabf79fb941f0affbc21e9043c93cd02e59f71ed3f37d55702912cd210', registry: 'f247b5cc7c399e851ddf91660ddfa462c7edcf59ecbac01b6a7139d13e86758', status: 'ADAPTED_HASH_MATCHED', notes: 'Only status-mark and segmented-fill intent adopted; source list/details/public styling are omitted.' }));
assign(['Tooltip'], sourceRecord({ slug: 'tooltip', date: '2026-09-19', raw: '248e25c9e322f862ca2bf982d7a8747fe5bf0f779a1b009f34f522dc93c6bcb0', registry: 'b4b154e9a3b5e5c20f258dd65ea18b4825e70fdf32d11da057ed4527fd9ec2ad', status: 'ADAPTED_HASH_MATCHED', notes: 'Anchored motion/gesture helpers adapted to the controlled BEDS label/child contract.' }));
assign(['LoadingIndicator'], sourceRecord({ slug: 'loader', date: '2026-09-19', raw: '24a3255b7a9b106cd60c246853864b541d9dd665c9fda99d314b74c98a01d66c', registry: '0bd742a4322bfe6594ba1d9e21b83c99cf33c197d3bddb582db1d6679cd1bd97', status: 'ADAPTED_HASH_MATCHED', notes: 'Spinner/reduced-motion intent adapted to BEDS status semantics.' }));
assign(['Toaster', 'toast', 'dismissToast'], sourceRecord({ slug: 'animated-toast-stack', date: '2026-09-19', registryUrl: null, status: 'ADAPTED_SOURCE_COMMENT_ONLY', localComment: 'e1fe639d87cc5419b720e48289a9ee2ba776050413cede9b8f08af48ee28da28', notes: 'Local source-comment hash is recorded; no upstream raw/registry hash was supplied.' }));
assign(['Drawer', 'DrawerSection'], sourceRecord({ slug: 'drawer', date: '2026-09-19', raw: 'cb2282d9462850592e6102af210fe7e9e5569778a7d7bef7063d2889a37ee8fb', registry: 'e4eaa7294ff9e883a74fd555ff2e41360d47e18f083aa77318cde845cfacf43b', observedRaw: 'cb2282d9462850592e6102af210fe7e9e5569788a7d7bef7063d2889a37ee8fb', status: 'ADAPTED_HASH_DIVERGENT', notes: 'Canonical PROVENANCE hash differs from the root THIRD-PARTY-NOTICES raw hash; registry hash matches. No source docs were edited in BER-9.' }));
assign(['DisclosureText', 'DisclosedRecords'], sourceRecord({ slug: 'bouncy-accordion', date: '2026-09-19', raw: 'a64ac619939b4fe5167cbb580cb2c9d0714ffb90801050a7e0a19975b28fe9ab', registry: 'bee4f7e546db58ed8f1af16c413cee6f26b31a86cb8b5e2cd5d29139075dd7f7', status: 'ADAPTED_HASH_MATCHED', notes: 'Height/opacity/layout intent adapted while BEDS mount/tab-stop contracts remain authoritative.' }));
assign(['AccountMenu'], sourceRecord({ slug: 'context-menu', date: '2026-09-19', raw: '5d5f57cf5994803215344285ef8447669870c9bc1017e502d490de4309b28789', registry: 'babe5776e5124ae67e28bb741900fae158904b2ee324dc349edddd9b9e07a945', status: 'ADAPTED_HASH_MATCHED', notes: 'Active-row/content motion intent adapted; BEDS controlled account/workspace/theme API retained.' }));
assign(['CommandPalette'], sourceRecord({ slug: 'command-palette', date: '2026-09-19', raw: 'fa19172779923d319155166a71038e7077dd9f71a056591ae9493c0ec9ad05f7', registry: 'c58fed6d7f19dd6e6c5ab9202477b0751539ace1b6f929fae90e210606dac175', status: 'ADAPTED_HASH_MATCHED', notes: 'Fuzzy search/cursor/active-row intent adapted; native modal lifecycle and BEDS controlled API retained.' }));
assign(['Select', 'FilterSelect'], sourceRecord({ slug: 'select', date: '2026-09-19', raw: '2752510f98d60caea18794d93f868916dbf27f099746828ca9e5bde8c4a201ab', registry: '6c728098323f93c3ec7e713c5cbfc2668dbd12ee24b93ad9bd788d6720b6ba6b', status: 'ADAPTED_HASH_MATCHED', notes: 'Bounded trigger/popup motion adapted; BEDS native/manual anchored behavior retained.' }));
assign(['Badge'], sourceRecord({ slug: 'animated-badge', date: '2026-09-19', raw: '4d52c2e2be1af023ce911d48121278c94f7bb110913c61ed7d8ade47ee17ea06', registry: '0647ea2c8abd6062cf72d8ab4031e5602cc8f9afb98fdcffec0d5abe37b68f83', status: 'ADAPTED_HASH_MATCHED', notes: 'Marker/label motion adapted; BEDS tone/purpose and no-perpetual-pulse contract retained.' }));
assign(['AppShell', 'SidebarHeader', 'WorkspaceTrigger', 'SidebarSection', 'NavItem', 'SidebarFooter'], sourceRecord({ slug: 'animated-sidebar + bounce-sidebar', rawUrl: ['https://beui.dev/r/animated-sidebar/raw', 'https://beui.dev/r/bounce-sidebar/raw'], registryUrl: ['https://beui.dev/r/animated-sidebar.json', 'https://beui.dev/r/bounce-sidebar.json'], date: '2026-09-19', raw: ['e78473dbbb235a856fa1696dce81ee7663b14ae0cb22e5f795bb96551f987a0c', '62f577208fde0dd7317d96f6b996019ba72d4b2c416ceba361fa0c4bece061c5'], registry: ['e821e9fe78f217d569701d85c521611f88b196795f521c9272784a0e30702cf2', '08b7f9778226417cd3d9bf0eb1618ee4e2a620953261f4ecf75e3b6201a63ad3'], status: 'ADAPTED_HASH_MATCHED', notes: 'Only compatible shell/grid/active-row motion adapted; BEDS geometry, native drawer, inert/focus and RTL contracts retained.' }));
assign(['SearchDialog'], sourceRecord({ slug: 'morphing-search', date: '2026-09-19', raw: 'e7b5f55159f78d83df0754705980b04784ad7214f92fb87d3bcc82102729996d', registry: '959dcdab4757566087e075bba41cdaf0c613e8be247170cf08d188e53ae173d8', status: 'NO_FIT_HASH_MATCHED', notes: 'No source logic or motion adopted; uncontrolled morph/filter/portal API does not match BEDS controlled native dialog.' }));
assign(['EmptyState', 'EmptyStateCard'], sourceRecord({ slug: 'not-found', date: '2026-09-19', raw: 'df94905c8d6bbf61e8b1bc02382d62f05aeb9fe84c21c18e3acdd3c0d024ea1d', registry: null, status: 'NO_FIT_HASH_MATCHED_REGISTRY_404', notes: 'Expressive 404/illustration source does not match the compact BEDS empty-state contract; registry endpoint was 404.' }));
assign(['Carousel', 'PagedCarousel', 'HorizontalRail'], sourceRecord({ slug: 'cylinder-carousel + marquee', rawUrl: ['https://beui.dev/r/cylinder-carousel/raw', 'https://beui.dev/r/marquee/raw'], registryUrl: ['https://beui.dev/r/cylinder-carousel.json', 'https://beui.dev/r/marquee.json'], date: '2026-09-19', raw: ['2a0ee658595e356985ae0b76009201506f74c0f7e7675c1de2a32e5ada57d8d3', 'd8d1d371d0d2c800e4ddfd8293f1141b625f084ff7d9b12ca108c37d0b1512d4'], registry: ['fd905d596940706df4d140dcfba6ac8af564418e1bb66a2f111a640eccba9ba0', '41f83bb7a912ac4fe7d2b19e203d9e8383eae92bfb1dc50f48571e5164e25c82'], status: 'DEFERRED_NO_FIT_HASH_MATCHED', notes: 'Draggable spatial/infinite tracks do not preserve the current finite/manual native-scroll contract.' }));
assign(['DataTable'], sourceRecord({ slug: 'table', date: '2026-09-19', raw: '7496bd8522412b5ec050a41b47d493a4292a5a49919b2b9fbbd591e4dbca543f', registry: '45f58d7dcb5528877fc4581aa69d363a22f123f4e58ac60dd89ff604fc4b4904', status: 'DEFERRED_NO_FIT_HASH_MATCHED', notes: 'Virtualization, selection, sorting, resize/reorder, editing and menus would change the short native read-only BEDS contract.' }));
assign(['Pagination'], sourceRecord({ slug: 'adaptive-stepper', date: '2026-09-19', status: 'DEFERRED_NO_FIT_HASH_NOT_RECORDED', notes: 'Quantity-stepper semantics do not preserve one-based page navigation; no hash is recorded in the audited decision row.' }));
assign(['ApplicationBoard'], sourceRecord({ slug: 'swipeable-list', date: '2026-09-19', status: 'NO_FIT_HASH_NOT_RECORDED', notes: 'Mobile row-action/refresh contract does not preserve controlled status lanes; no hash is recorded in the audited decision row.' }));
assign(['Tooltip'], sourceRecord({ slug: 'tooltip', date: '2026-09-19', raw: '248e25c9e322f862ca2bf982d7a8747fe5bf0f779a1b009f34f522dc93c6bcb0', registry: 'b4b154e9a3b5e5c20f258dd65ea18b4825e70fdf32d11da057ed4527fd9ec2ad', status: 'ADAPTED_HASH_MATCHED', notes: 'Anchored motion/gesture helpers adapted to the controlled BEDS label/child contract.' }));

const taskStatus = (row) => {
  const old = priorByName.get(row.export);
  const reconciled = ownerByName.get(row.export) ?? null;
  return {
    primary: old?.primaryTask ?? null,
    implementation: old?.implementationTask ?? null,
    url: old?.taskURL ?? null,
    baselineStatus: old?.taskStatusAtSnapshot ?? null,
    mappingBasis: old?.mappingBasis ?? null,
    ownerReconciliation: reconciled ? { task: reconciled.task, verified: reconciled.verified, taskUpdatedAt: reconciled.taskUpdatedAt } : null,
  };
};

function unique(values) { return [...new Set(values)]; }
function existing(paths) { return paths.filter((p) => fs.existsSync(path.join(root, p))); }
function evidenceFor(row) {
  const extra = [];
  if (['SegmentedControl', 'RadioGroup'].includes(row.export)) extra.push(docs.notices, docs.provenance);
  if (row.export === 'Tabs') extra.push(docs.notices, docs.provenance, 'docs/design/espaco-library/SETTINGS.md');
  if (['SearchDialog', 'CommandPalette', 'Tooltip', 'Select', 'FilterSelect', 'DropdownMenu', 'Dialog', 'Drawer', 'DrawerSection'].includes(row.export)) extra.push(docs.notices, docs.provenance, 'docs/design/espaco-library/DRAWER.md', 'docs/design/espaco-library/SEARCH-DIALOG.md');
  if (row.export === 'DataTable') extra.push(docs.f3, docs.notices, docs.provenance);
  if (row.export === 'ProcessingView') extra.push(docs.processing, docs.notices, docs.provenance);
  const tests = row.consumers.filter((file) => /\.spec\.(tsx?|jsx?)$/.test(file));
  return {
    docs: existing(unique([docs.components, docs.states, docs.governance, row.sourceFile, ...extra])),
    tests,
    browser: 'not-run: BER-9 is read-only structural extraction; existing documentation claims are not re-executed here',
    status: 'documented-only',
    claims: 'Existing docs/spec references are pointers, not fresh behavior, accessibility, visual or acceptance proof for this matrix.',
  };
}

function adaptationFor(source, kind) {
  if (kind === 'type') return 'public-type';
  if (source.status.startsWith('NO_FIT') || source.status.startsWith('DEFERRED')) return 'omitted';
  if (source.status === 'NOT_RECORDED') return 'local';
  return 'adapted';
}

function statusFor(source) {
  if (source.status === 'ADAPTED_HASH_DIVERGENT') return 'PROVENANCE_RECONCILIATION_PENDING';
  if (source.status === 'ADAPTED_HASH_MISSING' || source.status.includes('HASH_NOT_RECORDED') || source.status.includes('HASH_NOT_RECORDED')) return 'PASS_WITH_NOTES_PROVENANCE_GAP';
  if (source.status.startsWith('NO_FIT') || source.status.startsWith('DEFERRED')) return 'DEFERRED_NO_FIT';
  return 'PASS_WITH_NOTES';
}

const rows = extraction.rows.map((row) => {
  const source = beui.get(row.export) ?? noSource(row.kind === 'type' ? 'NOT_APPLICABLE_TYPE' : 'NOT_RECORDED');
  const old = priorByName.get(row.export);
  const owner = ownerByName.get(row.export);
  return {
    order: row.order,
    export: row.export,
    kind: row.kind,
    family: row.family,
    sourceFile: row.sourceFile,
    sourceLine: row.sourceLine,
    indexLine: row.indexLine,
    api: row.api,
    variants: row.variants,
    consumers: row.consumers,
    beuiSource: source,
    adaptation: adaptationFor(source, row.kind),
    owner: {
      task: old?.primaryTask ?? null,
      implementationTask: old?.implementationTask ?? null,
      status: owner?.verified ? 'verified-reconciled' : old ? 'baseline-task-mapped' : 'unmapped',
      taskUpdatedAt: owner?.taskUpdatedAt ?? null,
      executionOwner: old?.executionOwner ?? null,
      reviewOwner: old?.reviewOwner ?? null,
      boardWriter: old?.boardWriter ?? null,
    },
    dependencies: row.dependencies,
    taskChild: taskStatus(row),
    evidence: evidenceFor(row),
    gates: {
      structural: 'verified-by-compiler-api',
      behavior: 'pending',
      variants: 'pending-acceptance',
      acceptance: 'pending',
      browser: 'not-run',
    },
    status: statusFor(source),
  };
});

const fileHash = (file) => ({ path: file, sha256: sha256(path.join(root, file)) });
const inputFiles = [docs.readme, docs.components, docs.states, docs.governance, docs.provenance, docs.notices, docs.opportunities, docs.validation, docs.f3, docs.processing, 'packages/beds/src/index.ts'];
const sourceTreeRows = extraction.sourceHashes.filter((entry) => entry.path.startsWith('packages/beds/src/'));
const catalogTreeRows = extraction.sourceHashes.filter((entry) => entry.path.startsWith('apps/web/labs/espaco-library/'));
const aggregate = (rowsToHash) => sha256(Buffer.from(rowsToHash.map((x) => `${x.path}\0${x.sha256}\n`).join('')));
const baselineArtifactHashes = [
  { path: 'external-baseline/BER-9-export-task-matrix.json', sha256: sha256(priorPath) },
  { path: 'external-baseline/BER-9-owner-reconciliation.json', sha256: sha256(ownerPath) },
  { path: 'external-baseline/BER-9-export-task-matrix.md', sha256: sha256('/Users/robertojunior/Documents/Codex/2026-09-19/beds-tech-lead/outputs/BER-9-export-task-matrix.md') },
  { path: 'external-baseline/BER-9-owner-reconciliation.md', sha256: sha256('/Users/robertojunior/Documents/Codex/2026-09-19/beds-tech-lead/outputs/BER-9-owner-reconciliation.md') },
];

const provenanceAudits = [
  { candidate: 'radio', appliedTo: ['SegmentedControl'], status: 'MISSING_HASH', license: 'MIT', retrieved: '2026-09-17', rawSha256: null, registrySha256: null, sources: ['THIRD-PARTY-NOTICES.md:17'], note: 'URL/license/date and modified-source description exist; raw/registry hashes are absent.' },
  { candidate: 'tabs', appliedTo: ['Tabs'], status: 'MATCHED', license: 'MIT', retrieved: '2026-09-19', rawSha256: '7e3def75375631d855187fd39dcc4398e6f16313149d2be21375a2eae5a7d649', registrySha256: '486f271a0b4de568ba5382e1c5bd602a69ff19385c528460a506845e9a749803', sources: ['THIRD-PARTY-NOTICES.md:18', 'docs/design/espaco-library/PROVENANCE.md:71'] },
  { candidate: 'morphing-search', appliedTo: ['SearchDialog'], status: 'MATCHED_NO_FIT', license: 'MIT', retrieved: '2026-09-19', rawSha256: 'e7b5f55159f78d83df0754705980b04784ad7214f92fb87d3bcc82102729996d', registrySha256: '959dcdab4757566087e075bba41cdaf0c613e8be247170cf08d188e53ae173d8', sources: ['THIRD-PARTY-NOTICES.md:32', 'docs/design/espaco-library/PROVENANCE.md:73'] },
  { candidate: 'popover', appliedTo: [], status: 'MATCHED_NO_FIT_NO_PUBLIC_EXPORT', license: 'MIT', retrieved: '2026-09-19', rawSha256: '79ec5103702ab4c5d4802b6533b8b73219cf1695c4461ac63a60a4a8e60ae8ef', registrySha256: '5c0c3f5141c136f19d5ef6248189a7521fcd26f033a857620f2e6482bc6d73db', sources: ['THIRD-PARTY-NOTICES.md:32', 'docs/design/espaco-library/PROVENANCE.md:76'], note: 'No generic Popover export; existing Tooltip/Select/DropdownMenu keep native/shared anchored contracts.' },
  { candidate: 'table', appliedTo: ['DataTable'], status: 'MATCHED_DEFERRED_NO_FIT', license: 'MIT', retrieved: '2026-09-19', rawSha256: '7496bd8522412b5ec050a41b47d493a4292a5a49919b2b9fbbd591e4dbca543f', registrySha256: '45f58d7dcb5528877fc4581aa69d363a22f123f4e58ac60dd89ff604fc4b4904', sources: ['THIRD-PARTY-NOTICES.md:32', 'docs/design/espaco-library/PROVENANCE.md:77', 'docs/design/espaco-library/F3-MIGRATION-DECISIONS.md:26'] },
  { candidate: 'todo-list', appliedTo: ['ProcessingView'], status: 'MATCHED_ADAPTED', license: 'MIT', retrieved: '2026-09-19', rawSha256: 'ee3b0baabf79fb941f0affbc21e9043c93cd02e59f71ed3f37d55702912cd210', registrySha256: 'f247b5cc7c399e851ddf91660ddfa462c7edcf59ecbac01b6a7139d13e86758', sources: ['THIRD-PARTY-NOTICES.md:21', 'docs/design/espaco-library/PROVENANCE.md:96-103'] },
  { candidate: 'drawer', appliedTo: ['Drawer', 'DrawerSection'], status: 'DIVERGENT_RAW_HASH', license: 'MIT', retrieved: '2026-09-19', rawSha256: 'cb2282d9462850592e6102af210fe7e9e5569778a7d7bef7063d2889a37ee8fb', registrySha256: 'e4eaa7294ff9e883a74fd555ff2e41360d47e18f083aa77318cde845cfacf43b', observedRawSha256: 'cb2282d9462850592e6102af210fe7e9e5569788a7d7bef7063d2889a37ee8fb', sources: ['THIRD-PARTY-NOTICES.md:25', 'docs/design/espaco-library/PROVENANCE.md:62'], note: 'PROVENANCE is treated as canonical for the row; notices contain a different 64-character raw hash. Resolve in a later docs-owned pass.' },
];

const discrepancies = [
  { id: 'inventory', status: 'resolved', finding: 'Current TypeScript Compiler API extraction has 219 exports: 134 components, 8 runtime, 77 types. Added/removed exports versus the prior matrix: none.', evidence: { added: extraction.comparison.added, removed: extraction.comparison.removed, changedCount: extraction.comparison.changed.length } },
  { id: 'finite-unions', status: 'resolved-with-note', finding: 'Current extraction has 1019 finite string/number union members versus 1013 in the baseline; the only changed export is runtime toast, where current API resolution materializes ToastTone (+6). Boolean props remain intentionally excluded.', evidence: extraction.comparison.changed },
  { id: 'prior-working-tree', status: 'recorded', finding: 'The prior artifact was generated from a working tree where controls.tsx differed from HEAD. This matrix uses clean HEAD d5f7f15; no source edit was made.', prior: { path: 'packages/beds/src/controls.tsx', previousSha256: 'bccf150c573f0be83c0ed010b4c7e66afcf82dab59127fc3647e4e036ffa75d4', currentSha256: 'ca5faed7e79c451e494c7eef0aff38578cee2698957db119e24417364393e08b' } },
  { id: 'docs-inventory', status: 'historical-mismatch', finding: 'COMPONENTS.md retains historical counts of 129 local / 113 published RC16 components; the current public index extraction is 134 components. Canonical docs were not edited in this read-only task.' },
  { id: 'owner-reconciliation', status: 'resolved', finding: '17 previously module-scope/pending owner mappings are incorporated from the verified owner reconciliation; they are not left as PENDING_PO.', verifiedExports: ownerReconciliation.owners.map((x) => x.export) },
  { id: 'provenance-targets', status: 'mixed', finding: 'Tabs, morphing-search, popover, table and todo-list hashes match their paired docs; radio lacks hashes; Drawer has a raw-hash conflict between PROVENANCE and THIRD-PARTY-NOTICES.', audits: provenanceAudits },
];

const metadata = {
  schemaVersion: 'ber-9-export-task-matrix@1.0',
  snapshotSha: extraction.snapshot.head,
  generatedAt: '2026-09-19',
  sourceArtifacts: [
    ...inputFiles.map(fileHash),
    ...baselineArtifactHashes,
    { path: 'packages/beds/src/**', aggregateSha256: aggregate(sourceTreeRows), fileCount: sourceTreeRows.length },
    { path: 'apps/web/labs/espaco-library/**', aggregateSha256: aggregate(catalogTreeRows), fileCount: catalogTreeRows.length },
  ],
  counts: { ...extraction.counts, baseline: prior.counts },
  discrepancies,
  limitations: [
    'Read-only structural extraction only; no files outside the two authorized deliverables were changed.',
    'Behavior, variant acceptance, full AC coverage, visual/aesthetic approval, physical assistive technology, non-Chromium engines, real zoom and performance remain pending or untested in this turn.',
    'Consumers are lexical catalog references found in apps/web/labs/espaco-library; lexical presence is not proof of rendered behavior or ownership.',
    'Finite variants are direct public string/number unions resolved by TypeScript Compiler API; booleans, nested object/item unions, free content and cross-prop Cartesian combinations are not enumerated as visual variants.',
    'beUI provenance is copied as a structured reconciliation of local docs; external network retrieval was not repeated. Missing/conflicting hashes remain explicitly flagged.',
    'PASS_WITH_NOTES is investigative/structural and never means Done or aesthetic approval.',
  ],
  extraction: {
    method: 'TypeScript Compiler API resolves named reexports from packages/beds/src/index.ts, aliased declarations, public signatures, finite string/number prop unions, local source imports and catalog lexical consumers.',
    sourceOfTruth: 'clean worktree HEAD/base d5f7f15693e51f8a4234ecb366bc8b2ad44ab545',
    baselineComparison: 'BER-9-export-task-matrix.json plus BER-9-owner-reconciliation.json and their Markdown counterparts; prior counts are hypotheses, not assertions.',
    noBrowser: true,
  },
  provenanceAudits,
  ownerReconciliation: {
    source: 'BER-9-owner-reconciliation.json',
    verifiedAt: ownerReconciliation.verifiedAt,
    resolvedCount: ownerReconciliation.owners.filter((x) => x.verified).length,
    limitation: 'Owner task assignment was verified; this does not prove implementation, behavior or acceptance.'
  },
};

const output = { metadata, rows };
const jsonPath = path.join(root, 'docs/design/espaco-library/audits/ber-9-export-task-matrix.json');
const mdPath = path.join(root, 'docs/design/espaco-library/audits/ber-9-export-task-matrix.md');
fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
fs.writeFileSync(jsonPath, `${JSON.stringify(output, null, 2)}\n`);

function md(value) {
  return String(value ?? '—').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim();
}
function list(values, limit = Infinity) {
  const items = values ?? [];
  if (!items.length) return '—';
  const shown = items.slice(0, limit).map(md);
  const suffix = items.length > limit ? ` … (+${items.length - limit})` : '';
  return `${shown.join('<br>')}${suffix}`;
}
function variants(row) {
  if (!row.variants.length) return '—';
  return row.variants.map((v) => `${v.prop}=${v.values.join(',')}`).join('; ');
}
function beuiSummary(source) {
  const hashes = [];
  if (source.rawSha256) hashes.push(`raw=${Array.isArray(source.rawSha256) ? source.rawSha256.join('/') : source.rawSha256}`);
  if (source.registrySha256) hashes.push(`registry=${Array.isArray(source.registrySha256) ? source.registrySha256.join('/') : source.registrySha256}`);
  if (source.localSourceCommentSha256) hashes.push(`local=${source.localSourceCommentSha256}`);
  if (source.observedRawSha256) hashes.push(`observed=${source.observedRawSha256}`);
  return `${source.status}; ${source.slug ?? 'none'}; ${source.license ?? '—'}; ${source.retrieved ?? '—'}; ${hashes.join(', ') || 'hash=—'}`;
}
function taskSummary(row) {
  const task = row.taskChild;
  if (!task.primary && !task.implementation) return '—';
  const recon = task.ownerReconciliation?.verified ? ' owner-reconciled' : '';
  return `${task.primary ?? task.implementation ?? '—'} / impl ${task.implementation ?? '—'}${recon}`;
}
function evidenceSummary(row) {
  const testText = row.evidence.tests.length ? `tests:${row.evidence.tests.join(',')}` : 'tests:—';
  return `docs:${row.evidence.docs.join(',')}<br>${testText}<br>browser:not-run`;
}

const lines = [];
lines.push('# BER-9 — matriz de export → task');
lines.push('');
lines.push('Status da entrega: **PASS_WITH_NOTES** para reconciliação estrutural; não é Done, aceite visual nem prova comportamental.');
lines.push('');
lines.push(`Snapshot limpo: \`${metadata.snapshotSha}\` (base = HEAD; working tree limpo). Extração atual: **${metadata.counts.exports} exports — ${metadata.counts.components} componentes, ${metadata.counts.runtime} runtime, ${metadata.counts.types} tipos**; **${metadata.counts.variantMembers}** membros finitos de unions. Baseline anterior: ${metadata.counts.baseline.exports} exports / ${metadata.counts.baseline.finitePropMembers} membros.`);
lines.push('');
lines.push('## Método e limites');
lines.push('');
lines.push('- Compiler API do TypeScript sobre `packages/beds/src/index.ts`, com resolução de declarações, assinaturas, unions finitas, imports locais e consumidores lexicais do catálogo.');
lines.push('- A comparação contra os quatro artefatos anteriores está registrada no JSON em `metadata.discrepancies`; `controls.tsx` do artefato anterior tinha hash diferente do HEAD limpo.');
lines.push('- Cada linha separa estrutural, comportamento, variantes/AC, browser e aceite; onde não houve prova nova, consta `pending`/`not-run`.');
lines.push('- Owner reconciliation incorporado para os 17 exports verificados; nenhum deles permanece `PENDING_PO`.');
lines.push('');
lines.push('## Reauditoria direcionada de proveniência');
lines.push('');
lines.push('| candidato beUI | export(s) | status | raw SHA-256 | registry SHA-256 | licença/data | evidência |');
lines.push('|---|---|---|---|---|---|---|');
for (const audit of provenanceAudits) lines.push(`| ${md(audit.candidate)} | ${list(audit.appliedTo)} | ${md(audit.status)} | ${md(audit.rawSha256 ?? audit.observedRawSha256)} | ${md(audit.registrySha256)} | ${md(`${audit.license}/${audit.retrieved}`)} | ${list(audit.sources)}${audit.note ? `<br>${md(audit.note)}` : ''} |`);
lines.push('');
lines.push('## Export matrix');
lines.push('');
lines.push('| # | export | kind/family | arquivo · API | variantes finitas | consumer | beUI source / hash / licença / data | adaptação | owner | deps | task filha | evidence | status / gates |');
lines.push('|---:|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const row of rows) {
  const owner = `${row.owner.task ?? '—'} (${row.owner.status})`;
  const gates = `struct:${row.gates.structural}; behavior:${row.gates.behavior}; variants:${row.gates.variants}; AC:${row.gates.acceptance}; browser:${row.gates.browser}`;
  lines.push(`| ${row.order} | ${md(row.export)} | ${md(`${row.kind}/${row.family}`)} | ${md(`${row.sourceFile ?? '—'}:${row.sourceLine ?? '—'}<br>${row.api ?? 'API unresolved'}`)} | ${md(variants(row))} | ${list(row.consumers)} | ${md(beuiSummary(row.beuiSource))} | ${md(row.adaptation)} | ${md(owner)} | ${list(row.dependencies)} | ${md(taskSummary(row))} | ${evidenceSummary(row)} | ${md(`${row.status}<br>${gates}`)} |`);
}
lines.push('');
lines.push('## Gate summary');
lines.push('');
lines.push('| gate | result |');
lines.push('|---|---|');
lines.push('| HEAD/base recorded | PASS — `d5f7f15693e51f8a4234ecb366bc8b2ad44ab545` |');
lines.push('| Current extraction | PASS_WITH_NOTES — 219 = 134 + 8 + 77; no added/removed exports |');
lines.push('| Baseline reconciliation | PASS_WITH_NOTES — prior working-tree `controls.tsx` divergence and +6 `toast` union members explicitly recorded |');
lines.push('| Owner reconciliation | PASS_WITH_NOTES — 17 verified task mappings incorporated; task assignment is not acceptance proof |');
lines.push('| Provenance targeted | PASS_WITH_NOTES — matched rows, missing radio hashes and conflicting Drawer raw hash remain explicit |');
lines.push('| Browser/visual/AC gates | PENDING / NOT RUN in this read-only phase |');
lines.push('| Allowed file scope | PASS — this phase writes only this Markdown and its JSON in the versioned audit path |');
lines.push('');
lines.push('Machine-readable details, hashes and the full discrepancy record are in [ber-9-export-task-matrix.json](ber-9-export-task-matrix.json).');
fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
console.log(JSON.stringify({ mdPath, jsonPath, rows: rows.length, counts: metadata.counts, status: 'PASS_WITH_NOTES' }, null, 2));
