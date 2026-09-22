# Agent quickstart

The shortest correct path through BEDS for a coding agent. Read this first, then open
only the canonical docs for the components you use. The rest of the library map is
reference and history.

## 1. Look up the API instead of guessing it

After `npm run build` (or inside an installed package), `beds/manifest.json` lists
every public component with its props: `required`, the declared `type`, allowed
literal `values`, object `fields` (for example `SegmentedControl.options` is
`{ id, label, disabled? }`, not `{ value }`), a one-line summary and the canonical
`doc`. It also lists every token you may read.

```sh
node -e "const m=require('beds/manifest.json');console.log(JSON.stringify(m.components.find(c=>c.name==='Select'),null,1))"
```

If a prop or value is not in the manifest, it does not exist. Do not add
`className`, `style`, spreads or wrapper CSS to change a BEDS component.

## 2. Five rules that most often fail review

1. **Choose a contrast color.** `DesignSystemProvider` needs `theme` and a
   deliberate `brandColor`; there is no default. Pick it from the feeling the
   product should give its customers and record the reason in the product's
   `AGENTS.md` ([Foundations](FOUNDATIONS.md#contrast-color--mandatory-choice)).
2. **Split ownership.** BEDS owns controls, tokens and behavior. The app owns page
   composition, spacing between sections, identity and business rules, using its
   own class names. App CSS may read `var(--es-*)` tokens but never targets
   `.es-*` selectors or declares `--es-*` properties.
3. **Reuse, then beUI, then build.** Check the manifest, then search beUI
   (`https://mcp.beui.dev/mcp` or `https://beui.dev/r/<slug>.json`). Build from
   scratch only when nothing fits, and record the search and any adapted slug.
   Product compositions stay in the app; see [Promotion candidates](PROMOTION-CANDIDATES.md).
4. **Every motion has a reduced-motion path**, and it must render the same markup
   on the server and the client. Inside BEDS use `useReducedMotionPreference`,
   never motion's `useReducedMotion` (it is `null` on the server).
5. **Look at it.** Check desktop and 320px, light and dark, keyboard focus and
   reduced motion in a real browser. Passing checks are not visual review.

## 3. Verify

In a consumer app:

```sh
node node_modules/beds/scripts/check-consumer.mjs <every UI root and new component file>
```

Then run the app's typecheck, lint, tests and build. In this repository,
`npm run verify` runs every gate, including the manifest test.

## 4. Where to go next

| Need | Read |
|---|---|
| Consumer boundaries and enforced checks | [Consumer contract](CONSUMER-CONTRACT.md) |
| Color, typography, spacing, motion | [Foundations](FOUNDATIONS.md) |
| Review checklist | [Interface quality](INTERFACE-QUALITY.md) |
| One component in depth | the `doc` field in the manifest |
| Adding to BEDS | [Promotion candidates](PROMOTION-CANDIDATES.md) and the repository `AGENTS.md` |
