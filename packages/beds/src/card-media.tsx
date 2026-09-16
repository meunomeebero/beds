import { useEffect, useRef, useState, type ReactNode } from 'react';

/** Internal media anatomy shared by image-led cards; key by src at the call site. */
export function CardMedia({ src, alt, fallbackLabel, fallback, purpose = 'feature' }: {
  src: string; alt: string; fallbackLabel?: string; purpose?: 'feature' | 'empty-state' | 'pricing' | 'blog';
  fallback?: ReactNode;
}) {
  const image = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'unavailable'>(src.trim() ? 'loading' : 'unavailable');

  useEffect(() => {
    // Cached images can finish before React attaches its load handler.
    if (image.current?.complete) setState(image.current.naturalWidth ? 'ready' : 'unavailable');
  }, []);

  return <div className={`es-${purpose}-card-media`} data-state={state} aria-busy={state === 'loading' || undefined}>
    {state === 'unavailable'
      ? <div className={`es-${purpose}-card-fallback`} role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={!alt || undefined}>{fallback ?? (alt && (fallbackLabel ?? alt))}</div>
      : <img ref={image} src={src} alt={alt} width={720} height={purpose === 'feature' ? 480 : purpose === 'pricing' ? 180 : purpose === 'blog' ? 720 : 336} loading="lazy" decoding="async" onLoad={() => setState('ready')} onError={() => setState('unavailable')} />}
  </div>;
}
