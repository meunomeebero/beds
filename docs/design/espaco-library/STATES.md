# Espaço library — states and accessibility

Current interaction contracts below describe intended library behavior. Read the affected entries, [Foundations](FOUNDATIONS.md) for geometry and [Validation](VALIDATION.md) for executed coverage; requirements are not proof of testing.

These rules do not certify the source application or every browser/device. AccountMenu, FeatureCard, EmptyStateCard, pricing and decision actions have scoped mobile target exceptions; other compact controls retain explicit verification limits below.

| Surface | Entry → transition → result | Re-entry / recovery |
|---|---|---|
| Theme |Provider theme → ThemeToggle → callback → new provider theme |Selected state matches actual palette; absent callback disabled; no silent persistence |
| Landing composition |Native entry/skip link → product demo tabs or FAQ/menu disclosure → native destination → Back |Menu Escape returns focus; links close menu; controlled demo state; readable native answers; immediate reduced-motion states; no fake network results. [Contract](LANDING-PAGE.md) |
| Landing footer |Native footer/nav links → supplied destination → browser Back |Optional groups/action omitted without empty controls; complete text wraps; no own network/loading/success; destination owns recovery. [Contract](LANDING-FOOTER.md) |
| Landing benefits |Read ordered cards → native CTA → supplied destination → browser Back |Static/no card interaction; optional art/action omitted; empty data omits list; no simulated result, fetching or spinner; destination owns recovery. [Contract](BENEFITS.md) |
| Settings navigation |Tab→edit→save/error→correct→re-entry |One roving stop;arrows/Home/End;settings RTL arrows mirror;inactive panels hidden/mounted;scroll overflow confined to tablist;draft preserved across tabs;loading/error recovery and destructive actions simulated only in catalog. [Contract](SETTINGS.md) |
| Sidebar |Desktop collapse / mobile opener → caller state |Names remain accessible; drawer Escape/backdrop/internal close; focus returns to opener after `inert` leaves main; main isolated while drawer open |
| ResponsiveGrid |Caller children → two equal desktop columns or one mobile column |No interactive or data state of its own; each child retains its own semantics, state and keyboard order |
| Forum topic |Named list → native link/button → host detail → close/return |Host-controlled current/unread state;current background/check/aria-current;complete title wraps,full excerpt required at destination. Avatar failure → initials;changed URL recovers. List loading/empty/error/retry composed by host,no fake data or writes. [Contract](FORUM-TOPICS.md) |
| Badge status |Caller label/tone → noninteractive text with decorative dot |No automatic live region or focus stop; all five tones preserve complete text; long labels wrap; default tag badge unchanged; beUI label/marker roll and layout spring are disabled under reduced motion |
| Collection card |Caller identity, factual metadata, actions and optional controlled selection → fixed anatomy |Card does not select, fetch or route; supplied controls preserve their own accessible state and recovery |
| Feature card |Caller image/title/description → named article → explicit primary/optional secondary callback |Reserved3:2 frame while loading;failed/empty source keeps geometry and meaningful alt fallback;new source recovers,cached load handled;decorative alt stays hidden;busy/disabled blocks corresponding action only;no onboarding state,persistence or service request |
| Onboarding |Native form → host validation → busy → host success/error → retry |Default submit enabled;busy/disabled fieldset and action guard;values host-controlled,never cleared. Decorative live preview has no controls/unique instructions and hides in narrow containers. No workflow persistence or real requests. [Contract](ONBOARDING.md) |
| Account credits |Account menu open → known/unknown/loading/error balance → host action/retry |Zero retains0;missing/nonfinite values never become0. Meter only when explicit finite limit bounds value;host formatted balance stays exact. Busy disables action;unknown quota omits bar. Menu geometry/focus retained. [Contract](ACCOUNT-CREDITS.md) |
| Illustrated empty state |Caller empty/all-clear condition → icon/title/explanation → optional action → illustration |Named article,H2/H3;reserved15:7 image,failure keeps copy/action;new src recovers. Opt-in empty-folder uses internal SVG/flies,visible pause,offscreen/hidden guards,static reduced motion;no remote media or request. Decorative imagery has no AX noise;busy/disabled blocks next step,not playback. [Contract](EMPTY-STATE.md) |
| Pricing |Caller literal offer/terms → named card + benefits → explicit action → caller busy/result |Reserved4:1 media;failure never hides offer;busy/disabled blocks activation;stable feedback;price terms and optional disabled reason describe action;empty benefits remove list,empty plans retain section header;no purchase or automatic result. [Contract](PRICING.md) |
| Payment confirmation |Host-verified payment → immediate title/amount/actions → one paper reveal |Invoice available/pending/error is separate;retry never charges;no replay on invoice/theme changes;static reduced-motion/restored history;no API call or fiscal issuance. [Contract](PAYMENT-CONFIRMATION.md) |
| Blog posts |Named feed → native article link → full text → return |One focus stop per card;passive topics;optional image/author/date;reserved lazy media,failure glyph,new source recovery;no selected/read state or CMS request. [Contract](BLOG-POST.md) |
| Record presentation |Caller rows → metadata/list → explicit item disclosure → controlled options |Collapse hides controls from focus/AT without resetting host values;Enter/Space toggle;switch labels/descriptions separate;empty arrays show caller copy;null is not zero;host owns pending/error/recovery and external-collapse focus. [Contract](RECORDS.md) |
| Activity panel |Caller title/icon/body → one bounded desktop panel;default header divider,history omits it |Optional dotted help remains in both;body retains its own state and native scroll;panel has no queue,order or progress semantics |
| Horizontal rail |Caller cards → native manual horizontal scroll |Touch/trackpad always available; Tab and Arrow keys join only when content overflows; no autoplay or selected-card state |
| Carousel |Visible overflow → continuous forward loop;no visible toolbar |Hover/focus stops;touch/wheel idles1200ms before resume,held pointers stay stopped;Space on region toggles persistent pause;hidden/offscreen stops;reduced-motion manual only;one copy in accessible/Tab tree;pointer promotes its group;controlled state shared;no live-region announcements per frame |
| PagedCarousel |First slide current;Previous disabled;Next enabled when another slide exists |Drag/touch or buttons select adjacent snap;focused region Left/Right changes instantly;first/last boundary disables the unavailable action;current localized position announced;reduced-motion button navigation is instant |
| Toast |Neutral/status appears top-center;same id updates in place |Pending/error/warning/action notices persist;informational default/minimum5000ms,0 persists;non-finite lifetime uses default;hover/focus/document hidden pauses without resetting remaining time;close restores focus;action runs once then dismisses;error uses alert,others polite status;bounded scroll viewport retains every recovery notice;reduced-motion spinner static |
| Conversation |Chronological named stack of assistant/user bubbles |Assistant leads/user trails;optional timestamp stays visible;optional reactions stay named;long content wraps;ChatMessage sending announces progress,error names recovery and optional retry |
| Guided conversation |ChatThread + ChatOptions → selected branch |No initial autofocus;native option → revealed input/file picker;stepKey focuses new control;drafts/files retained on option change;explicit reset confirmation;loading cancel,error retry and no fake import. [Lucy composition](LUCY-COMPOSITION.md) |
| Composer attachments |Named file chips above editor |Native picker after intent;controlled local metadata;full filename/kind/removal;same-name items have distinct IDs;remove focuses sibling/editor;cancel/error retains draft;busy locks;host clears only after success. [Lucy attachment contract](LUCY-COMPOSITION.md#attachment-composer--local23) |
| Help label |Dotted title → hover180ms / keyboard focus / touch click → explanation |Pointer may enter popup;Escape/outside/blur dismiss;touch toggles;preferred above and viewport-clamped;content is noninteractive |
| Tooltip |Compatible control → delayed hover/focus or touch toggle → compact explanation |`aria-describedby` exists only while open;bottom default;Escape/outside dismiss;warm adjacent hover window;viewport clamp;surface motion reduces to opacity-only |
| Filter selector |Transparent trigger → existing choice list → caller value |Calendar and up/down icons;disabled skipped;Home/End/arrows/Enter/Space/Escape;focus return;not a date/filter request |
| Scrollable list |Caller children → native bounded vertical scroll |Every child remains rendered; Tab and Arrow keys join only when it overflows; no virtual window or hidden count |
| Account |Workspace trigger → account popover → explicit caller action |Escape/outside; focus restored; dynamic content controls height; no invented workspace/account request |
| Choice |Trigger → active option → controlled selection |Disabled excluded; keyboard movement/commit; Escape and appropriate Tab/outside dismissal; selected value retained |
| Segments |Named options → controlled exclusive value |Visible checked state; keyboard/native semantics; unavailable options cannot commit |
| Switch/checkbox |Persistent label → controlled checked state |Disabled explanation; keyboard activation; clear current value; no automatic save |
| Icon toggle |Named control → controlled pressed callback → selected state |Native button and `aria-pressed`; icon fill and surface reinforce, never replace, the pressed state |
| Text field |Labelled value → editing → caller submit |Description/error associated; entered value preserved on error; disabled vs read-only explicit; semantic name/autocomplete/input mode and optional error focus remain caller-controlled |
| Settings form |Named native form → Enter or submit button → caller validation/callback |Prevents page navigation; no native validation bubble; caller retains draft, associates field errors and focuses first invalid field; caller owns busy/persistence and confirmation. No nested forms. Fixed default16px Stack rhythm; no CSS/geometry API |
| Radio group |Named fieldset → native arrow-key choice → caller selection |Unavailable options stay disabled; helper/error is associated to the group; no automatic save |
| Decision status |Caller state/label → passive icon + readable badge |Approval waits;confirmation requests input;processing waits for result;success/skipped/denied/error distinct;no live region or implied permission |
| Approval card/actions |Context + optional summary → explicit allow/alternative/skip/deny callback → caller processing/result |Processing/success/skipped/denied locks choices;error reenables recovery;stable feedback status;no hidden request,permission persistence or automatic result. [Contract](DECISIONS.md) |
| Question card |Native numbered radio choice → explicit confirm → enabled selected ID or null → caller validation/processing |Selection alone never submits;invalid focuses first available answer or empty form;error associated to group;failure preserves caller value;disabled/stale choice not submitted;optional skip separate;resolved locks;no nested forms |
| File upload |Labelled local picker/drop → caller-controlled `File[]` → removal |Selection is local only; accepted formats and validation belong to the caller; no transfer, persistence or hidden request |
| Document upload |Opt-in illustrated field;drag text + dashed boundary;full filename + removal;disabled |Cancel/non-file drop preserves selection;removal restores focus;host status/error;[contract](DOCUMENT-UPLOAD.md) |
| Composer |Typing/context/suggestion → submit → caller response |Empty blocked; IME safe; multiline entry; busy/disabled; recoverable error retains draft |
| Command/dialog |Named trigger → labelled overlay → action |Entry focus, expected keyboard containment/dismissal, return focus and viewport containment |
| SearchDialog |Named trigger → input focus → controlled query/category → active result → explicit selection |Native modal containment/Escape/return focus; ArrowUp/Down skips disabled; Enter commits except during IME; Home/End keep text editing; complete labels wrap. Loading/error hide stale choices; retry preserves query; clear resets query/category. No request/history or global shortcut owned by DS |
| Drawer |Real details trigger → close focus → body/native scroll → explicit action or dismissal → trigger |Modal background isolation;Tab loop;Escape/outside/close;inside drag not dismissal;nested Dialog closes top layer only;recovery replacing focused content returns focus inside;reopening resets body scroll;caller owns edits/recovery. DrawerSection supplies H3 grouping. [Contract](DRAWER.md) |
| Meter |Valid data → labelled numeric scale → fill |Zero valid;unavailable not zero;defensive bounds;28 vertical segments;ApplicationCard floor fill preserves integer score,delta and points semantics;generic nearest fill unchanged;no score increase or success threshold inferred |
| Table/pagination |Caller data state → native table or named recovery; controlled adjacent page |No hidden columns on narrow view; no automatic fetch, sorting, selection or route change |
| Empty/notice |Caller condition → explanation and optional recovery |No upsell inferred; action callback supplied; status/error announcement where appropriate |
| Code snippet |Labelled value → explicit Copy click → async callback or browser clipboard |Copying prevents duplicate click; copied status; error offers retry/manual selection; no network request |

Checkout:catalog → review quantity/total/method → explicit submit → pending →
verified-host confirmation or recovery → deliberate return. Pix CPF only;
hosted card collects no local card data. Mock confirms only by explicit preview
control;no timer/query success,real charge or fiscal invoice. [Contract](CHECKOUT.md).

Processing:entry CTA → staged presentation → explicit confirmation or failure
→ explicit full result navigation/retry → exit/re-entry. Never auto100%;manual-review has no retry.
Pause freezes narrative,not master estimate;hidden/offscreen and reduced-motion
guards. Native disclosures retain complete activity/story. [Contract](PROCESSING.md).

Results:confirmed processing → explicit result CTA → evidence + eligible next
step → optional local checkout → explicit simulated success or retry/cancel.
Free analysis/account reports distinct;already-paid documents never credit-gated.
Low fit/excellent score/existing result/unknown balance/missing proof have useful
non-purchase branches. Regression signed,partial score never zero. [Contract](RESULTS.md).

## Motion contract

Interaction motion (state changes, enter/exit, gestures, feedback) is expressed with `motion/react` — the market-standard engine every adopted library (beUI and other shadcn-compatible sources) already uses. Rules:

- Easing: BEDS curve `[.16,1,.3,1]` (`--ease-out-expo` in `@theme`); durations per component evidence.
- `useReducedMotion` mandatory on every `motion/react` usage; reduced motion jumps to the final state.
- CSS `transition`/`@keyframes` allowed only for trivial color hover and only inside the shrinking allowlist of unmigrated stylesheets in `check-library.mjs`; new interaction keyframes fail the build.
- Motion never replaces the non-animated state signal (color, text, ARIA).
- Tooltip entry uses the beUI spring/scale/blur expression with `useReducedMotion`; its label and `aria-describedby` remain the non-animated signal.
- Drawer entry/exit uses the beUI `SPRING_PANEL` expression with its full `±100%` panel travel on the existing native modal; `useReducedMotion` keeps an opacity-only transition while inertness, Escape, scroll lock and focus recovery remain non-animated state contracts. The earlier read-only 16/8px bounded-travel advisory was not implemented and is superseded by the later beUI/Motion checkpoint.
- Disclosure primitives use the beUI `bouncy-accordion` height/opacity/layout intent with `useReducedMotion`; `DisclosureText` keeps its full string mounted, `LabelField` keeps the hidden remainder mounted inert/aria-hidden, and `DisclosedRecords` omits collapsed records from the DOM by contract.
- CommandPalette keeps native modal focus/scroll-lock semantics through the shared `lib/modal` helper; beUI fuzzy cursor and active-row motion are adapted, while PresenceGate/panel entrance motion is omitted to keep measured dialog geometry stable. Reduced motion preserves the same keyboard and ARIA state without transform motion.
- Marketing animations are product-owned durations; never shortened by a DS migration (project rule).

## Non-negotiable semantics

Application tracking: [ApplicationCard state contract](APPLICATION-CARD.md).
Status board: [Kanban](KANBAN.md);native menu → host-confirmed move → counts and
focus follow the card;read-only,empty,rejected move and detail recovery;no drag.
Named checkbox selection; independent title/document/vacancy actions; explicit
busy/missing/FIT/ATS cases; no invented artifact or delivery. ResultsStatus owns
stable polite announcement. Preview operations stay local and reversible.

| Rule | Contract |
|---|---|
| Accessible names |Icon-only actions named; decorative glyph hidden; group/input labels persistent |
| Selected state |Native checked/current/selected/pressed semantics; never color alone. Primary NavItem active: filled currentColor icon with sidebar-color stroke; inactive returns to outline. Selection follows controlled active/aria-current, not hover or pointer press |
| Focus |Visible treatment; source-equivalent style where measured; local engineering A where source behavior unverified; mobile drawer restores after the close frame rather than into an inert main region. Two idioms, chosen by anatomy: borderless actions (button, icon button, tab) keep the canonical 2px solid `--es-focus` outline at offset2; bordered text fields (`es-text-input`,`es-text-area`) instead recolor their own border to `--es-focus` plus a 3px `--es-focus-ring` shadow at offset0, because an offset outline over an existing 1px border read as a detached second ring. `es-search-field` applies the same idiom on `:focus-within`, since it is a bordered shell around a borderless input. Fields keep a transparent outline so forced-colors still paints `Highlight`. Invalid fields swap to `--es-error`/`--es-error-ring` |
| Control motion |Migrated controls carry interaction motion in `motion/react` and trivial color hover in Tailwind `transition-colors` (150ms BEDS easing) — never CSS in `controls.css`, which is not on the `check-library.mjs` allowlist. Button/IconButton/IconToggleButton press → `scale(.97)` in 120ms (transient; nothing measures mid-tap); Button hover → non-geometric — filled variants lift via `filter: brightness(1.06)`, ghost keeps its `hover:bg-accent` token veil — gated by `useHoverCapable` so touch never sticks a phantom hover, and layout-measured boxes never scale on hover (a geometric hover scale left a residual transform that `boundingBox()` measured); Checkbox check scales `.6→1` in 160ms; Switch thumb travels `motion.x` → 14px in 180ms; a newly invalid field shakes once (`x:[0,-3,3,-2,2,0]`, 280ms) and its error settles in via AnimatePresence (180ms); activity/connection Tabs fade color on the `:hover` recolor. CSS `transition`/`@keyframes` survive only in the shrinking allowlist of unmigrated stylesheets in `check-library.mjs` — legacy idiom still live there: RadioGroup dot grows from `scale(0)` (160ms, `form-fields.css`), NavItem color/background 150ms (`layout.css`), settings Tabs variant (static, `controls.css`). All of it collapses under `prefers-reduced-motion:reduce` (`useReducedMotion` on every motion usage; `motion-reduce:transition-none` on migrated color transitions); motion never replaces the non-animated state signal |
| Nested overlays |Escape dismisses active overlay before parent drawer; do not strand focus in removed content |
| Keyboard |Native text/radio/checkbox behavior; documented choice navigation; no keyboard trap outside modal intent |
| Errors |Explain recovery near relevant control; associate alert/description; retain entered values |
| Busy |Prevent duplicate operations; caller controls availability and status; no fabricated successful network result |
| Missing numeric data |Expose unavailable label without fake numeric ARIA value |
| Long/localized content |Wrap meaningful copy; keep named actions reachable; clamp overlays to viewport |
| Content semantics |Heading level/context belongs to named primitive; do not resize headings through arbitrary styling props |

Date items: [Date item](DATE-ITEM.md). Native link/action/static variants;
optional description/status;complete localized date in time semantics;no date
conversion. Pointer/keyboard detail → close → focus recovery in catalog. Full
text wraps at narrow widths. No internal loading/error state or schedule policy;
collection feedback belongs to the host. No motion or implicit date selection.

## Fidelity limits requiring explicit disclosure

Adopted navigation uses31px rows and40px profile/primary rows;other controls preserve24/28/32/36px roles on mobile. Source13–14px editable text is retained. These are visually intentional choices with small touch-target and iOS input-autozoom risks;no44px/16px blanket adaptation. AccountMenu, FeatureCard, EmptyStateCard, pricing and decision actions have their documented scoped mobile targets. Physical touch/Safari and screen-reader verification remain separate from desktop/mobile Chromium emulation.

Placeholder uses the accessible secondary-text role on its actual field surface; it is not approval to use faint text for essential instructions. Both themes still need actual contrast/context review. Brand foreground selection only addresses text on the configurable brand fill; it does not certify all uses of brand-colored text/icons on every surface.

Observed source Escape behavior is narrower than a complete accessibility audit. Source visible checkbox appearance, populated/streaming/error states, some backdrops/shadows and unmatched glyphs remain U/A in [provenance](PROVENANCE.md). Technical passing tests and strict consumer linting do not replace visual approval.
