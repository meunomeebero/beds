import { useId, type ReactNode } from 'react';
import { Icon, type IconName } from './foundation';
import { MeterSegments, meterFraction as fraction } from './meter-segments';
type Tone = 'neutral' | 'success' | 'warning' | 'error' | 'info';
export function Badge({ label, tone = 'neutral', purpose = 'tag' }: { label: string; tone?: Tone; purpose?: 'tag' | 'status' }) {
  return <span className="es-badge" data-tone={tone} data-purpose={purpose}>{purpose === 'status' ? <span>{label}</span> : label}</span>;
}
export function StatusDot({ label, status }: { label: string; status: 'success' | 'warning' | 'error' | 'neutral' }) {
  return <span className="es-status-dot" data-status={status} role="img" aria-label={label} />;
}
export function Notice({ title, description, tone = 'info', onDismiss }: { title: string; description?: string; tone?: Exclude<Tone,'neutral'>; onDismiss?: () => void }) {
  const glyph = tone === 'success' ? 'CheckCircle2' : tone === 'info' ? 'Info' : 'AlertCircle';
  return <div className="es-notice" data-tone={tone} role={tone === 'error' ? 'alert' : 'status'}><Icon name={glyph} purpose="action" /><div><strong>{title}</strong>{description && <p>{description}</p>}</div>{onDismiss && <button type="button" aria-label="Dismiss notification" onClick={onDismiss}><Icon name="X" /></button>}</div>;
}
export function EmptyState({ title, description, icon = 'Folder', action }: { title: string; description?: string; icon?: IconName; action?: { label: string; onClick: () => void } }) {
  return <div className="es-empty-state"><span className="es-empty-icon"><Icon name={icon} purpose="feature" /></span><h3>{title}</h3>{description && <p>{description}</p>}{action && <button type="button" onClick={action.onClick}>{action.label}</button>}</div>;
}
export function Skeleton({ purpose = 'line' }: { purpose?: 'line' | 'avatar' | 'card' }) {
  return <span className="es-skeleton" data-purpose={purpose} aria-hidden="true" />;
}
export function LoadingIndicator({ label }: { label: string }) {
  return <span className="es-loading" role="status"><Icon name="Loader2" purpose="action" /><span>{label}</span></span>;
}
export function ProgressBar({ label, value, max = 100, tone = 'neutral' }: { label: string; value: number | null; max?: number; tone?: 'neutral' | 'brand' }) {
  const ratio = fraction(value, max);
  return <div className="es-progress" data-tone={tone}>{ratio === null ? <span className="es-progress-unavailable" role="status">{label} — unavailable</span> : <><div className="es-meter-label"><span>{label}</span><span>{Math.round(ratio * max)} / {max}</span></div><progress aria-label={label} max={max} value={ratio * max} /></>}</div>;
}
export function SegmentedMeter({ label, value, max = 100, tone = 'neutral' }: { label: string; value: number | null; max?: number; tone?: 'neutral' | 'brand' | 'success' }) {
  const ratio = fraction(value, max);
  return <div className="es-segmented-meter" data-tone={tone}><div className="es-meter-label"><span>{label}</span><span>{ratio === null ? '—' : Math.round(ratio * max)}</span></div><MeterSegments label={label} value={value} max={max} tone={tone} /></div>;
}
export function Metric({ label, value, description }: { label: string; value: string; description?: string }) {
  return <div className="es-metric"><span>{label}</span><strong>{value}</strong>{description && <small>{description}</small>}</div>;
}
export function DataList({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  return <section className="es-data-list" aria-labelledby={id}><h2 id={id}>{label}</h2><div>{children}</div></section>;
}
