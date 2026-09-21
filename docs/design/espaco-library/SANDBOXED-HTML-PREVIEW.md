# Sandboxed HTML preview

`SandboxedHtmlPreview` renders complete, server-produced HTML as a read-only
document inside an existing BEDS `Dialog` or `Drawer`. It exists for an operator
to inspect the exact campaign or newsletter that the host received before a
separate, deliberate host action. It is not an email editor, Markdown renderer,
network client, sanitizer or confirmation control.

## API

```tsx
<SandboxedHtmlPreview title="Campaign preview" html={preview.html} />
```

`title` is the iframe's accessible name. `html` is the complete document from a
host-controlled source. The host owns whether that source is trusted, loading,
missing-template/error/retry states, the surrounding overlay, and every action
after review.

## Isolation contract

The native `iframe` uses `srcDoc`, an empty `sandbox` attribute and
`referrerPolicy="no-referrer"`. The empty sandbox applies the full restriction
set: the component grants no script, same-origin, form, popup, top-navigation,
download, clipboard or storage exception. It neither fetches nor parses the
HTML. The frame is responsive but intentionally fixed-height; the document owns
its own reading scroll.

The outer frame uses only BEDS border, card and focus tokens; its white document
material is a named BEDS color token. It adds no controls or animation so the
rendered email, not local chrome, remains the focal content. Use it only inside
the BEDS overlay that owns focus containment, Escape, dismissal and focus
return.

## States

| Host condition | Required host behavior |
|---|---|
| Loading | Show a BEDS loading/recovery state before mounting the frame. |
| Ready | Mount the named, read-only frame in a labelled Dialog or Drawer. |
| Missing or invalid preview | Explain the condition outside the frame and offer a caller-owned retry or dismissal. |
| Action after review | Keep sending, automation enablement, idempotency, permissions and outcome feedback outside this component. |

## Source decision

On 2026-09-21, the beUI static registry was searched for iframe, HTML, email,
sandbox and document preview components. No compatible source was found, so no
beUI source is copied and no third-party notice is needed. The platform
semantics follow the [MDN iframe reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe).
The static registry search is the available source evidence; Context7 did not
provide a relevant beUI source for this primitive.

## Validation boundary

The requester deferred frontend E2E. Validate source, type, library, docs and
packed-artifact contracts only for this change. Browser rendering, assistive
technology speech, non-Chromium engines, zoom, physical devices, performance
and design-owner aesthetic approval remain pending.
