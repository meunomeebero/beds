import { useId, type ReactNode } from 'react';
import { Button } from './controls';
import { Icon } from './foundation';
import { CardMedia } from './card-media';
import './pricing.css';

export type PricingCardProps = {
  title: string;
  description: string;
  image: { src: string; alt: string; fallbackLabel?: string };
  price: { label: string; description?: string };
  featuresLabel: string;
  features: readonly { id: string; text: string }[];
  action: { label: string; onClick: () => void; busy?: boolean; disabled?: boolean };
  actionNote?: string;
  feedback?: string;
  featured?: boolean;
  headingLevel?: 2 | 3;
};

/** Display only: hosts supply complete prices, billing terms and actual outcomes. */
export function PricingCard({ title, description, image, price, featuresLabel, features, action, actionNote, feedback, featured = false, headingLevel = 2 }: PricingCardProps) {
  const id = useId();
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  const actionDescription = [price.description && `${id}-billing`, actionNote && `${id}-note`].filter(Boolean).join(' ') || undefined;
  return <article className="es-pricing-card" data-featured={featured || undefined} aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}>
    <CardMedia key={image.src} purpose="pricing" src={image.src} alt={image.alt} fallbackLabel={image.fallbackLabel} />
    <div className="es-pricing-content">
      <div className="es-pricing-copy">
        <div className="es-pricing-heading"><Heading id={`${id}-title`}>{title}</Heading><span className="es-pricing-price"><bdi>{price.label}</bdi></span></div>
        {price.description && <p className="es-pricing-billing" id={`${id}-billing`}>{price.description}</p>}
        <p className="es-pricing-description" id={`${id}-description`}>{description}</p>
      </div>
      {features.length > 0 && <div className="es-pricing-benefits"><p id={`${id}-features`}>{featuresLabel}</p><ul role="list" aria-labelledby={`${id}-features`}>{features.map(feature => <li key={feature.id}><Icon name="CheckCircle2" purpose="action" /><span>{feature.text}</span></li>)}</ul></div>}
      <div className="es-pricing-footer">
        {actionNote && <p className="es-pricing-note" id={`${id}-note`}>{actionNote}</p>}
        <Button label={action.label} onClick={action.onClick} busy={action.busy} disabled={action.disabled} purpose="welcome" aria-describedby={actionDescription} />
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
