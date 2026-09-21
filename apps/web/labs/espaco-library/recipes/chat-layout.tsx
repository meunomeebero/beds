import type { ReactNode } from 'react';
import './chat-layout.css';

/** Optional start-screen layout. Apps choose hierarchy and spacing; see AGNOSTIC-DS.md. */
export function ChatLayout({ title, mark, children, suggestions, recent }: { title: string; mark?: ReactNode; children: ReactNode; suggestions?: ReactNode; recent?: ReactNode }) {
  return <div className="recipe-chat-layout"><h1>{mark}{title}</h1><div className="recipe-chat-compose-region">{children}</div>{suggestions && <div className="recipe-chat-suggestions">{suggestions}</div>}{recent && <div className="recipe-chat-recent">{recent}</div>}</div>;
}
