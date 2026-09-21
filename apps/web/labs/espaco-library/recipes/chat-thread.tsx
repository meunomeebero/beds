import { useEffect, useId, useRef, type ReactNode } from 'react';
import './chat-thread.css';

/** Open transcript + in-flow next step. Changing stepKey restores focus to the new step. */
export function ChatThread({ title, children, interaction, stepKey, notice, announcement }: {
  title: string; children: ReactNode; interaction: ReactNode; stepKey: string; notice?: string; announcement?: string;
}) {
  const id = useId();
  const interactionRef = useRef<HTMLDivElement>(null);
  const previousStep = useRef(stepKey);
  useEffect(() => {
    if (previousStep.current === stepKey) return;
    previousStep.current = stepKey;
    const region = interactionRef.current;
    const target = region?.querySelector<HTMLElement>('textarea:not(:disabled),input:not([type="file"]):not(:disabled)')
      ?? region?.querySelector<HTMLElement>('button:not(:disabled),a[href]');
    target?.focus();
  }, [stepKey]);
  return <section className="recipe-chat-thread" aria-labelledby={id}>
    <h1 id={id} className="recipe-chat-sr-only">{title}</h1>
    <div className="recipe-chat-transcript">{children}</div>
    <div className="recipe-chat-next" ref={interactionRef}>{interaction}{notice && <p className="recipe-chat-notice">{notice}</p>}</div>
    <p className="recipe-chat-sr-only" role="status">{announcement}</p>
  </section>;
}
