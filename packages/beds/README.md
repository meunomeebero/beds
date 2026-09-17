# beds

A constrained personal SaaS UI library. React 19. Two fixed themes; one configurable brand color.

## Use

Install an explicitly selected local/package candidate. Read its version from package metadata and evidence from [Validation](docs/VALIDATION.md); source aliases are not package-portability evidence.

Exact RC16 prerelease archive:
`bun add beds@https://github.com/meunomeebero/beds/releases/download/v0.1.7-rc.16/beds-0.1.7-rc.16.tgz --ignore-scripts` or
`npm install https://github.com/meunomeebero/beds/releases/download/v0.1.7-rc.16/beds-0.1.7-rc.16.tgz --ignore-scripts`.
These install a GitHub prerelease,not an npm registry release or production approval.

```tsx
import { DesignSystemProvider, brands, Text } from 'beds';
import 'beds/styles.css';

<DesignSystemProvider theme="dark" brandColor={brands.curriculol}>
  <Text>Personal SaaS</Text>
</DesignSystemProvider>
```

- Theme is controlled. Brand accepts one six-digit hex value; foreground is derived internally.
- `styles.css` owns component styling and licensed fonts; `reset.css` is the fixed full-page reset.
- Import `reset.css` only in an isolated full-page preview;not implicitly into an existing application.
- No consumer className, style, arbitrary geometry, font, color or token override.
- Callers own content, data, routing, persistence and recovery. No AI, billing, account or router dependency.
- React/ReactDOM are peers. TypeScript 5.9+ supports declarations and checks. Native Dialog/Popover required; tested engine scope is recorded, not presumed universal.

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

[Foundations](docs/FOUNDATIONS.md) owns current design values; [Components](docs/COMPONENTS.md) owns intended composition. Fonts: official Inter 4.1 and Geist Mono; source revisions and OFL notices in [Provenance](docs/PROVENANCE.md). Private reference artwork/account data and product business logic are not packaged.
