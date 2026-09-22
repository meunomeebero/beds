import { useEffect, useRef, useState } from 'react';
import { Button, DesignSystemProvider, Dialog, Text, TextField, TextAreaField } from 'beds';
import 'beds/styles.css';

export default function DialogHarness() {
  const [open, setOpen] = useState(false);
  const [nestedOpen, setNestedOpen] = useState(false);
  const [rejectClose, setRejectClose] = useState(false);
  const [delayedClose, setDelayedClose] = useState(false);
  const [triggerRemoved, setTriggerRemoved] = useState(false);
  const [status, setStatus] = useState('closed');
  const [draft, setDraft] = useState('');
  const closeTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  function handleOpenChange(next: boolean) {
    if (!next && rejectClose) {
      setStatus('close-rejected');
      return;
    }
    if (!next && delayedClose) {
      setStatus('close-requested');
      window.clearTimeout(closeTimer.current);
      closeTimer.current = window.setTimeout(() => {
        setOpen(false);
        setNestedOpen(false);
        setStatus('close-committed');
        closeTimer.current = undefined;
      }, 180);
      return;
    }
    window.clearTimeout(closeTimer.current);
    closeTimer.current = undefined;
    setOpen(next);
    setStatus(next ? 'open' : 'closed');
  }

  function reopenDuringExit() {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = undefined;
    setOpen(true);
    setStatus('reopened');
  }

  return <DesignSystemProvider theme="light">
    <main>
      {!triggerRemoved && <Button label="Open harness dialog" onClick={() => { setOpen(true); setStatus('open'); }} />}
      <Button label="Remove trigger" onClick={() => setTriggerRemoved(true)} />
      <Button label={rejectClose ? 'Allow close' : 'Reject close'} onClick={() => setRejectClose(value => !value)} />
      <Button label={delayedClose ? 'Commit close immediately' : 'Delay close'} onClick={() => setDelayedClose(value => !value)} />
      <p data-testid="dialog-status">{status}</p>
      <Dialog open={open} onOpenChange={handleOpenChange} title="Harness dialog" description="Controlled lifecycle probe." actions={<Button label="Commit action" onClick={() => handleOpenChange(false)} />}>
        <Text>Primary dialog content.</Text>
        <TextField label="Draft title" value={draft} onChange={setDraft} />
        <TextAreaField label="Draft body" value={draft} onChange={setDraft} />
        <Button label={rejectClose ? 'Allow close' : 'Reject close'} onClick={() => setRejectClose(value => !value)} />
        <Button label={delayedClose ? 'Commit close immediately' : 'Delay close'} onClick={() => setDelayedClose(value => !value)} />
        <Button label="Remove trigger" onClick={() => setTriggerRemoved(true)} />
        <Button label="Reopen during exit" onClick={reopenDuringExit} />
        <Button label="Open nested dialog" onClick={() => { setNestedOpen(true); setStatus('nested-open'); }} />
        <Dialog open={nestedOpen} onOpenChange={value => { setNestedOpen(value); setStatus(value ? 'nested-open' : 'open'); }} title="Nested harness dialog">
          <Text>Nested dialog content.</Text>
        </Dialog>
      </Dialog>
    </main>
  </DesignSystemProvider>;
}
