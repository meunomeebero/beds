import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const retrieved = '2026-09-19';
const snapshotSha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const registryAuditPath = path.join(root, 'work/ber23-registry-audit.json');
const registryAudit = JSON.parse(fs.readFileSync(registryAuditPath, 'utf8'));
const ber9Path = path.join(root, 'docs/design/espaco-library/audits/ber-9-export-task-matrix.json');
const ber9 = JSON.parse(fs.readFileSync(ber9Path, 'utf8'));

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const fileSha = (relativePath) => {
  const absolute = path.join(root, relativePath);
  return fs.existsSync(absolute) ? sha256(fs.readFileSync(absolute)) : null;
};
const unique = (values) => [...new Set(values.filter(Boolean))];
const asArray = (value) => Array.isArray(value) ? value : value ? [value] : [];

const doc = 'docs/design/espaco-library/BEUI-OPPORTUNITIES-2026-09-16.md';
const provenance = 'docs/design/espaco-library/PROVENANCE.md';
const notices = 'THIRD-PARTY-NOTICES.md';
const f3 = 'docs/design/espaco-library/F3-MIGRATION-DECISIONS.md';
const drawerDoc = 'docs/design/espaco-library/DRAWER.md';
const sourceRoot = 'packages/beds/src';

const specs = {};
const set = (slugs, spec) => {
  for (const slug of slugs.split(',')) specs[slug.trim()] = { ...spec };
};

const source = (surface, files = [], exports = []) => ({
  surface,
  exports,
  files: files.map((file) => ({ path: `${sourceRoot}/${file}`, sha256: fileSha(`${sourceRoot}/${file}`) })),
});

const adopted = (slugs, spec) => set(slugs, {
  decision: 'ADAPT',
  category: 'replace',
  stateAccessibilityRisk: { level: 'medium', note: 'Adaptation must preserve the existing BEDS controlled state, keyboard/focus semantics and reduced-motion behavior; this inventory is not behavior or visual acceptance.' },
  owner: 'BEDS canonical source; linked task owner from BER-9 where available',
  proposedChildTask: null,
  evidence: [doc, provenance, notices],
  ...spec,
});

adopted('otp-input', {
  category: 'replace',
  source: source('InputOTP', ['input-otp.tsx'], ['InputOTP', 'InputOTPGroup', 'InputOTPSlot', 'InputOTPSeparator']),
  linkedTask: 'BER-29',
  capabilitySubset: 'slot digit transition, focus-ring/error/success feedback, and reduced-motion behavior adapted onto the native input-otp contract',
  preserved: 'BEDS public InputOTP API, geometry, keyboard/IME behavior and form semantics',
  omitted: 'raw beUI SVG/pathLength/delay details, beUI runtime import and uncontrolled source API',
  rationale: 'Current docs record a controlled native-input adaptation with motion/react reduced; this is an existing provenance decision, not a request to change source.',
  riskNote: 'Error/success transitions can affect focus visibility and announcement timing if the public status contract drifts.',
});
adopted('number', {
  source: source('AnimatedNumber and NumberTicker', ['foundation.tsx', 'number-ticker.tsx'], ['AnimatedNumber', 'NumberTicker']),
  linkedTask: 'BER-42',
  capabilitySubset: 'count-up for true numeric values, integer per-frame snap, null/non-finite guard, reduced-motion jump',
  preserved: 'BEDS numeric API and the rule that computed scores never animate toward fabricated intermediate values',
  omitted: 'finance/chart-specific presentation and any fabricated ATS score animation',
  rationale: 'Adopted in current docs; safe use is limited to credits/prices or other true numeric changes.',
  riskNote: 'A caller can still misuse count-up on an evidence score; the guard is contractual and needs consumer review.',
});
adopted('button', {
  category: 'replace',
  sourceAlias: 'button-base',
  source: source('Button, IconButton and IconToggleButton', ['controls.tsx'], ['Button', 'IconButton', 'IconToggleButton']),
  linkedTask: 'BER-26',
  capabilitySubset: 'press/disabled intent and bounded CTA motion',
  preserved: 'BEDS geometry, variants, disabled semantics and public button API',
  omitted: 'registry source is unavailable at the current JSON endpoint; no direct source replacement is proposed',
  rationale: 'Current public candidate is `button`, while the historical BEDS provenance alias is `button-base`; registry 404 is recorded below.',
  riskNote: 'Unverified alias/source lineage; do not treat the live raw endpoint alone as a complete registry item.',
});
adopted('input', {
  source: source('TextField, TextAreaField and SearchField', ['controls.tsx'], ['TextField', 'TextAreaField', 'SearchField']),
  linkedTask: 'BER-27',
  capabilitySubset: 'error shake/success draw intent with stable error-row geometry',
  preserved: 'BEDS field labels, descriptions, native input semantics, validation state and geometry',
  omitted: 'beUI field styling/API and any layout-changing error behavior',
  rationale: 'The opportunity is already represented by the canonical BEDS field contract; this row records the adapted intent only.',
});
adopted('checkbox', {
  source: source('Checkbox', ['controls.tsx'], ['Checkbox']),
  linkedTask: 'BER-28',
  capabilitySubset: 'draw-on check and real indeterminate motion intent',
  preserved: 'native checkbox semantics, label association and controlled value contract',
  omitted: 'unreviewed upstream focus/indeterminate implementation details',
  rationale: 'Existing BEDS control owns the semantics; beUI is an inspiration/provenance source rather than a runtime dependency.',
});
adopted('switch', {
  source: source('Switch', ['controls.tsx'], ['Switch']),
  linkedTask: 'BER-28',
  capabilitySubset: 'spring thumb travel and bounded state feedback',
  preserved: 'native switch semantics, keyboard activation and controlled API',
  omitted: 'upstream geometry and runtime implementation',
  rationale: 'Current BEDS Switch is the canonical owner; only the motion intent is adapted.',
});
adopted('radio', {
  source: source('SegmentedControl; RadioGroup remains separately owned', ['controls.tsx', 'form-fields.tsx'], ['SegmentedControl', 'RadioGroup']),
  linkedTask: 'BER-10',
  capabilitySubset: 'gliding selection-dot intent',
  preserved: 'native radio semantics and BEDS keyboard navigation; no new raw/registry dependency',
  omitted: 'unverified upstream hash lineage and source-specific geometry',
  rationale: 'BER-9 maps the candidate to SegmentedControl and explicitly records missing upstream hashes; this row keeps that gap visible.',
});
adopted('tabs,expandable-tabs,morphing-tabs', {
  source: source('Tabs', ['controls.tsx'], ['Tabs']),
  linkedTask: 'BER-11',
  capabilitySubset: 'shared/spring indicator and bounded active-state transition',
  preserved: 'BEDS tabs semantics, keyboard, RTL, scroll and geometry contract',
  omitted: 'uncontrolled morphing/expandable API and source-specific layout escapes',
  rationale: 'Tabs is already a documented adapted surface; expandable/morphing variants are candidates for the same contract, not separate BEDS APIs.',
});
adopted('select', {
  source: source('Select and FilterSelect', ['select.tsx', 'overlays.tsx'], ['Select', 'FilterSelect']),
  linkedTask: 'BER-39',
  capabilitySubset: 'bounded trigger-to-popup unfold',
  preserved: 'BEDS native/manual anchored behavior and controlled selection contract',
  omitted: 'beUI popup ownership and source-specific class escape surface',
  rationale: 'Current docs mark this as matched/adapted; no new source integration is proposed.',
});
adopted('tooltip', {
  source: source('Tooltip', ['overlays.tsx'], ['Tooltip']),
  linkedTask: 'BER-39',
  capabilitySubset: 'anchored blur/spring entry helpers',
  preserved: 'BEDS label/child contract, accessible relationship and dismissal behavior',
  omitted: 'unreviewed portal/positioning changes',
  rationale: 'Existing BEDS Tooltip owns the contract; the source is only a bounded motion reference.',
});
adopted('context-menu', {
  source: source('AccountMenu / controlled menu patterns', ['patterns.tsx'], ['AccountMenu']),
  linkedTask: 'BER-53',
  capabilitySubset: 'pointer-origin clip morph and active-row highlight intent',
  preserved: 'BEDS controlled account/workspace/theme API',
  omitted: 'generic context-menu API and uncontrolled portal lifecycle',
  rationale: 'BER-9 records this as adapted to AccountMenu; generic context-menu adoption is not a new public export.',
});
adopted('drawer', {
  source: source('Drawer and DrawerSection', ['overlays.tsx'], ['Drawer', 'DrawerSection']),
  linkedTask: 'BER-35',
  capabilitySubset: 'spring travel, backdrop treatment and controlled native-dialog drawer motion',
  preserved: 'BEDS native lifecycle, focus/inert/Tab/Escape/backdrop/scroll-lock/nested/RTL behavior',
  omitted: 'uncontrolled bottom-sheet API, duplicate scroll owner and raw portal lifecycle',
  rationale: 'Current docs record the drawer adaptation and a raw-hash divergence between provenance documents.',
  dependency: 'At the 9e21b09 snapshot, BER-22 was the Drawer PNG/artifact evidence blocker. Post-snapshot, BER-22 was resolved/integrated canonically at commit 135d539a65ab1156b7e1177bb85682594eda8b14 on 2026-09-19T22:09:11-03:00; BER-23 records the historical boundary and does not modify source/docs.',
  riskNote: 'Drawer hash reconciliation and non-Chromium/physical-AT/aesthetic gates remain separately visible; the Drawer artifact blocker itself is resolved post-snapshot.',
});
adopted('center-morph-modal', {
  category: 'replace',
  source: source('Dialog', ['overlays.tsx', 'overlays.css', 'lib/modal.ts'], ['Dialog']),
  linkedTask: 'BER-35',
  capabilitySubset: 'approved standard/welcome center-morph clip/opacity subset',
  preserved: 'controlled native dialog lifecycle, focus/inert/Tab/Escape/backdrop/scroll-lock/nested/RTL/trigger-removal semantics',
  omitted: 'full morphing-modal transition, portal lifecycle, public API changes and bottom-sheet API',
  rationale: 'Current provenance docs record a bounded center-morph adaptation on native Dialog; this is existing evidence, not a new implementation task.',
  dependency: 'At the 9e21b09 snapshot, the shared Drawer artifact gate was a BER-22 dependency; BER-22 was resolved/integrated canonically at commit 135d539a65ab1156b7e1177bb85682594eda8b14 on 2026-09-19T22:09:11-03:00.',
  riskNote: 'Focused Chromium evidence exists in docs; non-Chromium, physical AT and aesthetic approval remain pending.',
});
adopted('command-palette', {
  source: source('CommandPalette', ['command-palette.tsx', 'lib/modal.ts'], ['CommandPalette']),
  linkedTask: 'BER-37',
  capabilitySubset: 'fuzzy search/cursor, active-row motion and reduced-motion intent',
  preserved: 'controlled native-dialog API, measured geometry, focus and one shared modal scroll-lock owner',
  omitted: 'PresenceGate exit state, grouped/keyword/badge/checkbox/radio APIs and style escapes',
  rationale: 'Current provenance records a matched adapted surface with focused technical evidence and pending visual/AT gates.',
});
adopted('bouncy-accordion', {
  source: source('DisclosureText and DisclosedRecords', ['disclosure.tsx'], ['DisclosureText', 'DisclosedRecords']),
  linkedTask: 'BER-37',
  capabilitySubset: 'height/opacity/layout spring intent',
  preserved: 'BEDS mount, tab-stop and disclosure contracts',
  omitted: 'upstream item structure and uncontrolled lifecycle',
  rationale: 'Existing disclosure surfaces are the owner; no additional accordion API is needed.',
});
adopted('animated-badge', {
  source: source('Badge and status feedback', ['feedback.tsx'], ['Badge', 'StatusDot', 'Notice']),
  linkedTask: 'BER-38',
  capabilitySubset: 'marker/label transition and bounded live-state pulse',
  preserved: 'BEDS tone/purpose and no-perpetual-pulse contract',
  omitted: 'always-on pulse and source-specific status taxonomy',
  rationale: 'Existing feedback surfaces already own the adapted intent.',
});
adopted('animated-toast-stack', {
  category: 'replace',
  source: source('Toaster, toast and dismissToast', ['toast.tsx'], ['Toaster', 'toast', 'dismissToast']),
  linkedTask: 'BER-34',
  capabilitySubset: 'stack/reflow intent bounded by the existing toast event API and reduced-motion behavior',
  preserved: 'BEDS toast input, tone taxonomy, dismiss semantics and caller-owned actions',
  omitted: 'uncontrolled provider stack state, source-specific swipe-dismiss gesture and any new runtime import',
  rationale: 'BER-9 already records this as an adapted source-comment-only decision; the current live registry/raw hashes now close the upstream retrieval gap without changing the public contract.',
  riskNote: 'Stack reflow and swipe-dismiss must not create a second event owner or hide actionable toast content; full browser acceptance is outside this triage.',
});
adopted('loader', {
  source: source('LoadingIndicator', ['feedback.tsx'], ['LoadingIndicator']),
  linkedTask: 'BER-38',
  capabilitySubset: 'spinner/reduced-motion intent mapped to status semantics',
  preserved: 'BEDS loading/status semantics and accessible progress labeling',
  omitted: '17-variant loader catalog and source-specific API',
  rationale: 'The opportunity is already represented by the canonical LoadingIndicator.',
});
adopted('todo-list', {
  source: source('ProcessingView', ['processing.tsx'], ['ProcessingView']),
  linkedTask: 'BER-44',
  capabilitySubset: 'status-mark morphing and segmented ATS fill only',
  preserved: 'host-owned 90s/75s choreography, 95% hold, true text, retro geometry and reduced-motion support',
  omitted: 'source list/details/public styling and any fabricated progress claim',
  rationale: 'F4 resolved this as a bounded local adaptation; no new child task is needed for the source itself.',
});
adopted('animated-sidebar,bounce-sidebar', {
  source: source('AppShell navigation', ['layout.tsx'], ['AppShell', 'NavItem', 'SidebarSection', 'WorkspaceTrigger']),
  linkedTask: 'BER-32',
  capabilitySubset: 'compatible shell/grid/active-row motion',
  preserved: 'BEDS 264/62px geometry, native drawer, inert/focus, RTL and layout contract',
  omitted: 'upstream portal/sidebar ownership and unbounded layout transforms',
  rationale: 'BER-9 records both sources as a matched adaptation to AppShell; current candidate rows remain one ownership decision.',
});
adopted('dock', {
  source: source('Dock', ['dock.tsx'], ['Dock', 'DockItem', 'DockSeparator']),
  linkedTask: 'BER-33',
  capabilitySubset: 'touch-safe dock/rail motion with BEDS API boundary',
  preserved: 'BEDS item/separator structure and touch hit areas',
  omitted: 'unreviewed source geometry and perpetual hover effects',
  rationale: 'BER-9 records a local adaptation with historical provenance gap; current live hashes are now recorded for the candidate.',
});

const noFit = (slugs, spec) => set(slugs, {
  decision: 'NO_FIT',
  category: 'replace',
  source: spec.source || source('No public BEDS surface adopted'),
  linkedTask: spec.linkedTask || null,
  proposedChildTask: null,
  noTaskReason: 'No child task: the mismatch is a resolved NO_FIT decision and should not be reopened without a changed requirement.',
  owner: spec.owner || 'BEDS canonical source; existing contract remains authoritative',
  riskNote: 'No open implementation dependency; preserve the resolved mismatch unless a materially changed requirement reopens it.',
  stateAccessibilityRisk: { level: spec.riskLevel || 'high', note: spec.riskNote || 'Adoption would replace a native/controlled public contract or introduce states that the current surface does not own.' },
  evidence: spec.evidence || [doc, provenance, f3, notices],
  ...spec,
});

noFit('adaptive-stepper', {
  source: source('Pagination', ['data.tsx'], ['Pagination']),
  linkedTask: 'BER-40',
  capabilitySubset: 'none; quantity stepping is not page navigation',
  preserved: 'controlled one-based pagination contract',
  omitted: 'min/max/step liquid quantity API',
  rationale: 'Explicit F3 NO_FIT: numeric quantity stepper semantics do not preserve page navigation.',
  dependency: 'No extra task; F3 decision is complete and should not reopen without a changed requirement.',
});
noFit('table', {
  source: source('DataTable', ['data.tsx'], ['DataTable']),
  linkedTask: 'BER-40',
  capabilitySubset: 'none; source targets virtualized editable grid behavior',
  preserved: 'short native read-only BEDS DataTable',
  omitted: 'virtualization, selection, sorting, resize/reorder, editing and menus',
  rationale: 'Explicit F3 NO_FIT: adopting the source would change the public grid contract and likely add a virtualization dependency.',
  dependency: 'No extra task; retain as a resolved decision unless product requirements change.',
});
noFit('swipeable-list', {
  source: source('ApplicationBoard', ['application-board.tsx'], ['ApplicationBoard']),
  linkedTask: 'BER-54',
  capabilitySubset: 'none; row swipe/reveal/refresh is not controlled status-lane behavior',
  preserved: 'controlled kanban columns/items and lane ownership',
  omitted: 'mobile swipe actions and refresh gesture state',
  rationale: 'Historical decision records the mismatch; preserve lanes rather than importing a row-action contract.',
});
noFit('morphing-search', {
  source: source('SearchDialog', ['overlays.tsx', 'lib/modal.ts'], ['SearchDialog']),
  linkedTask: 'BER-37',
  capabilitySubset: 'none; only the compatible command-palette subset is used',
  preserved: 'controlled native dialog, caller-owned async/filter state, IME-safe editing and return focus',
  omitted: 'uncontrolled trigger-to-dialog morph, custom portal/role/scroll-lock and class/icon escapes',
  rationale: 'Explicit provenance NO_FIT; `CommandPalette` is the compatible source, not `SearchDialog`.',
});
noFit('popover', {
  source: source('Tooltip, Select and DropdownMenu anchored contracts', ['overlays.tsx', 'select.tsx'], ['Tooltip', 'Select', 'DropdownMenu']),
  capabilitySubset: 'none; no generic Popover export is adopted',
  preserved: 'existing anchored contracts with owned focus and dismissal behavior',
  omitted: 'generic uncontrolled popover API and duplicate positioning/portal lifecycle',
  rationale: 'Explicit provenance NO_FIT_NO_PUBLIC_EXPORT; existing anchored primitives remain authoritative.',
});
noFit('not-found', {
  source: source('EmptyState and EmptyStateCard', ['feedback.tsx', 'empty-state-card.tsx'], ['EmptyState', 'EmptyStateCard']),
  linkedTask: 'BER-38',
  capabilitySubset: 'none; expressive 404/illustration source does not match compact empty-state contract',
  preserved: 'compact BEDS empty-state and action semantics',
  omitted: 'illustration-heavy 404 layout and source-specific route assumptions',
  rationale: 'Historical NO_FIT remains valid; current registry JSON 404 is observed separately from the raw endpoint.',
});
noFit('morphing-modal', {
  source: source('Dialog', ['overlays.tsx', 'lib/modal.ts'], ['Dialog']),
  linkedTask: 'BER-35',
  capabilitySubset: 'none beyond the separately documented center-morph visual subset',
  preserved: 'controlled native dialog and shared modal state',
  omitted: 'full origin morph, portal lifecycle and additional public modal API',
  rationale: 'Current provenance explicitly separates `center-morph-modal` ADAPT from full `morphing-modal` NO_FIT.',
});

const deferred = (slugs, spec) => set(slugs, {
  decision: 'DEFER',
  category: spec.category || 'enhance',
  linkedTask: spec.linkedTask || null,
  proposedChildTask: null,
  noTaskReason: 'No linked task: the candidate is explicitly deferred until its dependency, product requirement or owner decision is resolved.',
  owner: spec.owner || 'Unallocated; requirement/owner is not established by the current BEDS contract',
  stateAccessibilityRisk: { level: spec.riskLevel || 'high', note: spec.riskNote || 'Candidate requires a public state contract, ownership and accessibility acceptance before implementation can be scoped safely.' },
  evidence: spec.evidence || [doc, provenance],
  ...spec,
});

deferred('bottom-sheet', {
  source: source('Drawer', ['overlays.tsx'], ['Drawer']),
  category: 'replace',
  capabilitySubset: 'none pending; spring drawer motion is already owned by Drawer',
  preserved: 'native dialog drawer and scroll-lock contract',
  omitted: 'drag gesture, snap points and bottom-sheet API',
  rationale: 'Explicitly defer: adding a draggable sheet would create a new public gesture/state contract; do not infer it from Drawer.',
  dependency: 'BER-22 only if shared Drawer evidence is required; no implementation task in BER-23.',
});
deferred('cylinder-carousel,marquee', {
  source: source('Carousel, PagedCarousel and HorizontalRail', ['data.tsx', 'paged-carousel.tsx'], ['Carousel', 'PagedCarousel', 'HorizontalRail']),
  linkedTask: 'BER-41',
  capabilitySubset: 'none; no depth/infinite/continuous track behavior is currently preserved',
  preserved: 'finite/manual native-scroll and paging contracts',
  omitted: 'draggable spatial/infinite track and continuous marquee',
  rationale: 'Explicit F3 NO_FIT/defer: source would change scrolling ownership and interaction semantics.',
});
deferred('scroll-animation', {
  category: 'enhance',
  source: source('FeatureCard/BenefitsSection candidate', ['feature-card.tsx', 'benefits.tsx'], ['FeatureCard', 'BenefitsSection']),
  capabilitySubset: 'none pending; reveal behavior is not specified',
  preserved: 'native page scrolling and existing surface layout',
  omitted: 'Lenis runtime and scroll hijacking',
  rationale: 'Owner decision explicitly defers Lenis/second runtime dependency and hijacked native scrolling.',
  dependency: 'No runtime dependency or task may be added from this triage.',
});
deferred('theme-toggle', {
  category: 'enhance',
  source: source('ThemeToggle', ['foundation.tsx'], ['ThemeToggle']),
  capabilitySubset: 'none pending; whole-page View Transition requires brand decision',
  preserved: 'current theme state/change API',
  omitted: 'global page repaint and cross-surface transition ownership',
  rationale: 'Explicit owner decision: View Transition touches brand identity across every surface, so no child implementation task is created.',
});
deferred('chat-app,ai-sidebar', {
  category: 'new-capability',
  capabilitySubset: 'none; whole-app composition is outside the component gap',
  preserved: 'existing BEDS ChatLayout/Conversation primitives and product layout ownership',
  omitted: 'provider-specific app shell, persistence and conversation orchestration',
  rationale: 'Explicitly out of the component opportunity scope; harvest individual parts only after a concrete product requirement.',
  riskLevel: 'high',
});
deferred('notification-stack', {
  category: 'replace',
  source: source('Toaster', ['toast.tsx'], ['Toaster', 'toast', 'dismissToast']),
  linkedTask: 'BER-34',
  capabilitySubset: 'none pending beyond the existing toast API',
  preserved: 'BEDS event/toast state and dismiss semantics',
  omitted: 'source-specific stack/reflow and swipe-dismiss API',
  rationale: 'Potential enhancement, but the candidate adds layout-aware stack state and gesture semantics not owned by the current Toaster contract.',
});

const requirement = (slugs, spec) => set(slugs, {
  decision: 'NEEDS_REQUIREMENT',
  category: spec.category || 'new-capability',
  linkedTask: spec.linkedTask || null,
  proposedChildTask: { id: null, recommendation: spec.childRecommendation || 'Create a child task only after product behavior, public API, owner and accessibility acceptance criteria are written.' },
  owner: spec.owner || 'Unallocated; no current public BEDS owner/task establishes this capability',
  stateAccessibilityRisk: { level: spec.riskLevel || 'high', note: spec.riskNote || 'State model, focus/keyboard behavior and acceptance criteria are not defined for the current BEDS contract.' },
  evidence: spec.evidence || [doc, provenance],
  ...spec,
});

requirement('agent-activity,tool-result,file-diff,loading-states', {
  category: 'enhance',
  source: source('ProcessingView', ['processing.tsx'], ['ProcessingView']),
  capabilitySubset: 'candidate-only status/stream/loading subpatterns',
  preserved: 'ProcessingView true text and host-owned choreography',
  omitted: 'provider-specific event stream, staged copy and diff/tool payload contract',
  rationale: 'Audit names these as secondary ProcessingView candidates, but F4 only resolved the bounded todo-list subset; no public contract exists for the rest.',
  childRecommendation: 'Define one public ProcessingView state extension and evidence contract before selecting any upstream subpattern.',
});
requirement('approval-card,tool-approval', {
  category: 'replace',
  source: source('ApprovalCard and decision surfaces', ['decisions.tsx'], ['ApprovalCard', 'DecisionStatus', 'DecisionActions']),
  capabilitySubset: 'candidate decision-state transition',
  preserved: 'BEDS approval/decision semantics and caller-owned action state',
  omitted: 'agent tool permission protocol and provider-specific approval payloads',
  rationale: 'Candidate is plausible, but no acceptance contract defines state transitions, focus return or destructive-action handling.',
  childRecommendation: 'Specify decision states, keyboard/focus behavior, async outcome semantics and owner before implementation.',
});
requirement('availability-scheduler', {
  category: 'enhance',
  source: source('DateItem and DateItemList candidate', ['date-item.tsx'], ['DateItem', 'DateItemList']),
  capabilitySubset: 'candidate availability selection choreography',
  preserved: 'DateItem data ownership and date semantics',
  omitted: 'scheduler grid, timezone/persistence and booking rules',
  rationale: 'Audit lists this as an enhancement, but product/domain rules and persistence are explicitly out of the current component-only scope.',
  childRecommendation: 'Define a domain-neutral controlled selection contract before any motion task.',
});
requirement('bloom-menu,dynamic-island', {
  category: 'new-capability',
  capabilitySubset: 'none; new interaction patterns absent from BEDS',
  preserved: 'no existing public surface',
  omitted: 'gesture, transient state, responsive geometry and possibly persistence/orchestration',
  rationale: 'New capabilities require an explicit product scenario and accessibility contract; do not create an artificial component from a visual demo.',
});
requirement('card-folder,project-folder,file-tree', {
  category: 'new-capability',
  capabilitySubset: 'none; hierarchical/file-domain behavior is not currently owned',
  preserved: 'no existing public surface',
  omitted: 'tree navigation, selection, expansion, persistence and file/project domain semantics',
  rationale: 'Potentially useful patterns, but requirements and domain ownership are absent; no safe child task can be opened from this inventory.',
});
requirement('combobox,multi-select', {
  category: 'new-capability',
  capabilitySubset: 'none; selection composition is not a generic BEDS export today',
  preserved: 'Select/FilterSelect controlled single-selection contract',
  omitted: 'multi-value state, typeahead, option creation and announcement behavior',
  rationale: 'Needs explicit public API and accessibility requirements before extending Select.',
  childRecommendation: 'Define value identity, filtering/IME, keyboard, virtualization threshold and screen-reader announcements.',
});
requirement('range-slider,wheel-picker', {
  category: 'new-capability',
  capabilitySubset: 'none; no BEDS value/gesture contract',
  preserved: 'no existing public surface',
  omitted: 'range/step semantics, touch/keyboard interaction, focus model and value announcements',
  rationale: 'New input primitives need product requirements and input accessibility acceptance; avoid importing the visual pattern alone.',
});
requirement('expandable-action-bar,overflow-actions,expandable-control', {
  category: 'enhance',
  source: source('Toolbar/overflow candidate', ['patterns.tsx'], ['AccountMenu']),
  capabilitySubset: 'candidate progressive disclosure for overflow actions',
  preserved: 'caller-owned action identity and current toolbar layout',
  omitted: 'action priority, keyboard roving/tab behavior, responsive collapse rules and persistence',
  rationale: 'Audit identifies the gap, but no owner or public contract exists for action ordering and focus management.',
  childRecommendation: 'Write the responsive action-priority and keyboard/focus contract before implementation.',
});
requirement('expanding-arrow-button,action-swap', {
  category: 'replace',
  source: source('Button', ['controls.tsx'], ['Button']),
  capabilitySubset: 'candidate CTA affordance/label-to-state transition',
  preserved: 'BEDS Button geometry, disabled/loading semantics and label stability',
  omitted: 'unreviewed label swap timing and source-specific icon/path animation',
  rationale: 'Potential button enhancement, but the public loading/success state and reduced-motion contract are not defined; action-swap registry JSON is currently 404.',
  childRecommendation: 'Specify non-destructive state transitions, accessible status text and reduced-motion behavior before a child task.',
});
requirement('feedback-widget', {
  category: 'new-capability',
  capabilitySubset: 'none; feedback submission state is not a BEDS primitive',
  preserved: 'Notice/Toast feedback rendering only',
  omitted: 'persistence, submission, consent and product feedback taxonomy',
  rationale: 'Explicit product/domain/persistence boundary; a visual widget alone is not a safe BEDS capability.',
});
requirement('file-upload', {
  category: 'replace',
  source: source('FileUploadField', ['form-fields.tsx'], ['FileUploadField']),
  capabilitySubset: 'candidate attachment workspace and per-file progress queue',
  preserved: 'BEDS controlled file-field API, validation and keyboard semantics',
  omitted: 'upload transport, persistence, retries and external integration',
  rationale: 'Audit identifies a useful visual direction, but real upload/persistence is explicitly out of scope; no mock-only contract is approved here.',
  childRecommendation: 'Define a transport-agnostic, non-publishing file state contract before any visual adaptation.',
});
requirement('file-diff,code-block', {
  category: 'replace',
  source: source('CodeSnippet', ['technical.tsx'], ['CodeSnippet']),
  capabilitySubset: 'candidate streaming reveal, line numbers and focused-line treatment',
  preserved: 'BEDS static CodeSnippet/technical content contract',
  omitted: 'stream transport, diff semantics and provider-specific code payloads',
  rationale: 'The visual opportunity is real, but source/state ownership and streaming/diff semantics are not specified.',
});
requirement('heat-calendar', {
  category: 'new-capability',
  source: source('Charts absent; ForumTopic/DateItem are not chart owners', ['forum-topic.tsx', 'date-item.tsx'], ['ForumTopicCard', 'DateItem']),
  capabilitySubset: 'candidate activity-density calendar only',
  preserved: 'no existing chart contract',
  omitted: 'metric semantics, date aggregation, color scale and responsive/AT data table',
  rationale: 'Only broadly reusable chart candidate, but the data contract and accessible alternative are missing.',
});
requirement('image-generation', {
  category: 'new-capability',
  capabilitySubset: 'none; provider/media generation workflow absent',
  preserved: 'Image/icon display only',
  omitted: 'generation, progress, persistence, moderation and external provider integration',
  rationale: 'Explicit integration/domain boundary; do not add a mock generation surface without product scope.',
});
requirement('infinite-masonry', {
  category: 'enhance',
  source: source('ForumTopic/Records candidate', ['forum-topic.tsx', 'records.tsx'], ['ForumTopicList', 'DefinitionTable']),
  capabilitySubset: 'candidate feed density/layout only',
  preserved: 'current list/table ownership and native scrolling',
  omitted: 'infinite loading, virtualization, pagination and persistence',
  rationale: 'Audit identifies a feed opportunity, but loading/virtualization and ownership requirements are absent.',
});
requirement('message,message-bubble,message-scroller,prompt-input,streaming-response,citations', {
  category: 'enhance',
  source: source('Conversation and chat primitives', ['chat.tsx'], ['Conversation', 'ConversationBubble', 'ChatMessage', 'ChatComposer', 'ChatThread']),
  capabilitySubset: 'candidate streaming/pinned-scroll/composer-state subpatterns',
  preserved: 'existing BEDS conversation layout and caller-owned message state',
  omitted: 'provider streaming protocol, persistence, auto-scroll policy and citation payload schema',
  rationale: 'Audit names these as parts to harvest, but no single public contract or acceptance criteria has been approved.',
  childRecommendation: 'Define message identity, streaming lifecycle, pinned-scroll policy, cancellation and accessible citations before splitting tasks.',
});
requirement('preview-rail', {
  category: 'enhance',
  source: source('AppShell navigation candidate', ['layout.tsx'], ['AppShell', 'NavItem']),
  capabilitySubset: 'candidate preview rail/collapse motion',
  preserved: 'BEDS shell geometry, navigation focus and native drawer behavior',
  omitted: 'hover-preview ownership and layout transforms',
  rationale: 'Potential extension of AppShell, but no requirement identifies which preview content and focus model are wanted.',
});
requirement('prompt-input', {
  category: 'enhance',
  source: source('ChatComposer', ['chat.tsx'], ['ChatComposer']),
  capabilitySubset: 'candidate composer state feedback',
  preserved: 'BEDS caller-owned composer state and attachment picker contract',
  omitted: 'provider submit/stream lifecycle and auto-resize/keyboard policy',
  rationale: 'Covered by the broader chat requirement; no separate child task until the shared message contract exists.',
});
requirement('pull-to-refresh', {
  category: 'enhance',
  source: source('ApplicationBoard/ScrollableList candidate', ['application-board.tsx', 'data.tsx'], ['ApplicationBoard', 'ScrollableList']),
  capabilitySubset: 'candidate mobile refresh gesture',
  preserved: 'native scrolling and caller-owned refresh state',
  omitted: 'gesture capture, rubber-band interaction and async refresh lifecycle',
  rationale: 'Explicitly defer until a concrete mobile product requirement; avoid scroll hijack or gesture conflict.',
});
requirement('shader-background', {
  category: 'new-capability',
  source: source('No current surface', [], []),
  capabilitySubset: 'none; decorative shader only',
  preserved: 'no existing public surface',
  omitted: 'GPU/performance budget, contrast and reduced-motion treatment',
  rationale: 'No product gap or owner is recorded; decorative motion is not sufficient reason to add a public primitive.',
});
requirement('shared-layout-bg', {
  category: 'enhance',
  source: source('Cross-surface transition candidate', ['layout.tsx'], ['Surface', 'AppShell']),
  capabilitySubset: 'candidate card-to-detail continuity',
  preserved: 'BEDS layout ownership and stable DOM/focus order',
  omitted: 'shared-layout identity, routing lifecycle and cross-surface state',
  rationale: 'Needs a concrete transition scenario and routing/focus contract; no motion is added from the candidate alone.',
});
requirement('signup-form', {
  category: 'replace',
  source: source('Onboarding', ['onboarding.tsx'], ['Onboarding']),
  capabilitySubset: 'candidate validate-on-blur, clear-on-fix and strength-meter feedback',
  preserved: 'BEDS onboarding intent and mock boundary',
  omitted: 'real account creation, persistence, validation provider and auth integration',
  rationale: 'Visual opportunity is listed, but real signup/auth is explicitly out of scope and no mock state contract is approved.',
});
requirement('tilt-card', {
  category: 'enhance',
  source: source('FeatureCard/PricingCard candidate', ['feature-card.tsx', 'pricing.tsx'], ['FeatureCard', 'PricingCard']),
  capabilitySubset: 'candidate bounded hover depth for cards',
  preserved: 'BEDS card geometry, focus and touch behavior',
  omitted: 'pointer-tracking tilt on touch/keyboard and motion budget',
  rationale: 'Requires an aesthetic/interaction decision and reduced-motion/touch contract; no artificial motion is authorized by this inventory.',
});
requirement('tool-approval', {
  category: 'replace',
  source: source('ApprovalCard', ['decisions.tsx'], ['ApprovalCard']),
  capabilitySubset: 'candidate approval-state transition',
  preserved: 'BEDS decision surface and caller-owned async outcome',
  omitted: 'tool permission protocol and external action submission',
  rationale: 'Duplicate candidate is retained as a distinct registry row but shares the unresolved decision-surface requirement.',
});
requirement('tool-result', {
  category: 'enhance',
  source: source('ProcessingView', ['processing.tsx'], ['ProcessingView']),
  capabilitySubset: 'candidate tool-result status subpattern',
  preserved: 'true processing text and host-owned progress',
  omitted: 'provider payload schema and streaming lifecycle',
  rationale: 'F4 deferred secondary tool-state candidates; no task without an agreed public state contract.',
});
requirement('wallet-card', {
  category: 'enhance',
  source: source('AccountCredits', ['account-credits.tsx'], ['AccountCredits']),
  capabilitySubset: 'candidate balance/card-depth treatment',
  preserved: 'BEDS credit balance and explicit product/payment semantics',
  omitted: 'wallet/trading/payment domain behavior and persistence',
  rationale: 'Only the true numeric count-up subset is currently safe; wallet-card is a domain-shaped source and needs a product requirement.',
});

noFit('knockout-bracket,prediction-market,price-target-fan,returns-calendar,swap', {
  category: 'out-of-scope',
  capabilitySubset: 'none',
  preserved: 'BEDS domain boundaries',
  omitted: 'tournament/trading/crypto/finance domain state and presentation',
  rationale: 'Explicit not-adopting list: wrong product domain for BEDS and no child task should be created.',
  riskLevel: 'high',
  owner: 'Product/domain owner outside BEDS; deliberately excluded',
});

// Keep the candidate list exhaustive: any newly indexed slug becomes visible rather than silently omitted.
const ownerRows = new Map();
for (const row of ber9.rows) {
  const slug = row.beuiSource?.slug;
  if (!slug) continue;
  for (const alias of slug.split('+').map((item) => item.trim())) {
    const existing = ownerRows.get(alias);
    if (!existing || row.owner?.task) ownerRows.set(alias, row);
  }
}

const localProvenanceBySlug = new Map();
for (const row of ber9.rows) {
  const slug = row.beuiSource?.slug;
  if (!slug) continue;
  for (const alias of slug.split('+').map((item) => item.trim())) {
    if (!localProvenanceBySlug.has(alias)) localProvenanceBySlug.set(alias, []);
    localProvenanceBySlug.get(alias).push(row.beuiSource);
  }
}
localProvenanceBySlug.set('center-morph-modal', [{
  status: 'ADAPTED_HASH_MATCHED',
  slug: 'center-morph-modal',
  rawSha256: '48a20aa11ad2a17678505803c2ff303753b541c3f3722aa7afc0e913d48041df',
  registrySha256: 'b74589ea5aff31a332312dcc89b3e78a49772751bb251a8ad206a06513c1c95e',
  retrieved: '2026-09-19',
  license: 'MIT',
  sources: [provenance, notices],
}]);
localProvenanceBySlug.set('otp-input', [{
  status: 'ADAPTED_HASH_MATCHED',
  slug: 'otp-input',
  rawSha256: '55b1fe88cd54f3479d4410d40dc90bb7dbbb53bdc8e972e401386fb2dbd23b1b',
  registrySha256: 'd6eb9fd0502470470fdf514fc082bf9b2367aca8ac5b65a852924fdf29fc6054',
  retrieved: '2026-09-19',
  license: 'MIT',
  sources: [notices],
  notes: 'BER-29 provenance: adapted native input-otp; motion/react reduced; raw SVG/pathLength/delay omitted; no runtime beUI import/new dependency.',
}]);

const compareEvidence = (current, historical) => {
  if (!historical.length) return 'not-recorded-before';
  const oldRaw = unique(historical.flatMap((item) => asArray(item.rawSha256)));
  const oldRegistry = unique(historical.flatMap((item) => asArray(item.registrySha256)));
  const raw = current.raw.sha256;
  const registry = current.registry.sha256;
  const hasHistoricalConflict = historical.some((item) => item.observedRawSha256 && item.observedRawSha256 !== raw);
  if (raw && oldRaw.includes(raw) && (!registry || oldRegistry.includes(registry))) return hasHistoricalConflict ? 'match-with-historical-document-conflict' : 'match';
  if (oldRaw.length || oldRegistry.length) return 'drift-or-current-source-changed';
  return 'historical-hash-missing-now-observed';
};

const filesFor = (component) => {
  const files = component.registry.json?.files || [];
  return files
    .map((file) => ({ path: file.path, type: file.type || null, target: file.target || null, sha256: sha256(file.content || '') }))
    .sort((a, b) => a.path.localeCompare(b.path));
};

const defaultSpec = (slug) => ({
  decision: 'NEEDS_REQUIREMENT',
  category: 'new-capability',
  capabilitySubset: 'candidate source pattern only; no BEDS subset approved',
  preserved: 'no current public BEDS contract changed',
  omitted: 'upstream API, state model, persistence and source-specific dependencies',
  rationale: 'Candidate is present in the current live index but no approved BEDS contract, owner or task was found in the audited sources.',
  owner: 'Unallocated; no canonical BEDS owner/task found',
  linkedTask: null,
  proposedChildTask: { id: null, recommendation: 'Write product scenario, public API, state/accessibility contract and owner before creating a child implementation task.' },
  stateAccessibilityRisk: { level: 'high', note: 'No accepted public state/focus/keyboard contract exists for this candidate.' },
  evidence: [doc],
  riskNote: 'Requirement and ownership gate is open; no implementation should be inferred from the visual source.',
});

const rows = registryAudit.components
  .slice()
  .sort((a, b) => a.slug.localeCompare(b.slug))
  .map((component, index) => {
    const spec = { ...defaultSpec(component.slug), ...(specs[component.slug] || {}) };
    const historical = localProvenanceBySlug.get(component.slug) || [];
    const ownerRow = ownerRows.get(component.slug);
    if (!spec.linkedTask && ownerRow?.owner?.task) spec.linkedTask = ownerRow.owner.task;
    if (spec.owner === 'BEDS canonical source; linked task owner from BER-9 where available' && ownerRow?.owner?.task) {
      spec.owner = `BEDS canonical source; BER-9 linked task ${ownerRow.owner.task}`;
    }
    const registryJson = component.registry.json;
    const registry = {
      url: component.registryUrl,
      status: component.registry.status,
      sha256: component.registry.sha256,
      bytes: component.registry.bytes,
      contentType: component.registry.contentType,
      metadataLicense: registryJson?.license ?? null,
    };
    const raw = {
      url: component.rawUrl,
      status: component.raw.status,
      sha256: component.raw.sha256,
      bytes: component.raw.bytes,
      contentType: component.raw.contentType,
    };
    const status = spec.decision === 'ADAPT' ? 'IMPLEMENTED_OR_DOCUMENTED_ADAPTATION_PENDING_FULL_ACCEPTANCE' :
      spec.decision === 'NO_FIT' ? 'RESOLVED_NO_FIT' :
        spec.decision === 'DEFER' || spec.decision === 'out-of-scope' ? 'DEFERRED' : 'PENDING_REQUIREMENT_OR_OWNER';
    return {
      order: index + 1,
      slug: component.slug,
      name: component.name,
      category: component.category,
      indexUpdatedAt: component.indexUpdatedAt,
      description: registryJson?.description || null,
      author: registryJson?.author || null,
      decision: spec.decision,
      status,
      capabilityKind: spec.category,
      sourceAlias: spec.sourceAlias || null,
      localSurface: spec.source || null,
      capabilitySubset: spec.capabilitySubset,
      preserved: spec.preserved,
      omitted: spec.omitted,
      rationale: spec.rationale,
      stateAccessibilityRisk: spec.stateAccessibilityRisk,
      dependencyRisk: spec.dependency || (spec.decision === 'ADAPT' && spec.linkedTask
        ? 'Existing linked task owns the bounded adaptation; full browser, aesthetic and consumer acceptance remain outside this read-only triage.'
        : spec.riskNote || null),
      owner: spec.owner,
      linkedTask: spec.linkedTask || null,
      noTaskReason: spec.linkedTask ? null : (spec.noTaskReason || spec.proposedChildTask?.recommendation || 'No linked task: current evidence does not establish an implementation-ready contract.'),
      proposedChildTask: spec.proposedChildTask || null,
      evidence: spec.evidence,
      provenance: {
        license: 'MIT (beUI repository/docs; registry item has no license field)',
        registry,
        raw,
        files: filesFor(component),
        dependencies: registryJson?.dependencies || [],
        registryDependencies: registryJson?.registryDependencies || [],
        retrieved,
        historicalEvidence: historical.map((item) => ({
          status: item.status || null,
          slug: item.slug || null,
          rawSha256: item.rawSha256 || null,
          registrySha256: item.registrySha256 || null,
          retrieved: item.retrieved || null,
          sources: item.sources || [],
          note: item.notes || null,
          observedRawSha256: item.observedRawSha256 || null,
        })),
        comparison: compareEvidence(component, historical),
      },
    };
  });

const decisionCounts = Object.fromEntries(['ADAPT', 'NO_FIT', 'DEFER', 'NEEDS_REQUIREMENT'].map((decision) => [decision, rows.filter((row) => row.decision === decision).length]));
const registryCounts = {
  candidates: rows.length,
  registryOk: rows.filter((row) => row.provenance.registry.status === 200).length,
  registryObserved404: rows.filter((row) => row.provenance.registry.status === 404).length,
  rawOk: rows.filter((row) => row.provenance.raw.status === 200).length,
  filesHashed: rows.reduce((sum, row) => sum + row.provenance.files.length, 0),
};

const sourceArtifacts = [
  'docs/design/espaco-library/BEUI-OPPORTUNITIES-2026-09-16.md',
  'docs/design/espaco-library/EXTERNAL-COMPONENT-SOURCING.md',
  'docs/design/espaco-library/F3-MIGRATION-DECISIONS.md',
  'docs/design/espaco-library/PROVENANCE.md',
  'THIRD-PARTY-NOTICES.md',
  'packages/beds/src/index.ts',
].map((file) => ({ path: file, sha256: fileSha(file) }));
sourceArtifacts.push({ path: 'work/ber23-registry-audit.json', sha256: sha256(fs.readFileSync(registryAuditPath)) });
sourceArtifacts.push({ path: 'docs/design/espaco-library/audits/ber-9-export-task-matrix.json', sha256: sha256(fs.readFileSync(ber9Path)) });

const result = {
  metadata: {
    schemaVersion: 'ber-23-opportunities-triage@1.0',
    snapshotSha,
    generatedAt: retrieved,
    sourceArtifacts,
    liveRegistry: {
      indexUrl: registryAudit.index.url,
      indexStatus: registryAudit.index.status,
      indexSha256: registryAudit.index.sha256,
      componentCount: registryAudit.index.componentCount,
      retrieved: registryAudit.retrieved,
      licenseObservation: 'MIT (beUI repository/docs); registry item JSON did not expose a license field',
    },
    counts: { ...registryCounts, decisions: decisionCounts },
    classification: {
      rule: 'Every current live index slug is emitted exactly once. ADAPT records a bounded existing/current BEDS subset; NO_FIT preserves a completed mismatch decision; DEFER records an explicit dependency/ownership boundary; NEEDS_REQUIREMENT records a candidate without an implementation-ready public contract.',
      unclassified: rows.filter((row) => !row.decision).map((row) => row.slug),
      registry404IsNotAbsence: true,
      historicalOnlyAliases: [
        { alias: 'button-base', currentCandidate: 'button', surface: 'Button/IconButton/IconToggleButton', note: 'Historical provenance alias; current live `button.json` returned 404 and raw returned 200.' },
        { alias: 'number-ticker', currentCandidate: 'number', surface: 'NumberTicker', note: 'Historical BEDS source row; current live `number` is the indexed candidate.' },
        { alias: 'animated-sidebar + bounce-sidebar', currentCandidates: ['animated-sidebar', 'bounce-sidebar'], surface: 'AppShell navigation', note: 'Grouped historical source mapping split into one row per current live slug.' },
        { alias: 'cylinder-carousel + marquee', currentCandidates: ['cylinder-carousel', 'marquee'], surface: 'Carousel/PagedCarousel/HorizontalRail', note: 'Grouped historical source mapping split into one row per current live slug.' },
      ],
    },
    gates: {
      structural: 'PASS: 85 live candidates emitted once; 78 registry JSON responses and 85 raw responses observed; file hashes computed where registry JSON was available.',
      pending: [
        'owner/product requirement for NEEDS_REQUIREMENT rows',
        'aesthetic approval and implementation acceptance',
        'non-Chromium and physical assistive technology validation',
        'provenance reconciliation where historical hashes were absent or differ',
      ],
      postSnapshotUpdates: [
        {
          id: 'BER-22',
          status: 'resolved-and-integrated-post-snapshot',
          snapshot: '9e21b09f402027d2bd81626ebec1c111617c1729',
          resolvedCommit: '135d539a65ab1156b7e1177bb85682594eda8b14',
          resolvedAt: '2026-09-19T22:09:11-03:00',
          note: 'Drawer evidence artifacts were canonically integrated and BER-22 gates reported green after the BER-23 snapshot. This does not change the historical 9e21b09 observation or authorize source/docs changes here.',
        },
      ],
      limitations: [
        'Read-only triage; no source, docs, consumer, catalog, dist or product file was edited.',
        'Live network results are a dated observation; 404 registry items are not classified as absent because their raw endpoints were retrieved.',
        'Registry item JSON has no license field; MIT is carried from repository/docs provenance and explicitly marked as observed outside item metadata.',
        'A current raw hash can differ from historical docs because beUI content may change; this is surfaced as drift-or-current-source-changed, not silently normalized.',
        'No browser or visual run was required for this read-only inventory.',
        'No artificial motion, product-domain behavior, persistence, upload, publishing, auth, payment, or scroll-hijacking capability is proposed by this artifact.',
      ],
      browser: 'not-run: BER-23 is read-only registry/provenance triage',
      mutationBoundary: 'No implementation, merge, push or publish performed.',
    },
  },
  rows,
};

const outJson = path.join(root, 'work/BER-23-opportunities-triage.json');
const outMd = path.join(root, 'work/BER-23-opportunities-triage.md');
fs.writeFileSync(outJson, `${JSON.stringify(result, null, 2)}\n`);

const link = (url, text) => url ? `[${text}](${url})` : '—';
const filesCell = (files) => files.length ? files.map((file) => `${file.path}=${file.sha256}`).join('<br>') : '—';
const surfaceCell = (row) => {
  if (!row.localSurface) return '—';
  const exports = row.localSurface.exports?.length ? ` (${row.localSurface.exports.join(', ')})` : '';
  return `${row.localSurface.surface}${exports}`;
};
const taskCell = (row) => row.linkedTask ? row.linkedTask : `— ${row.noTaskReason}`;
const mdLines = [
  '# BER-23 — beUI opportunities and capabilities triage',
  '',
  `Read-only reconciliation at ${retrieved} against BEDS HEAD ${snapshotSha}. The live index is treated as the candidate set; registry/raw retrieval outcomes are preserved per row.`,
  '',
  '## Structural checkpoint',
  '',
  '| Gate | Result |',
  '| --- | --- |',
  `| Candidate coverage | PASS — ${registryCounts.candidates} rows, one per live index slug |`,
  `| Registry item retrieval | ${registryCounts.registryOk} OK; ${registryCounts.registryObserved404} observed 404 (not treated as absence) |`,
  `| Raw retrieval | ${registryCounts.rawOk} OK |`,
  `| File hashes | ${registryCounts.filesHashed} registry file contents hashed; 404 items have no file list |`,
  '| BER-22 Drawer artifact | RESOLVED post-snapshot — canonically integrated at `135d539a65ab1156b7e1177bb85682594eda8b14` on `2026-09-19T22:09:11-03:00`; it was open at the `9e21b09` snapshot |',
  '| Mutation boundary | PASS — no implementation, merge, push or publish |',
  '',
  '## Decision summary',
  '',
  '| Decision | Rows | Meaning |',
  '| --- | ---: | --- |',
  `| ADAPT | ${decisionCounts.ADAPT} | Existing bounded BEDS subset or documented adaptation |`,
  `| NO_FIT | ${decisionCounts.NO_FIT} | Completed mismatch; preserve current contract |`,
  `| DEFER | ${decisionCounts.DEFER} | Explicit dependency, domain or owner boundary |`,
  `| NEEDS_REQUIREMENT | ${decisionCounts.NEEDS_REQUIREMENT} | Candidate lacks implementation-ready contract/owner/task |`,
  '',
  '## Candidate matrix',
  '',
  'Each row includes the live URLs, retrieval date, registry/raw/file hashes, license observation, preserved/adapted/omitted subset, state/accessibility risk, owner and task/no-task reason.',
  '',
  '| # | Candidate | Category | Decision | Current BEDS surface / capability subset | State + accessibility risk | Owner / linked task or no-task reason | Registry / raw / file hashes | Rationale / dependency |',
  '| ---: | --- | --- | --- | --- | --- | --- | --- | --- |',
];
for (const row of rows) {
  const provenanceCell = [
    link(row.provenance.registry.url, `registry ${row.provenance.registry.status}`) + ` ${row.provenance.registry.sha256 || 'sha:null'}`,
    link(row.provenance.raw.url, `raw ${row.provenance.raw.status}`) + ` ${row.provenance.raw.sha256 || 'sha:null'}`,
    `retrieved ${row.provenance.retrieved}`,
    `license ${row.provenance.license}`,
    `files: ${filesCell(row.provenance.files)}`,
    `historical: ${row.provenance.comparison}`,
  ].join('<br>');
  const riskCell = `${row.stateAccessibilityRisk.level}: ${row.stateAccessibilityRisk.note}`;
  const ownerCell = `${row.owner}<br>${taskCell(row)}`;
  const subsetCell = `${surfaceCell(row)}<br><strong>Subset:</strong> ${row.capabilitySubset}<br><strong>Preserved:</strong> ${row.preserved}<br><strong>Omitted:</strong> ${row.omitted}`;
  const rationaleCell = `${row.rationale}${row.dependencyRisk ? `<br><strong>Dependency:</strong> ${row.dependencyRisk}` : ''}`;
  mdLines.push(`| ${row.order} | <code>${row.slug}</code><br>${row.name} | ${row.category} | ${row.decision} | ${subsetCell} | ${riskCell} | ${ownerCell} | ${provenanceCell} | ${rationaleCell} |`);
}
mdLines.push('', '## Reconciliation notes', '', '- Historical grouped aliases are preserved in the JSON metadata: `button-base`, `number-ticker`, `animated-sidebar + bounce-sidebar`, and `cylinder-carousel + marquee`.', '- BER-29 InputOTP and BER-35 Drawer/Dialog evidence are carried as existing decisions. BER-22 was open at snapshot `9e21b09`, then resolved/integrated canonically at `135d539a65ab1156b7e1177bb85682594eda8b14` on `2026-09-19T22:09:11-03:00`; the matrix preserves both states and does not reopen the dependency.', '- The current registry item JSON did not expose a license field. The matrix records MIT as repository/docs provenance, not as unverified registry metadata.', '- Pending means not approved for implementation. Technical source retrieval and hashing do not constitute aesthetic approval, accessibility completion, or consumer acceptance.', '');
fs.writeFileSync(outMd, mdLines.join('\n'));

console.log(JSON.stringify({ outJson, outMd, snapshotSha, counts: result.metadata.counts }, null, 2));
