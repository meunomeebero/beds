import { useMemo, useRef } from 'react';

export interface TapRecord<S> {
  pointerType: string;
  state: S;
}

export interface TapGesture<S> {
  start: (event: { pointerType: string }, state: S) => void;
  take: () => TapRecord<S> | null;
  drop: () => void;
}

/** Remember the pointer behind a click so touch can toggle an explanation. */
export function useTapGesture<S>(): TapGesture<S> {
  const record = useRef<TapRecord<S> | null>(null);
  return useMemo(() => ({
    start: (event, state) => { record.current = { pointerType: event.pointerType, state }; },
    take: () => {
      const spent = record.current;
      record.current = null;
      return spent;
    },
    drop: () => { record.current = null; },
  }), []);
}
