# Navigation without page ownership

Read [Agnostic DS](AGNOSTIC-DS.md), [Foundations](FOUNDATIONS.md) and all skill
entrypoints linked in [Interface quality](INTERFACE-QUALITY.md) before building UI.

## Public component

`Sidebar` is a named navigation surface, not a page layout. It contains existing
`SidebarHeader`, `WorkspaceTrigger`, `SidebarSection`, `NavItem` and `SidebarFooter`
controls. It can serve, for example, document-library navigation or inventory
administration without knowing either product's routes or domain models.

Required props: `label` and `children`. Optional `collapsed` is controlled and
defaults to false. Supplying `onCollapsedChange` enables the header's collapse
control. Supplying `onDismiss` replaces that control with a close action, useful
when a host places navigation in an overlay. This callback does not create a
modal, backdrop, focus trap or mobile breakpoint: the host owns those concerns.
Header search and close/expand/collapse labels remain caller-controlled.

NavItem retains its complete accessible name when its visible label truncates.
The native `title` exposes the complete label in both expanded and collapsed
navigation; locked rows retain their explanatory reason instead. This is a
pointer fallback, not a substitute for touch or assistive-technology validation.

The navigation fills its parent. Hosts allocate usable width and scrolling;
compact controls fit that width rather than forcing a fixed 42px row. Keep enough
room for visible focus and usable targets. The component never creates a main
landmark, positions itself against the viewport or owns page-content width.
Native links preserve normal navigation; disabled rows retain their reason.
Active indicators use scoped IDs and respect reduced motion. Standalone items
have independent IDs rather than sharing an unrelated global motion group.

## Optional recipe and migration

`AppShell` is no longer exported by `beds`. The editable catalog recipe is at
`apps/web/labs/espaco-library/recipes/app-shell.tsx` with its own stylesheet.
It composes public `Sidebar`, keeps its earlier controlled state and owns:

- 264px expanded / 62px compact columns and the 767px mobile query;
- content-lane width presets and page padding;
- one main landmark and its skip link;
- mobile backdrop, inert background, focus containment and restoration.

These dimensions are example policy, not requirements for new applications.
Consumer imports must choose local composition explicitly; do not add a package
alias that silently restores the removed full-page API. Existing deployed
consumers are not upgraded by this private candidate.

## Source continuity

This separates the existing navigation adaptation rather than replacing it.
The beUI `animated-sidebar` registry item was inspected again on 2026-09-21;
no new upstream source or dependency was copied. The earlier animated-sidebar /
bounce-sidebar provenance and licenses remain in [Provenance](PROVENANCE.md).
Its scoped active indicator stays in core; shell-grid interpolation now belongs
to the recipe. Source-level extraction preserves existing keyboard/focus code.

## Scoped review — 2026-09-21

React 19, existing BEDS tokens and Motion. Inspected the isolated catalog at
port 5297, not an installed consumer. All seven Better entrypoints were read;
focus/keyboard and spacing/adaptivity references guided this extraction.

| Domain | Evidence | Result |
|---|---|---|
| Accessibility | Named nav, native links; browser open, Shift+Tab wrap, Escape, inert removal and trigger focus return | Inspected flow passed; screen reader and nested overlay coverage pending |
| Layout | Expanded/compact source boundary; rendered compact widths; narrow navigation | No horizontal nav overflow after correction; requested390px override reported433px effective width |
| Writing | Existing localizable control labels; docs distinguish recipe from public API | No invented success state or product copy introduced |
| Typography | Existing control typography retained, accessible names preserved in compact mode | Long-label and text-zoom browser coverage pending |
| Colors | Settled inactive nav foreground/background measured in both themes | Light #6a6966/#fbfaf9 5.27:1; dark #949494/#191919 5.80:1; no palette change |
| UI | Compact icon measured against row center | Corrected left-biased icon; center delta under0.01px after correction |

| Severity | Domain | Location | Before | After | Why |
|---|---|---|---|---|---|
| MEDIUM | UI | `packages/beds/src/layout.css`, compact NavItem | Full-width inner span left-aligned the icon | Inner span centers its icon | Center the visible glyph, not only its wrapper |
| MEDIUM | Layout | Same compact controls | Fixed42px controls could overflow the available lane | Controls use parent width | Respect available space including scrollbars |

The initially sampled light foreground was mid-theme-transition (#909090 on
#fbfaf9,3.06:1); it is not the settled token pair. Do not cite that transient sample
as the normal light theme. It nevertheless exposes a transient low-contrast state:
theme-transition suppression remains a follow-up for the shared theme provider.

Source/SSR regressions cover the export/CSS boundary, independent Sidebar,
callback-owned controls, and recipe main/skip-link association. They do not prove
browser layout or keyboard behavior. Full automated browser suite, 320px, RTL,
200% zoom, reduced-motion browser checks and physical devices remain unverified
for this extraction. Verdict: PENDING; no broad visual approval or release.
