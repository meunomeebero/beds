# Checkout — focused purchase and recovery

September16 local playground candidate. `?view=checkout&theme=light|dark`.
No provider,account request,charge,credit mutation,fiscal issuance,production
migration or release. Published RC16 unchanged. [Foundations](FOUNDATIONS.md),
[Consumer contract](CONSUMER-CONTRACT.md) and [Governance](GOVERNANCE.md) own
visuals,composition and acceptance.

## Product parity — read-only snapshot

Curriculol `3b9117f7`,branch `fix/landing-pricing-section-rhythm`. Paths below
belong to the product repository,not the portable package.

| Concern | Source / decision |
|---|---|
| Entry and return | `apps/web/src/routes/_auth/checkout.$tier.tsx`;authenticated,integer1–100;success returns dashboard,not an analysis |
| Exact price | `packages/shared/src/index.ts`;total-price interpolation,HALF-UP cents |
| Commercial choices | `apps/web/src/components/pricing/PackagesGrid.tsx`;1/10/50 or custom1–100;no most-popular tier |
| Fields and state | `apps/web/src/sections/CheckoutScreen.tsx`;Pix default,CPF only for Pix,hosted card |
| Auth and status | `apps/api/src/features/payments/payments.route.ts`;create and status require auth |

Price anchors:1=R$5,90;10=R$27,90;50=R$55,90;100=R$79,90.
Interpolate **total**,not unit price,between adjacent anchors. Purchase once;
no subscription;credits do not expire. Application kit=one credit;LinkedIn
optimization=one credit. Resume/LinkedIn analyses remain free. No new pricing
policy,discount,guaranteed ATS score,interview or hiring claim.

Runtime source wins over stale slice documentation:current presets are not a
slider,maximum is100 rather than50,and status is authenticated. Product docs
were not edited in this isolated design task.

`invoiceUrl` in the payment slice is a hosted billing page,not a fiscal invoice.
Do not promise NFS-e,invoice issuance or downloadable fiscal documents. Merchant
reference:BEROLAB LTDA,CNPJ61.026.871/0001-79. Preview receipt is explicitly
illustrative and has no fiscal validity.

## Revenue-Centric decision

Required lens:`revenue-centric-design` by Richard/@richardrx. Supporting
`form-cro` for field friction/recovery;Better owns all six visual domains;
repo-adapted Emil/review-animations own interaction and motion checks. Marc's
landing lens is not automatically applied to checkout.

| Principle | Application |
|---|---|
| Value precedes payment | Entry follows a result;summary explains what credits enable without hiding free/owned work |
| Reduce uncertainty | Quantity,exact final amount,method and one-time terms;priced explicit submission |
| Minimize effort | No name,email,address or native card-number form;CPF only on Pix path |
| Preserve autonomy | No bundle silently upsized,no countdown,no fabricated social proof;back/help/recovery remain available |
| Recover before selling | Keep purchase details through status failure;check for a debit before attempting another payment |

Hypothesis only:clear cost and outcome,with fewer fields,reduce avoidable
checkout friction. No measured conversion uplift or analytics integration.
Later measurement:explicit checkout starts → provider-confirmed purchase →
usable paid artifact. Guardrails:duplicate charges,recovery completion,
support burden,refunds,and access to already-paid output. No experiment deployed.

## Public components

| Export | Contract |
|---|---|
| `CheckoutLayout` | One named main;native return;optional brand/utilities;summary before fields in DOM;optional footer;main ref for transition focus |
| `OrderSummary` | Host-formatted keyed item rows,total,terms,optional benefits/note;polite atomic total updates;no arithmetic or payment state |
| `CheckoutSection` | Named H2 section,optional description,public-component content |

Exported TypeScript declarations own exact APIs. No CSS,className,arbitrary
style or token escape. Reuse RadioGroup,SettingsForm,TextField,Button,Notice,
CodeSnippet,Dialog and [PaymentConfirmation](PAYMENT-CONFIRMATION.md).
Do not use the confirmed receipt as an unconfirmed order summary.

## State contract and mock boundary

Entry → quantity/method → validation → explicit submit → awaiting confirmation
→ known confirmation or recoverable failure → deliberate return.

- Route/query/time alone never establishes payment. No automatic submission.
- Only synthetic CPF in the preview;no PII persistence,logging or transmission.
- Card data belongs on the real provider's hosted page,not a Curriculol form.
  This preview does not open that provider or collect a real card.
- Pix preview code is clearly non-payable;no fabricated bank QR or billing URL.
  Copy success only after the clipboard operation succeeds;failure retains the
  visible selectable text and offers manual recovery.
- Real confirmation requires verified server status. Local confirmation needs
  an explicit simulation action,visibly separated from the purchase interface.
- Slow confirmation is not expiry. Product's15-minute hint is guidance only.
- Status failure preserves the pending order. Closed/expired payment removes
  its code/link;warn against duplicate payment before retry.
- No invoice action without an actual invoice. A receipt animation never
  creates a payment,credit,document or next-state event.
- Optional context return is an **A UX proposal**;product currently returns
  dashboard. The preview cannot restore real entitlements or fulfill an order.

Mock order:sessionStorage version1;quantity,method,state,order ID and timestamp
only. Return-context scope,matching quantity,24h lifetime;malformed/future
records ignored. CPF stays in memory. Storage denial has feedback. Reload
does not create another order or convert pending to paid. Production pending
storage/auth/polling requires separate integration review.

Queries:`quantity`=integer1–100;`return`=analysis/optimization,otherwise catalog;
`preview=create-error` arms one recoverable creation failure. Invalid quantity
shows no exact total (`—`) and blocks submission. `paid`/`status` flags ignored.
The350ms timer simulates creation only;confirmation requires the explicit
demonstration control. No provider request,background status poll or QR.

Catalog entry opens this checkout. Existing result-page miniature purchase
dialog remains unchanged;connecting its CTA,order IDs and fulfillment to the
full checkout is separate work. Context return does not grant result credits.

## Visual adaptation and motion

**A adaptation**,not a new extracted reference. Existing BEDS/Curriculol mark,
Inter,two fixed themes and semantic neutral/action colors. Width1040px;desktop
form/summary1.4:1,48px gap;stack below768px,summary precedes fields. Page
padding24/32 desktop,16 mobile. H1 28/36→24/32;section16/24;total36/44 with
tabular numerals;summary radius24,padding24→20. No sticky viewport obstruction.
Fields16/22,min44px;radio rows48px;buttons/links/theme controls min44px.
Unbounded text wraps,including long quantities,terms and recovery. Currency
prefix stays with its value;per-credit average is explicitly approximate.
Mobile code/copy stack;copy and dialog close retain44px targets. Stage changes
focus the main heading region and scroll instantly with24px margin;no animated
focus travel. Header brand and theme controls stay on one row at320px.

Motion:150ms ease-out background/border feedback on selection only when reduced
motion is not requested. No price roll,entrance stagger,auto-scroll sequence,
spinner-as-payment-proof or animation-dependent action. Confirmed receipt reuses
its separately documented paper motion;no new animation dependency.
Context7 unavailable in this task;no external API/library added. Existing
React19/BEDS source and declarations used as implementation authority.

## Evidence and acceptance

[Host composition](../../../apps/web/labs/espaco-library/CheckoutPage.tsx),
[synthetic fixture](../../../apps/web/labs/espaco-library/checkout-fixtures.ts),
[focused browser checks](../../../apps/web/labs/espaco-library/checkout.spec.ts).

| Better domain | Scoped review / correction |
|---|---|
| Accessibility | Native form/radios;conditional required field;invalid focus;modal trap/Escape;main focus after replacement;44px controls;forced colors/reduced motion |
| Layout | Summary first on mobile;single primary purchase action;separate demo controls;no horizontal page overflow320–1440px |
| Writing | Explicit amount,one-time terms,non-payable Pix,no fiscal claim;recovery before retry;no artificial urgency |
| Typography | Inter;16px fields;tabular totals;nonbreaking currency;long-copy wrapping;200% CSS zoom proxy |
| Color | Existing semantic tokens;light/dark sampled text contrast≥4.5:1;selection not communicated by color alone |
| UI | Shared primitives;consistent radii;48px payment choices;copy/close targets fixed;320px header wrapping corrected |

Emil/motion review:150ms selection feedback only;reduced-motion override;
existing confirmed-paper animation never establishes payment. Restored
confirmation uses `animate=false`;no repeated celebration on reload. No price
roll or loading-duration rewrite. Main focus recovery does not depend on motion.

16 browser cases passed,0 skips,20.7s:quantity/prices,field validation,creation
retry,pending reload,slow/error/closed recovery,explicit confirmation,return,
keyboard,light/dark1440/768/390/320px,forced colors,reduced motion,200% CSS zoom
proxy.28 captures;no observed page/console errors or external/mutating requests.
All100 quantity totals independently matched the current product formula.

Evidence:[light desktop](../../../apps/web/labs/espaco-library/evidence/checkout/light-1440-form.png),
[dark desktop](../../../apps/web/labs/espaco-library/evidence/checkout/dark-1440-form.png),
[mobile form](../../../apps/web/labs/espaco-library/evidence/checkout/dark-390-form.png),
[narrow pending](../../../apps/web/labs/espaco-library/evidence/checkout/light-320-pending.png),
[mobile confirmation](../../../apps/web/labs/espaco-library/evidence/checkout/dark-390-confirmed.png).

See [Validation](VALIDATION.md) for package checks. Scoped verification,not
full-catalog or owner aesthetic approval. No real charge,auth,credit mutation,
fiscal issuance,production change or release. Native screen-reader speech,
physical devices,Safari/Firefox,native browser zoom and performance profiling
remain unverified. Conversion improvement is a hypothesis,not a measured result.
