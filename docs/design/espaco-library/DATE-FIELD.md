# DateField

`DateField` is the portable, labelled calendar-date form control. It is a
controlled native `<input type="date">`, not a custom calendar, date picker or
wheel selector. It exists for flows that capture one calendar date while leaving
product policy outside BEDS.

## Public contract

```tsx
<DateField
  label="Data de envio"
  value={sentAt}
  onChange={setSentAt}
  name="sentAt"
  max="2026-09-20"
/>
```

Required props are `label`, `value` and `onChange`. `value`, `min` and `max`
use the native ISO calendar-date format `YYYY-MM-DD`; `value=""` is a valid
empty state. Optional `description`, `error`, `disabled`, `readOnly`, `name`,
`autoComplete`, `focusOnError`, `reserveErrorLine` and `required` use the same
semantics as `TextField`. The forwarded ref targets the native input.

The browser owns locale-specific presentation and the calendar affordance.
The host owns date arithmetic, timezone conversion, validation copy,
availability, future-date rules, persistence, requests and recovery. BEDS does
not silently clamp an entered date, parse it, infer a timezone or report a
successful save.

## State and accessibility

The persistent label is associated with the native field. Description and error
IDs are exposed through `aria-describedby`; an error sets `aria-invalid` and
can focus the field only when the caller requests `focusOnError`. `min`, `max`
and `required` remain native constraints, so keyboard, form participation,
platform calendar and RTL behavior stay browser-owned. Empty, disabled,
read-only and error states retain the same field geometry and error-slot
behavior as `TextField`.

No internal loading, request, success, custom popup, animation or business-date
state exists. The shared beUI-input error motion is reduced-motion guarded; it
never carries the field's meaning alone.

## Sourcing and evidence

beUI static registry was searched 2026-09-20. Its `wheel-picker` is a date/time
wheel-selection composition and is **NO_FIT** for a labelled native calendar
form field. `DateField` therefore extends BEDS's existing MIT beUI `input`
adaptation rather than copying a custom picker. The upstream reference,
attribution and adaptation boundary are recorded in the repository's
`THIRD-PARTY-NOTICES.md`; the retained future-reference row is in
[beUI opportunities](BEUI-OPPORTUNITIES-2026-09-16.md).

The catalog is frozen by the current product scope, so no new laboratory view is
created for this primitive. Focused source regression and full package static
gates are required before handoff; rendered light/dark, narrow, keyboard,
screen-reader, zoom, native-browser and aesthetic checks remain pending until a
separate visual-validation scope is authorized.
