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
};

function FieldSupport({ id, description, error }: { id: string; description?: string; error?: string }) {
  return <>{description && <p id={`${id}-description`} className="es-field-description">{description}</p>}{error && <p id={`${id}-error`} className="es-field-error" role="alert"><Icon name="AlertCircle" purpose="small" />{error}</p>}</>;
}

export function RadioGroup({ label, value, options, onChange, description, error, disabled, name }: RadioGroupProps) {
  const id = useId();
  const generatedName = useId();
  const describedBy = [description && `${id}-description`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;

  return <fieldset className="es-radio-group" disabled={disabled} aria-describedby={describedBy} aria-invalid={Boolean(error) || undefined}>
    <legend>{label}</legend>
    <div className="es-radio-options">
      {options.map(option => <label key={option.id} className="es-radio-option" data-disabled={option.disabled || undefined}>
        <input type="radio" name={name ?? generatedName} value={option.id} checked={value === option.id} disabled={option.disabled} onChange={() => onChange(option.id)} />
        <span className="es-radio-indicator" aria-hidden="true"><span /></span>
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
}: FileUploadFieldProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const describedBy = [description && `${id}-description`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  const selectFiles = (nextFiles: FileList | readonly File[]) => onFilesChange(getSelectedFiles(nextFiles, multiple));
  const openPicker = () => input.current?.click();
  const selectFromPicker = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files) selectFiles(event.currentTarget.files);
    event.currentTarget.value = '';
  };
  const enterDropzone = (event: DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
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
    if (disabled) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };
  const receiveDrop = (event: DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    selectFiles(event.dataTransfer.files);
  };

  return <div className="es-file-upload">
    <span id={`${id}-label`} className="es-file-upload-label">{label}</span>
    <div className="es-file-dropzone" data-dragging={dragging || undefined} data-disabled={disabled || undefined} role="group" aria-labelledby={`${id}-label`} aria-describedby={describedBy} onDragEnter={enterDropzone} onDragLeave={leaveDropzone} onDragOver={allowDrop} onDrop={receiveDrop}>
      <Icon name="Paperclip" purpose="feature" />
      <p>{dropLabel}</p>
      <button type="button" className="es-file-upload-browse" onClick={openPicker} disabled={disabled}>{browseLabel}</button>
      <input ref={input} className="es-visually-hidden" type="file" aria-label={label} aria-describedby={describedBy} aria-invalid={Boolean(error) || undefined} accept={accept} multiple={multiple} disabled={disabled} tabIndex={-1} onChange={selectFromPicker} />
    </div>
    {files.length > 0 && <ul className="es-file-upload-list" aria-label={label}>{files.map((file, index) => <li key={`${file.name}-${file.size}-${file.lastModified}-${index}`}>
      <span>{file.name}</span>
      <button type="button" aria-label={`${removeLabel}: ${file.name}`} disabled={disabled} onClick={() => onFilesChange(files.filter((_, fileIndex) => fileIndex !== index))}><Icon name="X" purpose="small" /></button>
    </li>)}</ul>}
    <FieldSupport id={id} description={description} error={error} />
  </div>;
}
