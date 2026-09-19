'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { createContext, useContext, useId, type ReactNode } from 'react';
import { OTPInput, OTPInputContext, REGEXP_ONLY_DIGITS } from 'input-otp';
import { Icon } from './foundation';
import { EASE_OUT } from './lib/ease';
import './input-otp.css';

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
  const reduce = useReducedMotion() ?? false;
  return <div className="es-otp-field" data-status={status}>
    <label className="es-otp-label" htmlFor={inputId}>{label}</label>
    <StatusContext.Provider value={status}>
      <OTPInput id={inputId} name={name} value={value} onChange={onChange}
        maxLength={maxLength} onComplete={onComplete} disabled={disabled}
        readOnly={status === 'processing' || status === 'success'} required={required}
        inputMode="numeric" pattern={REGEXP_ONLY_DIGITS} autoComplete="one-time-code"
        spellCheck={false} aria-invalid={status === 'error'} aria-busy={status === 'processing'}
        aria-describedby={descriptionId} containerClassName="es-otp" className="es-otp-input"
        pasteTransformer={(text) => text.replace(/\D/g, '')}>
        {children ?? <InputOTPGroup>{Array.from({ length: maxLength }, (_, index) => <InputOTPSlot key={index} index={index} />)}</InputOTPGroup>}
      </OTPInput>
    </StatusContext.Provider>
    <p id={descriptionId} className="es-otp-message" role="status" data-status={status}>
      {status === 'success' && <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key="success"
          className="es-otp-success-icon"
          initial={reduce ? false : { scale: .6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { scale: .6, opacity: 0 }}
          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 28 }}
          aria-hidden="true"
        ><Icon name="Check" purpose="small" /></motion.span>
      </AnimatePresence>}
      {message && <span className="es-otp-message-copy">{message}</span>}
    </p>
  </div>;
}

export function InputOTPGroup({ children }: { children: ReactNode }) {
  const status = useContext(StatusContext);
  const reduce = useReducedMotion() ?? false;
  const shake = status === 'error' && !reduce ? { x: [0, -5, 5, -3, 3, -1, 0] } : { x: 0 };
  return <motion.div className="es-otp-group" aria-hidden="true" initial={false} animate={shake} transition={reduce ? { duration: 0 } : { duration: .45, ease: EASE_OUT }}>{children}</motion.div>;
}

export function InputOTPSlot({ index }: { index: number }) {
  const context = useContext(OTPInputContext);
  const status = useContext(StatusContext);
  const reduce = useReducedMotion() ?? false;
  const slot = context?.slots[index];
  if (!slot) return null;
  return <div className="es-otp-slot" data-active={slot.isActive} data-filled={Boolean(slot.char)} data-status={status} aria-hidden="true">
    {slot.isActive && status !== 'success' && <motion.span
      className="es-otp-caret"
      aria-hidden="true"
      animate={reduce ? { opacity: 1 } : { opacity: [1, 1, 0, 0] }}
      transition={reduce ? { duration: 0 } : { duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
    />}
    <AnimatePresence initial={false} mode="popLayout">
      {slot.char ? <motion.span
        key={slot.char}
        className="es-otp-digit"
        initial={reduce ? { opacity: 0 } : { y: 14, opacity: 0, filter: 'blur(4px)' }}
        animate={reduce ? { opacity: 1 } : { y: 0, opacity: 1, filter: 'blur(0px)' }}
        exit={reduce ? { opacity: 0 } : { y: -14, opacity: 0, filter: 'blur(4px)' }}
        transition={reduce ? { duration: 0 } : { duration: .22, ease: EASE_OUT }}
      >{slot.char}</motion.span> : <span className="es-otp-placeholder">0</span>}
    </AnimatePresence>
  </div>;
}

export function InputOTPSeparator() {
  return <span className="es-otp-separator" aria-hidden="true">−</span>;
}
