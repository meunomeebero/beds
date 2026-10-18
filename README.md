# BEDS — Bero's Design System

Reusable React 19 components and a product-agnostic style guide. Two fixed themes,
one caller-owned brand color, semantic variants instead of style props. Package and
import name: **beds**.

The visual defaults are the patterns proven in Curriculol, the reference product:
pill buttons (md 40px, sm 32px), text fields with a soft border and a soft focus
ring instead of a hard outline, one proportional tab pill, outline calls to action
and quiet removable chips. BEDS ships components and guidance; each app owns its
identity, page layout and business logic.

## Install

BEDS is distributed as an immutable `.tgz` attached to a GitHub prerelease, not
through the npm registry. Pin the exact release asset and check its SHA-256
(listed in the release notes):

```sh
npm install https://github.com/meunomeebero/beds/releases/download/<tag>/<asset>.tgz
# or: bun add https://github.com/meunomeebero/beds/releases/download/<tag>/<asset>.tgz
```

Never install from a mutable branch. React and ReactDOM 19 are peer dependencies.
[Releases](https://github.com/meunomeebero/beds/releases) ·
[Release workflow](RELEASING.md) ·
[Bun tarball installation](https://bun.sh/guides/install/add-tarball)

## Use

```tsx
import { useState } from 'react';
import { Button, DesignSystemProvider, Stack, TextField } from 'beds';
import 'beds/styles.css';

export function App() {
  const [name, setName] = useState('');
  return <DesignSystemProvider theme="light" brandColor="#5470c6">
    <main className="app-page">
      <Stack>
        <TextField label="Project name" value={name} onChange={setName} />
        <Button label="Continue" variant="outline" icon="ArrowRight" iconPosition="end" onClick={() => undefined} />
      </Stack>
    </main>
  </DesignSystemProvider>;
}
```

- `brandColor` is required: one deliberate six-digit hex contrast color, used on
  selected marks, progress and small identity accents, never on button fills.
- `theme` is controlled (`light` or `dark`); pass `onThemeChange` to let
  `ThemeToggle` and `AccountMenu` change it.
- `beds/styles.css` owns component styles and the bundled fonts. Import
  `beds/reset.css` only in an isolated full-page app; it resets `html` and `body`.
- `app-page` above is an app-owned class. Apps compose BEDS components with their
  own semantic HTML and layout CSS.

Agents: start with the [Agent quickstart](docs/design/espaco-library/AGENT-QUICKSTART.md)
and query `beds/manifest.json` for the exact props instead of guessing.

## Principles

1. **Components, not pages.** BEDS owns controls, interaction states, tokens and
   motion. Page hierarchy, widths, navigation and copy belong to the app; follow the
   [proportions](docs/design/espaco-library/FOUNDATIONS.md#proportions--the-curriculol-finish)
   for the values that make screens feel finished.
2. **No style escape hatches.** Components expose semantic variants, not `className`
   or `style`. Apps read `--es-*` tokens but never target `.es-*` selectors or
   redefine tokens. `scripts/check-consumer.mjs` enforces this.
3. **One geometry.** Buttons, fields, tabs and chips share one set of heights and
   radii, so a screen built from BEDS lines up without app overrides.
4. **beUI first.** New components start from the matching
   [beUI](https://beui.dev) source, ported and attributed, before anything is built
   from scratch.
5. **Truthful and accessible by default.** Visible labels, keyboard paths, focus
   recovery and a reduced-motion path for every animation; components never invent
   success, numbers or data.
6. **Promote only what two products need.** A pattern enters BEDS after it has one
   clear job and credible use in unrelated products
   ([component admission](docs/design/espaco-library/GOVERNANCE.md#component-admission)).

## Develop

Node 22+, npm workspaces, committed lockfile.

```sh
npm ci --ignore-scripts
npm run verify        # build, typecheck, library/docs/consumer guards, tests, artifact parity
npm run dev           # catalog at http://127.0.0.1:5283/?view=components&theme=light
```

The catalog renders every component with synthetic data in both themes
(`&theme=dark`, `&fieldBorder=strong` for the opt-in outline). Other `?view=` pages
are editable example recipes, not exports. Browser checks: install Chromium through
Playwright, start the catalog and run `npm run test:browser`; for another port use
`npm run dev -- --port 5294` with `PLAYWRIGHT_BASE_URL=http://127.0.0.1:5294`.

## Documentation

| Read | For |
|---|---|
| [Library map](docs/design/espaco-library/README.md) | Every canonical contract and where it lives |
| [Agent quickstart](docs/design/espaco-library/AGENT-QUICKSTART.md) | Shortest correct path for coding agents |
| [Foundations](docs/design/espaco-library/FOUNDATIONS.md) | Color, type, spacing, proportions and motion |
| [Components](docs/design/espaco-library/COMPONENTS.md) | Public component contracts |
| [States](docs/design/espaco-library/STATES.md) | Interaction, focus and motion contracts |
| [Consumer contract](docs/design/espaco-library/CONSUMER-CONTRACT.md) | What apps own and what the guard checks |
| [Interface quality](docs/design/espaco-library/INTERFACE-QUALITY.md) | Required review skills for UI work |
| [Governance](docs/design/espaco-library/GOVERNANCE.md) | Change, admission and acceptance rules |
| [Release workflow](RELEASING.md) | Immutable releases and rollback |
| [Package usage](packages/beds/README.md) | The README shipped inside the package |
| [Third-party notices](THIRD-PARTY-NOTICES.md) | Fonts, icons and adapted beUI sources |

Releases are candidates: passing checks is not a claim of universal accessibility
or final aesthetic approval. Recorded review limits stay in the
[validation record](docs/design/espaco-library/VALIDATION.md).
