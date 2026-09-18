"use client";
// beui.dev/components/motion/dock (MIT)

import { motion, useReducedMotion } from "motion/react";
import { createContext, useContext, useId, useMemo, type ReactNode } from "react";
import { SPRING_LAYOUT } from "./lib/ease";
import { cn } from "./lib/utils";

type DockContextValue = {
  size: number;
  pillLayoutId: string;
};

const DockContext = createContext<DockContextValue | null>(null);

export interface DockProps {
  children: ReactNode;
}

export function Dock({ children }: DockProps) {
  const pillLayoutId = useId();
  const size = 44; // BEDS touch target, fixed proportion
  const ctx = useMemo<DockContextValue>(
    () => ({ size, pillLayoutId }),
    [pillLayoutId],
  );

  return (
    <DockContext.Provider value={ctx}>
      <div
        className="inline-flex h-auto items-end gap-1.5 rounded-2xl border border-border bg-card/80 px-2 py-1 shadow-2xl backdrop-blur-xl"
      >
        {children}
      </div>
    </DockContext.Provider>
  );
}

export interface DockItemProps {
  children: ReactNode;
  /** When set, the item renders as a <button>. Omit when children carry their own link or button. */
  onClick?: () => void;
  active?: boolean;
  "aria-label"?: string;
}

export function DockItem({
  children,
  onClick,
  active,
  ...rest
}: DockItemProps) {
  const dock = useContext(DockContext);
  const reduce = useReducedMotion();
  const size = dock?.size ?? 44;
  const pillLayoutId = dock?.pillLayoutId ?? "dock-pill";

  const pill = active ? (
    <motion.span
      layoutId={pillLayoutId}
      transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
      className="absolute inset-0.5 -z-10 rounded-xl bg-primary/5"
    />
  ) : null;
  const sharedStyle = { width: size, height: size };
  const sharedClass = cn(
    "relative flex shrink-0 items-center justify-center rounded-full text-foreground",
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={rest["aria-label"]}
        aria-pressed={active}
        style={sharedStyle}
        className={cn(
          sharedClass,
          "cursor-pointer border-0 bg-transparent p-0 outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        {pill}
        {children}
      </button>
    );
  }

  return (
    <div style={sharedStyle} className={sharedClass}>
      {pill}
      {children}
    </div>
  );
}

export function DockSeparator() {
  return (
    <span
      aria-hidden
      className="mx-1 h-6 w-px self-center bg-border"
    />
  );
}
