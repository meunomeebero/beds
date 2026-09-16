# Payment confirmation

Use when: the host has already verified a successful payment and has receipt data.
Read next: [Foundations](FOUNDATIONS.md), [States](STATES.md),
[Interface quality](INTERFACE-QUALITY.md), [Governance](GOVERNANCE.md).

## Reference and scope

Owner-supplied [receipt-printer video](https://cdn.collectui.com/amplify_video/2087159798609432576/vid/avc1/3840x2160/DVlxpSnXyJpa4r_V-optimized.mp4),
September15. Browser-inspected start, paper emergence and completed receipt in
light/dark scenes. **A adaptation**, not extracted source CSS or exact timing.
Original React/CSS; no copied assets, new dependency or remote resource at runtime.

Adopted: compact printer housing, inset purchase display, paper emerging from a
slot, serrated edge. BEDS adaptation: theme-aware housing, Inter, existing brand
mark slot, white paper/black ink in both themes. No fake barcode, fiscal number,
timer-driven payment confirmation or automatic invoice issuance. Paper is a
document material, not a new general filled-card policy.

## Public contract

| Property | Owner / behavior |
|---|---|
| `title/description` | Host-localized confirmed-payment heading and optional support copy |
| `merchant/mark` | Visible merchant name; optional decorative public BEDS mark |
| `purchase` | Label and optional description, no plan/credit policy inferred |
| `receipt` | Title, keyed item rows, total label/value, optional keyed details/note |
| `PaymentReceiptRow` | `id/label/value`; strings already formatted by host; zero remains literal; no tax arithmetic |
| `invoice` omitted | No invoice assertion or invoice action |
| `invoice.state=available` | Host message + required action; opens an actual host-provided document in production |
| `invoice.state=pending` | Message only; no unavailable-document button or fake countdown |
| `invoice.state=error` | Host recovery message + required retry action; never retries the payment |
| Action | `label/onClick`; optional `busy/disabled`; native shared Button |
| `continueAction` | Optional independent next step; no automatic navigation |
| `animate` | Default true; false for restored receipts; OS reduced motion always wins |
| `headingLevel` | H2 default, H3 in an existing section |

Mount only after server/provider confirmation. Never use a timer or the paper's
animation completion as evidence of payment. Receipt and fiscal invoice are
distinct: the paper alone never proves that an invoice exists. Host owns
invoice requests, authorization, download/open behavior, busy state and errors.
Do not place interactive content in the decorative mark slot.

## State and motion contract

Entry → confirmed title/amount/actions available immediately → one paper reveal
→ stable receipt. No payment processing state in this component. Empty item or
detail arrays omit their groups; required total/title remain. All text wraps.

Invoice pending/error/available changes only footer content and stable polite
status. Same mounted component does not replay; host should retain component
identity and set `animate=false` on restored history. Remount intentionally
replays. Action focus and callbacks never wait for animation. Unmount requires
no timer/RAF cleanup; no React state or business callback depends on motion.

CSS transform only: 120ms delay +1600ms reveal using existing declared
`cubic-bezier(.16,1,.3,1)`, one iteration, no loop. These are A pacing choices,
not video measurements. Final height is reserved from first paint; surrounding
content and actions do not move. Static clipping window; static paper shadow.
Reduced motion or `animate=false` → complete paper immediately. Preference
change mid-animation also reveals final state. No stagger, spinner or sound.
No physical-device frame-rate/GPU guarantee; profiling remains separate.

## Playground

[Public-component composition](../../../apps/web/labs/espaco-library/PaymentConfirmationPage.tsx):
`?view=payment-confirmation&theme=light|dark`.
Optional fixtures: `invoice=pending|error`, `preview=long`, `motion=off`.
Catalog navigation → confirmation → Ver nota fiscal → illustrative dialog →
Escape → original action. Preview state buttons exercise recovery and replay.
All values synthetic; R$20 is not an approved offer. No real charge, fiscal
issuance, upload or downloaded document. Production integration remains separate.

## Better and motion review

Seven Better entrypoints, frontend-design, repo-adapted emil-design-eng and
review-animations applied. UI Skills motion category inspected; no new library
needed. Context7 unavailable; no external library/API added. Local React19 and
existing BEDS implementations/declarations used for API grounding.

| Domain | Review scope |
|---|---|
| Accessibility | Named section, heading, dl rows, decorative marks; immediate native actions; stable invoice status; reduced motion and focus return |
| Layout | Fixed maximum, fluid width, full-height reservation,320px and long fields; two-column receipt values with logical RTL alignment |
| Writing | Payment versus invoice distinction; recovery never requests a second charge; demo/offer/fiscal limitations explicit |
| Typography | Existing Inter roles,tabular amounts,full wrapping; no decorative monospace substitution |
| Colors | Existing tokens; white/black paper deliberately fixed; both themes and text contrast |
| UI polish | Concentric housing/inset,quiet slot depth,serrated paper; one purposeful motion rather than scattered effects |

| Executed check — September15 | Result |
|---|---|
| `npm run verify` | Passed: build,typecheck,library,docs,consumer,31 guard/routing tests,temporary packed consumer smoke;107 components,90 tokens,zero violations |
| `PLAYWRIGHT_BASE_URL=http://127.0.0.1:5296 npx playwright test --config apps/web/labs/espaco-library/playwright.config.ts payment-confirmation.spec.ts --reporter=line` |6 passed,3 tests × desktop/mobile: both themes,controlled animation frames,immediate action,keyboard/focus return,invoice pending/error/recovery,rapid replay,reduced motion,320px,long content,RTL,forced colors,200% CSS zoom stress |
| Contrast | Inspected component text roles ≥4.5:1 in both themes;paper black/white21:1 |
| Visual inspection | Desktop light/dark,mid-print frame,mobile dark and320px long-copy captures;natural browser render inspected |

Evidence: [desktop light](../../../apps/web/labs/espaco-library/evidence/payment-confirmation/desktop-light.png),
[desktop printing](../../../apps/web/labs/espaco-library/evidence/payment-confirmation/desktop-dark-printing.png),
[mobile dark](../../../apps/web/labs/espaco-library/evidence/payment-confirmation/mobile-dark.png),
[narrow long copy](../../../apps/web/labs/espaco-library/evidence/payment-confirmation/mobile-dark-320.png).

No actionable blockers found in these inspected states. First mobile assertion
compared viewport coordinates before/after native focus scrolling; corrected to
component-relative action position. No layout/animation check removed.

Implementation/static/artifact/focused browser checks complete. Acceptance
**PENDING** independent comparison and owner aesthetic decision. Native assistive
technology,Safari/Firefox,physical devices,actual browser zoom and performance
profiling unverified. CSS zoom is a stress proxy. No release,push,production
integration or consumer upgrade;current source extends the existing local
candidate rather than claiming a new published version.
