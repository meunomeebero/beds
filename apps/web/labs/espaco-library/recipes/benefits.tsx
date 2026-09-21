/** Optional app-owned recipe; not a BEDS export. See docs/design/espaco-library/AGNOSTIC-DS.md. */
import { useId, type ReactNode } from 'react';
import { Icon } from 'beds';
import './benefits.css';

export type BenefitItem = {
  id: string;
  title: string;
  description?: string;
  illustration?: ReactNode;
};

export type BenefitsSectionProps = {
  title: string;
  description?: string;
  items: readonly BenefitItem[];
  action?: { label: string; href: string };
  note?: string;
  /** Page context owns main/H1; section context nests H2/H3 in an existing page. */
  purpose?: 'section' | 'page';
};

/** Editorial benefits, not clickable cards. Host owns copy and the single destination. */
export function BenefitsSection({ title, description, items, action, note, purpose = 'section' }: BenefitsSectionProps) {
  const id = useId();
  const Element = purpose === 'page' ? 'main' : 'section';
  const Heading = Element === 'main' ? 'h1' : 'h2';
  const CardHeading = Element === 'main' ? 'h2' : 'h3';

  return <Element className="recipe-benefits" aria-labelledby={`${id}-title`}>
    <div className="recipe-benefits-inner">
      <header className="recipe-benefits-intro">
        <Heading id={`${id}-title`}>{title}</Heading>
        {description && <p>{description}</p>}
      </header>
      {items.length > 0 && <ul className="recipe-benefits-grid" role="list">{items.map((item, index) => <li key={item.id} className="recipe-benefit" data-featured={index === 0 || undefined}>
        <article aria-labelledby={`${id}-item-${index}`}>
          {item.illustration && <div className="recipe-benefit-media">{item.illustration}</div>}
          <div className="recipe-benefit-copy">
            <CardHeading id={`${id}-item-${index}`}>{item.title}</CardHeading>
            {item.description && <p>{item.description}</p>}
          </div>
        </article>
      </li>)}</ul>}
      {(action || note) && <div className="recipe-benefits-footer">
        {action && <a className="recipe-benefits-action" href={action.href}><span>{action.label}</span><Icon name="ArrowRight" purpose="action" /></a>}
        {note && <p>{note}</p>}
      </div>}
    </div>
  </Element>;
}

export type BenefitIllustrationKind = 'documents' | 'profile' | 'match' | 'conversation' | 'board';

function Lines({ x, y, width = 90, rows = 3 }: { x: number; y: number; width?: number; rows?: number }) {
  return <g fill="var(--es-secondary)" fillOpacity=".22">{Array.from({ length: rows }, (_, index) => <rect key={index} x={x} y={y + index * 12} width={index === rows - 1 ? width * .68 : width} height="5" rx="2.5" />)}</g>;
}

function Paper({ x, y, angle = 0, highlight = false }: { x: number; y: number; angle?: number; highlight?: boolean }) {
  return <g transform={`translate(${x} ${y}) rotate(${angle} 60 82)`}>
    <rect className="recipe-benefit-art-paper" width="120" height="164" rx="12" />
    <rect x="16" y="18" width="24" height="24" rx="7" fill={highlight ? 'var(--es-brand)' : 'var(--es-subtle)'} />
    <Lines x={49} y={21} width={52} rows={2} />
    <Lines x={16} y={58} width={87} rows={3} />
    <rect x="16" y="103" width="62" height="5" rx="2.5" fill={highlight ? 'var(--es-brand)' : 'var(--es-subtle)'} />
    <Lines x={16} y={118} width={87} rows={2} />
  </g>;
}

/** Original, static, decorative miniatures. No scores, fake metrics, labels or controls. */
export function BenefitIllustration({ kind }: { kind: BenefitIllustrationKind }) {
  const id = useId();
  const wide = kind === 'documents';
  return <svg className="recipe-benefit-art" viewBox={wide ? '0 0 600 240' : '0 0 320 240'} aria-hidden="true" focusable="false">
    <defs><radialGradient id={`${id}-wash`}><stop stopColor="var(--es-brand)" stopOpacity=".16" /><stop offset="1" stopColor="var(--es-brand)" stopOpacity="0" /></radialGradient></defs>
    <ellipse cx={wide ? 340 : 175} cy="105" rx={wide ? 270 : 180} ry="150" fill={`url(#${id}-wash)`} />
    {kind === 'documents' && <>
      <g transform="translate(42 76) rotate(-5 65 46)">
        <rect className="recipe-benefit-art-paper" width="134" height="94" rx="14" />
        <g transform="translate(16 16)"><Icon name="Briefcase" purpose="feature" /></g>
        <Lines x={48} y={19} width={66} rows={2} />
        <Lines x={16} y={56} width={100} rows={2} />
      </g>
      <path className="recipe-benefit-art-connector" d="M190 120H270m-7-6 7 6-7 6" />
      <Paper x={293} y={36} angle={-7} />
      <Paper x={386} y={32} angle={6} highlight />
      <g transform="translate(505 158)"><circle className="recipe-benefit-art-paper" cx="0" cy="0" r="22" /><g transform="translate(-10 -10)"><Icon name="Check" purpose="feature" /></g></g>
    </>}
    {kind === 'profile' && <>
      <path className="recipe-benefit-art-orbit" d="M60 125a100 70 0 1 1 200 0a100 70 0 1 1-200 0" />
      <g transform="translate(88 59)"><rect className="recipe-benefit-art-paper" width="146" height="124" rx="16" /><circle cx="73" cy="37" r="20" fill="var(--es-subtle)" /><g transform="translate(63 27)"><Icon name="UserRound" purpose="feature" /></g><Lines x={34} y={76} width={78} rows={3} /></g>
      <g transform="translate(37 123) rotate(-8)"><rect className="recipe-benefit-art-paper" width="48" height="48" rx="12" /><g transform="translate(14 14)"><Icon name="FileText" purpose="feature" /></g></g>
      <g transform="translate(234 53) rotate(8)"><rect className="recipe-benefit-art-paper" width="48" height="48" rx="12" /><g transform="translate(14 14)"><Icon name="MessageSquare" purpose="feature" /></g></g>
    </>}
    {kind === 'match' && <>
      <g transform="translate(46 52) rotate(-4 90 65)"><rect className="recipe-benefit-art-paper" width="184" height="130" rx="14" />
        {[0, 1, 2].map(row => <g key={row} transform={`translate(18 ${22 + row * 33})`}><circle cx="10" cy="10" r="10" fill="var(--es-subtle)" /><g transform="translate(2 2)"><Icon name={row === 2 ? 'Search' : 'Check'} purpose="action" /></g><Lines x={34} y={3} width={105} rows={2} /></g>)}
      </g>
      <g transform="rotate(-12 221 146)"><path d="m243 167 29 31" stroke="var(--es-text)" strokeWidth="13" strokeLinecap="round" /><circle cx="221" cy="145" r="39" fill="var(--es-surface)" stroke="var(--es-text)" strokeWidth="5" /><rect x="201" y="133" width="40" height="7" rx="3.5" fill="var(--es-brand)" /><rect x="201" y="151" width="29" height="6" rx="3" fill="var(--es-subtle)" /></g>
    </>}
    {kind === 'conversation' && <>
      <g transform="translate(87 52) rotate(4 84 29)"><rect className="recipe-benefit-art-paper" width="166" height="58" rx="16" /><Lines x={18} y={20} width={130} rows={2} /></g>
      <g transform="translate(49 109) rotate(-3 102 35)"><rect className="recipe-benefit-art-paper" width="206" height="77" rx="16" /><g transform="translate(18 19)"><Icon name="Sparkles" purpose="feature" /></g><Lines x={51} y={19} width={132} rows={3} /></g>
      <circle cx="263" cy="167" r="10" fill="var(--es-brand)" />
    </>}
    {kind === 'board' && <g transform="translate(30 47)">
      {[0, 1, 2].map(column => <g key={column} transform={`translate(${column * 89} 0)`}>
        <rect width="80" height="154" rx="12" fill="var(--es-subtle)" fillOpacity=".55" />
        <circle cx="13" cy="16" r="3" fill={column === 1 ? 'var(--es-brand)' : 'var(--es-secondary)'} />
        <rect x="22" y="13" width="42" height="5" rx="2.5" fill="var(--es-border-strong)" />
        {Array.from({ length: column === 0 ? 2 : 1 }, (_, row) => <g key={row} transform={`translate(7 ${33 + row * 58}) rotate(${column === 1 ? -5 : 0} 33 25)`}>
          <rect className="recipe-benefit-art-paper" width="66" height="48" rx="7" /><Lines x={10} y={12} width={46} rows={2} />
          <rect x="10" y="33" width="17" height="4" rx="2" fill={column === 1 ? 'var(--es-brand)' : 'var(--es-subtle)'} />
        </g>)}
      </g>)}
    </g>}
  </svg>;
}
