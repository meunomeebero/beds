"use client";

import { motion, type Transition, type Variants } from "motion/react";
import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { Icon, type IconName } from "./foundation";
import { useAnchoredPopup } from "./lib/anchored-popup";
import { EASE_OUT } from "./lib/ease";
import { nextOption } from "./lib/option-navigation";
import "./overlays.css";
import { useReducedMotionPreference } from "./lib/hooks/use-reduced-motion";

const INSTANT_TRANSITION: Transition = { duration: 0 };
const CHEVRON_TRANSITION: Transition = { type: "spring", duration: 0.4, bounce: 0.3 };
const LIST_VARIANTS: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035, delayChildren: 0.05 } },
};
const ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: -6, filter: "blur(3px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};
const TYPEAHEAD_TIMEOUT = 500;

function normalizeTypeahead(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
}

export type SelectOption = {
  id: string;
  label: string;
  description?: string;
  icon?: IconName;
  disabled?: boolean;
};

export interface SelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  icon?: IconName;
  variant?: "compact" | "field" | "context" | "filter";
}

/**
 * BEDS Select with beUI's measured entry and chevron motion adapted to the
 * existing controlled API, native manual popover and fixed BEDS geometry.
 * Search, filtering policy and option data remain caller-owned.
 */
export function Select({ label, value, options, onChange, disabled, icon, variant = "compact" }: SelectProps) {
  const id = useId();
  const anchor = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const typeahead = useRef({ value: "", at: 0 });
  const reduce = useReducedMotionPreference();
  const selected = options.find(option => option.id === value);
  const active = options.find(option => option.id === activeId && !option.disabled)
    ?? options.find(option => option.id === value && !option.disabled)
    ?? options.find(option => !option.disabled);
  const activeIndex = options.findIndex(option => option.id === active?.id);

  useAnchoredPopup({ open: open && !disabled, anchor, panel, onOpenChange: setOpen });
  useLayoutEffect(() => { if (disabled) setOpen(false); }, [disabled]);
  useLayoutEffect(() => {
    if (open) panel.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [open, active?.id]);

  const resetTypeahead = () => { typeahead.current = { value: "", at: 0 }; };
  const moveByTypeahead = (key: string) => {
    const character = normalizeTypeahead(key);
    if (!character) return;
    const now = Date.now();
    const previous = typeahead.current;
    const timedOut = now - previous.at > TYPEAHEAD_TIMEOUT;
    const repeated = !timedOut && previous.value.length > 0 && previous.value === character.repeat(previous.value.length);
    const query = repeated || timedOut ? character : `${previous.value}${character}`;
    const enabled = options.filter(option => !option.disabled);
    const currentIndex = enabled.findIndex(option => option.id === active?.id);
    const start = repeated ? currentIndex + 1 : 0;
    const match = [...enabled.slice(start), ...enabled.slice(0, start)]
      .find(option => normalizeTypeahead(option.label).startsWith(query))
      ?? (query.length > 1 ? enabled.find(option => normalizeTypeahead(option.label).startsWith(character)) : undefined);
    typeahead.current = { value: query, at: now };
    if (match) setActiveId(match.id);
  };

  const show = (fromEnd = false) => {
    resetTypeahead();
    setActiveId(options.find(option => option.id === value && !option.disabled)?.id
      ?? nextOption(options, undefined, fromEnd ? "End" : "Home"));
    setOpen(true);
  };
  const choose = (option: SelectOption) => {
    if (!option.disabled) {
      onChange(option.id);
      resetTypeahead();
      setOpen(false);
    }
  };
  const navigate = (event: KeyboardEvent<HTMLDivElement>) => {
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      setActiveId(nextOption(options, active?.id, event.key));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (active) choose(active);
    } else if (event.key === "Tab") {
      anchor.current?.focus({ preventScroll: true });
      resetTypeahead();
      setOpen(false);
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      moveByTypeahead(event.key);
    }
  };

  return <div className="es-select" data-variant={variant}>
    <motion.button
      ref={anchor}
      type="button"
      className="es-select-trigger"
      aria-label={`${label}: ${selected?.label ?? value}`}
      aria-haspopup="listbox"
      aria-expanded={open && !disabled}
      aria-controls={open && !disabled ? id : undefined}
      disabled={disabled}
      onClick={() => { if (open) { resetTypeahead(); setOpen(false); } else show(); }}
      onKeyDown={event => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          show(event.key === "ArrowUp");
        }
      }}
      initial={false}
      animate={{
        borderTopLeftRadius: variant === "compact" ? 6 : 8,
        borderTopRightRadius: variant === "compact" ? 6 : 8,
        borderBottomLeftRadius: variant === "compact" ? 6 : 8,
        borderBottomRightRadius: variant === "compact" ? 6 : 8,
      }}
      transition={reduce ? INSTANT_TRANSITION : { duration: 0.18, ease: EASE_OUT }}
    >
      {(icon ?? selected?.icon) && <Icon name={(icon ?? selected?.icon)!} purpose="navigation" />}
      <span>{selected?.label ?? value}</span>
      {variant === "context" && selected?.description && <small>{selected.description}</small>}
      <motion.span
        aria-hidden="true"
        animate={{ rotate: open ? 180 : 0 }}
        transition={reduce ? INSTANT_TRANSITION : CHEVRON_TRANSITION}
      >
        <Icon name={variant === "filter" ? "ChevronsUpDown" : "ChevronDown"} purpose="small" />
      </motion.span>
    </motion.button>
    {open && !disabled && <motion.div
      ref={panel}
      id={id}
      popover="manual"
      className="es-select-popup"
      role="listbox"
      aria-label={label}
      aria-activedescendant={activeIndex >= 0 ? `${id}-${activeIndex}` : undefined}
      tabIndex={-1}
      onKeyDown={navigate}
      initial={false}
      animate={{ opacity: 1 }}
      transition={reduce ? INSTANT_TRANSITION : { duration: 0.18, ease: EASE_OUT }}
    >
      <motion.div
        variants={reduce ? undefined : LIST_VARIANTS}
        initial={reduce ? false : "hidden"}
        animate={reduce ? undefined : "show"}
        className="es-select-options"
      >
        {options.map((option, index) => <motion.div
          key={option.id}
          variants={reduce ? undefined : ITEM_VARIANTS}
          id={`${id}-${index}`}
          role="option"
          className="es-select-option"
          aria-selected={value === option.id}
          aria-disabled={option.disabled || undefined}
          data-active={active?.id === option.id}
          onPointerMove={() => { if (!option.disabled) setActiveId(option.id); }}
          onClick={() => choose(option)}
        >
          {option.icon && <Icon name={option.icon} purpose="navigation" />}
          <span className="es-option-copy"><span>{option.label}</span>{option.description && <small>{option.description}</small>}</span>
          {value === option.id && <Icon name="Check" purpose="navigation" />}
        </motion.div>)}
      </motion.div>
    </motion.div>}
  </div>;
}

export interface FilterSelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  icon?: IconName;
  disabled?: boolean;
}

/** Transparent toolbar selector; filtering policy remains application-owned. */
export function FilterSelect({ label, value, options, onChange, icon = "CalendarDays", disabled }: FilterSelectProps) {
  return <Select label={label} value={value} options={options} onChange={onChange} icon={icon} disabled={disabled} variant="filter" />;
}
