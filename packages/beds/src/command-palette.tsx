"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCallback, useId, useLayoutEffect, useMemo, useRef, type KeyboardEvent } from "react";
import { Icon, type IconName } from "./foundation";
import { IconButton } from "./controls";
import { EASE_OUT } from "./lib/ease";
import { useOnOpen } from "./lib/hooks/use-on-open";
import { useRowCursor } from "./lib/hooks/use-row-cursor";
import { useTouchCapable } from "./lib/hooks/use-touch-capable";
import { containModalTab, outsideDialog, useModal } from "./lib/modal";
import { searchCommands } from "./lib/command-search";
import "./overlays.css";

export type CommandPaletteItem = {
  id: string;
  label: string;
  description?: string;
  icon?: IconName;
  disabled?: boolean;
};

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  query: string;
  onQueryChange: (query: string) => void;
  items: CommandPaletteItem[];
  onSelect: (id: string) => void;
  emptyLabel?: string;
}

/**
 * BEDS command palette with beUI's fuzzy search and cursor mechanics adapted
 * to the existing controlled API, native dialog, IconName registry and
 * measured `.es-command` geometry. Consumers own shortcuts and data loading.
 */
export function CommandPalette({ open, onOpenChange, label, query, onQueryChange, items, onSelect, emptyLabel = "Nenhum resultado" }: CommandPaletteProps) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();
  const canTouch = useTouchCapable();

  const searchableItems = useMemo(() => items.map((item) => ({
    ...item,
    keywords: item.description ? [item.description] : undefined,
  })), [items]);
  const filtered = useMemo(() => searchCommands(searchableItems, query), [searchableItems, query]);
  const enabled = useMemo(() => filtered.filter((item) => !item.disabled), [filtered]);
  const { activeIndex, moveTo } = useRowCursor(enabled, query);
  useOnOpen(open, () => moveTo(null));

  const active = enabled[activeIndex];
  const activeFilteredIndex = active ? filtered.findIndex((item) => item.id === active.id) : -1;
  const activeOptionId = activeFilteredIndex >= 0 ? `${id}-option-${activeFilteredIndex}` : undefined;

  useModal(open, dialog);
  useLayoutEffect(() => {
    if (!open) return;
    input.current?.focus({ preventScroll: true });
  }, [open]);
  useLayoutEffect(() => {
    if (!open || !active) return;
    dialog.current?.querySelector(`[data-active="true"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const choose = useCallback((item: CommandPaletteItem) => {
    if (item.disabled) return;
    onOpenChange(false);
    onSelect(item.id);
  }, [onOpenChange, onSelect]);

  const navigate = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (enabled.length === 0) return;
      const nextIndex = (activeIndex + (event.key === "ArrowDown" ? 1 : -1) + enabled.length) % enabled.length;
      moveTo(enabled[nextIndex]?.id ?? null);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (active) choose(active);
    }
  };

  return <dialog
    ref={dialog}
    className="es-command"
    aria-label={label}
    aria-modal="true"
    onKeyDown={containModalTab}
    onCancel={(event) => { event.preventDefault(); onOpenChange(false); }}
    onClick={(event) => { if (outsideDialog(event)) onOpenChange(false); }}
  >
    <div className="es-command-search">
      <Icon name="Search" purpose="action" />
      <input
        ref={input}
        type="text"
        role="combobox"
        aria-label={label}
        placeholder={label}
        value={query}
        autoComplete="off"
        spellCheck={false}
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={`${id}-list`}
        aria-activedescendant={activeOptionId}
        style={canTouch ? { fontSize: "16px" } : undefined}
        onChange={(event) => { moveTo(null); onQueryChange(event.target.value); }}
        onKeyDown={navigate}
      />
      <IconButton label="Fechar busca" icon="X" onClick={() => onOpenChange(false)} />
    </div>
    <div id={`${id}-list`} className="es-command-list" role="listbox" aria-label={label}>
      {filtered.map((item, index) => {
        const isActive = active?.id === item.id && !item.disabled;
        return <motion.div
          key={item.id}
          id={`${id}-option-${index}`}
          className="es-command-option"
          role="option"
          aria-selected={isActive}
          aria-disabled={item.disabled || undefined}
          data-active={isActive}
          animate={{ backgroundColor: isActive ? "var(--es-hover)" : "transparent" }}
          transition={reduce ? { duration: 0 } : { duration: 0.16, ease: EASE_OUT }}
          onPointerMove={(event) => { if (event.pointerType !== "touch" && !item.disabled) moveTo(item.id); }}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => choose(item)}
        >
          {item.icon && <Icon name={item.icon} purpose="navigation" />}
          <span className="es-option-copy"><span>{item.label}</span>{item.description && <small>{item.description}</small>}</span>
        </motion.div>;
      })}
    </div>
    {filtered.length === 0 && <p className="es-command-empty" role="status">{emptyLabel}</p>}
  </dialog>;
}
