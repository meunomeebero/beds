# BEDS consolidation — 2026-09-15

Historical checkpoint. Current status: [Validation](VALIDATION.md) and the
[consolidated Better review](REVIEW-CONSOLIDATION-2026-09-15.md).

Scope at this checkpoint: accumulated portable library and catalog;local candidate
`0.1.7-rc.16-local.24`. Not a release,commit,push or production rollout.
Source working tree is dirty;HEAD alone does not identify this artifact.
Consumer handoff records the packed archive SHA outside the archive.

## One owner per concern

| Concern | Authority at checkpoint |
|---|---|
| Package identity | `beds`;no `@espaco/ui` alias;metadata owns version |
| Visual values | Foundations;transparent content cards,opaque overlays,Inter/Geist,Lucide,fixed contextual radii |
| Runtime API |104 public components;90 declared/provider tokens;inventory is not accessibility certification |
| Canonical docs |This directory;build generates portable `packages/beds/docs`;never edit both |
| Better routing |Interface quality;seven skill entrypoints,not a runtime service or automatic skill installer |
| Distribution |Local immutable tarball for this handoff;RC15 release records remain historical |
| Product behavior |Curriculol;library does not implement auth,queues,billing,uploads or AI |

## Consolidated families

Existing shell/fields/data patterns retained. Candidate includes application
cards and segmented ATS/FIT meters;OTP;paged and continuous carousels;toasts;
conversation and guided Lucy attachments;search dialog;drawer;feature and empty
cards;questions/approvals;pricing;records/disclosures;onboarding;account credits;
forum avatar cards. All are public exports,documented and catalogued.
Distinct carousel APIs are intentional:manual paged navigation versus the
owner-requested continuously looping Home. Neither replaces the other.

## Better review

Read local `~/.codex/skills/better-interface/SKILL.md` and all six owner
entrypoints;supporting contrast,focus/keyboard,spacing/adaptivity and surfaces
references. `frontend-design` and `ui-skills-root` informed scope selection.
No new aesthetic direction. Context7 unavailable in this session;changes use
existing local React/CSS APIs and contracts,no new dependency integration.

| Domain | Finding and action | Evidence |
|---|---|---|
| Accessibility |Copy live region stays mounted;inset focus ring no longer clips;recovery retained |MCP clipboard failure/retry/focus regression;keyboard/state suites |
| Layout |Disclosure example bypassed public shell with a264px local grid;replaced with AppShell/mobile navigation |Disclosure desktop/mobile tests;consumer guard audits20 roots/21 files |
| Writing |MCP copy feedback was English;added caller-owned CodeSnippetMessages and PT-BR fixture;English defaults preserved |Portuguese success/error/retry plus default-copy checks |
| Typography |MCP heading contradicted15/24px contract;scoped correction. Sidebar metadata−.1 disagreed with rendered−.15;metadata corrected only |Light/dark measured heading assertions;sidebar unchanged |
| Colors |Copy recovery prose uses primary text instead of semantic red;explicit recovery words retained |Light/dark renders;existing semantic contrast suites |
| UI |No arbitrary radius/palette changes. Public shell replaces local example styling;catalog routing flattened |Shared component checks and responsive renders |

## Verification and remaining work

Focused changed suites:34 passed,desktop/mobile. Final static/browser/artifact
results belong to [Validation](VALIDATION.md). Consumer coverage previously
listed four roots:now every catalog `*Page.tsx`/`*Examples.tsx` plus the package
example is discovered automatically;documentation-only Catalog chrome remains
outside that guard,not exempted from visual review.

Earlier MCP/Profile product-preview findings are not erased by this package
review. Host callback validation,revocation confirmation,route focus and profile
incorporation truthfulness belong to that preview,not CodeSnippet. The
[prior review](REVIEW-MCP-PROFILE-2026-09-15.md) remains open except where a
subsequent host-specific verification explicitly resolves an item.

Limits:Chromium simulation is not physical touch/native screen-reader approval;
CSS zoom is not full browser/OS magnification. Dense legacy control targets and
continuous-carousel pause discoverability remain documented tensions in States
and Interface quality. No universal WCAG or aesthetic approval. Independent
review and product-integration acceptance remain PENDING.
