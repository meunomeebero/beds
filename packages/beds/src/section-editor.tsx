import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, X } from 'lucide-react';
import { Button, IconButton, TextAreaField, TextField } from './controls';
import { Chip } from './chip';
import { EASE_OUT, SPRING_LAYOUT } from './lib/ease';
import { useReducedMotionPreference } from './lib/hooks/use-reduced-motion';
import { cn } from './lib/utils';
import './section-editor.css';

/* Per-section document editor pieces (0.3.0-rc.4), ported from the reference app's side-pane editor: the pane with its
   heading and fit line, version notes, a live "preparing" line, bullet fields with a quiet ×, a chip input and entry rows
   with ↑ ↓. Cards inside the pane are `EditableSection`s (they take the pane's density); the decision footer is `EditFooter`. */

const FADE = { duration: .12 };
const REMOVE_MARK = 'es-remove-mark transition-colors duration-150 motion-reduce:transition-none';

export type EditorPaneProps = {
  /** Pane heading (h2), e.g. "Editar documento". It takes focus when a host sends the person back to the sections. */
  title: string;
  /** Id of the heading, to focus it or label the list. */
  titleId?: string;
  /** One fit line under the heading, e.g. "2 páginas, como a versão entregue." (tabular numbers). */
  meta?: string;
  /** More status under the heading, usually a `VersionNote`. */
  intro?: ReactNode;
  /** Notices, then the section cards (12px apart). */
  children: ReactNode;
};

/** The editor's side pane: heading, fit line and version status, then the section cards. Layout reads the pane's width. */
export function EditorPane({ title, titleId, meta, intro, children }: EditorPaneProps) {
  const fallback = useId();
  const id = titleId ?? fallback;
  return <div className="es-editor-pane">
    <div className="es-editor-pane__head">
      <h2 id={id} tabIndex={-1}>{title}</h2>
      {meta && <p className="es-editor-pane__meta">{meta}</p>}
      {intro}
    </div>
    <div className="es-editor-pane__list" role="group" aria-labelledby={id}>{children}</div>
  </div>;
}

export type VersionNoteProps = {
  label: string;
  /** `current`: brand dot, ink text (an edited version is in use) · `review`: brand-ink dot, quiet text (a preview to check) · `history`: neutral dot (an older version on screen). */
  tone?: 'current' | 'review' | 'history';
  /** The one way back or forward, e.g. a ghost compact "Voltar à versão entregue". */
  action?: ReactNode;
};

/** Which version is on screen, as one dotted line, with its one action at the end (wraps under on narrow panes). */
export function VersionNote({ label, tone = 'current', action }: VersionNoteProps) {
  return <div className="es-version-note" data-tone={tone}>
    <p>{label}</p>
    {action}
  </div>;
}

export type PendingLineProps = { label: string };

/** One quiet live line with a pulsing brand dot, for work that replaces a block (e.g. splitting a document into sections). */
export function PendingLine({ label }: PendingLineProps) {
  const reduce = useReducedMotionPreference();
  return <p className="es-pending-line" role="status">
    <motion.span className="es-pending-line__dot" aria-hidden="true" animate={reduce ? undefined : { opacity: [1, .3, 1] }} transition={reduce ? undefined : { duration: 1.1, ease: 'easeInOut', repeat: Infinity }} />
    {label}
  </p>;
}

export type BulletFieldsProps = {
  /** Visible group label, e.g. "Tópicos". */
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  /** Accessible name of each field, e.g. index → "Tópico 1" (the visible label is the group's). */
  itemLabel: (index: number) => string;
  /** Accessible name of each ×, e.g. index → "Remover tópico 1". */
  removeLabel: (index: number) => string;
  /** The ghost add action, e.g. "Adicionar tópico". */
  addLabel: string;
  max?: number;
  maxLength?: number;
  disabled?: boolean;
};

/** One field per line (each a bullet in the output), each with a quiet × beside it, then a ghost "add" action. */
export function BulletFields({ label, items, onChange, itemLabel, removeLabel, addLabel, max = Infinity, maxLength, disabled = false }: BulletFieldsProps) {
  const root = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const focusAt = (index: number) => requestAnimationFrame(() => root.current?.querySelectorAll<HTMLTextAreaElement>('textarea')[index]?.focus());
  return <div className="es-bullets" ref={root} role="group" aria-labelledby={labelId}>
    <p className="es-bullets__label" id={labelId}>{label}</p>
    {items.length > 0 && <ol className="es-bullets__list">
      {items.map((item, index) => <li key={index} className="es-bullets__item">
        <TextAreaField label={itemLabel(index)} value={item} disabled={disabled} spellCheck maxLength={maxLength}
          onChange={value => onChange(items.map((current, position) => position === index ? value : current))} />
        <button type="button" className={cn(REMOVE_MARK, 'es-bullets__remove')} aria-label={removeLabel(index)} disabled={disabled}
          onClick={() => { onChange(items.filter((_, position) => position !== index)); focusAt(Math.max(0, index - 1)); }}>
          <X strokeWidth={2} aria-hidden="true" focusable="false" />
        </button>
      </li>)}
    </ol>}
    {items.length < max && <Button label={addLabel} icon="Plus" variant="ghost" compact disabled={disabled} onClick={() => { onChange([...items, '']); focusAt(items.length); }} />}
  </div>;
}

export type ChipInputProps = {
  /** Accessible name of the chip list, e.g. the section title. */
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  /** Visible label of the field, e.g. "Novo item". */
  inputLabel: string;
  /** Submit action beside the field, e.g. "Adicionar". */
  addLabel: string;
  /** Shown instead of the chips while the list is empty, e.g. "Nenhum item ainda." */
  emptyLabel?: string;
  /** Field error for a repeated item, e.g. "Este item já está na lista." */
  duplicateMessage: string;
  /** Accessible name of each chip's ×. Defaults to "Remover {item}". */
  removeLabel?: (item: string) => string;
  /** Locale for the case-insensitive duplicate check. Default "pt-BR". */
  locale?: string;
  max?: number;
  maxLength?: number;
  disabled?: boolean;
};

/** Chips with a quiet ×, then one field with its add action (Enter adds too). A repeated item is refused in the field. */
export function ChipInput({ label, items, onChange, inputLabel, addLabel, emptyLabel, duplicateMessage, removeLabel, locale = 'pt-BR', max = Infinity, maxLength, disabled = false }: ChipInputProps) {
  const reduce = useReducedMotionPreference();
  const [pending, setPending] = useState('');
  const [duplicate, setDuplicate] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const full = items.length >= max;
  const fold = (text: string) => text.trim().toLocaleLowerCase(locale);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const value = pending.trim();
    if (!value || full) return;
    if (items.some(item => fold(item) === fold(value))) { setDuplicate(true); return; }
    onChange([...items, value]);
    setPending('');
  };
  const remove = (index: number) => {
    const rest = items.filter((_, position) => position !== index);
    onChange(rest);
    requestAnimationFrame(() => {
      const buttons = list.current?.querySelectorAll<HTMLButtonElement>('.es-chip-remove');
      (buttons?.[Math.min(index, rest.length - 1)] ?? input.current)?.focus();
    });
  };
  return <div className="es-chip-input">
    {items.length > 0
      ? <ul ref={list} className="es-chip-input__chips" aria-label={label}>
          <AnimatePresence initial={false}>
            {items.map((item, index) => <motion.li
              // A repeated item (possible in imported content) still gets its own key.
              key={items.indexOf(item) === index ? item : `${item}#${index}`}
              layout={!reduce}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: .92 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: .92, transition: { duration: .14 } }}
              transition={reduce ? FADE : { ...SPRING_LAYOUT, opacity: { duration: .18, ease: EASE_OUT } }}
            ><Chip label={item} onRemove={() => remove(index)} removeLabel={removeLabel?.(item)} disabled={disabled} /></motion.li>)}
          </AnimatePresence>
        </ul>
      : emptyLabel && <p className="es-chip-input__empty">{emptyLabel}</p>}
    <form className="es-chip-input__add" onSubmit={submit} noValidate>
      <TextField ref={input} label={inputLabel} value={pending} maxLength={maxLength} enterKeyHint="done" disabled={disabled || full}
        error={duplicate ? duplicateMessage : undefined}
        onChange={value => { setDuplicate(false); setPending(value); }} />
      <Button label={addLabel} type="submit" icon="Plus" disabled={disabled || full || !pending.trim()} />
    </form>
  </div>;
}

export type EntryListLabels = {
  /** The add action under the rows, e.g. "Adicionar experiência". */
  add: string;
  /** The open row's removal, e.g. "Remover experiência". Its accessible name gets ": {row}". */
  remove: string;
  /** Row title while it has none, e.g. "Experiência sem cargo". */
  untitled: string;
  /** Accessible prefix of ↑, e.g. "Mover para cima". */
  moveUp: string;
  /** Accessible prefix of ↓, e.g. "Mover para baixo". */
  moveDown: string;
};

export type EntryListProps<E> = {
  entries: E[];
  onChange: (entries: E[]) => void;
  /** A blank entry for the add action. */
  create: () => E;
  /** What a closed row reads: its title and a quiet meta line. */
  summary: (entry: E) => { title: string; meta?: string };
  /** The open row's fields (two columns from a 520px pane; a `BulletFields` spans both). */
  fields: (entry: E, update: (entry: E) => void, index: number) => ReactNode;
  labels: EntryListLabels;
  max?: number;
  disabled?: boolean;
};

/** Flat rows inside a section card, hairlines between them: each opens its fields; the open row alone carries ↑ ↓ and its removal. */
export function EntryList<E>({ entries, onChange, create, summary, fields, labels, max = Infinity, disabled = false }: EntryListProps<E>) {
  const reduce = useReducedMotionPreference();
  const rowsId = useId();
  const [openRow, setOpenRow] = useState<number | null>(entries.length === 1 ? 0 : null);
  const list = useRef<HTMLOListElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const focusRow = (index: number, selector: string) => requestAnimationFrame(() => (root.current?.querySelector<HTMLElement>(`[data-row="${index}"] ${selector}`))?.focus());
  const move = (index: number, delta: -1 | 1) => {
    const next = [...entries];
    const [entry] = next.splice(index, 1);
    next.splice(index + delta, 0, entry!);
    onChange(next);
    setOpenRow(index + delta);
    focusRow(index + delta, `[data-tool="${delta < 0 ? 'up' : 'down'}"] button, button[data-tool="${delta < 0 ? 'up' : 'down'}"]`);
  };
  const remove = (index: number) => {
    onChange(entries.filter((_, position) => position !== index));
    setOpenRow(null);
    focusRow(Math.max(0, index - 1), '.es-entry__toggle');
  };
  const add = () => {
    onChange([...entries, create()]);
    setOpenRow(entries.length);
    focusRow(entries.length, 'input, textarea');
  };
  return <div className="es-entries" ref={root}>
    {entries.length > 0 && <ol ref={list} className="es-entries__list">
      {entries.map((entry, index) => {
        const open = openRow === index;
        const { title, meta } = summary(entry);
        const name = title || labels.untitled;
        const itemName = meta ? `${name}, ${meta}` : name;
        const bodyId = `${rowsId}-${index}`;
        return <li key={index} className="es-entry" data-row={index} data-open={open || undefined}>
          <div className="es-entry__head">
            <button type="button" className="es-entry__toggle transition-colors duration-150 motion-reduce:transition-none" aria-expanded={open} aria-controls={bodyId} onClick={() => setOpenRow(open ? null : index)}>
              <span className="es-entry__text">
                <span className="es-entry__title" data-empty={!title || undefined}>{name}</span>
                {meta && <span className="es-entry__meta">{meta}</span>}
              </span>
              <motion.span className="es-entry__chevron" aria-hidden="true" animate={{ rotate: open ? 180 : 0 }} transition={reduce ? { duration: 0 } : { duration: .22, ease: EASE_OUT }}><ChevronDown strokeWidth={1.75} focusable="false" /></motion.span>
            </button>
          </div>
          <AnimatePresence initial={false}>
            {open && <motion.div key="body" id={bodyId} className="es-entry__body"
              initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
              animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={reduce ? FADE : { duration: .26, ease: EASE_OUT }}>
              <div className="es-entry__fields">{fields(entry, next => onChange(entries.map((current, position) => position === index ? next : current)), index)}</div>
              <div className="es-entry__tools">
                {entries.length > 1 && <>
                  <span data-tool="up"><IconButton label={`${labels.moveUp}: ${itemName}`} icon="ArrowUp" disabled={disabled || index === 0} onClick={() => move(index, -1)} /></span>
                  <span data-tool="down"><IconButton label={`${labels.moveDown}: ${itemName}`} icon="ArrowDown" disabled={disabled || index === entries.length - 1} onClick={() => move(index, 1)} /></span>
                </>}
                <span className="es-entry__remove"><Button label={labels.remove} accessibleLabel={`${labels.remove}: ${itemName}`} variant="destructive" compact disabled={disabled} onClick={() => remove(index)} /></span>
              </div>
            </motion.div>}
          </AnimatePresence>
        </li>;
      })}
    </ol>}
    {entries.length < max && <div className="es-entries__add"><Button label={labels.add} icon="Plus" disabled={disabled} onClick={add} /></div>}
  </div>;
}
