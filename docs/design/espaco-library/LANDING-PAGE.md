# Landing page — product-first composition

September16 local candidate; `?view=landing&theme=light|dark`. Not included in
published RC16. No release, product integration, authentication, analysis,
upload, purchase or application submission. Package remains product-neutral;
Curriculol copy/fixtures live only in the playground.

## Public API

| Export | Contract |
|---|---|
| LandingPageLayout | Required brandName/homeHref/navigation/navigationLabel/menuLabel/skipLabel/children/footer; optional brandMark/accountLink/appearance. Native header/nav/main, skip link, mobile disclosure. Host supplies one H1 and footer landmark |
| LandingHero | Required title/description/action/children; optional eyebrow/secondaryAction/note. H1, native action links, proof slot. One primary next decision |
| LandingSection | Required unique id/children. Anchor target, fixed section rhythm; no style override |
| ProductDemo | Required label/contextLabel/context/resultLabel/tabs/value/onChange/note. Labelled figure with H2, source/result layout, controlled existing Tabs. Explicit illustrative-data disclosure |
| ProductDemoTab | id/label/content. Stable unique IDs; valid selected value; host owns data and selection |
| DocumentPreview | Required name/subtitle/sections; optional note. H3 identity, H4 section titles, readable text, no actual artifact generation |
| ProcessSteps | Required title/steps; optional description. H2, ordered native list, H3 steps; stable IDs; visual numbers decorative, list semantics retained |
| FAQSection | Required title/items; optional description. H2, native details/summary; stable IDs; multiple answers may remain open |
| LandingLink | label/href. Native link, actual destination required; no fake callback navigation |

`PricingCard.action` also accepts a mutually exclusive native `{label,href}`
variant. Existing `{label,onClick,busy?,disabled?}` unchanged. See [Pricing](PRICING.md).
No consumer CSS, new token, dependency, font, icon family or layout escape hatch.
Fixed dimensions and adaptations: [Foundations](FOUNDATIONS.md).

## Composition and decision

Audience assumption: Portuguese-speaking candidate arriving to improve an
application. First useful outcome: understand the resume against a chosen job.
Primary CTA example: `Analisar meu currículo`; repeated without changing meaning.

Promise → illustrative vacancy + readable resume/letter → three-step workflow
→ five outcome-led benefits → free analysis vs paid kit → FAQ → closing CTA.
Reuse: BrandMark, ApplicationCard, Tabs, Dialog, BenefitsSection,
BenefitIllustration, PricingSection, CardMedia, LandingFooter, IconButton.
Existing original benefits artwork and local pricing illustrations; no copied
reference image or fabricated customer proof. No testimonials, conversion
statistics, urgency, guaranteed interviews or invented ATS score.

[Marc Lou adaptation](LANDING-PAGE-SKILL.md) shapes the message and decision;
Better owns interface quality; Emil owns relevant interaction feedback.
Hypothesis only: showing the vacancy-to-document mechanism should clarify value.
No measured conversion gain. A later authorized experiment can measure qualified
analysis starts/completions with abandonment and support burden as guardrails.
No tracking added here.

## Product evidence snapshot

Read-only Curriculol checkout, September16,2026,
HEAD `3b9117f71b8611c75a5834d48fbc406e03954c5f`; paths below belong to that project.
Recheck before production adoption; the DS does not own these business rules.

| Claim | Local evidence |
|---|---|
| Free analysis, email confirmation required | `apps/web/src/routes/_funnel/optimization.job.tsx`; `optimization.claim-email.tsx`; `apps/api/src/features/analyze/README.md` |
| Resume + cover letter =1 credit per job; review before sending | `apps/api/src/features/application-kit/README.md`; `docs/design/FIRST-VISIT-ONBOARDING.md` |
|1=R$5.90;10=R$27.90;50=R$55.90;no subscription | `apps/web/src/components/pricing/PackagesGrid.tsx`; `packages/shared/src/index.ts` |
| Credits valid while account exists | `apps/web/src/components/TermsPage.tsx`; pricing copy |
| Start from resume, LinkedIn data or experience description | `docs/design/FIRST-VISIT-ONBOARDING.md`; `apps/web/src/i18n/locales/pt-BR/app.json` |

Do not restore stale "no signup", guaranteed result or unverified percentage
claims from the previous marketing page. No business policy changed.

## Flow and recovery

| Entry | Transition / return |
|---|---|
| Catalog → Landing do Curriculol | Native link to local page; light default, supplied theme retained |
| Primary CTA | Existing local `?view=upload`; explicit no-read/no-upload disclaimer; browser Back |
| Login link | Existing local `?view=otp`; no code sent or account created |
| Paid-kit secondary link | Existing local `?view=kanban`; no checkout disguised as a purchase |
| Product demo | Resume/letter tabs via pointer or Arrow/Home/End; document buttons select the same state |
| Example vacancy | Existing Dialog; Escape closes and restores triggering focus |
| Mobile navigation | Native Menu summary; links close it; Escape closes and returns focus; no modal trap |
| FAQ | Enter/Space toggles native disclosure; answer remains in DOM; rapid reversal supported |
| Theme | Local query parameter + provider update; destinations retain theme; no account persistence |

Static page: no network loading/error/success state to invent. Pricing artwork
reuses CardMedia loading/error recovery. Real destination validation and errors
remain outside this prototype. Page title/lang set while mounted, restored on exit.

## Better review — completed scope

React19, existing BEDS semantic tokens/Inter/Geist/Lucide. Read root/package/lab
AGENTS, Foundations, Consumer contract, Interface quality, relevant component
contracts. Scope: complete local landing and its immediate preview round trips;
not the entire application or production conversion funnel.

| Domain | Evidence inspected | Result |
|---|---|---|
| Accessibility | Native landmarks, skip link, names, focus recovery, keyboard tabs/FAQ/menu, list semantics,320px,200% zoom proxy,forced colors,reduced motion | Clear in tested scope |
| Layout |1440/768/390/320px, narrow demo container, reading order, shared benefits/pricing/footer composition | Clear |
| Writing | PT-BR promise, visible synthetic disclosure, product evidence, free/paid distinction, email requirement, no guarantee | Clear |
| Typography | Heading hierarchy, responsive scale, readable document text, wrapping and no clipping at tested widths | Clear |
| Colors | Both themes; computed visible heading/body/link/button/summary contrast ≥4.5:1, including primary hover/press; semantic status text+dot | Clear in sampled states |
| UI | Concentric demo surfaces, fixed rhythm, shared card details, pointer/focus feedback, mobile navigation targets | Clear |

No actionable interface findings remain in this scope. Before final pass:
restored Safari list semantics, replaced reordered mobile navigation with a
native disclosure, added demo container responsiveness, removed double benefit
section padding and fixed demo heading hierarchy. No unrelated token changes.

### Verification

`npm run verify` →build,typecheck,120 public components/92 tokens,29 consumer
roots/32 files,documentation checks,33 guard tests +4 quality-routing tests and
fresh packed-artifact parity/independent consumer import passed. First run
identified the build-guard fixture's stale CSS list; added the new stylesheet
without weakening its missing-asset assertion. No published archive replaced.

`PLAYWRIGHT_BASE_URL=http://127.0.0.1:5296 npm run test:browser -- landing.spec.ts --reporter=line`
→10/10 Chromium desktop/mobile checks. Includes real catalog entry, CTA round
trips, no page errors or mutations in the sampled flow, keyboard recovery,
contrast, responsive geometry, narrow container, rapid FAQ reversal, reduced
motion, forced colors and CSS200% zoom/RTL proxy. Not a real browser zoom audit.

`PLAYWRIGHT_BASE_URL=http://127.0.0.1:5296 npm run test:browser -- benefits.spec.ts landing-footer.spec.ts pricing.spec.ts --reporter=line`
→20/20 existing-component regressions, including pricing busy/error recovery,
broken/cached media, optional/long copy, native CTA round trips and both themes.

Visual evidence: [light first fold](../../../apps/web/labs/espaco-library/evidence/landing/light-first-fold.png),
[dark first fold](../../../apps/web/labs/espaco-library/evidence/landing/dark-first-fold.png),
[light mobile](../../../apps/web/labs/espaco-library/evidence/landing/light-mobile-hero.png),
[dark mobile](../../../apps/web/labs/espaco-library/evidence/landing/dark-mobile-hero.png),
[full light](../../../apps/web/labs/espaco-library/evidence/landing/light-1440.png),
[full dark](../../../apps/web/labs/espaco-library/evidence/landing/dark-1440.png).

Not verified: VoiceOver/NVDA, Safari/Firefox, physical mobile, actual auth/upload/
analysis/payment, production metrics, owner aesthetic acceptance. Context7 tool
unavailable; no new dependency/API integration, reused installed local APIs.

### Emil motion review

`PASS_WITH_NOTES`: FAQ plus rotates45deg in150ms using existing ease-out curve;
rapid toggles preserve native open state. CTA feedback uses150ms color/shadow;
no layout, scale, entrance cascade, autoplay, parallax or scroll hijack.
All new transitions gated by `prefers-reduced-motion:no-preference`; static state
still communicates affordance. Existing card/tab feedback retained and tested
with reduced motion. No protected product animation touched. No frame-time or
GPU-performance claim; physical-device profiling remains unverified.

### Verdict

`Approve` for the reported local Better coverage. Not release approval, universal
accessibility certification, owner aesthetic sign-off or measured conversion.
