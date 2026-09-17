import { useId, useRef, type ReactNode } from 'react';
import { Icon } from './foundation';
import { Tabs } from './controls';
import './landing.css';

export type LandingLink = { label: string; href: string };

/** Site landmarks and navigation. Hosts supply real destinations and one H1. */
export function LandingPageLayout({ brandName, brandMark, homeHref, navigation, navigationLabel, menuLabel, accountLink, appearance, skipLabel, children, footer }: {
  brandName: string; brandMark?: ReactNode; homeHref: string;
  navigation: readonly LandingLink[]; navigationLabel: string; menuLabel: string; accountLink?: LandingLink;
  appearance?: ReactNode; skipLabel: string; children: ReactNode; footer: ReactNode;
}) {
  const id = useId();
  const mobileMenu = useRef<HTMLDetailsElement>(null);
  function closeMenu() {
    if (!mobileMenu.current) return;
    mobileMenu.current.open = false;
    mobileMenu.current.querySelector('summary')?.focus();
  }
  return <div className="es-landing">
    <a className="es-landing-skip" href={`#${id}-main`}>{skipLabel}</a>
    <header className="es-landing-header">
      <div className="es-landing-header-inner">
        <a className="es-landing-brand" href={homeHref} aria-label={brandName}><span aria-hidden="true">{brandMark}</span><span translate="no">{brandName}</span></a>
        <nav className="es-landing-desktop-nav" aria-label={navigationLabel}>{navigation.map(link => <a key={link.href} href={link.href}>{link.label}</a>)}</nav>
        <details ref={mobileMenu} className="es-landing-mobile-nav" onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); closeMenu(); } }}>
          <summary>{menuLabel}<Icon name="ChevronDown" purpose="small" /></summary>
          <nav aria-label={navigationLabel}>{navigation.map(link => <a key={link.href} href={link.href} onClick={closeMenu}>{link.label}</a>)}</nav>
        </details>
        <div className="es-landing-account">{appearance}{accountLink && <a href={accountLink.href}>{accountLink.label}</a>}</div>
      </div>
    </header>
    <main id={`${id}-main`} tabIndex={-1}>{children}</main>
    {footer}
  </div>;
}

/** Promise → explanation → one primary next step → visible product proof. */
export function LandingHero({ eyebrow, title, description, action, secondaryAction, note, children }: {
  eyebrow?: string; title: string; description: string; action: LandingLink;
  secondaryAction?: LandingLink; note?: string; children: ReactNode;
}) {
  const id = useId();
  return <section className="es-landing-hero" aria-labelledby={id}>
    <div className="es-landing-hero-copy">
      {eyebrow && <p className="es-landing-eyebrow">{eyebrow}</p>}
      <h1 id={id}>{title}</h1><p className="es-landing-description">{description}</p>
      <div className="es-landing-actions"><a className="es-landing-primary" href={action.href}>{action.label}<Icon name="ArrowRight" purpose="action" /></a>{secondaryAction && <a className="es-landing-secondary" href={secondaryAction.href}>{secondaryAction.label}<Icon name="ArrowUpRight" purpose="action" /></a>}</div>
      {note && <p className="es-landing-note">{note}</p>}
    </div>
    <div className="es-landing-hero-proof">{children}</div>
  </section>;
}

/** Anchorable section boundary; fixed space, no consumer styling escape hatch. */
export function LandingSection({ id, children }: { id: string; children: ReactNode }) {
  return <div id={id} className="es-landing-section" tabIndex={-1}>{children}</div>;
}

export type ProductDemoTab = { id: string; label: string; content: ReactNode };
/** Real, keyboard-operable BEDS UI with explicit illustrative-data disclosure. */
export function ProductDemo({ label, contextLabel, context, resultLabel, tabs, value, onChange, note }: {
  label: string; contextLabel: string; context: ReactNode; resultLabel: string;
  tabs: ProductDemoTab[]; value: string; onChange: (value: string) => void; note: string;
}) {
  const id = useId();
  return <figure className="es-product-demo" aria-labelledby={`${id}-label`}>
    <div className="es-product-demo-top"><h2 id={`${id}-label`}><Icon name="Briefcase" purpose="action" />{label}</h2><span>{note}</span></div>
    <div className="es-product-demo-grid">
      <div className="es-product-demo-context"><p className="es-product-demo-label">{contextLabel}</p>{context}</div>
      <div className="es-product-demo-result"><p className="es-product-demo-label">{resultLabel}</p><Tabs label={resultLabel} variant="settings" items={tabs} value={value} onChange={onChange} /></div>
    </div>
  </figure>;
}

/** Readable sample content, not fake skeleton UI or a real downloadable artifact. */
export function DocumentPreview({ name, subtitle, sections, note }: {
  name: string; subtitle: string; sections: readonly { id: string; title: string; text: string }[]; note?: string;
}) {
  return <article className="es-document-preview">
    <header><h3>{name}</h3><p>{subtitle}</p></header>
    {sections.map(section => <section key={section.id}><h4>{section.title}</h4><p>{section.text}</p></section>)}
    {note && <p className="es-document-preview-note"><Icon name="CheckCircle2" purpose="action" />{note}</p>}
  </article>;
}

/** Ordered, outcome-led explanation. Steps are not navigation or fake controls. */
export function ProcessSteps({ title, description, steps }: {
  title: string; description?: string; steps: readonly { id: string; title: string; description: string }[];
}) {
  const id = useId();
  return <section className="es-process-steps" aria-labelledby={id}><header><h2 id={id}>{title}</h2>{description && <p>{description}</p>}</header>
    <ol role="list">{steps.map((step, index) => <li key={step.id}><span className="es-process-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><h3>{step.title}</h3><p>{step.description}</p></li>)}</ol>
  </section>;
}

/** Native disclosure; answers remain available without custom keyboard logic. */
export function FAQSection({ title, description, items }: {
  title: string; description?: string; items: readonly { id: string; question: string; answer: string }[];
}) {
  const id = useId();
  return <section className="es-landing-faq" aria-labelledby={id}><header><h2 id={id}>{title}</h2>{description && <p>{description}</p>}</header>
    <div>{items.map(item => <details key={item.id}><summary>{item.question}<Icon name="Plus" purpose="action" /></summary><p>{item.answer}</p></details>)}</div>
  </section>;
}
