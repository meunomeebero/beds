import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Button, SegmentedControl } from './controls';
import { useReducedMotionPreference } from './lib/hooks/use-reduced-motion';
import './document.css';

/* Document workspace (0.3.0-rc.4), the reference app's editor frame: a square stage where the document rests as a sheet,
   an optional side pane (the section editor) with a resize handle, and a footer strip under both. Below a 960px frame
   the panes become one tab pill. Every color is a BEDS token. */

export type DocumentPane = 'document' | 'side';

export type DocumentWorkspaceProps = {
  /** Toolbar at the top of the stage, outside its scroll region (usually a `DocumentToolbar`). */
  toolbar?: ReactNode;
  /** The document: sheets (`DocumentSheet`), a PDF viewer, a loading or empty state. It scrolls inside the stage. */
  document: ReactNode;
  /** Accessible name of the document scroll region, e.g. "Documento em PDF". */
  documentRegionLabel: string;
  /** The side pane, usually an `EditorPane`. Without it the stage takes the whole frame and no tabs show. */
  side?: ReactNode;
  /** Strip under both panes, reachable from either tab (usually a `RatingStrip`). */
  footer?: ReactNode;
  /** Transient feedback and recovery, aligned to the frame above the panes. */
  notices?: ReactNode;
  /** The pane shown on narrow frames. */
  pane: DocumentPane;
  onPaneChange: (pane: DocumentPane) => void;
  /** Tab names, e.g. "Documento" and "Editar". */
  documentLabel: string;
  sideLabel: string;
  /** Accessible name of the tab pill, e.g. "Áreas do documento". */
  switchLabel: string;
  /** Accessible name of the resize handle, e.g. "Largura do painel de edição". */
  resizeLabel: string;
  /** Side pane width in percent of the frame (35–60). Default 42. */
  defaultSplit?: number;
};

const MIN_SPLIT = 35;
const MAX_SPLIT = 60;
const clamp = (value: number) => Math.min(MAX_SPLIT, Math.max(MIN_SPLIT, Math.round(value)));

/** The editor frame: stage + side pane (resizable 35–60%, arrows/Home/End on the handle) + footer; tabs on narrow frames. */
export function DocumentWorkspace({ toolbar, document, documentRegionLabel, side, footer, notices, pane, onPaneChange, documentLabel, sideLabel, switchLabel, resizeLabel, defaultSplit = 42 }: DocumentWorkspaceProps) {
  const [split, setSplit] = useState(() => clamp(defaultSplit));
  const workspace = useRef<HTMLDivElement>(null);
  const shown = side ? pane : 'document';
  return <div className="es-doc-workspace">
    {side && <div className="es-doc-workspace__tabs">
      <SegmentedControl label={switchLabel} value={shown} options={[{ id: 'document', label: documentLabel }, { id: 'side', label: sideLabel }]} onChange={next => onPaneChange(next === 'side' ? 'side' : 'document')} />
    </div>}
    {notices}
    <div ref={workspace} className="es-doc-workspace__panes" data-pane={shown} data-single={side ? undefined : ''} style={{ '--es-doc-side': `${split}%` } as CSSProperties}>
      <section className="es-doc-stage" aria-label={documentLabel}>
        {toolbar}
        <div className="es-doc-stage__scroller" role="region" aria-label={documentRegionLabel} tabIndex={0}>{document}</div>
      </section>
      {side && <>
        <div className="es-doc-workspace__separator" role="separator" tabIndex={0} aria-label={resizeLabel} aria-orientation="vertical"
          aria-valuemin={MIN_SPLIT} aria-valuemax={MAX_SPLIT} aria-valuenow={split} aria-valuetext={`${split}% ${sideLabel}, ${100 - split}% ${documentLabel}`}
          onKeyDown={event => {
            const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
            const step = event.key === 'ArrowLeft' ? 2 : event.key === 'ArrowRight' ? -2 : 0;
            if (!step && event.key !== 'Home' && event.key !== 'End') return;
            event.preventDefault();
            setSplit(value => event.key === 'Home' ? MIN_SPLIT : event.key === 'End' ? MAX_SPLIT : clamp(value + (rtl ? -step : step)));
          }}
          onPointerDown={event => event.currentTarget.setPointerCapture(event.pointerId)}
          onPointerMove={event => {
            if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
            const bounds = workspace.current?.getBoundingClientRect();
            if (!bounds) return;
            const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
            setSplit(clamp(((rtl ? event.clientX - bounds.left : bounds.right - event.clientX) / bounds.width) * 100));
          }}
          onPointerUp={event => event.currentTarget.releasePointerCapture(event.pointerId)} />
        <section className="es-doc-side" aria-label={sideLabel}>{side}</section>
      </>}
    </div>
    {footer && <div className="es-doc-workspace__footer">{footer}</div>}
  </div>;
}

export type DocumentToolbarProps = {
  /** Which version is on screen, usually a `VersionNote` (`review` or `history`). */
  status?: ReactNode;
  /** The document's actions: ghost compact buttons, then the one decision. */
  actions: ReactNode;
  /** Full-width notes under the actions (what a restore does, a live status). */
  notes?: ReactNode;
  /** Accessible name of the group, e.g. "Ações do documento". */
  label: string;
};

/** The stage's top bar: status, actions, and notes on their own line. */
export function DocumentToolbar({ status, actions, notes, label }: DocumentToolbarProps) {
  return <header className="es-doc-toolbar" role="group" aria-label={label}>
    {status}
    <div className="es-doc-toolbar__actions">{actions}</div>
    {notes && <div className="es-doc-toolbar__notes">{notes}</div>}
  </header>;
}

export type DocumentSheetProps = {
  /** Accessible name of the page, when the stage shows more than one. */
  label?: string;
  children: ReactNode;
};

/** One sheet of paper on the stage: the only raised object (light paper in both themes; the stage is themed, never the page). */
export function DocumentSheet({ label, children }: DocumentSheetProps) {
  const reduce = useReducedMotionPreference();
  return <motion.article className="es-doc-sheet" aria-label={label} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .36, ease: [.16, 1, .3, 1] }}>{children}</motion.article>;
}

export type RevisionEntry = {
  id: string;
  /** Where it came from, in plain words, e.g. "Versão entregue" or "Sua edição". */
  title: string;
  /** Formatted date and time. */
  when: string;
  /** Machine date for the `<time>` element. */
  dateTime?: string;
  /** `review`: waiting to be checked (brand-ink dot) · `current`: the version in use (success dot) · `previous` / `discarded`: neutral. */
  state: 'review' | 'current' | 'previous' | 'discarded';
  stateLabel: string;
  /** Appended to the date line, e.g. "Você confirmou com nota 5 de 5". */
  detail?: string;
  /** The person's own request that produced it, clamped to two lines. */
  request?: string;
  /** What changed, one line each. */
  summary?: readonly string[];
};

export type RevisionListProps = {
  /** Newest first. */
  entries: readonly RevisionEntry[];
  /** The version on screen. */
  displayedId?: string;
  onOpen: (id: string) => void;
  /** Accessible name of the list, e.g. "Versões, da mais recente para a mais antiga". */
  label: string;
  /** Action on other rows, e.g. "Ver esta versão". */
  openLabel: string;
  /** Line on the displayed row, e.g. "Aberta no documento". */
  displayedLabel: string;
};

/** Version history (usually in a `Drawer`): one chronology; opening only previews, decisions stay on the toolbar. */
export function RevisionList({ entries, displayedId, onOpen, label, openLabel, displayedLabel }: RevisionListProps) {
  return <ol className="es-revisions" aria-label={label}>
    {entries.map(entry => {
      const titleId = `es-revision-${entry.id}`;
      const displayed = entry.id === displayedId;
      return <li key={entry.id} className="es-revision" data-state={entry.state} aria-current={displayed || undefined}>
        <div className="es-revision__head">
          <h3 id={titleId}>{entry.title}</h3>
          <span className="es-revision__state">{entry.stateLabel}</span>
        </div>
        <p className="es-revision__meta"><time dateTime={entry.dateTime}>{entry.when}</time>{entry.detail && ` · ${entry.detail}`}</p>
        {entry.request && <p className="es-revision__request">{entry.request}</p>}
        {entry.summary && entry.summary.length > 0 && <ul>{entry.summary.map((line, index) => <li key={index}>{line}</li>)}</ul>}
        {displayed
          ? <p className="es-revision__current">{displayedLabel}</p>
          : <Button label={openLabel} variant="ghost" compact aria-describedby={titleId} onClick={() => onOpen(entry.id)} />}
      </li>;
    })}
  </ol>;
}
