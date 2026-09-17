# Document upload

Use when: composing a document-led upload entry or Lucy resume selection.
Read next: [Foundations](FOUNDATIONS.md), [Components](COMPONENTS.md),
[States](STATES.md), [Interface quality](INTERFACE-QUALITY.md).

## Reference and scope

Owner-supplied September15 drop-screen screenshot: overlapping document sheets,
centered title/instruction and one picker action. **A adaptation**, not extracted
CSS. Original CSS artwork; no screenshot/third-party illustration redistributed.
Reference rainbow background/window chrome omitted: the existing BEDS canvas,
Inter and one brand accent remain authoritative. No motion beyond the shared `motion` contract.

## Public contract

`FileUploadField purpose="document"` reuses the compact field's selection/drop
controller. Default purpose unchanged; no second uploader or request layer.

| Prop | Contract |
|---|---|
| `label` | Visible H2 inside document surface; compact field retains its label |
| `files/onFilesChange` | Controlled local `File[]`; callback only, no FormData serialization |
| `dropLabel/dragLabel?` | Rest/active drop instructions; explicit text supplements dashed focus-colored boundary |
| `browseLabel/removeLabel` | Host copy; native picker button/removal buttons |
| `documentLabel?` | Decorative sheet label; duplicate supported formats, never unique instructions |
| `description/error/status?` | Formats/help, linked recovery error, stable polite announcement |
| `accept/multiple/disabled` | Picker hints/selection cardinality/unavailable controls; not authoritative validation |

Files remain local. No reading, parsing, uploading, automatic submit, persistent
storage or fabricated progress. Native cancel/empty or text-only drop preserves
selection. Drop blocks file navigation even when disabled; no callback then.
Removing a file restores focus to adjacent removal or the picker. Full filenames
wrap in the document variant; compact filenames retain a full-value title.
Use underneath an H1; this field is not a standalone page landmark.

## Geometry

Foundations owns values. Transparent r24 surface, centered composition, solid
quiet border rather than a permanent dashed rectangle. Static three-sheet stack;
brand tint belongs only to decorative front sheet. No autoplay or hover motion.
Interactive contrast/focus comes from existing semantic roles, not artwork.

## Consumer examples

- [Upload page](../../../apps/web/labs/espaco-library/UploadPage.tsx): `?view=upload&theme=light|dark`.
- [Lucy](../../../apps/web/labs/espaco-library/LucyPage.tsx): choose **Importar currículo**; LinkedIn PDF remains compact.
- `?view=upload&preview=disabled`: disabled state; `purpose=default`: compact regression fixture.

Curriculol examples accept one PDF/DOCX, case-insensitive extension, nonempty,
at most5MiB; invalid replacements preserve the previous selection. Old `.doc`
gets an export-to-PDF/DOCX recovery instruction. Rules mirror the inspected
product parser/size cap; not new library business policy. `multiple` deliberately
allows the demo to receive and reject a multi-selection with clear feedback.
Metadata is only a UX hint; real product validation remains content-based.
No claim that a renamed or corrupt file has been parsed successfully.

## Flow and review evidence

Entry → empty → picker/drop → local selection → optional preview confirmation.
Re-entry keeps controlled files; remove → focus returns; cancel/invalid drop →
prior selection retained; valid retry → error clears. Refresh clears demo state.

Better scope: document field + standalone upload + Lucy resume entry, not global
DS approval. All seven Better entrypoints applied; Foundations and Governance
own values. No unresolved finding in the inspected document-field states.

| Domain | Inspected evidence / remaining boundary |
|---|---|
| Accessibility | Native keyboard picker, error description, removal focus, disabled drop, stable status; native screen reader/OS picker UI not verified |
| Layout |320/390px reflow, desktop/mobile, long filename, RTL; CSS200% zoom at1280px is a stress check, not actual browser zoom certification |
| Writing | Explicit formats/size/recovery; no claim of upload or successful parse; prior file preserved |
| Typography | Inter/semantic roles; wrapping title/body/full filename; no data truncation in document variant |
| Colors | Canonical light/dark secondary on transparent canvas; automated contrast≥4.5:1; focus distinct; artwork conveys no unique state |
| UI polish | r24 transparent surface, layered original sheet artwork, quiet action; no animation; no unrelated primitives restyled |

An800px viewport with synthetic CSS200% zoom retains the desktop sidebar and
can overflow. Real browser zoom changes CSS viewport/media-query selection;
the synthetic combination is not equivalent. Host-shell behavior under that
combination remains outside this field's acceptance; no global shell patch.
Physical devices, actual browser zoom, independent visual review and owner's
aesthetic approval remain pending.

## Executed checks — September 15

| Gate | Result |
|---|---|
| `npm run verify` | Passed: build, typecheck, library/docs/consumer guards and temporary package consumer smoke; no violations |
| Playwright `upload.spec.ts lucy-page.spec.ts lucy-attachments.spec.ts` |22 passed; desktop/mobile projects, light/dark, selection/drop/removal and Lucy entry/re-entry |
| Rendered review | Desktop light/dark empty + mobile light/dark empty/selected; screenshots in `apps/web/labs/espaco-library/evidence/upload/` |

Browser command: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:5296 npx playwright test --config apps/web/labs/espaco-library/playwright.config.ts upload.spec.ts lucy-page.spec.ts lucy-attachments.spec.ts --reporter=line`.

Delivery: canonical source + catalog only. Unreleased addition; no published
version, consumer dependency upgrade, real upload or production integration.
