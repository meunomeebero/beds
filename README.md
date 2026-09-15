# BEDS — Bero's Design System

Portable React19 SaaS UI. Two fixed themes, one brand color, constrained public
components and versioned design contracts. Package and import name: **beds**.
No Curriculol runtime, API, database or business logic.

UI agents must automatically use the seven Better skills before design/code
decisions and before handoff; no explicit user invocation needed. Read
[Interface quality](docs/design/espaco-library/INTERFACE-QUALITY.md) and install
its routing in each consuming UI scope's `AGENTS.md`. The protocol is mandatory;
it is not an automatic skill installer or a guarantee of visual approval.

## Develop

Node22+; npm workspace with a committed lockfile.

```sh
npm ci --ignore-scripts
npm run verify
npm run dev
```

Catalog: `http://127.0.0.1:5283/?view=components&theme=dark`.
Use `?view=lucy`, `?view=mcp`, `?view=feature-card` or `?view=tokens`.
For browser checks, install Chromium through Playwright, start the catalog and
run `npm run test:browser`. Alternative port: `npm run dev -- --port 5294`;
set `PLAYWRIGHT_BASE_URL=http://127.0.0.1:5294` for matching tests.

## Consume

Install the exact `.tgz` release asset, not this repository's source archive or
a mutable branch. The package contains built ESM, declarations, CSS, fonts,
contracts and consumer checks. No lifecycle scripts required.

```sh
bun add beds@https://github.com/meunomeebero/beds/releases/download/v0.1.7-rc.15/beds-0.1.7-rc.15.tgz
```

```tsx
import { DesignSystemProvider, brands, Button } from 'beds';
import 'beds/styles.css';

<DesignSystemProvider theme="dark" brandColor={brands.curriculol}>
  <Button label="Continuar" onClick={continueFlow} />
</DesignSystemProvider>
```

Use the host application's actual theme and callbacks. Do not import
`beds/reset.css` into an existing app implicitly: it resets html/body.
Wrap only explicitly migrated screens; never enclose legacy UI to simulate migration.
[Bun tarball installation](https://bun.sh/guides/install/add-tarball).

## Documentation map

| Contract | Owner |
|---|---|
| [Library map](docs/design/espaco-library/README.md) | Routing and boundaries |
| [Foundations](docs/design/espaco-library/FOUNDATIONS.md) | Approved visual values |
| [Components](docs/design/espaco-library/COMPONENTS.md) | Public component anatomy |
| [States](docs/design/espaco-library/STATES.md) | Interaction and accessibility |
| [Consumer contract](docs/design/espaco-library/CONSUMER-CONTRACT.md) | Application composition |
| [Governance](docs/design/espaco-library/GOVERNANCE.md) | Change and acceptance gates |
| [Interface quality](docs/design/espaco-library/INTERFACE-QUALITY.md) | Better skill routing |
| [MCP/Profile review, 2026-09-15](docs/design/espaco-library/REVIEW-MCP-PROFILE-2026-09-15.md) | Six-domain preview audit; unresolved findings, not release approval |
| [Artifact validation](docs/design/espaco-library/ARTIFACT-VALIDATION.md) | Build/pack/import parity |
| [Validation](docs/design/espaco-library/VALIDATION.md) | Snapshot-specific results |
| [Documentation audit](docs/design/espaco-library/DOCUMENTATION-AUDIT.md) | Conflict review and limitations |
| [Data patterns](docs/design/espaco-library/DATA-PATTERNS.md) | Reusable data surfaces |
| [Lucy composition](docs/design/espaco-library/LUCY-COMPOSITION.md) | Synthetic chat/sidebar example |
| [MCP composition](docs/design/espaco-library/MCP-COMPOSITION.md) | Synthetic integration example |
| [Provenance](docs/design/espaco-library/PROVENANCE.md) | Source vs adaptation |
| [Reference measurements](docs/design/espaco-library/REFERENCE-MEASUREMENTS.md) | Historical evidence, not current overrides |
| [Release workflow](RELEASING.md) | Immutable distribution and rollback |
| [Third-party notices](THIRD-PARTY-NOTICES.md) | Fonts, icons and reference assets |

Candidate releases are not a claim of universal accessibility or final aesthetic
approval. Existing recorded review limitations remain; extraction does not erase them.
