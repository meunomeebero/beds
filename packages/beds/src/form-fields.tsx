import { useId, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { Icon } from './foundation';
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

export function RadioGroup({ label, value, options, onChange, description, error, disabled, name, purpose = 'default' }: RadioGroupProps) {
  const id = useId();
  const generatedName = useId();
  const describedBy = [description && `${id}-description`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;

  return <fieldset className="es-radio-group" data-purpose={purpose} disabled={disabled} aria-describedby={describedBy} aria-invalid={Boolean(error) || undefined}>
    <legend>{label}</legend>
    <div className="es-radio-options">
      {options.map((option, index) => <label key={option.id} className="es-radio-option" data-disabled={option.disabled || purpose === 'question' && disabled || undefined}>
        <input type="radio" name={name ?? generatedName} value={option.id} checked={value === option.id} disabled={option.disabled} onChange={() => onChange(option.id)} />
        {purpose === 'question' ? <span className="es-radio-number" aria-hidden="true">{value === option.id ? <Icon name="Check" purpose="small" /> : index + 1}</span> : <span className="es-radio-indicator" aria-hidden="true"><span /></span>}
        <span>{option.label}</span>
      </label>)}
    </div>
    <FieldSupport id={id} description={description} error={error} />
  </fieldset>;
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
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const describedBy = [description && `${id}-description`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  const selectFiles = (nextFiles: FileList | readonly File[]) => {
    // A canceled picker or a non-file drop must not erase the controlled selection.
    if (!disabled && nextFiles.length) onFilesChange(getSelectedFiles(nextFiles, multiple));
  };
  const openPicker = () => input.current?.click();
  const selectFromPicker = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files) selectFiles(event.currentTarget.files);
    event.currentTarget.value = '';
  };
  const enterDropzone = (event: DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes('Files')) return;
    event.preventDefault();
    if (disabled) return;
    dragDepth.current += 1;
    setDragging(true);
  };
  const leaveDropzone = (event: DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  };
  const allowDrop = (event: DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes('Files')) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = disabled ? 'none' : 'copy';
  };
  const receiveDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    selectFiles(event.dataTransfer.files);
  };

  const removeFile = (index: number, button: HTMLButtonElement) => {
    const row = button.closest('li');
    const next = row?.nextElementSibling ?? row?.previousElementSibling;
    const target = next?.querySelector('button') ?? browse.current;
    onFilesChange(files.filter((_, fileIndex) => fileIndex !== index));
    target?.focus();
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
    {files.length > 0 && <ul className="es-file-upload-list" aria-label={label}>{files.map((file, index) => <li key={`${file.name}-${file.size}-${file.lastModified}-${index}`}>
      {purpose === 'document' && <Icon name="FileText" purpose="action" />}
      <span title={file.name}>{file.name}</span>
      <button type="button" aria-label={`${removeLabel}: ${file.name}`} disabled={disabled} onClick={event => removeFile(index, event.currentTarget)}><Icon name="X" purpose="small" /></button>
    </li>)}</ul>}
    <FieldSupport id={id} description={purpose === 'default' ? description : undefined} error={error} />
    <p className="es-file-upload-status" role="status">{status}</p>
  </div>;
}
