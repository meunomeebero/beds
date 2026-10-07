import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from './controls';
import { AnimatedNumber, Icon } from './foundation';
import { CardMedia } from './card-media';
import './pricing.css';

export type PricingCardProps = {
  title: string;
  description: string;
  image: { src: string; alt: string; fallbackLabel?: string };
  price: {
    /** Complete localized price label used for the initial and static state. */
    label: string;
    description?: string;
    /** Optional authoritative amount. Animation requires this value and its formatter; label is never parsed. */
    amount?: { value: number; format: (value: number) => string };
  };
  featuresLabel: string;
  features: readonly { id: string; text: string }[];
  action: { label: string } & (
    | { href: string; onClick?: never; busy?: never; disabled?: never }
    | { href?: never; onClick: () => void; busy?: boolean; disabled?: boolean }
  );
  actionNote?: string;
  feedback?: string;
  featured?: boolean;
  headingLevel?: 2 | 3;
};

function PricingAmount({ label, amount }: { label: string; amount: PricingCardProps['price']['amount'] }) {
  const previous = useRef<number | null>(null);
  const [animatedFrom, setAnimatedFrom] = useState<number | null>(null);
  const value = amount?.value;
  const format = amount?.format;
  const valid = value !== undefined && Number.isFinite(value) && format !== undefined;

  useLayoutEffect(() => {
    if (!valid || value === undefined) {
      previous.current = null;
      setAnimatedFrom(null);
      return;
    }

    const prior = previous.current;
    previous.current = value;
    if (prior !== null && prior !== value) setAnimatedFrom(prior);
    else if (prior === null) setAnimatedFrom(null);
  }, [format, valid, value]);

  if (!valid || value === undefined || format === undefined || animatedFrom === null) return <bdi>{label}</bdi>;
  return <bdi><AnimatedNumber value={value} initialValue={animatedFrom} format={format} fallback={label} /></bdi>;
}

/** Display only: hosts supply complete prices, billing terms and actual outcomes. */
export function PricingCard({ title, description, image, price, featuresLabel, features, action, actionNote, feedback, featured = false, headingLevel = 2 }: PricingCardProps) {
  const id = useId();
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  const actionDescription = [price.description && `${id}-billing`, actionNote && `${id}-note`].filter(Boolean).join(' ') || undefined;
  return <article className="es-pricing-card" data-featured={featured || undefined} aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}>
    <CardMedia key={image.src} purpose="pricing" src={image.src} alt={image.alt} fallbackLabel={image.fallbackLabel} />
    <div className="es-pricing-content">
      <div className="es-pricing-copy">
        <div className="es-pricing-heading"><Heading id={`${id}-title`}>{title}</Heading><span className="es-pricing-price"><PricingAmount label={price.label} amount={price.amount} /></span></div>
        {price.description && <p className="es-pricing-billing" id={`${id}-billing`}>{price.description}</p>}
        <p className="es-pricing-description" id={`${id}-description`}>{description}</p>
      </div>
      {features.length > 0 && <div className="es-pricing-benefits"><p id={`${id}-features`}>{featuresLabel}</p><ul role="list" aria-labelledby={`${id}-features`}>{features.map(feature => <li key={feature.id}><Icon name="CheckCircle2" purpose="action" /><span>{feature.text}</span></li>)}</ul></div>}
      <div className="es-pricing-footer">
        {actionNote && <p className="es-pricing-note" id={`${id}-note`}>{actionNote}</p>}
        {action.href !== undefined
          ? <a className="es-pricing-link" href={action.href} aria-describedby={actionDescription}>{action.label}</a>
          : <Button label={action.label} onClick={action.onClick} busy={action.busy} disabled={action.disabled} purpose="welcome" aria-describedby={actionDescription} />}
        <p className="es-pricing-feedback" role="status" aria-atomic="true">{feedback ?? ''}</p>
      </div>
    </div>
  </article>;
}

export type PricingPlan = Omit<PricingCardProps, 'headingLevel'> & { id: string };
export type PricingSectionProps = {
  title: string;
  description?: string;
  mark?: ReactNode;
  plans: readonly PricingPlan[];
  headingLevel?: 1 | 2;
};

/** Two-column comparison; only the first explicitly featured plan gets brand emphasis. */
export function PricingSection({ title, description, mark, plans, headingLevel = 2 }: PricingSectionProps) {
  const id = useId();
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  const featured = plans.find(plan => plan.featured)?.id;
  return <section className="es-pricing-section" aria-labelledby={`${id}-title`} aria-describedby={description ? `${id}-description` : undefined}>
    <header className="es-pricing-intro">
      {mark && <div className="es-pricing-mark">{mark}</div>}
      <Heading id={`${id}-title`}>{title}</Heading>
      {description && <p id={`${id}-description`}>{description}</p>}
    </header>
    {plans.length > 0 && <div className="es-pricing-grid">{plans.map(plan => <PricingCard key={plan.id} {...plan} featured={plan.id === featured} headingLevel={headingLevel === 1 ? 2 : 3} />)}</div>}
  </section>;
}
