# Espaço personal-library catalog

Independent from the legacy5282 Home/Lucy preview.

| Route | Purpose |
|---|---|
|`http://127.0.0.1:5283/?view=chat` |Source-style chat composition |
|`?view=components` |Public components and contextual variants;inventory owned by the package checks |
|`?view=tokens` |Fixed semantic colors,typography and geometry |
|`?view=mcp` |MCP/OAuth setup composition using the same library primitives |
|`&theme=light` / `&theme=dark` |Initial controlled theme |
|`&brand=reference` / `&brand=curriculol` |One-color preset |

From repository root:

```sh
node node_modules/vite/bin/vite.js apps/web/labs/espaco-library --config apps/web/labs/espaco-library/vite.config.ts
node node_modules/typescript/bin/tsc -p apps/web/labs/espaco-library/tsconfig.json
```

From `apps/web`:

```sh
npx playwright test --config labs/espaco-library/playwright.config.ts
```

Package source:`packages/beds`. Docs:[personal library](../../../../docs/design/espaco-library/README.md). Package consumer example is audited without custom CSS. This catalog has documentation-only tables/swatches; those display helpers are not the consumer contract.
