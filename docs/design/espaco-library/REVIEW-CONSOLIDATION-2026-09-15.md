# Consolidated Better review — September15

Scope: portable BEDS plus its catalog;all accumulated component families.
Detailed rendered review: shared shell,fields,settings,toast recovery.
Broad regression scope: entire catalog,desktop/mobile Chromium. This is not a
manual pixel-by-pixel approval of all113 components or the Curriculol backend.

Skills read and applied: `better-interface`, `better-accessibility`,
`better-layout`, `better-writing`, `better-typography`, `better-colors`,
`better-ui`;relevant contrast,keyboard/forms,motion/zoom,adaptivity,wrapping and
surfaces references. `ui-skills-root` selected context. Context7 unavailable;
existing local React/CSS contracts used,no new dependency API. Emil findings
are separately recorded in [Motion opportunities](MOTION-OPPORTUNITIES-2026-09-15.md).

## Ranked findings and shared corrections

| Severity | Domain | Location | Finding → change | Evidence |
|---|---|---|---|---|
| HIGH | Accessibility / colors | `tokens.css:24`, `controls.css:18` | Field boundaries/off switches below3:1 → separate control-boundary semantic role;decorative card hairlines unchanged | Rendered light/dark contrast assertions,settings screenshots |
| HIGH | Layout / UI | `layout.css:4` | Crowded collapsed rail shrank header while children overflowed;MCP icon intercepted Expand → header and sections do not flex-shrink;sidebar owns scrolling | Baseline2 failures;real click regression at600px height plus complete shell suite |
| HIGH | Accessibility / writing | `toast.tsx:47`, `toast.css:11` | Errors/actions expired;five-item cap discarded recovery;copy ellipsized → explicit close,persistent critical/action notices,scrollable queue,wrapped copy | Virtual-clock expiry/persistence,7 notices,recovery and focus-return regression |
| HIGH | Colors | `controls.css:26`, `chat.css:17` | Error prose4.21:1 light/4.18:1 dark → separate error-text role,not marker red | Rendered invalid settings form,text≥4.5:1 |
| MEDIUM | Accessibility | `layout.tsx:65` | Repeated navigation lacked bypass → first-focus skip link and focusable main;inert during mobile modal | Keyboard entry and focus assertions,both projects/themes |
| MEDIUM | Typography | `controls.css:44`, `form-fields.css:37` | Multiline switch labels used13px leading;compact filenames clipped →20px switch leading and wrapping file names | Existing narrow/long upload and settings cases |
| LOW | Documentation | `CONSOLIDATION-2026-09-15.md:3` | Older104-component local snapshot read as current → explicit historical checkpoint;current counts/results have one owner | Docs and generated-artifact gates |

## Six-domain disposition

Accessibility: shared recovery,keyboard and contrast corrected;physical devices
and native screen-reader speech unverified. Layout: responsive shell/controls,
catalog overflow and long-content regressions checked. Writing: existing PT-BR
labels retained;duplicate settings helper removed while its complete error is
shown;demo outcomes remain explicitly simulated. Typography: no font
or global scale change;only line wrapping/leading corrections. Colors: two
new named roles,92 tokens total;approved neutral/card palette preserved.
UI: same radii/anatomy;no global effects or consumer style escapes.

Exact final results and publication state belong to [Validation](VALIDATION.md).
Baseline:272 passed,2 failed,6 intentionally skipped. Failures were retained
as evidence of the collapsed-header defect,not reclassified as flakiness.
Toast clock regression also caught stale hover after closing the last notice;
empty queues now reset interaction pause state before the next notification.

Evidence:[quality regressions](../../../apps/web/labs/espaco-library/interface-quality.spec.ts),
[light desktop](../../../apps/web/labs/espaco-library/evidence/settings/quality-light-desktop.png),
[dark mobile](../../../apps/web/labs/espaco-library/evidence/settings/quality-dark-mobile.png).

## Limits / disposition

Independent review and owner aesthetic acceptance PENDING;no delegated or
fictional approval. Scoped technical results do not imply universal WCAG
conformance. Existing compact target density and continuous-carousel visible
pause tension remain in [Interface quality](INTERFACE-QUALITY.md).
The [MCP/Profile host review](REVIEW-MCP-PROFILE-2026-09-15.md) is still a separate
consumer backlog;this package cannot certify callback/revocation/product
truthfulness fixes without a host-specific run. No production rollout implied.
