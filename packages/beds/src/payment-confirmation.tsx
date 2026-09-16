import { useId, type ReactNode } from 'react';
import { Button } from './controls';
import { Icon } from './foundation';
import './payment-confirmation.css';

export type PaymentReceiptRow = { id: string; label: string; value: string };
type PaymentAction = { label: string; onClick: () => void; busy?: boolean; disabled?: boolean };
export type PaymentInvoice =
  | { state: 'available'; message: string; action: PaymentAction }
  | { state: 'pending'; message: string; action?: never }
  | { state: 'error'; message: string; action: PaymentAction };

export type PaymentConfirmationProps = {
  /** Mount only after the host has verified payment. This component never processes a charge. */
  title: string;
  description?: string;
  merchant: string;
  mark?: ReactNode;
  purchase: { label: string; description?: string };
  receipt: {
    title: string;
    items: readonly PaymentReceiptRow[];
    total: { label: string; value: string };
    details?: readonly PaymentReceiptRow[];
    note?: string;
  };
  invoice?: PaymentInvoice;
  continueAction?: PaymentAction;
  /** Disable on restored receipts. Motion never gates content, callbacks or fiscal status. */
  animate?: boolean;
  headingLevel?: 2 | 3;
};

function ReceiptRows({ rows }: { rows: readonly PaymentReceiptRow[] }) {
  return <dl className="es-payment-rows">{rows.map(row => <div key={row.id}><dt>{row.label}</dt><dd><bdi>{row.value}</bdi></dd></div>)}</dl>;
}

/** Confirmed-payment presentation; paper motion is independent from host-owned invoice state. */
export function PaymentConfirmation({ title, description, merchant, mark, purchase, receipt, invoice, continueAction, animate = true, headingLevel = 2 }: PaymentConfirmationProps) {
  const id = useId();
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  return <section className="es-payment-confirmation" aria-labelledby={`${id}-title`} data-animate={animate || undefined}>
    <header className="es-payment-heading">
      <span className="es-payment-success" aria-hidden="true"><Icon name="CheckCircle2" purpose="feature" /></span>
      <Heading id={`${id}-title`}>{title}</Heading>
      {description && <p>{description}</p>}
    </header>
    <div className="es-payment-printer">
      <div className="es-payment-machine">
        <div className="es-payment-merchant">{mark && <span className="es-payment-mark" aria-hidden="true">{mark}</span>}<span>{merchant}</span><Icon name="Check" purpose="action" /></div>
        <div className="es-payment-screen">
          <p className="es-payment-purchase">{purchase.label}</p>
          {purchase.description && <p className="es-payment-description">{purchase.description}</p>}
          <p className="es-payment-amount"><bdi>{receipt.total.value}</bdi></p>
          <span className="es-payment-description">{receipt.total.label}</span>
        </div>
        <div className="es-payment-slot" aria-hidden="true" />
      </div>
      <div className="es-payment-paper-window">
        <div className="es-payment-paper">
          <div className="es-payment-paper-content">
            <div className="es-payment-paper-heading"><p>{merchant}</p><p>{receipt.title}</p></div>
            {receipt.items.length > 0 && <ReceiptRows rows={receipt.items} />}
            <dl className="es-payment-total"><div><dt>{receipt.total.label}</dt><dd><bdi>{receipt.total.value}</bdi></dd></div></dl>
            {receipt.details && receipt.details.length > 0 && <ReceiptRows rows={receipt.details} />}
            {receipt.note && <p className="es-payment-paper-note">{receipt.note}</p>}
          </div>
          <div className="es-payment-paper-edge" aria-hidden="true" />
        </div>
      </div>
    </div>
    <footer className="es-payment-footer">
      <p className="es-payment-invoice-status" role="status" aria-atomic="true" data-state={invoice?.state} id={`${id}-invoice`}>
        {invoice && <><Icon name={invoice.state === 'error' ? 'AlertCircle' : invoice.state === 'pending' ? 'Info' : 'FileText'} purpose="action" /><span>{invoice.message}</span></>}
      </p>
      {invoice?.action && <Button label={invoice.action.label} onClick={invoice.action.onClick} busy={invoice.action.busy} disabled={invoice.action.disabled} variant="primary" purpose="welcome" icon={invoice.state === 'available' ? 'FileText' : undefined} aria-describedby={`${id}-invoice`} />}
      {continueAction && <Button {...continueAction} variant="ghost" purpose="welcome" />}
    </footer>
  </section>;
}
