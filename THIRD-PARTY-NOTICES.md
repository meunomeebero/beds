# Third-party notices

- Inter4.1: bundled font files and [SIL Open Font License](packages/beds/fonts/OFL.txt).
- Geist Mono: bundled font and [SIL Open Font License](packages/beds/fonts/Geist-OFL.txt).
- Lucide: runtime dependency, its upstream ISC license applies; no copied alternate icon library.
- Better skills: referenced at a pinned MIT-licensed upstream revision in [Interface quality](docs/design/espaco-library/INTERFACE-QUALITY.md). Skill implementations are not silently bundled or installed here.
- Marc Lou landing-page skill: BEDS-authored adaptation of the project's existing paraphrased Marc heuristics; [scope and attribution](packages/beds/skills/marc-lou-landing-page/SKILL.md). Not official or endorsed; no full article text or third-party artwork bundled. Original-post fidelity remains unverified, as documented in the skill.
- beUI (`starc007/ui-components`): MIT-licensed animated React components consulted as the first source for any component work in BEDS. Adopted per [External component sourcing](docs/design/espaco-library/EXTERNAL-COMPONENT-SOURCING.md): logic, state model, motion and Tailwind class strings are pasted intact and become BEDS-owned; only geometry classes are swapped for BEDS proportions. No runtime import of beUI; beUI Pro blocks are unlicensed here and excluded. Each adopted component records slug, source URL and retrieval date in this file.
  - `AnimatedNumber` ← beUI `number`, `https://beui.dev/r/number/raw`, retrieved 2026-09-16, MIT. Upstream Tailwind classes, `cn` helper and easing module dropped; motion intent re-expressed with BEDS easing and tokens.
  - Text field focus ring and error nudge ← beUI `input`, `https://beui.dev/r/input/raw`, retrieved 2026-09-16, MIT. Only the state intent was adopted (soft focus ring instead of a detached outline, one nudge on a new error, settled error message). Upstream pill geometry, 44px height, Tailwind `ring-*` classes, imperative `motion.animate` calls and animated success check were not adopted: BEDS keeps its own field geometry and expresses this in CSS with `--es-focus-ring`/`--es-error-ring`.
- `motion` (Framer Motion), MIT: runtime animation dependency approved by the design owner on 2026-09-16 and declared in `packages/beds/package.json`.
- Tailwind CSS v4, MIT: build-time dependency only. Utilities are compiled into `dist/styles.css`; consumers never install or import Tailwind.
- `clsx` (MIT) and `tailwind-merge` (MIT): runtime dependencies composing the internal `cn` helper (`packages/beds/src/lib/utils.ts`), never exported.
- `embla-carousel-react` (MIT): runtime dependency behind the paged carousel primitive.
- `input-otp` (MIT): runtime dependency behind the OTP input primitive.
- Reference screenshots, marks and third-party product names document design research; their rights remain with their owners. They are not a grant to use those brands in consumer products.

No new open-source license is assigned to project-owned code by this extraction.
Public visibility and GitHub download availability are not a relicensing decision.
