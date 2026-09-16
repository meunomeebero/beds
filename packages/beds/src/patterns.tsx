import { useId, useRef, type ComponentProps, type KeyboardEvent, type ReactNode } from 'react';
import { Icon } from './foundation';
import { Button, SegmentedControl } from './controls';
import { SegmentedMeter } from './feedback';
import { useAnchoredPopup } from './overlays';
import './patterns.css';

type IconName = ComponentProps<typeof Icon>['name'];
type NavigationAction = { href: string; onClick?: never } | { href?: never; onClick: () => void };

/** Native submit/Enter boundary. Validation, pending state and persistence stay with the caller. */
export function SettingsForm({ label, children, onSubmit }: { label: string; children: ReactNode; onSubmit: () => void }) {
  return <form className="es-stack es-stack--default" aria-label={label} noValidate onSubmit={event => { event.preventDefault(); onSubmit(); }}>{children}</form>;
}

export function SettingsRow({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <div className="es-settings-row"><div className="es-settings-label"><h3>{title}</h3>{description && <p>{description}</p>}</div><div className="es-settings-control">{children}</div></div>;
}

export function SettingsGroup({ title, description, children, variant = 'panel' }: { title?: string; description?: string; children: ReactNode; variant?: 'panel' | 'section' }) {
  const id = useId();
  return <section className="es-settings-group" data-variant={variant} aria-labelledby={title ? id : undefined}>{(title || description) && <header>{title && <h2 id={id}>{title}</h2>}{description && <p>{description}</p>}</header>}<div className="es-settings-group-content">{children}</div></section>;
}

export function IntegrationRow({ name, description, mark, status, action }: { name: string; description?: string; mark: ReactNode; status?: string; action: { label: string; onClick: () => void; disabled?: boolean; busy?: boolean } }) {
  const id = useId();
  return <div className="es-integration-row" role="group" aria-labelledby={id}><span className="es-integration-mark" aria-hidden="true">{mark}</span><div className="es-integration-copy"><h3 id={id}>{name}</h3>{description && <p>{description}</p>}{status && <span className="es-integration-status">{status}</span>}</div><div className="es-integration-action"><Button label={action.label} onClick={action.onClick} disabled={action.disabled} busy={action.busy} variant="secondary" compact /></div></div>;
}

export function RecentItem({ title, description, icon = 'FileText', meta, href, onClick }: { title: string; description?: string; icon?: IconName; meta?: string } & NavigationAction) {
  const content = <><Icon name={icon} purpose="navigation" /><span className="es-recent-copy"><strong>{title}</strong>{description && <span>{description}</span>}</span>{meta && <span className="es-recent-meta">{meta}</span>}<Icon name="ChevronRight" purpose="small" /></>;
  if (href !== undefined) return <a className="es-recent-item" href={href}>{content}</a>;
  return <button type="button" className="es-recent-item" onClick={onClick}>{content}</button>;
}

export function PlanCard({ title, usage, action, note }: { title: string; usage?: { label: string; value: number | null; max: number }; action: { label: string; onClick: () => void }; note?: string }) {
  return <section className="es-plan-card" aria-label={title}><div className="es-plan-title"><Icon name="CreditCard" purpose="navigation" /><span>{title}</span></div>{usage && <SegmentedMeter label={usage.label} value={usage.value} max={usage.max} tone="success" />}{note && <p>{note}</p>}<button type="button" className="es-plan-action" onClick={action.onClick}><Icon name="Sparkles" purpose="navigation" />{action.label}</button></section>;
}

function trapAccountTab(event: KeyboardEvent<HTMLDivElement>) {
  if (event.key !== 'Tab') return;
  event.stopPropagation();
  const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled):not([tabindex="-1"]),a[href],input:not(:disabled),[tabindex="0"]')].filter(control => control.getClientRects().length > 0);
  const first = controls[0];
  const last = controls.at(-1);
  if (!first) { event.preventDefault(); return; }
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

export function AccountMenu({ open, onOpenChange, trigger, identity, actions, onAction, workspaces = [], activeWorkspace, onWorkspaceChange, theme, onThemeChange, allWorkspaces, footer, label = 'Account menu', appearanceLabel = 'Appearance', lightLabel = 'Light', darkLabel = 'Dark' }: {
  open: boolean; onOpenChange: (open: boolean) => void; trigger: ReactNode;
  identity: { name: string; description?: string; avatar?: ReactNode };
  actions: { id: string; label: string; icon: IconName; disabled?: boolean }[];
  onAction: (id: string) => void;
  /** Optional workspace switcher: single-space apps omit it entirely. */
  workspaces?: { id: string; label: string; mark?: ReactNode }[]; activeWorkspace?: string; onWorkspaceChange?: (id: string) => void;
  theme: 'light' | 'dark'; onThemeChange: (theme: 'light' | 'dark') => void;
  allWorkspaces?: { label: string; onClick: () => void }; footer?: ReactNode; label?: string; appearanceLabel?: string; lightLabel?: string; darkLabel?: string;
}) {
  const anchor = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  useAnchoredPopup({ open, anchor, panel, onOpenChange, width: 280, initialFocus: 'first-control' });

  function actionButton(action: (typeof actions)[number]) {
    return <button key={action.id} type="button" className="es-account-action" disabled={action.disabled} onClick={() => { onOpenChange(false); onAction(action.id); }}><Icon name={action.icon} purpose="navigation" /><span>{action.label}</span></button>;
  }

  const signOutAction = actions.find(action => action.icon === 'LogOut');
  const primaryActions = actions.filter(action => action !== signOutAction);
  return <div className="es-account-anchor" ref={anchor}>
    {trigger}
    <div ref={panel} id={id} className="es-account-menu" popover="manual" role="dialog" aria-label={label} onKeyDown={trapAccountTab}>
      <div className="es-account-identity"><span className="es-account-avatar" aria-hidden="true">{identity.avatar ?? identity.name.slice(0, 1)}</span><div><strong>{identity.name}</strong>{identity.description && <p>{identity.description}</p>}</div></div>
      <div className="es-account-group">
        {primaryActions.map(actionButton)}
        <div className="es-account-appearance"><span><Icon name={theme === 'light' ? 'Sun' : 'Moon'} purpose="navigation" />{appearanceLabel}</span><SegmentedControl label={appearanceLabel} value={theme} options={[{ id: 'light', label: lightLabel }, { id: 'dark', label: darkLabel }]} onChange={value => onThemeChange(value === 'light' ? 'light' : 'dark')} /></div>
        {signOutAction && actionButton(signOutAction)}
      </div>
      {(workspaces.length > 0 || allWorkspaces) && <div className="es-account-group es-account-workspaces">
        {workspaces.map(workspace => <button key={workspace.id} type="button" className="es-account-action" aria-pressed={workspace.id === activeWorkspace} onClick={() => { onOpenChange(false); onWorkspaceChange?.(workspace.id); }}><span className="es-account-workspace-mark" aria-hidden="true">{workspace.mark ?? workspace.label.slice(0, 1)}</span><span>{workspace.label}</span>{workspace.id === activeWorkspace && <Icon name="Check" purpose="navigation" />}</button>)}
        {allWorkspaces && <button type="button" className="es-account-action es-account-action--all-workspaces" onClick={() => { onOpenChange(false); allWorkspaces.onClick(); }}><Icon name="MoreHorizontal" purpose="navigation" /><span>{allWorkspaces.label}</span></button>}
      </div>}
      {footer && <div className="es-account-footer">{footer}</div>}
    </div>
  </div>;
}
