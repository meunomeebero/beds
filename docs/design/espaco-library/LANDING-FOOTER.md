# Landing footer

Scope: reusable `LandingFooter`; isolated `?view=landing-footer` catalog.
No Curriculol landing integration, FAQ, signup, tracking or external requests.
Public declarations: `LandingFooterProps`, `LandingFooterLink`,
`LandingFooterGroup`. [Foundations](FOUNDATIONS.md) owns geometry; [States](STATES.md)
owns behavior; [Validation](VALIDATION.md) owns executed results.

## Reference → adaptation

Owner-supplied September15 footer screenshot: closing statement on the left,
compact links on the right, oversized pale wordmark, soft glow and pill CTA.
Screenshot proportions are visual evidence, not measured source CSS.

| Source | A adaptation / reason |
|---|---|
| Blue/yellow glow | Existing provider brand at ≤22% opacity; no additional palette or functional color repurposing |
| Pale brand | Real brand remains legible at the top; repeated display wordmark is decorative and hidden from assistive technology |
| Tilted floating CTA | Stable, in-flow opaque pill; no rotation, absolute overlap or unnecessary animation |
| Social links | Caller-supplied destinations; catalog uses working Blog/Forum previews, no invented accounts |
| Footer and FAQ | Footer only; FAQ remains a separate composition |
| Responsive source unknown | Content-sized height; stacked groups at narrow container widths; complete strings wrap |

No reference image, logo, commercial claim or source CSS copied. Wordmark uses
the existing Inter font. Values are documented candidates for owner review.

## Public contract

| Prop | Contract |
|---|---|
| `brandName` | Required brand text; visible accessible identity and decorative repeat; avoid a slogan here |
| `brandMark` | Optional passive public BEDS visual; decorative wrapper, never interactive children |
| `title`, `description` | Required closing H2; optional short supporting paragraph; caller owns copy |
| `action` | Optional `{ label, href }`; one native primary navigation link; no implicit signup |
| `groups` | Ordered labelled navigation groups; stable IDs and native links; empty groups omitted |
| `community` | Optional labelled inline links; social/community destinations supplied by host |
| `legal` | Optional labelled bottom links; no generated policies or fake destinations |
| `note` | Optional plain footer note; copyright/date supplied by host, no automatic legal text |

No arbitrary visual properties, colors, fonts, dimensions or animation knobs.
Link destinations must be host-validated, trusted navigation URLs; no raw user
HTML or automatic external fetch. Links stay in the current tab by default;
native modified/middle-click and copy-link behavior remain available.

Render once, after the page's `main`, not inside an article or section. The
footer supplies a native site-level contentinfo landmark. Surrounding page
title, main landmark, header/skip link and real legal destinations belong to
the host. The isolated catalog fixture is not a complete marketing page.

## Flow and states

Footer → Tab/pointer/native link → destination → browser Back → footer.
No stored state or synthetic success. Missing action/groups/community/legal
omit those controls; no disabled placeholders. No loading/error state: no
request originates here; destination owns its recovery. Theme is controlled
by `DesignSystemProvider`; preview theme changes update its local links.

Long copy, narrow containers and RTL retain source reading order. Every link
has at least44px block size. Focus uses existing visible theme ring. Functional
copy sits on a solid canvas; CTA has opaque primary fill; decorative wash
does not sit beneath unbacked functional text. No animation, including with
reduced motion. Forced colors hides decoration and preserves a CTA boundary.

## Examples and focused review

[Composition](../../../apps/web/labs/espaco-library/LandingFooterPage.tsx):
default, `preview=long`, `preview=minimal`; both themes. CTA opens local
onboarding, other links open catalog examples; no product mutation.
[Browser regression](../../../apps/web/labs/espaco-library/landing-footer.spec.ts).

Review scope: this footer and isolated preview. React19, canonical BEDS tokens,
Inter, fixed themes; root/package/catalog agent rules, Foundations and Governance.
Skills: `better-interface` and all six owners; `frontend-design`, `copywriting`;
UI-skills visual routing. No external library API or dependency introduced.

| Domain | Evidence | Result |
|---|---|---|
| Accessibility | Native footer/nav/lists/links; decorative duplicates hidden; keyboard, focus,44px targets, forced colors | Inspected; no actionable findings |
| Layout | Source-order grid, container stacking, full strings,320px and zoom/RTL | Inspected; no actionable findings |
| Writing | PT-BR sentence case; explicit profile CTA; preview note; destinations match labels | Inspected; no actionable findings |
| Typography | Existing font;32/28px closing heading,14px copy; balance/pretty; no functional clamp | Inspected; no actionable findings |
| Colors | Semantic theme colors; decorative brand only; rest/pressed contrast≥4.5 | Inspected; no actionable findings |
| UI | Restrained pill/shadow, soft wordmark treatment, no gratuitous motion | Inspected; no actionable findings |

No actionable interface findings remain in the inspected footer. During
implementation: corrected CTA pressed foreground inheritance; softened the
glow's clipped edge; supplied definite catalog host height so standalone
dark previews cover the viewport. No provider-wide min-height change.

Verification,2026-09-15: `npm run verify` passed. Browser:
`PLAYWRIGHT_BASE_URL=http://127.0.0.1:5296 npm run test:browser --
landing-footer.spec.ts --reporter=line` →6 passed after final visual changes.
Same invocation with `onboarding.spec.ts blog-post.spec.ts` →12 regressions
passed after the catalog host-height correction. Chromium desktop/mobile,
1440/768/390/320px,both themes;normal/long/minimal content;Tab/Enter,theme switch,
CTA→onboarding→Back,Blog→Back;contrast at rest/pressed;CSS200% zoom proxy,RTL,
reduced motion and forced colors. Screenshots inspected, not pixel baselines.

Evidence:
[desktop light](../../../apps/web/labs/espaco-library/evidence/landing-footer/desktop-light-1440.png),
[desktop dark](../../../apps/web/labs/espaco-library/evidence/landing-footer/desktop-dark-1440.png),
[mobile light320](../../../apps/web/labs/espaco-library/evidence/landing-footer/mobile-light-320.png),
[mobile dark390](../../../apps/web/labs/espaco-library/evidence/landing-footer/mobile-dark-390.png),
[zoom/RTL](../../../apps/web/labs/espaco-library/evidence/landing-footer/desktop-zoom-rtl.png).

Better self-review verdict: Approve, limited to the inspected footer. Governance
acceptance: PENDING independent comparison and design-owner aesthetic decision.
Implementation/static/package gates completed; no publication, version bump,
consumer upgrade or integration. Local candidate remains0.1.7-rc.16-local.24.

Independent review and design-owner aesthetic approval pending. Physical
devices, Safari/Firefox, screen-reader speech and actual browser200% zoom
are not verified; CSS zoom is a layout proxy, not equivalent browser testing.
Surrounding landing page and production destinations are out of scope.
