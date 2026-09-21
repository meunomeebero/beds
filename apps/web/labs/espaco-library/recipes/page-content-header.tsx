import { type ReactNode } from 'react';
import './page-content-header.css';

/** Optional page-identity composition. Insets and measure belong to this app. */
export function PageContentHeader({ title, description, leading, actions }: {
  title: string; description?: string; leading?: ReactNode; actions?: ReactNode;
}) {
  return <header className="recipe-page-content-header">
    <div className="recipe-page-heading">
      {leading && <span className="recipe-page-leading">{leading}</span>}
      <div><h1>{title}</h1>{description && <p>{description}</p>}</div>
    </div>
    {actions && <div className="recipe-page-actions">{actions}</div>}
  </header>;
}
