import './summary.css';
import { motion, useAnimationControls } from 'motion/react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Icon, LinkButton, TextLink, type IconName } from './foundation';
import { EASE_OUT } from './lib/ease';
import { useReducedMotionPreference } from './lib/hooks/use-reduced-motion';

export type SummaryLink = { label: string; href?: string; onClick?: () => void };

function QuietLink({ link }: { link: SummaryLink }) {
  if (link.href) return <TextLink href={link.href} purpose="nav">{link.label}</TextLink>;
  return <LinkButton label={link.label} onClick={link.onClick ?? (() => {})} purpose="nav" />;
}

export type ChangeSummaryGroup = {
  id: string;
  title: string;
  helper?: string;
  /** e.g. "see them in the document". */
  action?: SummaryLink;
  items: string[];
};

export type ChangeSummaryProps = {
  title: string;
  groups: ChangeSummaryGroup[];
  /** Plain sentences after the groups, e.g. "Rewritten: summary and two entries." */
  lines?: string[];
  /** A closing note with an optional quiet link, e.g. what is still missing. */
  footer?: { text: string; action?: SummaryLink };
};

/**
 * What changed in this version: groups of neutral outline chips, plain lines and a closing note, split by
 * hairlines. Presence is not a win, so nothing here takes the brand color. Renders nothing when empty.
 */
export function ChangeSummary({ title, groups, lines = [], footer }: ChangeSummaryProps) {
  const id = useId();
  const filled = groups.filter(group => group.items.length > 0);
  if (!filled.length && !lines.length && !footer) return null;
  return <section className="es-change-summary" aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`}>{title}</h2>
    <div className="es-summary-card es-change-summary-card">
      {filled.map(group => <div key={group.id} className="es-change-summary-group">
        <div className="es-change-summary-head"><h3 id={`${id}-${group.id}`}>{group.title}</h3>{group.action && <QuietLink link={group.action} />}</div>
        {group.helper && <p className="es-change-summary-helper">{group.helper}</p>}
        <ul className="es-change-summary-chips" aria-labelledby={`${id}-${group.id}`}>{group.items.map(item => <li key={item}>{item}</li>)}</ul>
      </div>)}
      {lines.map(line => <p key={line} className="es-change-summary-line">{line}</p>)}
      {footer && <div className="es-change-summary-footer"><p>{footer.text}</p>{footer.action && <QuietLink link={footer.action} />}</div>}
    </div>
  </section>;
}

export type SelectionRow = { id: string; title: string; meta?: string; reason?: string };

export type SelectionNoteProps = {
  title: string;
  /** One sentence for the whole selection, e.g. "Uses 4 of your 6 entries." */
  summary?: string;
  groups: { id: string; title: string; rows: SelectionRow[] }[];
  /** A closing reassurance line with a small leading icon. */
  footer?: { text: string; icon?: IconName };
};

/**
 * Which of the person's own items went into a generated version and which were left out or shortened, each
 * with a quiet reason tag. Rows read as the person wrote them; no accent color.
 */
export function SelectionNote({ title, summary, groups, footer }: SelectionNoteProps) {
  const id = useId();
  return <section className="es-selection-note" aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`}>{title}</h2>
    <div className="es-summary-card es-selection-note-card">
      {summary && <p className="es-selection-note-summary">{summary}</p>}
      {groups.filter(group => group.rows.length > 0).map(group => <div key={group.id} className="es-selection-note-group">
        <h3 id={`${id}-${group.id}`}>{group.title}</h3>
        <ul aria-labelledby={`${id}-${group.id}`}>{group.rows.map(row => <li key={row.id} className="es-selection-note-row">
          <p className="es-selection-note-title">{row.title}</p>
          {row.meta && <p className="es-selection-note-meta">{row.meta}</p>}
          {row.reason && <span className="es-selection-note-reason">{row.reason}</span>}
        </li>)}</ul>
      </div>)}
      {footer && <p className="es-selection-note-footer"><Icon name={footer.icon ?? 'UserRound'} purpose="small" /><span>{footer.text}</span></p>}
    </div>
  </section>;
}

export type NextStepCardProps = {
  title: string;
  /** A short brand-ink line that keeps momentum after a real win. */
  momentum?: string;
  description?: string;
  /** Status lines, a field or a select between the text and the actions. */
  children?: ReactNode;
  /** Buttons, stacked full width; put the action you recommend first. */
  actions: ReactNode;
  /** Cost or source under the actions. */
  note?: string;
  /** Draws attention once the page's main task is done (brand hairline, soft ring, a small nudge). */
  emphasis?: boolean;
  tone?: 'default' | 'error';
};

/**
 * The one next step of a result: title, a line or two, then the actions stacked full width with an
 * optional note under them. When the honest advice is the free path, make it the first (primary) action
 * and the paid one secondary.
 */
export function NextStepCard({ title, momentum, description, children, actions, note, emphasis = false, tone = 'default' }: NextStepCardProps) {
  const id = useId();
  const reduce = useReducedMotionPreference();
  const controls = useAnimationControls();
  const was = useRef(emphasis);
  useEffect(() => {
    if (emphasis && !was.current && !reduce) void controls.start({ y: [0, -4, 0], transition: { duration: .6, times: [0, .35, 1], ease: EASE_OUT } });
    was.current = emphasis;
  }, [emphasis, reduce, controls]);
  return <motion.section className="es-next-step" data-emphasis={emphasis || undefined} data-tone={tone === 'error' ? 'error' : undefined} aria-labelledby={`${id}-title`} animate={controls}>
    <div className="es-next-step-text">
      <h2 id={`${id}-title`}>{title}</h2>
      {momentum && <p className="es-next-step-momentum">{momentum}</p>}
      {description && <p>{description}</p>}
    </div>
    {children}
    <div className="es-next-step-actions">{actions}</div>
    {note && <p className="es-next-step-note">{note}</p>}
  </motion.section>;
}
