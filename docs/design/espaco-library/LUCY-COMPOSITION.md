# Lucy — guided profile conversation

## Active component boundary

`ChatThread` and `ChatLayout` are optional catalog recipes, not `beds` exports.
The app owns the H1, viewport height, transcript spacing, next-step placement and
focus policy. `ChatMessage`, `ChatComposer`, `ChatOptions`, `Conversation` and
`ConversationBubble` remain public. Existing flow descriptions below document the
synthetic Lucy example, not requirements for unrelated products. Brand assets and
layout CSS belong to the consumer; earlier statements prohibiting them are historical.

Scope: BEDS catalog, local synthetic UI. Current entry: `?view=lucy`;
alias `?view=home&tab=lucy`. Preview port is host configuration; current
review used5296. [Consumer](../../../apps/web/labs/espaco-library/LucyPage.tsx).
No product route,AI,upload,PDF parser,LinkedIn session,queue or persistence.

## Current composition

September15 owner request: Lucy screen + three choices,using supplied chat and
inbox references. Open assistant prose,user replies trailing,quiet lower choice
panel. **A adaptation**,not source-CSS measurement or source-artwork copy.
[Foundations](FOUNDATIONS.md) owns geometry,Inter,existing themes and brand.
No new colors,assets,dependencies or consumer CSS.

| Region | Contract |
|---|---|
| Header |Existing ContentHeader + wrapping Inline,Breadcrumbs and new-conversation action |
| Conversation |ChatThread in existing640px lane;hidden H1;ChatMessage thread purpose;Lucy name and small BrandMark;newlines retained |
| Choices |ChatOptions:LinkedIn / describe experiences / résumé;icon,label,short description and trailing affordance |
| Next step |Only chosen workflow rendered;no up-front upload form,tutorial or context selector |
| Navigation |Existing catalog Lucy sidebar/account composition retained;not a product-sidebar migration |
| Notice |Persistent PT-BR note:interface preview,no AI,file transmission or profile changes |

This replaces the initial generic prompt/composer composition on the Lucy demo
route. Original September12 layout checkpoints remain historical in Validation.
ChatLayout remains available as an app recipe. ConversationBubble,SuggestionRow
and composer defaults remain public; no installed consumer is implicitly upgraded.

## APIs used by this example

| Export | Contract |
|---|---|
| ChatOptions |title,readonly options,onChoose,optional disabled |
| ChatOption |id,label,description?,IconName icon,disabled? |
| ChatThread (recipe only) |title,children,interaction,stepKey,optional notice/announcement |
| ChatMessage |Existing contract + purpose bubble/thread,optional author/mark |
| ChatComposer |Existing contract + purpose default/guided,sendLabel/attachLabel/cancelLabel;controlled attachments,attachmentsLabel,onRemoveAttachment,attachmentPicker |
| ComposerAttachment |id,name,kind(document/image/spreadsheet/folder/file),removeLabel |
| ComposerAttachmentPicker |onSelect(File[]),optional accept/multiple |

ChatOptions uses native buttons,not radios or a submission form. Choosing a row
calls the host once;no preselection,implicit permission,number shortcuts or
provider logic. Use QuestionCard instead when an answer needs explicit confirmation.
Keep IDs unique and supply meaningful actions;host handles empty/loading options.

ChatThread owns layout and focus transfer only. Initial mount does not autofocus.
Change stepKey only after an intentional step transition;new step prefers an
editable control,then first enabled button/link (the browse button in an upload). No global
listener,automatic transcript scroll or focus change on theme/rerender.
It includes one stable polite region;host supplies concise announcements rather
than making the whole transcript live. One H1;place inside the host main.
Author mark must be decorative BEDS content,never an interactive descendant.

Thread ChatMessage exposes optional author;assistant fills the lane without a
bubble border,user keeps the existing message bubble. Default bubble unchanged.
Guided composer adds visible label,error focus and visible perimeter;empty submit
reaches host validation. Enter submits,Shift+Enter inserts newline,IME composition
does not submit. Default composer keeps the existing empty-disabled behavior.
Busy disables editable state;optional cancel remains enabled. `sendLabel` and
`attachLabel` retain their host-owned override contract. When omitted, BEDS uses
the PT-BR fallbacks `Enviar mensagem` and `Adicionar anexo ou contexto`; it does
not inspect the host locale or force a product translation.

## Entry → transition → recovery

| Path | Behavior |
|---|---|
| Initial |Lucy introduction + three native options;no invented user message |
| LinkedIn |Explicit choice appears in transcript;reveal local PDF selection |
| Experiences |Reveal labelled composer;focus textbox;plain multiline draft |
| Résumé |Reveal illustrated [document upload](DOCUMENT-UPLOAD.md);local PDF/DOCX selection,5MiB cap |
| Invalid text |Associated error;focus input;typing clears stale error |
| Invalid file |Résumé rejects unsupported/empty/oversized/multiple selection and preserves prior file with explicit feedback;LinkedIn retains its compact PDF validation |
| File chosen |Name visible in full;remove action;no FileReader/text/bytes/upload |
| Continue file |Transcript shows filename + explicit no-read/no-send result;not imported-success |
| Send text |Local user turn + fixed illustrative assistant reply;no model call |
| Change option |Draft and per-source File arrays retained in memory |
| New conversation |If work exists,confirm reset;cancel preserves all draft/history/files |
| Re-entry |Current local state retained;reload intentionally starts fresh |
| Demo loading |`?preview=loading`;editable input locked,explicit cancel;no pending network request |
| Demo failure |`?preview=error`;first text submit fails locally,draft retained,retry succeeds in preview |

Extension/size/nonempty checks are UI-fixture validation,not trusted file inspection,
virus scanning,accepted-format product policy or backend authorization. Real
integration must validate bytes/server-side,obtain permissions and return actual
success/error state. No pricing,privacy or import entitlement invented.

## Attachment composer — local.23

Owner reference:`Captura de Tela 2026-09-15 às 14.03.01.png`. A adaptation:
file chips in a separate context tray above the text,kind icon,name and remove.
Explicit fixture:`?view=lucy&preview=attachments&theme=light` (or dark). Fixture
names are synthetic metadata,not actual user files. Existing no-file composition
and initial three choices remain unchanged. No model selector or decorative
tools copied from the reference;no new network integration.

Controlled `attachments` never reads bytes or creates object URLs. IDs must be
unique;names nonempty;removeLabel includes the filename. `onRemoveAttachment`
omitted → read-only chips. Removal moves focus to the next/previous chip or the
editor;busy/disabled locks picker/removal/editor. Host owns removal and messages.
Kinds select fixed Lucide glyphs (`Image`/`Table2` registry additions);no new
colors or external thumbnails. A folder chip is display metadata,not recursive
directory access. Full filenames wrap and use bdi,not hidden truncation.

Optional attachmentPicker creates an unnamed,hidden native file input,opened
only by the named attach button. It takes precedence over the legacy onAttach
callback;use one mechanism. Empty selection does not call onSelect;the input
resets after selection so the same file can be selected again. It has no form
submission participation. `accept` is a chooser hint,not security validation.
Default send accepts text or attachments;guided empty submit still reaches host
validation. Submit never clears data inside the primitive;host owns success.

Lucy fixture transitions:
- Experiences → attach button → native chooser → add chips,retain text.
- LinkedIn PDF/résumé PDF or DOCX choice → Continue → selected file also appears in composer.
- Add/cancel/remove/switch option → draft retained;original file untouched.
- Same-name files retain unique IDs;removing one never removes every match.
- Empty demo file → recovery error,previous chips/text retained;no policy claim.
- Simulated failure → chips/text retained;retry or edit remains available.
- Submit (including attachment-only) → local metadata transcript;explicit no-read/
  no-send response;clear submitted chips only after local success.
- New conversation → confirmation → clear local data;cancel preserves it.

The fixture retains metadata only for composer files;it does not upload,parse,
preview contents or persist actual files. Source file picker keeps its existing
local File state. Product validation/server transport remain out of scope.

Review uses the same automatic Better owners and contracts as local.22. Context7
unavailable;native chooser behavior checked against [MDN file input](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file).

| Domain | Inspection |
|---|---|
| Accessibility |Native named buttons;keyboard removal/focus recovery;stable host announcements;busy locks;44px narrow targets |
| Layout |Tray before editor;wrapping chips/full filenames;desktop,320px,RTL and200% CSS-zoom proxy |
| Writing |Action names,local-only disclosure,clear recovery;no upload/success invented |
| Typography |Existing Inter;13/20px500 filename;16px narrow editable text;bdi and long-name recovery |
| Colors |Canonical semantic roles;rendered filename contrast in light/dark |
| UI |r24/r20 inset;quiet context tray,small file glyphs;no animated insertion/removal |

Verification: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:5296 npm run test:browser -- lucy-attachments.spec.ts lucy-page.spec.ts conversation.spec.ts --reporter=line`;`npm run verify`.
Verified 2026-09-15:18/18 browser checks (4 attachment,10 guided Lucy,4 existing
conversation;desktop/mobile);31/31 guard/routing tests. Build,typecheck,104-component/
90-token contract,consumer and documentation checks passed. The12px internal
CSS-zoom overflow found in review was corrected through shared container rules,
wrapping toolbar and label;the final responsive run passed. Evidence:
[desktop dark](../../../apps/web/labs/espaco-library/evidence/lucy-attachments/desktop-dark.png),
[desktop light](../../../apps/web/labs/espaco-library/evidence/lucy-attachments/desktop-light.png),
[narrow light](../../../apps/web/labs/espaco-library/evidence/lucy-attachments/mobile-light-320.png).
Physical devices,screen-reader speech,APCA,Firefox/Safari and real imports remain
unverified. Independent baseline comparison and owner visual approval **PENDING**.
Local implementation only;no publication or consumer upgrade.

## Review record — local.22

Candidate:0.1.7-rc.16-local.22;no commit,push,release,consumer upgrade or deployment.
Applied ui-skills-root,frontend-design,better-interface and all six Better owners.
Read author/package/catalog AGENTS,Foundations,Governance,Interface quality and
consumer contract. Context7 unavailable;official fallback:
[React effects](https://react.dev/reference/react/useEffect),
[MDN file input](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file).
Existing React19 APIs and local primitives;no dependency introduced.

| Domain | Evidence / result |
|---|---|
| Accessibility |Native choices;names/descriptions;focused step/error;44px narrow actions;polite feedback;reset confirmation;busy cancel;forced-color focus |
| Layout |Desktop/mobile/light/dark;320px;200% CSS zoom;RTL;normal-flow interaction prevents overlaying history |
| Writing |Three requested actions;progressive instructions;local result never claims import;retry names recovery;draft loss confirmed |
| Typography |Existing Inter,14px prose/choice,13px description,16px narrow editor;full filename/newline recovery |
| Colors |Existing semantic roles;choice descriptions measured in both themes;hover/press secondary copy uses foreground |
| UI |Open prose,quiet context heading,r20/r12 inset relationship,small brand identity;no decorative motion |

Fixed during review:header action exceeded800px CSS-zoom viewport by71px.
Composed existing wrapping Inline inside ContentHeader;no new header geometry
variant or global sidebar change. Guided file rows now wrap filenames;touch
targets scoped to the guided next step,not every file control.

Verification commands:
- `PLAYWRIGHT_BASE_URL=http://127.0.0.1:5296 npm run test:browser -- lucy-page.spec.ts conversation.spec.ts --reporter=line`
- `npm run verify`
- `node packages/beds/scripts/check-consumer.mjs apps/web/labs/espaco-library/LucyPage.tsx`

Verified 2026-09-15:14/14 browser checks (10 guided Lucy +4 existing
conversation checks;desktop/mobile),31/31 guard/routing tests. Build,typecheck,
consumer,104-component/90-token contract,documentation and packed-artifact
checks passed. Browser evidence:
[desktop dark](../../../apps/web/labs/espaco-library/evidence/lucy-guided/desktop-dark.png),
[mobile light](../../../apps/web/labs/espaco-library/evidence/lucy-guided/mobile-light.png),
[narrow dark](../../../apps/web/labs/espaco-library/evidence/lucy-guided/mobile-dark-320.png),
[LinkedIn step](../../../apps/web/labs/espaco-library/evidence/lucy-guided/mobile-linkedin.png),
[conversation](../../../apps/web/labs/espaco-library/evidence/lucy-guided/desktop-conversation.png).

Unverified:physical devices,VoiceOver/screen-reader speech,real browser zoom
(CSS zoom proxy only),APCA,Firefox/Safari,actual imports/AI,product integration.
Inherited shell has no skip-to-main control;not part of this scoped chat change.
No whole-library accessibility-conformance claim. Independent baseline comparison
and owner aesthetic approval remain **PENDING**;technical QA is not approval.
