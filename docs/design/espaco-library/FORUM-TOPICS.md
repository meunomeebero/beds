# Forum topics — avatar rows

## Scope and reference

User screenshot:`codex-clipboard-fa7b0130-c96c-4173-af8c-c563d40d0dad.png`.
**A adaptation**:compact conversation rows,leading illustrated identity,quiet
metadata and neutral current-row background. Forum subject added between author
and excerpt;no copied inbox/workspace UI. [Foundations](FOUNDATIONS.md) owns exact
geometry;values are library adaptations,not CSS measurements from the raster.

`ForumTopicCard` and `ForumTopicList` are portable primitives. Example people,
dates,statuses and counts are fictitious. No forum backend,posting,moderation,
notifications,read tracking or product navigation integrated.

## API

| Component / prop | Contract |
|---|---|
| `ForumTopicCard.title` |Required subject;always wraps,never clipped |
| `author` |Required name;optional avatarSrc. Existing Avatar,forum context;one failed URL falls back to initials,changed URL retries |
| `excerpt` |Optional preview;one desktop line/two narrow lines. Host must expose the complete text at the destination or in details |
| `activity` |Optional literal label/dateTime;native time;no relative-time calculation |
| `repliesLabel` |Optional complete localized phrase,including zero/unknown wording;DS never invents a count |
| `status` |Optional label and existing Badge tone;transparent status variant,not a new status palette |
| `unreadLabel` |Optional visible text,not a color-only dot. Host owns whether/how reading clears it |
| `selected` |Controlled current topic;neutral background,check glyph and aria-current. Not a toggle or listbox selection |
| `href` or `onOpen` |Exactly one. Native link for navigation;native button for an action. No nested buttons or shared click side effects |
| `ForumTopicList.label/children` |Named ul;each direct keyed card becomes an li. Pass mapped cards directly,not a fragment/custom wrapper producing multiple rows |

Accessible name is the complete subject;description includes author,unread state,
metadata and full excerpt. Decorative avatar hidden inside the row because the
author is already text. Current state is redundant across semantics,background
and glyph;no online/presence implication. Long author names/status/counts wrap.
No automatic animation,request,persistence or local storage.

## Composition and recovery

Catalog:`?view=forum&theme=light` or dark. [Public-API example](../../../apps/web/labs/espaco-library/ForumTopicPage.tsx).

Entry from catalog → activate row → existing Drawer shows complete subject and
excerpt → Escape/close → focus returns to that row;selection retained. Re-entry
works without resetting other examples. Fixture unread state changes locally
only. Native-link example supports a new tab;its URL opens the same demo topic.
Loading/empty/error belong to the host list:existing LoadingIndicator,EmptyState,
Notice and retry action. No false zero count while loading or after failure.

Avatar illustrations are original local SVG demo content,not portraits of real
users or source artwork. Their colors are image content,not theme tokens.
[Marina](../../../apps/web/labs/espaco-library/assets/forum-marina.svg),
[Rafael](../../../apps/web/labs/espaco-library/assets/forum-rafael.svg),
[Joana](../../../apps/web/labs/espaco-library/assets/forum-joana.svg).
No runtime image service. Fourth fixture demonstrates initials only.

## Review — September15

Candidate:`0.1.7-rc.16-local.21`. React19,public BEDS CSS/native controls;canonical
AGENTS,Foundations,Interface quality and Governance inspected. Automatic Better
suite:better-interface plus all six owners,complete entrypoints and relevant
semantics/adaptivity/surfaces/contrast references. No delegation.

Context7 unavailable in this session. Verified existing APIs against
[React Children](https://react.dev/reference/react/Children) and
[MDN aria-current](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-current);
no new dependency or framework migration. Only the documented stable APIs are used.

| Domain | Evidence / boundary |
|---|---|
| Accessibility |Native destinations,named ul,description/current state,decorative avatar;keyboard/focus/detail recovery and forced-colors checks |
| Layout |Leading avatar,flexible content,trailing metadata;metadata moves below at520px container;320px/long/RTL/zoom checks |
| Writing |PT-BR sentence case;synthetic content labelled;unread separate from status;counts remain host-owned;retry gives recovery |
| Typography |Fixed Inter14/21 subject,13/20 excerpt,12/18 metadata;no title truncation;full excerpt via detail;tabular time/counts |
| Colors |Existing semantic text/surface/badge roles;hover/press secondary copy becomes primary to preserve contrast;both themes measured by browser check |
| UI |Transparent rest;neutral current/hover;no row divider/shadow;40px/r8 original avatars,shared image outline;no added motion |

### Verified locally

- `npm run verify`:build,typecheck,102-component/90-token contract,docs,default
  consumer roots,31 guard/routing tests and packed artifact smoke passed.
- `node packages/beds/scripts/check-consumer.mjs apps/web/labs/espaco-library/ForumTopicPage.tsx`:
  public-API example,zero violations.
- `PLAYWRIGHT_BASE_URL=http://127.0.0.1:5296 npx playwright test --config apps/web/labs/espaco-library/playwright.config.ts forum-topic.spec.ts --reporter=line`:
  **6 passed** across desktop/mobile. Both themes;real catalog entry;Enter/Space,
  Escape and focus return;current/unread state;full-text detail;desktop middle-click
  new tab/mobile same-tab navigation;avatar failure/recovery;loading/empty/error
  recovery;1440/820/600/390/320px,long content,RTL,200% CSS zoom and forced colors.
- Rendered desktop light/dark,mobile light and320px long-content evidence inspected:
  `apps/web/labs/espaco-library/evidence/forum-topic/`.
- Measured resting text,light/dark:subject12.27/11.17;author/excerpt/meta/status
  5.49/5.80. Browser checks also enforce≥4.5 for subject/byline/excerpt/meta in
  current,hover and held-press states. Measurements use actual ancestor surfaces.
- Review correction:theme control in header overflowed during extreme CSS zoom;
  example now puts appearance in existing catalog navigation. No shared header
  geometry changed;focused narrow/zoom regression now passes.

No actionable interface findings in the inspected card/detail flow. Technical
checks complete;independent baseline review and owner aesthetic approval pending.
Not verified:VoiceOver/other screen readers,physical touch,Safari/Firefox,APCA,
actual browser zoom or any real forum integration. CSS zoom is only a layout
stress test,not equivalent to the browser's zoom setting. Existing catalog chrome
and the full Drawer/Avatar implementations were not re-audited beyond these paths.
No commit,push,publication or installed-consumer upgrade.
