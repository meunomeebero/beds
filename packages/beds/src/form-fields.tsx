import { motion } from 'motion/react';
import { useEffect, useId, useLayoutEffect, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Icon } from './foundation';
import { SPRING_LAYOUT, SPRING_PRESS } from './lib/ease';
import { useReducedMotionPreference } from './lib/hooks/use-reduced-motion';
import './form-fields.css';

export type RadioOption = {
  id: string;
  label: string;
  disabled?: boolean;
};

export type RadioGroupProps = {
  label: string;
  value: string;
  options: readonly RadioOption[];
  onChange: (value: string) => void;
  description?: string;
  error?: string;
  disabled?: boolean;
  name?: string;
  purpose?: 'default' | 'question';
};

export type FileUploadFieldProps = {
  label: string;
  files: readonly File[];
  onFilesChange: (files: File[]) => void;
  dropLabel: string;
  browseLabel: string;
  removeLabel: string;
  description?: string;
  error?: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  /** Document-led upload screen; default keeps the compact field geometry. */
  purpose?: 'default' | 'document';
  /** Decorative format label; actual accepted formats remain caller-owned. */
  documentLabel?: string;
  dragLabel?: string;
  status?: string;
};

function FieldSupport({ id, description, error }: { id: string; description?: string; error?: string }) {
  return <>{description && <p id={`${id}-description`} className="es-field-description">{description}</p>}{error && <p id={`${id}-error`} className="es-field-error" role="alert"><Icon name="AlertCircle" purpose="small" />{error}</p>}</>;
}

type RadioActivation = 'pointer' | 'keyboard' | null;

function enabledOptions(options: readonly RadioOption[], disabled?: boolean) {
  return disabled ? [] : options.filter(option => !option.disabled);
}

function nextRadioId(options: readonly RadioOption[], current: string, key: string, disabled?: boolean) {
  const enabled = enabledOptions(options, disabled);
  if (enabled.length === 0) return null;
  const currentIndex = enabled.findIndex(option => option.id === current);
  if (key === 'Home') return enabled[0]?.id ?? null;
  if (key === 'End') return enabled.at(-1)?.id ?? null;
  const step = key === 'ArrowRight' || key === 'ArrowDown' ? 1 : -1;
  const nextIndex = (Math.max(currentIndex, -1) + step + enabled.length) % enabled.length;
  return enabled[nextIndex]?.id ?? null;
}

function isRadioNavigationKey(key: string) {
  return key === 'ArrowRight' || key === 'ArrowLeft' || key === 'ArrowDown' || key === 'ArrowUp' || key === 'Home' || key === 'End';
}

export function RadioGroup({ label, value, options, onChange, description, error, disabled, name, purpose = 'default' }: RadioGroupProps) {
  const id = useId();
  const generatedName = `${id}-options`;
  const describedBy = [description && `${id}-description`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  const reduceMotion = useReducedMotionPreference();
  const groupId = `${id}-layout`;
  const activation = useRef<RadioActivation>(null);
  const pendingPointerValue = useRef<string | null>(null);
  const [pointerTarget, setPointerTarget] = useState<string | null>(null);
  const enabled = enabledOptions(options, disabled);
  const tabStopId = options.some(option => !option.disabled && option.id === value) ? value : enabled[0]?.id;

  useEffect(() => {
    const target = pendingPointerValue.current;
    if (target === null) return;
    if (target !== value) {
      pendingPointerValue.current = null;
      setPointerTarget(current => current === target ? null : current);
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      if (pendingPointerValue.current !== target) return;
      pendingPointerValue.current = null;
      setPointerTarget(current => current === target ? null : current);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [value]);

  const clearPointerActivation = () => {
    window.requestAnimationFrame(() => {
      if (activation.current === 'pointer') activation.current = null;
    });
  };

  const markPointer = (option: RadioOption) => {
    if (!disabled && !option.disabled) activation.current = 'pointer';
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>, option: RadioOption) => {
    if (disabled || option.disabled) return;
    if (event.key === ' ' || event.key === 'Spacebar') {
      activation.current = 'keyboard';
      return;
    }
    if (!isRadioNavigationKey(event.key)) return;
    event.preventDefault();
    activation.current = 'keyboard';
    const nextId = nextRadioId(options, option.id, event.key, disabled);
    if (!nextId || (nextId === option.id && value === option.id)) return;
    const candidates = options
      .map(candidate => document.getElementById(`${id}-${candidate.id}`))
      .filter((element): element is HTMLInputElement => element instanceof HTMLInputElement);
    const target = candidates.find(input => input.value === nextId);
    target?.focus({ preventScroll: true });
    target?.click();
  };

  const renderOption = (option: RadioOption, index: number) => {
    const inputId = `${id}-${option.id}`;
    const selected = value === option.id;
    const optionDisabled = Boolean(disabled || option.disabled);
    const input = <input
      id={inputId}
      type="radio"
      name={name ?? generatedName}
      value={option.id}
      checked={selected}
      disabled={optionDisabled}
      tabIndex={optionDisabled ? -1 : tabStopId === option.id ? 0 : -1}
      onKeyDown={event => handleKeyDown(event, option)}
      onChange={() => {
        const source = activation.current ?? 'keyboard';
        activation.current = null;
        if (source === 'pointer' && purpose === 'default' && !reduceMotion) {
          pendingPointerValue.current = option.id;
          setPointerTarget(option.id);
        } else {
          pendingPointerValue.current = null;
          setPointerTarget(null);
        }
        onChange(option.id);
      }}
    />;

    if (purpose === 'question') {
      return <label key={option.id} className="es-radio-option" data-disabled={optionDisabled || undefined} onPointerDown={() => markPointer(option)} onPointerUp={clearPointerActivation} onPointerCancel={() => { activation.current = null; }} onBlur={clearPointerActivation}>
        {input}
        <span className="es-radio-number" aria-hidden="true">{selected ? <Icon name="Check" purpose="small" /> : index + 1}</span>
        <span>{option.label}</span>
      </label>;
    }

    return <motion.label
      key={option.id}
      className="es-radio-option"
      data-disabled={optionDisabled || undefined}
      onPointerDown={() => markPointer(option)}
      onPointerUp={clearPointerActivation}
      onPointerCancel={() => { activation.current = null; }}
      onBlur={clearPointerActivation}
      whileTap={reduceMotion || optionDisabled ? undefined : { scale: 0.92 }}
      transition={SPRING_PRESS}
    >
      {input}
      <span className="es-radio-indicator" aria-hidden="true">
        {selected && <motion.span className="es-radio-dot" layoutId={`${groupId}-selected-dot`} transition={reduceMotion || pointerTarget !== value ? { duration: 0 } : SPRING_LAYOUT} />}
      </span>
      <span>{option.label}</span>
    </motion.label>;
  };

  const optionsMarkup = options.map(renderOption);

  const fieldset = <fieldset className="es-radio-group" data-purpose={purpose} disabled={disabled} aria-describedby={describedBy} aria-invalid={Boolean(error) || undefined}>
    <legend>{label}</legend>
    <div className="es-radio-options">{optionsMarkup}</div>
    <FieldSupport id={id} description={description} error={error} />
  </fieldset>;

  return fieldset;
}

function getSelectedFiles(files: FileList | readonly File[], multiple: boolean) {
  const selected = Array.from(files);
  return multiple ? selected : selected.slice(0, 1);
}

function DocumentStack({ label }: { label?: string }) {
  return <div className="es-document-stack" aria-hidden="true">
    <div className="es-document-sheet es-document-sheet--back" />
    <div className="es-document-sheet es-document-sheet--middle" />
    <div className="es-document-sheet es-document-sheet--front">
      <Icon name="FileText" purpose="feature" />
      <span className="es-document-lines"><i /><i /><i /></span>
      {label && <span className="es-document-format">{label}</span>}
    </div>
  </div>;
}

type FileEntry = { id: string; file: File };
type PendingFileRemoval = {
  entryId: string;
  requestedFiles: File[];
  originalIndex: number;
  button: HTMLButtonElement;
};

function sameFileReferenceSequence(left: readonly File[], right: readonly File[]) {
  if (left.length !== right.length) return false;
  return left.every((file, index) => file === right[index]);
}

function reconcileFileEntries({
  id,
  files,
  previousEntries,
  nextEntryNumber,
  pendingRemoval,
}: {
  id: string;
  files: readonly File[];
  previousEntries: readonly FileEntry[];
  nextEntryNumber: number;
  pendingRemoval: PendingFileRemoval | null;
}) {
  let entriesToMatch = [...previousEntries];
  let nextNumber = nextEntryNumber;
  let confirmedRemoval: PendingFileRemoval | null = null;
  if (pendingRemoval && sameFileReferenceSequence(files, pendingRemoval.requestedFiles)) {
    entriesToMatch = entriesToMatch.filter(entry => entry.id !== pendingRemoval.entryId);
    confirmedRemoval = pendingRemoval;
  }

  const entries = files.map(file => {
    const exactIndex = entriesToMatch.findIndex(entry => entry.file === file);
    if (exactIndex >= 0) return entriesToMatch.splice(exactIndex, 1)[0]!;
    return { id: `${id}-file-${nextNumber++}`, file };
  });
  return { entries, nextEntryNumber: nextNumber, confirmedRemoval };
}

/** Controlled local file selection. Uploads, validation, merging and persistence remain consumer behavior. */
export function FileUploadField({
  label,
  files,
  onFilesChange,
  dropLabel,
  browseLabel,
  removeLabel,
  description,
  error,
  accept,
  multiple = false,
  disabled,
  purpose = 'default',
  documentLabel,
  dragLabel,
  status,
}: FileUploadFieldProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const browse = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const dragDepth = useRef(0);
  const entryLedger = useRef<FileEntry[]>([]);
  const nextEntryNumber = useRef(0);
  const pendingRemoval = useRef<PendingFileRemoval | null>(null);
  const [dragging, setDragging] = useState(false);
  const reduceMotion = useReducedMotionPreference();
  const describedBy = [description && `${id}-description`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;

  // Render-time reconciliation is pure; the ledger is committed only after the
  // tree wins the commit, so discarded concurrent/StrictMode renders cannot
  // consume an occurrence or advance the instance-local ID counter.
  const reconciliation = reconcileFileEntries({
    id,
    files,
    previousEntries: entryLedger.current,
    nextEntryNumber: nextEntryNumber.current,
    pendingRemoval: pendingRemoval.current,
  });
  const entries = reconciliation.entries;

  useLayoutEffect(() => {
    entryLedger.current = reconciliation.entries;
    nextEntryNumber.current = reconciliation.nextEntryNumber;
    const removal = reconciliation.confirmedRemoval;
    if (!removal) return;
    if (pendingRemoval.current?.entryId === removal.entryId) pendingRemoval.current = null;
    // A delayed controlled update must not steal focus from another control.
    if (document.activeElement !== removal.button && document.activeElement !== document.body) return;
    const buttons = Array.from(list.current?.querySelectorAll<HTMLButtonElement>('button') ?? []);
    const target = buttons[Math.min(removal.originalIndex, buttons.length - 1)] ?? browse.current;
    target?.focus({ preventScroll: true });
  }, [reconciliation]);

  useEffect(() => {
    if (!disabled) return;
    dragDepth.current = 0;
    setDragging(false);
  }, [disabled]);

  const selectFiles = (nextFiles: FileList | readonly File[]) => {
    // A canceled picker or a non-file drop must not erase the controlled selection.
    if (!disabled && nextFiles.length) onFilesChange(getSelectedFiles(nextFiles, multiple));
  };
  const openPicker = () => input.current?.click();
  const selectFromPicker = (event: ChangeEvent<HTMLInputElement>) => {
    try {
      if (event.currentTarget.files) selectFiles(event.currentTarget.files);
    } finally {
      // Reset on both a real selection and native cancel so the same File can be picked again.
      event.currentTarget.value = '';
    }
  };
  const enterDropzone = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!event.dataTransfer.types.includes('Files')) return;
    if (disabled) return;
    dragDepth.current += 1;
    setDragging(true);
  };
  const leaveDropzone = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  };
  const allowDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const hasFiles = event.dataTransfer.types.includes('Files');
    event.dataTransfer.dropEffect = disabled || !hasFiles ? 'none' : 'copy';
  };
  const receiveDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled || !event.dataTransfer.types.includes('Files')) return;
    dragDepth.current = 0;
    setDragging(false);
    selectFiles(event.dataTransfer.files);
  };

  const removeFile = (index: number, button: HTMLButtonElement) => {
    if (disabled) return;
    const entry = entries[index];
    if (!entry) return;
    const requestedFiles = files.filter((_, fileIndex) => fileIndex !== index);
    pendingRemoval.current = {
      entryId: entry.id,
      requestedFiles,
      originalIndex: index,
      button,
    };
    onFilesChange(requestedFiles);
  };

  return <div className="es-file-upload" data-purpose={purpose}>
    {purpose === 'default' && <span id={`${id}-label`} className="es-file-upload-label">{label}</span>}
    <div className="es-file-dropzone" data-dragging={!disabled && dragging || undefined} data-disabled={disabled || undefined} role="group" aria-labelledby={`${id}-label`} aria-describedby={describedBy} onDragEnter={enterDropzone} onDragLeave={leaveDropzone} onDragOver={allowDrop} onDrop={receiveDrop}>
      {purpose === 'document' ? <><DocumentStack label={documentLabel} /><h2 id={`${id}-label`}>{label}</h2></> : <Icon name="Paperclip" purpose="feature" />}
      <p>{!disabled && dragging && dragLabel ? dragLabel : dropLabel}</p>
      <button ref={browse} type="button" className="es-file-upload-browse" aria-describedby={describedBy} onClick={openPicker} disabled={disabled}>{browseLabel}</button>
      {purpose === 'document' && description && <p id={`${id}-description`} className="es-file-formats">{description}</p>}
      <input ref={input} className="es-visually-hidden" type="file" aria-label={label} aria-describedby={describedBy} aria-invalid={Boolean(error) || undefined} accept={accept} multiple={multiple} disabled={disabled} tabIndex={-1} onChange={selectFromPicker} />
    </div>
    {files.length > 0 && <ul ref={list} className="es-file-upload-list" aria-label={label}>{files.map((file, index) => <motion.li layout={!reduceMotion} transition={{ layout: reduceMotion ? { duration: 0 } : { duration: 0.18 } }} data-file-entry={entries[index]?.id} key={entries[index]?.id ?? `${id}-file-fallback-${index}`}>
      {purpose === 'document' && <Icon name="FileText" purpose="action" />}
      <span title={file.name}>{file.name}</span>
      <button type="button" aria-label={`${removeLabel}: ${file.name}`} disabled={disabled} onClick={event => removeFile(index, event.currentTarget)}><Icon name="X" purpose="small" /></button>
    </motion.li>)}</ul>}
    <FieldSupport id={id} description={purpose === 'default' ? description : undefined} error={error} />
    <p className="es-file-upload-status" role="status">{status}</p>
  </div>;
}
