# Blog post cards

Scope: `BlogPostCard`, `BlogPostList`; source-only addition to local.24.
Catalog: `?view=blog-post&theme=light`; also dark, `preview=long` and
`preview=image-error`. No blog integration, CMS, fetch, publication or migration.

## Reference and anatomy

Owner-supplied `codex-clipboard-40a55470-99f9-4403-9c76-db44d93ecf8d.png`:
compact horizontal reader card,leading thumbnail,author,title,excerpt,topics.
**A adaptation**,not measured source CSS. Keep the reference hierarchy;do not
copy its faded surrounding cards,skeleton prose,WordPress identity or artwork.
Existing BEDS transparent resting cards and semantic neutral interactions win.
Catalog thumbnails are original local SVG illustrations;authors/text fictitious:
[resume](../../../apps/web/labs/espaco-library/assets/blog-resume.svg),
[interview](../../../apps/web/labs/espaco-library/assets/blog-interview.svg).

Flow: named feed → native article link → full demo article → return to feed.
Re-entry has no internal selection or reading-progress state. Thumbnail load or
failure never blocks reading/navigation;changed source retries once via remount.

## Public contract

| Export / property | Contract |
|---|---|
| `BlogPostCard` | Required `title`, `href`;one real link around noninteractive content |
| `author` | Optional `{name,avatarSrc?}`;visible name;decorative existing workspace avatar only when source supplied;failed avatar uses initials |
| `image` | Optional `{src,alt}`;square cover crop,reserved space;empty alt for decoration,meaningful alt when needed;do not put unique article facts only in a thumbnail |
| `excerpt` | Optional string,two-line visual clamp;host must provide complete text at the destination |
| `published` | Optional `{label,dateTime}`;caller formats text and supplies valid HTML date/time;no invented timezone/date |
| `readingTime` | Optional localized string;host supplies it,no automatic estimate |
| `tags` | Optional readonly strings;trim,omit blanks,deduplicate;pass final labels with or without hashtags;passive list,not filters |
| `headingLevel` | 2 default or3;semantic context only,identical fixed appearance |
| `BlogPostList` | Required `label`, `children`;named ul;one keyed card per direct child;no multi-card fragments |

No class/style/size/theme variant,target manipulation,onClick interception or
nested actions. Title supplies the link's accessible name;metadata and excerpt
remain readable content. Native Enter,middle-click and modifier navigation.
No selected/disabled/loading article state;host owns collection loading,empty,
error,retry and truthful counts using existing feedback primitives. Omitting
image removes its entire column. Missing thumbnails show a quiet image glyph,
never a perpetual spinner;meaningful alt remains named on the fallback.

```tsx
import { BlogPostCard, BlogPostList } from 'beds';

<BlogPostList label="Artigos recentes">
  <BlogPostCard
    title="Um currículo que conta a sua história"
    href="/blog/sua-historia"
    author={{ name: 'Marina Costa' }}
    image={{ src: '/images/sua-historia.webp', alt: '' }}
    excerpt="Dê espaço aos resultados, não só à lista de tarefas."
    published={{ label: '15 set. 2026', dateTime: '2026-09-15' }}
    readingTime="4 min de leitura"
    tags={['Currículo', 'Carreira']}
  />
</BlogPostList>
```

Geometry: [Foundations](FOUNDATIONS.md). No new tokens or dependencies;shared
CardMedia internal blog purpose/fallback slot,existing Avatar and Icon. Other
media purposes retain aspect ratios and default fallback. Public package exports
and both CSS build-order inventories include the new family.

## Better review — September15

Scope: new card/list,local editorial demo,native article round trip;React19,
fixed BEDS CSS. Sources: author/package/catalog AGENTS,Foundations,Governance,
Interface quality;all seven installed `~/.codex/skills/better-*/SKILL.md`
entrypoints,semantics/surfaces/wrapping references;frontend-design direction.

| Domain | Evidence / intent | Result |
|---|---|---|
| Accessibility | Native link/title heading,one focus stop per card,decorative images,Tab/Enter/middle-click navigation,forced-colors focus | Clear in scoped browser/source review |
| Layout | Thumbnail/content grid;no-image column removal;full title/tag wrapping;320px,RTL and zoom proxy | Clear;metadata consistently stacks on narrow cards |
| Writing | Sentence-case PT-BR;clear authorship,reading time and fictitious-content disclosure;no invented metrics | Clear;source and rendered copy inspected |
| Typography | Inter14/21px title,13/20px excerpt,12/18px metadata,12/18px topics;only excerpt clamped and recovered | Clear;long-title/tag renders inspected |
| Color | Existing semantic neutrals;actual rest/hover/pressed backgrounds,both themes | Clear;tested text contrast≥4.5:1 |
| UI | Concentric r20/p12/r8 card-thumbnail relationship;quiet outline;fixed cover crop;load/failure/re-entry | Clear;desktop/mobile light/dark and failure captures inspected |

No actionable interface findings in the reviewed component scope. Better
self-review verdict: **Approve** for the inspected scope,not owner acceptance.
Governance delivery: implementation/static/browser/artifact checks complete;
independent visual comparison and design-owner aesthetic approval **PENDING**.

### Verification

- `npm run verify`:passed;109 components,90 tokens;zero library,docs,consumer
  and artifact violations;27 guard +4 routing tests. Fresh package consumer
  smoke passed. Current snapshot retains local.24;not a release artifact.
- `PLAYWRIGHT_BASE_URL=http://127.0.0.1:5296 npx playwright test --config
  apps/web/labs/espaco-library/playwright.config.ts blog-post.spec.ts
  feature-card.spec.ts --reporter=line`:16 passed (6 blog +10 shared-media
  regression checks). Final narrow-metadata polish reruns the6 blog checks.
- Browser:actual catalog navigation,article round trip,history re-entry,
  full excerpt recovery,native middle-click,Tab order,visible focus,heading/time
  semantics;reserved pending media,error/source recovery;no page exceptions or
  non-GET requests on the normal path.
- Desktop/mobile Chromium,light/dark,1440/800/390/320px,long unbroken topics,
  RTL,CSS200% zoom proxy,forced colors;no component/document horizontal overflow.
- Initial test assumptions corrected:Vite-inlined SVG could not exercise network
  loading;fixture now uses served local assets. Keyboard-focus check now enters
  keyboard modality after pointer use. Explicit error-fixture URL intentionally
  resets on navigation;cached re-entry tested from the normal article route.
  No assertions removed or tests skipped to hide these initial failures.

Evidence:
[desktop light](../../../apps/web/labs/espaco-library/evidence/blog-post/desktop-light.png),
[desktop dark](../../../apps/web/labs/espaco-library/evidence/blog-post/desktop-dark.png),
[mobile light](../../../apps/web/labs/espaco-library/evidence/blog-post/mobile-light.png),
[mobile dark](../../../apps/web/labs/espaco-library/evidence/blog-post/mobile-dark.png),
[320px long copy](../../../apps/web/labs/espaco-library/evidence/blog-post/desktop-light-320.png),
[image unavailable](../../../apps/web/labs/espaco-library/evidence/blog-post/mobile-image-error.png).
[Example](../../../apps/web/labs/espaco-library/BlogPostPage.tsx),
[regression spec](../../../apps/web/labs/espaco-library/blog-post.spec.ts).

Independent review,design-owner aesthetic approval,real browser200% zoom,physical touch,
Safari/Firefox and native screen-reader behavior not verified. CSS zoom proxy
and Chromium mobile emulation do not substitute for those checks.

No commit,push,release,consumer upgrade or real blog integration in this task.
