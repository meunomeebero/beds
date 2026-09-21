import { type ReactNode } from 'react';
import './home-header.css';

/** Example greeting hierarchy; not a universal BEDS home-page contract. */
export function HomeHeader({ title, description, leading, actions }: {
  title: string; description?: string; leading?: ReactNode; actions?: ReactNode;
}) {
  return <header className="recipe-home-header">
    <div className="recipe-home-heading">
      {leading && <span className="recipe-home-leading">{leading}</span>}
      <div><h1>{title}</h1>{description && <p>{description}</p>}</div>
    </div>
    {actions && <div className="recipe-home-actions">{actions}</div>}
  </header>;
}
