import { useId, type ReactNode, type Ref } from 'react';
import { Icon } from './foundation';
import './checkout.css';

export type CheckoutLayoutProps = {
  title: string;
  description: string;
  mark?: ReactNode;
  back: { label: string; href: string };
  utilities?: ReactNode;
  summary?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Restore focus here when a payment transition replaces the triggering control. */
  ref?: Ref<HTMLElement>;
};

/** A focused purchase surface. The host owns prices, payment state and navigation. */
export function CheckoutLayout({ title, description, mark, back, utilities, summary, children, footer, ref }: CheckoutLayoutProps) {
  const id = useId();
  return <div className="es-checkout">
    <header className="es-checkout-bar">
      <a href={back.href} className="es-checkout-back"><Icon name="ArrowLeft" purpose="action" /><span>{back.label}</span></a>
      <div className="es-checkout-utilities">{mark}{utilities}</div>
    </header>
    <main ref={ref} tabIndex={-1} className="es-checkout-main" aria-labelledby={`${id}-title`}>
      <header className="es-checkout-heading"><h1 id={`${id}-title`}>{title}</h1><p>{description}</p></header>
      <div className="es-checkout-grid" data-has-summary={Boolean(summary) || undefined}>
        {summary && <div className="es-checkout-summary">{summary}</div>}
        <div className="es-checkout-content">{children}</div>
      </div>
    </main>
    {footer && <footer className="es-checkout-footer">{footer}</footer>}
  </div>;
}

export type OrderSummaryProps = {
  title: string;
  items: readonly { id: string; label: string; value: string }[];
  total: { label: string; value: string };
  terms: string;
  benefits?: readonly string[];
  note?: string;
};

/** Amounts arrive formatted. No discount, tax, credit or recurrence is inferred. */
export function OrderSummary({ title, items, total, terms, benefits, note }: OrderSummaryProps) {
  const id = useId();
  return <section className="es-order-summary" aria-labelledby={id}>
    <header><span aria-hidden="true"><Icon name="Coins" purpose="action" /></span><h2 id={id}>{title}</h2></header>
    {items.length > 0 && <dl className="es-order-items">{items.map(item => <div key={item.id}><dt>{item.label}</dt><dd><bdi>{item.value}</bdi></dd></div>)}</dl>}
    <dl className="es-order-total" aria-live="polite" aria-atomic="true"><div><dt>{total.label}</dt><dd><bdi>{total.value}</bdi></dd></div></dl>
    <p className="es-order-terms">{terms}</p>
    {benefits && benefits.length > 0 && <ul role="list">{benefits.map(benefit => <li key={benefit}><Icon name="Check" purpose="small" /><span>{benefit}</span></li>)}</ul>}
    {note && <p className="es-order-note">{note}</p>}
  </section>;
}

export type CheckoutSectionProps = { title: string; description?: string; children: ReactNode };

export function CheckoutSection({ title, description, children }: CheckoutSectionProps) {
  const id = useId();
  return <section className="es-checkout-section" aria-labelledby={id}>
    <header><h2 id={id}>{title}</h2>{description && <p>{description}</p>}</header>
    <div>{children}</div>
  </section>;
}
