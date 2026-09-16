import { useEffect, useId, useRef, useState } from 'react';
import { Button } from './controls';

function Fly({ position, flight }: { position: string; flight: 'one' | 'two' | 'three' }) {
  return <g transform={position}>
    <g className={`es-empty-folder-fly es-empty-folder-fly--${flight}`}>
      <path className="es-empty-folder-legs" d="m-2 0-3-2m3 4-3 1m7-3 3-2m-3 4 3 1" />
      <g className="es-empty-folder-wings">
        <ellipse cx="-3" cy="-2" rx="3" ry="4" transform="rotate(-35 -3 -2)" />
        <ellipse cx="3" cy="-2" rx="3" ry="4" transform="rotate(35 3 -2)" />
      </g>
      <ellipse className="es-empty-folder-body" cx="0" cy="1" rx="2.4" ry="3.3" />
      <circle className="es-empty-folder-body" cx="0" cy="-2.7" r="1.8" />
    </g>
  </g>;
}

/** Private decorative artwork; the containing card owns all empty-state meaning. */
export function EmptyFolderIllustration() {
  const id = useId();
  const region = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setDocumentVisible(document.visibilityState === 'visible');
    updateVisibility();
    document.addEventListener('visibilitychange', updateVisibility);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (region.current) observer.observe(region.current);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  return <div className="es-empty-folder" ref={region} data-paused={paused || !visible || !documentVisible}>
    <svg className="es-empty-folder-art" viewBox="70 25 220 160" aria-hidden="true" focusable="false">
      <defs>
        <path id={`${id}-back-shape`} d="M106 71q0-12 12-12h39q7 0 12 7l8 9h65q12 0 12 12v70q0 14-14 14H120q-14 0-14-14Z" />
        <path id={`${id}-front-shape`} d="M101 112q0-13 13-13h35q13 0 24 7l5 3q9 5 20 5h48q15 0 13 15l-5 31q-2 14-17 14H119q-15 0-17-15Z" />
        <linearGradient id={`${id}-tint`} x1="0" y1="0" x2="0" y2="1">
          <stop className="es-empty-folder-tint" />
          <stop offset="1" className="es-empty-folder-tint" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-back`} x1="0" y1="0" x2="0" y2="1">
          <stop className="es-empty-folder-back-top" />
          <stop offset="1" className="es-empty-folder-back-bottom" />
        </linearGradient>
        <linearGradient id={`${id}-front`} x1="0" y1="0" x2=".6" y2="1">
          <stop className="es-empty-folder-front-top" />
          <stop offset="1" className="es-empty-folder-front-bottom" />
        </linearGradient>
      </defs>
      <ellipse className="es-empty-folder-shadow" cx="180" cy="179" rx="75" ry="5" />
      <use className="es-empty-folder-outline" href={`#${id}-back-shape`} fill={`url(#${id}-back)`} />
      <use href={`#${id}-back-shape`} fill={`url(#${id}-tint)`} opacity=".18" />
      <path className="es-empty-folder-fold" d="M116 88h129" />
      <use className="es-empty-folder-outline" href={`#${id}-front-shape`} fill={`url(#${id}-front)`} />
      <use href={`#${id}-front-shape`} fill={`url(#${id}-tint)`} opacity=".10" />
      <path className="es-empty-folder-highlight" d="M114 102h34q13 0 24 7l5 3q9 5 21 5h47" />
      <Fly position="translate(134 47)" flight="one" />
      <Fly position="translate(205 57)" flight="two" />
      <Fly position="translate(248 89)" flight="three" />
    </svg>
    <div className="es-empty-folder-playback">
      <Button variant="ghost" compact icon={paused ? 'Play' : 'Pause'} label={paused ? 'Retomar animação' : 'Pausar animação'} onClick={() => setPaused(value => !value)} />
    </div>
  </div>;
}
