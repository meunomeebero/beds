import { Children, useCallback, useEffect, useState, type KeyboardEvent, type ReactNode } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Icon } from './foundation';
import './paged-carousel.css';

export type PagedCarouselProps = {
  label: string;
  previousLabel: string;
  nextLabel: string;
  slideLabel: (state: { index: number; count: number }) => string;
  children: ReactNode;
};

/**
 * Manual, finite content carousel for onboarding and editorial galleries.
 * For continuous autonomous rails, use Carousel instead.
 */
export function PagedCarousel({ label, previousLabel, nextLabel, slideLabel, children }: PagedCarouselProps) {
  const slides = Children.toArray(children);
  const [viewportRef, api] = useEmblaCarousel({ align: 'start', loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(slides.length > 1);

  const synchronize = useCallback(() => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
    setCanScrollPrevious(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    synchronize();
    api.on('select', synchronize).on('reInit', synchronize);
    return () => {
      api.off('select', synchronize).off('reInit', synchronize);
    };
  }, [api, synchronize]);

  const shouldJump = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const previous = (jump = shouldJump()) => api?.scrollPrev(jump);
  const next = (jump = shouldJump()) => api?.scrollNext(jump);
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      previous(true);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      next(true);
    }
  };

  return <section className="es-paged-carousel" role="region" aria-roledescription="carousel" aria-label={label} tabIndex={0} onKeyDown={onKeyDown}>
    <div className="es-paged-carousel-viewport" ref={viewportRef}>
      <div className="es-paged-carousel-track">
        {slides.map((slide, index) => <div
          className="es-paged-carousel-slide"
          role="group"
          aria-roledescription="slide"
          aria-label={slideLabel({ index: index + 1, count: slides.length })}
          aria-current={index === selectedIndex ? 'true' : undefined}
          key={(slide as { key?: string | number | null }).key ?? index}
        >{slide}</div>)}
      </div>
    </div>
    {slides.length > 1 && <div className="es-paged-carousel-controls">
      <button type="button" className="es-paged-carousel-control" aria-label={previousLabel} disabled={!canScrollPrevious} onClick={() => previous()}><Icon name="ArrowLeft" purpose="small" /></button>
      <button type="button" className="es-paged-carousel-control" aria-label={nextLabel} disabled={!canScrollNext} onClick={() => next()}><Icon name="ArrowRight" purpose="small" /></button>
    </div>}
    {slides.length > 0 && <span className="es-sr-only" aria-live="polite">{slideLabel({ index: selectedIndex + 1, count: slides.length })}</span>}
  </section>;
}
