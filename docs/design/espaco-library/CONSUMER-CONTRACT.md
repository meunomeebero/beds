# Espaço library — consumer contract and reuse

Read first: [foundations](FOUNDATIONS.md), [components](COMPONENTS.md), [Interface quality](INTERFACE-QUALITY.md). The application owns behavior and content. The library owns rendered visuals. These are repository/build rules, not a claim that browser CSS is physically impossible to override.

Every consuming UI scope must include the automatic Better routing from Interface quality in its own `AGENTS.md`. Load `better-interface` and all six owners before design/code decisions and review every domain before handoff,without waiting for a user invocation. Installing `beds` alone does not install skills or activate nested package instructions.

Current visuals come from [Foundations](FOUNDATIONS.md), not the old prototype or its measurements. The API exposes controlled theme and one brand color; no palette/density/geometry overrides.

## Allowed configuration

| Input | Contract |
|---|---|
| Provider |`DesignSystemProvider`, imported from `beds` |
| Theme |Required `light` or `dark`; caller state; optional `onThemeChange` callback drives real theme selection |
| Brand |Optional `brandColor`; exactly one six-digit `#RRGGBB`; default `brands.reference`; Curriculol `brands.curriculol` =`#ffa133` |
| Brand foreground |Internally selected fixed black/white for contrast; no caller `onBrand` color |
| Brand preset |Literal, same-file const/preset object, or exported `brands.reference/curriculol`; no arbitrary runtime palette or alpha color |
| Component variants |Fixed semantic enums such as content context, control purpose, neutral/brand emphasis; no arbitrary lengths/colors/fonts |
| Product content |Strings, arrays, values, selected ids, disabled/loading/error state, callbacks, hrefs; no provider/domain requests inside visual primitives |
| Feature image |`FeatureCard.image` accepts owned/licensed image URL,required alt and optional fallback label;artwork is content,not an arbitrary visual JSX slot;caller owns URL authorization/privacy |
| File data |Caller-controlled `File[]`, accepted formats and validation; `FileUploadField` exposes local selection, drop and removal only, with no native `name` or `FormData` participation |
| Icons |Library `IconName`/`Icon`; fixed purpose maps; no external icon import or raw SVG |
| Stylesheet |Public `beds/styles.css` plus fixed `beds/reset.css` for full-page documents; no app-specific stylesheet in audited UI roots |

```tsx
import { useState } from 'react';
import { DesignSystemProvider, ThemeToggle, Text, brands } from 'beds';
import 'beds/styles.css';
import 'beds/reset.css';

export function Example() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  return <DesignSystemProvider
    theme={theme}
    onThemeChange={setTheme}
    brandColor={brands.curriculol}
  >
    <ThemeToggle />
    <Text variant="page-title">Your dashboard</Text>
  </DesignSystemProvider>;
}
```

Theme switching changes fixed semantic theme roles. Brand switching changes only branded emphasis. Functional blue/success/warning/error and neutral hierarchy remain fixed. Do not pass className/style/css/sx, consumer font/density/geometry props, token overrides or replacement native visual elements.

`RadioGroup` uses the supplied selected value and callback, with an optional semantic field name. `FileUploadField` is callback-only local `File[]` selection; consumers assemble their own request/form payload from that controlled value. Uploading bytes, size/type validation, merging files, saving and error recovery belong to the consuming application.

## Enforced gates

From repository root:

```sh
node packages/beds/scripts/check-library.mjs --tokens src/tokens.css
node packages/beds/scripts/check-consumer.mjs path/to/consumer-ui
```

| Gate | Checks | Failure behavior |
|---|---|---|
| Library API |TypeScript public-export types; disallow className/style and visual escape props, unrestricted/index-signature props; provider-only brandColor |File/line/code; nonzero exit |
| Library source |All src TypeScript/CSS; type errors; unsupported JS/preprocessor source rejected |No silent passing empty public API |
| Library tokens |All CSS variable references resolve; noncanonical raw colors/fonts rejected; fixed Inter interface/Geist Mono code roles; canonical stylesheet explicitly configured |Missing CSS/token path fails |
| Consumer scope |Explicit files/directories; JS/TS/JSX/TSX and style files; follows relative dependencies |Missing path, empty scope and unresolved local dependencies fail |
| Consumer visual elements |Native JSX rejected; library imports and audited local compositions allowed |Imported unknown JSX providers fail |
| Consumer escape props |className/style/css/sx/tw/as/asChild and visual props; JSX spreads rejected |Spreads cannot hide escape props |
| Consumer styles |CSS/preprocessor files/imports, styling libraries, CSS token overrides and styling-context color/font literals |Only fixed styles.css/reset.css library exports allowed |
| Consumer icons |Arbitrary icon imports and native SVG rejected |Use library glyph registry |
| Consumer imperative styling |DOM class/style writes, CSSOM construction, manual element cloning/construction, dynamic dependency/code generation |Explicit violation category |
| Brand input |Provider only; validated static six-digit literal/preset or public brands preset |Invalid color/location fails |

The provider's internal validated brand-style write and read-only package token data are trusted library implementation, not consumer exceptions. Font registration belongs to the library. React fragments, StrictMode, Suspense/Profiler wrappers, data arrays, state and ordinary callbacks are allowed. Product strings such as `user#code` are not mistaken for color declarations; color checks apply to styling contexts.

## Gate scope and limits

| Constraint | Required practice |
|---|---|
| Configuration |Commit explicit UI roots in each consuming project's CI; run on every change, not only changed files |
| Local composition |Relative component imports audited transitively; unresolved alias/external JSX implementation not assumed safe |
| Entry wrappers |Use nonvisual React composition; actual renderable leaf components come from `beds` |
| Assets |Do not import source product font/artwork bundles;library owns licensed fonts/audited glyphs;owned/licensed product images may enter documented image props,without custom CSS or raw SVG JSX |
| Exceptions |No consumer allowlist switch; missing component → library specification/API/catalog/test first |
| Failure |Fix the primitive/composition; do not bypass with CSS, casts or an unaudited directory |
| Limits |Static source gate is not a security sandbox; host global CSS, deliberately excluded roots, generated/evaluated code or modified guards can bypass repository policy |
| Honest verification |Passing configured roots proves only the rules scanned in that scope; does not prove every application's rendering is identical |
| Review |Changes to guard scope, package CSS, public API and source adaptations require review; human visual judgment remains separate |

Guard fixtures must include a valid library composition plus invalid native elements, props/spreads, CSS/icon import, theme/brand misuse and missing scope. Execute real desktop/mobile light/dark interaction checks separately; static contract checks do not test focus, overflow or pixel geometry.

## Adoption and migration

| Step | Output |
|---|---|
|1. Add package |Use `beds` workspace/package dependency; preserve React19 peer boundary and Inter/OFL assets |
|2. Choose one brand |Store provider preset; choose controlled initial theme; no copied local token stylesheet |
|3. Compose |Shell, headers, forms, chat and overlays from public primitives; app owns data and route wiring |
|4. Specify gaps |Missing visual pattern → documented library addition; no temporary native styled wrapper |
|5. Configure guard |Explicit consumer UI roots; package contract plus consumer check in CI |
|6. Validate |Both themes, source breakpoint, narrow/short viewport, long copy, keyboard and data recovery |
|7. Migrate incrementally |One composition at a time; old DS and current production not silently replaced |
|8. Publish/reuse |Version package and preserve license/evidence; publishing/deployment is separate authorization |

The portable package does not import Curriculol routes, accounts, scoring thresholds, plan policy, providers or storage. A Curriculol preset supplies only a brand color; the same library can be reused by another SaaS without inheriting product behavior.
