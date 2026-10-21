# Parity audit for 0.3.0-rc.3

Audit date: 2026-10-21. We compared BEDS `v0.3.0-rc.2` against the reference app's current web code: 60 web commits since rc.2, plus two approved branches that have not shipped yet (the "what changed" card with fair criteria bars, and the yes/no evidence step). The reference app still vendors BEDS 0.2.0-rc.11, so its newer patterns live in its own app code. The owner's rule is that the reference app's current design is the truth and BEDS follows it. BEDS stays product-agnostic.

Status values:
- **added**: new public component or tokens in rc.3.
- **changed**: existing BEDS component or lab recipe changed to match.
- **OK**: BEDS already renders the pattern. The adoption guide says how to compose it.
- **product**: product logic or policy, so it stays in the app.
- **deferred**: reusable, but not carried in rc.3. These are listed in Promotion candidates.

| Pattern | Reference source | BEDS status | Action |
|---|---|---|---|
| Score board: before/after pair, count-up from 0, neutral vs celebrated gain | `optimization-result-v4/ScoreBoard.tsx`, `.css` | added | `ScoreComparison`. Only a caller-passed `gain` turns on the brand "+N" and brand segments |
| Segmented score bar with gain segments, level palettes | `compositions/xp-meter.*` | added | `ScoreMeter`: 28 segments, 12px with 3px gaps (compact 8px with 2px gaps), staged fill. `MeterSegments` keeps its 16px anatomy |
| Fair criteria bars (all four or none, lit only inside a celebration) | branch "result RB" `ScoreBoard.tsx` | added | `ScoreComparison criteria` |
| Count-up and gain in the headline | `res-head__gain`, `CountUp` | OK | `AnimatedNumber` / `ScoreComparison`. The headline gain is `--es-brand-ink` text the caller composes |
| Confetti for a real win | `compositions/confetti-rain.*` | added | `ConfettiBurst`: 90 seeded pieces, motion/react, absent under reduced motion. Colors are confetti tokens |
| Sound cues (confetti, jackpot) | `sounds/*` | product | Host-owned audio. `onGainShown` and `onCount` hooks let the host play it |
| Celebrate once per result (stored ids) | `OptimizationResultV4.tsx` | product | Host storage |
| "Recommended" badge | `AnalysisResultV4.tsx` | OK | `Badge purpose="status" tone="info"` |
| Findings-first layout with no score | `AnalysisResultV4.tsx` (b81d359da) | OK | Compose it. `ScoreComparison` renders nothing without a fair pair |
| Weak-pick warning: free path primary, paid path secondary, cost note under the buttons | `.ar-next`, `res-next` | added | `NextStepCard` (full-width stacked actions, centered note) |
| Next step takes the stage after the main task (brand hairline, ring, nudge) | `.res-next[data-emphasis]` | added | `NextStepCard emphasis` |
| Confirm-items chips (dashed, then brand tint; locked; frozen; status) | `ConfirmTermsCard.tsx`, `confirm-terms.css` | added | `ChipChecklist` |
| Yes/no evidence questions with save-on-tap and undo | branch "result RC" `EvidenceQuestions.tsx` | added | `BinaryQuestionList` |
| "What changed" card (neutral chip groups, lines, missing + link) | branch "result RB" `WhatChanged.tsx` | added | `ChangeSummary` |
| "Focus of this version" (rows with a quiet reason tag) | `FocusNote.tsx` | added | `SelectionNote` |
| Language select with a visible label and hint | `KitLanguageChoice.tsx` | OK | `Select variant="input"` (visible label since rc.1) |
| Six-stage board, fixed 360px columns, sideways on phones, snap, edge fades, arrow keys | `BedsApplications.tsx`, `beds-applications.css` | added | `KanbanBoard`, `KanbanColumn` |
| Board recipe (lab) | lab `recipes/application-board` | changed | Now on `KanbanBoard`, with six stages in the lab view |
| Card "move to" menu | `application-card.tsx` | OK | `DropdownMenu` |
| Drawer "Move to" select, with a quiet link beside a closed stage | `BedsApplicationDetailDrawer.tsx` (12e00b3cd) | OK | `Select variant="input"` + `LinkButton purpose="inline"`. Example in `?view=kanban` |
| Celebration on real wins; calm outcome; one undo toast; stale-undo warning | `BedsApplicationsContainer.tsx` | OK | `toast({ id, action })` + `dismissToast` + `ConfettiBurst`. Example in `?view=kanban` |
| Drag and drop (handle, drop slot, overlay, keyboard drag) | `@dnd-kit` in `BedsApplications.tsx` | deferred | Needs a new dependency. Candidate |
| Single edit mode bar (sticky pill, dot, done action) | `profile/*`, `profile-editor.css` | added | `EditModeBar` |
| In-place section cards with sticky decision footer | `profile-editor.css` | added | `EditableSection`, `EditFooter` |
| Empty section tile | `.cl-pedit-empty` | added | `AddSectionTile` |
| "What's missing": one question at a time | `ProfileGaps.tsx`, `profile-gaps.css` | added | `StepList purpose="checklist"` |
| Reading progress steps | `ProfileImport.tsx` (reading phase) | added | `StepList purpose="progress"` |
| Import review rows (checkbox + clamped text) | `ProfileImport.tsx` | OK | `Checkbox` + `DisclosureText` |
| Keep or replace (stays / goes / unused) | `.cl-pimport__versions` | added | `VersionCompare` |
| Tinted-tile prompt (new data found, summary repair) | `home-import-nudge.*`, `ProfileSummaryRepair.tsx` | added | `PromptCard` |
| Drawn success mark | `compositions/success-mark.*` | added | `SuccessMark` |
| 15-minute undo receipt | `ProfileImport.tsx` | product | Undo window and storage are policy. Compose it from `SuccessMark` + `Button` |
| Neutral toggle chips (`aria-pressed`) in a review | `.cl-pimport` chips | deferred | Candidate (a `Chip` pressed state) |
| "N items missing" quiet link with a brand dot | `.cl-profile__gaps` | deferred | `LinkButton` covers the link. The dot is not carried |
| Coupon: toggle, field with inner Apply, applied/kept row, minimum hint | `compositions/coupon-field.*` | added | `CouponField` |
| Same-price upgrade hint (never switches by itself) | `PricingPage.tsx`, `CheckoutScreen.tsx` (4b141d511) | added | `InlineSuggestion` |
| Struck list price before the total | `PricingPage.css` | deferred | Candidate (`PricingCard`) |
| Privacy opt-out switch with saving / saved / failed toasts | `BedsSettings*.tsx` (52d024f70) | OK | `SettingsGroup` + `Switch` + `toast` |
| First-run consent notice | `components/AnalyticsNotice/*` | added | `ConsentNotice` (floating or inline) |
| Copy pill for an endpoint | `compositions/copy-pill.*` | changed | `CodeSnippet variant="pill"` + `hideLabel` |
| Numbered setup steps with embedded content | `BedsMcp.tsx`, `mcp.css` | added | `InstructionSteps` |
| Client switch as one tab pill | `sliding-choices` | OK | `Tabs` / `SegmentedControl` (one 40px pill since rc.1) |
| Tokens: meter, quiet/brand tints, chips, prompt tile, row hover, strike, applied, confetti | the CSS above | added | 20 tokens in `tokens.css` |
| Link pill, choice cards, icon theme switch, wrapping tooltip, AI chat stack, table, command palette, centered upload | rc.2 review | deferred | Unchanged from rc.2. See Promotion candidates |

Totals:
- **Pattern rows:** 24 added, 2 changed, 10 already OK, 3 product-specific, 4 deferred.
- **Deferred group:** the eight pieces carried over from rc.2 are grouped in the last row.
- **New exported components:** 22.
