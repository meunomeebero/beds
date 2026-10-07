# External component sourcing — beUI first

Scope: any component work in BEDS — missing pattern or replacement of an existing one. Order → beUI (same anatomy) → beUI modified → from scratch. This document does not authorize package installs, new dependencies, Foundations exceptions or aesthetic approval.

## Source of record

| Item | Value |
|---|---|
| Library | beUI — animated React components. Author Saurabh Chauhan; repository `starc007/ui-components` |
| License | MIT. Copy-the-source model; components live in the app, not behind a package |
| Inventory | 85 free components; categories `motion`,`charts`,`agents`,`blocks` |
| MCP | `https://mcp.beui.dev/mcp`, transport http. Tools → `list_components`,`search_components`,`get_component`,`get_install_command` |
| Static endpoints | index `https://beui.dev/r` → item `https://beui.dev/r/{slug}.json` → source `https://beui.dev/r/{slug}/raw` → page `https://beui.dev/components/{category}/{slug}.md` → `https://beui.dev/llms.txt` |
| Optional skill | `npx skills add starc007/ui-components --skill beui`. MCP alone already satisfies the search step |

beUI Pro = paid private registry. No license held here → never fetch, adapt or reproduce Pro blocks or templates.

## Stack alignment (since 2026-09-17)

BEDS is built on the market-standard stack, so beUI source enters with almost no conversion. BEDS keeps its own measurements; only the names follow the shadcn/Tailwind convention.

| beUI ships | BEDS contract | Consequence |
|---|---|---|
| Tailwind utility classes | Tailwind v4 utilities compiled into `dist/styles.css`; consumers never install Tailwind | paste classes as-is |
| shadcn semantic color variables | same names, BEDS values — `--background`,`--primary`,`--muted`,`--destructive`,`--ring`,`--radius`… in `tokens.css` | already mapped; no edit |
| shadcn type scale names | BEDS scale under the same names in `@theme` (`--text-sm:13px/20px`…) | `text-sm` renders BEDS geometry |
| `motion` (Framer Motion) | approved runtime dependency since 2026-09-16 (`motion@^13.4.0`) | import from `motion/react`; BEDS easing `[.16,1,.3,1]`; `useReducedMotion` mandatory |
| `@/lib/utils` `cn` (clsx + tailwind-merge) | `packages/beds/src/lib/utils.ts`, internal only | keep; never exported |
| `lucide-react` | already a declared dependency | keep |
| `@radix-ui/*` primitives | require separate explicit dependency authorization before any addition; this document does not authorize installation | an approved addition must update the manifest/lockfile, `THIRD-PARTY-NOTICES.md`, provenance and affected gates |

## Adaptation rules

- Paste logic, state model, motion and classes intact. Geometry overrides only: swap upstream measurements for BEDS proportions (e.g. `h-11 rounded-full` → `h-9 rounded-lg`). BEDS proportions win by design-owner decision.
- Pasted components always live in `packages/beds/src/` and ship through the package. The Tailwind build scans only that directory (`@source` in `src/tailwind.css`), so utilities referenced by source pasted anywhere else never compile into `dist/styles.css`.
- Delete upstream/legacy component `.css` only after the migrated source is present and checker evidence confirms the replacement; canonical shared BEDS styles and aliases are not removed merely because one component was adapted.
- Public API stays rigid: no `className`,`style`,`tw`,`sx` on exported components (`check-library` FORBIDDEN). Consumers never see Tailwind.
- A component reaching BEDS through this path becomes BEDS-owned: same API, token, state and evidence rules as any primitive.
- Proprietary components (footer, landing, checkout, processing, future SaaS-specific patterns) are built in the same idiom: Tailwind utilities + `motion` + `cn`.

## Workflow

1. Confirm the gap → search [Components](COMPONENTS.md) and [States](STATES.md) first. An existing semantic variant wins.
2. Query beUI through the MCP; fall back to the static endpoints when the MCP is unavailable, and say which was used.
3. Record provenance → slug, source URL, retrieval date. Missing provenance blocks the adaptation.
4. Propose the shared contract per [Governance](GOVERNANCE.md) → public API, states, catalog example.
5. Implement per the adaptation rules above. Layout rhythm resolves through the 4px grid; motion under `prefers-reduced-motion`.
6. Gates → `npm run verify` plus affected browser checks: both themes, desktop and mobile, keyboard, long content, entry/re-entry/recovery.
7. Attribution → row in `THIRD-PARTY-NOTICES.md` with slug, URL, MIT and date.
8. Evidence origin → `A` (local adaptation) with the source recorded, per Governance.
9. Aesthetic approval stays a separate design-owner decision. Upstream polish is not approval and not a gate result.

## Limits

- MIT permits adaptation and requires the notice to survive. Adapting beUI does not relicense BEDS code, and BEDS code is not restated as MIT.
- Upstream quality is unaudited here. Its polish is not an accessibility guarantee; verify locally and report objective failures.
- The seven Better skills keep routing automatically per [Interface quality](INTERFACE-QUALITY.md). This document waives no Governance requirement.
