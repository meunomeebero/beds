import { AppShell, Button, Conversation, ConversationBubble, DesignSystemProvider, PageHeader, Stack, brands } from 'beds';

export default function ConversationPage() {
  const theme = new URLSearchParams(location.search).get('theme') === 'light' ? 'light' : 'dark';
  return <DesignSystemProvider theme={theme} brandColor={brands.curriculol}>
    <AppShell sidebar={null} contentWidth="chat" collapsed={true} onCollapsedChange={() => {}} mobileOpen={false} onMobileOpenChange={() => {}}>
      <Stack>
        <PageHeader title="Conversa" description="Mensagens, horários e reações em uma composição única." />
        <Conversation label="Conversa com Lucy">
          <ConversationBubble role="assistant" sentAt="10:14">Encontrei três vagas compatíveis com seu perfil. Quer revisar a primeira?</ConversationBubble>
          <ConversationBubble role="user" sentAt="10:15">Sim, mostre os pontos mais importantes.</ConversationBubble>
          <ConversationBubble role="assistant" sentAt="10:15" reactions={<Button label="Útil" variant="ghost" compact onClick={() => {}} />}>A vaga prioriza experiência com produto, pesquisa e análise de dados.</ConversationBubble>
        </Conversation>
      </Stack>
    </AppShell>
  </DesignSystemProvider>;
}
