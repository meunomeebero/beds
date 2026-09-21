import { Button, DesignSystemProvider, PageHeader, Stack, Toaster, toast } from 'beds';
import { AppShell } from './recipes';

export default function ToastPage() {
  const theme = new URLSearchParams(location.search).get('theme') === 'light' ? 'light' : 'dark';
  return <DesignSystemProvider theme={theme} brandColor={"#ffa133"}>
    <Toaster />
    <AppShell sidebar={null} contentWidth="chat" collapsed={true} onCollapsedChange={() => {}} mobileOpen={false} onMobileOpenChange={() => {}}>
      <Stack>
        <PageHeader title="Toast" description="Notificações temporárias e estados de processos." />
        <Button label="Informação" onClick={() => toast({ message: 'Seu currículo foi salvo.', tone: 'info' })} />
        <Button label="Processando" onClick={() => toast({ id: 'process', message: 'Gerando currículo…', tone: 'pending' })} />
        <Button label="Concluir processo" onClick={() => toast({ id: 'process', message: 'Currículo pronto para revisar.', tone: 'success' })} />
        <Button label="Com ação" onClick={() => toast({ message: 'Não foi possível concluir.', tone: 'error', action: { label: 'Tentar novamente', onClick: () => toast({ message: 'Nova tentativa iniciada.', tone: 'pending' }) } })} />
        <Button label="Várias notificações" onClick={() => { for (let index = 1; index <= 7; index++) toast({ message: `Documento de exemplo ${index}: não foi possível concluir.`, tone: 'error', action: { label: 'Tentar novamente', onClick: () => toast({ message: 'Nova tentativa iniciada.', tone: 'pending' }) } }); }} />
      </Stack>
    </AppShell>
  </DesignSystemProvider>;
}
