# beds

Reusable React 19 components and a product-agnostic style guide. Two themes; one caller-owned brand color. Applications own identity and page composition.

## Use

Install an explicitly selected local/package candidate. Read its version from package metadata and evidence from [Validation](docs/VALIDATION.md); source aliases are not package-portability evidence.

Version `0.2.0-rc.3` consolidates the breaking, product-agnostic migration on `main`. It requires a deliberate `brandColor`, ships `beds/manifest.json` for agents and adds `HandDrawnArrow`. Use the immutable archive and SHA-256 from the [release](https://github.com/meunomeebero/beds/releases/tag/v0.2.0-rc.3). Agents start with [Agent quickstart](docs/AGENT-QUICKSTART.md). Follow [Agnostic DS](docs/AGNOSTIC-DS.md) and [API boundaries](docs/API-BOUNDARIES.md). Do not upgrade existing consumers implicitly. Historical 0.1 releases expose a different API.

```tsx
import { DesignSystemProvider, Text } from 'beds';
import 'beds/styles.css';

<DesignSystemProvider theme="dark" brandColor="#5470c6">
  <main className="app-layout">
    <Text>Your application content</Text>
  </main>
</DesignSystemProvider>
```

- Theme is controlled. Brand accepts one six-digit hex value; foreground is derived internally.
- `styles.css` owns component styling and licensed fonts; `reset.css` is the fixed full-page reset.
- Import `reset.css` only in an isolated full-page preview;not implicitly into an existing application.
- Apps may use semantic HTML, layout CSS, icons and their own identity assets. `app-layout` above is an app-owned class, not a BEDS preset.
- BEDS components expose semantic variants, not public `className`/`style` escape hatches. Read tokens without overriding private `.es-*` selectors or redefining `--es-*` properties.
- Full pages and product-specific compositions belong in the app. Optional catalog recipes are editable examples, not runtime exports or mandatory layouts.
- Callers own content, data, routing, persistence and recovery. No AI, billing, account or router dependency.
- React/ReactDOM are peers. TypeScript 5.9+ supports declarations and checks. Native Dialog/Popover required; tested engine scope is recorded, not presumed universal.

## What belongs in BEDS

Promote only components with one clear responsibility and credible reuse across
distinct products—not every UI created while building an app. Record at least
two unrelated product uses before proposing a shared API. Repetition within one
app, a generic name or moving CSS into the package is not sufficient evidence.
Keep logos, page compositions and business flows in their owning app. When reuse
is unclear, keep the implementation local until the shared need is demonstrated.
Follow [component admission](docs/GOVERNANCE.md#component-admission).

## Rules and checks

[Documentation map](docs/README.md) · [Consumer contract](docs/CONSUMER-CONTRACT.md) · [Governance](docs/GOVERNANCE.md) · [Package rules](AGENTS.md)

The package includes source, declarations, fonts/licenses, portable documentation, evidence and audit scripts. For every BEDS UI task, agents must automatically use `better-interface` and its six owners before design/code decisions and before handoff,without waiting for a user invocation. Better skills are installed separately; [Interface quality](docs/INTERFACE-QUALITY.md) pins their source and supplies the required consumer `AGENTS.md` routing. No automatic background auditor or skill installation is implied.

The [marc-lou-landing-page skill](skills/marc-lou-landing-page/SKILL.md) is bundled
with its references and agent metadata. It adds a landing-specific product/copy
lens, not a new visual system or a conversion guarantee. Follow
[Landing-page routing](docs/LANDING-PAGE-SKILL.md) for automatic consumer use and
optional native discovery. Added after RC16; the published RC16 archive above
does not include this source addition. No global installation or auto-upgrade.

```sh
node node_modules/beds/scripts/check-consumer.mjs src/ui
```

Pass every relevant UI root. The check follows local imports; a passing partial directory says nothing about excluded UI or host CSS.

## Maintain

From this package directory:

```sh
npm run build
npm run check
npm run check:docs
npm run test:guards
npm run check:artifact
```

Edit repository canonical docs, never the generated mirror. Build emits ESM, declarations, styles and portable docs. The docs check includes untracked files; artifact validation rebuilds and tests an unpacked consumer. Standalone consumers can run the shipped `scripts/check-docs.mjs` against explicit document paths, without the source repository.

[Foundations](docs/FOUNDATIONS.md) owns component/style guidance; [Components](docs/COMPONENTS.md) describes reusable APIs. Apps decide page hierarchy and composition. Fonts: official Inter 4.1 and Geist Mono; source revisions and OFL notices in [Provenance](docs/PROVENANCE.md). Product identity is supplied by callers, never embedded in the runtime.
