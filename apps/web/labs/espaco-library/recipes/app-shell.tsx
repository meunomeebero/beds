import { useEffect, useId, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Icon, Sidebar } from 'beds';
import './app-shell.css';

// Optional catalog composition. Dimensions and responsive policy are app-owned.
const APP_SHELL_MORPH = {
  type: 'spring',
  stiffness: 380,
  damping: 35,
  mass: 0.75,
} as const;

const MOBILE_QUERY = '(max-width: 767px)';
function subscribeToMobile(onChange: () => void) {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}
function getMobileSnapshot() { return window.matchMedia(MOBILE_QUERY).matches; }
function getMobileServerSnapshot(): boolean | null { return null; }

function trapTab(event: React.KeyboardEvent<HTMLElement>) {
  if (event.key !== 'Tab') return;
  const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')].filter(control => control.getClientRects().length > 0);
  const first = controls[0];
  const last = controls.at(-1);
  if (!first) { event.preventDefault(); return; }
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

export function AppShell({ sidebar, header, children, collapsed, onCollapsedChange, mobileOpen, onMobileOpenChange, contentWidth = 'home', navigationLabel = 'Navigation', closeNavigationLabel, skipToContentLabel = 'Ir para o conteúdo' }: {
  sidebar: ReactNode; header?: ReactNode; children: ReactNode; collapsed: boolean; onCollapsedChange: (collapsed: boolean) => void; mobileOpen: boolean; onMobileOpenChange: (open: boolean) => void; contentWidth?: 'chat' | 'home' | 'dashboard' | 'full'; navigationLabel?: string; closeNavigationLabel?: string; skipToContentLabel?: string;
}) {
  const mobile = useSyncExternalStore(subscribeToMobile, getMobileSnapshot, getMobileServerSnapshot);
  const sidebarRef = useRef<HTMLElement>(null);
  const openRef = useRef<HTMLButtonElement>(null);
  const returnFocusTarget = useRef<HTMLElement | null>(null);
  const returnFocusFrame = useRef<number | null>(null);
  const sidebarId = useId();
  const contentId = useId();
  const contentRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion() ?? false;
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
  const drawerOpen = mobile === true && mobileOpen;

  return <>
    <motion.div
      className={`recipe-app-shell${collapsed ? ' recipe-app-shell--collapsed' : ''}${drawerOpen ? ' recipe-app-shell--drawer-open' : ''}`}
      initial={false}
      animate={mobile === null ? undefined : { gridTemplateColumns: mobile ? 'minmax(0,1fr)' : collapsed ? '62px minmax(0,1fr)' : '264px minmax(0,1fr)' }}
      transition={reduce ? { duration: 0 } : APP_SHELL_MORPH}
    >
      <a className="recipe-skip-link" href={`#${contentId}`} inert={drawerOpen} onClick={event => { event.preventDefault(); contentRef.current?.focus(); }}>{skipToContentLabel}</a>
      {drawerOpen && <button className="recipe-sidebar-backdrop" aria-label={closeNavigationLabel ?? `Close ${navigationLabel.toLowerCase()}`} tabIndex={-1} onClick={() => onMobileOpenChange(false)} />}
      <aside id={sidebarId} ref={sidebarRef} className="recipe-sidebar-region" aria-label={navigationLabel} role={drawerOpen ? 'dialog' : undefined} aria-modal={drawerOpen || undefined} onKeyDown={event => {
        if (!drawerOpen) return;
        if (event.key === 'Escape') { event.stopPropagation(); onMobileOpenChange(false); }
        trapTab(event);
      }}>
        <Sidebar label={navigationLabel} collapsed={!mobile && collapsed} onCollapsedChange={onCollapsedChange} onDismiss={drawerOpen ? () => onMobileOpenChange(false) : undefined}>{sidebar}</Sidebar>
      </aside>
      <main id={contentId} ref={contentRef} tabIndex={-1} className="recipe-app-main" inert={drawerOpen}>
        <div className="recipe-mobile-bar"><button ref={openRef} type="button" aria-controls={sidebarId} aria-expanded={drawerOpen} onClick={() => { returnFocusTarget.current = openRef.current; onMobileOpenChange(true); }}><Icon name="PanelLeftOpen" purpose="action" /><span>{navigationLabel}</span></button></div>
        {header}
        <div className="recipe-page-outer"><div className={`recipe-page recipe-page--${contentWidth}`}>{children}</div></div>
      </main>
    </motion.div>
  </>;
}
