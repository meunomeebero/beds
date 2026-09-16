import { useId } from 'react';
import { Button } from './controls';
import { CardMedia } from './card-media';
import './feature-card.css';

type FeatureCardAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
};

export type FeatureCardProps = {
  image: { src: string; alt: string; fallbackLabel?: string };
  title: string;
  description: string;
  primaryAction: FeatureCardAction;
  secondaryAction?: FeatureCardAction;
};

/** Image-led introduction. Content/actions stay controlled; no onboarding or overlay behavior. */
export function FeatureCard({ image, title, description, primaryAction, secondaryAction }: FeatureCardProps) {
  const id = useId();
  return <article className="es-feature-card" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}>
    <CardMedia key={image.src} src={image.src} alt={image.alt} fallbackLabel={image.fallbackLabel} />
    <div className="es-feature-card-content">
      <div className="es-feature-card-copy">
        <h2 id={`${id}-title`}>{title}</h2>
        <p id={`${id}-description`}>{description}</p>
      </div>
      <div className="es-feature-card-actions">
        <Button label={primaryAction.label} onClick={primaryAction.onClick} disabled={primaryAction.disabled} busy={primaryAction.busy} purpose="welcome" variant="primary" />
        {secondaryAction && <Button label={secondaryAction.label} onClick={secondaryAction.onClick} disabled={secondaryAction.disabled} busy={secondaryAction.busy} purpose="welcome" variant="ghost" />}
      </div>
    </div>
  </article>;
}
