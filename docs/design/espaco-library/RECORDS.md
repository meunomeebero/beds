# Records — compact metadata and item options

Scope:portable BEDS;catalog `?view=records`. Synthetic data/local callbacks only.
No Curriculol integration,server request or permission grant. Not tab navigation.

## API

```tsx
import { DefinitionTable, OptionList, Avatar } from 'beds';

<DefinitionTable
  title="Sincronização de dados"
  unavailableLabel="Não informado"
  emptyMessage="Nenhum dado disponível."
  rows={[{ id: 'documents', label: 'Documentos sincronizados',
    icon: 'FileText', value: 15,
    link: { href: '/documents', label: 'Ver os 15 documentos' } }]}
/>

<OptionList title="Espaços conectados" emptyMessage="Nenhum espaço conectado."
  items={[{ id: 'studio', title: 'Estúdio', mark: <Avatar name="Estúdio" />,
    link: { href: '/spaces/studio', label: 'Abrir espaço' },
    meta: 'Atualizado há 11 minutos',
    options: {
      title: 'Permissões do espaço', toggleLabel: 'Opções do Estúdio',
      expanded, onExpandedChange: setExpanded,
      items: [{ id: 'updates', label: 'Receber atualizações',
        description: 'Avise quando uma atividade for concluída.',
        checked: updates, onChange: setUpdates }],
    },
  }]}
/>
```

| Export / field | Contract |
|---|---|
| DefinitionTableProps |Required title,rows,unavailableLabel,emptyMessage;optional headingLevel2(default)/3 |
| DefinitionRow |Unique stable id,label,value:string/number/null;optional existing IconName and link |
| Definition link |href + accessible label required;external? opens separate tab with noopener/noreferrer and arrow;host names new-tab behavior where applicable |
| Missing value |Null shows unavailableLabel,never a link;zero remains literal0;no inferred count or timestamp |
| OptionListProps |Required title,items,emptyMessage;optional headingLevel2(default)/3 |
| OptionListItem |Unique stable id,title;optional mark,link,meta,options;mark is an existing noninteractive DS identity,decorative to avoid repeating title |
| Record link |href,label,external?;native anchor separate from disclosure;host supplies safe,real destination;no HTML strings |
| Options |title,toggleLabel,expanded,onExpandedChange,items;optional feedback;zero options removes disclosure/panel |
| RecordOption |Unique stable id,label,checked,onChange;optional description,disabled;shared native Switch |

No className/style/layout/size/color overrides. No new dependency.
DefinitionTable describes one entity:dl/dt/dd,not a keyboard grid or DataTable
replacement. OptionList is ul/li;each record can disclose independently.
IntegrationRow remains a connection CTA;SettingsRow remains a form composition.

## State / accessibility

Entry → item link OR disclosure → switch → host outcome → collapse/re-entry.
Links do not expand panels. Disclosure is a native button;Enter/Space toggle;
aria-expanded/controls identify its stable panel. Hidden panel controls leave
keyboard/AT navigation;host state survives collapse. No auto-open,save or success.
Fieldset/legend names the option group;Switch label and description are associated
separately. Native checked/disabled states persist. API has no implicit network.

Host owns requests,pending,errors,retry and real authorization. During save,
disable affected options and render an accurate LoadingIndicator/Notice plus
recovery as needed. `feedback` is polite host-supplied result text,not an inferred
success. Do not mark real permissions changed before actual confirmation.
If host externally collapses/removes a focused record,move focus to a surviving
control;component's own disclosure keeps focus on its trigger.

Empty collection → caller emptyMessage;never fake rows/zero. Loading/error are
compositions with existing feedback primitives,not new state machines here.
Metadata values use bidi isolation/tabular numerals. Long labels/links wrap.
Forced colors preserves focus/panel/disclosure contours. No new animation.

Context7 tools unavailable;official fallbacks:
[Native description lists](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dl),
[WAI disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/).

## Reference / quality

Source:user-supplied September15 integration raster
`codex-clipboard-f50bc07e-2fff-43cb-b092-8dfa50cb8a5e.png`.
Adopted hierarchy:metadata pairs;identity/link/meta;inset descriptive toggles.
Geometry is **A local adaptation**,not measured source CSS. Transparent r20
frame;quiet rules;concentric r12 panel;logical spacing;fixed BEDS tokens.
Exact values:[Foundations](FOUNDATIONS.md#records--metadata-and-item-options).
No new blue link palette:underlines identify existing foreground-token links.

Candidate `0.1.7-rc.16-local.17`;local only. No commit,push,release or consumer
upgrade. Seven Better skills +frontend-design/ui-skills-root applied.

| Domain | Review |
|---|---|
| Accessibility |Native descriptions/list/fieldset/links/disclosure;keyboard opening,hidden controls,checked/disabled;shared Switch duplicate-name correction |
| Layout |35% metadata label lane;480px container reflow;top-aligned identity for long copy;no fixed row height or text truncation |
| Writing |Synthetic examples;explicit empty/missing states;no inferred sync/count/save;permission effects described before action |
| Typography |Inter13/20px rows,12/18px secondary;tabular values;long labels and destinations wrap |
| Color |Computed pairs below;no new palette;disabled styling is existing Switch contract |
| UI |Transparent r20 frames;inset r12 options;quiet row separators;only disclosure hover;reference-informed,owner approval pending |

| Rendered pair | Light ratio | Dark ratio |
|---|---|---|
| Label/meta on canvas |5.49:1 |5.80:1 |
| Value/link on canvas |12.27:1 |11.17:1 |
| Option description on inset surface |4.65:1 |5.18:1 |
| Option group heading on inset surface |10.39:1 |9.99:1 |

Executed:`npm run verify`:build,typecheck,98 components/90 tokens with0
violations,docs/consumer checks,31 guard/routing tests,packed import/parity.
Explicit consumer check of RecordExamples.tsx:0 violations.
Browser:`PLAYWRIGHT_BASE_URL=http://127.0.0.1:5296 npm run test:browser -- records.spec.ts controls.spec.ts --reporter=line`:
26 passed(6 record checks +20 existing control regressions),desktop/mobile.
Coverage:actual catalog entry,light/dark,dl/list/group semantics,zero/null,
links,keyboard disclosure/switch,disabled/empty/re-entry,320/390/938/1440px,
long copy,RTL/CSS zoom200%,forced colors and reduced-motion mode.
Initial run found description included in Switch name;visible label now owns
the name through aria-labelledby,description remains separate. Final suite passes.
Visual pass widened metadata label lane to35% and top-aligned narrow identities.

Inspected captures:
[dark desktop](../../../apps/web/labs/espaco-library/evidence/records/desktop-dark.png),
[light mobile options](../../../apps/web/labs/espaco-library/evidence/records/mobile-light-options.png),
[dark mobile long copy](../../../apps/web/labs/espaco-library/evidence/records/mobile-dark-long-320.png),
[light metadata](../../../apps/web/labs/espaco-library/evidence/records/desktop-light-definitions.png).

Not verified:VoiceOver,physical touch,Safari/Firefox,APCA,real permissions,
actual browser zoom(CSS zoom is a proxy),all future datasets or entire-library
conformance. Independent review and owner aesthetic approval **PENDING**.
