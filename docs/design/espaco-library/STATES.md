# Espaço library — states and accessibility

Current interaction contracts below describe intended library behavior. Read the affected entries, [Foundations](FOUNDATIONS.md) for geometry and [Validation](VALIDATION.md) for executed coverage; requirements are not proof of testing.

These rules do not certify the source application or every browser/device. AccountMenu and FeatureCard have scoped mobile target exceptions; other compact controls retain explicit verification limits below.

| Surface | Entry → transition → result | Re-entry / recovery |
|---|---|---|
| Theme |Provider theme → ThemeToggle → callback → new provider theme |Selected state matches actual palette; absent callback disabled; no silent persistence |
| Sidebar |Desktop collapse / mobile opener → caller state |Names remain accessible; drawer Escape/backdrop/internal close; focus returns to opener after `inert` leaves main; main isolated while drawer open |
| ResponsiveGrid |Caller children → two equal desktop columns or one mobile column |No interactive or data state of its own; each child retains its own semantics, state and keyboard order |
| Collection card |Caller identity, factual metadata, actions and optional controlled selection → fixed anatomy |Card does not select, fetch or route; supplied controls preserve their own accessible state and recovery |
| Feature card |Caller image/title/description → named article → explicit primary/optional secondary callback |Reserved3:2 frame while loading;failed/empty source keeps geometry and meaningful alt fallback;new source recovers,cached load handled;decorative alt stays hidden;busy/disabled blocks corresponding action only;no onboarding state,persistence or service request |
| Activity panel |Caller title/icon/body → one bounded desktop panel;default header divider,history omits it |Optional dotted help remains in both;body retains its own state and native scroll;panel has no queue,order or progress semantics |
| Horizontal rail |Caller cards → native manual horizontal scroll |Touch/trackpad always available; Tab and Arrow keys join only when content overflows; no autoplay or selected-card state |
| Carousel |Visible overflow → continuous forward loop;no visible toolbar |Hover/focus stops;touch/wheel idles1200ms before resume,held pointers stay stopped;Space on region toggles persistent pause;hidden/offscreen stops;reduced-motion manual only;one copy in accessible/Tab tree;pointer promotes its group;controlled state shared;no live-region announcements per frame |
| Help label |Dotted title → hover180ms / keyboard focus / touch click → explanation |Pointer may enter popup;Escape/outside/blur dismiss;touch toggles;preferred above and viewport-clamped;content is noninteractive |
| Filter selector |Transparent trigger → existing choice list → caller value |Calendar and up/down icons;disabled skipped;Home/End/arrows/Enter/Space/Escape;focus return;not a date/filter request |
| Scrollable list |Caller children → native bounded vertical scroll |Every child remains rendered; Tab and Arrow keys join only when it overflows; no virtual window or hidden count |
| Account |Workspace trigger → account popover → explicit caller action |Escape/outside; focus restored; dynamic content controls height; no invented workspace/account request |
| Choice |Trigger → active option → controlled selection |Disabled excluded; keyboard movement/commit; Escape and appropriate Tab/outside dismissal; selected value retained |
| Segments |Named options → controlled exclusive value |Visible checked state; keyboard/native semantics; unavailable options cannot commit |
| Switch/checkbox |Persistent label → controlled checked state |Disabled explanation; keyboard activation; clear current value; no automatic save |
| Icon toggle |Named control → controlled pressed callback → selected state |Native button and `aria-pressed`; icon fill and surface reinforce, never replace, the pressed state |
| Text field |Labelled value → editing → caller submit |Description/error associated; entered value preserved on error; disabled vs read-only explicit; semantic name/autocomplete/input mode and optional error focus remain caller-controlled |
| Radio group |Named fieldset → native arrow-key choice → caller selection |Unavailable options stay disabled; helper/error is associated to the group; no automatic save |
| File upload |Labelled local picker/drop → caller-controlled `File[]` → removal |Selection is local only; accepted formats and validation belong to the caller; no transfer, persistence or hidden request |
| Composer |Typing/context/suggestion → submit → caller response |Empty blocked; IME safe; multiline entry; busy/disabled; recoverable error retains draft |
| Command/dialog |Named trigger → labelled overlay → action |Entry focus, expected keyboard containment/dismissal, return focus and viewport containment |
| Meter |Valid data → labelled numeric scale → fill |Zero valid; unavailable not zero; defensive bounds; no hidden score increase or success threshold |
| Table/pagination |Caller data state → native table or named recovery; controlled adjacent page |No hidden columns on narrow view; no automatic fetch, sorting, selection or route change |
| Empty/notice |Caller condition → explanation and optional recovery |No upsell inferred; action callback supplied; status/error announcement where appropriate |
| Code snippet |Labelled value → explicit Copy click → async callback or browser clipboard |Copying prevents duplicate click; copied status; error offers retry/manual selection; no network request |

## Non-negotiable semantics

| Rule | Contract |
|---|---|
| Accessible names |Icon-only actions named; decorative glyph hidden; group/input labels persistent |
| Selected state |Native checked/current/selected/pressed semantics; never color alone. Primary NavItem active: filled currentColor icon with sidebar-color stroke; inactive returns to outline. Selection follows controlled active/aria-current, not hover or pointer press |
| Focus |Visible treatment; source-equivalent style where measured; local engineering A where source behavior unverified; mobile drawer restores after the close frame rather than into an inert main region |
| Nested overlays |Escape dismisses active overlay before parent drawer; do not strand focus in removed content |
| Keyboard |Native text/radio/checkbox behavior; documented choice navigation; no keyboard trap outside modal intent |
| Errors |Explain recovery near relevant control; associate alert/description; retain entered values |
| Busy |Prevent duplicate operations; caller controls availability and status; no fabricated successful network result |
| Missing numeric data |Expose unavailable label without fake numeric ARIA value |
| Long/localized content |Wrap meaningful copy; keep named actions reachable; clamp overlays to viewport |
| Content semantics |Heading level/context belongs to named primitive; do not resize headings through arbitrary styling props |

## Fidelity limits requiring explicit disclosure

Adopted navigation uses31px rows and40px profile/primary rows;other controls preserve24/28/32/36px roles on mobile. Source13–14px editable text is retained. These are visually intentional choices with small touch-target and iOS input-autozoom risks;no44px/16px blanket adaptation. AccountMenu and FeatureCard actions have their documented scoped mobile targets. Physical touch/Safari and screen-reader verification remain separate from desktop/mobile Chromium emulation.

Placeholder uses the accessible secondary-text role on its actual field surface; it is not approval to use faint text for essential instructions. Both themes still need actual contrast/context review. Brand foreground selection only addresses text on the configurable brand fill; it does not certify all uses of brand-colored text/icons on every surface.

Observed source Escape behavior is narrower than a complete accessibility audit. Source visible checkbox appearance, populated/streaming/error states, some backdrops/shadows and unmatched glyphs remain U/A in [provenance](PROVENANCE.md). Technical passing tests and strict consumer linting do not replace visual approval.
