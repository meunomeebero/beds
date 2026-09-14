import { createContext, useContext, useId, type CSSProperties, type ReactNode } from 'react';
import { Home, Activity, BarChart3, Plug, Folder, MessageSquare, Plus, Search, PanelLeftClose, PanelLeftOpen, ChevronDown, ChevronRight, Check, X, Settings2, CircleHelp, Sun, Moon, LogOut, MoreHorizontal, ArrowUp, ArrowRight, Paperclip, Command, FileText, CheckCircle2, AlertCircle, Info, Loader2, User, Sparkles, Globe, Bell, Copy, CreditCard, House, MessageCircle, ChartColumn, UserRound, Briefcase, Coins, ScanText, Bookmark, CalendarDays, ChevronsUpDown, Play, Pause, ArrowLeft } from 'lucide-react';

const icons = { Home, Activity, BarChart3, Plug, Folder, MessageSquare, Plus, Search, PanelLeftClose, PanelLeftOpen, ChevronDown, ChevronRight, Check, X, Settings2, CircleHelp, Sun, Moon, LogOut, MoreHorizontal, ArrowUp, ArrowRight, Paperclip, Command, FileText, CheckCircle2, AlertCircle, Info, Loader2, User, Sparkles, Globe, Bell, Copy, CreditCard, House, MessageCircle, ChartColumn, UserRound, Briefcase, Coins, ScanText, Bookmark, CalendarDays, ChevronsUpDown, Play, Pause, ArrowLeft };
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

export type TextVariant = 'page-title' | 'section-title' | 'chat-title' | 'body' | 'body-small' | 'label' | 'caption' | 'overline' | 'option' | 'metric';
export function Text({ children, variant = 'body-small', tone = 'default' }: {
  children: ReactNode; variant?: TextVariant; tone?: 'default' | 'secondary';
}) {
  const Tag = variant === 'page-title' ? 'h1' : variant === 'section-title' ? 'h2' : variant === 'chat-title' ? 'h2' : 'span';
  return <Tag className={`es-text es-text--${variant} es-text--${tone}`}>{children}</Tag>;
}

export function Avatar({ name, src, purpose = 'account' }: { name: string; src?: string; purpose?: 'account' | 'workspace' }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase();
  return <span className={`es-avatar es-avatar--${purpose}`} role="img" aria-label={name}>{src ? <img src={src} alt="" /> : initials || '?'}</span>;
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
