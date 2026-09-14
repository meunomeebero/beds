# Espaço — original measurements and superseded notes

Historical source/reference material moved out of Foundations during the documentation consolidation. Some rows include early local adaptations beside source measurements. None is a current implementation instruction. Use [Foundations](FOUNDATIONS.md) for approved values and [Provenance](PROVENANCE.md) for source identity, dates and M/D/A/U definitions.

Original palette, source-declared scales and earlier shell/account geometry below remain evidence. In particular: source 260/48px shell, r10 account popup, source dark palette and original light secondary/placeholder are superseded. Retained values are adopted only where the current contract explicitly says so.

## Original Marketer palette — historical evidence

The dark values in this source table are not the current adopted dark palette. The canonical token register records the current package values. Light values also have subsequent accessibility adaptations; this table is historical.

| Role | Light | Dark | Evidence |
|---|---|---|---|
| Application background | `#ffffff` | `#000000` | M |
| Sidebar | `#fbfaf9` | `#000000` | M |
| Surface | `#ffffff` | `#191919` | M |
| Subtle surface | `#edece9` | `#202020` | M |
| Raised surface | `#edece9` | `#2a2928` | M |
| Secondary-control hover | `#e6e4e0` | `#2a2928` | M |
| Secondary-control pressed | `#dbd8d2` | `#37352e` | M |
| Foreground | `#37352e` | `#dbd8d2` | M |
| Secondary text | `#787775` | `#a49e97` | M |
| Placeholder | `#a49e97` | `#504b49` | M |
| Inverse role | `#191919` | `#f6f5f4` | M |
| Primary action fill | `#202020` | `#ffffff` | M |
| Primary action text | `#ffffff` | `#202020` | M |
| User message surface | `#edece9` | `#2a2928` | M |
| Border / subtle / strong | Black `8% / 6% / 12%` | White `8% / 6% / 12%` | M |
| Information / selection | `#0077e6` | Same | M |
| Success | `#15b042` | Same | M/D |
| Warning | `#e87800` | Same | M/D |
| Error | `#e83535` | Same | D |

Functional blue, success, warning and error are fixed semantic roles. They are not branded by the provider. Brand emphasis uses `--es-brand`; an internal contrast calculation selects fixed black or white `--es-on-brand`. This is one configurable input, not two customizable colors. Do not replace all neutral/selected/action roles with brand color.

| Declared neutral step | Value |
|---|---|
|0 /50 /100 | `#ffffff` / `#fbfaf9` / `#f6f5f4` |
|200 /300 /400 | `#edece9` / `#e6e4e0` / `#dbd8d2` |
|500 /600 /700 | `#a49e97` / `#787775` / `#504b49` |
|800 /850 /900 | `#37352e` / `#2a2928` / `#202020` |
|950 /1000 | `#191919` / `#000000` |

Neutral steps are D. Use semantic tokens, not direct neutral-step selection in consuming screens. Preserve alpha and the compositing background; equivalent-looking opaque gray is not an interchangeable border token. Byte-rounded alpha approximations, where retained by implementation, are A rather than exact fractional computed-style identity.

## Inter by context

Bundled official Inter4.1 variable fonts, normal and italic, weight100..900; SIL Open Font License included. Actual source body family: Inter (M). Internal registration name `Espaco Inter` avoids host font collisions (A). Measured MCP code uses Geist Mono (M), a fixed code-context family rather than a consumer font option. `font-feature-settings:normal`, optical sizing `auto`, variation settings `normal`, kerning `auto` observed for interface text; browser/OS rasterization can still differ.

| Actual context | Size / line height | Weight / tracking | Evidence |
|---|---|---|---|
| Dashboard welcome / section heading |16/20px |500 | M |
| Chat welcome |16/24px |500 /-.15px | M |
| Settings section / breadcrumb heading |13/20px |500 | M |
| MCP page heading |15/24px |500 | M |
| MCP section heading |13/20px |500 | M |
| MCP code content |Geist Mono11/20px |Code-context weight | M |
| MCP copy action |14/16px |500 | M |
| Compact label |13/16px |500 /-.1px | M |
| Account menu container/body |13/20px |Component role overrides preserved | M |
| Choice label |13/16px |450 /-.1px | M |
| Composer text |14/22.4px |400 /-.15px | M |
| Settings input |13/20px |400 | M |
| Notification setting label |13/13px |500 | M |
| Notification helper |11/16px |400 | M |
| Appearance segment |12/16px |500 | M |
| Activity tab |11px |Role-specific | M |
| Activity caption |11/16px |500 /+.55px | M |
| Command input |15/24px |Role-specific | M |

| Declared scale | Size / leading | Weight / tracking | Evidence |
|---|---|---|---|
|H1 /H2 |28/32px;24/30px |500 /-.2px | D |
|H3 /H4 /H5 /H6 |20/28px;18/24px;16/24px;14/20px |500 /-.15px | D |
|Body16 /14 /13 /12 /11 |16/24;14/21;13/19.5;12/18;11/16.5px |16px tracking-.15;14/13px-.1 | D |
|Label18 /16 /14 /13 /12 |18/24;16/20;14/16;13/16;12/16px |18/16px tracking-.15;14/13px-.1 | D |

The D scale documents source availability. It does not authorize using28px for a measured16px page welcome,15px MCP heading or13px settings heading. Component context chooses the fixed type role; consumers do not supply font size/weight/tracking. Uppercase activity captions are a context exception, never a universal SaaS heading rule. Geist Mono is now measured in MCP code; earlier declared-only status is superseded for that context. Source-declared roobert visible use remains unestablished; it is not a library typography option.

## Original Marketer shell and retained content rhythm

The original 260px sidebar/48px rail/28px navigation rows below are historical observations. The adoption and account-menu sections in Foundations own current geometry; this table cannot authorize reverting those decisions.

| Context | Constraint | Evidence |
|---|---|---|
| Shell | Edge-to-edge; no exterior rounded frame | M |
| Expanded / collapsed sidebar |260px /48px | M |
| Desktop breakpoint |768px persistent sidebar;767px mobile mode | M |
| Mobile drawer |260px wide, left edge; viewport height | M at390×844 |
| Sidebar nav |28px row;2px row gap;8px horizontal row padding;10px icon/text gap;8px radius | M |
| Workspace trigger |28px high | M |
| Chat / Home content |640px /720px maximum widths | M |
| Dashboard content |880px maximum width; isolated Home composition only | A |
| MCP page frame |Header max784px with48px top/32px sides/16px bottom;main max784px with16px top/32px sides/32px bottom;inner content720px | M live computed styles |
| Mobile chat |16px side gutters;358px composer in390px viewport | M |
| Heading → composer |20px gap | M |
| Composer |20px radius;120px minimum input panel;14px vertical/16px horizontal padding | M |
| Agent strip |36px high; mobile total composer156px | M |
| Suggestion |40px row;24px icon tile | M |
| Recent section separation |48px | M |
| Integration row |720×64px;14px radius;8px14px padding;12px internal gap;8px row gap | M |
| Notification setting row |10px0 padding;16px gap;51/52px total captured heights | M |
| ResponsiveGrid |Two equal columns from768px; one column through767px;16px `--es-space-8` gap;root and children `min-width:0` | A; bounded layout primitive added for the isolated Home RCD composition |

Preserve different component densities: adopted sidebar31px, choice28px,action32px,field36px andsuggestion40px. Do not normalize them to one row height. Wrapping content may increase height; source coordinates are measurements, not absolute positioning rules. Semantic layout variants (`chat`, `home`, `full`; named stack gaps and ResponsiveGrid) choose fixed internal relationships, not arbitrary consumer pixels.

## Overlays and control geometry

Account and control rows below are recorded observations. Use Foundations for the current account-menu finish and retained control contexts.

| Component context | Constraint | Evidence |
|---|---|---|
| Account menu |280px width;10px radius;no CSS border,shadow ring only; captured466px height follows fixture content | M |
| Account inner groups |8px0 padding;4px group gap; rows28px, row gap2px, row horizontal padding6px; avatar28px | M |
| Appearance control |24px group;22px choices;1px padding;2px gap | M |
| Choice popup |260px width;10px radius;8px inset;28px option;7px row radius;6px horizontal padding;10px icon gap | M |
| Period popup |160px width;8px radius;4px inset;32px rows;6px row radius;6px8px row padding | M |
| Command palette |672px width;14px radius;36px options;10px option radius | M |
| Welcome dialog |480px wide;24px radius;200px artwork region;24px content padding; captured370px total | M |
| Welcome action |40px high;12px radius;14px horizontal padding;14/16px medium label;6px gap | M |
| Field |36px high;8px radius;4px10px padding;disabled50% | M |
| Settings combobox |224×36px;8px radius;8px8px8px10px padding;6px gap | M |
| Standard button |32px high;8px radius;10px horizontal padding;4px gap;13px medium text | M |
| Activity tabs |30px group;24px tabs;2px padding/gap;8px outer/6px inner radius | M |
| Credit-style segmented meter |28 segments;16px high;2px gap/radius | M; count is a visual default, not billing policy |
| Switch |32×18.4px;16px thumb;round track;1px transparent border | M |
| MCP code region |42px total;12px radius;6% border;raised background (`#edece9` light / `#2a2928` dark);10px12px code padding;copy action40px high with0px12px padding | M |
| MCP client card |720px lane;16px outer radius;tab strip53px with8px inset/divider;full-width five-column tablist36px with4px inset/10px radius;panel16px32px32px;13/16px medium label | M live computed styles |
| MCP joined choices |36px high;11/16px labels;8px horizontal padding;8px outer corner radii | M; distinct from activity tabs |

Original Marketer measurements: light switch off track:black12%,thumb:white;dark off track:`rgba(255,255,255,.0972549)`,thumb:`#dbd8d2`;dark field:`rgba(255,255,255,.0364706)`. These dark neutral roles may be replaced by the adopted canonical dark mapping; source evidence stays unchanged. Checked track functional blue/thumb white and light roles remain fixed. Source checkbox visible styling remains U; hidden implementation machinery is not visual evidence.

Original Marketer account light shadow (M): `0 0 0 1px` black6%, `0 20px 25px -5px` black12%, `0 8px 10px -6px` black16%. Original dark shadow independently confirmed M: identical geometry/black shadows, first ring white6%. Current light/dark mappings belong to Foundations. Other unmatched overlays/backdrops/shadows retain their own A/U provenance; do not generalize this account surface to all dialogs.
