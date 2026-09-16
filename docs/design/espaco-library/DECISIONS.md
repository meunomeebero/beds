# Decisions — questions, approval and explicit choices

Scope: portable BEDS;catalog `?view=decisions`;local examples only.
No Curriculol/Lucy integration,queue,permission,request or stored preference.

## Public API

| Export | Contract |
|---|---|
| DecisionStatus |`{state,label}`;passive,decorative icon;no live-region announcement |
| DecisionActions |`{primary,secondary?,alternative?,disabled?}`;action:`{label,onClick,disabled?}`;native type=button |
| ApprovalCard |`{title,status,primaryAction,secondaryAction,description?,feedback?,alternativeAction?,details?,context?}` |
| QuestionCard |`{title,status,options,value,onChange,onConfirm,confirmLabel,description?,feedback?,error?,skipAction?}` |

Exported types:`DecisionState`,`DecisionStatusProps`,`DecisionAction`,
`DecisionActionsProps`,`ApprovalCardProps`,`QuestionCardProps`.
State:`approval|confirmation|processing|success|skipped|denied|error`.
All labels supplied by caller;state chooses fixed semantics/style,not language.

Approval details:readonly `{id,label,value,emphasis?}[]`;literal strings in a dl.
No total calculation or hidden pricing logic. Context:`{label,icon?:IconName}`.
Optional alternative supports an explicit “Sempre permitir”;omit unless the
application actually offers that policy. Secondary label may be “Pular” or
“Negar”;these have different business meaning and must not be interchanged.

Question options reuse readonly `RadioOption[]:{id,label,disabled?}[]`.
`value:string|null`;`onChange(id)` updates selection only.
`onConfirm(id|null)` fires on explicit form submission;null if no enabled
selected option exists. Consumer validates null and returns an actionable error.
No default selection,global numeric shortcut,automatic answer or hidden save.
No children/style/className/color/size escape hatches. Render outside other forms.

```tsx
import { ApprovalCard, QuestionCard } from 'beds';

<ApprovalCard
  title="Permitir acesso ao currículo?"
  description="Lucy poderá ler o arquivo selecionado."
  status={{ state: 'approval', label: 'Aprovação' }}
  primaryAction={{ label: 'Permitir', onClick: requestAccess }}
  secondaryAction={{ label: 'Pular', onClick: skipStep }}
/>

<QuestionCard
  title="Como você prefere trabalhar?"
  status={{ state: decisionState, label: decisionLabel }}
  options={workOptions}
  value={answer}
  onChange={setAnswer}
  onConfirm={validateAndConfirm}
  confirmLabel="Confirmar resposta"
  error={answerError}
  feedback={resultMessage}
  skipAction={{ label: 'Pular', onClick: skipQuestion }}
/>
```

Callbacks/state above supplied by host;not implicit BEDS services.
Set processing synchronously before starting async work. Host owns backend
authorization,idempotency,permission scope,validation,persistence and actual
success. UI disabling is not a security boundary. “Sempre permitir” does not
grant or persist anything inside BEDS. Never use a status badge as authorization.

## Flow / accessibility

Approval/confirmation → explicit choice → processing → actual success or error.
Skip/deny → respective terminal state. Processing/success/skipped/denied lock
all choices. Error reenables retry;selected answer remains caller-controlled.
Re-entry supplied by host;new task should reset state intentionally.

Named article,H2 and associated optional description. Status badge has readable
label/decorative glyph;no spinner for waiting approval,no live-region noise.
Each card owns one stable polite feedback node;consumer supplies meaningful
result/recovery text. Avoid duplicating it in a toast. Validation uses associated
group alert;first enabled answer receives focus when a new error appears,or
the named form if none remain. Screen-reader speech itself remains unverified.

Question uses native fieldset/legend/radios. Arrow keys/Space select;Tab leaves
the group;Enter on confirm submits. Unavailable options skipped;stale/disabled
selected IDs become null on submit. Number tiles become checks after selection;
they are not shortcut hints. No extra blur save. Full row gets keyboard focus
outline;controls wrap at narrow widths. Explicit skip stays separate from submit.

RadioGroup `purpose="question"` extends existing primitive;default remains
compact. QuestionCard hides the duplicate legend visually,not semantically;
standalone question-purpose RadioGroup still shows its label.

## Reference / bounded review

September15 supplied screenshot
`codex-clipboard-e1a884e9-42fb-4463-a7a9-400d2f6989e2.png`.
**A adaptation**,not measured source CSS:transparent rounded cards,title/status,
inset summary,numbered answer list,pill actions. [Foundations](FOUNDATIONS.md)
owns fixed640px maximum,r24,p16 and type/spacing values. Neutral badge fill with
existing functional icon colors;no copied yellow/blue palette or new tokens.

Context7 unavailable;no new dependency. Existing native RadioGroup and Button
reused;official fallback:[MDN native radios](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/radio).

Candidate `0.1.7-rc.16-local.15`;local only. No commit,push,release,consumer
upgrade or product integration. All seven Better skills read and applied;
frontend-design/ui-skills-root used. Final six-domain review:

| Domain | Scoped result |
|---|---|
| Accessibility |Named cards/group;native keyboard selection;explicit submit;invalid focus;processing locks;answer preserved through retry;forced-color selection retained |
| Layout |320/390/938/1440px,both themes,long text;no horizontal overflow;RTL + CSS zoom200% inspected |
| Writing |Approval vs processing distinguished;optional persistent choice explicit;skip vs deny separate;recovery directions;all demo effects labelled local |
| Typography |Inter16/24px500 titles,14/21px400 body,12/18px400 badges;full copy wraps;no clamp |
| Colors |Computed WCAG2 text ratios below;existing fixed marker roles;no new palette;selected check redundant with checked state |
| UI |Transparent r24 cards,pill actions,quiet inset summary/numbered rows;40px desktop/44px narrow actions;reference-informed adaptation |

| Computed contrast | Light | Dark |
|---|---|---|
| Title / canvas |12.27:1 |11.86:1 |
| Description / canvas |5.49:1 |5.80:1 |
| Badge label / badge |10.39:1 |9.99:1 |
| Summary secondary / inset |4.65:1 |5.18:1 |
| Primary action |16.29:1 |13.74:1 |
| Secondary action |10.39:1 |9.62:1 |
| Decorative status icon minimum |4.64:1 |5.18:1 |

Browser:8 focused Chromium checks passed(desktop/mobile),including real catalog
entry,both themes,keyboard,validation,skip/deny,retry,long text and forced colors.
Command:`PLAYWRIGHT_BASE_URL=http://127.0.0.1:5296 npm run test:browser -- decisions.spec.ts --reporter=line`.
Package:`npm run verify` passed(build,typecheck,94 components/90 tokens,
docs guard,consumer guard,31 guard/routing tests,packed import/parity).
Explicit consumer check:`node packages/beds/scripts/check-consumer.mjs apps/web/labs/espaco-library/DecisionExamples.tsx`;
1 file,0 violations. Default compact radios also checked independently in the
same catalog fixture;their selection does not change the question.

Inspected captures:
[mobile dark approval](../../../apps/web/labs/espaco-library/evidence/decisions/mobile-dark-approval.png),
[mobile light question](../../../apps/web/labs/espaco-library/evidence/decisions/mobile-light-question.png),
[keyboard selection](../../../apps/web/labs/espaco-library/evidence/decisions/desktop-selected-focus.png),
[long narrow copy](../../../apps/web/labs/espaco-library/evidence/decisions/mobile-dark-long-320.png).

Not verified:VoiceOver,physical devices,Firefox/Safari,APCA,real browser zoom
(CSS zoom proxy only),production flows or whole-library conformance. Independent
review and owner aesthetic approval remain **PENDING**;technical QA is not approval.
