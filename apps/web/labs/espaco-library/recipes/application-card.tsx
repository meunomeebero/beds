import { useId, useState, type ReactNode } from 'react';
import { Icon, Badge, MeterSegments, DropdownMenu, HelpLabel, Select } from 'beds';
import './application-card.css';

export type ApplicationScore =
  | { kind: 'fit' | 'match'; value: number; explanation: string }
  | { kind: 'ats'; value: number; before?: number; explanation: string }
  | { kind: 'processing'; label: string }
  | { kind: 'unavailable'; label: string };

type CardAction = { label: string; onClick: () => void; busy?: boolean; disabled?: boolean };
type StatusOption = { id: string; label: string; disabled?: boolean };

/** Presentation only. The caller owns scoring, dates, status transitions and artifacts. */
export type ApplicationCardProps = {
  purpose?: 'default' | 'kanban';
  title: string;
  company: string;
  companyImage?: string;
  status: { id: string; label: string; tone?: 'neutral' | 'success' | 'warning' | 'error' | 'info' };
  statusOptions?: StatusOption[];
  onStatusChange?: (status: string) => void;
  date?: { label: string; dateTime: string };
  age?: string;
  source?: string;
  location?: string;
  salary?: string;
  keywords?: string[];
  tag?: string;
  note?: { text: string; onOpen: () => void };
  score?: ApplicationScore;
  documents?: { id: string; label: string; onOpen: () => void }[];
  selection?: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean };
  feedback?: string;
  primaryAction?: CardAction;
  jobHref?: string;
  detailsLabel?: string;
  onOpen: () => void;
};

function validScore(value: number) {
  return Number.isFinite(value) && value >= 0 && value <= 100;
}

function Score({ score }: { score: ApplicationScore }) {
  if (score.kind === 'processing') return <div className="recipe-application-score recipe-application-score--pending"><Icon name="ScanText" purpose="action" /><span>{score.label}</span></div>;
  if (score.kind === 'unavailable') return <p className="recipe-application-unavailable">{score.label}</p>;
  if (!validScore(score.value)) return null;
  const label = score.kind === 'ats' ? 'ATS do currículo' : score.kind === 'fit' ? 'FIT do perfil' : 'Compatibilidade';
  const before = score.kind === 'ats' && score.before !== undefined && validScore(score.before) ? score.before : null;
  const value = Math.floor(score.value);
  const delta = before === null ? null : value - Math.floor(before);
  return <div className="recipe-application-score">
    <div className="recipe-application-score-copy"><HelpLabel label={label} description={score.explanation} /><span className="recipe-application-score-value">{value}<small>/100</small>{delta !== null && <span className="recipe-application-delta" aria-label={`${delta > 0 ? '+' : ''}${delta} pontos em relação ao currículo anterior`}>{delta > 0 ? '+' : ''}{delta} pts</span>}</span></div>
    <MeterSegments label={label} value={value} tone="brand" rounding="down" valueText={`${value} de 100 pontos`} />
  </div>;
}

export function ApplicationCard({ purpose = 'default', title, company, companyImage, status, statusOptions, onStatusChange, date, age, source, location, salary, keywords = [], tag, note, score, documents = [], selection, feedback, primaryAction, jobHref, detailsLabel = 'Ver detalhes', onOpen }: ApplicationCardProps) {
  const id = useId();
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const initials = company.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toLocaleUpperCase();
  const safeHref = jobHref && /^https?:\/\//i.test(jobHref) ? jobHref : undefined;
  const identity = <div className="recipe-application-identity"><span className="recipe-application-company">{company}</span><h3 id={id}><button type="button" onClick={onOpen}>{title}</button></h3></div>;
  const moveOptions = (statusOptions ?? []).filter(option => option.id !== status.id).map(option => ({ ...option, label: `Mover para ${option.label}` }));
  let statusContent: ReactNode = <Badge label={status.label} tone={status.tone} purpose="status" />;
  if (statusOptions && onStatusChange) {
    if (purpose === 'default') statusContent = <Select label={`Status de ${title}`} value={status.id} options={statusOptions} onChange={onStatusChange} />;
    else if (moveOptions.length > 0) statusContent = <DropdownMenu label={`Mover ${title} na ${company}`} open={statusOpen} onOpenChange={setStatusOpen} items={moveOptions} onSelect={onStatusChange} />;
  }
  const statusControl = <div className="recipe-application-status">
    <div className="recipe-application-status-trigger">{statusContent}</div>
    {selection && <label className="recipe-application-select"><input type="checkbox" checked={selection.checked} onChange={event => selection.onChange(event.target.checked)} disabled={selection.disabled} aria-label={`Selecionar ${title} na ${company}`} /><Icon name={selection.checked ? 'Check' : 'Plus'} purpose="action" /></label>}
  </div>;
  return <article className="recipe-application-card" aria-labelledby={id} data-purpose={purpose} data-selected={selection?.checked || undefined}>
    <div className="recipe-application-top">
      <div className="recipe-application-folio" aria-hidden="true" data-documents={documents.length > 0 || undefined}>
        {documents.length > 0 && <span className="recipe-application-sheet"><Icon name="FileText" purpose="feature" /></span>}
        <span className="recipe-application-company-mark">{companyImage && failedImage !== companyImage ? <img src={companyImage} alt="" loading="lazy" onError={() => setFailedImage(companyImage)} /> : initials || '—'}</span>
      </div>
      {purpose === 'kanban' ? identity : statusControl}
    </div>
    {purpose === 'default' && identity}
    {(location || salary) && <ul className="recipe-application-details">{location && <li><Icon name="Globe" purpose="small" />{location}</li>}{salary && <li><Icon name="Coins" purpose="small" />{salary}</li>}</ul>}
    {keywords.length > 0 && <p className="recipe-application-keywords">{keywords.join(' · ')}</p>}
    {note && <button type="button" className="recipe-application-note" onClick={note.onOpen} aria-label={`Abrir anotação de ${title}: ${note.text}`}><Icon name="MessageSquare" purpose="small" /><span>{note.text}</span><Icon name="ChevronRight" purpose="small" /></button>}
    {(tag || date || source) && <div className="recipe-application-provenance">{tag && <span className="recipe-application-tag"><Icon name="Bookmark" purpose="small" />{tag}</span>}{date && <time dateTime={date.dateTime}>{date.label}</time>}{source && <span>{source}</span>}</div>}
    <div className="recipe-application-bottom">
      {score && <Score score={score} />}
      {(documents.length > 0 || age) && <div className="recipe-application-artifacts">{documents.length > 0 && <div className="recipe-application-documents">{documents.map(document => <button key={document.id} type="button" onClick={document.onOpen} aria-label={`Abrir ${document.label} de ${title}`}><Icon name="FileText" purpose="small" />{document.label}<Icon name="Check" purpose="small" /></button>)}</div>}{age && <span className="recipe-application-age">{age}</span>}</div>}
      {feedback && <p className="recipe-application-feedback">{feedback}</p>}
      <div className="recipe-application-actions">{purpose === 'kanban' && statusControl}<button className="recipe-application-details-action" type="button" onClick={onOpen}>{detailsLabel}<Icon name="ArrowUpRight" purpose="small" /></button>{primaryAction && <button type="button" className="recipe-application-primary" onClick={primaryAction.onClick} disabled={primaryAction.disabled || primaryAction.busy} aria-busy={primaryAction.busy || undefined}>{primaryAction.busy && <Icon name="Loader2" purpose="small" />}{primaryAction.label}<Icon name="ArrowRight" purpose="small" /></button>}{safeHref && !primaryAction && <a className="recipe-application-details-action" href={safeHref} target="_blank" rel="noopener noreferrer">Ver vaga<Icon name="ArrowUpRight" purpose="small" /><span className="recipe-application-sr-only"> (abre em outra aba)</span></a>}</div>
    </div>
  </article>;
}
