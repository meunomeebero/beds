# MCP and Profile — Better review, 2026-09-15

## Scope and coverage

Current rendered screens,not a branch/diff review. React19,public BEDS primitives,semantic styles. Contracts: Foundations,Components,States,Consumer contract,Governance,Interface quality. No consumer CSS/visual overrides added. No production requests,OAuth,credentials,profile data or credit spending tested. All interactions used isolated fixtures.

| Snapshot | Identity |
|---|---|
| Preview | `http://127.0.0.1:5292/`; enter MCP/Perfil from sidebar; `scenario=profile-ready` |
| Consumer root | Curriculol worktree `7db9`, `apps/web/labs/home-rcd/`; detached base `d5a0a02096b049bf140d8550e5e05671adfe3bd5` plus local changes |
| Installed package,verified from metadata | `beds@0.1.7-rc.16-local.5` |
| Consumed archive SHA256 | `253e627381e7f2577e5bebe8aba79df1ac13d42e5c04bed797ebd2523358d48b` |
| Consumer shell SHA256 | `bc9f43e492eea317abfae09cd5eb11fe5dfdfe8d895c35cf8e9eeea4ceaec048` |
| MCP source SHA256 | `fb1786f3aabf1ce233e0e395d6982780bd1904386a9050a4461b4316054599ee` |
| Profile source SHA256 | `acd93f220a5916c9c9920fcb7c8ec8f2970f43d38b36f7317c4a920b93c34a72` |
| Separate BEDS checkout | Base `6b4a47c069bb4c52fd0aca4c9dcdbb9a3f1c4ce7`,branch `codex/design-system-bootstrap`,dirty candidate `0.1.7-rc.16-local.4`; not the preview's installed artifact |

Used installed skill entrypoints `better-interface`, `better-accessibility`, `better-layout`, `better-writing`, `better-typography`, `better-colors`, `better-ui`; each `SKILL.md` read fully. Relevant references: review format; semantics/ARIA,focus/keyboard,forms,screen readers,motion/zoom,hit areas; grouping/alignment,spacing/adaptivity; typography details/wrapping; contrast; surfaces/icons. Interface quality owns the suite source pin and conflict precedence. Vercel Web Interface Guidelines was supplemental; no competing visual defaults adopted.

| Domain | Evidence inspected | Result |
|---|---|---|
| Accessibility | Labels,headings,tab semantics,ArrowRight focus,drawer Escape/return,disclosure Enter,profile entry/re-entry,error recovery,MCP validation/revocation | Findings F1–F3; native assistive technology pending |
| Layout | Both screens,light/dark,1440/390/320px; long fixture copy,credential section,notes; source grouping and transparent panels | Clear in inspected layouts; no page-wide horizontal overflow |
| Writing | Labels,instructions,simulation disclosure,empty/error/success copy and actual note action | F4–F5; no product policy inferred |
| Typography | Hierarchy,wrapping,disclosures,320px reading,200% CSS-zoom proxy | Clear in sampled render; 13px inputs remain an existing mobile-autozoom tension,not silently overridden |
| Colors | Computed plain foreground/background pairs in each sampled state; disabled text excluded | Sampled minimum 4.65:1 light / 5.18:1 dark; not universal contrast certification |
| UI polish | Panel anatomy,20px radii,16px padding,transparent backgrounds,subtle tabs,icons,focus,action placement | Clear in inspected anatomy; no arbitrary radius/palette changes |

## Findings

Consumer locations below are relative to the consumer root above,not files shipped by BEDS. F5 belongs to the shared package. After = proposed correction,not an implemented change. No claim about which agent introduced a finding.

| Severity | Domain | Location | Before | After | Why |
|---|---|---|---|---|---|
| HIGH · F1 | Accessibility | `blocks/mcp-screen/McpScreen.tsx:92`,`:184`,`:217` | `nao-e-url` passes the nonempty check; clicking register creates a fixture credential and success notice. `type=url` is outside a submitted form; no field error. | Validate through a semantic form; associate a PT-BR field error,focus invalid input,preserve values and block invalid submit. Confirm permitted callback schemes with the actual contract before integration. | Core form has no invalid-input recovery. Preview UX cannot be accepted as a complete registration flow; this is not a claim of a production security vulnerability. |
| MEDIUM · F2 | Accessibility | `blocks/mcp-screen/McpScreen.tsx:241`; `src/HomeRcdLab.tsx:358` | Revogar acesso immediately changes fixture state; zero confirmation dialogs and no undo. | Model confirm/cancel and restore focus; name the affected application. Preserve the nonproduction boundary. | Current fixture is harmless; it nevertheless demonstrates an unsafe interaction for a future access-revocation flow. |
| MEDIUM · F3 | Accessibility | `src/HomeRcdLab.tsx:166`,`:321`; `blocks/profile-screen/ProfileScreen.tsx:113`,`:130` | Perfil → Alterar perfil removes the focused button; focus becomes BODY. Every view keeps `Prévia isolada — Home RCD`. Empty/error Profile has no h1. | Provide per-view title and heading in every state; move focus predictably on navigation,return it on completion/recovery. | Keyboard and screen-reader users lose page context. This is navigation behavior,not a reason to restyle the shared shell. |
| MEDIUM · F4 | Writing | `blocks/profile-screen/ProfileScreen.tsx:360`; `src/HomeRcdLab.tsx:331` | Incorporar registros / Registros incorporados,but callback only clears pending notes. Supporting copy says no profile/CV incorporation occurs. | For the current fixture,use Marcar como revisados / Registros revisados. If incorporation is intended,obtain the product contract before implementing it. | CTA and success message promise more than the action performs; supporting text does not repair that mismatch. |
| MEDIUM · F5 | Writing | BEDS `packages/beds/src/technical.tsx:5`,`:22`; MCP `blocks/mcp-screen/McpScreen.tsx:119`,`:245` | CodeSnippet hardcodes Copy,Copied and English error/live-region labels inside a PT-BR screen. | Add a shared typed messages contract for idle/pending/success/error/accessible copy labels; supply PT-BR messages in Curriculol. Keep geometry shared. | Visible and spoken recovery must use the application's language; fix the shared API,not DOM/CSS overrides. |

## Verification and evidence

Headless Chromium through Playwright,isolated browser contexts. Matrix: `theme=light|dark`,viewport `1440x1000|390x1000|320x1000`; reduced motion enabled. Each run starts Home,opens the mobile drawer when needed,then enters MCP and Perfil through their actual navigation buttons. Fourteen viewport screenshots and two lower-section captures generated; selected captures published below. This is the current consumer,not the older BEDS MCP catalog.

| Check / reproduction | Observed result |
|---|---|
| 12 screen/theme/width snapshots; wait for fonts; compare page width and hidden horizontal clipping | Page width equals viewport; no flagged clipping; no page errors in the snapshot contexts |
| MCP: focus Codex tab,ArrowRight | Outros clientes selected,focus retained; visible 2px outline in all six contexts |
| Profile320: focus ler mais,Enter,then ler menos,Enter | Expands/collapses; focus stays on the disclosure |
| Mobile navigation: open,Navegação → Escape | Dialog closes; focus returns to Navegação |
| Profile: `profile-empty`,`error`,`profile-loading`,`profile-notes-error`; retry each error | Visible states; loading resolves locally; retries recover; missing error/empty h1 recorded in F3 |
| Perfil → Alterar perfil → send synthetic message → Concluir e voltar ao perfil | Return and saved-note fixture work; focus loss recorded in F3 |
| Profile notes: Incorporar registros | Pending list becomes empty,identity unchanged; misleading success recorded in F4 |
| MCP: name Auditoria local,callback nao-e-url → Registrar aplicativo | Invalid callback accepted; F1 reproduced |
| MCP: Revogar acesso | Immediate revocation fixture; no dialog; F2 reproduced |
| Both light screens: CSS `zoom=2` at1440px | Proxy inspected only; not equivalent to native browser zoom or iOS autozoom |
| BEDS checkout: `npm run verify` | Build,typecheck,library guard,documentation,declared example consumers,27 guard tests plus4 routing tests,packed artifact smoke all passed on the local working candidate; no release created |
| From consumer root: `node <BEDS>/packages/beds/scripts/check-consumer.mjs src blocks` | 19 source files,0 violations. Includes shared shell and all blocks; unlike the repository's four example roots,this is the current playground's declared consumer scope |

Raw observations: [matrix and flows](../../../packages/beds/evidence/better-mcp-profile-2026-09-15/matrix.json),[narrow flows](../../../packages/beds/evidence/better-mcp-profile-2026-09-15/narrow-flows.json).

Rendered evidence: [MCP dark desktop](../../../packages/beds/evidence/better-mcp-profile-2026-09-15/mcp-dark-1440.png),[Profile dark desktop](../../../packages/beds/evidence/better-mcp-profile-2026-09-15/profile-dark-1440.png),[MCP light320](../../../packages/beds/evidence/better-mcp-profile-2026-09-15/mcp-light-320.png),[Profile light320](../../../packages/beds/evidence/better-mcp-profile-2026-09-15/profile-light-320.png),[MCP credentials320](../../../packages/beds/evidence/better-mcp-profile-2026-09-15/mcp-light-320-credential.png),[Profile notes320](../../../packages/beds/evidence/better-mcp-profile-2026-09-15/profile-light-320-notes.png).

Not verified: physical touch devices,iOS input autozoom,native200% browser zoom,VoiceOver/NVDA output,forced colors,all focus/nontext contrast pairs,motion-enabled behavior,network/server/authorization failures,real OAuth/profile persistence. No axe run; custom geometry/contrast sampling is not an accessibility conformance engine. No independent reviewer or new aesthetic approval. Other product screens and earlier component additions are outside this review.

The ui-skills category lookup failed with registry DNS resolution; the explicitly requested installed Better entrypoints and references were read directly. No package/skill installation or dependency update was needed.

## Delivery boundary

Automatic routing is implemented in the BEDS author/package/catalog entrypoints and in the local Curriculol BEDS/playground scopes. The four routing regression checks enforce instruction presence and canonical/portable protocol parity,not actual skill execution or UI correctness. Publication of these rules/evidence is separate from releasing an updated package or fixing the consumer findings. Existing component work and installed tarballs remain untouched.

## Verdict

**Block** — Governance `BLOCK` for the reviewed MCP/Profile experience: F1 remains; F2–F5 require follow-up. Native assistive-technology checks and independent aesthetic approval remain pending. The documentation/routing change can ship independently; it does not approve these screens for production.
