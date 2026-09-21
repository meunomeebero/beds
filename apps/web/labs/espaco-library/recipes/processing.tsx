/** Optional app recipe; see docs/design/espaco-library/AGNOSTIC-DS.md. */
import { useEffect, useId, useRef, useState, type ReactNode, type Ref } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Button } from 'beds';
import { Icon } from 'beds';
import { MeterSegments } from 'beds';
// App-owned motion for the recipe's stage illustration.
const SPRING_SWAP = { type: 'spring', stiffness: 460, damping: 30, mass: .55 } as const;
import './processing.css';

export type ProcessingStep = {
  id: string;
  label: string;
  detail: string;
  state: 'pending' | 'active' | 'complete';
  statusLabel: string;
  progress: number;
};

export type ProcessingStory = {
  title: string;
  caption: string;
  speaker: string;
  elapsedLabel: string;
  durationLabel: string;
  transcriptLabel: string;
  chapters: readonly { id: string; time: string; title: string; body: string; current: boolean }[];
};

export type ProcessingViewProps = {
  /** Caller-selected recovery destination when a transient action disappears. */
  headingRef?: Ref<HTMLHeadingElement>;
  title: string;
  description: string;
  context: string;
  mark?: ReactNode;
  state: 'running' | 'waiting' | 'success' | 'error';
  statusLabel: string;
  /** Caller signal, never elapsed-time completion. Null means indeterminate. */
  progress: number | null;
  progressLabel: string;
  progressDescription: string;
  stepsLabel: string;
  steps: readonly ProcessingStep[];
  story: ProcessingStory;
  message?: string;
  /** Announce stage/terminal changes only, not every progress tick. */
  announcement: string;
  detailsLabel: string;
  logs: readonly string[];
  scores?: { label: string; note: string; items: readonly { id: string; label: string; value: number }[] };
  motion: { paused: boolean; pauseLabel: string; resumeLabel: string; description: string; onPausedChange: (paused: boolean) => void };
  actions?: readonly { label: string; onClick: () => void; primary?: boolean }[];
};

function percentage(value: number, ceiling = 100) {
  return Number.isFinite(value) ? Math.max(0, Math.min(ceiling, value)) : 0;
}

function ProcessingStepIcon({ state, index }: { state: ProcessingStep['state']; index: number }) {
  const reduce = useReducedMotion() ?? false;
  const complete = state === 'complete';
  return <span className="recipe-processing-step-icon" aria-hidden="true">
    <AnimatePresence initial={false} mode="popLayout">
      {complete
        ? <motion.span key="complete" initial={reduce ? false : { opacity: 0, scale: .72 }} animate={{ opacity: 1, scale: 1 }} exit={reduce ? undefined : { opacity: 0, scale: .72 }} transition={reduce ? { duration: 0 } : SPRING_SWAP}><Icon name="Check" purpose="action" /></motion.span>
        : <motion.span key="pending" initial={reduce ? false : { opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} exit={reduce ? undefined : { opacity: 0, scale: .72 }} transition={reduce ? { duration: 0 } : SPRING_SWAP}>{index + 1}</motion.span>}
    </AnimatePresence>
  </span>;
}

function ProcessingScoreMeter({ label, value, paused }: { label: string; value: number; paused: boolean }) {
  const valid = Number.isFinite(value);
  const display = valid ? `${Math.round(percentage(value))}` : '—';
  return <div className="recipe-processing-meter"><div className="recipe-processing-meter-label"><span>{label}</span><span>{display}</span></div><MeterSegments label={label} value={valid ? value : null} tone="brand" animateFill paused={paused} valueText={valid ? `${display}/100` : `${label}: unavailable`} /></div>;
}

/** Presentation only. The host owns requests, timing, stages and terminal signals. */
export function ProcessingView({ headingRef, title, description, context, mark, state, statusLabel, progress, progressLabel, progressDescription, stepsLabel, steps, story, message, announcement, detailsLabel, logs, scores, motion, actions }: ProcessingViewProps) {
  const id = useId();
  const art = useRef<HTMLDivElement>(null);
  const [artVisible, setArtVisible] = useState(true);
  useEffect(() => {
    const node = art.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setArtVisible(entry.isIntersecting));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const terminal = state === 'success' || state === 'error';
  const value = state === 'success' ? 100 : progress === null || !Number.isFinite(progress) ? null : percentage(progress, 95);
  return <section className="recipe-processing" data-state={state} data-motion-paused={motion.paused || terminal || undefined} aria-labelledby={`${id}-title`}>
    <header className="recipe-processing-heading">
      <div className="recipe-processing-identity">{mark}<span>{context}</span></div>
      <h1 ref={headingRef} tabIndex={-1} id={`${id}-title`}>{title}</h1>
      <p>{description}</p>
    </header>
    <div className="recipe-processing-workspace">
      <div className="recipe-processing-main">
        <div className="recipe-processing-progress">
          <div className="recipe-processing-progress-label"><span>{progressLabel}</span><strong>{value === null ? statusLabel : `${Math.round(value)}%`}</strong></div>
          <MeterSegments label={progressLabel} value={value} tone="brand" role="progressbar" valueText={value === null ? statusLabel : `${Math.round(value)}% — ${statusLabel}`} />
          <p>{progressDescription}</p>
        </div>
        {message && <p className="recipe-processing-message" data-state={state}><Icon name={state === 'error' ? 'AlertCircle' : state === 'success' ? 'CheckCircle2' : 'Info'} purpose="action" /><span>{message}</span></p>}
        <ol className="recipe-processing-steps" aria-label={stepsLabel}>
          {steps.map((step, index) => <li key={step.id} data-state={step.state} aria-current={step.state === 'active' ? 'step' : undefined}>
            <ProcessingStepIcon state={step.state} index={index} />
            <div className="recipe-processing-step-copy"><div className="recipe-processing-step-heading"><h2>{step.label}</h2><span>{step.statusLabel}</span></div><p>{step.detail}</p>
              <progress aria-label={step.label} max={100} value={percentage(step.progress)} />
            </div>
          </li>)}
        </ol>
        <details className="recipe-processing-details"><summary>{detailsLabel}<Icon name="ChevronDown" purpose="action" /></summary><ol>{logs.map((line, index) => <li key={`${index}-${line}`}><Icon name="Check" purpose="small" /><span>{line}</span></li>)}</ol></details>
        {scores && <section className="recipe-processing-scores" aria-label={scores.label}><h2>{scores.label}</h2><p>{scores.note}</p><div>{scores.items.map(score => <ProcessingScoreMeter key={score.id} label={score.label} value={score.value} paused={motion.paused || terminal} />)}</div></section>}
        {actions && <div className="recipe-processing-actions">{actions.map(action => <Button key={action.label} label={action.label} variant={action.primary ? 'primary' : 'secondary'} onClick={action.onClick} />)}</div>}
      </div>
      <aside className="recipe-processing-story" aria-labelledby={`${id}-story`}>
        <div className="recipe-processing-story-card">
          <div className="recipe-processing-playback"><span>{story.elapsedLabel} <span aria-hidden="true">/</span> {story.durationLabel}</span><Button label={motion.paused ? motion.resumeLabel : motion.pauseLabel} disabled={terminal} onClick={() => motion.onPausedChange(!motion.paused)} aria-describedby={`${id}-motion`} /></div>
          <div ref={art} className="recipe-processing-art" data-offscreen={!artVisible || undefined} aria-hidden="true">
            <div className="recipe-processing-sheet recipe-processing-sheet--back" />
            <div className="recipe-processing-sheet recipe-processing-sheet--front"><span className="recipe-processing-art-avatar" /><span className="recipe-processing-art-line recipe-processing-art-line--name" /><span className="recipe-processing-art-line" /><span className="recipe-processing-art-block"><span /><span /><span /></span><span className="recipe-processing-art-block"><span /><span /><span /></span><span className="recipe-processing-scan" /></div>
            <span className="recipe-processing-art-badge"><Icon name={state === 'success' ? 'Check' : state === 'error' ? 'AlertCircle' : 'ScanText'} purpose="feature" /></span>
          </div>
          <div className="recipe-processing-story-copy"><span>{story.speaker}</span><h2 id={`${id}-story`}>{story.title}</h2><p>{story.caption}</p></div>
          <p id={`${id}-motion`} className="recipe-processing-motion-note">{motion.description}</p>
        </div>
        <details className="recipe-processing-transcript"><summary>{story.transcriptLabel}<Icon name="ChevronDown" purpose="action" /></summary><ol>{story.chapters.map(chapter => <li key={chapter.id} aria-current={chapter.current ? 'true' : undefined}><span>{chapter.time}</span><div><h3>{chapter.title}</h3><p>{chapter.body}</p></div></li>)}</ol></details>
      </aside>
    </div>
    <p className="recipe-processing-announcement" role="status" aria-live="polite" aria-atomic="true">{state === 'error' ? '' : announcement}</p>
    <p className="recipe-processing-announcement" role="alert" aria-atomic="true">{state === 'error' ? announcement : ''}</p>
  </section>;
}
