# Landing benefits

Scope:`BenefitsSection`,`BenefitIllustration`;isolated `?view=benefits` catalog.
No product landing integration,analytics,signup,provider calls or release.
[Foundations](FOUNDATIONS.md) owns geometry;[States](STATES.md) owns behavior;
[Validation](VALIDATION.md) owns executed checks. Candidate remains unpublished.

## Reference and adaptation

Owner screenshot `codex-clipboard-877d673b-fe72-4978-a3ef-2dc3d3175777.png`,
September15:wide first card + four supporting cards,soft miniature illustrations,
centered benefit text. A adaptation,not extracted source CSS or copied artwork.

| Source anatomy | BEDS decision |
|---|---|
| Asymmetric first row | Fixed first-card span;3/2/1 responsive grid,stable DOM order |
| Blue/warm diffuse artwork | Original inline SVG;existing orange brand wash ≤16%;fixed neutral theme roles |
| Video production features | Curriculol resume+letter,profile import,compatibility,Lucy and status tracking |
| Large image area | Passive illustrations;all meaning retained in real headings/descriptions |
| Rounded nested shell | r24 with4px inset andr20 media;no stock gradients behind functional text |
| No reference mobile state | Container-driven stacking,wrapping copy and44px CTA;documented adaptation |

Copy evidence:existing Curriculol feature docs for `application-kit`,
`lucy-engine`,`profile-import`,`job-applications`,`job-search`. These describe
capabilities,not measured user outcomes. No invented statistics,ATS improvement,
interview/offer guarantee,free-plan claim or unsupervised application promise.
Illustrations are conceptual,not live UI or a claim that an operation finished.

## Public API

| API | Contract |
|---|---|
| `BenefitsSection.title` | Required plain heading;caller owns wording |
| `description` | Optional supporting paragraph |
| `items` | Ordered readonly array:stable unique `id`,`title`,optional `description`,`illustration` |
| `illustration` | Passive public BEDS visual;no interactive children;do not hide unique information in art |
| `action` | Optional single `{label,href}`;native link,not a form submit;trusted host-owned destination |
| `note` | Optional plain supporting/preview note |
| `purpose` | `section` default:named section,H2/H3;`page`:main,H1/H2 for standalone use;never nest main |
| `BenefitIllustration.kind` | `documents`, `profile`, `match`, `conversation`, `board`;always decorative/static |

No visual overrides,arbitrary HTML rendering,network access or state machine.
Keep benefit count focused;five matches this reference. Fewer/more items flow
in source order;first item remains emphasized. Zero items omits the list;host
may omit the whole section. No illustration removes its frame. No action means
no control. No loading/error/success state:host data/destination owns recovery.
`FeatureCard` remains the separate image-led introduction with per-card actions.

## Playground

[Composition](../../../apps/web/labs/espaco-library/BenefitsPage.tsx):five cards;
light/dark;`preview=long`, `minimal` (first art and CTA omitted), `empty`.
Catalog navigation → benefits → “Preparar meu perfil” → local onboarding → Back.
No upload,profile mutation,LLM call or data persistence.
[Browser regression](../../../apps/web/labs/espaco-library/benefits.spec.ts).

## Review

Skills:`better-interface` + accessibility/layout/writing/typography/colors/UI,
`frontend-design`,`copywriting`;UI-skills visual routing. Approved DS contracts
retain priority over generic style suggestions. No external API was introduced.

| Domain | Evidence | Result |
|---|---|---|
| Accessibility | Native main/section,list,articles,heading levels and CTA;decorative SVGs hidden;keyboard focus,44px target,forced colors | Inspected;no actionable findings in new components |
| Layout | Five-card reading order,3/2/1 geometry,1440/768/390/320px,long text,CSS200% zoom/RTL | Inspected;no clipped functional copy |
| Writing | PT-BR,real capabilities,one explicit profile action;no numeric or success claims | Inspected;no actionable findings |
| Typography | Inter hierarchy,balanced titles,readable unitless leading,full descriptions | Inspected;no functional truncation |
| Colors | Computed text pairs≥4.5:1 in both themes/rest/pressed;secondary light5.49,dark5.80;focus vs canvas4.39/8.96≥3 | Inspected;no failing functional pairs |
| UI | Concentric shell,passive cards,original themed art;no entrance or hover movement | Inspected;dark placeholder strokes strengthened within artwork only |

No actionable interface findings in the new component scope. Existing compact
catalog theme controls retain their density;no system-wide accessibility claim.
Initial mobile entry test used a guessed opener label;corrected to the observed
`Navigation` label and reran the real catalog→CTA flow. No application change or
checker exception was used to make the test pass. Public `purpose` selects two
fixed semantic contexts;arbitrary polymorphic `as` remains disallowed.

Executed2026-09-15:`npm run verify` passed;113 components/90 tokens,28 consumer
roots/31 files,zero violations,27 guard+4 routing tests,artifact/consumer smoke.
`PLAYWRIGHT_BASE_URL=http://127.0.0.1:5296 npm run test:browser -- benefits.spec.ts
landing-footer.spec.ts --reporter=line` →12 passed (6 benefits,6 footer).
No page errors or mutating requests in the catalog/CTA flow.

Rendered evidence:
[desktop light](../../../apps/web/labs/espaco-library/evidence/benefits/desktop-light-1440.png),
[desktop dark](../../../apps/web/labs/espaco-library/evidence/benefits/desktop-dark-1440.png),
[tablet light](../../../apps/web/labs/espaco-library/evidence/benefits/desktop-light-768.png),
[tablet dark](../../../apps/web/labs/espaco-library/evidence/benefits/desktop-dark-768.png),
[mobile light](../../../apps/web/labs/espaco-library/evidence/benefits/mobile-light-390.png),
[mobile dark](../../../apps/web/labs/espaco-library/evidence/benefits/mobile-dark-390.png),
[320 light](../../../apps/web/labs/espaco-library/evidence/benefits/mobile-light-320.png),
[320 dark](../../../apps/web/labs/espaco-library/evidence/benefits/mobile-dark-320.png),
[zoom/RTL](../../../apps/web/labs/espaco-library/evidence/benefits/desktop-zoom-rtl.png).
Screenshots inspected,not approved pixel baselines.

Scoped author review:no HIGH finding (upstream Approve). Delivery:PENDING for
independent visual comparison/design-owner approval,not implementation or tests.
Independent comparison,aesthetic approval,screen-reader speech,physical devices,
Safari/Firefox and actual browser zoom remain unverified. CSS zoom is a reflow
proxy,not actual browser zoom. No inherited whole-library accessibility approval.
