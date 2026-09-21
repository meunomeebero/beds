# MCP composition exercise

Use when: checking how the portable library composes an authenticated MCP setup screen.
Do not use when: registering a real OAuth application, creating credentials or authorizing a client.
Read next: [consumer contract](CONSUMER-CONTRACT.md) → [validation](VALIDATION.md). Product integration requires the consuming application's own current MCP/OAuth contract, outside this portable package.

The screen is a local, product-specific composition. AppShell and PageContentHeader
are optional catalog recipes, not package exports. The app owns page layout,
identity and copy; BEDS owns the reusable controls. Earlier measurements below are
provenance for this example, not universal library requirements.

| Boundary | Contract |
|---|---|
| Preview | `http://127.0.0.1:5283/?view=mcp` |
| Consumer | [McpPage.tsx](../../../apps/web/labs/espaco-library/McpPage.tsx) |
| Library | Current local `beds` source; version and inventory are not pinned by this example. |
| Theme / brand | Controlled light or dark + caller-owned orange `#ffa133`; no named DS brand preset |
| Content authority | Synthetic Curriculol-oriented setup fixture; not a portable OAuth, pricing or permission contract. |
| Visual authority | Current [foundations](FOUNDATIONS.md), [components](COMPONENTS.md), [consumer contract](CONSUMER-CONTRACT.md) and live MCP geometry measurements |
| Forbidden | Actual credential/OAuth/MCP calls, secrets and private BEDS CSS overrides. App layout CSS, native semantics and owned assets are allowed. |

## Composition

| Region | Public primitives or optional recipes | Local behavior |
|---|---|---|
| Shell | `AppShell`, sidebar primitives, `AccountMenu` | Same fixed 264/62px rail and responsive drawer as Lucy |
| Page identity | `PageContentHeader`, `Icon`, `Button` | Source-measured title/subtitle/action header; no breadcrumb bar is added |
| Change policy | `Surface`, `Inline`, `Text`, `SegmentedControl` | One concise panel with a controlled local-only approval choice |
| Client setup | `SectionHeader`, `Tabs`, `CodeSnippet` | `Tabs variant="connection"` owns the card, tab strip and padded content lane; Claude, ChatGPT, Codex, Cursor and generic client panels remain controlled |
| OAuth callback | `TextField`, `Button`, `DataList`, `Notice` | Validates HTTPS or a local loopback callback, then retains the URL only in component state |
| Credential state | `EmptyState`, `Notice` | Shows the pre-credential empty state; its action reports that no credential was created |

## Extracted MCP frame

Historical computed-style inspection at1728×852 measured a784px page-identity header with `48px 32px 16px` inset. Its main wrapper is also784px and uses `16px 32px 32px`; the working content lane is720px. Consecutive main sections are48px apart. These values now live in app recipes. Other consumers should choose their own composition instead of treating these measurements as DS constraints.

The library retains its adopted264px sidebar rather than copying the source sidebar width. Existing desktop24px side/bottom page gutters are documented A adaptations; this revision promotes only the observed16px top inset into the shared shell.

## Extracted connection card

The reference client card is720px wide with16px outer radius. Its tab strip is53px tall:8px inset around a36px,10px-radius tablist that distributes the five client options across the full useful width. The content panel begins after the strip divider and uses `16px 32px 32px` inset. The current `Tabs variant="connection"` owns those values. On a narrow viewport, only the tab strip scrolls horizontally; the panel switches to `16px 16px 24px` and the document itself does not overflow.

The local preview starts on Claude so its first rendered state can be compared with the inspected reference. Client logos in the source are third-party content, not an additional icon or color API in the library.

## Truthful MCP boundary

All actions are local fixtures. The library defines no endpoint, scope, token lifetime, credit reservation or authorization policy. Those belong to the consuming product and must be verified before real integration.

Client/approval choices demonstrate controlled selection only. They cannot bypass consent, permissions or product checks. No token, client secret or real account data belongs in the fixture.

## Flow states

| Entry | Transition | Success / recovery |
|---|---|---|
| Open `?view=mcp` | Choose a client tab or approval policy | Visible selected state; no request |
| Empty redirect field | Add URL | Inline error for unsupported value; accepted callback appears in the local list |
| Callback present | Simulate credential creation | Receipt explicitly says no credential/application was created |
| Narrow viewport | Open navigation | Existing library drawer owns focus, Escape and inert background |

The test fixture uses the documented public endpoint and an `agent_<client-id>` placeholder. It contains no token, client secret or real user data. A green browser test confirms the local composition only; it does not prove real OAuth consent or MCP tool behavior.
