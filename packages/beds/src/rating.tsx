import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { Button } from './controls';
import { useReducedMotionPreference } from './lib/hooks/use-reduced-motion';
import './rating.css';

export type RatingStripProps = {
  /** Name of the whole strip, e.g. "Avaliação e feedback". */
  label: string;
  /** The question, e.g. "Como ficou o documento?". */
  legend: string;
  /** Accessible name of each star, e.g. 4 → "4 estrelas". */
  starLabel: (value: number) => string;
  /** Records the selected rating, e.g. "Enviar avaliação". A star only selects; a receipt cannot be corrected afterwards. */
  submitLabel: string;
  /** Submit label while sending, e.g. "Enviando…". */
  pendingLabel: string;
  onSubmit: (rating: number) => void;
  pending?: boolean;
  /** Why rating is not possible right now: the stars stay visible but locked, with this note under them. */
  disabledReason?: string;
  /** The recorded rating; replaces the form and takes focus once when it arrives. */
  receipt?: { rating: number } | null;
  /** First line of the receipt, e.g. "Avaliação enviada." */
  receiptLabel: string;
  /** Quiet score after it, e.g. 4 → "Nota 4 de 5." */
  scoreLabel: (rating: number) => string;
  /** Ratings at or below this ask what to do next. Default 3. */
  lowThreshold?: number;
  /** Low-score follow-up line, e.g. "Você pode revisar as seções ou enviar feedback." */
  lowNote?: string;
  /** Low-score follow-up action, e.g. a ghost compact "Revisar seções". */
  lowAction?: ReactNode;
  /** The one outlined feedback action at the end, always available (e.g. `Button variant="outline" compact`). */
  trailing?: ReactNode;
  /** Number of stars. Default 5. */
  max?: number;
};

/** A private rating of what is on screen plus one feedback action: one row, two short rows on narrow frames. */
export function RatingStrip({ label, legend, starLabel, submitLabel, pendingLabel, onSubmit, pending = false, disabledReason, receipt = null, receiptLabel, scoreLabel, lowThreshold = 3, lowNote, lowAction, trailing, max = 5 }: RatingStripProps) {
  const id = useId();
  const reduce = useReducedMotionPreference();
  const [rating, setRating] = useState<number | null>(null);
  const receiptLine = useRef<HTMLParagraphElement>(null);
  const hadReceipt = useRef(receipt !== null);
  // The answer replaces the form where focus was: move focus to it once, when it arrives during this visit.
  useEffect(() => {
    if (receipt && !hadReceipt.current) receiptLine.current?.focus();
    hadReceipt.current = receipt !== null;
  }, [receipt]);
  const locked = Boolean(disabledReason) || pending;
  const noteId = `${id}-note`;
  const low = receipt !== null && receipt.rating <= lowThreshold;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!locked && rating !== null) onSubmit(rating);
  };
  return <div className="es-rating-frame">
    <div className="es-rating" role="group" aria-label={label}>
      {receipt
        ? <div className="es-rating__done">
            <p ref={receiptLine} tabIndex={-1} role="status">{receiptLabel}<span className="es-rating__score"> {scoreLabel(receipt.rating)}</span></p>
            {low && lowNote && <p className="es-rating__note">{lowNote}</p>}
            {low && lowAction}
          </div>
        : <form className="es-rating__form" onSubmit={submit} noValidate>
            <fieldset disabled={locked} aria-describedby={disabledReason ? noteId : undefined}>
              <legend>{legend}</legend>
              <div className="es-rating__stars">
                {Array.from({ length: max }, (_, index) => index + 1).map(value => <motion.label key={value} className="es-rating__star transition-colors duration-150 motion-reduce:transition-none" data-filled={rating !== null && value <= rating || undefined}
                  whileTap={reduce || locked ? undefined : { scale: .92 }} transition={{ duration: .16, ease: [.23, 1, .32, 1] }}>
                  <input type="radio" name={id} value={value} checked={rating === value} aria-label={starLabel(value)} onChange={() => setRating(value)} />
                  <Star aria-hidden="true" focusable="false" />
                </motion.label>)}
              </div>
            </fieldset>
            <Button type="submit" label={pending ? pendingLabel : submitLabel} variant="secondary" compact busy={pending} disabled={locked || rating === null} />
            {disabledReason && <p id={noteId} className="es-rating__note">{disabledReason}</p>}
          </form>}
      {trailing && <div className="es-rating__trailing">{trailing}</div>}
    </div>
  </div>;
}
