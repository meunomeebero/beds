/** Optional app-owned recipe; not a BEDS export. See docs/design/espaco-library/AGNOSTIC-DS.md. */
import { useId, type ReactNode } from 'react';
import { Icon } from 'beds';
import './landing-footer.css';

export type LandingFooterLink = { id: string; label: string; href: string };
export type LandingFooterGroup = { id: string; label: string; links: readonly LandingFooterLink[] };
export type LandingFooterProps = {
  brandName: string;
  brandMark?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  groups?: readonly LandingFooterGroup[];
  community?: { label: string; links: readonly LandingFooterLink[] };
  legal?: { label: string; links: readonly LandingFooterLink[] };
  note?: string;
};

/** Site-level footer. Render after main; destinations and copy belong to the host. */
export function LandingFooter({ brandName, brandMark, title, description, action, groups = [], community, legal, note }: LandingFooterProps) {
  const id = useId();
  const visibleGroups = groups.filter(group => group.links.length > 0);

  return <footer className="recipe-landing-footer" aria-label={brandName}>
    <div className="recipe-landing-footer-inner">
      <div className="recipe-landing-footer-top">
        <div className="recipe-landing-footer-intro">
          <div className="recipe-landing-footer-brand">
            {brandMark && <span aria-hidden="true">{brandMark}</span>}
            <span translate="no">{brandName}</span>
          </div>
          <h2>{title}</h2>
          {description && <p className="recipe-landing-footer-description">{description}</p>}
          {community && community.links.length > 0 && <nav aria-label={community.label}>
            <ul className="recipe-landing-footer-inline-links">{community.links.map(link => <li key={link.id}><a href={link.href}>{link.label}</a></li>)}</ul>
          </nav>}
        </div>
        {visibleGroups.length > 0 && <div className="recipe-landing-footer-groups">{visibleGroups.map((group, index) => <nav key={group.id} aria-labelledby={`${id}-group-${index}`}>
          <h3 id={`${id}-group-${index}`}>{group.label}</h3>
          <ul>{group.links.map(link => <li key={link.id}><a href={link.href}>{link.label}</a></li>)}</ul>
        </nav>)}</div>}
      </div>
      <div className="recipe-landing-footer-signature">
        <svg className="recipe-landing-footer-glow" viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <defs><radialGradient id={`${id}-glow`}><stop stopColor="var(--es-brand)" stopOpacity=".22" /><stop offset="1" stopColor="var(--es-brand)" stopOpacity="0" /></radialGradient></defs>
          <ellipse cx="600" cy="150" rx="400" ry="150" fill={`url(#${id}-glow)`} />
        </svg>
        {action && <div className="recipe-landing-footer-action-row"><a className="recipe-landing-footer-action" href={action.href}><span>{action.label}</span><Icon name="ArrowUpRight" purpose="action" /></a></div>}
        <div className="recipe-landing-footer-wordmark" aria-hidden="true" translate="no">{brandName}</div>
      </div>
      {(note || (legal && legal.links.length > 0)) && <div className="recipe-landing-footer-bottom">
        {note && <p>{note}</p>}
        {legal && legal.links.length > 0 && <nav aria-label={legal.label}><ul className="recipe-landing-footer-inline-links">{legal.links.map(link => <li key={link.id}><a href={link.href}>{link.label}</a></li>)}</ul></nav>}
      </div>}
    </div>
  </footer>;
}
