# ApplicationCard — personal opportunity tracking

Current scope: app-owned recipe in
`apps/web/labs/espaco-library/recipes/application-card.tsx`, not a `beds` export.
Its company/salary/resume and ATS/FIT model is specific to opportunity tracking.
The recipe composes public controls and `MeterSegments`; generic `ResultsStatus`
and `CollectionToolbar` remain in core `collection-controls.tsx`.
Caller owns dates, scoring semantics, lifecycle, documents, requests and persistence.
Catalog: `?view=application-card`. Earlier consumer URLs and validation below are
historical, not evidence of a current consumer migration or post-extraction pass.

Additive `purpose="kanban"` and controlled `ApplicationBoard`:
[Kanban contract](KANBAN.md). Default card layout unchanged;compact purpose
shares all properties and score rendering;no duplicate card/ATS implementation.

## Anatomy and traceability

Reference inspected: Curriculol `apps/web/src/components/dashboard/KanbanBoard.tsx`
(`ApplicationCard`, `ManualScoreState`, status/next-action handling), `types.ts`,
`kanban-v4.css`; search metadata from `JobSearchMatchCard.tsx`.
Source properties are D (source-derived). New BEDS translation is A (explicit
adaptation for review), not a measured Marketer value or human visual approval.

| Original property | Portable presentation / consumer owner |
|---|---|
| Company/avatar/initial | `company/companyImage`; lazy image; broken image → initials |
| Card/job title | `title`; full wrapping heading; native details button |
| Stacked company/CV sheets | Decorative folio only when `documents` exist; no false ready document |
| Personal note speech bubble | `note.text/onOpen`; two visual lines, full accessible label + complete dialog |
| Status, status mover | `status`; optional controlled `statusOptions/onStatusChange`; caller restricts transitions |
| FIT saved with vacancy | `score.kind=fit`; never relabelled ATS |
| Optimization match | `score.kind=match`; caller-supplied number/explanation |
| Kit ATS before/after/delta | `score.kind=ats`, `before/value`; points, not probability; finite0–100 only |
| ATS pending / missing | `processing/unavailable`; named text, no fake zero or result |
| Segmented score | Shared28 vertical segments, floor not upward rounding; numeric meter retains actual integer score |
| Keywords | All supplied values; wrapping; application decides relevant content |
| Saved/publication date; age | `date.label/dateTime`, `age`; explicit provenance; never infer publication from save date |
| Location; salary; source | Optional strings; missing values omitted, never fabricated |
| User color tag | `tag` labelled bookmark; original arbitrary six-color palette NOT imported; consumer maps personal tagging to approved neutral label |
| CV / letter | `documents` named callbacks; caller passes only available artifacts |
| Retry / ready-to-send action | `primaryAction`; busy/disabled; local state does not prove network success |
| Selection / vacancy URL | Native checkbox; `jobHref` permits HTTP(S), independent anchor, new-tab context |
| Description; send timestamps; delivery; underlying IDs | Caller details data; IDs/queue linkage not visual props; no inferred send/delivery/refund |

## Geometry — A, within existing roles

| Concern | Contract |
|---|---|
| Container | Transparent; `--es-radius-card`24px; token border;24px inset,20px narrow |
| Type | Inter; title16/24 medium; body13/20; meta12/18; no legacy terminal font |
| Static status | Badge purpose=status;12/18px regular secondary text; transparent, no border/shadow;6px semantic dot +6px gap; label wraps fully. A refinement requested September15; generic tag badges unchanged |
| Rhythm | Existing tokens4/8/12/16/20/24; bottom actions naturally aligned; no fixed height |
| Folio |44×48px papers;64×56px footprint;10px paper radius; −6°/9° resting rotations |
| Note | Subtle surface only inside note;10px radius;8×12px padding; pointer derivative |
| Meter |Shared28 vertical segments;16px height;2px gap/radius;brand fill is supplementary, essential value neutral text;ATS/FIT/match share anatomy,not meaning |
| Motion |150ms ease-out paper fan on deliberate hover/focus; reduce preference freezes resting pose; no entrance animation |
| Touch | Existing compact32px controls;28px document targets; no new blanket density override; physical-device validation separate |

## States and QA

Native checkbox and button/link separation; no clickable article/nested buttons.
Status is text, not color alone. Tooltip via existing HelpLabel supports focus,
hover and touch. Ready action marks an existing application as sent; never claims
to send an email. Unavailable/processing scores contain no numeric meter.

Static status never enters the tab order or advertises a click. The optional
status mover remains a real Select, with its existing shape/keyboard behavior;
the calmer static label must not conceal that interactive distinction. Test all
five badge tones, long labels, both themes,320px and200% zoom. Dot is decorative;
text alone carries the complete state. No live region for every resting card.

ResultsStatus is a stable, polite result-count/update region. Caller changes copy
after meaningful filtering or local actions; never assertive for routine updates.

CollectionToolbar owns the search/filter split: flexible search desktop; full
search row below768px; filters wrap beneath. Existing16px gap, no consumer CSS.
The application can name the details trigger through `detailsLabel`; synthetic
vacancies open a local description, not an invented external vacancy URL.

Consumer preview preserves saved notes/status while navigating between screens,
not after page refresh. Search/filter/selection are local UI state. Empty/error/
loading examples via `applications-state=empty|error|loading`. Explicit button
settles loading fixture. No timers pretending to complete a real queue.

Scope excludes production integration, backend queue changes, release and push.
Older dirty BEDS component additions are preserved, not represented as work done
by this change. Browser evidence and residual risks belong to the dated consumer
review, not inherited from earlier package checks.

## September15 — vertical score bars

Owner reference:`codex-clipboard-d7d9f62e-fc19-4fb5-a6af-682ef2dc3604.png`,
upper-left segmented usage bars. **A adaptation**:the existing BEDS28-segment,
16px-high meter anatomy replaces ApplicationCard's separate10×5px implementation.
Same2px gap/radius,brand fill/subtle remainder;numeric score remains foreground.
No purple/yellow palette imported. User-requested visual relationship to logo;
not a measured CSS extraction. [Foundations](FOUNDATIONS.md) owns geometry.

Internal MeterSegments unifies markup/styles;not an extra public component.
Application scores keep floor(value) display and floor(value/100×28) fill.
0→0 segments,99→27,100→28;1 remains numerically visible even without a full
segment. Generic SegmentedMeter retains nearest-segment quantization and its
max/clamping/unavailable contracts. Quantized fill is illustrative;number is
authoritative. aria-valuenow uses clamped input directly,avoiding floating-point
round-trip artifacts;score aria-valuetext says points,not hiring probability.
No new animation,loading changes,thresholds or score calculation.

Public props unchanged;all BEDS ApplicationCard ATS/FIT/match consumers inherit
the anatomy when explicitly upgraded. No consumer CSS or legacy-page migration.
Preview5292 remains pinned to local.11;this candidate is local.18 in the BEDS
catalog5296. No implicit package replacement,release,push or production change.

Context7 tools unavailable;official semantics fallback:
[MDN meter role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/meter_role).
Meters describe bounded scores;ProgressBar still describes ongoing work.

### Review checkpoint

Seven Better skills +frontend-design/ui-skills-root applied.
Scope:ApplicationCard score states and shared SegmentedMeter presentation,
both themes and responsive catalog;not the entire application or package.

| Domain | Review |
|---|---|
| Accessibility |Named meter,exact numeric value,points text;unknown/pending have no numeric score;focusable explanation retained;forced colors distinguish filled/unfilled |
| Layout |Card and meter at320/390/938/1440px;28 flexible columns,no fixed width;200% CSS zoom/RTL checked |
| Writing |ATS/FIT/compatibility distinctions,explanations,delta and recovery retained;no invented score meaning |
| Typography |Existing neutral tabular score and secondary metadata unchanged;full labels accessible through HelpLabel |
| Color |Brand/subtle bars supplement the exact neutral numeric score;computed pairs recorded below;no claim that brand bars alone meet3:1 in both themes |
| UI |Shared vertical rhythm,r2,2px gap,16px height;no duplicate card-local bar CSS or new effect |

Final verification/evidence:pending current run. Independent review and owner
aesthetic approval remain pending. VoiceOver,physical devices,Safari/Firefox,
APCA,actual browser zoom and real scoring services not verified.
