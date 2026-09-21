import { useId, type ReactNode } from 'react';
import { PricingCard, type PricingCardProps } from 'beds';
import './pricing-section.css';

/** Optional comparison-page recipe; not a BEDS runtime export. */
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
  return <section className="recipe-pricing-section" aria-labelledby={`${id}-title`} aria-describedby={description ? `${id}-description` : undefined}>
    <header className="recipe-pricing-intro">
      {mark && <div className="recipe-pricing-mark">{mark}</div>}
      <Heading id={`${id}-title`}>{title}</Heading>
      {description && <p id={`${id}-description`}>{description}</p>}
    </header>
    {plans.length > 0 && <div className="recipe-pricing-grid">{plans.map(plan => <PricingCard key={plan.id} title={plan.title} description={plan.description} image={plan.image} price={plan.price} featuresLabel={plan.featuresLabel} features={plan.features} action={plan.action} actionNote={plan.actionNote} feedback={plan.feedback} featured={plan.id === featured} headingLevel={headingLevel === 1 ? 2 : 3} />)}</div>}
  </section>;
}
