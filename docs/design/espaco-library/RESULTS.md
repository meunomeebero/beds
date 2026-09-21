# Results — analysis, optimization and next action

Current ownership: the `Result*` family is an optional app recipe in
`apps/web/labs/espaco-library/recipes/results.tsx`, not BEDS runtime exports.
Its scores, findings, offer hierarchy and conversion flow are example decisions,
not a universal style guide. Numeric-evidence and offer-semantics tests were
preserved with the recipe. [Agnostic DS](AGNOSTIC-DS.md) owns the current boundary.

Scope: September16 local BEDS redesign candidate. Preview routes:
`?view=analysis-result&theme=light|dark` and
`?view=optimization-result&theme=light|dark`. Synthetic data and explicit local
callbacks only. No production migration,provider request,upload,account creation,
email,charge,credit mutation or release. Published package unchanged.

## Authority and source parity

[Foundations](FOUNDATIONS.md) owns visual identity;
[Consumer contract](CONSUMER-CONTRACT.md) owns composition boundaries;
[Governance](GOVERNANCE.md) owns evidence and acceptance. Result data,eligibility,
entitlements,pricing,requests and routing remain host responsibilities.

Read-only Curriculol reference: active route imports and their V4 components.
Paths in this table belong to the product repository,not this portable package.
Read-only source snapshot:`3b9117f7` on `fix/landing-pricing-section-rhythm`.

| Concern | Product source |
|---|---|
| Analysis entry | `apps/web/src/routes/_funnel/results.$id.tsx` imports `AnalysisResultV4` |
| Free result and account access | `apps/web/src/sections/analysis-result-v4/AnalysisResultV4.tsx`; `AnalysisReportLock.tsx` |
| Score,fit and next action | `apps/web/src/sections/analysis-result-v4/useAnalysisResultV4.ts` |
| Optimization entry | `apps/web/src/routes/_auth/before-after.$id.tsx` imports `OptimizationResultV4` |
| Proof,changes,document,delivery and repeat use | `apps/web/src/sections/optimization-result-v4/OptimizationResultV4.tsx` |
| Credit quantities and literal totals | `packages/shared/src/index.ts`; `apps/web/src/components/pricing/PackagesGrid.tsx` |
| Current payment return | `apps/web/src/routes/_auth/checkout.$tier.tsx` returns to dashboard after confirmation |

`FREE-ANALYSIS-FUNNEL-D5` describes legacy components;it is not the active
result-screen inventory. Resolve parity against runtime imports before adopting
older document claims. Source parity means preserved useful content and access,
not copied terminal typography,CSS or exact old geometry.

| Current behavior | Redesign requirement |
|---|---|
| Analysis score and initial evidence are free | Show value before the paid next step;never charge to reveal a free score |
| Detailed analysis has email/account access rules | Explain account confirmation separately from payment;do not merge the two gates |
| Missing score/error | Recovery first;no fabricated score,delta or payment recommendation |
| Existing optimization | Open the existing result;no duplicate purchase/generation |
| Score below40 or known vacancy fit below30 | Recommend another vacancy,not a paid attempt to erase a genuine mismatch |
| Score at least95,without the low-fit branch | Preserve the already-strong result;no invented need to optimize |
| Eligible analysis and known zero credits | Direct,priced purchase action for the next paid outcome |
| Eligible analysis with usable credits | Use the existing credit path;do not sell another credit unnecessarily |
| Optimization paid before generation | Keep its document,editing and delivery available even at zero remaining credits |
| Further applications | Offer another vacancy using available credits;purchase only when needed for that next outcome |

Analysis source explicitly treats `credits=null` as unknown,not zero,and allows
configuration. This preview's explicit balance-error/recheck state is an
**A safety adaptation**,not a claim that analysis already has that recovery UI.
Optimization source separately models loading,unknown,error and known balance.
Never translate an unavailable balance into a zero-credit purchase condition.

## Conversion decision — Revenue-Centric Design

User intent: a result screen should make the relevant paid next action immediate
and understandable. Audience: a candidate who has supplied a resume and target
vacancy and now needs to decide what to do with the evidence.

Required lens: `revenue-centric-design` by Richard/@richardrx,not Marc Lou.
Read its complete entrypoint,product-psychology precedence and relevant
conversion/monetization references. Apply a small set of mechanisms:

| Principle | Scoped application |
|---|---|
| Value first,ask later | Free diagnosis and concrete evidence precede a purchase request |
| Promise proportional to proof | Show observed issues or real before/after differences;no promised score,interview or hiring outcome |
| Clear next action | One dominant action per eligible state;its label/cost explain the immediate consequence |
| Remove uncertainty,not autonomy | Show total,quantity and billing terms;retain close,back,report access and recovery |
| Expansion follows usage | Sell the next useful application,not access to an already-paid document |

Hypothesis: an eligible candidate who sees a concrete gap,what the paid kit
changes and the exact cost can proceed with less uncertainty. This is not
measured conversion uplift. No artificial urgency,countdown,scarcity,score
inflation,fabricated testimonials,automatic purchase or blocked export.

Analysis conversion: free result → eligible next outcome → explicit offer →
checkout preview → explicit simulated confirmation → original context.
Optimization conversion: deliver the paid result → optionally prepare the next
vacancy → credit/purchase decision. Existing entitlement always wins over the
commercial CTA. Low-fit,excellent,missing and unknown-balance branches do not
become generic purchase prompts.

Current product checkout returns to dashboard. Context-preserving return in this
playground is **PROPOSED**,not runtime parity;production adoption needs separate
routing/payment review. Closing or failing checkout retains the result and
does not consume credits. No timer is payment evidence.

## Offer evidence and boundaries

Product price snapshot,not library defaults:

| Credits | Complete total |
|---|---|
|1 |R$5,90 |
|10 |R$27,90 |
|50 |R$55,90 |
|100 |R$79,90 |

One-time purchase,no subscription;current pricing copy says credits do not
expire. Reverify product terms before integration. One application kit costs
one credit;the optimization result is not a second charge. No new package,
discount,renewal policy or expiry rule is proposed. Quantity choices remain
explicit;larger quantities must not be silently preselected to raise spend.

Potential authorized measurement: eligible result views → deliberate checkout
starts → provider-confirmed purchases → usable paid artifacts. Guardrails:
duplicate charges,refund/support burden,failed downloads,recovery success and
paid-access regressions. No analytics or experiment deployed by this preview.

## Shared pattern and reuse

| Shared export | Responsibility |
|---|---|
| `ResultLayout` | Result-level composition;summary,next action,optional short evidence,then detail;mobile next action precedes secondary evidence |
| `ResultScore` | Labelled actual score and optional truthful comparison;missing distinct from zero |
| `ResultFindings` | Readable keyed findings/evidence list;host owns any progressive disclosure |
| `ResultSection` | Named report sections with fixed shared rhythm |
| `ResultOffer` | Contextual next-outcome presentation,terms and controlled action;no billing logic |

Public TypeScript declarations own exact props;this table is not a second API
schema. Reuse existing BrandMark,SegmentedMeter,DocumentPreview,Tabs,Dialog,
Button,Notice and PaymentConfirmation where their contracts fit. Shared package
owns styles;no playground CSS,visual escape props,raw replacement icons or
business rules inside reusable primitives.

ResultScore must not invent a delta for null/nonfinite/missing readings. A lower
after-score stays a regression;equal scores stay equal;partial dimensions stay
partial. Explain what is unavailable and retain any valid evidence. Improvement
in a simulated score does not establish a real-world outcome.
Numeric formatting defaults to English;the host supplies `locale="pt-BR"`.
Display precision is two decimals;smaller nonzero deltas remain explicit with
a less-than marker and actual outcome. No rounded-away regression. Offer price,
terms and note describe its primary action;navigation uses native hrefs.

Document previews are readable samples,not produced/exported files. Download
and edit actions in this playground open clearly labelled local demonstrations;
they must not silently request production artifacts. PaymentConfirmation is
only mounted after an explicit simulated confirmation here;production requires
verified provider/server confirmation. Receipt and fiscal invoice are separate.

## Flow and fixtures

Catalog/processing completion → named result → inspect proof/findings/document
→ eligible next action → explicit preview → close/recovery/confirmation →
retained result. Result and action appear immediately;no reveal sequence gates
reading,purchase or paid delivery.

Fixture selector: `preview=default|credits|anonymous|low-fit|excellent|missing|
regression|partial|balance-error|existing`. Each represents synthetic local state,
not persisted account history. Preserve selected result kind and theme across
preview navigation. Existing [Processing](PROCESSING.md) timing and pause
contracts remain unchanged.
Analysis narration names Anya/Vanellope as active and Arya as optional/inactive;
the52s chapter explains that distinction without changing phase timing.
Vacancy-search CTAs open an explicit local boundary dialog;this catalog has no
connected job-search route. Escape/close preserve result,balance and trigger focus.
Do not route them to the catalog's unknown-view fallback.

## Visual and motion adaptation

**A local adaptation** of approved BEDS identity: Inter,shared neutrals,one
Curriculol brand,segmented meters and existing document/control anatomy. Not a
pixel measurement or automatic approval of the prior product screen. Shared
source and Foundations own executed geometry.

Emil review scope: restrained220ms entry feedback only;no mandatory count-up,
slot-machine wait,score fabrication or autoplay checkout. Reduced motion removes
nonessential entry motion. Score,terms and controls remain available in the
first rendered state. This does not remove or shorten any production animation
or the earlier processing preview. Native disclosure/tab interaction must remain
interruptible;closing a dialog returns focus without clearing the result.

## Quality review — local candidate

Run [Interface quality](INTERFACE-QUALITY.md): `better-interface` and all six
owners before design decisions,then review the whole affected flow. Add the
requested Revenue-Centric lens for eligibility/offer hierarchy and
`emil-design-eng` plus motion-diff review for feedback. Skill invocation alone
is not evidence of compliance or conversion quality.

| Domain | Required evidence |
|---|---|
| Accessibility | Named scores/sections,headings,keyboard disclosures/tabs,modal focus return,44px actions,reduced motion,stable recovery announcements |
| Layout | Complete result plus next step;desktop/mobile,320px,long findings/terms,reading order,no clipped paid actions |
| Writing | PT-BR,sentence case,free/account/paid distinctions,full price,truthful proof,action consequence and recovery |
| Typography | Shared Inter hierarchy,tabular scores/prices,full labels,natural wrapping |
| Color | Existing semantic roles,both themes,sampled text contrast;status not color-only |
| UI | Shared anatomy,concentric surfaces,progressive disclosure,one dominant eligible action |
| Revenue-Centric | Value before request;no paid-access regression;known-balance branch;no fabricated improvement or pressure |
| Emil | Immediate useful content,220ms optional entry,reduced-motion equivalence,interruptible controls,no delayed entitlement |

Focused result browser suite:16/16 passed,0 skips,25.7s. Covers catalog entry,
checkout cancellation/failure/return,free reports,eligibility,missing/regressing/
partial scores,unknown balance,paid document access at zero balance and truthful
vacancy-search boundary. Keyboard/tab/Escape,modal containment,focus restoration,
light/dark1440/768/390/320px,44px result actions,sampled text contrast≥4.5:1,
reduced motion and CSS200% zoom proxy. No observed page/console error or external/
mutating request.24 captures,not approved pixel baselines.

Shared Dialog now recovers focus when a completed action removes its focused
control;normal trigger restoration stays intact. Host returns focus to the main
landmark when account,payment or balance success replaces its original trigger.
Three new server-rendered guards cover absent/invalid/zero scores,fractional and
tiny regressions,semantic lists,native navigation and price/terms descriptions.

Independent source/selected-render review found two integration issues:unknown
job-search route and automatic/optional Arya mismatch. Both corrected and
independently rechecked. Main inspected both dark desktop pages,checkout,light
desktop and light/dark390px captures. No remaining scoped code finding;not a
full-catalog or owner aesthetic approval. [Validation](VALIDATION.md) owns final
package and existing processing/dialog regression totals.

[Analysis light390px](../../../apps/web/labs/espaco-library/evidence/results/analysis-light-390.png),
[optimization dark390px](../../../apps/web/labs/espaco-library/evidence/results/optimization-dark-390.png),
[analysis dark1440px](../../../apps/web/labs/espaco-library/evidence/results/analysis-dark-1440.png),
[optimization light1440px](../../../apps/web/labs/espaco-library/evidence/results/optimization-light-1440.png).
[Page](../../../apps/web/labs/espaco-library/ResultsPage.tsx),
[fixtures](../../../apps/web/labs/espaco-library/results-fixtures.ts) and
[browser regressions](../../../apps/web/labs/espaco-library/results.spec.ts).

Limits:one-credit checkout only;no live packages/account/reports/PDF/editor/
sharing/job search/payment. The two-template selection is local state,not two
connected renderers. Real funnel/analytics and complete production parity are
not claimed. Local candidate only;no commit,push,release or consumer update.

Owner aesthetic acceptance remains separate. Physical devices,screen-reader
speech,Safari/Firefox,actual browser zoom,performance profiling and real conversion
measurement require explicit evidence;never infer them from Chromium/static QA.
