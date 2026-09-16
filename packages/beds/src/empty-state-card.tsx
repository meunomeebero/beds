import { useId } from 'react';
import { CardMedia } from './card-media';
import { EmptyFolderIllustration } from './empty-folder-illustration';
import { Button } from './controls';
import { Icon, type IconName } from './foundation';
import './empty-state-card.css';

export type EmptyStateCardProps = {
  title: string;
  description: string;
  icon?: IconName;
  headingLevel?: 2 | 3;
  action?: { label: string; onClick: () => void; disabled?: boolean; busy?: boolean };
} & (
  | { image: { src: string; alt: string; fallbackLabel?: string }; illustration?: never }
  | { illustration: 'empty-folder'; image?: never }
);

/** Quiet, illustrated empty state. Caller owns the condition and any next step. */
export function EmptyStateCard({ title, description, image, illustration, icon = 'Inbox', headingLevel = 2, action }: EmptyStateCardProps) {
  const id = useId();
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  return <article className="es-empty-state-card" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}>
    <div className="es-empty-state-card-content">
      <span className="es-empty-state-card-icon" aria-hidden="true"><Icon name={icon} purpose="action" /></span>
      <div className="es-empty-state-card-copy">
        <Heading id={`${id}-title`}>{title}</Heading>
        <p id={`${id}-description`}>{description}</p>
      </div>
      {action && <div className="es-empty-state-card-action"><Button label={action.label} onClick={action.onClick} busy={action.busy} disabled={action.disabled} variant="primary" purpose="welcome" /></div>}
    </div>
    {illustration === 'empty-folder' ? <EmptyFolderIllustration /> : <CardMedia key={image.src} purpose="empty-state" src={image.src} alt={image.alt} fallbackLabel={image.fallbackLabel} />}
  </article>;
}
