# Drawer — contextual details

Scope: `Drawer` + `DrawerSection`; catalog `?view=drawer`. Synthetic vacancy
details only. No product integration, router, API, storage or external action.

## API

```tsx
import { Button, Drawer, DrawerSection, Text } from 'beds';

<Drawer open={open} onOpenChange={setOpen} title={job.title}
  description={job.company}
  actions={<Button label="Salvar vaga" onClick={saveJob} />}>
  <DrawerSection title="Sobre a oportunidade">
    <Text variant="body">{job.description}</Text>
  </DrawerSection>
</Drawer>
```

Required: `open/onOpenChange/title/children`. Optional: `description`,
`headerActions`, `actions`, localized `closeLabel/contentLabel`.
`DrawerSection title/children`: named H3 section inside H2 drawer, no card fill.
No geometry, portal, motion, resize or CSS props. Keep drawer outside repeated
carousel children. Caller owns selected item, stale requests, recovery and
persistence. Editors must protect unsaved changes in `onOpenChange(false)`;
the shell never discards a draft. Do not bypass controlled state with native
`method="dialog"` forms. Default use: read-only details.

## Anatomy / provenance

September15 supplied drawer raster informs edge-attached panel, compact
heading/actions and independent content scroll. **A adaptation**, not extracted
source CSS. Source chat, artwork and alternate window modes not copied.

| Part | Fixed adaptation |
|---|---|
| Panel | Inline end:right LTR,left RTL;full viewport height;672px existing command maximum;100% through767px;percentage bounds preserve zoom containment |
| Surface | Opaque semantic popup;1px leading structural border;square viewport corners;existing dialog shadow/scrim |
| Header |16px block/24px inline;H2 Inter16/24px500;context13/19.5px400;close40px;optional secondary action row8px gap |
| Body |24px;native overflow;section32px separation/8px heading-content gap;H3 Inter13/19.5px500 |
| Footer |16px block/24px inline;8px wrapping action gap;40px controls |
| Narrow |16px inline safe-area inset;44px controls;full width |
| Growth |Header max40%,footer max35%;each can scroll;sticky close;body consumes remainder |
| Motion |Immediate repeated inspection;no new animation;shared control/reduced-motion behavior unchanged |

Transparent-card rule does not remove opaque overlay surfaces. Existing
Dialog,SearchDialog,CommandPalette unchanged. No bottom-sheet,drag gesture,
full-page,pop-up,minimize modes. Geometry owner: [Foundations](FOUNDATIONS.md).

## Flow / accessibility

Real card `Ver detalhes` → native modal → close control focus.
Tab/Shift+Tab contained;overflowing body joins Tab for native keyboard scroll.
Body starts at top on reopening;updates retain reading position.
Escape/close/backdrop click → controlled callback → connected trigger focus.
Background inert/scroll locked;nested Dialog dismisses only the top layer.
Drag beginning inside never counts as outside click. When recovery removes
the focused control,close regains focus. Keep a stable trigger;removed trigger
has no guaranteed fallback destination,so caller must assign one.

Demo: ready,long,loading,error+retry,unavailable+return. Save/remove changes
in-memory state/card/live feedback only;refresh resets. No requests or credits.

Context7 unavailable;no dependency added. Platform fallback:
[MDN native dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog).
Existing BEDS native modal helpers reused.

## Review checkpoint

Candidate `0.1.7-rc.16-local.13`;local only. No commit,push,publication or
consumer installation. Skills read:better-interface + accessibility,layout,
writing,typography,colors,ui;frontend-design;ui-skills-root. Relevant references:
focus/keyboard,surfaces,grouping,contrast,consolidated review format.

| Domain | Evidence | Result |
|---|---|---|
| Accessibility |Native modal and AX names/H2→H3;Tab loop,top-layer Escape,backdrop vs drag,scroll lock/re-entry/recovery |Chromium inspected;no remaining actionable finding in this flow |
| Layout |Both themes320/390/938/1440px;long title/body;RTL+CSS zoom200%;independent scroll;close/footer visible |Render and bounds inspected;no horizontal overflow |
| Writing |Synthetic provenance,action verbs,error recovery,no false application claim |Source inspected |
| Typography |Inter roles,H2→H3,body14/21px at narrow measure,complete labels |Desktop/mobile renders inspected;no clipping found |
| Colors |Computed foreground/background from rendered popup;both themes |Ratios below;no new palette or color-only meaning |
| UI |Edge panel,quiet structural separators,shared controls;44px narrow targets;no added animation |Render and interaction inspected |

Fixed during review: retry removed focused control → drawer close fallback;
desktop close specificity prevented narrow44px → scoped mobile specificity.
Both now have regression assertions. No remaining actionable finding in the
inspected flow;not a whole-library conformance claim.

| Rendered contrast | Light | Dark |
|---|---|---|
| Body | `#37352e/#ffffff`12.27:1 | `#cecece/#202020`10.35:1 |
| Heading |12.27:1 | `#d4d4d4/#202020`10.99:1 |
| Secondary | `#6a6966/#ffffff`5.49:1 | `#949494/#202020`5.37:1 |
| Primary action | `#ffffff/#202020`16.29:1 | `#242424/#f1f1f1`13.74:1 |
| Keyboard focus | `#0077e6/#ffffff`4.39:1 | `#b9b9b9/#202020`8.30:1 |

Checks: `npm run verify` (type/build,89 components/90 tokens,docs/consumer
guards,31 guard/routing tests,packed import/parity); explicit
`node packages/beds/scripts/check-consumer.mjs apps/web/labs/espaco-library/DrawerPage.tsx`.
Browser: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:5296 npm run test:browser -- drawer.spec.ts --reporter=line`;
6 passed;both projects. Final combined run with `drawer.spec.ts search-dialog.spec.ts`
passed12 tests (including the existing search flow);no browser runtime errors
in the responsive checks. Screenshots:
[dark desktop](../../../apps/web/labs/espaco-library/evidence/drawer/desktop-dark-1440.png),
[light mobile](../../../apps/web/labs/espaco-library/evidence/drawer/mobile-light-390.png),
[zoom/RTL](../../../apps/web/labs/espaco-library/evidence/drawer/desktop-zoom-rtl.png).

Not verified:VoiceOver,physical devices,Firefox/Safari,APCA,real browser zoom
(CSS zoom is a proxy),real product integration. Engineering checks passed;
overall acceptance **PENDING** independent review and owner aesthetic approval.
