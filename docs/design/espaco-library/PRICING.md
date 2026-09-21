# Pricing — individual card and optional comparison recipe

Current package contract: `PricingCard` and `PricingCardProps` are public BEDS
exports. `PricingSection`, `PricingSectionProps` and `PricingPlan` are app-owned
examples in `apps/web/labs/espaco-library/recipes/pricing-section.tsx`, not exports
of `beds`. The catalog demonstrates the recipe at `?view=pricing` with fictional
offers. Comparison columns, introductory identity and which plan to emphasize
are consumer decisions, not universal DS rules.

## API / boundaries

```tsx
// Catalog-local recipe; applications own their equivalent composition.
import { PricingSection, type PricingPlan } from './recipes';

const plans: PricingPlan[] = [{
  id: 'starter',
  title: 'Essencial',
  description: 'Um espaço para seus primeiros projetos.',
  image: { src: illustrationUrl, alt: '' },
  price: { label: 'Grátis', description: 'Sem cobrança neste exemplo.' },
  featuresLabel: 'O que está incluído',
  features: [{ id: 'workspace', text: '1 espaço de trabalho' }],
  action: { label: 'Escolher Essencial', onClick: selectStarter },
}];

<PricingSection title="Um plano para cada momento" plans={plans} />
```

| Export | Contract |
|---|---|
| PricingCard / PricingCardProps |Required title,description,image,price,featuresLabel,features,action;optional featured,actionNote,feedback,headingLevel2(default)/3 |
| Image |src + alt required;optional fallbackLabel;empty alt for decorative art;host-owned meaningful image where needed |
| Price |Complete localized label;optional description for billing terms;no numeric formatting,currency conversion or inferred interval. Optional `amount: { value, format }` is an authoritative host-owned numeric pair for a real controlled price/package change; the label is never parsed. |
| Features |Readonly `{id,text}[]`;unique stable IDs;native named ul/list;empty array removes benefits block |
| Action |Exclusive `{label,onClick,busy?,disabled?}` or `{label,href}`;callback busy also disables;native href has no busy/disabled/callback;actionNote explains unavailable/current plan;feedback announces host-supplied result |
| Recipe-only PricingSection / PricingSectionProps |Required title/plans;optional description,mark,headingLevel1/2(default);mark is caller-owned noninteractive identity |
| Recipe-only PricingPlan |PricingCardProps without headingLevel,plus unique stable id;section supplies H2 below H1 or H3 below H2 |

No style/className/children/size/layout overrides. PricingCard can stand alone;
PricingSection owns comparison layout and marks only the first explicitly
featured plan. Feature emphasis is not selection,an endorsement or an invented
"popular" badge. Caller may provide more plans;they wrap into further rows,
never shrink into three cramped columns. Zero plans:header only;caller must
explain loading/unavailability and provide appropriate recovery outside it.

Keep billing period,renewal,total obligations and relevant conditions visible
beside the price using price.description/actionNote. Do not advertise a monthly
equivalent as the actual bill or invent "free/no card required" claims.
Standalone pricing-catalog amounts and benefits are fixtures,not proposed
Curriculol policy. The separate [Curriculol landing](LANDING-PAGE.md) records
its product-evidence snapshot; no billing logic moves into the library.

`amount` keeps the initial price literal and animates only after the controlled
numeric value changes. The host formatter owns currency, locale, precision and
billing text; `AnimatedNumber` receives the previous and next numeric values.
Static labels, localized strings and plan selection state never enter a parser or
create an inferred price.

September16 local addition: native href actions preserve link behavior and
browser Back.44px minimum,r999,p10/16,existing control/text or featured brand/
on-brand tokens;hover1px/pressed2px inset ring;2px focus outline. Callback
geometry and busy/disabled behavior unchanged. No version/publication change.
PlanCard remains the compact account/usage component;FeatureCard remains the
image-first onboarding/presentation component. Neither contract changed.

## Reference / implementation

Source:user-supplied September15 pricing raster
`codex-clipboard-134a14ed-37d4-486d-a4e3-54dc9e296b3e.png`.
Image → plan/price → description → benefits → aligned CTA adopted as **A local
adaptation**. [Foundations](FOUNDATIONS.md) owns exact geometry/type.
Transparent body,r24,p20;4:1 art;360px maximum card;720px comparison lane;
two columns with enough space;one column on narrow containers. No new tokens.

Demo flower/banner SVGs are original decorative illustrations,not copies of
the supplied artwork or package defaults. Crop nonessential imagery only.
Internal CardMedia reused;loading reserves dimensions,blank/broken source
preserves price/benefits/actions;new source resets state,cached re-entry works.
No empty-src request,retry loop or autonomous action.

Native named section/article/headings/list/button;decorative checks hidden.
Price uses bidi isolation/tabular numerals. Billing terms/action note are
associated with the CTA. Stable polite feedback is caller-controlled;retain
offer on failure and offer explicit retry. Busy prevents duplicate activation;
host must control other plans during its request. No optimistic paid state.
Forced colors retains contours/focus;no new animation;long labels wrap.

Context7 tools unavailable;no new dependency. Official fallbacks:
[React keyed reset](https://react.dev/learn/preserving-and-resetting-state#resetting-state-with-a-key),
[CSS auto-fit/minmax](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/repeat).

## Historical review checkpoint — before recipe extraction

The results below describe the earlier implementation, not acceptance of the
current extraction. Re-run affected browser checks before claiming equivalence.

Candidate `0.1.7-rc.16-local.16`;local only. No commit,push,publication or
consumer upgrade. Seven Better skills +frontend-design/ui-skills-root read.

| Domain | Inspection | Result |
|---|---|---|
| Accessibility |Named cards/list,heading levels,decorative alt,Tab/Enter,associated billing terms,busy/recovery,forced colors |Inspected Chromium flow;screen-reader/device testing pending |
| Layout |1440/938/390/320px,both themes,long plan/price/benefits,one plan,empty benefits,RTL/CSS zoom200% |No clipped content or horizontal overflow;resting desktop CTAs aligned |
| Writing |Complete literal price/period;synthetic disclaimer;recoverable failure;current-plan reason |No purchase or success inferred;host owns commercial policy |
| Typography |Inter hierarchy;price tabular/bdi;natural wrapping |Desktop/mobile inspected;no price/title truncation |
| Color |Computed theme pairs below;brand foreground retained on hover/press |AA ratios pass for inspected pairs;no arbitrary palette extension |
| UI |Transparent cards,4:1 art,r24 frame,pill actions,concentric top radii |Reference-informed adaptation;owner aesthetic approval pending |

| Rendered pair | Light ratio | Dark ratio |
|---|---|---|
| Heading / canvas |12.27:1 |11.86:1 |
| Body,terms,benefits / canvas |5.49:1 |5.80:1 |
| Price / subtle pill |10.39:1 |9.99:1 |
| Neutral action |10.39:1 |9.62:1 |
| Curriculol featured action |10.40:1 |10.40:1 |
| Focus / canvas |4.39:1 |8.96:1 |

Featured hover/pressed keeps brand/on-brand opacity intact;1px/2px inset ring
provides feedback without compromising near-threshold brand contrast.

Executed:`npm run verify`(build,typecheck,96 components/90 tokens,docs/consumer
guards,31 guard/routing tests,packed import/parity);explicit consumer check of
`PricingExamples.tsx`:0 violations.
Browser:`PLAYWRIGHT_BASE_URL=http://127.0.0.1:5296 npm run test:browser -- pricing.spec.ts feature-card.spec.ts empty-state.spec.ts --reporter=line`:
26 passed(8 pricing +18 shared-media regressions). Includes real catalog entry,
keyboard selection,recovery,current plan,terms association,reserved loading,
failed/blank image,cached re-entry,long text,responsive and forced-color checks.
Initial loading-test interception also held the Vite asset module;fixture now
uses existing non-inlined asset convention and delays image requests only.
Visual review found long titles squeezed by price;intrinsic wrapping corrected
and narrow-layout regression verifies price moves below the full title.

Inspected captures:
[dark desktop](../../../apps/web/labs/espaco-library/evidence/pricing/desktop-dark-detail.png),
[light mobile](../../../apps/web/labs/espaco-library/evidence/pricing/mobile-light-detail.png),
[long narrow copy](../../../apps/web/labs/espaco-library/evidence/pricing/mobile-dark-long-320.png),
[recoverable failure](../../../apps/web/labs/espaco-library/evidence/pricing/desktop-recovery.png).

Not verified:VoiceOver,physical devices,Firefox/Safari,APCA,actual browser zoom
(CSS zoom is a proxy),real billing,all future content or whole-library conformance.
Independent review and owner aesthetic approval remain **PENDING**.
