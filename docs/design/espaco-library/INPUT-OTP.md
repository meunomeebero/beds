# InputOTP

`InputOTP` is the BEDS controlled one-time-code primitive. It keeps the `input-otp@1.4.2` native input as the owner of keyboard navigation, selection, paste and autofill, while the visual slots are an accessible projection of that value. Verification belongs to the caller.

## Contract

- `label`, `value` and `onChange` are required. `maxLength` is `4`, `6` or `8` and defaults to `6`.
- `status` is caller-controlled: `idle`, `processing`, `error` or `success`. `processing` and `success` make the input read-only; `error` remains editable for recovery.
- `message` is caller-owned and remains the readable status signal. `aria-invalid`, `aria-busy`, `aria-describedby`, `autocomplete="one-time-code"`, `inputmode="numeric"` and the native label are emitted by BEDS.
- Paste removes every non-digit and respects `maxLength`. `onComplete` fires only when the controlled value crosses from incomplete to complete; a rejected controlled update remains rejected.
- Optional children compose `InputOTPGroup`, `InputOTPSlot` and `InputOTPSeparator`. Slot indices must cover the declared length exactly. Multiple instances do not share state.

## Motion adaptation

The source review adopted the compatible motion intent from beUI `otp-input` without importing beUI at runtime. Digit enter/exit is `14px` vertical travel with opacity and blur over `220ms` using BEDS `EASE_OUT`; the caret blinks with a `1s` linear cycle; a newly entered error shakes the group through `[0,-5,5,-3,3,-1,0]` over `450ms`; success mounts the BEDS `Check` icon inline in `.es-otp-message` from `scale(.6)`/opacity `0` to `scale(1)`/opacity `1` with a `500/28` spring. The presence wrapper stays mounted so status transitions animate, while `initial={false}` keeps an SSR success state at its final frame. Success copy retains the semantic secondary text token and the icon uses the existing success marker token; rendered contrast is recorded below. `useReducedMotion` settles these states immediately and keeps focus, status text and slot geometry unchanged.

The upstream pathLength draw and `100ms` delay are omitted because the BEDS `Icon` owns the Lucide path. The supplied source/hash also contains no `layoutId` gliding focus ring, so no such effect is invented. There is no raw SVG, new dependency or runtime beUI import.

## Acceptance evidence

| Acceptance criterion | Spec/evidence | Result | Pending or limitation |
|---|---|---|---|
| 4/6/8 lengths, custom grouping and max length | `apps/web/labs/espaco-library/otp.spec.ts` — `OTP lengths`, desktop/mobile | PASS: exact slot counts, group/separator composition and clipping verified | None in Chromium lab |
| Keyboard, paste, backspace, completion and recovery | same spec — `OTP entry, paste and recovery`, light/dark desktop/mobile | PASS: fill, End, Backspace, retype, mixed paste, max-length paste, error recovery and clear verified | Physical keyboard/AT remains pending |
| Caller-owned controlled state and multiple instances | same spec — `OTP controlled rejection keeps caller value and instances isolated`; `OTP delayed controlled acceptance keeps the caller value until it accepts`; SSR fixture | PASS: rejected writes stay empty, delayed acceptance stays empty until the caller commits, and independent instances retain separate values | External consumer integration remains pending |
| Processing/success/error semantics | same spec — main flow, `OTP repeated error and recovery replays the shake and clears the invalid state`, `OTP success presence exposes entrance, exit and interruption intermediate frames`, forced-colors case | PASS: read-only/busy, success icon/message, editable error, repeated recovery, active forced-colors focus and status cues verified | Native AT announcement remains pending |
| Intermediate and settled motion | same spec — `OTP digit entry enforces y, blur and opacity, then settles to the same identity`; `OTP rapid digit replacement and removal preserve intermediate exits and settled identity`; `OTP repeated error and recovery replays the shake and clears the invalid state`; `OTP success presence exposes entrance, exit and interruption intermediate frames` | PASS: digit y/blur/opacity, old/new digit identity, removal exit, repeated shake and success entrance/exit/interruption frames are asserted before settled identity | Exact frame timing can vary by browser scheduler |
| Reduced motion | same spec — `OTP normal caret blinks while reduced caret remains static`; `OTP reduced motion settles digit, icon and shake across frames` | PASS: normal caret opacity changes across frames; reduced digit/icon/shake/caret remain settled across frames | Runtime preference switching remains pending |
| Geometry/overflow at lab viewport sizes | same spec — slot bounds and document scroll width; `OTP CSS zoom proxy` | PASS: slots stay stable, at least 24px and no document overflow; CSS zoom proxy exercised | Native browser zoom and physical devices remain pending |
| Light/dark/forced colors evidence | `evidence/otp/desktop-light.png`, `desktop-dark.png`, `mobile-light.png`, `mobile-dark.png`; `OTP forced colors preserves the active focus ring and status cues`; success contrast cases | PASS: desktop/mobile light/dark browser checks rerun; retained screenshots remain historical evidence; rendered success text/icon contrast is light `5.4897`/`5.4788` and dark `5.7959`/`8.0331` against the root background | Aesthetic sign-off and non-Chromium screenshots remain pending; no new PNG baseline was committed in this rework |
| SSR and package boundary | `OTP controlled instances hydrate from renderToString without warnings`; package typecheck/build/verify plus no beUI import in source | PASS_WITH_EXTERNAL_PREREQUISITE: two controlled instances render and hydrate without warnings or ID collisions; implementation uses the client boundary and existing package dependencies | The clean HEAD worktree lacks two historical drawer PNGs referenced by pre-existing docs, so verify requires a temporary symlink to preserved primary checkout evidence; no historical asset is copied or committed |

The technical result is reviewable independently from aesthetic approval. The scoped browser rerun used the isolated BER-29 port `5293` with `--grep-invert 'evidence capture'` in both desktop and mobile projects; the retained OTP PNGs are historical evidence. The main repository preview on `5283` was left running.
