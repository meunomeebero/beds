# Espaço — interface quality skills

Use when: building or reviewing an Espaço component or consuming screen.
Do not use when: backend-only work, unrelated copy, or historical evidence retrieval.
Read next: [Governance](GOVERNANCE.md), then the automatic routing below and all seven skill entrypoints for UI work.

## Source and installation

User decision,2026-09-14: replace the standalone `make-interfaces-feel-better` skill with the seven-skill Better suite. Old mentions in provenance remain historical,not active routing.

Source: [jakubkrehel/skills](https://github.com/jakubkrehel/skills/tree/267330e1adfc66a718fb65fa6918c1f06d0a689e).
Pinned revision:`267330e1adfc66a718fb65fa6918c1f06d0a689e`;MIT;retain copyright/license when copying.

| Skill | Ownership |
|---|---|
| [`better-interface` SKILL.md](https://github.com/jakubkrehel/skills/blob/267330e1adfc66a718fb65fa6918c1f06d0a689e/skills/better-interface/SKILL.md) | Complete screen/flow review;consolidates six domain reviews |
| [`better-accessibility` SKILL.md](https://github.com/jakubkrehel/skills/blob/267330e1adfc66a718fb65fa6918c1f06d0a689e/skills/better-accessibility/SKILL.md) | Semantics,keyboard,focus,assistive technology,motion,zoom |
| [`better-layout` SKILL.md](https://github.com/jakubkrehel/skills/blob/267330e1adfc66a718fb65fa6918c1f06d0a689e/skills/better-layout/SKILL.md) | Grouping,alignment,reading order,adaptivity,long/localized content |
| [`better-writing` SKILL.md](https://github.com/jakubkrehel/skills/blob/267330e1adfc66a718fb65fa6918c1f06d0a689e/skills/better-writing/SKILL.md) | UI terminology,action labels,errors,recovery,empty states |
| [`better-typography` SKILL.md](https://github.com/jakubkrehel/skills/blob/267330e1adfc66a718fb65fa6918c1f06d0a689e/skills/better-typography/SKILL.md) | Contextual type hierarchy,wrapping,truncation,font rendering |
| [`better-colors` SKILL.md](https://github.com/jakubkrehel/skills/blob/267330e1adfc66a718fb65fa6918c1f06d0a689e/skills/better-colors/SKILL.md) | Semantic roles and measured contrast in both themes |
| [`better-ui` SKILL.md](https://github.com/jakubkrehel/skills/blob/267330e1adfc66a718fb65fa6918c1f06d0a689e/skills/better-ui/SKILL.md) | Surfaces,radii,icons,optical alignment,interaction polish |

Install each `skills/<name>` directory from that exact revision through the agent's skill installer. Install all seven for a complete review;include referenced Markdown files and metadata. A single orchestrator entrypoint is insufficient.

Skills are authoring/review tools,not browser dependencies. This npm package carries the protocol and source pin,not an automatic installation or running audit service. On another machine,resolve the local skill location and install explicitly;never hardcode Bero's home/worktree paths into a consumer. Updates require a reviewed source revision,not an unpinned reinstall.

## Automatic routing — mandatory for UI

Owner decision,2026-09-15: skill use is automatic agent routing,not optional and not dependent on the user spelling a skill name. Applies to components,composition,forms,navigation,responsive fixes,states and UI copy in the BEDS scope. A small visual change is not an exemption.

1. Resolve the screen/flow,live preview,source and exact consumed package. Read the applicable agent entrypoints and contracts; do not audit a different checkout or candidate accidentally.
2. Before design/code decisions,announce and read `better-interface` plus all six owners in the table above,then their task-relevant references. Apply them in the documented order. Do this even for narrow UI work; keep the inspected surface focused rather than skipping domains.
3. Map entry → transition → success → re-entry → recovery. Preserve approved BEDS tokens/anatomy;record objective conflicts against their owner,not a consumer workaround.
4. Before handoff,review the complete affected screen/flow again across all six domains. Include light/dark,desktop/narrow320px,keyboard,200% zoom and available empty/loading/error/recovery states. Missing fixtures,physical devices or assistive-technology checks remain explicitly unverified.
5. Run affected library,consumer,browser and artifact gates. Inspect the render;read tool output. A passing subset or claimed skill invocation is not review evidence.
6. Record scope/version,skill paths or installed identifiers,per-domain evidence,ranked findings,commands,not-verified checks and the Governance verdict. A previous review cannot approve a new render.

Read each entrypoint completely;reuse it within the current task rather than reloading it for each tiny edit. Load only relevant supporting references. This explicit seven-skill requirement supersedes generic skill-count minimization,not higher-priority user/system instructions.

- Documentation-only/backend maintenance:review affected instructions and links;no fictional six-domain rendered review unless UI is also in scope.
- Source-diff review is a different scope:upstream `interface-review` is optional and user-invoked;not installed by this seven-skill replacement. Do not silently invoke it,resolve a different scope,or claim branch/PR coverage from a screen audit.
- Missing skill:report the missing domain;continue safe in-scope work;do not approve missing coverage or auto-install without authority.
- Do not load the removed polish skill alongside `better-ui`. Existing product/marketing skills remain contextual,not additional mandatory passes.
- Result-to-purchase flows add `revenue-centric-design` when requested or relevant to the conversion decision;resolve the consuming project's skill and read its monetization/conversion references. [Results](RESULTS.md) records the Curriculol pass. Value precedes the offer;preserve free and already-paid access. This is a contextual lens,not a bundled skill,automatic price decision or measured conversion guarantee.
- Checkout adds contextual `form-cro` for conditional fields,clear totals and recovery;[Checkout](CHECKOUT.md) records the scoped Revenue-Centric/Better/Emil pass. Never infer paid status from elapsed time,animation or a URL. Payment and fiscal issuance require separate evidence.
- Landing strategy is a scoped automatic route: [marc-lou-landing-page](LANDING-PAGE-SKILL.md) applies to landing creation and positioning/hero/benefits/proof/offer/CTA review, not every primitive edit. It complements Better; it cannot replace visual/accessibility review, approved DS values or product-owner decisions. The skill is bundled; Better remains separately installed.

### Consumer agent entrypoint

Copy the routing instruction below into the consuming UI directory's `AGENTS.md`,adapting only the installed package location. Importing a package does not make an agent read its nested instructions.

```text
For every BEDS UI task, automatically load and apply better-interface,
better-accessibility, better-layout, better-writing, better-typography,
better-colors and better-ui before design/code decisions and before handoff.
Do not wait for the user to invoke them. Read the complete skill entrypoints
and relevant references. Follow the installed beds/AGENTS.md and
beds/docs/INTERFACE-QUALITY.md; approved BEDS contracts own visuals.
Report per-domain browser/source evidence, findings and unverified checks.
Missing skill or required evidence means pending, never approved.
```

The repository routing regression test checks that author/package/catalog entrypoints keep this instruction and link to the single protocol. It cannot prove an agent read a skill or a screen passed review. No background agent,automatic installation or automatic Git push is implied. Authorized publication must report local vs committed vs pushed vs released state and the consumer's pinned version separately.

## Espaço boundaries

| Concern | Decision |
|---|---|
| Visual authority | Foundations/component contracts own reusable component typography, themes, semantic variants and motion. Apps own page hierarchy, layout geometry, density and identity. Generic taste alone does not justify overriding component internals; documented accessibility or usability failures require review at their source. |
| Objective failures | Report accessibility,contrast,clipping and task failures even when their cause is a shared DS rule. Source fidelity does not certify accessibility. |
| Fix location | Fix component behavior and shared tokens in BEDS. Apps own page-layout CSS, identity and composition; they may read tokens but must not override private BEDS selectors or redeclare its tokens. Follow [Agnostic DS](AGNOSTIC-DS.md). |
| Motion recipes | Exact upstream scale/easing/icon-stroke recipes are candidates for DS review,not automatic replacements for approved values. No global transition kill-switch in consumer code. |
| Product content | Caller owns language, copy and business behavior. Review consistency and recovery; do not invent prices, guarantees, success states or a new brand voice. Historical product examples do not impose their locale or policy on unrelated apps. |
| Authority | A review does not authorize implementation,publishing,merging,external actions,delegation or a product-policy change. |

Known tensions,not automatic waivers:compact editable text/touch targets require contextual measurement;the continuous carousel has no visible toolbar but has interaction/reduced-motion guards and persistent keyboard pause. Better's visible-autoplay-control recommendation differs from this adopted anatomy. Record the concern and inspect mechanism discoverability/input coverage;do not silently restore controls or claim accessibility conformance from a written exception. [WCAG pause mechanism](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).

## Evidence and verdict

[Governance](GOVERNANCE.md) owns delivery statuses. The summary below follows it; this document does not define a second approval threshold. Documentation-only consolidation uses its documentation/tooling gates, not a fictional full screen audit.

1. Run actual library/consumer/artifact gates when affected;record roots and results.
2. Inspect rendered geometry,type,contrast,keyboard,zoom and relevant states;capture evidence. Source reading alone cannot certify appearance or screen-reader behavior.
3. Record each domain as inspected,findings,or not verified. Consolidate shared causes once.
4. Map the upstream verdict to the local delivery states below;do not overwrite visual baselines to obtain a pass.
5. Check the [personality layers](FOUNDATIONS.md#personality-layers--a-correct-screen-is-not-a-finished-screen) on every consuming screen: product voice in headings and empty states, one focal CTA, the contrast color on a few meaningful spots, hierarchy through type and hairlines, one signature motion, a preview instead of an icon tile. A screen that passes every technical check but reads as a gray template is reported as `PASS_WITH_NOTES` with a "generic" finding, not `PASS`.

| Local result | Meaning |
|---|---|
| BLOCK | Confirmed blocker remains |
| PENDING | Required evidence or independent review is missing; no acceptance claim |
| PASS_WITH_NOTES | Required scoped checks completed; disclosed nonblocking findings remain |
| PASS | Scoped technical checks and required review completed without outstanding findings;not aesthetic approval |
| Aesthetic approval | Separate design-owner decision under Governance |

Upstream `Approve` means no HIGH finding remains;it may retain MEDIUM/LOW work. Never translate it into “finished” or “perfect”. Prompts guide judgment;static guards,real browser evidence and owner approval remain separate controls. A written protocol does not prove future agents followed it.
