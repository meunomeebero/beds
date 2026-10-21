# Parity audit for 0.3.0-rc.4

Audit date: 2026-10-21. We compared BEDS `v0.3.0-rc.3` against the reference app's web code at its current release (R89): the per-section document editor, the new feedback strip and the document workspace layout. We also closed the five rc.3 deferrals. The owner's rule is unchanged: the reference app's current design is the truth, and BEDS follows it while staying product-agnostic. The rc.3 audit is in [PARITY-RC3.md](PARITY-RC3.md).

Status values are the same as in rc.3: **added**, **changed**, **OK**, **product**, **deferred**.

Side-by-side screenshots (reference with mock data | BEDS lab) at 1440 and 390, light and dark, for the editor, the feedback strip and the board drag were reviewed for this release. They live outside the repository because the reference side shows the product.

## Document editor (R89)

| Pattern | Reference source | BEDS status | Action |
|---|---|---|---|
| Side pane: heading, page-count line, edited-version row with "back to the delivered version" | `SectionEditor.tsx`, `ResumeEditorPage.tsx` (`fitLine`, `versionLine`) | added | `EditorPane` (`meta`, `intro`) + `VersionNote tone="current"` |
| Section cards: closed reads like the document, one open at a time, cue fades in, staggered rise | `SectionEditor.tsx` `SectionCard`, `section-editor.css` | changed | `EditableSection` takes the pane density inside `EditorPane`; new `index` entrance; quiet hover fades |
| Discard dialog when switching away from a dirty card | `SectionEditor.tsx` | OK | `Dialog` + `Button variant="destructive"` (lab example) |
| Cancelar / Salvar footer with note, save error and "also save to profile" | `SectionEditor.tsx`, `.resume-sections__footer` | changed | `EditFooter layout="stacked"` + `children` (`Notice`, `Checkbox`) |
| "Save to the profile too" policy (only new items, nothing replaced) | `profile-additions.ts` | product | Host logic; the checkbox is `Checkbox` |
| Bullet fields with a quiet × and "add bullet" | `SectionEditor.tsx` `Bullets` | added | `BulletFields` |
| Chip input: chips with ×, "Novo item" + Adicionar, refuses repeats | `SectionEditor.tsx` `ItemsForm` | added | `ChipInput` |
| Entry rows with ↑ ↓ and remove on the open row | `SectionEditor.tsx` `Rows`, `profile-editor.css` | added | `EntryList` |
| Empty section tile in place | `.resume-empty` | changed | `AddSectionTile` at pane density |
| Contact field with an inline × | `HeaderForm` | product | Compose `TextField` + a `BulletFields`-style ×; kept in the app |
| One-block "splitting into sections" line, retry and read-only notice | `.resume-sections__preparing`, `SectionEditor.tsx` | added | `PendingLine` + `Notice` + compact outline `Button` |
| Edit lock while a preview waits or history is on screen | `ResumeEditorPage.tsx` `editLock` | OK | `Notice tone="info"` + `EditableSection disabled` |
| Closed-card previews (name/contacts, clamped text, rows, chips) | `SectionPreview`, `HeaderPreview` | deferred | Lab CSS composes them from `Chip` and text. Candidate |

## Revision and history

| Pattern | Reference source | BEDS status | Action |
|---|---|---|---|
| Toolbar status "check the edit" / "history version" with a dot | `.resume-editor__status` | added | `DocumentToolbar status` + `VersionNote tone="review" \| "history"` |
| Toolbar actions (download, history, back to current, restore, apply) | `ResumeEditorPage.tsx` | added | `DocumentToolbar` (actions and notes); the actions are `Button`s |
| History drawer: chronology, state dots, request, summary, open | `RevisionHistory.tsx` | added | `RevisionList` inside `Drawer` |
| Restore and accept rules, credits | `ResumeEditorPage.tsx` | product | Host logic |

## Feedback strip (R89)

| Pattern | Reference source | BEDS status | Action |
|---|---|---|---|
| Star radios + "Enviar avaliação", locked with a reason | `ResumeFeedback.tsx`, `resume-editor.css` | added | `RatingStrip` |
| Receipt that takes focus; low-score follow-up with "Revisar seções" | `ResumeFeedback.tsx` | added | `RatingStrip receipt`, `lowNote`, `lowAction` |
| One outlined "Envie feedback" | `CreditComplaintAction` (bare) | OK | `RatingStrip trailing` + `Button variant="outline"`; the form is the app's |
| Two-row phone layout | `@container resume-editor (max-width:720px)` | added | `RatingStrip` container query at 720px |
| Rating storage and the complaint form | `resume-editor` API, `CreditComplaintAction` | product | Host |

## Document workspace (R89)

| Pattern | Reference source | BEDS status | Action |
|---|---|---|---|
| Stage + right edit pane (42%, resizable 35–60%), footer under both | `DocumentWorkspace.tsx`, `resume-editor.css` | added | `DocumentWorkspace` |
| Phone tabs (document / edit) as one pill below 960px | `DocumentWorkspace.tsx` (`SlidingChoices`) | added | `DocumentWorkspace` with `SegmentedControl` (one 40px pill) |
| Paper sheet on a tinted stage | `.resume-editor__letter`, PDF.js page styles | added | `DocumentSheet`; tokens `--es-doc-stage`, `--es-paper`, `--es-paper-ink`, `--es-sheet-shadow` |
| PDF rendering, floating pager and zoom | `PdfPreview` | product | The app's viewer goes in `document` |

## rc.3 deferrals, closed

| Pattern | Reference source | BEDS status | Action |
|---|---|---|---|
| Board drag and drop: handle, drop slot, overlay, pointer, touch and keyboard drag, announcements | `BedsApplications.tsx` (`@dnd-kit`) | added | `KanbanBoard drag`, `KanbanColumn id`, `KanbanCard`, `KanbanDragHandle`; dependency `@dnd-kit/core`; token `--es-drag-shadow` |
| Neutral pressed toggle chip | `profile-import.css` `.cl-pimport__chip` | changed | `Chip pressed` + `onPressedChange` |
| "N items missing" quiet link with a brand dot | `profile.css` `.cl-profile__gaps` | changed | `LinkButton purpose="quiet" dot` (`TextLink purpose="quiet"`) |
| Struck list price before the total | `PricingPage.css`, `CheckoutScreen.beds.css` | added | `StruckPrice`; `PricingCard price.listLabel` |
| Quiet hover fades in the editing stylesheets | `section-editor.css`, `profile-editor.css` | changed | Tailwind transition utilities on the elements (the motion rules keep CSS transitions out of component stylesheets) |
| Link pill, choice cards, icon theme switch, wrapping tooltip, AI chat stack, table, command palette, centered upload | rc.2 review | deferred | Unchanged. See Promotion candidates |

Totals:
- **Pattern rows:** 16 added, 6 changed, 3 already OK, 5 product-specific, 2 deferred.
- **New exported components:** 14. New tokens: 6 (`--es-drag-shadow`, `--es-version-dot`, `--es-doc-stage`, `--es-paper`, `--es-paper-ink`, `--es-sheet-shadow`).
