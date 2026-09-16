import { useId } from 'react';
import { Button } from './controls';
import { Icon } from './foundation';
import { MeterSegments } from './meter-segments';
import './account-credits.css';

export type CreditBalance =
  | { status: 'ready'; value: number; formattedValue: string; limit?: number }
  | { status: 'loading' | 'unavailable' | 'error'; message: string };

export type AccountCreditsProps = {
  plan: string;
  label: string;
  balance: CreditBalance;
  /** Never infer a quota,price or payment action from the displayed balance. */
  action?: { label: string; onClick: () => void; disabled?: boolean; busy?: boolean };
  note?: string;
  invalidValueLabel: string;
};

/** Compact account-menu footer. A missing limit never becomes a guessed percentage. */
export function AccountCredits({ plan, label, balance, action, note, invalidValueLabel }: AccountCreditsProps) {
  const id = useId();
  const ready = balance.status === 'ready';
  const valid = ready && Number.isFinite(balance.value) && balance.value >= 0;
  const bounded = valid && balance.limit !== undefined && Number.isFinite(balance.limit) && balance.limit > 0 && balance.value <= balance.limit;
  const balanceText = valid ? balance.formattedValue.trim() || String(balance.value) : invalidValueLabel;
  return <section className="es-account-credits" aria-labelledby={`${id}-plan`}>
    <h2 id={`${id}-plan`}><Icon name="Coins" purpose="action" /><span>{plan}</span></h2>
    <div className="es-account-credits-balance">
      <div className="es-account-credits-label"><span>{label}</span>{ready && <bdi>{balanceText}</bdi>}</div>
      {bounded && <MeterSegments label={label} value={balance.value} max={balance.limit} tone="success" valueText={balanceText} />}
      <p className="es-account-credits-status" role="status">{!ready && balance.status !== 'error' ? balance.message : ''}</p>
      <p className="es-account-credits-status" role="alert">{!ready && balance.status === 'error' ? balance.message : ''}</p>
    </div>
    {note && <p className="es-account-credits-note">{note}</p>}
    {action && <Button label={action.label} onClick={action.onClick} disabled={action.disabled} busy={action.busy} variant="primary" purpose="welcome" />}
  </section>;
}
