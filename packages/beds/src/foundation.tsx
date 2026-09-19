import { createContext, useContext, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { animate, useInView, useReducedMotion } from 'motion/react';
import { Inbox } from 'lucide-react';
import { Home, Activity, BarChart3, Plug, Folder, MessageSquare, Plus, Search, PanelLeftClose, PanelLeftOpen, ChevronDown, ChevronRight, Check, X, Settings2, CircleHelp, Sun, Moon, LogOut, MoreHorizontal, ArrowUp, ArrowRight, ArrowUpRight, Paperclip, Command, FileText, CheckCircle2, AlertCircle, Info, Loader2, User, Sparkles, Globe, Bell, Copy, CreditCard, House, MessageCircle, ChartColumn, UserRound, Briefcase, Coins, ScanText, Bookmark, CalendarDays, ChevronsUpDown, Play, Pause, ArrowLeft, ShieldCheck, Image, Table2 } from 'lucide-react';

const icons = { Home, Activity, BarChart3, Plug, Folder, MessageSquare, Plus, Search, PanelLeftClose, PanelLeftOpen, ChevronDown, ChevronRight, Check, X, Settings2, CircleHelp, Sun, Moon, LogOut, MoreHorizontal, ArrowUp, ArrowRight, ArrowUpRight, Paperclip, Command, FileText, CheckCircle2, AlertCircle, Info, Loader2, User, Sparkles, Globe, Bell, Copy, CreditCard, House, MessageCircle, ChartColumn, UserRound, Briefcase, Coins, ScanText, Bookmark, CalendarDays, ChevronsUpDown, Play, Pause, ArrowLeft, ShieldCheck, Inbox, Image, Table2 };
export type IconName = keyof typeof icons;
export type Theme = 'light' | 'dark';
export const brands = Object.freeze({ reference: '#d0f300', curriculol: '#ffa133' });
type SystemContext = { theme: Theme; brandColor: string; onThemeChange?: (theme: Theme) => void };
const Context = createContext<SystemContext | null>(null);

export function useDesignSystem() {
  const value = useContext(Context);
  if (!value) throw new Error('Use components inside DesignSystemProvider.');
  return value;
}

export function DesignSystemProvider({ children, theme, brandColor = brands.reference, onThemeChange }: {
  children: ReactNode; theme: Theme; brandColor?: string; onThemeChange?: (theme: Theme) => void;
}) {
  if (!/^#[0-9a-f]{6}$/i.test(brandColor)) throw new Error('brandColor must be one six-digit hex color.');
  if (theme !== 'light' && theme !== 'dark') throw new Error('theme must be light or dark.');
  // Fixed black/white foreground selected for contrast; not a second configurable color.
  const rgb = [1, 3, 5].map(index => parseInt(brandColor.slice(index, index + 2), 16) / 255)
    .map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
  const luminance = rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
  const onBrand = luminance > .179 ? '#000000' : '#ffffff';
  const style = { '--es-brand': brandColor, '--es-on-brand': onBrand } as CSSProperties;
  return <Context.Provider value={{ theme, brandColor, onThemeChange }}><div className="es-root" data-theme={theme} style={style}>{children}</div></Context.Provider>;
}

export function Icon({ name, purpose = 'navigation' }: { name: IconName; purpose?: 'navigation' | 'action' | 'small' | 'feature' }) {
  const Glyph = icons[name];
  return <Glyph className={`es-icon es-icon--${purpose}`} aria-hidden="true" focusable="false" strokeWidth={1.5} />;
}

/**
 * Adapted from beUI `number` (MIT, https://beui.dev/r/number/raw, retrieved 2026-09-16).
 * Upstream Tailwind classes, `cn` helper and easing module are dropped; motion intent and
 * in-view/reduced-motion behavior are re-expressed with BEDS easing and tokens.
 * Missing evidence stays missing: a null or non-finite value never animates toward a fabricated number.
 * Without `initialValue`, the first frame is the caller's real value and no
 * invented zero is shown. Pass `initialValue` only when it is a known prior
 * value from the same controlled source.
 */
export function AnimatedNumber({ value, format, fallback = '—', duration = 1.1, startOnView = false, initialValue }: {
  value: number | null; format: (value: number) => string; fallback?: string; duration?: number; startOnView?: boolean; initialValue?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: .6 });
  const prefersReducedMotion = useReducedMotion();
  const animationStart = value !== null && Number.isFinite(value)
    ? typeof initialValue === 'number' && Number.isFinite(initialValue) ? initialValue : value
    : null;
  const [frame, setFrame] = useState<number | null>(animationStart);
  const unavailable = value === null || !Number.isFinite(value);
  const waitingForView = startOnView && !inView;

  useEffect(() => {
    if (unavailable || waitingForView) return;

    if (prefersReducedMotion) {
      setFrame(value);
      return;
    }

    if (animationStart === value || animationStart === null || animationStart === undefined) {
      setFrame(value);
      return;
    }

    const snapToInteger = Number.isInteger(value);
    const controls = animate(animationStart, value, {
      duration,
      ease: [.16, 1, .3, 1],
      onUpdate: current => setFrame(snapToInteger ? Math.round(current) : current),
    });
    return () => controls.stop();
  }, [animationStart, unavailable, waitingForView, prefersReducedMotion, value, duration]);

  if (unavailable) return <span className="es-animated-number">{fallback}</span>;

  // Synchronously fall back to the current true value when a previously unavailable
  // value becomes ready before the passive effect can settle the frame.
  const renderedFrame = prefersReducedMotion
    ? value
    : animationStart !== null && animationStart !== value
    ? frame ?? animationStart
    : value;
  // Single text node: the last frame equals the true value, so no duplicated or doubly announced number.
  return <span ref={ref} className="es-animated-number">{format(renderedFrame)}</span>;
}

export type TextVariant = 'page-title' | 'section-title' | 'chat-title' | 'body' | 'body-small' | 'label' | 'caption' | 'overline' | 'option' | 'metric';
export function Text({ children, variant = 'body-small', tone = 'default' }: {
  children: ReactNode; variant?: TextVariant; tone?: 'default' | 'secondary';
}) {
  const Tag = variant === 'page-title' ? 'h1' : variant === 'section-title' ? 'h2' : variant === 'chat-title' ? 'h2' : 'span';
  return <Tag className={`es-text es-text--${variant} es-text--${tone}`}>{children}</Tag>;
}

/**
 * Identity image with a deterministic account-linked fallback. A broken or
 * changed image URL falls back to the initials once per URL; the fallback is
 * never a retry loop and never a network-generated identity.
 */
export function Avatar({ name, src, purpose = 'account' }: { name: string; src?: string; purpose?: 'account' | 'workspace' | 'profile' | 'forum' }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase();
  // Error state is keyed to the exact failed URL: a new src retries once,
  // a failed URL never re-requests during the same mount.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = src !== undefined && src !== failedSrc;
  return <span className={`es-avatar es-avatar--${purpose}`} role="img" aria-label={name}>{showImage
    ? <img src={src} alt="" onError={() => setFailedSrc(src)} />
    : initials || '?'}</span>;
}

/** Text-level link with the shared hover/focus contract. External links open a new context safely. */
export function TextLink({ href, children, external = false, ariaLabel }: { href: string; children: ReactNode; external?: boolean; ariaLabel?: string }) {
  return <a className="es-text-link" href={href} aria-label={ariaLabel} {...external ? { target: '_blank', rel: 'noopener noreferrer' } : {}}>
    {children}{external && <Icon name="ArrowUpRight" purpose="small" />}
  </a>;
}

/** User-owned three-bar identity, independent from reference-company artwork. */
export function BrandMark({ label = 'Brand' }: { label?: string }) {
  const id = useId();
  return <svg className="es-brand-mark" viewBox="0 0 18 18" role="img" aria-labelledby={id}><title id={id}>{label}</title><rect width="18" height="4" rx="2" /><rect y="7" width="18" height="4" rx="2" /><rect y="14" width="18" height="4" rx="2" /></svg>;
}

export function ThemeToggle({ label = 'Appearance', lightLabel = 'Light', darkLabel = 'Dark' }: { label?: string; lightLabel?: string; darkLabel?: string }) {
  const { theme, onThemeChange } = useDesignSystem();
  return <div className="es-theme-toggle" role="group" aria-label={label}>{(['light', 'dark'] as const).map(value =>
    <button key={value} type="button" aria-pressed={theme === value} disabled={!onThemeChange} onClick={() => onThemeChange?.(value)}>{value === 'light' ? lightLabel : darkLabel}</button>
  )}</div>;
}
