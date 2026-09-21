# Settings composition

Scope: `Tabs variant="settings"`, `SettingsGroup variant="section"`, isolated
`?view=settings` catalog. No product integration or real account mutations.
Existing `activity`/`connection` tabs and default settings panels remain unchanged.

## Current ownership

SettingsPage is an app-owned example, not a public page template. Its section
order,720px content lane, account copy and routes do not belong to BEDS policy.
The reusable Tabs/SettingsGroup parts remain public. Tabs owns its tab strip and
panel visibility; it must not resize TextField, Switch, Select, ThemeToggle or
TextLink inside a panel. Each control owns its coarse-pointer targets and field
typography, independently of its parent. Inline links retain text-link semantics.
See [Agnostic DS](AGNOSTIC-DS.md) for current migration evidence.

## Reference → adaptation (historical prototype)

Owner-supplied September15 settings screenshot: horizontal top tabs, subtle
selected background plus underline, narrow central content, restrained groups.
Screenshot is visual evidence, not measured source CSS. Geometry below is A.
Stripe, API keys, technical setup steps and source branding are not imported.

| Concern | Decision |
|---|---|
| Navigation | Intrinsic labels;48px targets;4px gaps;one horizontal scroll lane;2px selected underline; existing selected/text tokens |
| Content | Existing720px Home measure;24px tab-to-panel gap; no new shell or arbitrary dimensions |
| Sections | Borderless,padding0;16/24px medium heading;24px internal rhythm;existing48px separation between groups |
| Mobile | Shared768px breakpoint;scroll tabs instead of shrinking/wrapping;16px editable text;44px buttons,links,theme/select triggers in settings panels |
| Colors/type | Canonical Inter and fixed themes; no palette change or reference-image assets |
| Defaults | Opt-in variants only;no changes to existing MCP shell or compact activity tabs |

The table records the earlier prototype, not mandatory app geometry or current
nested-control styling. Foundations guides reusable components. Caller supplies controlled tab value, content,
drafts, validation, persistence and requests. Components do not inspect routes,
fetch account data, save preferences or implement legal/payment policy.

## Curriculol playground mapping

Reviewed existing `home-rcd/blocks/settings-screen/SettingsScreen.tsx` and fixtures,
plus original product `components/settings/SettingsScreen.tsx` read-only.
Preserve the playground's grouping rather than import its business code.

| Tab | Retained demonstration |
|---|---|
| Conta | Avatar, username form, email, account ID; profile/MCP destinations |
| Preferências | Light/dark,PT-BR/en-US preference, sound toggle |
| Notificações | All9 existing fixture preferences: documents6,community1,financial2 |
| Privacidade | Anonymous usage,personalization,Lucy memory,legal-document placeholders,account deletion confirmation |

All data synthetic. Changes stay in React memory; reload/navigation resets them.
Tabs retain drafts/preferences while mounted. Profile action explicitly opens
the existing local Lucy preview; MCP opens its local preview. No unavailable
profile destination disguised as a working link. Language selection does not
translate this fixture; sound selection plays no audio; UI explains both.
Legal dialogs are placeholders, not legal documents. Deletion and memory actions
require a reversible confirmation and explicitly simulate their outcome.
No account is deleted, consent changed, message sent or memory erased.

## Flow and states

Entry → top tab → edit → submit/inline error → correct/save → tab away/back.
Native form/Enter; invalid username receives focus and a connected error.
Discard restores the last local saved username. Tab changes do not discard drafts.
`ResultsStatus` announces local outcomes. Host handles real unsaved-navigation
protection when integrating; this isolated fixture does not persist across pages.

- One roving Tab stop; Left/Right wrap; Home/End jump; disabled tabs skipped.
- Settings arrows mirror in RTL. Focused off-screen tab scrolls into view.
- Instant panel selection; inactive panels hidden but remain mounted.
- Selection identified by fill,underline and `aria-selected`,not color alone.
- `state=loading`/`state=error`: explicit local recovery controls.
- `preview=long`: long identity,email and tab label; no destructive text clipping.
- Existing reduced-motion and forced-color focus contracts retained.

## Source and evidence

[Composition](../../../apps/web/labs/espaco-library/SettingsPage.tsx),
[fixtures](../../../apps/web/labs/espaco-library/settings-fixtures.ts),
[browser regression](../../../apps/web/labs/espaco-library/settings-page.spec.ts).
Primitive form regression remains at `?view=settings-form`.

Better review scope: new variants and isolated composition, not the original
application. All seven skill entrypoints; task references for focus/keyboard,
forms, grouping/adaptivity, wrapping, contrast, surfaces and review format.
`frontend-design` after UI-skills routing. No external dependency/API added.

Validation and per-domain findings recorded after rendered checks in
[Validation](VALIDATION.md). New layout is a candidate; independent review and
design-owner aesthetic approval remain separate from passing technical checks.

### Focused Better review — September15 (historical initial pass)

Follow-up: shared boundary/off-switch and error-text findings corrected during
the [consolidated review](REVIEW-CONSOLIDATION-2026-09-15.md). The table below
retains original failing measurements;current evidence is in [Validation](VALIDATION.md).
Independent/aesthetic approval still pending.

| Domain | Evidence inspected | Result |
|---|---|---|
| Accessibility | Tab/panel relationships,roving focus,RTL,Enter validation,dialog Escape/focus return,44px tab/mobile actions,200% reflow proxy | Behavior checked; inherited contrast findings below |
| Layout | Four retained groups;720px measure;no nested panels;1440/768/390/320 widths;long identity/email/tab | No new clipping found; horizontal overflow confined to tabs |
| Writing | Existing9 notification choices,explicit local outcomes,legal placeholders,recovery | No silent product-policy change; no real-action success claims |
| Typography | Fixed Inter;16/24 section titles;13px controls;16px mobile input;complete strings | No actionable new finding |
| Colors | Both themes;rendered normal text≥4.5;inherited field/off-switch/error token calculations | Shared contrast gaps remain; no palette silently repainted |
| UI | Selected label+underline,contained focus,section rhythm,hover | Corrected double hover surface; defaults retained |

| Severity | Domain | Location | Before | Proposed shared follow-up | Why |
|---|---|---|---|---|---|
| HIGH | Accessibility/colors | `controls.css`: text-input border,switch off track | Existing light border/off-track1.32:1;dark border1.23:1,off-track1.72:1 against canvas | Review a shared contrast-qualified control boundary using semantic roles;verify rest/focus/both themes | Below3:1 where boundary is needed to identify the control/state |
| MEDIUM | Colors | `controls.css`: field-error text | Existing `--es-error` red calculates4.21:1 on light and4.18:1 on dark canvas | Separate readable error text from marker/border roles in the shared contract | Below4.5:1 normal-text target |

Ratios calculated from canonical sRGB values and alpha-composited canvas;dark
computed tokens cross-checked in the live preview. These are inherited shared
findings,not fixed by a new settings layout. Normal-text browser assertions do
not cover every error/contour pair or establish full WCAG conformance. Better
colors routing reports rather than silently repainting approved shared tokens.

Verification:16 browser checks passed across settings/new variants,existing
settings form and MCP regressions. `npm run verify` passed:111 components,
90 tokens,27 consumer roots/30 files,27 guard+4 routing tests,artifact parity
and fresh consumer smoke. Initial test assumptions were corrected:scope the
named region to its tabpanel;Dialog initially focuses safe Close,not Cancel.
Initial concurrent artifact check hit a temporary Playwright-directory race;
sequential rerun passed without changing the checker.

Inspected captures:
[desktop light](../../../apps/web/labs/espaco-library/evidence/settings/desktop-light-1440.png),
[desktop dark](../../../apps/web/labs/espaco-library/evidence/settings/desktop-dark-1440.png),
[mobile light](../../../apps/web/labs/espaco-library/evidence/settings/mobile-light-390.png),
[mobile dark320](../../../apps/web/labs/espaco-library/evidence/settings/mobile-dark-320.png),
[notifications](../../../apps/web/labs/espaco-library/evidence/settings/desktop-dark-1440-Notificações.png),
[privacy320](../../../apps/web/labs/espaco-library/evidence/settings/mobile-light-320-Privacidade.png),
[zoom/RTL](../../../apps/web/labs/espaco-library/evidence/settings/desktop-zoom-rtl.png).

Not verified:screen-reader speech,physical-device keyboard/touch,Safari/Firefox,
actual browser200% zoom (CSS reflow proxy only),real persistence/error responses.
Verdict:BLOCK for production accessibility acceptance while shared HIGH contrast
finding remains. Local implementation/static/artifact checks complete;
independent review and owner aesthetic decision PENDING. Preview remains usable
for layout review;no release,consumer upgrade or production readiness claim.
