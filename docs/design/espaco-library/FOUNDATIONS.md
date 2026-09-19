# Espaço library — fixed foundations

Current rules only. Historical values: [Original measurements](REFERENCE-MEASUREMENTS.md); source labels: [Provenance](PROVENANCE.md). Canonical runtime values: `packages/beds/src/tokens.css`; consumer override rules: [contract](CONSUMER-CONTRACT.md). Evidence labels: M measured, D declared, A local adaptation, U unobserved.

## Current user-approved authority

Current user-approved foundation: local Lucy sidebar/dark neutrals, Lucide iconography and the compact legacy account-menu finish. Account-specific geometry is specified below; Inter/Geist, the shared palette, sidebar and page layout remain fixed. These A adoption decisions supersede corresponding historical Marketer measurements without expanding the consumer styling API.

| Adopted context | Current contract |
|---|---|
| Sidebar / collapsed rail |264px /62px |
| Profile/header |42px header minimum;40px profile control;17px profile mark;14px/21px regular text;9px gap;7px horizontal padding |
| Search / collapse controls |32px wide in40px header row |
| Standard navigation |31px high;14px/19.6px,weight400;11px icon/text gap;6px radius;8px horizontal padding |
| Primary navigation |`SidebarSection purpose="primary"`;horizontal40px row;31px selected pill;selected icon fill currentColor/stroke sidebar;inactive outline;4px group gap;9px icon/text gap;11px horizontal padding;14px/21px regular text |
| Sidebar sections |Default17px top;12px/18px labels;8px heading bottom;history15px top/2px row gap;primary3px top/6px bottom |
| Sidebar glyphs |16px navigation glyph; 24×24 Lucide viewBox/1.5 stroke; 17px profile mark; fixed registry |
| Dark neutrals |Local Lucy roles; exact adopted values in canonical token register below |
| Retained type |Inter interface /Geist Mono code; sidebar role sizes above are scoped |
| Retained layout |768px breakpoint;full-bleed main;chat640px/Home720px;dashboard880px only for the isolated Home composition;16px main top inset after the content header;existing mobile chat gutters/composer |
| Light / account |Source palette retained except accessible secondary/badge text; account280px/r12 with the compact finish below |
| Verification |Current browser/token/package checks recorded in [Validation](VALIDATION.md); source evidence is historical |

The adopted main canvas is full-bleed`#191919`. The local prototype's outer`#171717` frame is not restored. Chat640px/Home720px widths and composer dimensions retain their existing geometry. Dashboard880px is an A width for the isolated Home composition; it does not alter the Lucy or MCP lanes. The16px page-top inset is a fresh M measurement from the reference MCP main wrapper; the package applies it after its own `ContentHeader` or mobile bar. Existing24px desktop/16px mobile side gutters and24px bottom inset remain A shell adaptations, not newly claimed source measurements.

| Adopted dark role | Exact value |
|---|---|
| Main/sidebar |`#191919` |
| Popup surface /subtle /raised |`#202020` /`#232323` /`#272727` |
| Hover /pressed /selected |`#ffffff05` /`#ffffff0c` /`#2a2a2a` |
| Quiet control |`#262626` |
| Text /secondary /placeholder |`#cecece` /`#949494` /`#949494` |
| Heading /input text |`#d4d4d4` /`#d0d0d0` |
| Border /subtle /strong |`#ffffff0c` /`#ffffff06` /`#ffffff13` |
| Composer surface /context |`#191919` /`#222222` |
| Composer contour /focus contour |`#ffffff04` /`#ffffff17` |
| Focus |`#b9b9b9` |
| Badge /badge text |`#414141` /`#e5e5e5` |
| Send /send text |`#dedede` /`#292929` |
| Primary/inverse /on-primary |`#f1f1f1` /`#242424` |
| Field /user message |`#191919` /`#232323` |
| Library switch off /thumb |`#414141` /`#c8c8c8`;A mapping for library-only control |
| Account shadow |`0 1px 2px #00000044,0 8px 24px #00000044`;A dark adoption;280px/r12 current account geometry |

Functional information/success/warning/error colors stay unchanged in their existing uses. Inter and Geist remain fixed; only the three sidebar text contexts are A additions in the type metadata. New role aliases keep controls, selection, composer parts, heading/input text, badges andsend surfaces distinct instead of recoloring unrelated components through one shared token. Functional badge tones use fixed theme-specific marker roles, each at least3:1 against `--es-badge`; their 12px text uses the accessible foreground rather than functional ink.

The source light secondary `#787775` is retained as historical neutral step/evidence, but the shared small-text and badge-text role uses `#6a6966` (A). Against the actual light surfaces `#ffffff`, `#fbfaf9` and `#edece9`, it yields 5.49:1, 5.27:1 and 4.65:1 contrast respectively. This is a global semantic-token correction; consumers cannot override it. The composer focus contour retains its measured source color because it is a non-text indicator with a separate UI-component contrast requirement.

`RecentItem` changes its inherited foreground to `--es-text` only while pressed. On light, `#37352e` over `#dbd8d2` is 8.63:1. On dark, `#cecece` remains above 4.5:1 over the pressed translucent surface on every canonical main/surface/subtle/raised background. This component state is A and browser-tested with a held real pointer press in the mobile `hasTouch` context; it does not add a consumer color choice.

Placeholder now shares the already accessible secondary-text role: `#6a6966` on light field `#ffffff` is 5.49:1 and `#949494` on dark field `#191919` is 5.24:1. This is an A accessibility correction, not a configurable visual option. Functional badge text likewise uses `--es-text` over the existing badge surface while the fixed semantic inset uses its contrast-qualified marker role.

## Current card and interaction finish — September 14

Latest user direction: transparent cards and broader corners from the supplied Marketer/Twin screenshots. Appearance adopted; exact CSS dimensions below are A local values, not measurements inferred from resized screenshots. This section supersedes the former generic filled/r10 Surface default. No consumer override.

| Context | Fixed contract |
|---|---|
| Surface / ActivityPanel |Transparent panel fill;1px semantic border;20px panel radius;16px inset. ActivityPanel default retains header divider;purpose=history removes it,keeping spacing and optional dotted HelpLabel |
| SettingsGroup / PlanCard |Same transparent20px/p16 panel contract;no default filled card. SettingsGroup variant=section opt-in removes border/inset;16/24px heading,24px internal rhythm;see settings adaptation below |
| IntegrationRow / MCP client shell |Transparent shell;retain measured14px/16px contextual radii and existing row/tab inset geometry |
| CollectionCard |Transparent fill;24px card radius;20px inset;existing260px desktop/240px mobile inner anatomy |
| Opaque contexts |Popover,tooltip,dialog and explicitly subtle/raised inset surfaces retain semantic fills;floating content must remain legible |
| Logo greeting |Existing BrandMark;17.6px in Home leading slot (owner-requested20% reduction from22px);10px title gap;heading and sidebar unchanged |
| HelpLabel |Dotted2px underline;180ms pointer entry/120ms exit grace;keyboard focus/touch toggle;280px explanation popup,r14,p16;above preferred,viewport-clamped |
| Tooltip |beUI `tooltip` adaptation;8px trigger gap;BEDS r8 compact surface;bottom default to preserve the existing API contract;fixed portal remains inside `.es-root`;viewport-clamped;hover/focus/touch and reduced-motion opacity-only fallback |
| FilterSelect |Transparent36px trigger,r8,p8/10;16px leading calendar and trailing up/down glyphs;existing260px choice popup |
| Hover/selected |150ms ease-out color/background transition;neutral tokens;selected nav remains selected on hover;no transform or spring |
| Carousel |Opt-in continuous forward34px/s;equal-width repeated groups with16px seam gap;instant period rebase between identical content;hidden scrollbar;no visible playback/direction controls |
| PagedCarousel |Manual finite paging;one100% slide per snap;16px trailing gutter;40px circular controls (44px narrow);no autoplay or loop;keyboard movement instant |
| Toast |Top16px centered,max520px;max50dvh scroll viewport,4px focus inset;40px minimum pill,r999 desktop/r16 narrow;8px stack gap;wrapped copy,32px close/44px mobile controls;180ms entrance;reduced motion opacity-only/static pending marker |
| Conversation |8px stack gap;message max80% desktop/88% narrow;14/22.4px text;8px×14px content inset;r18 with contextual8px tail;transparent assistant/user message token;metadata12/16px |
| Reduced motion |Automatic rail stopped;native touch/trackpad/keyboard scroll retained;new hover transitions removed |

September15 status refinement (A, owner requested cleaner application-card
status): `Badge purpose="status"` uses Inter12/18px400, secondary text,
transparent background, no padding/border/shadow,6px dot and6px gap. Dot reuses
existing badge marker tokens by tone; neutral uses secondary. Long labels grow
and wrap without truncation. Static ApplicationCard status adopts this variant;
the beUI `animated-badge` label/marker roll and layout spring are an interaction
adaptation, disabled under reduced motion; upstream status/size/icon/pulse
options are not public BEDS API.
interactive status selectors retain their distinct control shape. Default
`purpose="tag"` retains the compact12/16px badge, unchanged. This is a documented
adaptation for owner review, not a new reference measurement or palette.

Fixed radius tokens: `--es-radius-panel`, `--es-radius-card`. Preserve measured MCP16px shells, account12px popup, compact controls and dialog-specific radii. Do not inflate every component or recolor `--es-surface` to simulate transparent cards.

RC11 explicit user update:loop continuously,remove toolbar. Motion remains34px/s,never reverses or eases to an edge. Hover/focus pauses;touch/wheel resumes1200ms after idle,never during a held pointer;Space on the focused region toggles persistent pause. Resize remeasures each group;controlled card updates do not reset scroll. Three render copies only for overflow,one accessible group;pointer controls keep their positions. No source-screen motion measurement or physical-device performance claim.

### Payment confirmation — September15 adaptation

Owner-supplied receipt-printer video → A candidate:400px maximum,24px rhythm;
centered20/28px500 heading,14/21px description,36px success tile. Housing r24,
p12,existing raised surface;inset r12=24−12,p16,field surface;purchase14/21px,
support12/18px,amount24/30px tabular. Black8px slot,16px top/8px inline margin.
Paper window overlaps housing16px;28px inline inset,20px narrow. Paper is a
fixed white/black document material in both themes using existing tokens,not a
new surface override:28×24×20px content inset,16px inline narrow;12/18px body,
14/21px merchant/total;16px groups,8px rows,8px sawtooth edge. Actions40px minimum,
44px narrow,r999,10×16px inset. All content grows;no fixed text heights.
One1600ms transform reveal after120ms,existing cubic-bezier(.16,1,.3,1);full
layout reserved and actions immediately usable;reduced motion static. No new
tokens or dependency. [Payment confirmation](PAYMENT-CONFIRMATION.md) owns API,
state,reference provenance and validation. Owner aesthetic approval pending.

### Full landing composition — September16 adaptation

Product-first Curriculol playground → A candidate,not measured source CSS.
Shared1040px content;header16/24px inset,24px gaps,44px links/theme control.
Brand20/28px500,10px glyph gap. Below768px:12/16px header,8px gaps,18px brand,
native Menu disclosure with44px summary;full-width popup within16px gutters,
r14,p8,semantic surface/shadow. DOM reading order retained.
Hero1088px outer maximum,64px top/24px sides;36px top/16px sides narrow.
H1 Inter58/1.08,500,−2.4px,17ch;38/1.12,−1.2px narrow.
Description16/1.65,max53ch,24px top;15px/20px top narrow. Eyebrow13/20;
note12/18. Actions48px minimum,r999,p12/20,gap12,28px top;primary brand/on-brand,
secondary neutral. Proof48px top/32px narrow. Sections72/24px or48/16px;
benefits inherit this wrapper without double inset.
Demo r24,p8,semantic context/shadow;inner panels r16=24−8,p24;grid1:1.55,gap8.
Inline container≤650px stacks,p16. Document p20/16,min330px;compact p16/0,no
min-height;identity21/28,body13/21,20px groups,note12/18. No real document output.
Workflow max1040px,three columns/gap48,40px below centered intro;36px numbered
tile/r10,12/18px mono. Narrow vertical list/gap28,36px number +16px gap +copy.
Section H2 32/1.4,500,−.8px;28px/−.5px narrow. FAQ1:1.5,gap64;one column/gap24
narrow;summary64px minimum,16px block inset,15/22px;answer14/23px.
FAQ glyph45deg/150ms existing cubic-bezier(.16,1,.3,1);CTA150ms ease-out
color/shadow only. Both gated by no-preference;no autoplay/new motion dependency.
No new tokens,fonts or palette. [Contract and review](LANDING-PAGE.md).
Owner aesthetic approval pending;published RC16 unchanged.

### Landing footer — September15 adaptation

Owner-supplied footer screenshot → A closing composition, not measured source
CSS. Maximum1040px content;96px top/24px sides/32px bottom;≤767px48/24/24.
Top grid1.5:1,gap48;≤700px container stacks,gap32. Identity13px/1.5 medium,
8px icon gap,24px bottom;H2 Inter32px/1.4 medium,−.8px,22ch maximum;28px/−.5px
narrow. Description14px/1.6,max44ch,12px top. Navigation14px/1.5,44px minimum
targets;group labels12px/1.5;24px inline gaps. Signature48px top,24px vertical
inset;wordmark clamp40px–26cqi–272px,600,1.1,−.065em,heading token at12%
opacity. Static SVG uses brand at0–22% opacity only behind decoration/opaque
CTA. CTA44px minimum,r999,p12×20,gap12,existing primary/on-primary/shadow.
Bottom note/links12px/1.5,solid canvas,24px top;no separator. No new tokens,
palette or motion. [Footer contract](LANDING-FOOTER.md);owner review pending.

### Landing benefits — September15 adaptation

Owner-supplied five-card bento screenshot → A composition,not measured source
CSS. Maximum1040px;72px block/24px inline page inset;≤767px48/16. Container
columns:one below640px,two from640px,three from960px;20px gaps;first item spans
two columns when available. DOM order unchanged. Card r24,p4;media r20=24−4,
220px decorative frame/200px below640px;no fixed text height. Semantic shadow
ring,no hover lift on static cards. Intro Inter32/1.4,500,−.8px;28px/−.5px narrow;
14/1.6 supporting copy;48px intro separation/32px narrow. Card copy16/20/24
top/inline/bottom;18/1.4 medium heading,13/1.6 secondary description,8px gap.
Original static SVGs:layered sheets,profile,analysis lens,chat and status board;
brand radial wash at0–16% opacity,semantic surfaces and existing glyphs;no
reference assets or fabricated metrics. Art strokes use image-outline;placeholder
lines use secondary at22% opacity in both themes. CTA44px,r999,p12/20,primary/on-primary;
32px footer separation,12px gap,note12/1.5. Forced colors omits decorative art.
No tokens,dependency,animation or global geometry changes. [Contract](BENEFITS.md).

### Application kanban — September15 adaptation

Application kanban addition (A, owner screenshot;not measured source CSS):
lanes minimum280px,gap16,r20,p8,subtle fill;horizontal board-only overflow;
below768px stack lanes,gap24. Compact ApplicationCard r14,p16,gap12,canvas
fill,semantic1px border/xs shadow;folio36×40 with30×34 mark,r8. Title14/20
medium;company/metadata12/18;lane heading13/20 medium,count12/18 tabular.
Menus/details/documents44px tall below768px,menu44px square. Existing notes,
scores and folio motion retained;no new animation/drag. [Kanban](KANBAN.md).

### Blog post cards — September15 adaptation

Owner-supplied reader-card screenshot → A compact editorial anatomy,not measured
CSS. Transparent r20 card,p12,gap12,1px semantic shadow ring;hover neutral fill,
stronger ring + existing xs shadow;pressed token,no motion. Leading64px square
thumbnail,r8=20−12,cover crop,existing image outline;48px at≤360px container,
10px gap;metadata stacks author above date/reading time. No-image variant removes
the column. Shared workspace author avatar
16px/r4;title14/21px500,excerpt13/20px400,metadata12/18px400;4px content rhythm.
Topics12/18px400,p0×6,r999,subtle/secondary tokens,4px wrapping gap and4px top
inset. Titles and metadata wrap;excerpt at most two lines,full text at
destination. Feed maximum640px from chat-width role,12px row gap;no fixed card
height. Secondary metadata/excerpt become primary while interacting;topic
surface/ink remain unchanged. [Blog posts](BLOG-POST.md) owns API/QA.

### Date item — September15 adaptation

Owner-supplied events list → A mini-calendar anatomy,not measured source CSS.
DateItem:transparent row,min76px,p12,gap16,r20;no dividers or animation. Narrow
≤767px:p8 inline,gap12,r14. Calendar48px wide,p4,r12;inner r8=12−4;existing
surface + structural shadow ring/xs shadow. Month12px/1.45,500,+.4px,uppercase,
subtle surface/secondary ink,p2 inline;day20/24px500,tabular numerals. Calendar
rests at48px square but grows for longer localized labels. Content
16/24px500 title;13/20px400 description;4px vertical/12px heading-status gap.
Existing transparent status Badge. Full text wraps;short month may grow height.
Native interactive rows use hover/pressed tokens;secondary content becomes
primary on interaction. Static rows retain transparent rest. [Date item](DATE-ITEM.md).

### Document upload — September15 adaptation

Owner-supplied drop-screen reference → A document purpose on FileUploadField.
Transparent r24/p40×24 surface,min-height460px;centered12px rhythm. At≤767px,
p32×16/min-height420px. H2 Inter22/30px500,−.25px (20/28px narrow);body14/22,
formats12/18. Native picker40px minimum/44px narrow,p10×18,r999. Selected row
transparent r14,p8×12,gap12,14/21px full filename;removal40px/44px narrow.
Decorative192×188px stack;three116×152px/r18 sheets,semantic surfaces/shadows,
front28% brand-to-surface tint. No reference palette,extra tokens or motion.
Active drop2px dashed focus boundary,compensated inset,hover-role backdrop plus
host instruction. Compact field geometry unchanged. [Document upload](DOCUMENT-UPLOAD.md).

### FeatureCard — image-led presentation

September14 supplied onboarding-card screenshot → A local adaptation. Exact dimensions are fixed library choices,not source CSS measurements. Concentric radii, inset image outline and restrained shadow are adopted component decisions; current review routing is in [Interface quality](INTERFACE-QUALITY.md). Preserve the image → title → description → actions hierarchy;no caller geometry options.

| Part | Fixed contract |
|---|---|
| Card |360px maximum,width shrinks to parent;transparent;24px radius;8px inset;1px semantic shadow ring plus existing popup shadow |
| Image |3:2 reserved frame;cover crop;16px radius =24px outer−8px inset;quiet placeholder;1px inset outline |
| Outline |`--es-image-outline`:black10% light/white10% dark;decorative image boundary,not a control/focus indicator |
| Content |20px top,12px side/bottom inside8px shell;20px total outer-edge-to-text inset;20px copy/action gap |
| Title / body |H2 Inter18/24px600,−.15px tracking;body Inter14/22px400;8px gap;natural wrap,no line clamp |
| Actions |Existing welcome primary +optional ghost;8px wrapping gap;40px minimum desktop,44px through767px;long labels grow |
| State / motion |Reserved frame on loading/error;no animated skeleton or automatic transition;buttons retain existing interaction/reduced-motion contract |

Use inline on a canonical main/surface background. An overlay must supply its own opaque surface and accessibility behavior;FeatureCard never creates a floating layer. Artwork colors belong to image content,not additional configurable UI colors. Source product artwork is not redistributed.

### EmptyStateCard — message-first illustration

September15 supplied inbox-zero screenshot → **A local adaptation**,not source
CSS measurement. Small contextual icon → title → explanation → optional action
→ illustration. Existing compact EmptyState and image-first FeatureCard remain
separate patterns. No caller geometry overrides or additional tokens.

| Part | Fixed contract |
|---|---|
| Card |480px maximum;shrinks to parent;centered inline;transparent;r24;p8;existing1px semantic shadow ring + popup shadow |
| Content |16px top/inline +24px bottom inside8px shell;16px icon/copy gap;8px heading/body gap;centered alignment |
| Icon |32px tile;r8;transparent;semantic ring + xs shadow;16px Lucide glyph,existing stroke;Inbox added to fixed registry |
| Type |H2 default/H3 opt-in;Inter18/24px500,−.15px tracking;description14/22px400 secondary;natural wrapping |
| Action |Optional single shared welcome primary;8px additional gap;40px minimum desktop/44px through767px;long labels grow |
| Media |15:7 reserved frame;cover crop;r16=24−8;existing image outline and subtle loading/failure surface;no motion |

Radii/space/shadow follow existing roles;480px,15:7 and message hierarchy are
documented adaptations to this reference. Illustration colors are content,
not new theme/brand values. Use on canonical main/surface;not a modal or status
announcement by itself. [Empty state](EMPTY-STATE.md) owns API and evidence.

September15 opt-in `illustration="empty-folder"` (A): replaces only the lower
media with original280px-maximum SVG,220:160 aspect;three small flies above a
stationary folder. Existing surface/subtle/raised/outline with brand gradient
overlays at18%/10% opacity;no new palette. Flight transforms7.8/9.2/6.6s,ease-in-out cubic
(.45,0,.55,1),phase offsets−2.4/−1.2s;wing scaleY .72→1 over180ms alternate.
Visible playback12/18px,min32px desktop/44px narrow or coarse pointer;manual,
offscreen and document-hidden pause preserve playhead. Reduced motion static;
forced colors hides only art/playback. Image-based default has no new motion.
Exact geometry/timing is adaptation,not measured reference CSS.

### Decision cards — question / approval

September15 supplied question/approval screenshot
`codex-clipboard-e1a884e9-42fb-4463-a7a9-400d2f6989e2.png` → **A adaptation**.
Transparent outlined cards,title/status pairing,numbered answer rows and pill
choices adopted. Dimensions below are BEDS choices,not extracted source CSS.
No new tokens,dependencies or theme colors;existing Badge styles unchanged.

| Part | Fixed contract |
|---|---|
| Shell |640px maximum from chat width;shrinks to parent;r24;p16;1px semantic outline;transparent,no shadow |
| Header / copy |Wrapping header,8px block/16px inline gap;title Inter16/24px500,−.15px;description14/21px400 secondary,8px below header;16px section rhythm |
| Operational badge |Inter12/18px400 foreground;3px×8px inset,r6;neutral subtle surface;12px decorative icon,6px gap;existing semantic marker tokens,not configurable colors |
| Actions |Shared native buttons,Inter14/20px400;10px×16px inset,r999;8px wrapping gap;40px minimum desktop/44px≤767;third choice trailing when present |
| Summary / context |Inset subtle dl,p12,r8,8px row gap;14/21px label/value;emphasized total500;tabular numerals/bidi-isolated values;optional13/20px context,16px glyph |
| Question rows |Native RadioGroup question purpose;52px minimum,p12,gap12;r8 outer outline;quiet separators;24px numbered tile,r6,13/20px;selected check replaces numeral;neutral selected surface |
| Focus / feedback |2px canonical focus outline offset2 on answer row;13/20px foreground recovery;error marker only colored;stable polite feedback;no automatic animation |

Question legend visually hidden only inside QuestionCard to avoid repeating its
visible H2;standalone RadioGroup retains visible legend. Actual choice expressed
with native checked state and check glyph,never color alone. [Decisions](DECISIONS.md)
owns API,flow and inspected evidence. No broad changes to navigation or badges.

### Pricing — image-led plan comparison

September15 supplied pricing screenshot
`codex-clipboard-134a14ed-37d4-486d-a4e3-54dc9e296b3e.png` → **A adaptation**.
Source hierarchy adopted;dimensions below are fixed BEDS choices,not measured
source CSS. No new tokens,palette or caller geometry options.

| Part | Fixed contract |
|---|---|
| Section |720px maximum;centered;48px intro/cards gap;24px card gap;two columns at664px available width,otherwise one;cards centered |
| Introduction |Optional mark +16px lower gap;title Inter22/28px500,20/28px≤767,−.25px tracking;description14/21px400,max60ch;8px copy gap |
| Card |360px maximum;shrinks to parent;r24;1px semantic border;transparent;480px minimum desktop,natural height≤767;equal heights within each grid row |
| Media |4:1 reserved frame;cover;top radius23px=24−1;existing subtle placeholder/image outline;no image-dependent height |
| Content |20px inset;24px copy/benefits/footer rhythm;8px copy/list gap;footer pushed to base with32px additional top separation |
| Title / price |Inter18/24px500,−.15px;price12/18px500,p2×8,r999,subtle/text tokens;tabular numerals,bidi-isolated complete price label;intrinsic wrapping moves price below long titles instead of squeezing them |
| Copy / benefits |14/21px400 secondary;benefits label13/20px500;billing/note12/18px400;16px check glyph,2.5px optical top offset,8px glyph/text gap |
| Action / result |One shared native button;14/20px400,p10×16,r999;40px minimum desktop/44px≤767;full width;13/20px400 stable feedback;long copy grows |
| Featured |Only explicit first featured plan in section;brand/on-brand CTA;hover1px/pressed2px inset ink ring;fill/text opacity stays unchanged to preserve contrast;canonical focus outline |

Card body never receives a featured tint. Artwork colors are content,not
new UI colors. No selected/recommended plan,discount,renewal policy or billing
action inferred. [Pricing](PRICING.md) owns API,flow and evidence.

### Records — metadata and item options

September15 supplied integration screenshot
`codex-clipboard-f50bc07e-2fff-43cb-b092-8dfa50cb8a5e.png` → **A adaptation**.
Two-column metadata and identity/link/status rows with an inset options panel;
not tab navigation. Exact values are BEDS choices,not measured raster CSS.

| Part | Fixed contract |
|---|---|
| Frame |Transparent,r20,1px semantic border;12px title/frame gap;fine row rules;no shadow |
| Metadata |35% label/65% value;44%/56% at480px available width;12px block/16px inline cell inset,12px inline when narrow;logical vertical separator;natural wrapping |
| Typography |Section title14/21px500;label/value13/20px400;record title13/20px500;meta/option description12/18px400;Inter;secondary labels/meta,foreground values;numeric values tabular+bdi |
| Record row |56px minimum;8px block/16px inline inset;12px inline gap;28px decorative identity;flexible identity/link;trailing meta/disclosure |
| Narrow record |≤480px container:12px inset;identity/link/meta stacked;icon and44px disclosure align to top;wrap long text,no horizontal scrolling |
| Options |8px outer inset;r12=20−8;16px inner padding;subtle token panel;semantic fieldset;shared Switch,44px minimum label row;20px label/18px description leading |
| Disclosure |32px desktop/44px narrow or coarse pointer;r8;neutral hover;2px focus outline,3px offset;beUI `bouncy-accordion` height/opacity/layout intent adapted with `useReducedMotion`;measured content and caller-owned records remain the semantic contract |

Existing DataTable,IntegrationRow and SettingsRow contracts remain unchanged.
Switch accessible name now references its visible label;description is separate.
No new tokens or consumer styling knobs. [Records](RECORDS.md) owns API/QA.

### Onboarding — September15 adaptation

Supplied split-form screenshot → A composition,not measured CSS. Existing palette,
Inter and BrandMark;no new tokens or reference artwork. Standalone main:960px
maximum card,48px block/24px inline page inset,32px brand/card/footer rhythm.
Transparent r24 shell,1px border,4px inset;preview r20=24−4. Two equal columns
from740px available container width;560px minimum,natural growth. Form32px inset,
20px below420px container;32px header/fields separation,24px field gap. Primary
action stays in normal flow,40px desktop/44px mobile. At≤767px viewport:page32px
block/16px inline,24px rhythm,input16px/44px;no global field/control change.
Heading20/28px500,−.25px;description14/21px400;neutral text and primary action.
Decorative workspace preview:subtle backdrop,56px top/48px leading inset,560px
cropped window with20px leading top corner,64px header,240px sidebar;no real UI,
interactive controls,unique instructions or animation. Hidden below740px;form
and all instructions retained. Form-only maximum480px. [Contract](ONBOARDING.md).

### Forum topic rows — September15 adaptation

Supplied inbox-row screenshot → A forum context,not raster-derived CSS.
Transparent rest,no divider/shadow;current uses selected token +check glyph;
hover/press use their semantic tokens,secondary copy switches to primary while
interacting to preserve contrast. No transition or extra palette.
Grid40px avatar/flexible content/120px maximum metadata;16px inset,12px gap,r20,
4px inter-row rhythm. Avatar forum purpose40px/r8,13/20px fallback,existing
image-outline token;other avatar purposes unchanged. Content gaps4px;author and
metadata12/18px400,subject14/21px500,excerpt13/20px400. Full subject/author wrap;
excerpt clamps to one line and must be available at destination. At≤520px
container:12px inset,r14,metadata wraps below content,excerpt two lines. Native
row target grows with content;no fixed text height. Logical placement and
tabular metadata. [Forum topics](FORUM-TOPICS.md) owns API/QA.

### Guided conversation — September15 adaptation

Supplied Lucy chat/option and inbox screenshots → A composition,not extracted
CSS. Existing640px chat lane;transparent assistant prose,14/23px;author14/21px
500 with16px brand mark and10px gap;12px author/body gap. User bubbles retain
existing geometry;thread content preserves newlines. Transcript32px rhythm;
next step stays in normal flow after64px minimum gap,40px narrow. Thread has
32px/24px narrow top inset and viewport-relative minimum height,capped780px
desktop;no sticky overlay or fixed text height.

ChatOptions:r20 outlined shell,context-token heading strip12px block/16px inline;
13/20px500 H2. Canvas-token inset list,p8,r20;native rows r12=20−8,p12,
minimum68px,4px row gap,32px icon tile/r8,12px grid gap. Row title14/21px500,
description13/20px400 secondary;neutral hover/press with primary description
text while interacting. No animated entrance,selected radio state or numeric
shortcut. Narrow rows retain three columns,10px gap,8px inline inset;copy wraps.

Guided composer retains120px minimum/r20;visible13/20px label,84px minimum
resizable textarea,2px canonical focus perimeter. Input16/24px narrow;send36px
desktop/44px narrow. Only guided next-step upload/actions receive44px narrow
targets and full wrapping filenames. Default composer,ChatLayout,SuggestionRow,
QuestionCard and other file selectors remain unchanged. No new tokens.
[Lucy](LUCY-COMPOSITION.md) owns API,flow and review evidence.

September15 attached-input reference → A additive composer context. Attachment
shell:r24,4px inset,semantic context fill and1px border;existing form stays r20.
Chip tray:flex wrap,8px gap,4px inline/top and8px bottom inset. Chips:r16,
36px minimum,280px maximum bounded by parent,2px block/10px leading/4px trailing
inset;13/20px500 full bidi-isolated filename,16px fixed Lucide file-kind icon.
Remove:28px square desktop/44px narrow,r10,2px canonical focus. Guided attach
button:36px square/44px narrow,r12. Neutral surfaces and existing xs shadow;
no extra palette,thumbnails,source artwork or animation. Long filenames wrap;
chips wrap rather than hiding controls beyond a horizontal scroll edge.
At≤240px composer container,chip filename occupies a full second row and form
inset becomes12px;guided toolbar wraps and labels break long words. Fixes a
12px internal overflow observed with200% CSS-zoom proxy. No-attachment geometry
stays unchanged;picker/collection state is host-owned.

## Current account-menu finish

September15 credit-footer addition (A,owner screenshot):`AccountCredits` retains
the compact menu below;transparent r8 card,1px semantic border,12px inset,16px
section rhythm. Label/value13/19.5,heading500,other text400;status/note12/18;
16px Coins glyph. Shared28-segment meter:16px height,2px gap/radius,success fill,
subtle remainder. Existing exact numeric value is independent of bar color.
Primary action r6,width100%,minimum36px desktop/44px narrow or coarse pointer;
wraps long copy. Existing8px account footer inset,no new palette or sidebar
content. [Account credits](ACCOUNT-CREDITS.md) owns data/state behavior.

Latest explicit preference: the local Lucy account popup. Scope is AccountMenu only. The source used system UI; the library keeps Inter and existing theme tokens. Optional identity description and footer remain data-driven; menu height must follow content rather than a fixed screenshot height.

| Part | Fixed contract |
|---|---|
| Window |280px wide;12px radius;1px `--es-border`;zero padding;`--es-surface`;existing `--es-shadow-account` |
| Type |13/19.5px regular400;`--es-text`;icons use `--es-secondary` |
| Identity |Minimum48px;10px16px padding;10px gap;24px round avatar;bottom divider;optional description adds natural height |
| Actions |30px minimum;4px8px padding;10px gap;6px radius;selected-token hover/press |
| Action group |6px8px padding;zero row gap |
| Workspaces |Top divider;8px padding;17px marks;selected check right-aligned |
| All workspaces |4px top margin;quiet `--es-control` background |
| Appearance |30px minimum;3px8px padding;theme group24px with2px padding/zero gap/r12;choice minimum44px wide×20px high,12/18px regular |
| Footer |Top divider;8px padding;caller-owned library composition |
| Mobile≤767px |Only account actions/workspaces/appearance minimum44px;theme choice40px/group44px;appearance grows to50px with padding |
| Unchanged behavior |Anchoring,viewport clamp,scrolling,theme callback,workspace/action callback,Tab loop,Escape/outside and focus return |

The menu-specific mobile target rule does not enlarge navigation, inputs, generic segmented controls or other overlays. The compact Lucy composition uses a single-line identity; applications may still supply a description.

## Current typography and content rhythm

Inter 4.1 variable normal/italic is the fixed interface family; Geist Mono 400 is for code. Both are bundled under OFL. Component contexts choose these roles; no consumer size, weight, tracking or density props. Source-declared heading scales are historical availability, not a menu of sizes.

| Current context | Size / leading | Weight / tracking |
|---|---|---|
| Text page-title / chat-title | 16/20px / 16/24px | 500 / −.15px |
| Text section-title | 13/20px | 500 / inherited −.1px |
| PageHeader default / SectionHeader | 16/20px | 500 / inherited −.1px |
| PageHeader home | 22/28px desktop; 20/26px mobile | 500 / −.25px desktop |
| PageContentHeader (MCP) | 15/24px | 500; contextual rule, not a change to PageHeader |
| Body / body-small | 14/21px / 13/20px | 400 / inherited −.1px |
| Label / option | 13/16px | 500 / 450; inherited −.1px |
| Caption / overline | 12/16px | 400 / 500; 0 / +.55px |
| Metric | 24/30px | 500 / −.2px; tabular numerals |
| Composer | 14/22.4px | 400 / −.15px |
| Settings input | 13/20px | 400 / −.1px |
| MCP code / copy label | Geist Mono 12/20px / Inter 14/16px | 400 / 500 |

Sidebar, AccountMenu and FeatureCard contextual type are specified above. Uppercase is limited to the explicit overline context. No general uppercase SaaS heading rule. Optical sizing is auto; font features normal; browser rasterization may differ.

September15 reconciliation: PageContentHeader now executes15/24px; exported sidebar-profile tracking matches the approved rendered−.15px. Sidebar rendering is unchanged. [Consolidation](CONSOLIDATION-2026-09-15.md) owns current evidence; the September14 [Documentation audit](DOCUMENTATION-AUDIT.md) is historical.

| Layout context | Fixed relationship |
|---|---|
| AppShell main | Full-bleed; 16px top after content header/mobile bar; 24px desktop sides/bottom, 16px mobile sides |
| Content lanes | Chat 640px; home 720px; dashboard 880px; full fluid. The dashboard variant supports the isolated Home, not a global widening of Lucy/MCP. |
| PageContentHeader | Max 784px; desktop 48/32/16px top/side/bottom; mobile 16/16/12px |
| Stack | Tight 8px; default 16px; section 48px |
| Inline | Tight 8px; default 16px; wrapping enabled |
| ResponsiveGrid | Two equal columns from 768px; one through 767px; 16px gap; children min-width:0 |
| Composer | 20px radius; 120px minimum input panel; 14px vertical/16px horizontal inset; 36px agent strip |
| Suggestions | 40px row; 24px icon tile; 20px heading-to-composer gap; 48px recent-section separation |
| Landing rhythm | Hero top64px;section block72px;standalone benefits block72px;FAQ column gap64px;mobile hero36px/section48px. Marketing scale above the48px ceiling composes as an exact scale multiple → `calc(var(--es-space-10) * 3)`;never a new raw value or new token |

These are named relationships, not consumer pixel options. Fixed widths are maxima; wrapping may increase row heights. Source coordinates never authorize absolute-positioning a screen. Layout rhythm resolves through `--es-space-*`; raw pixels stay only for control geometry mirroring `controls.css` and for decorative art nudges with no scale step.

## Current compact controls and overlays

Drawer (September15,A): supplied edge-attached panel → full-height inline-end
modal,672px maximum from command token;full width through767px. Square viewport
corners,opaque popup surface,1px leading border,existing dialog shadow/scrim.
Header/footer16px block and24px inline;body24px;16px narrow inline safe-area
inset. Header H2 Inter16/24px500,description13/19.5px400;DrawerSection H3
Inter13/19.5px500,32px separation and8px content gap. Controls40px,44px narrow.
Independent body scroll;header/footer max40%/35% retain overflow recovery and
sticky close. The beUI `drawer` spring/opacity motion is adapted onto the
existing native modal with the source full-travel `±100%` panel expression,
preserving inline-end RTL geometry, browser inertness,
scroll lock and focus recovery. [Drawer](DRAWER.md) owns API,states and
evidence. These dimensions are documented adaptations,not raster-derived
measurements.

SearchDialog (September15,A): supplied discovery-overlay screenshot informs
input → category filters → recent/results list → keyboard-help hierarchy.
672px maximum from existing command token;20px panel radius;24px desktop/16px
mobile content edges;12px/8px list inset;8px result radius concentric with20px
shell at desktop. Percentage viewport bounds preserve CSS-zoom containment.
Opaque popup token, existing account shadow; never transparent floating text.
Rows minimum64px,12px gap,36px identity tile with13px initials;14/21px result,
12/18px metadata,16/24px input in both themes/mobile; category buttons32px desktop,
44px narrow. Header close/recovery controls44px narrow. Footer12/18px; wraps.
Selected result uses the neutral selected token, with decorative open arrow;
no animated result reordering or theme fade. Exact geometry is adaptation,
not measured CSS from the supplied raster. Existing CommandPalette unchanged.

| Context | Fixed geometry |
|---|---|
| Choice popup | 260px maximum; r10; p8; 28px minimum options; r7 rows; 2px row separation |
| Dropdown popup | 160px maximum; r8; p4; 32px minimum rows; r6 rows; 6/8px row padding |
| Command / standard dialog | 672px maximum; r14; viewport-clamped. Command options min36px/r10. Standard dialog is A, not a source-measured general dialog. |
| Welcome dialog | 480px maximum; r24; 200px artwork; 24px content inset; height follows content |
| Button | Default min32px/r8; compact min28px/r6; welcome min40px/r12; connection min40px/r10 |
| Field / field selector | Settings min36px/r8; field selector width224px; connection field min40px/r10 |
| Theme / pill segment | 24px group; 22px options; 1px inset/2px gap. Account overrides are scoped above. |
| Activity tabs | 30px minimum group; 24px minimum tabs; 2px inset/gap; r8/r6 |
| Connection tabs | 16px shell radius; 53px strip; 8px inset; distributed 36px tablist/r10; 28px options. Desktop panel16/32/32px; mobile16/16/24px. |
| Joined choices | 36px; 12/16px labels; 8px horizontal padding/r8 outer corners |
| Switch | 32×18.4px track; 16px thumb; fixed functional blue checked state;contrast-qualified resting boundary;20px label leading |
| Segmented meter | 28 vertical segments;16px high;2px gap/radius;shared by usage and ApplicationCard ATS/FIT/match;count is geometry,not billing or scoring policy |
| MCP code | 42px region/r12; raised semantic surface; 10/12px code padding; 40px copy control |
| Integration row | 64px resting anatomy; r14; 8/14px inset; 12px internal gap; 8px between rows |

Do not normalize all controls to one density. The scoped mobile target exceptions and remaining touch/autozoom limitations are in [States](STATES.md). Overlays remain opaque; transparent card policy never removes the surface needed for floating text.

## Settings navigation adaptation — September15

Owner-supplied clean settings screenshot → opt-in `Tabs variant=settings` and
`SettingsGroup variant=section`;[contract](SETTINGS.md). A,not screenshot CSS
measurements:48px intrinsic tab targets,4px gaps,4px top/inline inset,8px bottom
inset,label4/10px padding/r6,2px underline,24px panel gap. One scrollable row;
existing720px Home content width. Selected/secondary/text/border tokens retained.
Unboxed groups use0 border/inset,16/24px medium headings,24px internal gaps.
Settings-panel buttons36px minimum desktop,44px mobile;switch rows44px;mobile
editable text16px,theme/select triggers and links44px. Defaults unchanged.
No new motion;underline changes immediately. Existing reduced-motion behavior
retained;forced colors adds a system-color selected boundary. The settings variant is still legacy CSS in `controls.css` pending Tailwind migration; the activity and connection Tabs variants are migrated (F1).

## Checkout presentation — September16 adaptation

Focused1040px purchase shell;form/summary1.4:1,48px gap,stack below768px.
Summary-first DOM;native return and one named main. H1 28/36→24/32,total36/44;
summary radius24,padding24→20;16px editable input,44px actions,48px radio rows.
Existing neutral surfaces and purchase roles;no new palette or elevation.
150ms reduced-motion-aware selection feedback;receipt motion retains its own
contract. Prices,fields,terms and confirmation remain host-owned.
[Checkout](CHECKOUT.md) owns provenance,flow and evidence.

## Processing presentation — September16 adaptation

Current Curriculol status/narrative split → shared BEDS adaptation. Fixed
1040px maximum,32px block inset,48px groups,1.35:1 columns;760px container stacks.
Inter28/36px500 heading,24/32px narrow;14/22px body,13/20px supporting copy.
28px/r8 phase markers,24px row gap,shared28-segment master,3px stage progress.
Story r24,p24/p16 narrow;semantic document sheets and one3200ms scan;400ms
confirmed-success mark.44px controls,full wrapping,no new tokens/dependencies.
[Processing](PROCESSING.md) owns exact geometry,90s/75s fixture provenance,
historical timing conflict,pause/reduced motion and review limits.

## Result presentation — September16 adaptation

A: current Curriculol V4 evidence/entitlements,not pixel-porting legacy styles.
Shared1040px max,24px block inset;desktop1.35:1 columns/gap32;700px container
stacks proof→next action→long details. H1Inter28/36px500,24/31px narrow;
body14/22,detail13/21. Score56/60px500 (48/52narrow),prior32/40,tabular;
28 existing vertical segments. r24/p24 surfaces,p16below380px. Offer20/27px500,
price24/32,terms12/19;44px wrapping controls. Shared neutrals/brand and semantic
positive/error delta roles;no new tokens.220ms opacity/6px entry only in
no-preference mode;all useful content immediately operable. No rolling score,
confetti,artificial payment success or blocked document. [Contract](RESULTS.md).

## Icons and motion

Original Marketer navigation mixed custom outlined 18×18 glyphs and Lucide 24×24 glyphs, both displayed 14px; inspected custom paths used 1.5 stroke and Lucide paths 2 stroke (M). These are historical observations. The latest icons-only override adopts the local Lucy pattern for every current registry entry: Lucide SVG 24×24 viewBox, `strokeWidth={1.5}`, round caps/joins, `fill="none"` and monochrome `currentColor` (A). It does not change Inter/Geist, theme tokens, component dimensions or layout.

Consumer imports remain restricted to library `IconName`/`Icon`; no arbitrary SVG paths, external icon imports, size or stroke props. Fixed purposes set display size; the existing sidebar context retains its 16px glyph override. BrandMark and identity artwork are separate components, not icon-registry entries.

| Icon purpose / context | Fixed display size |
|---|---|
|`navigation` (default) |14px |
|`small` |12px |
|`action` |16px |
|`feature` |20px |
|Sidebar navigation |16px; existing context override |

| Current glyph implementation | Provenance |
|---|---|
|All registered names |Lucide 24×24 glyphs/1.5 stroke; explicit Lucy adoption A, not a claim of exact Marketer path identity |
|Added registry names |`House`, `MessageCircle`, `ChartColumn`, `UserRound`, `Briefcase`, `Coins`, `ScanText`; same fixed contract |
|`Home`, `BarChart3`, `Plug` |Remain accepted; now render their Lucide glyphs through the same registry |
|Former `SourceIcon` map |Removed from runtime; extracted TSX text retained only in [historical icon evidence](../../../packages/beds/evidence/marketer-source-icons.txt); not a public component |

The original registry extension itself added no public component or color token. Its inventory was a historical checkpoint; current inventory is recorded in [Components](COMPONENTS.md).

Adopted sidebar dimensions/type and retained compact control roles remain on mobile: no blanket44px control or16px input override. Responsive behavior changes placement, wrapping and containment. Dense targets and13–14px editable text carry touch/autozoom limitations; see [states](STATES.md). Keyboard/focus engineering is independent of that visual-density decision.

Source durations150/250/400ms and ease-out `cubic-bezier(.16,1,.3,1)` are D; sidebar width/hover150ms also observed in computed styles. Declared reduced-motion rules are not full accessibility verification. Only implemented, reviewed motion paths belong to the package contract; do not invent decorative animation while filling missing states.

## Complete canonical token register

Most names below are historical aliases into the shadcn contract of the same theme blocks (see "Token contract" above): `--es-bg`→`--background`, `--es-text`→`--foreground`, `--es-primary`→`--primary`, `--es-surface`→`--card`, `--es-subtle`→`--muted`, `--es-secondary`→`--muted-foreground`, `--es-hover`→`--accent`, `--es-error`→`--destructive`, `--es-border`→`--border`, `--es-control-border`→`--input`, `--es-focus`→`--ring`, `--es-sidebar`→`--sidebar`. Values stay identical. Extensions without a shadcn equivalent stay `--es-*` permanently.

Current adopted snapshot of `packages/beds/src/tokens.css`,2026-09-14:87 distinct CSS custom properties plus2 provider runtime properties,89 total. Shared declarations provide defaults;theme assignments override them. Sidebar/dark values follow the latest user-approved Lucy adoption above. Light values retain the existing palette;new aliases preserve its established role values. Raw [Marketer source evidence](../../../packages/beds/evidence/marketer-reference.json) remains unchanged and is not a claim that these A adoption values were measured there. Never override these properties in consuming apps.

September15 addition:`--es-disclosure-lines:3` is a private component-owned
clamp default. At that checkpoint88 static names plus2 provider properties=90.
Consolidated accessibility adaptation adds control-border and error-text roles:
current90 static names plus2 provider properties=92. Control boundaries are
separate from decorative borders;new values are A,not source measurements.
The dated89-token paragraph above is the September14 snapshot.

### Shared defaults — 46

| Token | Exact default value |
|---|---|
| `--es-mono` | `'Espaco Geist Mono',ui-monospace,monospace` |
| `--es-font` | `'Espaco Inter',Inter,ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif` |
| `--es-info` | `#0077e6` |
| `--es-success` | `#15b042` |
| `--es-warning` | `#e87800` |
| `--es-error` | `#e83535` |
| `--es-focus` | `#0077e6` |
| `--es-white` | `#ffffff` |
| `--es-switch-thumb-on` | `#ffffff` |
| `--es-black` | `#000000` |
| `--es-transparent` | `transparent` |
| `--es-image-outline` | `rgba(0,0,0,.1)` |
| `--es-overlay` | `#0000007a` |
| `--es-sidebar-width` | `264px` |
| `--es-rail-width` | `62px` |
| `--es-chat-width` | `640px` |
| `--es-home-width` | `720px` |
| `--es-dashboard-width` | `880px` |
| `--es-account-width` | `280px` |
| `--es-choice-width` | `260px` |
| `--es-command-width` | `672px` |
| `--es-space-1` | `2px` |
| `--es-space-2` | `4px` |
| `--es-space-3` | `6px` |
| `--es-space-4` | `8px` |
| `--es-space-5` | `10px` |
| `--es-space-6` | `12px` |
| `--es-space-7` | `14px` |
| `--es-space-8` | `16px` |
| `--es-space-9` | `20px` |
| `--es-space-10` | `24px` |
| `--es-space-11` | `32px` |
| `--es-space-12` | `48px` |
| `--es-radius-2` | `2px` |
| `--es-radius-6` | `6px` |
| `--es-radius-7` | `7px` |
| `--es-radius-8` | `8px` |
| `--es-radius-10` | `10px` |
| `--es-radius-14` | `14px` |
| `--es-radius-20` | `20px` |
| `--es-radius-panel` | `20px` |
| `--es-radius-card` | `24px` |
| `--es-radius-full` | `999px` |
| `--es-disclosure-lines` | `3`;component-owned clamp default,not a consumer override |
| `--es-shadow-popup` | `0 4px 6px -1px #0000001a,0 2px 4px -2px #0000001a` |
| `--es-shadow-xs` | `0 1px 2px #0000000d` |

### Theme assignments — 47

These47 rows include44 additional property names and3 overrides of shared defaults (`--es-focus`,`--es-overlay`,`--es-image-outline`). Light cells for those properties show the inherited shared value. Do not double-count them as additional tokens.

| Token | Light effective value | Dark effective value |
|---|---|---|
| `--es-bg` | `#ffffff` | `#191919` |
| `--es-sidebar` | `#fbfaf9` | `#191919` |
| `--es-surface` | `#ffffff` | `#202020` |
| `--es-subtle` | `#edece9` | `#232323` |
| `--es-raised` | `#edece9` | `#272727` |
| `--es-hover` | `#e6e4e0` | `#ffffff05` |
| `--es-pressed` | `#dbd8d2` | `#ffffff0c` |
| `--es-text` | `#37352e` | `#cecece` |
| `--es-secondary` | `#6a6966` | `#949494` |
| `--es-placeholder` | `#6a6966` | `#949494` |
| `--es-inverse` | `#191919` | `#f1f1f1` |
| `--es-border` | `#00000014` | `#ffffff0c` |
| `--es-border-subtle` | `#0000000f` | `#ffffff06` |
| `--es-border-strong` | `#0000001f` | `#ffffff13` |
| `--es-control-border` | `#787775` | `#858585` |
| `--es-error-text` | `#c52a2a` | `#ff7b7b` |
| `--es-focus-ring` | `#0077e63d` | `#b9b9b93d` |
| `--es-error-ring` | `#e8353533` | `#e8353547` |
| `--es-image-outline` | `rgba(0,0,0,.1)` | `rgba(255,255,255,.1)` |
| `--es-primary` | `#202020` | `#f1f1f1` |
| `--es-on-primary` | `#ffffff` | `#242424` |
| `--es-field` | `#ffffff` | `#191919` |
| `--es-message-user` | `#edece9` | `#232323` |
| `--es-switch-off` | `#787775` | `#414141` |
| `--es-switch-thumb` | `#ffffff` | `#c8c8c8` |
| `--es-success-subtle` | `#caface` | `#053818` |
| `--es-error-subtle` | `#ffe4e0` | `#570808` |
| `--es-badge-success-marker` | `#0b7a2b` | `#49c670` |
| `--es-badge-warning-marker` | `#a54f00` | `#ff9f32` |
| `--es-badge-error-marker` | `#c52a2a` | `#ff7b7b` |
| `--es-badge-info-marker` | `#0066c2` | `#5aaaff` |
| `--es-shadow-account` | `0 0 0 1px #0000000f,0 20px 25px -5px #0000001f,0 8px 10px -6px #00000029` | `0 1px 2px #00000044,0 8px 24px #00000044` |
| `--es-glass` | `#00000008` | `#ffffff02` |
| `--es-glass-border` | `#0000001f` | `#ffffff13` |
| `--es-shadow-dialog` | `0 1px 2px #0000000a,0 8px 24px #0000000f` | `0 1px 1px #0000001f,0 12px 32px #00000024` |
| `--es-selected` | `#edece9` | `#2a2a2a` |
| `--es-composer-surface` | `#ffffff` | `#191919` |
| `--es-composer-context` | `#fbfaf9` | `#222222` |
| `--es-composer-border` | `#0000000f` | `#ffffff04` |
| `--es-composer-focus` | `#787775` | `#ffffff17` |
| `--es-control` | `#edece9` | `#262626` |
| `--es-heading` | `#37352e` | `#d4d4d4` |
| `--es-input-text` | `#37352e` | `#d0d0d0` |
| `--es-badge` | `#edece9` | `#414141` |
| `--es-on-badge` | `#6a6966` | `#e5e5e5` |
| `--es-send` | `#202020` | `#dedede` |
| `--es-on-send` | `#ffffff` | `#292929` |
| `--es-focus` | `#0077e6` | `#b9b9b9` |
| `--es-overlay` | `#0000007a` | `#080808a8` |

## Token contract — shadcn naming, BEDS values (since 2026-09-17)

Each `.es-root[data-theme]` block declares the shadcn vocabulary (`--background`,`--foreground`,`--card`,`--popover`,`--primary`,`--secondary`,`--muted`,`--accent`,`--destructive`,`--border`,`--input`,`--ring`,`--sidebar*`,`--chart-1..5`) with the BEDS values below. Historical `--es-*` names are aliases (`--es-bg: var(--background)`) kept until each component migrates to Tailwind utilities, then deleted. BEDS extensions without a shadcn equivalent (`--es-switch-off`,`--es-message-user`,`--es-glass`…) stay `--es-*` permanently. `--radius:8px` is the shared radius; `@theme` in `src/tailwind.css` derives `radius-sm..4xl`, the 4px spacing grid, the BEDS type scale under Tailwind names (`--text-sm:13px/20px`), the measured tracking values and the BEDS easing. Tailwind utilities compile into `dist/styles.css` at build; consumers never install Tailwind. As of F1.1 (2026-09-17) the compiled sheet is 218,710 bytes (~214 KiB) raw / 35,731 bytes (~35 KiB) gzipped — a point-in-time reference, not a budget (`check:artifact` asserts presence only).

### Objective fixes — 2026-09-17

Approved corrections of decisions that violated accessibility or ergonomics (not taste). Proportions and palette are untouched.

| # | Was | Now | Why |
|---|---|---|---|
| 1 | Field text 13px on every screen | 16px under `@media (pointer: coarse)` | iOS Safari zooms the page on focus below 16px |
| 2 | Text at 10px/11px (badge, metadata, snippets) | 12px floor, enforced by `check-library` | legibility floor |
| 3 | 32px touch targets on mobile | invisible 44px hit area via `::after` under `pointer: coarse` | WCAG 2.5.8 / HIG; desktop geometry unchanged |

### Provider-owned runtime properties — 2

| Token | Value / ownership |
|---|---|
| `--es-brand` |Validated provider `brandColor`; reference default`#d0f300`; Curriculol preset`#ffa133`; the only configurable visual color |
| `--es-on-brand` |Internally derived`#000000` or`#ffffff` from brand relative luminance; not a second consumer option |

Font-face registration stays fixed: Inter normal/italic weights100..900 andGeist Mono normal400. Contextual dimensions such as welcome24px radius,code12px radius,40px connection controls andadopted sidebar31px rows remain component-owned values even when not separate tokens. Consumers cannot select raw pixel values. Any token or contextual-value change requires matching documentation andfocused light/dark visual verification. Current sidebar/dark checks are recorded in [Validation](VALIDATION.md).
## OTP — supplied-code adaptation

A: 56px maximum square slots, shrinking within parent;12px radius/gap;24px maximum tabular digits;semantic subtle/text/border tokens;2px focus perimeter. No new palette. Supplied Tailwind/Tabler dependencies replaced by BEDS CSS and decorative separator. Missing sweep/bounce CSS and traveling spring ring not ported;180ms digit entry only, disabled under reduced motion. No automatic processing animation on complete input. Product owner visual acceptance pending.
