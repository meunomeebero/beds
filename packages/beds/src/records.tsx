import { useId, type ReactNode } from 'react';
import { Switch } from './controls';
import { Icon, type IconName } from './foundation';
import './records.css';

export type DefinitionRow = {
  id: string;
  label: string;
  icon?: IconName;
  value: string | number | null;
  link?: { href: string; label: string; external?: boolean };
};
export type DefinitionTableProps = {
  title: string;
  rows: readonly DefinitionRow[];
  unavailableLabel: string;
  emptyMessage: string;
  headingLevel?: 2 | 3;
};

/** Metadata pairs, not a multi-record data grid. Null and zero remain distinct. */
export function DefinitionTable({ title, rows, unavailableLabel, emptyMessage, headingLevel = 2 }: DefinitionTableProps) {
  const id = useId();
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  return <section className="es-definition-table" aria-labelledby={id}>
    <Heading id={id}>{title}</Heading>
    {rows.length ? <dl>{rows.map(row => <div key={row.id} className="es-definition-row">
      <dt>{row.icon && <Icon name={row.icon} purpose="action" />}<span>{row.label}</span></dt>
      <dd>{row.value === null ? <span className="es-record-unavailable">{unavailableLabel}</span> : row.link ? <a href={row.link.href} aria-label={row.link.label} target={row.link.external ? '_blank' : undefined} rel={row.link.external ? 'noopener noreferrer' : undefined}><bdi>{row.value}</bdi>{row.link.external && <Icon name="ArrowUpRight" purpose="small" />}</a> : <bdi>{row.value}</bdi>}</dd>
    </div>)}</dl> : <p className="es-record-empty">{emptyMessage}</p>}
  </section>;
}

export type RecordOption = { id: string; label: string; description?: string; checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean };
export type OptionListItem = {
  id: string;
  title: string;
  mark?: ReactNode;
  link?: { label: string; href: string; external?: boolean };
  meta?: string;
  options?: {
    title: string;
    toggleLabel: string;
    expanded: boolean;
    onExpandedChange: (expanded: boolean) => void;
    items: readonly RecordOption[];
    feedback?: string;
  };
};
export type OptionListProps = { title: string; items: readonly OptionListItem[]; emptyMessage: string; headingLevel?: 2 | 3 };

function OptionRecord({ item }: { item: OptionListItem }) {
  const id = useId();
  const options = item.options;
  const hasOptions = options && options.items.length > 0;
  return <li className="es-option-record">
    <div className="es-option-summary">
      {item.mark && <span className="es-option-mark" aria-hidden="true">{item.mark}</span>}
      <div className="es-option-identity"><span className="es-option-name">{item.title}</span>
        {item.link && <a href={item.link.href} target={item.link.external ? '_blank' : undefined} rel={item.link.external ? 'noopener noreferrer' : undefined}>{item.link.label}{item.link.external && <Icon name="ArrowUpRight" purpose="small" />}</a>}
      </div>
      {item.meta && <span className="es-option-meta">{item.meta}</span>}
      {hasOptions && <button type="button" className="es-option-disclosure" aria-label={options.toggleLabel} aria-expanded={options.expanded} aria-controls={`${id}-options`} onClick={() => options.onExpandedChange(!options.expanded)}><Icon name={options.expanded ? 'ChevronDown' : 'ChevronRight'} purpose="action" /></button>}
    </div>
    {hasOptions && <div className="es-option-details" id={`${id}-options`} hidden={!options.expanded}>
      <fieldset><legend>{options.title}</legend>
        {options.items.map(option => <Switch key={option.id} label={option.label} description={option.description} checked={option.checked} onChange={option.onChange} disabled={option.disabled} />)}
      </fieldset>
      <p className="es-option-feedback" role="status" aria-atomic="true">{options.feedback ?? ''}</p>
    </div>}
  </li>;
}

/** Independent disclosures. Hosts own values, persistence, pending states and recovery. */
export function OptionList({ title, items, emptyMessage, headingLevel = 2 }: OptionListProps) {
  const id = useId();
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  return <section className="es-option-list" aria-labelledby={id}>
    <Heading id={id}>{title}</Heading>
    {items.length ? <ul role="list">{items.map(item => <OptionRecord key={item.id} item={item} />)}</ul> : <p className="es-record-empty">{emptyMessage}</p>}
  </section>;
}
