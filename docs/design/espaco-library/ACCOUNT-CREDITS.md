# Account credits — menu footer

## Scope and source

`AccountCredits`:plan heading,balance,optional bounded meter and action in the
existing AccountMenu footer. User reference:
`codex-clipboard-339598a1-c92b-4467-8a6a-082ff6d88bea.png`.
**A adaptation**,not raster-derived CSS:retain compact280px/r12 AccountMenu,
existing identity/actions/theme control;add only the reusable credit summary.
No sidebar replacement,workspace switcher requirement,price or billing policy.

## Contract

| Prop | Meaning |
|---|---|
| `plan`, `label` |Host-provided plan heading and localized balance label |
| `balance.status=ready` |Finite nonnegative numeric `value`;localized `formattedValue`;optional truthful `limit`. Host keeps formatted/numeric values consistent. Optional `formatValue(value)` is the typed formatter used for a live balance animation; the component never parses `formattedValue`. |
| `balance.status=loading/unavailable/error` |Required informative `message`;no old number,no zero,no quota graphic. Error explains retry/recovery |
| `invalidValueLabel` |Required localized fallback for negative/nonfinite numeric data;never render NaN/Infinity or a fabricated zero |
| `action` |Optional label/callback/disabled/busy. Native primary button;host chooses details/retry/upgrade and owns authorization/outcome. No inferred purchase or automatic retry |
| `note` |Optional terms or contextual explanation;plain wrapping text,not a tooltip-only caveat |

Use `AccountMenu footer={<AccountCredits …/>}`. Existing PlanCard is unchanged;
this variant names credit-specific states rather than overloading generic usage.
One internal MeterSegments implementation serves credits,usage and score bars.
This does not merge their meanings or calculations.

## Truthful meter

Only show the graphic when both values are finite,value≥0,limit>0,value≤limit.
Absent/invalid/zero limit or balance above limit → retain balance,omit meter;
never invent a denominator or clamp the displayed balance. True zero with valid
limit shows zero filled segments. Ready state retains aria-valuenow/valueMax and
localized valueText. Shared nearest-segment quantization;the number is authoritative.
Green is the existing success role for available balance,as in the reference;
it does not mean renewal,delivery,successful payment or a guarantee.

## Geometry and behavior

[Foundations](FOUNDATIONS.md) owns dimensions. Transparent compact card on the
opaque menu surface;subtle empty segments remain distinct from the canvas.
Account footer owns8px outside inset;card owns12px inside,r8,16px section rhythm.
Existing menu geometry is not enlarged to fit the reference screenshot scale.

When `formatValue` is supplied, a controlled change between two ready balances
uses the shared `AnimatedNumber` from the numeric values; the first frame keeps
the caller-rendered `formattedValue` static. Without it, the display remains
static. This keeps localized separators and currency conventions in host code
and never derives a number from display text. Reduced motion settles immediately.

Keyboard uses the existing AccountMenu:open → first action →Tab→credits action;
Escape restores trigger. Credit callback decides whether to close. Loading
announces through stable status;error uses alert. No animated bars/count-up.
Copy,large balances and plan names wrap instead of truncating. No network calls,
storage,timers or real purchase requests in library or catalog fixture.

## Example and review — September15

Catalog:Créditos no menu → `?view=account-credits&theme=dark`.
Optional `menu=open` opens the demo immediately. [Controlled example](../../../apps/web/labs/espaco-library/AccountCreditsPage.tsx)
uses fictitious plan/12.500 of20.000 credits;not a Curriculol offer or allowance.
Footer action says “Ver créditos”;error offers explicit local retry. Host account
actions only emit demo notices. State selector includes zero,unknown quota,
loading,unavailable,error,invalid value and long content.

Local candidate:`0.1.7-rc.16-local.20`;no commit,push,publication or5292 upgrade.
Automatic seven Better skills applied within the same onboarding/credits task;
not a new review of all DS surfaces. Shared semantics use the existing bounded
meter and native button;no new dependency/API lookup required.

| Domain | Reviewed scope |
|---|---|
| Accessibility |Named region/meter,native action,busy/disabled and truthful unavailable states;existing popup keyboard/focus |
| Layout |Compact footer,wraps labels/numbers;menu viewport clamp and scroll recovery |
| Writing |Local example explicitly fictitious;no false payment/quota/upgrade;zero differs from unavailable;retry explicit |
| Typography |Existing Inter13/19.5 header/value,12/18 status/note;tabular numeric,bdi isolation;no truncation |
| Color |Existing text/secondary/primary and success roles;exact number independent of color;measured pairs below |
| UI |Existing280px popup retained;shared28×16px meter;no duplicate sidebar block or icon library |

### Verified locally

- Browser:6 account-credit cases pass across desktop/mobile;12 total with onboarding.
  Real catalog entry → user trigger → keyboard action → local notice;Escape focus
  recovery;both themes;zero/unknown/loading/error/retry/invalid states;long content,
  320px reflow,200% CSS zoom and forced colors. Browser-zoom equivalence not claimed.
- Build,typecheck,DS/consumer/doc checks,31 guard/routing tests and artifact smoke pass.
  Candidate exports100 public components and90 tokens. Both new catalog consumers
  also pass an explicit consumer check.
- Rendered review:desktop dark,mobile light and320px long-content screenshots inspected;
  title,balance,meter and action stay inside the existing menu. Evidence:
  `apps/web/labs/espaco-library/evidence/account-credits/`.
- Computed text contrast against rendered surface,light/dark:heading and balance
  12.27/10.35;secondary label5.49/5.37;action16.29/13.74. All sampled text pairs≥4.5:1.
  Green meter fill versus surface2.87/5.68:light graphic alone does not reach3:1;
  exact numeric balance remains authoritative and accessible meter values expose
  the quantity. No blanket graphical-contrast or full accessibility conformance claim.

Reproduce browser scope:
`PLAYWRIGHT_BASE_URL=http://127.0.0.1:5296 npx playwright test --config apps/web/labs/espaco-library/playwright.config.ts account-credits.spec.ts onboarding.spec.ts --reporter=line`.

Independent review and owner aesthetic approval pending. Real billing/account
services,VoiceOver,physical touch,Safari/Firefox,APCA and actual browser zoom not
verified. Existing AccountMenu outside these paths was not re-audited in full.
