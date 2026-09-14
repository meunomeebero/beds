# Lucy — application composition exercise

Authority: latest user clarification, 2026-09-12. Reuse only the legacy sidebar information architecture. The existing personal DS defines all visuals. Subsequent user requests adopt the old Lucide iconography and account-menu finish globally; other foundation rules remain fixed.

| Boundary | Contract |
|---|---|
| Preview | `http://127.0.0.1:5283/?view=lucy`; alias `?view=home&tab=lucy` |
| Consumer | [LucyPage.tsx](../../../apps/web/labs/espaco-library/LucyPage.tsx) |
| Library | Current local `@espaco/ui` source; package metadata owns version, Components owns inventory. Original example checkpoints are in Validation. |
| Visual authority | Existing [foundations](FOUNDATIONS.md): Inter, fixed themes, full-bleed shell, 264/62px sidebar, 768px breakpoint, 640px chat |
| Customization | Curriculol's existing orange preset `#ffa133`; controlled light/dark theme |
| Forbidden | Page CSS; new pixel/font/spacing overrides; legacy frame; workspace-specific variants added to imitate the old screen |
| Initial navigation | Início / Lucy; Seu espaço → Currículos, Análises, LinkedIn; Oportunidades → Buscar vagas, Candidaturas; Conversas → Próximo passo na carreira |
| Footer | `SidebarFooter` + existing `NavItem`: 8 créditos; fixed library footer behavior |
| Identity | Synthetic Marina Costa profile; existing `Avatar`, `WorkspaceTrigger`, `AccountMenu` |

## Existing components used

| Region | Public primitives |
|---|---|
| Foundation | `DesignSystemProvider`, `Avatar`, `BrandMark`, `Text` |
| Navigation | `AppShell`, `SidebarHeader`, `WorkspaceTrigger`, `SidebarSection`, `NavItem`, `SidebarFooter`, `AccountMenu` |
| Main header | `ContentHeader`, `Breadcrumbs`, `Button` |
| Lucy | `ChatLayout`, `ChatComposer`, `ChatMessage`, `SuggestionRow`, `Select`, `Stack` |
| Local section preview | `Dialog`, `SearchField`, `RecentItem` |

No new component or visual variant required. Icon registry now includes House, MessageCircle, ChartColumn, UserRound, Briefcase and Coins for the corresponding navigation roles. The shared Icon primitive fixes the legacy 1.5 stroke; consumers still cannot set stroke or size. The consumer guard scans this page and its local dependencies. The existing catalog has an entry to this composition.

## Local behavior

| Flow | Result |
|---|---|
| Suggestion | Populate controlled draft |
| Context | Select none / résumé / job; attachment control toggles résumé context |
| Send | Append local user message, show fixed demonstration reply, clear draft; no AI request |
| New conversation | Clear messages, draft and context |
| Navigation | Lucy/history returns to current conversation; other sections open explicit prototype placeholders |
| Search | Filter local section labels; select a matching section |
| Profile | Open existing account menu; switch actual theme; dismiss with Escape and restore focus |
| Responsive | Existing library collapse, mobile drawer, containment and keyboard behavior |

The other dashboard sections, credits and profile are fixtures, not connected product features. This exercise demonstrates application composition; it is not a pixel comparison against port 5282. Validation: [record](VALIDATION.md), [browser tests](../../../apps/web/labs/espaco-library/lucy-page.spec.ts).

Primary navigation uses the library selected-icon state: filled active Lucy, outlined inactive Início; no screen-owned SVG or CSS override.
