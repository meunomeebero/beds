import { useEffect, useId, useRef, useState } from 'react';
import { Button } from './controls';
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

function FeatureCardMedia({ src, alt, fallbackLabel }: FeatureCardProps['image']) {
  const image = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'unavailable'>(src.trim() ? 'loading' : 'unavailable');

  useEffect(() => {
    // A cached image can finish before React attaches its load handler.
    if (image.current?.complete) setState(image.current.naturalWidth ? 'ready' : 'unavailable');
  }, []);

  const unavailable = state === 'unavailable';
  return <div className="es-feature-card-media" data-state={state} aria-busy={state === 'loading' || undefined}>
    {unavailable
      ? <div className="es-feature-card-fallback" role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={!alt || undefined}>{alt && (fallbackLabel ?? alt)}</div>
      : <img ref={image} src={src} alt={alt} width={720} height={480} loading="lazy" decoding="async" onLoad={() => setState('ready')} onError={() => setState('unavailable')} />}
  </div>;
}

/** Image-led introduction. Content/actions stay controlled; no onboarding or overlay behavior. */
export function FeatureCard({ image, title, description, primaryAction, secondaryAction }: FeatureCardProps) {
  const id = useId();
  return <article className="es-feature-card" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}>
    <FeatureCardMedia key={image.src} src={image.src} alt={image.alt} fallbackLabel={image.fallbackLabel} />
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
