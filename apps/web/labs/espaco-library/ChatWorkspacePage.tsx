import { useState } from 'react';
import { AppShell, Button, ChatWorkspace, DesignSystemProvider, Inline, PageHeader, Stack, brands, type ChatWorkspaceMessage, type Theme } from 'beds';

const initialMessages: readonly ChatWorkspaceMessage[] = [
  { id: 'assistant-welcome', role: 'assistant', content: 'Posso ajudar você a comparar oportunidades, organizar uma candidatura ou revisar um próximo passo.' },
];

/** Catalog-only controlled fixture. It does not create a session or contact an agent. */
export default function ChatWorkspacePage() {
  const [theme, setTheme] = useState<Theme>(() => new URLSearchParams(location.search).get('theme') === 'dark' ? 'dark' : 'light');
  const [messages, setMessages] = useState<readonly ChatWorkspaceMessage[]>(initialMessages);
  const [draft, setDraft] = useState('');
  const [state, setState] = useState<'ready' | 'streaming'>('ready');
  const [error, setError] = useState<string | undefined>();

  function sendTurn(value: string) {
    setMessages(previous => [...previous, { id: `user-${previous.length}`, role: 'user', content: value }, { id: `assistant-${previous.length}`, role: 'assistant', state: 'streaming', content: 'Resposta incremental de demonstração. Nenhum serviço foi chamado.' }]);
    setDraft('');
    setError(undefined);
    setState('streaming');
  }
  function cancelTurn() {
    setMessages(previous => previous.map(message => message.state === 'streaming' ? { ...message, state: 'complete', content: 'A resposta de demonstração foi interrompida. Você pode escrever outra mensagem.' } : message));
    setState('ready');
  }
  function showError() {
    setMessages(previous => previous.map(message => message.state === 'streaming' ? { ...message, state: 'complete' } : message));
    setState('ready');
    setError('Não foi possível concluir esta resposta de demonstração. Seu rascunho foi mantido; tente novamente quando quiser.');
  }
  function retryTurn() {
    setError(undefined);
    setState('streaming');
    setMessages(previous => [...previous, { id: `assistant-retry-${previous.length}`, role: 'assistant', state: 'streaming', content: 'Nova tentativa de demonstração em andamento. Nenhum pedido de rede foi realizado.' }]);
  }
  function reset() {
    setMessages(initialMessages);
    setDraft('');
    setState('ready');
    setError(undefined);
  }

  return <DesignSystemProvider theme={theme} onThemeChange={setTheme} brandColor={brands.curriculol}>
    <AppShell sidebar={null} contentWidth="chat" collapsed={true} onCollapsedChange={() => {}} mobileOpen={false} onMobileOpenChange={() => {}}>
      <Stack gap="section">
        <PageHeader title="Chat workspace" description="Transcript controlado, resposta incremental e recuperação local. Sem sessão, IA ou rede." />
        <ChatWorkspace label="Conversa de demonstração com Lucy" title="Lucy" messages={messages} draft={draft} onDraftChange={setDraft} onSubmit={sendTurn} state={state} onCancel={cancelTurn} error={error ? { message: error } : undefined} onRetry={retryTurn} emptyState="Escreva uma mensagem para iniciar esta demonstração." composerLabel="Mensagem" placeholder="Ex.: quais experiências devo destacar?" sendLabel="Enviar mensagem" cancelLabel="Interromper resposta" retryLabel="Tentar novamente" streamingLabel="Respondendo" />
        <Inline><Button label="Mostrar erro recuperável" variant="ghost" onClick={showError} /><Button label="Reiniciar demonstração" variant="ghost" onClick={reset} /></Inline>
      </Stack>
    </AppShell>
  </DesignSystemProvider>;
}
