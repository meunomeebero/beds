import { useState } from 'react';
import {
  AccountMenu, AppShell, Avatar, BrandMark, Breadcrumbs, Button, ChatComposer,
  ChatLayout, ChatMessage, ContentHeader, DesignSystemProvider, Dialog, NavItem,
  RecentItem, SearchField, Select, SidebarFooter, SidebarHeader, SidebarSection,
  Stack, SuggestionRow, Text, WorkspaceTrigger, brands, type IconName, type Theme,
} from 'beds';

const prompts = [
  { title: 'Adaptar meu currículo a uma vaga', icon: 'Briefcase' },
  { title: 'Entender minha análise ATS', icon: 'ChartColumn' },
  { title: 'Revisar meu resumo profissional', icon: 'UserRound' },
] satisfies { title: string; icon: IconName }[];

const accountActions = [
  { id: 'settings', label: 'Configurações', icon: 'Settings2' },
  { id: 'integrations', label: 'Integrações', icon: 'Plug' },
  { id: 'support', label: 'Ajuda', icon: 'CircleHelp' },
] satisfies { id: string; label: string; icon: IconName }[];

const panels = {
  home: 'Início', settings: 'Configurações', integrations: 'Integrações', support: 'Ajuda',
  search: 'Buscar no espaço', resumes: 'Currículos', analyses: 'Análises',
  linkedin: 'LinkedIn', jobs: 'Buscar vagas', applications: 'Candidaturas', credits: '8 créditos',
};
type Panel = keyof typeof panels;

/** Application composition only. The existing library owns every visual choice. */
export default function LucyPage() {
  const [theme, setTheme] = useState<Theme>(new URLSearchParams(location.search).get('theme') === 'light' ? 'light' : 'dark');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [context, setContext] = useState('none');

  function openPanel(next: Panel) {
    setMobileOpen(false);
    setQuery('');
    setPanel(next);
  }
  function newConversation() {
    setPanel(null);
    setMobileOpen(false);
    setMessages([]);
    setDraft('');
    setContext('none');
  }
  function submit() {
    const message = draft.trim();
    if (!message) return;
    setMessages(previous => [...previous, message]);
    setDraft('');
  }
  const searchResults = Object.entries(panels)
    .filter(([id, label]) => id !== 'search' && label.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')));

  return <DesignSystemProvider theme={theme} onThemeChange={setTheme} brandColor={brands.curriculol}>
    <AppShell contentWidth="chat" collapsed={collapsed} onCollapsedChange={setCollapsed}
      mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} navigationLabel="Navegação"
      sidebar={<>
        <SidebarHeader search={{ label: 'Buscar no espaço', onClick: () => openPanel('search') }}>
          <AccountMenu open={accountOpen} onOpenChange={setAccountOpen}
            trigger={<WorkspaceTrigger name="Marina Costa" mark={<Avatar name="Marina Costa" purpose="workspace" />} expanded={accountOpen} onClick={() => setAccountOpen(!accountOpen)} />}
            identity={{ name: 'Marina Costa', avatar: <Avatar name="Marina Costa" /> }}
            actions={accountActions} onAction={id => openPanel(id as Panel)}
            workspaces={[{ id: 'personal', label: 'Meu espaço', mark: <Avatar name="Marina Costa" purpose="workspace" /> }]}
            activeWorkspace="personal" onWorkspaceChange={() => {}}
            theme={theme} onThemeChange={setTheme} />
        </SidebarHeader>
        <SidebarSection purpose="primary">
          <NavItem label="Início" icon="House" onClick={() => openPanel('home')} />
          <NavItem label="Lucy" icon="MessageCircle" active onClick={() => { setPanel(null); setMobileOpen(false); }} />
        </SidebarSection>
        <SidebarSection label="Seu espaço">
          <NavItem label="Currículos" icon="FileText" onClick={() => openPanel('resumes')} />
          <NavItem label="Análises" icon="ChartColumn" onClick={() => openPanel('analyses')} />
          <NavItem label="LinkedIn" icon="UserRound" onClick={() => openPanel('linkedin')} />
        </SidebarSection>
        <SidebarSection label="Oportunidades">
          <NavItem label="Buscar vagas" icon="Search" onClick={() => openPanel('jobs')} />
          <NavItem label="Candidaturas" icon="Briefcase" onClick={() => openPanel('applications')} />
        </SidebarSection>
        <SidebarSection label="Conversas" purpose="history">
          <NavItem label="Próximo passo na carreira" icon="MessageCircle" onClick={() => { setPanel(null); setMobileOpen(false); }} />
        </SidebarSection>
        <SidebarFooter><NavItem label="8 créditos" icon="Coins" onClick={() => openPanel('credits')} /></SidebarFooter>
      </>}
      header={<ContentHeader actions={<Button label="Nova conversa" icon="Plus" variant="ghost" compact onClick={newConversation} />}>
        <Breadcrumbs label="Localização" items={[{ id: 'catalog', label: 'Catálogo', href: '?view=components' }, { id: 'lucy', label: 'Lucy' }]} />
      </ContentHeader>}>
      <ChatLayout title="Como posso ajudar você?" mark={<BrandMark label="Curriculol" />}
        suggestions={messages.length ? undefined : prompts.map(prompt => <SuggestionRow key={prompt.title} icon={prompt.icon} title={prompt.title} onClick={() => setDraft(prompt.title)} />)}>
        <Stack>
          {messages.map((message, index) => <ChatMessage key={`${index}-${message}`} role="user">{message}</ChatMessage>)}
          {messages.length > 0 && <ChatMessage role="assistant">Resposta de demonstração. Nenhuma IA foi chamada.</ChatMessage>}
          <ChatComposer label="Mensagem" value={draft} onChange={setDraft} onSubmit={submit}
            placeholder="Converse com a Lucy sobre seu próximo passo…"
            onAttach={() => setContext(current => current === 'resume' ? 'none' : 'resume')}
            context={<Select label="Contexto" variant="context" value={context} onChange={setContext} options={[
              { id: 'none', label: 'Nenhum contexto' },
              { id: 'resume', label: 'Meu currículo' },
              { id: 'job', label: 'Vaga de interesse' },
            ]} />} />
        </Stack>
      </ChatLayout>
    </AppShell>
    <Dialog open={panel !== null} onOpenChange={open => { if (!open) setPanel(null); }} title={panel ? panels[panel] : ''}>
      {panel === 'search' ? <Stack>
        <SearchField label="Buscar no espaço" value={query} onChange={setQuery} placeholder="Buscar seções…" />
        {searchResults.length ? searchResults.map(([id, label]) => <RecentItem key={id} title={label} onClick={() => openPanel(id as Panel)} />) : <Text tone="secondary">Nenhum resultado encontrado.</Text>}
      </Stack> : <Stack>
        <Text>{panel === 'credits' ? 'Saldo de exemplo para visualizar os créditos no rodapé da navegação.' : 'Esta seção faz parte do esboço. Por enquanto, você pode experimentar a conversa com Lucy.'}</Text>
        <Button label="Voltar para Lucy" onClick={() => setPanel(null)} />
      </Stack>}
    </Dialog>
  </DesignSystemProvider>;
}
