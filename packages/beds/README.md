# beds

Reusable React 19 components and a product-agnostic style guide: two themes, one
caller-owned brand color, semantic variants instead of style props. The defaults
follow the patterns proven in Curriculol: pill buttons (md 40px, sm 32px), soft
text fields with a soft focus ring, one 40px tab pill and outline calls to action.
Applications own identity, page layout and business logic.

## Install

Install the immutable `.tgz` from a GitHub release of
[meunomeebero/beds](https://github.com/meunomeebero/beds/releases) and check its
SHA-256. Never depend on a mutable source branch; upgrade consumers explicitly.

## Use

```tsx
import { DesignSystemProvider, Text } from 'beds';
import 'beds/styles.css';

<DesignSystemProvider theme="dark" brandColor="#5470c6">
  <main className="app-layout">
    <Text>Your application content</Text>
  </main>
</DesignSystemProvider>
```

- `theme` is controlled; `brandColor` is one required six-digit hex value and the
  provider derives its foreground. `fieldBorder` defaults to `soft`; pass `strong`
  only when text fields need the 3:1 outline.
- `styles.css` owns component styles and licensed fonts. Import `reset.css` only in
  an isolated full-page app, never implicitly into an existing one.
- `app-layout` is an app-owned class. Apps use their own semantic HTML, layout CSS,
  icons and identity assets around BEDS components.
- Components expose semantic variants, not `className`/`style`. Read `--es-*`
  tokens; do not target `.es-*` selectors or redefine tokens.
- Callers own content, data, routing, persistence and recovery. No AI, billing,
  account or router dependency.
- React/ReactDOM 19 are peers; TypeScript 5.9+ for declarations. Native Dialog and
  Popover are required.

Agents start with the [Agent quickstart](docs/AGENT-QUICKSTART.md) and look up
exact props in `beds/manifest.json`.

## Check a consumer

```sh
node node_modules/beds/scripts/check-consumer.mjs src/ui
```

Pass every UI root. The check follows local imports; a passing partial directory
says nothing about excluded UI or host CSS, and it is not visual review.

## Rules

[Documentation map](docs/README.md) · [Foundations](docs/FOUNDATIONS.md) ·
[Components](docs/COMPONENTS.md) · [Consumer contract](docs/CONSUMER-CONTRACT.md) ·
[Governance](docs/GOVERNANCE.md) · [Package rules](AGENTS.md)

UI work in a consumer routes `better-interface` and its six domain skills before
design and code decisions ([Interface quality](docs/INTERFACE-QUALITY.md)); the
skills are installed separately. Landing work can also use the bundled
[marc-lou-landing-page skill](skills/marc-lou-landing-page/SKILL.md)
([routing](docs/LANDING-PAGE-SKILL.md)).

Promote a component into BEDS only when it has one clear job and credible use in
unrelated products ([component admission](docs/GOVERNANCE.md#component-admission)).

## Maintain

From this package directory:

```sh
npm run build
npm run check
npm run check:docs
npm run test:guards
npm run check:artifact
```

Edit the repository's canonical docs, never the generated `docs/` mirror. The build
emits ESM, declarations, styles, `manifest.json` and the portable docs. Fonts are
Inter 4.1, Geist Mono and Caveat under the OFL; provenance is in
[Provenance](docs/PROVENANCE.md).
