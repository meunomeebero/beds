import { useEffect, useRef, useState } from 'react';
import { Button, DesignSystemProvider, InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator, PageHeader, Stack, Text, type InputOTPStatus } from 'beds';
import { AppShell } from './recipes';

export default function OtpPage() {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<InputOTPStatus>('idle');
  const [shortValue, setShortValue] = useState('');
  const [splitValue, setSplitValue] = useState('');
  const [rejectChanges, setRejectChanges] = useState(false);
  const [completion, setCompletion] = useState('');
  const [completionCount, setCompletionCount] = useState(0);
  const [delayedValue, setDelayedValue] = useState('');
  const delayedTimer = useRef<number | undefined>(undefined);
  const theme = new URLSearchParams(location.search).get('theme') === 'light' ? 'light' : 'dark';
  const delayed = new URLSearchParams(location.search).get('fixture') === 'delayed';
  useEffect(() => () => {
    if (delayedTimer.current !== undefined) window.clearTimeout(delayedTimer.current);
  }, []);
  const messages = { idle: 'Exemplo visual. Nenhum código é enviado ou validado.', processing: 'Verificando — estado demonstrativo.', error: 'Código inválido. Confira os dígitos e tente novamente.', success: 'Código confirmado — estado demonstrativo.' };
  return <DesignSystemProvider theme={theme} brandColor={"#ffa133"}>
    <AppShell sidebar={null} contentWidth="chat" collapsed={true} onCollapsedChange={() => {}} mobileOpen={false} onMobileOpenChange={() => {}}>
      <Stack>
        <PageHeader title="Código de verificação" description="Componente OTP do BEDS" />
        <InputOTP label="Código de acesso" value={value} onChange={(next) => { if (!rejectChanges) { setValue(next); setStatus('idle'); } }} onComplete={(next) => { setCompletionCount(count => count + 1); setCompletion(`Código de acesso completo: ${next}`); }} status={status} message={messages[status]} />
        {completion && <Text tone="secondary">{completion}</Text>}
        <Text tone="secondary">onComplete observado: {completionCount}</Text>
        <Stack gap="tight">
          <Button label="Simular verificação" onClick={() => setStatus('processing')} />
          <Button label="Simular erro" onClick={() => setStatus('error')} />
          <Button label="Simular sucesso" onClick={() => setStatus('success')} />
          <Button label="Limpar" onClick={() => { setValue(''); setStatus('idle'); setCompletion(''); }} />
          <Button label={rejectChanges ? 'Aceitar alterações' : 'Rejeitar alterações'} variant="ghost" onClick={() => setRejectChanges(current => !current)} />
        </Stack>
        <Text tone="secondary">{rejectChanges ? 'O caller está rejeitando alterações controladas; o valor visual permanece no último valor aceito.' : 'O caller controla o valor e a mensagem; completar o código não cria um estado de sucesso.'}</Text>
        {delayed && <InputOTP label="Código com aceitação atrasada" value={delayedValue} onChange={next => {
          if (delayedTimer.current !== undefined) window.clearTimeout(delayedTimer.current);
          delayedTimer.current = window.setTimeout(() => setDelayedValue(next), 120);
        }} message="Fixture de aceitação controlada após 120ms." />}
        <InputOTP label="Código curto (4 dígitos)" maxLength={4} value={shortValue} onChange={setShortValue} message="Comprimento mínimo de fixture: 4 slots." />
        <InputOTP label="Código dividido (8 dígitos)" maxLength={8} value={splitValue} onChange={setSplitValue} message="Dois grupos e um separador decorativo." >
          <InputOTPGroup>{[0, 1, 2, 3].map(index => <InputOTPSlot key={index} index={index} />)}</InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>{[4, 5, 6, 7].map(index => <InputOTPSlot key={index} index={index} />)}</InputOTPGroup>
        </InputOTP>
        <InputOTP label="Código indisponível" maxLength={4} value="12" onChange={() => {}} disabled message="Este campo está desativado nesta demonstração." />
      </Stack>
    </AppShell>
  </DesignSystemProvider>;
}
