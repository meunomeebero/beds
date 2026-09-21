import { useId, type ReactNode } from 'react';
import { Button } from 'beds';
import { Icon } from 'beds';
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
  headingLevel?: 1 | 2 | 3;
};

function ReceiptRows({ rows }: { rows: readonly PaymentReceiptRow[] }) {
  return <dl className="recipe-payment-rows">{rows.map(row => <div key={row.id}><dt>{row.label}</dt><dd><bdi>{row.value}</bdi></dd></div>)}</dl>;
}

/** Confirmed-payment presentation; paper motion is independent from host-owned invoice state. */
export function PaymentConfirmation({ title, description, merchant, mark, purchase, receipt, invoice, continueAction, animate = true, headingLevel = 2 }: PaymentConfirmationProps) {
  const id = useId();
  const Heading = headingLevel === 1 ? 'h1' : headingLevel === 3 ? 'h3' : 'h2';
  return <section className="recipe-payment-confirmation" aria-labelledby={`${id}-title`} data-animate={animate || undefined}>
    <header className="recipe-payment-heading">
      <span className="recipe-payment-success" aria-hidden="true"><Icon name="CheckCircle2" purpose="feature" /></span>
      <Heading id={`${id}-title`}>{title}</Heading>
      {description && <p>{description}</p>}
    </header>
    <div className="recipe-payment-printer">
      <div className="recipe-payment-machine">
        <div className="recipe-payment-merchant">{mark && <span className="recipe-payment-mark" aria-hidden="true">{mark}</span>}<span>{merchant}</span><Icon name="Check" purpose="action" /></div>
        <div className="recipe-payment-screen">
          <p className="recipe-payment-purchase">{purchase.label}</p>
          {purchase.description && <p className="recipe-payment-description">{purchase.description}</p>}
          <p className="recipe-payment-amount"><bdi>{receipt.total.value}</bdi></p>
          <span className="recipe-payment-description">{receipt.total.label}</span>
        </div>
        <div className="recipe-payment-slot" aria-hidden="true" />
      </div>
      <div className="recipe-payment-paper-window">
        <div className="recipe-payment-paper">
          <div className="recipe-payment-paper-content">
            <div className="recipe-payment-paper-heading"><p>{merchant}</p><p>{receipt.title}</p></div>
            {receipt.items.length > 0 && <ReceiptRows rows={receipt.items} />}
            <dl className="recipe-payment-total"><div><dt>{receipt.total.label}</dt><dd><bdi>{receipt.total.value}</bdi></dd></div></dl>
            {receipt.details && receipt.details.length > 0 && <ReceiptRows rows={receipt.details} />}
            {receipt.note && <p className="recipe-payment-paper-note">{receipt.note}</p>}
          </div>
          <div className="recipe-payment-paper-edge" aria-hidden="true" />
        </div>
      </div>
    </div>
    <footer className="recipe-payment-footer">
      <p className="recipe-payment-invoice-status" role="status" aria-atomic="true" data-state={invoice?.state} id={`${id}-invoice`}>
        {invoice && <><Icon name={invoice.state === 'error' ? 'AlertCircle' : invoice.state === 'pending' ? 'Info' : 'FileText'} purpose="action" /><span>{invoice.message}</span></>}
      </p>
      {invoice?.action && <Button label={invoice.action.label} onClick={invoice.action.onClick} busy={invoice.action.busy} disabled={invoice.action.disabled} variant="primary" purpose="welcome" icon={invoice.state === 'available' ? 'FileText' : undefined} aria-describedby={`${id}-invoice`} />}
      {continueAction && <Button label={continueAction.label} onClick={continueAction.onClick} busy={continueAction.busy} disabled={continueAction.disabled} variant="ghost" purpose="welcome" />}
    </footer>
  </section>;
}
