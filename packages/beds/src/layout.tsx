import { createContext, useContext, useId, type ComponentProps, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Icon, Text } from './foundation';
import { HelpLabel } from './overlays';
import { SPRING_LAYOUT } from './lib/ease';
import './layout.css';

type IconName = ComponentProps<typeof Icon>['name'];
type NavigationAction = { href: string; onClick?: never } | { href?: never; onClick: () => void };
type LockedNavigation = { href?: never; onClick?: never };
type SidebarContextValue = { collapsed: boolean; onCollapsedChange?: (collapsed: boolean) => void; onDismiss?: () => void };
const SidebarContext = createContext<SidebarContextValue | null>(null);
const NavMotionContext = createContext<string | null>(null);

/** Navigation surface only; the host owns its width, placement and mobile overlay. */
export function Sidebar({ children, label, collapsed = false, onCollapsedChange, onDismiss }: {
  children: ReactNode; label: string; collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Optional close action when the host presents navigation in an overlay. */
  onDismiss?: () => void;
}) {
  const id = useId();
  return <SidebarContext.Provider value={{ collapsed, onCollapsedChange, onDismiss }}>
    <NavMotionContext.Provider value={id}>
      <nav className="es-sidebar" aria-label={label} data-collapsed={collapsed || undefined}>{children}</nav>
    </NavMotionContext.Provider>
  </SidebarContext.Provider>;
}

export function SidebarHeader({ children, search, closeLabel, expandLabel, collapseLabel }: { children: ReactNode; search?: { label: string; onClick: () => void }; closeLabel?: string; expandLabel?: string; collapseLabel?: string }) {
  const shell = useContext(SidebarContext);
  return <div className="es-sidebar-header">
    <div className="es-sidebar-identity">{children}</div>
    <div className="es-sidebar-header-actions">
      {search && <button type="button" className="es-header-action es-header-search" aria-label={search.label} onClick={search.onClick}><Icon name="Search" purpose="action" /></button>}
      {(shell?.onDismiss || shell?.onCollapsedChange) && <button type="button" className="es-header-action" aria-label={shell.onDismiss ? closeLabel ?? 'Close navigation' : shell.collapsed ? expandLabel ?? 'Expand sidebar' : collapseLabel ?? 'Collapse sidebar'} onClick={() => shell.onDismiss ? shell.onDismiss() : shell.onCollapsedChange?.(!shell.collapsed)}><Icon name={shell.onDismiss ? 'X' : shell.collapsed ? 'PanelLeftOpen' : 'PanelLeftClose'} purpose="action" /></button>}
    </div>
  </div>;
}

export function WorkspaceTrigger({ name, mark, onClick, expanded = false, menuLabel }: { name: string; mark?: ReactNode; onClick: () => void; expanded?: boolean; menuLabel?: string }) {
  return <button type="button" className="es-workspace-trigger" aria-label={menuLabel ?? `${name} workspace menu`} aria-haspopup="dialog" aria-expanded={expanded} onClick={onClick} title={name}>
    {mark && <span className="es-workspace-mark">{mark}</span>}<span className="es-workspace-name">{name}</span><Icon name="ChevronDown" purpose="small" />
  </button>;
}

export function SidebarSection({ label, children, purpose = 'default' }: { label?: string; children: ReactNode; purpose?: 'primary' | 'default' | 'history' }) {
  const id = useId();
  return <NavMotionContext.Provider value={id}><section className={`es-sidebar-section es-sidebar-section--${purpose}`} aria-labelledby={label ? id : undefined}>{label && <h2 id={id}>{label}</h2>}<div className="es-sidebar-items">{children}</div></section></NavMotionContext.Provider>;
}

/**
 * One navigation destination. `locked` carries the truthful reason the row
 * cannot be used: the row stays visible and non-interactive (never a no-op
 * handler), keeps its accessible name and exposes the reason to pointer
 * (title) and assistive technology (label).
 */
export function NavItem({ label, icon, active = false, badge, locked, href, onClick }: { label: string; icon: IconName; active?: boolean; badge?: string; locked?: string } & (NavigationAction | LockedNavigation)) {
  const reduce = useReducedMotion() ?? false;
  const itemId = useId();
  const navMotionId = useContext(NavMotionContext) ?? itemId;
  const content = <span className="es-nav-content"><Icon name={icon} purpose="navigation" /><span className="es-nav-label">{label}</span>{badge && <span className="es-nav-badge">{badge}</span>}</span>;
  const activeIndicator = locked ? null : active
    ? <motion.span layoutId={`${navMotionId}-active`} initial={false} transition={reduce ? { duration: 0 } : SPRING_LAYOUT} className="es-nav-active-indicator" aria-hidden="true" />
    : <span className="es-nav-active-indicator" aria-hidden="true" />;
  const common = { className: `es-nav-item${active ? ' es-nav-item--active' : ''}${locked ? ' es-nav-item--locked' : ''}`, title: locked ?? label, 'aria-label': locked ? `${label}. ${locked}` : label, 'aria-current': active ? 'page' as const : undefined };
  if (locked) return <button {...common} type="button" disabled title={common.title}>{content}</button>;
  if (href !== undefined) return <a {...common} href={href}>{activeIndicator}{content}</a>;
  return <button {...common} type="button" onClick={onClick}>{activeIndicator}{content}</button>;
}

export function SidebarFooter({ children }: { children: ReactNode }) { const id = useId(); return <NavMotionContext.Provider value={id}><footer className="es-sidebar-footer">{children}</footer></NavMotionContext.Provider>; }

export function ContentHeader({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  return <header className="es-content-header"><div className="es-content-header-main">{children}</div>{actions && <div className="es-content-header-actions">{actions}</div>}</header>;
}

export function Breadcrumbs({ label = 'Breadcrumb', items }: { label?: string; items: { id: string; label: string; href?: string }[] }) {
  return <nav className="es-breadcrumbs" aria-label={label}><ol>{items.map((item, index) => <li key={item.id}>{index > 0 && <span className="es-breadcrumb-separator" aria-hidden="true">/</span>}{item.href && index < items.length - 1 ? <a href={item.href}>{item.label}</a> : <span aria-current={index === items.length - 1 ? 'page' : undefined}>{item.label}</span>}</li>)}</ol></nav>;
}

export function PageHeader({ title, description, leading, actions }: { title: string; description?: string; leading?: ReactNode; actions?: ReactNode }) {
  return <header className="es-page-header"><div className="es-page-heading">{leading && <span className="es-page-leading">{leading}</span>}<div><h1>{title}</h1>{description && <p>{description}</p>}</div></div>{actions && <div className="es-page-actions">{actions}</div>}</header>;
}

export function SectionHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return <header className="es-section-header"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{actions && <div className="es-section-actions">{actions}</div>}</header>;
}

export function Stack({ children, gap = 'default' }: { children: ReactNode; gap?: 'tight' | 'default' | 'section' }) { return <div className={`es-stack es-stack--${gap}`}>{children}</div>; }
export function Inline({ children, gap = 'default', align = 'center' }: { children: ReactNode; gap?: 'tight' | 'default'; align?: 'start' | 'center' | 'between' }) { return <div className={`es-inline es-inline--${gap} es-inline--${align}`}>{children}</div>; }
/** Fixed two-column content relationship that stacks at the shared mobile breakpoint. */
export function ResponsiveGrid({ children }: { children: ReactNode }) { return <div className="es-responsive-grid">{children}</div>; }
export function Divider() { return <hr className="es-divider" />; }
export type SurfaceProps = {
  children: ReactNode;
  role?: 'panel' | 'subtle' | 'raised';
  /** Stable DOM target for a host-owned deep link or labelled relationship. */
  id?: string;
  /** Allows host-owned programmatic focus without adding the panel to tab order. */
  focusTarget?: boolean;
};

/**
 * Fixed visual panel. `focusTarget` is deliberately narrow: it supports focus
 * restoration and deep links, but never creates a keyboard tab stop or owns
 * scroll, selection, route, or request behavior.
 */
export function Surface({ children, role = 'panel', id, focusTarget = false }: SurfaceProps) {
  return <div id={id} tabIndex={focusTarget ? -1 : undefined} className={`es-surface es-surface--${role}`}>{children}</div>;
}

/** Fixed anatomy for a compact horizontal collection card. Consumer supplies only factual content and controls. */
export function CollectionCard({ avatar, identity, selection, title, metadata, actions }: {
  avatar: ReactNode; identity: string; selection?: ReactNode; title: string; metadata: ReactNode; actions: ReactNode;
}) {
  return <Surface role="panel"><article className="es-collection-card">
    <header className="es-collection-card-header"><div className="es-collection-card-identity">{avatar}<span>{identity}</span></div>{selection && <div className="es-collection-card-selection">{selection}</div>}</header>
    <div className="es-collection-card-body"><Text variant="section-title">{title}</Text><div className="es-collection-card-metadata">{metadata}</div></div>
    <footer className="es-collection-card-actions">{actions}</footer>
  </article></Surface>;
}

/** Bounded activity container: title, icon and body share the same semantic panel. */
export function ActivityPanel({ title, icon, description, children, purpose = 'default' }: { title: string; icon: IconName; description?: string; children: ReactNode; purpose?: 'default' | 'history' }) {
  const id = useId();
  return <Surface role="panel"><section className="es-activity-panel" aria-labelledby={id}>
    <header className="es-activity-panel-header"><h2 id={id}>{description ? <HelpLabel label={title} description={description} icon={icon} /> : <><Icon name={icon} purpose="action" />{title}</>}</h2></header>
    {purpose === 'default' && <Divider />}
    <div className="es-activity-panel-body">{children}</div>
  </section></Surface>;
}
