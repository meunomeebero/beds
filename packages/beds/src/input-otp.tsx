'use client';

import { createContext, useContext, useId, type ReactNode } from 'react';
import { OTPInput, OTPInputContext, REGEXP_ONLY_DIGITS } from 'input-otp';

export type InputOTPStatus = 'idle' | 'processing' | 'error' | 'success';
const StatusContext = createContext<InputOTPStatus>('idle');

export interface InputOTPProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: 4 | 6 | 8;
  status?: InputOTPStatus;
  message?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  children?: ReactNode;
  onComplete?: (value: string) => void;
}

/** Visual adaptation of user-supplied OTP. Verification belongs to the caller. */
export function InputOTP({ label, value, onChange, maxLength = 6, status = 'idle', message, disabled = false, required = false, id, name, children, onComplete }: InputOTPProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = `${inputId}-description`;
  return <div className="es-otp-field" data-status={status}>
    <label className="es-otp-label" htmlFor={inputId}>{label}</label>
    <StatusContext.Provider value={status}>
      <OTPInput id={inputId} name={name} value={value} onChange={onChange}
        maxLength={maxLength} onComplete={onComplete} disabled={disabled}
        readOnly={status === 'processing' || status === 'success'} required={required}
        inputMode="numeric" pattern={REGEXP_ONLY_DIGITS} autoComplete="one-time-code"
        spellCheck={false} aria-invalid={status === 'error'} aria-busy={status === 'processing'}
        aria-describedby={descriptionId} containerClassName="es-otp" className="es-otp-input"
        pasteTransformer={(text) => text.replace(/[\s-]/g, '')}>
        {children ?? <InputOTPGroup>{Array.from({ length: maxLength }, (_, index) => <InputOTPSlot key={index} index={index} />)}</InputOTPGroup>}
      </OTPInput>
    </StatusContext.Provider>
    <p id={descriptionId} className="es-otp-message" role="status">{message ?? ''}</p>
  </div>;
}

export function InputOTPGroup({ children }: { children: ReactNode }) {
  return <div className="es-otp-group" aria-hidden="true">{children}</div>;
}

export function InputOTPSlot({ index }: { index: number }) {
  const context = useContext(OTPInputContext);
  const status = useContext(StatusContext);
  const slot = context?.slots[index];
  if (!slot) return null;
  return <div className="es-otp-slot" data-active={slot.isActive} data-status={status} aria-hidden="true">
    {slot.char ? <span key={slot.char} className="es-otp-digit">{slot.char}</span> : <span className="es-otp-placeholder">0</span>}
  </div>;
}

export function InputOTPSeparator() {
  return <span className="es-otp-separator" aria-hidden="true">−</span>;
}
