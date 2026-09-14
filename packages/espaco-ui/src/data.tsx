import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from './controls';
import { EmptyState, LoadingIndicator, Notice } from './feedback';
import './data.css';

export type DataTableColumn = {
  id: string;
  label: string;
  numeric?: boolean;
};

export type DataTableRow = {
  id: string;
  cells: Record<string, string | number | null>;
};

type DataTableAction = {
  label: string;
  onClick: () => void;
};

export type DataTableState =
  | { kind: 'ready' }
  | { kind: 'loading'; label: string }
  | { kind: 'empty'; title: string; description?: string; action?: DataTableAction }
  | { kind: 'error'; title: string; description: string; action?: DataTableAction };

type DataTableProps = {
  label: string;
  unavailableLabel: string;
  columns: DataTableColumn[];
  rows: DataTableRow[];
  state: DataTableState;
};

function MissingCell({ label }: { label: string }) {
  return <span className="es-data-table-missing" aria-label={label}>—</span>;
}

function DataTableStateRow({ state, columnCount }: { state: Exclude<DataTableState, { kind: 'ready' }>; columnCount: number }) {
  if (state.kind === 'loading') {
    return <tr><td className="es-data-table-state" colSpan={columnCount}><LoadingIndicator label={state.label} /></td></tr>;
  }

  if (state.kind === 'empty') {
    return <tr><td className="es-data-table-state" colSpan={columnCount}><EmptyState title={state.title} description={state.description} action={state.action} /></td></tr>;
  }

  return <tr><td className="es-data-table-state" colSpan={columnCount}>
    <div className="es-data-table-error"><Notice title={state.title} description={state.description} tone="error" />{state.action && <Button label={state.action.label} onClick={state.action.onClick} compact />}</div>
  </td></tr>;
}

function useOverflowRegion(dependencies: readonly unknown[], axis: 'horizontal' | 'vertical', contentSelector: string) {
  const region = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  useLayoutEffect(() => {
    const element = region.current;
    if (!element) return;
    const update = () => setHasOverflow(axis === 'horizontal' ? element.scrollWidth > element.clientWidth : element.scrollHeight > element.clientHeight);
    update();
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(update);
    observer?.observe(element);
    const content = element.querySelector(contentSelector);
    if (content) observer?.observe(content);
    return () => observer?.disconnect();
  }, [axis, contentSelector, ...dependencies]);

  return { region, hasOverflow };
}

function normalizeOneBased(value: number) {
  return Number.isFinite(value) ? Math.max(Math.trunc(value), 1) : 1;
}

/**
 * Read-only table presentation. Data state and recovery callbacks stay controlled by the consumer.
 * Sorting, selection, requests, virtualization and drag behavior intentionally are not part of this pattern.
 */
export function DataTable({ label, unavailableLabel, columns, rows, state }: DataTableProps) {
  const id = useId();
  const columnCount = Math.max(columns.length, 1);
  const { region, hasOverflow } = useOverflowRegion([columns, rows, state.kind], 'horizontal', 'table');

  return <section className="es-data-table" aria-labelledby={id}>
    <h2 id={id} className="es-sr-only">{label}</h2>
    <div ref={region} className="es-data-table-scroll" tabIndex={hasOverflow ? 0 : -1}>
      <table aria-busy={state.kind === 'loading' || undefined}>
        <caption className="es-sr-only">{label}</caption>
        <thead><tr>{columns.map(column => <th key={column.id} scope="col" data-numeric={column.numeric || undefined}>{column.label}</th>)}</tr></thead>
        <tbody>{state.kind === 'ready'
          ? rows.map(row => <tr key={row.id}>{columns.map(column => {
            const value = row.cells[column.id];
            return <td key={column.id} data-numeric={column.numeric || undefined}>{value === null || value === undefined ? <MissingCell label={unavailableLabel} /> : value}</td>;
          })}</tr>)
          : <DataTableStateRow state={state} columnCount={columnCount} />}
        </tbody>
      </table>
    </div>
  </section>;
}

/** Fixed-width manual card rail. It never advances itself or owns the cards' state. */
export function HorizontalRail({ label, children }: { label: string; children: ReactNode }) {
  const { region, hasOverflow } = useOverflowRegion([children], 'horizontal', '.es-horizontal-rail-track');
  return <div ref={region} className="es-horizontal-rail" role="region" aria-label={label} tabIndex={hasOverflow ? 0 : -1}>
    <div className="es-horizontal-rail-track">{children}</div>
  </div>;
}

// One copy enters the accessibility tree/Tab order. Pointer copies remain usable;
// promote their group before native focus, without moving the clicked card.
function CarouselCopy({ children, active, onActivate }: { children: ReactNode; active: boolean; onActivate: () => void }) {
  const group = useRef<HTMLDivElement>(null);
  const originalTabIndex = useRef(new WeakMap<HTMLElement, string | null>());
  useLayoutEffect(() => {
    group.current?.querySelectorAll<HTMLElement>('a[href],button,input,textarea,select,[tabindex]').forEach(element => {
      if (!originalTabIndex.current.has(element)) originalTabIndex.current.set(element, element.getAttribute('tabindex'));
      const initial = originalTabIndex.current.get(element);
      if (!active) element.tabIndex = -1;
      else if (initial === null || initial === undefined) element.removeAttribute('tabindex');
      else element.setAttribute('tabindex', initial);
    });
  }, [active, children]);
  return <div ref={group} className="es-horizontal-rail-track es-carousel-copy" aria-hidden={!active || undefined} onPointerDownCapture={onActivate} onFocusCapture={onActivate}>{children}</div>;
}

/** Continuous circular rail. Card values/actions are caller-controlled across copies. */
export function Carousel({ label, children, interactionHint = 'Scroll to explore. While focused, press Space to pause or resume automatic scrolling.' }: {
  label: string; children: ReactNode; interactionHint?: string;
}) {
  const region = useRef<HTMLDivElement>(null);
  const period = useRef(0);
  const loopInitialized = useRef(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [activeCopy, setActiveCopy] = useState(1);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const activePointers = useRef(new Set<number>());
  const [reducedMotion, setReducedMotion] = useState(true);
  const [visible, setVisible] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const moving = hasOverflow && !paused && !hovered && !focused && !interacting && !reducedMotion && visible && documentVisible;
  const playback = !hasOverflow ? 'static' : reducedMotion ? 'reduced-motion' : paused ? 'paused' : focused ? 'focused' : hovered ? 'hovered' : interacting ? 'interacting' : !visible ? 'offscreen' : !documentVisible ? 'hidden' : 'playing';

  useLayoutEffect(() => {
    const element = region.current;
    const track = element?.firstElementChild;
    const copy = track?.firstElementChild as HTMLElement | null;
    if (!element || !track || !copy) return;
    const measure = () => {
      const copyWidth = copy.getBoundingClientRect().width;
      const next = copyWidth + 16;
      const overflow = copyWidth > element.clientWidth;
      const previous = period.current;
      period.current = next;
      setHasOverflow(overflow);
      if (!overflow) loopInitialized.current = false;
      if (overflow && track.children.length === 3) {
        if (!loopInitialized.current) { element.scrollLeft = next; setActiveCopy(1); }
        else if (next !== previous && previous > 0) element.scrollLeft = element.scrollLeft / previous * next;
        loopInitialized.current = true;
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    observer.observe(copy);
    return () => observer.disconnect();
  }, [children, hasOverflow]);

  const interact = () => {
    setInteracting(true);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => { if (activePointers.current.size === 0) setInteracting(false); }, 1200);
  };
  useEffect(() => {
    const release = (event: PointerEvent) => { if (activePointers.current.delete(event.pointerId)) interact(); };
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    return () => {
      clearTimeout(idleTimer.current);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
    };
  }, []);

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(preference.matches);
    const updateVisibility = () => setDocumentVisible(document.visibilityState === 'visible');
    updatePreference();
    updateVisibility();
    preference.addEventListener('change', updatePreference);
    document.addEventListener('visibilitychange', updateVisibility);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (region.current) observer.observe(region.current);
    return () => {
      preference.removeEventListener('change', updatePreference);
      document.removeEventListener('visibilitychange', updateVisibility);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const element = region.current;
    if (!element || !moving) return;
    let position = element.scrollLeft;
    let lastTime: number | undefined;
    let frame = 0;
    const advance = (time: number) => {
      const elapsed = lastTime === undefined ? 0 : Math.min(time - lastTime, 48);
      lastTime = time;
      if (Math.abs(element.scrollLeft - position) > 1) position = element.scrollLeft;
      // Adjacent copies meet at exactly one period; wrapping never reverses or leaves a gap.
      position += elapsed * .034;
      if (position >= period.current * 2) position -= period.current;
      element.scrollLeft = position;
      frame = requestAnimationFrame(advance);
    };
    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [moving, children]);

  return <div className="es-carousel" data-moving={moving} data-playback={playback}>
    <div ref={region} className="es-horizontal-rail es-carousel-viewport" role="region" aria-roledescription="carousel" aria-label={label} aria-description={hasOverflow ? interactionHint : undefined} tabIndex={hasOverflow ? 0 : -1}
      onPointerEnter={event => { if (event.pointerType !== 'touch') setHovered(true); }} onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onPointerDown={event => { activePointers.current.add(event.pointerId); interact(); }} onWheel={interact}
      onKeyDown={event => { if (event.target === event.currentTarget && event.key === ' ') { event.preventDefault(); setPaused(value => !value); } }}
      onScroll={event => {
        const element = event.currentTarget;
        // Native touch/wheel remains circular too. Never relocate a focused card.
        if (moving || !hasOverflow || (element.contains(document.activeElement) && document.activeElement !== element)) return;
        if (element.scrollLeft < period.current / 2) element.scrollLeft += period.current;
        else if (element.scrollLeft >= period.current * 2) element.scrollLeft -= period.current;
        if (interacting) interact();
      }}>
      <div className="es-carousel-track">
        {(hasOverflow ? [0, 1, 2] : [1]).map(copy => <CarouselCopy key={copy} active={!hasOverflow || copy === activeCopy} onActivate={() => setActiveCopy(copy)}>{children}</CarouselCopy>)}
      </div>
    </div>
  </div>;
}

/** Fixed-height manual list region. It preserves every child and exposes native vertical scroll when needed. */
export function ScrollableList({ label, children }: { label: string; children: ReactNode }) {
  const { region, hasOverflow } = useOverflowRegion([children], 'vertical', '.es-scrollable-list-content');
  return <div className="es-scrollable-list">
    <div ref={region} className="es-scrollable-list-region" role="region" aria-label={label} tabIndex={hasOverflow ? 0 : -1}>
      <div className="es-scrollable-list-content">{children}</div>
    </div>
  </div>;
}

type PaginationProps = {
  label: string;
  page: number;
  pageCount: number;
  summary: (state: { page: number; pageCount: number }) => string;
  previousLabel: string;
  nextLabel: string;
  onPageChange: (page: number) => void;
};

/** Controlled adjacent-page navigation. Page numbers are one-based. */
export function Pagination({ label, page, pageCount, summary, previousLabel, nextLabel, onPageChange }: PaginationProps) {
  const safePageCount = normalizeOneBased(pageCount);
  const currentPage = Math.min(normalizeOneBased(page), safePageCount);
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < safePageCount;
  const normalizedSummary = summary({ page: currentPage, pageCount: safePageCount });

  return <nav className="es-pagination" aria-label={label}>
    <span className="es-pagination-summary" aria-live="polite">{normalizedSummary}</span>
    <div className="es-pagination-actions">
      <Button label={previousLabel} compact disabled={!hasPrevious} onClick={() => onPageChange(currentPage - 1)} />
      <Button label={nextLabel} compact disabled={!hasNext} onClick={() => onPageChange(currentPage + 1)} />
    </div>
  </nav>;
}
