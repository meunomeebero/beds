/** Optional app-owned recipe; not a BEDS export. See docs/design/espaco-library/AGNOSTIC-DS.md. */
import { useId, type ReactNode } from 'react';
import { Button } from 'beds';
import { Avatar, Icon } from 'beds';
import './onboarding.css';

export type OnboardingProps = {
  title: string;
  description?: string;
  brandMark?: ReactNode;
  children: ReactNode;
  onSubmit: () => void;
  submitLabel: string;
  busy?: boolean;
  disabled?: boolean;
  secondaryAction?: { label: string; onClick: () => void };
  feedback?: { message: string; tone: 'neutral' | 'success' | 'error' };
  /** Decorative duplicate of form data; never put unique instructions here. */
  preview?: { name: string; detail?: string; sections: readonly { id: string; label: string }[] };
  footer?: ReactNode;
};

/** Standalone onboarding frame. Host owns fields, validation, steps and persistence. */
export function Onboarding({ title, description, brandMark, children, onSubmit, submitLabel, busy = false, disabled = false, secondaryAction, feedback, preview, footer }: OnboardingProps) {
  const id = useId();
  const unavailable = busy || disabled;
  return <main className="recipe-onboarding" aria-labelledby={`${id}-title`}>
    {brandMark && <div className="recipe-onboarding-brand">{brandMark}</div>}
    <div className="recipe-onboarding-container">
      <div className="recipe-onboarding-card" data-preview={Boolean(preview)}>
        <form className="recipe-onboarding-form" noValidate aria-labelledby={`${id}-title`} aria-describedby={description ? `${id}-description` : undefined} aria-busy={busy || undefined} onSubmit={event => {
          event.preventDefault();
          if (!unavailable) onSubmit();
        }}>
          <header className="recipe-onboarding-heading">
            <h1 id={`${id}-title`}>{title}</h1>
            {description && <p id={`${id}-description`}>{description}</p>}
          </header>
          <fieldset className="recipe-onboarding-fields" disabled={unavailable}>
            <legend className="recipe-visually-hidden">{title}</legend>
            {children}
          </fieldset>
          <div className="recipe-onboarding-bottom">
            <div className="recipe-onboarding-feedback" data-tone={feedback?.tone}>
              <p role="status">{feedback?.tone !== 'error' ? feedback?.message : ''}</p>
              <p role="alert">{feedback?.tone === 'error' ? feedback.message : ''}</p>
            </div>
            <div className="recipe-onboarding-actions">
              <Button type="submit" label={submitLabel} purpose="welcome" variant="primary" busy={busy} disabled={disabled} />
              {secondaryAction && <Button label={secondaryAction.label} onClick={secondaryAction.onClick} purpose="welcome" variant="ghost" disabled={unavailable} />}
            </div>
          </div>
        </form>
        {preview && <div className="recipe-onboarding-preview" aria-hidden="true">
          <div className="recipe-onboarding-window">
            <div className="recipe-onboarding-window-header"><Avatar name={preview.name} purpose="workspace" /><span>{preview.name}</span><Icon name="PanelLeftClose" purpose="action" /></div>
            <div className="recipe-onboarding-window-columns">
              <div className="recipe-onboarding-window-sidebar">
                {preview.sections.map(section => <div className="recipe-onboarding-preview-group" key={section.id}><span>{section.label}</span>{[0, 1, 2].map(index => <div className="recipe-onboarding-placeholder-row" key={index}><i /><b /></div>)}</div>)}
              </div>
              <div className="recipe-onboarding-window-content"><Icon name="FileText" purpose="feature" /><span>{preview.detail}</span><i /><i /><i /></div>
            </div>
          </div>
        </div>}
      </div>
    </div>
    {footer && <div className="recipe-onboarding-footer">{footer}</div>}
  </main>;
}
