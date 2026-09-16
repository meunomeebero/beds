import { Children, useId, type ComponentProps, type ReactNode } from 'react';
import { Badge } from './feedback';
import './date-item.css';

/** The host formats all four values from the same date in its intended locale. */
export type DateItemDate = {
  dateTime: string;
  month: string;
  day: string;
  label: string;
};

type DateItemDestination =
  | { href: string; onOpen?: never }
  | { href?: never; onOpen: () => void }
  | { href?: never; onOpen?: never };

export type DateItemProps = {
  title: string;
  date: DateItemDate;
  description?: string;
  status?: { label: string; tone?: ComponentProps<typeof Badge>['tone'] };
} & DateItemDestination;

/** A date-led row: native destination/action, or plain content without fake interactivity. */
export function DateItem({ title, date, description, status, href, onOpen }: DateItemProps) {
  const id = useId();
  const content = <>
    <time id={`${id}-date`} className="es-date-item-calendar" dateTime={date.dateTime} title={date.label}>
      <span className="es-date-item-sheet" aria-hidden="true">
        <span className="es-date-item-month">{date.month}</span>
        <span className="es-date-item-day">{date.day}</span>
      </span>
      <span className="es-sr-only">{date.label}</span>
    </time>
    <span className="es-date-item-content">
      <span className="es-date-item-heading">
        <span id={`${id}-title`} className="es-date-item-title">{title}</span>
        {status && <span id={`${id}-status`} className="es-date-item-status"><Badge purpose="status" label={status.label} tone={status.tone} /></span>}
      </span>
      {description && <span id={`${id}-description`} className="es-date-item-description">{description}</span>}
    </span>
  </>;
  const common = {
    className: 'es-date-item',
    'aria-labelledby': `${id}-title`,
    'aria-describedby': [`${id}-date`, description && `${id}-description`, status && `${id}-status`].filter(Boolean).join(' '),
  };
  if (href !== undefined) return <a {...common} href={href}>{content}</a>;
  if (onOpen) return <button {...common} type="button" onClick={onOpen}>{content}</button>;
  return <div className="es-date-item">{content}</div>;
}

/** Pass one DateItem per direct child; no selection or scheduling state is inferred. */
export function DateItemList({ label, children }: { label: string; children: ReactNode }) {
  return <ul className="es-date-item-list" aria-label={label}>{Children.map(children, child => child == null ? null : <li>{child}</li>)}</ul>;
}
