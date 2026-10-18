// The focal call to action. Owner decision (the reference app, 2026-09-28/29): the beUI expanding-arrow chip read as oversized,
// so the CTA is the shared pill Button in the beUI `outline` variant with a trailing arrow (the reference app `CtaButton`).
// The props stay identical so existing consumers keep compiling; `context` no longer changes geometry.
import { type ReactNode } from 'react';
import { ButtonFrame } from './controls';
import { type IconName } from './foundation';

export type ExpandingButtonProps = {
  /** Visible text. Keep it to one short verb phrase. */
  label: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  /** `ArrowRight` (default) trails the label. Other glyphs are dropped: the label carries the action. */
  icon?: IconName;
  /** Monochrome brand glyph (e.g. a sign-in provider logo) drawn with `currentColor` before the label. Decorative: always hidden from assistive tech. */
  mark?: ReactNode;
  /** @deprecated Accepted for compatibility: hero and panel calls to action share the 40px pill. */
  context?: 'default' | 'hero';
  /** Fuller accessible name. It must contain the visible label, e.g. label "Entrar", accessibleLabel "Entrar com X". */
  accessibleLabel?: string;
  disabled?: boolean;
  'aria-describedby'?: string;
};

/** The one focal action of a view: outline pill (md 40px, 44px on touch) with a trailing arrow. */
export function ExpandingButton({ label, onClick, type = 'button', icon = 'ArrowRight', mark, accessibleLabel, disabled, 'aria-describedby': describedBy }: ExpandingButtonProps) {
  return <ButtonFrame label={label} onClick={onClick} type={type} variant="outline" icon={icon === 'ArrowRight' ? 'ArrowRight' : undefined} iconPosition="end" mark={mark} accessibleLabel={accessibleLabel} disabled={disabled} aria-describedby={describedBy} />;
}
