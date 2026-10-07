import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { motion, useReducedMotion, type Transition } from 'motion/react';
import { Button } from './controls';
import { cn } from './lib/utils';
import './disclosure.css';

const DISCLOSURE_OPEN_TRANSITION: Transition = { type: 'spring', duration: .58, bounce: .32 };
const DISCLOSURE_CLOSE_TRANSITION: Transition = { type: 'spring', duration: .46, bounce: .26 };
const DISCLOSURE_LAYOUT_TRANSITION: Transition = { type: 'spring', duration: .55, bounce: .38 };

/** Measured line clamp. The toggle exists only when the content really
 * overflows its clamped layout, measured after fonts settle and on resize.
 * While expanded, re-measure the CLAMPED layout on demand so the toggle
 * never disappears after collapse. Full text stays in the DOM. */
export function DisclosureText({ lines = 3, moreLabel, lessLabel, children }: {
  lines?: 2 | 3 | 6; moreLabel: string; lessLabel: string; children: string;
}) {
  const textId = useId();
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const [heights, setHeights] = useState({ clamped: 0, full: 0 });

  const measure = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    // Always measure both layouts. The full string stays mounted for
    // assistive reading, while the outer motion box owns the reveal.
    element.classList.add('es-disclosure-text--clamped');
    const clamped = element.offsetHeight;
    const overflowing = element.scrollHeight > clamped + 1;
    element.classList.remove('es-disclosure-text--clamped');
    const full = element.offsetHeight;
    setOverflows(overflowing);
    setHeights(previous => previous.clamped === clamped && previous.full === full ? previous : { clamped, full });
    if (!expanded) element.classList.add('es-disclosure-text--clamped');
  }, [expanded]);

  useLayoutEffect(() => {
    measure();
    if (document.fonts?.ready) void document.fonts.ready.then(measure);
    const element = ref.current;
    const observer = element ? new ResizeObserver(measure) : undefined;
    if (element && observer) observer.observe(element);
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => { clearTimeout(timer); timer = setTimeout(measure, 120); };
    window.addEventListener('resize', onResize);
    return () => { observer?.disconnect(); window.removeEventListener('resize', onResize); clearTimeout(timer); };
  }, [measure, children, lines]);

  return <>
    <motion.div
      className="es-disclosure-content overflow-hidden"
      initial={false}
      animate={{ height: expanded ? heights.full : heights.clamped }}
      transition={reduce ? { duration: 0 } : expanded ? DISCLOSURE_OPEN_TRANSITION : DISCLOSURE_CLOSE_TRANSITION}
    >
      <p ref={ref} id={textId} className={cn('es-disclosure-text', !expanded && 'es-disclosure-text--clamped')} style={{ '--es-disclosure-lines': lines } as CSSProperties}>{children}</p>
    </motion.div>
    {(overflows || expanded) && <Button label={expanded ? lessLabel : moreLabel} variant="ghost" compact aria-expanded={expanded} aria-controls={textId} onClick={() => setExpanded(value => !value)} />}
  </>;
}

/** Passive wrap of inert labels, disclosed by MEASURED wrap rows: everything
 * beyond the initial row budget collapses behind a count toggle. Labels are
 * never buttons — the toggle is the only interactive element. Rows re-measure
 * after fonts settle and on resize; a changed label list re-measures too. */
export function LabelField({ labels, initialRows = 3, moreLabel, lessLabel }: {
  labels: readonly string[]; initialRows?: number; moreLabel: (hidden: number) => string; lessLabel: string;
}) {
  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const restRef = useRef<HTMLUListElement>(null);
  const reduce = useReducedMotion();
  const [cut, setCut] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [restHeight, setRestHeight] = useState(0);
  const trimmed = labels.map(label => label.trim()).filter(Boolean);
  const identity = trimmed.join('\u0000');

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const items = list.querySelectorAll<HTMLElement>(':scope > .es-label-field-item');
    const rows = new Set<number>();
    for (let index = 0; index < items.length; index++) {
      rows.add(items[index].offsetTop);
      if (rows.size > initialRows) { setCut(index); return; }
    }
    setCut(null);
  }, [initialRows]);

  // Two-pass measurement: while cut === null every label renders in the main
  // list; the pre-paint layout effect then cuts at the first label of row
  // initialRows + 1. The un-split frame never flashes.
  useLayoutEffect(() => {
    if (cut !== null) return;
    measure();
  }, [cut, measure, identity]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const reset = () => setCut(null);
    const onResize = () => { clearTimeout(timer); timer = setTimeout(reset, 120); };
    window.addEventListener('resize', onResize);
    if (document.fonts?.ready) void document.fonts.ready.then(reset);
    return () => { window.removeEventListener('resize', onResize); clearTimeout(timer); };
  }, []);

  useLayoutEffect(() => {
    const list = restRef.current;
    if (!list) return;
    const updateHeight = () => setRestHeight(list.offsetHeight);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(list);
    return () => observer.disconnect();
  }, [cut, identity]);

  const visible = cut === null ? trimmed : trimmed.slice(0, cut);
  const hidden = cut === null ? [] : trimmed.slice(cut);

  if (trimmed.length === 0) return null;

  return <div className="es-label-field">
    <ul ref={listRef} id={listId} className="es-label-field-list">
      {visible.map((label, index) => <li key={`${label}-${index}`} className="es-label-field-item">{label}</li>)}
      {hidden.length > 0 && <motion.li
        className="es-label-field-rest"
        data-expanded={expanded}
        aria-hidden={!expanded}
        inert={!expanded || undefined}
        initial={false}
        animate={{ height: expanded ? restHeight : 0, opacity: expanded ? 1 : 0 }}
        transition={reduce ? { duration: 0 } : expanded ? DISCLOSURE_OPEN_TRANSITION : DISCLOSURE_CLOSE_TRANSITION}
      >
        <ul ref={restRef} className="es-label-field-rest-list">{hidden.map((label, index) => <li key={`${label}-${cut! + index}`} className="es-label-field-item">{label}</li>)}</ul>
      </motion.li>}
    </ul>
    {cut !== null && <Button label={expanded ? lessLabel : moreLabel(hidden.length)} variant="ghost" compact aria-expanded={expanded} aria-controls={listId} onClick={() => setExpanded(value => !value)} />}
  </div>;
}

/** Count-disclosed stack of records (e.g. history entries): the first
 * `visibleCount` records render normally, older records stay out of the
 * document until expanded — no hidden tab stops, real count disclosure.
 * `render` receives the visible slice of records each pass. */
export function DisclosedRecords<T>({ records, visibleCount, moreLabel, lessLabel, render }: {
  records: readonly T[]; visibleCount: number; moreLabel: (hidden: number) => string; lessLabel: string;
  render: (records: readonly T[]) => ReactNode;
}) {
  const regionId = useId();
  const reduce = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  if (records.length <= visibleCount) return <>{render(records)}</>;
  const visible = expanded ? records : records.slice(0, visibleCount);
  const hidden = records.length - visibleCount;
  return <>
    <motion.div id={regionId} layout="size" initial={false} transition={reduce ? { duration: 0 } : DISCLOSURE_LAYOUT_TRANSITION}>{render(visible)}</motion.div>
    {!expanded && <Button label={moreLabel(hidden)} variant="ghost" compact aria-expanded={false} aria-controls={regionId} onClick={() => setExpanded(true)} />}
    {expanded && <Button label={lessLabel} variant="ghost" compact aria-expanded={true} aria-controls={regionId} onClick={() => setExpanded(false)} />}
  </>;
}
