# EmptyStateCard — illustrated empty states

Scope: portable BEDS component;catalog `?view=empty-state`;synthetic data only.
No Curriculol route,query,queue,storage or production integration.

## Use / API

```tsx
import { EmptyStateCard } from 'beds';

<EmptyStateCard
  title="Tudo em dia por aqui"
  description="Nenhum processo pendente."
  image={{ src: artworkUrl, alt: '' }}
/>

<EmptyStateCard
  icon="Briefcase"
  headingLevel={3}
  title="Sua próxima oportunidade começa aqui"
  description="Encontre uma vaga e salve sua primeira candidatura."
  image={{ src: artworkUrl, alt: '' }}
  action={{ label: 'Buscar vagas', onClick: openJobSearch }}
/>
```

Required:`title/description` and exactly one visual source:
`image:{src,alt,fallbackLabel?}` or `illustration="empty-folder"`.
The union rejects both sources together;existing image calls stay compatible.
Optional:`icon`(Inbox default),`headingLevel`(2 default;3 within H2 section),
`action:{label,onClick,disabled?,busy?}`. Exported type:`EmptyStateCardProps`.
No children/style/className/size/color overrides. One optional next-step action;
all-clear does not need a CTA. Caller owns condition,request,success/recovery,
current busy label and any result announcement. Never hide a request failure
behind a friendly empty state;render the actual recovery instead.

| Pattern | Intended use |
|---|---|
| EmptyState |Compact list/panel emptiness;existing API and visuals unchanged |
| EmptyStateCard |Roomy first-use or all-clear message;image or built-in empty-folder illustration supports copy |
| FeatureCard |Image-first onboarding/feature introduction;primary + optional secondary action |

## Reference / geometry

Source:September15 user-supplied inbox-zero raster
`codex-clipboard-6d324053-5671-4f2e-b8b9-c5e5d77351af.png`.
Observed hierarchy/icon tile/quiet frame informs **A adaptation**,not measured
source CSS. Fixed480px maximum,r24,p8,32px icon,Inter18/24px500 title,
14/22px description,15:7 lower image,r16;canonical
[Foundations](FOUNDATIONS.md) owns full geometry. No new tokens/palette/motion.

Catalog landscape/list artwork is original SVG for light/dark,not the source
illustration. It is example content,not bundled default art or a public
subcomponent. Host supplies an owned image;keep essential information in
text,not in cropped media. Prefer15:7 assets;fixed `object-fit:cover`.

## Flow / accessibility

Condition → named article,H2/H3 + associated description. Decorative icon never
joins focus/AX. Required image alt:empty for decorative art;meaningful when
the image contributes information not already in copy.

Loading reserves media geometry;title/description/action remain usable.
Failure/blank source preserves the frame;informative alt remains accessible
with optional visible fallback label;decorative failure stays quiet. New src
resets the internal image state;cached load/re-entry works. No empty-src
request,retry loop or autonomous action. Internal CardMedia helper also serves
FeatureCard with its original3:2 frame/classes;not a public export.

Action:shared native button,keyboard/focus behavior,40px minimum desktop/44px
narrow;long copy grows,no clamp. Busy/disabled prevents activation. No new
animation in the image variant;forced colors keeps structural outline. Card itself is not a live
region;announce asynchronous results in caller-owned status when appropriate.

Context7 unavailable;no new dependency. Existing React state/effect pattern
reused;official fallback:[reset state with a key](https://react.dev/learn/preserving-and-resetting-state#resetting-state-with-a-key).

## Review checkpoint

This checkpoint covers the original image variant. The additive folder variant
and its current evidence follow below;historical counts remain unchanged.

Candidate `0.1.7-rc.16-local.14`;local only. No publication,commit,push or
consumer upgrade. Better interface/accessibility/layout/writing/typography/
colors/ui read;frontend-design and ui-skills-root used. Reference hierarchy,
optional CTA,decorative semantics,natural wrapping and concentric radii applied.

| Domain | Inspected evidence | Result |
|---|---|---|
| Accessibility |Named article,H2/description association;decorative vs informative alt;Tab/Shift+Tab + Enter;busy/disabled;forced colors |No actionable finding in inspected Chromium scope |
| Layout |320/390/938/1440px,both themes;long copy;RTL + CSS zoom200%;reserved image size on loading/failure |No horizontal overflow or clipped text found |
| Writing |All-clear without needless CTA;first-use next step;local action feedback;no fake request |Example copy inspected;host owns domain condition |
| Typography |Inter18/24px500 title;14/22px400 body;natural wrapping,complete action label |Rendered desktop/mobile inspected |
| Colors |Computed foreground/background pairs below;fixed tokens;artwork is decorative content |WCAG2 ratios pass for inspected text/focus pairs |
| UI |Transparent body,r24/r16 concentric frame,32px tile,40/44px action,quiet no-motion illustration |Reference-informed adaptation;owner visual approval pending |

| Rendered contrast | Light | Dark |
|---|---|---|
| Heading |`#37352e/#ffffff`12.27:1 |`#d4d4d4/#191919`11.86:1 |
| Description |`#6a6966/#ffffff`5.49:1 |`#949494/#191919`5.80:1 |
| Action |`#ffffff/#202020`16.29:1 |`#242424/#f1f1f1`13.74:1 |
| Keyboard focus / surrounding canvas |`#0077e6/#ffffff`4.39:1 |`#b9b9b9/#191919`8.96:1 |

Executed:`npm run verify`(build,typecheck,90 components/90 tokens,docs guard,
consumer guard,31 guard/routing tests,packed import/parity);explicit consumer
check of `EmptyStateExamples.tsx`(0 violations).
Browser:`PLAYWRIGHT_BASE_URL=http://127.0.0.1:5296 npm run test:browser -- empty-state.spec.ts feature-card.spec.ts --reporter=line`:
18 passed(8 new-state checks +10 shared-media FeatureCard regressions).
Real catalog entry,action,recovery,cached re-entry,unavailable/decorative media,
loading geometry,long copy,theme/responsive/forced-color checks included.

Inspected captures:
[dark desktop](../../../apps/web/labs/espaco-library/evidence/empty-state/desktop-dark-detail.png),
[light mobile](../../../apps/web/labs/espaco-library/evidence/empty-state/mobile-light-detail.png),
[long narrow copy](../../../apps/web/labs/espaco-library/evidence/empty-state/mobile-dark-long-320.png),
[zoom/RTL](../../../apps/web/labs/espaco-library/evidence/empty-state/desktop-light-zoom-rtl.png).

Not verified:VoiceOver,physical devices,Firefox/Safari,APCA,real browser zoom
(CSS zoom is a proxy),production integration or whole-library conformance.
No remaining actionable finding in inspected component scope;independent
review and owner aesthetic approval remain **PENDING**.

## Empty folder — September15 motion addition

```tsx
<EmptyStateCard
  illustration="empty-folder"
  icon="Briefcase"
  title="Sua primeira candidatura começa aqui"
  description="Salve uma vaga que combine com você. Seus próximos passos ficam organizados aqui."
  action={{ label: 'Buscar vagas', onClick: openJobSearch }}
/>
```

Preview:`?view=empty-state&preview=folder&theme=dark&brand=curriculol`.
Catalog situation selector also offers `Sem vagas`,with `Rever filtros` callback;
no request,route/filter modification or product integration. Friendly art is
optional:use plain EmptyState for dense panels,frequent filter changes or
contexts where playful emptiness feels inappropriate. Never use flies for
loading,error,missing permissions or a promise that jobs are being fetched.

Reference:[owner-supplied folder/flies video](https://cdn.collectui.com/amplify_video/2072727830908272640/vid/avc1/1150x886/9QiU_dVu6ws3B8Jm-optimized.mp4).
Observed in browser at0/3/12s:quiet empty folder,small independent flying insects,
stationary labels. A adaptation:original SVG with three flies instead of four;
existing semantic surfaces and restrained brand tint instead of the reference's
blue glass material. No copied video/artwork,new dependency or new token.
Context7 unavailable;existing React observer/visibility lifecycle reused from
Carousel. No animation library API introduced.

State loop:host confirms zero items → named empty-state card → optional
decorative flight reinforces empty folder → host-owned next-step action.
The action and all text are immediately usable. Playback never triggers a
request,completion,sound,announcement or delayed navigation.

| Motion / anatomy | Contract (A) |
|---|---|
| Artwork |280px maximum width,220:160 aspect;shrinks to parent;stationary layered folder + subtle shadow;IDs isolated with useId |
| Colors |Existing surface/subtle/raised/outline;brand-to-transparent gradient overlay at18% back/10% front opacity(same layered approach as document upload);theme-aware flies;no semantic meaning in tint |
| Flight |Three independent CSS transform loops7.8/9.2/6.6s;cubic-bezier(.45,0,.55,1);−2.4/−1.2s phase offsets;maximum30 SVG units travel per axis |
| Wings |180ms ease-in-out alternate scaleY(.72→1);no flash/opacity animation |
| Playback |Visible native `Pausar animação`/`Retomar animação` ghost button;12/18px secondary text;32px desktop/44px narrow or coarse pointer;focus stable after toggle |
| Paused |Freezes current CSS playhead;resume continues,not restart;manual pause survives visibility changes and copy updates in same instance |
| Hidden/offscreen |IntersectionObserver + document visibility pause both flights and wings;listeners disconnected on unmount;no frame-driven React updates |
| Reduced motion |CSS opt-in under no-preference only;static full illustration,playback hidden;CTA unchanged;preference changes apply live |
| Forced colors |Decorative illustration/playback hidden;heading,explanation,CTA and structural outline retained |

All SVG content is aria-hidden,nonfocusable,pointer-transparent. There is no
image request/loading/failure for built-in art;host data errors must still use
recovery UI. Default image rendering/media geometry and compact EmptyState are
unchanged. Remount starts a fresh illustration;copy changes alone do not.

### Scoped review — local.24 source addition

Better suite(all seven entrypoints),frontend-design,ui-skills-root motion
routing,add-game-juice and repo-adapted emil-design-eng/review-animations applied.
No additional runtime. Review is self-review,not independent approval.

| Domain | Evidence / result |
|---|---|
| Accessibility |Named article,decorative SVG,keyboard pause/resume/action and focus continuity;static reduced motion;forced colors;no actionable finding in inspected Chromium scope |
| Layout |Both themes,desktop/mobile,320/1440px,long title/action,RTL + CSS200% zoom proxy;no horizontal overflow |
| Writing |Empty result distinguished from failure;one concrete next step;playback label describes only animation;catalog feedback explicitly simulated |
| Typography |Existing Inter18/24 title,14/22 description;new12/18 playback;full wrapping preserved |
| Colors |Semantic roles unchanged;heading/body/CTA ratios from image checkpoint apply;new secondary playback on canonical canvas uses same body pair,primary ink on hover |
| UI / motion |Reference inspected,original folder/flies;no moving hit targets;pause freezes/resumes current position;offscreen and synthetic hidden-tab guard verified |

Browser:`PLAYWRIGHT_BASE_URL=http://127.0.0.1:5296 npm run test:browser -- empty-folder.spec.ts empty-state.spec.ts --reporter=line`:
14 passed(6 folder +8 image-state regressions). Screenshot checks use static
reduced-motion frames;separate runtime assertions verify actual transform
movement,pause/resume and dynamic preference changes.

Inspected:[dark desktop](../../../apps/web/labs/espaco-library/evidence/empty-state/desktop-dark-folder.png),
[light mobile](../../../apps/web/labs/espaco-library/evidence/empty-state/mobile-light-folder.png),
[long zoom/RTL](../../../apps/web/labs/espaco-library/evidence/empty-state/mobile-dark-folder-zoom.png).
Static/artifact gate result:see current [Validation](VALIDATION.md) checkpoint.

Not verified:VoiceOver,physical devices,Safari/Firefox,real OS zoom,actual
background-tab throttling(hidden event tested synthetically),multi-instance
frame-time/compositor profiling. No60fps/GPU claim. Independent review and
owner aesthetic approval **PENDING**;no release or Curriculol integration.
