# Espaço — interface quality skills

Use when: building or reviewing an Espaço component or consuming screen.
Do not use when: backend-only work, unrelated copy, or historical evidence retrieval.
Read next: [Governance](GOVERNANCE.md), then the relevant domain skill.

## Source and installation

User decision,2026-09-14: replace the standalone `make-interfaces-feel-better` skill with the seven-skill Better suite. Old mentions in provenance remain historical,not active routing.

Source: [jakubkrehel/skills](https://github.com/jakubkrehel/skills/tree/267330e1adfc66a718fb65fa6918c1f06d0a689e).
Pinned revision:`267330e1adfc66a718fb65fa6918c1f06d0a689e`;MIT;retain copyright/license when copying.

| Skill | Ownership |
|---|---|
| `better-interface` | Complete screen/flow review;consolidates six domain reviews |
| `better-accessibility` | Semantics,keyboard,focus,assistive technology,motion,zoom |
| `better-layout` | Grouping,alignment,reading order,adaptivity,long/localized content |
| `better-writing` | UI terminology,action labels,errors,recovery,empty states |
| `better-typography` | Contextual type hierarchy,wrapping,truncation,font rendering |
| `better-colors` | Semantic roles and measured contrast in both themes |
| `better-ui` | Surfaces,radii,icons,optical alignment,interaction polish |

Install each `skills/<name>` directory from that exact revision through the agent's skill installer. Install all seven for a complete review;include referenced Markdown files and metadata. A single orchestrator entrypoint is insufficient.

Skills are authoring/review tools,not browser dependencies. This npm package carries the protocol and source pin,not an automatic installation or running audit service. On another machine,resolve the local skill location and install explicitly;never hardcode Bero's home/worktree paths into a consumer. Updates require a reviewed source revision,not an unpinned reinstall.

## Routing and cost

- Documentation-only maintenance:review the affected instructions and links;no six-domain rendered review unless UI changes.
- Implementation/narrow review:load the relevant domain(s) only. Do not call this a complete Better review.
- Before component/screen handoff:review the complete affected surface with `better-interface`,its six owners and relevant references. This complete-review requirement takes precedence over a generic skill-count heuristic;load only relevant references within each owner. Include supported themes,widths and empty/loading/error/recovery states. Excluded surfaces/checks stay explicit.
- Source-diff review is a different scope:upstream `interface-review` is optional and user-invoked;not installed by this seven-skill replacement. Do not silently invoke it,resolve a different scope,or claim branch/PR coverage from a screen audit.
- Missing skill:report the missing domain;continue safe in-scope work;do not approve missing coverage or auto-install without authority.
- Do not load the removed polish skill alongside `better-ui`. Existing product/marketing skills remain contextual,not additional mandatory passes.

## Espaço boundaries

| Concern | Decision |
|---|---|
| Visual authority | Approved Foundations/component contracts own Inter/Geist,two themes,one brand,geometry,density,icons and motion. Generic taste is not authority to replace them. |
| Objective failures | Report accessibility,contrast,clipping and task failures even when their cause is a shared DS rule. Source fidelity does not certify accessibility. |
| Fix location | Propose shared token/component changes through Governance;no consumer CSS,visual prop escape,new palette or font. |
| Motion recipes | Exact upstream scale/easing/icon-stroke recipes are candidates for DS review,not automatic replacements for approved values. No global transition kill-switch in consumer code. |
| Product content | Caller owns copy and business behavior. Review language,consistency and recovery;do not invent prices,guarantees,success states or a new brand voice. Curriculol copy remains PT-BR. |
| Authority | A review does not authorize implementation,publishing,merging,external actions,delegation or a product-policy change. |

Known tensions,not automatic waivers:compact editable text/touch targets require contextual measurement;the continuous carousel has no visible toolbar but has interaction/reduced-motion guards and persistent keyboard pause. Better's visible-autoplay-control recommendation differs from this adopted anatomy. Record the concern and inspect mechanism discoverability/input coverage;do not silently restore controls or claim accessibility conformance from a written exception. [WCAG pause mechanism](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).

## Evidence and verdict

[Governance](GOVERNANCE.md) owns delivery statuses. The summary below follows it; this document does not define a second approval threshold. Documentation-only consolidation uses its documentation/tooling gates, not a fictional full screen audit.

1. Run actual library/consumer/artifact gates when affected;record roots and results.
2. Inspect rendered geometry,type,contrast,keyboard,zoom and relevant states;capture evidence. Source reading alone cannot certify appearance or screen-reader behavior.
3. Record each domain as inspected,findings,or not verified. Consolidate shared causes once.
4. Map the upstream verdict to the local delivery states below;do not overwrite visual baselines to obtain a pass.

| Local result | Meaning |
|---|---|
| BLOCK | Confirmed blocker remains |
| PENDING | Required evidence or independent review is missing; no acceptance claim |
| PASS_WITH_NOTES | Required scoped checks completed; disclosed nonblocking findings remain |
| PASS | Scoped technical checks and required review completed without outstanding findings;not aesthetic approval |
| Aesthetic approval | Separate design-owner decision under Governance |

Upstream `Approve` means no HIGH finding remains;it may retain MEDIUM/LOW work. Never translate it into “finished” or “perfect”. Prompts guide judgment;static guards,real browser evidence and owner approval remain separate controls. A written protocol does not prove future agents followed it.
