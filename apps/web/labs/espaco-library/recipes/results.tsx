/** Optional app recipe; see docs/design/espaco-library/AGNOSTIC-DS.md. */
import { useId, type ReactNode } from 'react';
import { Button } from 'beds';
import { Icon } from 'beds';
import { MeterSegments } from 'beds';
import './results.css';

export type ResultLayoutProps = {
  context: string;
  title: string;
  description: string;
  mark?: ReactNode;
  summary: ReactNode;
  nextStep: ReactNode;
  evidence?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
};

/** Proof → next useful action → detail. Entitlements and navigation belong to the host. */
export function ResultLayout({ context, title, description, mark, summary, nextStep, evidence, children, actions }: ResultLayoutProps) {
  const id = useId();
  return <article className="recipe-result" aria-labelledby={`${id}-title`}>
    <header className="recipe-result-heading">
      <div className="recipe-result-identity">{mark}<span>{context}</span></div>
      <h1 id={`${id}-title`}>{title}</h1>
      <p>{description}</p>
      {actions && <div className="recipe-result-actions">{actions}</div>}
    </header>
    <div className="recipe-result-overview" data-has-evidence={Boolean(evidence) || undefined}><div className="recipe-result-summary">{summary}</div><div className="recipe-result-next">{nextStep}</div>{evidence && <div className="recipe-result-evidence">{evidence}</div>}</div>
    <div className="recipe-result-details">{children}</div>
  </article>;
}

export type ResultScoreProps = {
  label: string;
  value: number | null;
  before?: number | null;
  description: string;
  beforeLabel?: string;
  afterLabel?: string;
  locale?: string;
};

function validScore(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100 ? value : null;
}

/** Missing or invalid evidence stays missing. Never animate a fabricated score or uplift. */
export function ResultScore({ label, value, before, description, beforeLabel = 'Before', afterLabel = 'After', locale = 'en' }: ResultScoreProps) {
  const id = useId();
  const current = validScore(value);
  const previous = validScore(before);
  const comparison = before !== undefined;
  const delta = current === null || previous === null ? null : current - previous;
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format;
  const deltaLabel = delta === null ? '' : delta === 0 ? '0' : `${delta > 0 ? '+' : '−'}${Math.abs(delta) < .01 ? `<${format(.01)}` : format(Math.abs(delta))}`;
  return <section className="recipe-result-score" aria-labelledby={`${id}-label`} aria-describedby={`${id}-description`}>
    <h2 id={`${id}-label`}>{label}</h2>
    <div className="recipe-result-score-values">
      {comparison && <div className="recipe-result-score-previous"><span>{beforeLabel}</span><strong>{previous === null ? '—' : format(previous)}<small>/100</small></strong></div>}
      <div className="recipe-result-score-current">{comparison && <span>{afterLabel}</span>}<strong>{current === null ? '—' : format(current)}<small>/100</small></strong></div>
      {delta !== null && <span className="recipe-result-score-delta" data-outcome={delta > 0 ? 'positive' : delta < 0 ? 'regression' : 'neutral'}>{deltaLabel} pts</span>}
    </div>
    {current !== null && <MeterSegments label={label} value={current} tone="brand" valueText={`${format(current)}/100`} />}
    <p id={`${id}-description`}>{description}</p>
  </section>;
}

export type ResultFindingsProps = {
  title: string;
  items: readonly { id: string; title: string; description: string; tone?: 'neutral' | 'positive' | 'attention' }[];
};

export function ResultFindings({ title, items }: ResultFindingsProps) {
  const id = useId();
  return <section className="recipe-result-findings" aria-labelledby={id}><h2 id={id}>{title}</h2><ul role="list">
    {items.map(item => <li key={item.id} data-tone={item.tone ?? 'neutral'}><Icon name={item.tone === 'positive' ? 'CheckCircle2' : item.tone === 'attention' ? 'Info' : 'FileText'} purpose="action" /><div><h3>{item.title}</h3><p>{item.description}</p></div></li>)}
  </ul></section>;
}

export type ResultSectionProps = { title: string; description?: string; children: ReactNode };

export function ResultSection({ title, description, children }: ResultSectionProps) {
  const id = useId();
  return <section className="recipe-result-section" aria-labelledby={id}><header><h2 id={id}>{title}</h2>{description && <p>{description}</p>}</header><div>{children}</div></section>;
}

export type ResultAction = { label: string } & (
  | { href: string; onClick?: never; disabled?: never; busy?: never }
  | { href?: never; onClick: () => void; disabled?: boolean; busy?: boolean }
);

export type ResultOfferProps = {
  eyebrow: string;
  title: string;
  description: string;
  price?: string;
  terms?: string;
  items?: readonly string[];
  primaryAction: ResultAction;
  secondaryAction?: ResultAction;
  note?: string;
};

/** A contextual next step, not a paywall. The caller must preserve access to owned work. */
export function ResultOffer({ eyebrow, title, description, price, terms, items, primaryAction, secondaryAction, note }: ResultOfferProps) {
  const id = useId();
  const describedBy = [price && `${id}-price`, terms && `${id}-terms`, note && `${id}-note`].filter(Boolean).join(' ') || undefined;
  return <section className="recipe-result-offer" aria-labelledby={`${id}-title`}>
    <span className="recipe-result-offer-eyebrow">{eyebrow}</span><h2 id={`${id}-title`}>{title}</h2><p>{description}</p>
    {(price || terms) && <div className="recipe-result-offer-price">{price && <strong id={`${id}-price`}>{price}</strong>}{terms && <span id={`${id}-terms`}>{terms}</span>}</div>}
    <div className="recipe-result-offer-actions">{primaryAction.href !== undefined
      ? <a className="recipe-result-link" data-variant="primary" data-purpose="welcome" href={primaryAction.href} aria-describedby={describedBy}>{primaryAction.label}</a>
      : <Button label={primaryAction.label} onClick={primaryAction.onClick} disabled={primaryAction.disabled} busy={primaryAction.busy} variant="primary" purpose="welcome" aria-describedby={describedBy} />}
      {secondaryAction && (secondaryAction.href !== undefined
        ? <a className="recipe-result-link" data-variant="ghost" data-purpose="welcome" href={secondaryAction.href}>{secondaryAction.label}</a>
        : <Button label={secondaryAction.label} onClick={secondaryAction.onClick} disabled={secondaryAction.disabled} busy={secondaryAction.busy} variant="ghost" purpose="welcome" />)}</div>
    {items && items.length > 0 && <ul role="list">{items.map(item => <li key={item}><Icon name="Check" purpose="small" /><span>{item}</span></li>)}</ul>}
    {note && <p id={`${id}-note`} className="recipe-result-offer-note">{note}</p>}
  </section>;
}
