# Motion opportunities — September15

Scope: BEDS shared source and catalog. Read-only motion advisory; no new effects
or animation dependency implemented by this review. Skills: repository-adapted
`emil-design-eng` and `find-animation-opportunities`; Better motion guidance.
Existing Foundations150/250/400ms and ease-out inform these proposals, not a
second consumer token system. Frequency estimates below are hypotheses.

## Shortlist

| Priority / source | Four gates: frequency; purpose; speed; function | Exact proposed recipe | Reduced motion / guard |
|---|---|---|---|
| 1 — Drawer, `overlays.css:110`, `overlays.tsx:273` | Several opens/session; preserve relationship to selected job;250ms maximum;details visible and focus usable immediately | Enter opacity0→1 plus translateX16→0px over250ms,`cubic-bezier(.16,1,.3,1)`;exit opacity1→0 plus translateX0→8px over150ms,same curve;reverse displacement in RTL | Opacity100ms only;no transform. Keep native modal/inert/Escape/nested focus return. Presence implementation must support rapid open/close/reopen without stale timers or blocking input. Do not animate a full viewport's travel. |
| 2 — Settings switch, `controls.css:46` | Occasional preference edit; show state travel;150ms;checked/ARIA value changes synchronously | Replace layout snap with thumb translateX0→14px,150ms,`cubic-bezier(.16,1,.3,1)`;same duration reverse;RTL uses−14px;track background150ms | Instant state/position. Preserve32×18.4 track,16px thumb,contrast and focus. Interrupt from current position,not animation restart. |
| 3 — Occasional confirmation Dialog, `overlays.css:39`, `overlays.tsx:263` | Low frequency; distinguish a new decision layer;150ms;safe initial focus without waiting | Enter opacity0→1 and scale.98→1 over150ms,`cubic-bezier(.16,1,.3,1)`;exit opacity1→0 over120ms,ease-out;backdrop opacity150ms | Opacity100ms only. Scope to standard/welcome Dialog,never Command/SearchDialog despite shared CSS rule. Keep native modality and cancel synchronous;no delayed business callbacks. |
| 4 — Document drop target, `form-fields.css:62` | Rare attachment; reinforce accepted drag target;150ms;drop remains immediately usable | On eligible drag enter only: front sheet translate(19px,−5px) rotate10deg→translate(19px,−8px) rotate7deg;150ms,`cubic-bezier(.16,1,.3,1)`;same return | Static current artwork;retain textual target and dashed border. Do not imply upload completion from hover/drop. No new infinite idle animation. |

## Deliberately rejected

| Candidate | Reason to remain unchanged |
|---|---|
| Command/search typing and keyboard results | High frequency;transition would delay the core task. Immediate results/selection. |
| Sidebar navigation and tab content | Frequent actions;existing quiet state colors suffice. No stagger,slide or loading flourish. |
| ATS/FIT numerical bars | Readable factual state is primary. No ornamental counting or delayed score disclosure;existing protected product loaders unchanged. |
| Landing benefits/footer reveal sequence | Static hierarchy already communicates the benefit;no demonstrated functional gain from scroll choreography. |
| Empty-folder flies/payment confirmation | Already have deliberate motion contracts. Do not stack extra effects;review existing behavior separately when changed. |

## Verdict / handoff

Four candidates justify a small prototype;none requires adopting a motion
library now. Prefer shared CSS/native behavior for these bounded transitions.
Implement one at a time only after approval; inspect interruptions,entry/exit,
light/dark,mobile,RTL,reduced motion,focus and frame-time evidence. Exit presence
is the highest-risk part: never retain invisible interactive layers. Use
`improve-animations` for an implementation plan and the repository's
`review-animations` after a motion diff. This shortlist is not performance
evidence, aesthetic approval or an audit of every existing animation.
