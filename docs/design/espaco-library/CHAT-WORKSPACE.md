# Chat workspace

`ChatWorkspace` is an optional app-owned recipe adapted from beUI `chat-app` for
a single controlled conversation: visible workspace heading, chronological
transcript, incremental assistant content, a native composer, and a recoverable
terminal error. It is not an agent runtime or a replacement for the existing
chat primitives.

It lives in `apps/web/labs/espaco-library/recipes/chat-workspace.tsx`, outside the
portable runtime. Copy or adapt it only when its whole composition fits the app;
otherwise compose the individual conversation controls. Its three source-contract
tests moved with the recipe. The catalog compiles its utilities independently;
the package no longer ships its workspace-specific utility classes.
Read [Interface quality](INTERFACE-QUALITY.md) and its linked skills before use.

## Optional recipe contract (not a package export)

```tsx
import { ChatWorkspace, type ChatWorkspaceMessage } from './recipes';

const messages: ChatWorkspaceMessage[] = [
  { id: 'user-1', role: 'user', content: 'Compare these two roles.' },
  { id: 'assistant-1', role: 'assistant', state: 'streaming', content: reply },
];

<ChatWorkspace
  label="Example conversation"
  title="Conversation"
  messages={messages}
  draft={draft}
  onDraftChange={setDraft}
  onSubmit={sendTurn}
  state="streaming"
  onCancel={cancelTurn}
  error={streamError ? { message: streamError } : undefined}
  onRetry={retryTurn}
  composerLabel="Message"
  sendLabel="Send message"
  cancelLabel="Stop response"
  retryLabel="Try again"
  streamingLabel="Responding"
  emptyState="Ask a question to begin this conversation."
/>
```

| Input | Contract |
|---|---|
| `label`, `title` | Required accessible transcript name and visible heading. The host localizes both. |
| `messages` | Ordered controlled items with stable `id`, `role`, host-rendered `content`, optional `state="streaming"`, and optional accessible `label`. Updating the same id exposes incremental transcript content; BEDS does not parse Markdown, citations, tools, or sources. |
| `draft`, `onDraftChange`, `onSubmit` | Controlled native textarea. Submit receives only a trimmed non-empty draft; BEDS never clears host text or infers success. |
| `state`, `disabled`, `onCancel` | `state="streaming"` locks sending/editing and exposes a named cancel action only when supplied. `disabled` is host authority and disables every workspace action. |
| `error`, `onRetry` | A factual host error is an alert. Retry appears only with a host callback and does not imply that a request was made or that it will succeed. |
| labels / `placeholder` / `emptyState` | Localized, host-owned content. The component supplies English fallbacks only for generic control labels; consumers should pass their product language. |

## States and accessibility

| State | Presentation behavior | Host responsibility |
|---|---|---|
| Empty | Optional truthful `emptyState`; composer stays available. | Explain the next valid action; no fabricated prior conversation. |
| Ready | Ordered transcript and native composer. | Keep message IDs stable and own all persistence. |
| Streaming | Only a marked assistant item is a polite incremental live region; only the composer form exposes busy state; the composer cannot submit another turn. | Map real stream frames and terminal reconciliation; offer `onCancel` only when cancellation is actually supported. |
| Error | Visible `role="alert"`, preserved controlled draft, optional explicit retry. | Supply the real recovery text and idempotent retry/cancel behavior. |
| Disabled | Input and supplied actions are disabled without a fabricated reason. | Explain an unavailable action outside the component when product policy requires it. |

The transcript is an ordered list, messages retain role-based labels, icon glyphs
are decorative, and the textarea has a visible native label. The current
assistant message exposes its incremental text through a polite live region;
neither that message nor its transcript ancestor is marked busy, so the update
is not suppressed. The separate composer form is busy while the host streams.
Enter submits, Shift+Enter makes a line break, and IME composition never submits
prematurely: the handler checks both `nativeEvent.isComposing` and WebKit's
composition sentinel (`nativeEvent.keyCode === 229`). Focus has a visible
token-based ring that maps to `Highlight` in forced-colors.
Content wraps rather than clipping; the composer uses a 16px touch input. The
layout inherits document direction, uses logical start/end bubble corners, and
does not automatically scroll a reader away from older content. Under
`prefers-reduced-motion`, entry, press and streaming-dot motion settle without
transform travel; text and ARIA states remain present.

## Boundary

The caller owns sessions, identity/anonymous tokens, SSE frames, abort signals,
silence watchdogs, transcript reconciliation, retries, credits, confirmation,
network failures, persistence, and routing. This component does not call a
network API, calculate charges, create a session, or infer that a streamed
response completed.

Current Curriculol handoff: retain `career-chat-api` and the stream hook, then
map their incremental transcript, disabled, cancel, error, and retry states to
this surface. The application-owned backend contract is deliberately not linked
from this portable package: it remains an integration concern, not shipped
library documentation.

## beUI provenance and extraction boundary

Source direction: beUI [`chat-app`](https://beui.dev/components/agents/chat-app)
([raw source](https://beui.dev/r/chat-app/raw)), MIT, consulted 2026-09-20
through the static registry because no beUI MCP was available in this checkout.
The retrieved raw source SHA-256 is
`1cdd61e981ec04933357997277d99a2a5b918be1cb71c38b360bbd8b0ce8c45e`; the
registry metadata observed on the same date is
`5fa25847e0a302f34107a1bf46d35e98068ab3d79eb1861815aee648aea5325d`.

The adaptation keeps only the shell/transcript/composer anatomy, controlled
message identity, modest message entry, streaming status and reduced-motion
guard. It deliberately excludes the upstream animated sidebar, planning,
approvals, tools, code/shiki rendering, diffs, generated media, citations,
resource navigation, model selection, attachment policy, and all runtime
network behavior. No beUI runtime import or dependency was added. Existing
`Conversation`, `ConversationBubble`, `ChatComposer`, `ChatMessage`,
`ChatThread`, `ChatOptions`, and `SuggestionRow` remain public individual controls.
`ChatLayout` also moved to an app recipe: its centered 640px start screen,
suggestions and recent-task hierarchy are not a universal chat contract.
`ChatComposer` now respects host-disabled state on its cancel button and guards
both isComposing and keyCode229 before interpreting Enter as submission.

## Evidence status

Implementation and static/package gates are recorded by the implementing task.
Visual review in both themes, desktop/mobile, keyboard, RTL, long content,
forced-colors and reduced-motion remains a separate pending BEDS review; no
frontend E2E suite is part of this task, and technical checks are not aesthetic
approval.
