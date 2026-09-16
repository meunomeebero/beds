import { useState } from 'react';
import { AppShell, Button, DesignSystemProvider, InputOTP, PageHeader, Stack, brands, type InputOTPStatus } from 'beds';

export default function OtpPage() {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<InputOTPStatus>('idle');
  const theme = new URLSearchParams(location.search).get('theme') === 'light' ? 'light' : 'dark';
  const messages = { idle: 'Exemplo visual. Nenhum código é enviado ou validado.', processing: 'Verificando — estado demonstrativo.', error: 'Código inválido. Confira os dígitos e tente novamente.', success: 'Código confirmado — estado demonstrativo.' };
  return <DesignSystemProvider theme={theme} brandColor={brands.curriculol}>
    <AppShell sidebar={null} contentWidth="chat" collapsed={true} onCollapsedChange={() => {}} mobileOpen={false} onMobileOpenChange={() => {}}>
      <Stack>
        <PageHeader title="Código de verificação" description="Componente OTP do BEDS" />
        <InputOTP label="Código de acesso" value={value} onChange={(next) => { setValue(next); setStatus('idle'); }} status={status} message={messages[status]} />
        <Button label="Simular verificação" onClick={() => setStatus('processing')} />
        <Button label="Simular erro" onClick={() => setStatus('error')} />
        <Button label="Simular sucesso" onClick={() => setStatus('success')} />
        <Button label="Limpar" onClick={() => { setValue(''); setStatus('idle'); }} />
      </Stack>
    </AppShell>
  </DesignSystemProvider>;
}
