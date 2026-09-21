# BEDS — consumer contract and reuse

Read [Agnostic DS](AGNOSTIC-DS.md), [Foundations](FOUNDATIONS.md),
[Components](COMPONENTS.md) and [Interface quality](INTERFACE-QUALITY.md).
BEDS owns individual components, interaction semantics, tokens and style guidance.
The app owns identity, content, business rules and page composition.

## Required skills

Copy the routing protocol from Interface quality into the consuming project's
applicable `AGENTS.md`. Automatically load and apply `better-interface` and its
six domain owners before design/code decisions; review the affected surface before
handoff. The protocol links the actual `SKILL.md` files. Installing the package
does not install skills or automatically activate its nested instructions.
Report unavailable skills and unverified checks instead of claiming approval.

## Composition boundary

- Use public BEDS components for their reusable interactions.
- Compose pages with app-owned semantic HTML, CSS, breakpoints and layout wrappers.
  Read BEDS tokens for consistent color, spacing and typography.
  Read-only metadata is available from `beds/tokens` (also re-exported by `beds`);
  importing it does not permit redefining the library's CSS tokens.
- Own your logo, illustrations, icons, brand configuration and asset permissions.
  `BrandMark` requires caller-supplied `src` and accessible `label`; no product
  artwork or product brand preset is built into the runtime.
- Do not target private `.es-*` selectors or redefine `--es-*` properties.
  Avoid broad app selectors that accidentally restyle nested BEDS controls.
- BEDS component props remain explicit semantic contracts: no arbitrary
  `className/style/css/sx`, visual overrides or JSX spreads.
  This restriction does not apply to app-owned elements.
- A missing app layout is not automatically a missing library component. Keep it
  local until a single reusable job and unrelated use cases justify extraction.
- Optional catalog recipes are editable examples, not runtime exports or mandatory
  screen designs. Do not copy their product content into the style guide.

## Provider and data

`DesignSystemProvider` accepts a controlled `light` or `dark` theme, an optional
`onThemeChange`, and an optional six-digit `#RRGGBB` brand color.
The default accent remains `#d0f300`; apps own any named presets.
The provider selects a contrasting foreground internally.

```tsx
import { useState } from 'react';
import { DesignSystemProvider, ThemeToggle, Text } from 'beds';
import 'beds/styles.css';

export function Example() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  return <DesignSystemProvider theme={theme} onThemeChange={setTheme}
    brandColor="#3456ab">
    <main>
      <ThemeToggle />
      <Text variant="page-title">Your dashboard</Text>
    </main>
  </DesignSystemProvider>;
}
```

Import `beds/reset.css` only when its document-level reset is appropriate for the
host. The app owns requests, routing, validation, persistence and recovery.
For example, `FileUploadField` exposes controlled local `File[]` selection; it
does not upload bytes or participate in native `FormData` via a field name.
Do not invent successful operations.

## Enforced checks and limits

Run on explicit consumer UI roots:

```sh
node packages/beds/scripts/check-consumer.mjs path/to/consumer-ui
```

| Check | Actual scope |
|---|---|
| Inputs | Missing paths, empty scopes and parse errors fail; relative dependencies are followed |
| BEDS imports | Legacy aliases and private subpaths fail; public component and stylesheet entries are supported |
| BEDS props | Visual escape props and spreads fail; supported spacing enums are checked |
| Brand | Provider-only static six-digit literal or same-file constant/preset is checked |
| App CSS | Native elements, app styles, SVG and external components are allowed; private selectors and token declarations fail |
| Dependencies | Nonliteral dynamic imports fail because their dependencies cannot be audited |

The runtime provider validates its input too. The guard is deliberately bounded:
it does not prove external component accessibility, resolve all alias/re-export
patterns, parse every CSS construction or prevent hostile CSS. A pass is not
evidence of visual quality. Typecheck the app and perform rendered review separately.

Tests must preserve positive app-owned layout/style/asset cases and negative
private overrides, invalid BEDS props, invalid brand and missing-scope cases.
Do not exclude real UI roots just to obtain a pass.

## Adoption and validation

1. Pin an authorized package artifact; preserve React peer compatibility and font licenses.
2. Configure caller-owned identity and theme. Route required skills from the app.
3. Compose a representative screen using components and app-owned layout.
4. Review desktop/mobile, both themes, long content, keyboard, reduced motion and
   loading/empty/error states before extending the design.
5. Add genuinely reusable gaps only after applying the admission rule in Agnostic DS.
6. Upgrade existing apps explicitly, one scope at a time. Publication, integration
   and deployment require separate authorization.

This migration is a breaking candidate, not a released replacement. Consult the
[Agnostic DS ledger](AGNOSTIC-DS.md) for remaining work; existing exports and old
screenshots do not establish product-agnostic or aesthetic acceptance.
