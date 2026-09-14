import { createContext, useContext, useEffect, useId, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { Icon, Text } from './foundation';
import { HelpLabel } from './overlays';
import './layout.css';

type IconName = ComponentProps<typeof Icon>['name'];
type NavigationAction = { href: string; onClick?: never } | { href?: never; onClick: () => void };
type ShellContextValue = { collapsed: boolean; onCollapsedChange: (collapsed: boolean) => void; mobile: boolean; mobileOpen: boolean; onMobileOpenChange: (open: boolean) => void };
const ShellContext = createContext<ShellContextValue | null>(null);

function trapTab(event: React.KeyboardEvent<HTMLElement>) {
  if (event.key !== 'Tab') return;
  const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')].filter(control => control.getClientRects().length > 0);
  const first = controls[0];
  const last = controls.at(-1);
  if (!first) { event.preventDefault(); return; }
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

export function AppShell({ sidebar, header, children, collapsed, onCollapsedChange, mobileOpen, onMobileOpenChange, contentWidth = 'home', navigationLabel = 'Navigation' }: {
  sidebar: ReactNode; header?: ReactNode; children: ReactNode; collapsed: boolean; onCollapsedChange: (collapsed: boolean) => void; mobileOpen: boolean; onMobileOpenChange: (open: boolean) => void; contentWidth?: 'chat' | 'home' | 'dashboard' | 'full'; navigationLabel?: string;
}) {
  const [mobile, setMobile] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const openRef = useRef<HTMLButtonElement>(null);
  const returnFocusTarget = useRef<HTMLElement | null>(null);
  const returnFocusFrame = useRef<number | null>(null);
  const sidebarId = useId();
  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!mobile || !mobileOpen) return;
    if (returnFocusFrame.current !== null) {
      window.cancelAnimationFrame(returnFocusFrame.current);
      returnFocusFrame.current = null;
    }
    const previous = returnFocusTarget.current ?? (document.activeElement instanceof HTMLElement ? document.activeElement : openRef.current);
    sidebarRef.current?.querySelector<HTMLElement>('button:not(:disabled),a[href]')?.focus();
    return () => {
      // React removes inert from the consuming main region on this close. Focus
      // only after that commit, otherwise browsers can reject the restoration.
      returnFocusFrame.current = window.requestAnimationFrame(() => {
        const target = returnFocusTarget.current ?? previous;
        if (target?.isConnected) target.focus({ preventScroll: true });
        returnFocusTarget.current = null;
        returnFocusFrame.current = null;
      });
    };
  }, [mobile, mobileOpen]);
  const drawerOpen = mobile && mobileOpen;

  return <ShellContext.Provider value={{ collapsed, onCollapsedChange, mobile, mobileOpen, onMobileOpenChange }}>
    <div className={`es-app-shell${collapsed ? ' es-app-shell--collapsed' : ''}${drawerOpen ? ' es-app-shell--drawer-open' : ''}`}>
      {drawerOpen && <button className="es-sidebar-backdrop" aria-label={`Close ${navigationLabel.toLowerCase()}`} tabIndex={-1} onClick={() => onMobileOpenChange(false)} />}
      <aside id={sidebarId} ref={sidebarRef} className="es-sidebar" aria-label={navigationLabel} role={drawerOpen ? 'dialog' : undefined} aria-modal={drawerOpen || undefined} onKeyDown={event => {
        if (!drawerOpen) return;
        if (event.key === 'Escape') { event.stopPropagation(); onMobileOpenChange(false); }
        trapTab(event);
      }}>{sidebar}</aside>
      <main className="es-app-main" inert={drawerOpen}>
        <div className="es-mobile-bar"><button ref={openRef} type="button" aria-controls={sidebarId} aria-expanded={drawerOpen} onClick={() => { returnFocusTarget.current = openRef.current; onMobileOpenChange(true); }}><Icon name="PanelLeftOpen" purpose="action" /><span>{navigationLabel}</span></button></div>
        {header}
        <div className="es-page-outer"><div className={`es-page es-page--${contentWidth}`}>{children}</div></div>
      </main>
    </div>
  </ShellContext.Provider>;
}

export function SidebarHeader({ children, search }: { children: ReactNode; search?: { label: string; onClick: () => void } }) {
  const shell = useContext(ShellContext);
  return <div className="es-sidebar-header">
    <div className="es-sidebar-identity">{children}</div>
    <div className="es-sidebar-header-actions">
      {search && <button type="button" className="es-header-action es-header-search" aria-label={search.label} onClick={search.onClick}><Icon name="Search" purpose="action" /></button>}
      {shell && <button type="button" className="es-header-action" aria-label={shell.mobile ? 'Close navigation' : shell.collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={() => shell.mobile ? shell.onMobileOpenChange(false) : shell.onCollapsedChange(!shell.collapsed)}><Icon name={shell.mobile ? 'X' : shell.collapsed ? 'PanelLeftOpen' : 'PanelLeftClose'} purpose="action" /></button>}
    </div>
  </div>;
}

export function WorkspaceTrigger({ name, mark, onClick, expanded = false }: { name: string; mark?: ReactNode; onClick: () => void; expanded?: boolean }) {
  return <button type="button" className="es-workspace-trigger" aria-label={`${name} workspace menu`} aria-haspopup="dialog" aria-expanded={expanded} onClick={onClick} title={name}>
    {mark && <span className="es-workspace-mark">{mark}</span>}<span className="es-workspace-name">{name}</span><Icon name="ChevronDown" purpose="small" />
  </button>;
}

export function SidebarSection({ label, children, purpose = 'default' }: { label?: string; children: ReactNode; purpose?: 'primary' | 'default' | 'history' }) {
  const id = useId();
  return <section className={`es-sidebar-section es-sidebar-section--${purpose}`} aria-labelledby={label ? id : undefined}>{label && <h2 id={id}>{label}</h2>}<div className="es-sidebar-items">{children}</div></section>;
}

export function NavItem({ label, icon, active = false, badge, href, onClick }: { label: string; icon: IconName; active?: boolean; badge?: string } & NavigationAction) {
  const content = <><Icon name={icon} purpose="navigation" /><span className="es-nav-label">{label}</span>{badge && <span className="es-nav-badge">{badge}</span>}</>;
  const shell = useContext(ShellContext);
  const common = { className: `es-nav-item${active ? ' es-nav-item--active' : ''}`, title: shell?.collapsed ? label : undefined, 'aria-label': label, 'aria-current': active ? 'page' as const : undefined };
  if (href !== undefined) return <a {...common} href={href}>{content}</a>;
  return <button {...common} type="button" onClick={onClick}>{content}</button>;
}

export function SidebarFooter({ children }: { children: ReactNode }) { return <div className="es-sidebar-footer">{children}</div>; }

export function ContentHeader({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  return <header className="es-content-header"><div className="es-content-header-main">{children}</div>{actions && <div className="es-content-header-actions">{actions}</div>}</header>;
}

export function PageContentHeader({ title, description, leading, actions }: { title: string; description?: string; leading?: ReactNode; actions?: ReactNode }) {
  return <header className="es-page-content-header"><div className="es-page-heading">{leading && <span className="es-page-leading">{leading}</span>}<div><h1>{title}</h1>{description && <p>{description}</p>}</div></div>{actions && <div className="es-page-actions">{actions}</div>}</header>;
}

export function Breadcrumbs({ label = 'Breadcrumb', items }: { label?: string; items: { id: string; label: string; href?: string }[] }) {
  return <nav className="es-breadcrumbs" aria-label={label}><ol>{items.map((item, index) => <li key={item.id}>{index > 0 && <span className="es-breadcrumb-separator" aria-hidden="true">/</span>}{item.href && index < items.length - 1 ? <a href={item.href}>{item.label}</a> : <span aria-current={index === items.length - 1 ? 'page' : undefined}>{item.label}</span>}</li>)}</ol></nav>;
}

export function PageHeader({ title, description, leading, actions, purpose = 'default' }: { title: string; description?: string; leading?: ReactNode; actions?: ReactNode; purpose?: 'default' | 'home' }) {
  return <header className={`es-page-header es-page-header--${purpose}`}><div className="es-page-heading">{leading && <span className="es-page-leading">{leading}</span>}<div><h1>{title}</h1>{description && <p>{description}</p>}</div></div>{actions && <div className="es-page-actions">{actions}</div>}</header>;
}

export function SectionHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return <header className="es-section-header"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{actions && <div className="es-section-actions">{actions}</div>}</header>;
}

export function Stack({ children, gap = 'default' }: { children: ReactNode; gap?: 'tight' | 'default' | 'section' }) { return <div className={`es-stack es-stack--${gap}`}>{children}</div>; }
export function Inline({ children, gap = 'default', align = 'center' }: { children: ReactNode; gap?: 'tight' | 'default'; align?: 'start' | 'center' | 'between' }) { return <div className={`es-inline es-inline--${gap} es-inline--${align}`}>{children}</div>; }
/** Fixed two-column content relationship that stacks at the shared mobile breakpoint. */
export function ResponsiveGrid({ children }: { children: ReactNode }) { return <div className="es-responsive-grid">{children}</div>; }
export function Divider() { return <hr className="es-divider" />; }
export function Surface({ children, role = 'panel' }: { children: ReactNode; role?: 'panel' | 'subtle' | 'raised' }) { return <div className={`es-surface es-surface--${role}`}>{children}</div>; }

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
