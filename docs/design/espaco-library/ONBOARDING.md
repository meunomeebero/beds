# Onboarding — focused form and live preview

## Current ownership — optional app recipe

This composition and its related types are **not exported from `beds`**.
Source: `apps/web/labs/espaco-library/recipes/onboarding.tsx`.
Apps own its page layout, identity and product policy; this is an optional
example, not a required style-guide composition. Read [Agnostic DS](AGNOSTIC-DS.md)
and [API boundaries](API-BOUNDARIES.md) before adoption.

The review results below describe the dated pre-extraction snapshot only.
They do not prove the current recipe or private candidate passed those checks.
Current verification status belongs to the migration ledger.


## Scope

`Onboarding`: standalone page composition;brand → form → primary action,with a
decorative workspace preview alongside. Not FeatureCard,not a modal,not a step
engine. Caller owns fields,validation,steps,requests,persistence and navigation.

Reference:owner screenshot `codex-clipboard-6f00a941-cc8c-48a8-95f4-0f8445c9e50a.png`.
**A adaptation**:split composition,quiet outline,generous corners and inset
workspace illustration. The recipe owns page geometry;
no claim of CSS measurement from a resized raster. Reference artwork/logo not
copied. Existing BEDS neutrals,Inter,BrandMark and controls retained.

## Optional recipe contract

| Input | Ownership |
|---|---|
| `title`,optional `description` |H1 and form accessible name/description;one main landmark. Do not nest inside another main or use alongside another page H1 |
| `brandMark` |Caller-owned identity;optional public BrandMark;no embedded product logo |
| `children` |Public fields/layout primitives;no nested form. Host supplies visible labels,autocomplete,input types and inline errors |
| `submitLabel`, `onSubmit` |Native submit and Enter;default enabled;host validates then decides next action;no implicit network call |
| `busy`, `disabled` |Native disabled fieldset and action guard;busy preserves button label plus existing loader;form exposes aria-busy. Host restores state and focus after an actual result |
| `secondaryAction` |Optional labelled callback;ghost,below primary;blocked while unavailable. Destructive/unsaved navigation requires caller confirmation |
| `feedback` |Optional message and neutral/success/error tone;stable polite region plus separate alert region;host supplies actual result and recovery |
| `preview` |Optional name/detail/section IDs and labels;static decorative duplicate of supplied form data,not a live product screenshot. No actions,loading announcement or unique instructions |
| `footer` |Optional public content/actions outside form;terms/help or catalog-only controls. Must not carry a second competing primary action |

This recipe has no visual-override props; apps may adapt its own HTML/CSS and
layout rather than extending the BEDS runtime. Its form-only example centers at
480px maximum; this is not a universal DS width. Onboarding creates
no account/upload/scoring operation and does not decide which fields are required.

## Flow and state

Entry → type/preview update → native submit → host validation or busy → host
success/error → retry with values retained. Host must focus the first invalid
field and remove stale errors after correction;component never clears inputs.

Preview is aria-hidden and has no focusable descendants. It disappears when the
available component width cannot support two columns. All instructions,errors
and actions remain in the form. No animated skeleton,entrance or fake progress.
Existing control feedback/reduced-motion behavior unchanged.

## Demonstration

Catalog navigation:Onboarding → `?view=onboarding&theme=light` or `theme=dark`.
[Example](../../../apps/web/labs/espaco-library/OnboardingPage.tsx):synthetic personal
identity form,name required only in this fixture. Optional role/city/portfolio
are illustrative,not new Curriculol onboarding requirements. Website input accepts
plain text/domain;no validation,fetch or profile import implied.

Footer lets a reviewer choose success/error/pending. Pending settles only through
an explicit simulation button;no timer pretends to complete a real operation.
Success explicitly says no data was sent. Reload discards fixture state.

## Historical review checkpoint — September15

Candidate:`0.1.7-rc.16-local.19`;BEDS catalog5296. No implicit upgrade of5292,
real application integration,publication,commit or push. Seven Better entrypoints
plus frontend-design/ui-skills-root used. Context7 unavailable;official fallback:
[React form](https://react.dev/reference/react-dom/components/form),
[MDN fieldset](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/fieldset).

| Domain | Scope / evidence |
|---|---|
| Accessibility |Native form/fieldset/buttons,labelled inputs;keyboard Enter/Tab and error focus checked;disabled busy fields;preview excluded;assistive-device checks excluded below |
| Layout |Two equal columns;form-first order;decorative preview hidden below740px available width;natural form height,no fixed clipped action |
| Writing |PT-BR sentence case;explicit optional fields;local-success disclaimer;error says how to retry;no promises of an actual account/profile |
| Typography |Inter20/28 heading,14/21 description;input14 desktop/16 mobile;no truncation of actual form content |
| Color |Rendered light/dark:heading12.27/11.86,description5.49/5.80,label12.27/11.17,input12.27/11.40,primary CTA16.29/13.74;all text pairs above4.5:1 |
| UI |Transparent r24 shell,4px inset/r20 preview;quiet neutral illustration;existing controls;no new animation or dependency |

Verification:`npm run verify` passed with99 public components,90 tokens,
31 guard/routing tests and packed consumer smoke;explicit OnboardingPage consumer
scan:0 violations. Scoped browser suite:6 tests passed,desktop/mobile with both
themes,320px,RTL,200% CSS zoom,long copy,reduced motion,forced colors and recovery.
Initial mobile CTA cascade conflict corrected in the shared component;44px
target now verified. Visual inspection:desktop light/dark and mobile light.
Source evidence:`apps/web/labs/espaco-library/evidence/onboarding/`.
No unresolved findings in the inspected core flow;independent review and owner
aesthetic approval pending. VoiceOver,physical devices,Safari/Firefox,actual browser zoom,
APCA and real service integrations not verified. Optional secondary action and
form-only composition not yet browser-verified.
