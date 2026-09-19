# Processing — analysis and resume optimization

Scope: local BEDS candidate,2026-09-16. Published RC16 unchanged.
User request: port current Curriculol processing screens into the redesign
playground,using shared components,Better and Emil. No production migration,
provider call,upload,email,billing or release.

## Source and timing conflict

Read-only Curriculol checkout at `3b9117f7`;source paths:
`apps/web/src/sections/{LoadingScreen,GenerationLoading,ProcessingScreen}.tsx`,
`apps/web/src/components/{MasterProgressBar,LoadingVideoPanel}.tsx`,
`apps/web/src/data/processing-configs.ts`.

| Current source | Playground |
|---|---|
| ATS90s / optimization75s decorative timeline | Retained;five starts every18s/15s |
| Phase fill after200ms,up to10s;check at10.5s | Retained;labels visible immediately to reserve space |
| ATS captions0/10/22/36/52/68/82s;optimization0/10/22/36/50/62/72s | Retained;complete text available in disclosure |
| Logs across first80% | Disclosed illustrative activity,not live service logs |
| Four score bars at67%,500ms stagger,2.5s fill | Retained samples,explicitly fictitious;not result predictions |
| Master capped95% until real done | Capped95%;explicit simulated confirmation required |
| Actual completion interrupts choreography | Explicit demo completion allowed;never timer-generated success |
| Final frame holds | Retained;no restarting from zero while waiting |
| Named specialists | Analysis:Anya/Vanellope active,Arya optional/inactive;optimization retains source narrative. Unsupported competitor/ATS claims omitted |
| Victory on decorative score completion | Small completion mark only after host success |
| ASCII bars/terminal font | BEDS28-segment meter,Inter,shared neutrals and brand;no mixed legacy CSS |

**Unresolved historical drift:** product AGENTS/Emil mention11s/9s;older
PRODUCT-EXPERIENCE lists30s/25s;current configs use90s/75s. Current wrappers
enforce no11s/9s minimum. This preview preserves current configured choreography,
does not shorten it or rewrite production policy. Owner timing decision pending
before integration. No active loading slot machine exists in current runtime;
old loading selectors remain in unused CSS. Results-page slot machines are a
separate flow,not modified.

Game/Space Invaders,sound/confetti,free-CV/upload/LinkedIn configurations and
production result integrations are not ported into this portable component. The
[result preview](RESULTS.md) now follows the explicit completion CTA. Product's close
and email contract is explained on entry;preview sends nothing and discards
only local state on exit. Current source's “video” is already a caption
presentation,not actual media.

## Public API

`ProcessingView`, `ProcessingViewProps`, `ProcessingStep`, `ProcessingStory`.
Import from `beds`;styles through `beds/styles.css`.

| Input | Ownership |
|---|---|
| `title/description/context/mark` | Host-localized H1,explanation,identity |
| `state/statusLabel/progress/progressLabel/progressDescription` | Host signals;running/waiting/error capped95%,success100%;null/nonfinite indeterminate |
| `stepsLabel/steps` | Ordered IDs,label,detail,pending/active/complete,statusLabel,0–100 progress |
| `story` | Controlled title,caption,speaker,time labels,chapters/current flags,transcript label |
| `message/announcement` | Visible recovery plus sparse status changes;error assertive,others polite;not ticks |
| `detailsLabel/logs/scores` | Disclosed activity/optional metrics;host owns provenance and availability |
| `motion` | Controlled pause state/labels/explanation/callback;freeze narrative,not real processing |
| `actions` | Native host callbacks,optional primary;no automatic route or side effect |

No internal request,business timer,scoring,pricing or persistence. Host must
reset/remount for new jobs,keep estimates monotonic,stop on terminal signals
and decide retry. Success never inferred from time. Internal MeterSegments
adds progressbar semantics;default meter consumers unchanged. Unknown progress
omits numeric ARIA value rather than pretending0%.

## Flow and accessibility

Catalog → entry → explicit start → running → confirmation/error/wait → result
page or retry → exit → clean re-entry. Manual-review fixture omits retry.
No automatic navigation;result opens on explicit action,preserving the theme.
Main receives focus on entry/exit;theme keeps playhead.
Native ordered phases/progress,disclosures,buttons. Decorative document hidden
from AX. Stable polite/alert regions;no per-frame spoken percentages.
Pause keeps playhead and freezes illustrative phases,caption and score count-up;
master estimate continues. Hidden-tab presentation pauses;unmount clears timer
and observer. Finished clocks clear their interval;unchanged ticks reuse state.
Offscreen scan pauses. Reduced motion:static scan/completion,
no automatic caption rotation;essential progress and full transcript retained.
Mobile retains narrative,not hidden content. Copy grows without clipping.

## Fixed adaptation

A local redesign,not source-pixel measurement. Existing BEDS palette,Inter,
Lucide/orange.1040px max;32px block inset;48px header/workspace rhythm;
desktop1.35:1 columns/gap48;760px container stacks/gap32. H1 28/36px500,−.6px;
24/32px below380px. Body14/22;phase14/21px500,detail13/20,status12/18.
Five28px/r8 numbered/check tiles,12px copy gap,24px rows;native3px tracks.
Story r24,p24/p16 narrow;196px art;two130×168px/r14 sheets,semantic surfaces,
4°/−9° rotation. Scan3200ms alternate,cubic(.45,0,.55,1);confirmed mark400ms,
existing cubic(.16,1,.3,1). No new dependency/tokens. Story18/25px500;
152px minimum copy reserve,grows freely;none narrow. Controls44px,p10/14;
time12/18 tabular. Transcript12/19,headings13/20. No repeated dividers.

## F4 beUI adaptation — 2026-09-19

`ProcessingView` uses the free MIT `todo-list` source as a local reference for
its status-mark swap and staged-fill intent. Source: [raw
source](https://beui.dev/r/todo-list/raw), [registry
item](https://beui.dev/r/todo-list.json), [repository](https://github.com/starc007/ui-components).
Raw SHA-256
`ee3b0baabf79fb941f0affbc21e9043c93cd02e59f71ed3f37d55702912cd210`; registry
JSON SHA-256
`f247b5cc7c399e851ddf91660ddfa462c7edcf59ecbac01b6a7139d13e86758`.

The adaptation keeps host ownership and the existing `ProcessingView` API.
Steps retain their 28px geometry; completion marks swap with reduced-motion
guards. ATS score labels and true numeric values remain static from first
render, while only the internal segmented fill uses the reveal motion. The
90s/75s cadence, 95% hold until explicit confirmation, pause/offscreen and
reduced-motion behavior remain unchanged. No auto-success, request, scoring or
navigation is introduced. The other candidate slugs (`loading-states`,
`agent-activity`, `tool-result`, `file-diff`) are deferred because their public
state models do not match this surface.

## Quality and evidence

Read/applied:all seven `better-*` entrypoints;project-adapted `emil-design-eng`
and `review-animations`;`frontend-design`. Motion index inspected through
`ui-skills`;no install. Marc Lou excluded:product processing,not landing.
Context7 unavailable;no new external dependency/API introduced.

| Domain | Applied scope |
|---|---|
| Accessibility | Native semantics,44px component controls,live-region rate,pause,reduced motion,keyboard/recovery |
| Layout | Stable ordered phases,narrative rail,narrow stack,disclosed logs |
| Writing | PT-BR,sentence case,agent identities,explicit mock data,recovery before upsell |
| Typography | Fixed Inter,full wrapping,tabular time/progress,heading hierarchy |
| Color | Existing roles;numeric/state text supplements orange and glyphs |
| UI | Shared meters/buttons/document/dialog/brand,concentric radii,one purposeful scan |
| Emil | Original phase/caption cadence,interruptible pause/exit,confirmed-success cue,static reduced mode |

Focused Chromium processing suite passed12/12 desktop/mobile cases. Covered
catalog/start,90s/75s cadence,95% cap,pause,resume,explicit completion,result
navigation/focus,re-entry,wait,error,retry and manual-review recovery. Light/dark,
1440/768/390/320px,long content,CSS200% zoom proxy,forced colors,reduced motion,
sampled functional text contrast≥4.5:1 and44px component controls.36 captures.
No observed console errors or external/mutating requests in these cases.

F4 focused suite `processing-beui.spec.ts` passed12/12 on the same single
preview port across desktop/mobile and light/dark. It verifies final ATS text
and ARIA values remain stable while the segmented fill is present, paused fill
stays within 0.01 percentage points, resume completes the reveal, and reduced
motion has no meter animations. Lab typecheck, library typecheck, library
contract check and docs check passed. This is technical evidence,not aesthetic
approval; physical AT,non-Chromium and owner acceptance remain pending.

Independent code/selected-render review:PASS_WITH_NOTES. One LOW idle-timer
finding fixed and independently rechecked;no remaining code finding. This is
not owner aesthetic acceptance. Initial mobile timing failure during concurrent
editing passed isolated and stable full reruns;no assertion weakened.
[Validation](VALIDATION.md) owns final processing/shared-meter and package gates.

[Dark desktop](../../../apps/web/labs/espaco-library/evidence/processing/analysis-dark-1440-long-reduced.png),
[light320px](../../../apps/web/labs/espaco-library/evidence/processing/optimization-light-320-long-reduced.png),
[error](../../../apps/web/labs/espaco-library/evidence/processing/desktop-analysis-error.png),
[success](../../../apps/web/labs/espaco-library/evidence/processing/mobile-optimization-success.png).
[Page](../../../apps/web/labs/espaco-library/ProcessingPage.tsx) and
[fixtures](../../../apps/web/labs/espaco-library/processing-fixtures.ts).
Owner aesthetic acceptance and timing-policy reconciliation pending.
Physical devices,screen-reader speech,Safari/Firefox,actual browser zoom and
performance profiling are not inferred from Chromium/DOM evidence.
