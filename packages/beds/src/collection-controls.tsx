import { type ReactNode } from 'react';
import './collection-controls.css';

/** Search-result counts and local updates: one stable polite live region. */
export function ResultsStatus({ children }: { children: string }) {
  return <p className="es-results-status" role="status">{children}</p>;
}

/** Search gets the available width; filters wrap below it on narrow screens. */
export function CollectionToolbar({ search, filters }: { search: ReactNode; filters: ReactNode }) {
  return <div className="es-collection-toolbar"><div className="es-collection-search">{search}</div><div className="es-collection-filters">{filters}</div></div>;
}
