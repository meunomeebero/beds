# Espaço library — packaged artifact validation

Use this gate before handing off or publishing `@espaco/ui`. A development catalog that aliases package source is not package-portability evidence.

```sh
npm run build
npm run check:docs
npm run check:artifact
```

Run these commands from `packages/espaco-ui`. `check:docs` scans canonical Markdown, package docs, README/AGENTS and relative targets from the filesystem, including untracked files; it also checks canonical index coverage. It does not validate remote URLs, anchor semantics or visual correctness. The artifact gate also checks links inside the extracted package, where repository-only targets cannot hide.

The artifact gate rebuilds a temporary copy and compares generated `dist/` and package docs byte-for-byte with the checked artifact. Only after parity passes does it pack the package, extract it and import `@espaco/ui` from a fresh consumer directory. That consumer must resolve `dist/index.js`, never `/src/`.

| Area | Required result |
|---|---|
| API | Packed `dist/index.js` and declarations exist and expose the current public components. |
| CSS | Packed `styles.css` and `reset.css` exactly match an isolated build. |
| Docs | Every canonical library document is regenerated under package `docs/`. |
| Assets | A canonical document cannot reference an absent lab or evidence asset. The build fails instead of emitting partial docs. |
| Consumer | The unpacked tarball imports without Vite or TypeScript aliases. |

The gate never repairs generated files, upgrades a version or publishes an archive. A failure means artifact validation failed and any consumer smoke after the failed stage is **not run**.

Each handoff record includes source SHA and dirty state, package version and archive SHA-256, exact gate output, browser route/theme/viewport/state, test totals with skipped tests separate, evidence paths and the five delivery statuses in [Governance](GOVERNANCE.md). Historical runs remain historical; no older result substitutes for a fresh run on the current source snapshot.
