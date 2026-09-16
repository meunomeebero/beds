import { useState } from 'react';
import {
  AccountMenu, AppShell, Avatar, BrandMark, Breadcrumbs, Button, ChatComposer,
  ChatMessage, ChatOptions, ChatThread, ContentHeader, DesignSystemProvider, Dialog, FileUploadField, Inline, NavItem,
  RecentItem, SearchField, SidebarFooter, SidebarHeader, SidebarSection,
  Stack, Text, WorkspaceTrigger, brands, type ChatOption, type ComposerAttachment, type IconName, type Theme,
} from 'beds';
import { resumeAccept, resumeSelectionError } from './resume-upload';

const choices = [
  { id: 'linkedin', label: 'Importar dados do LinkedIn', description: 'Comece com as informações do seu perfil.', icon: 'Globe' },
  { id: 'experience', label: 'Descrever experiências', description: 'Conte sua trajetória em uma conversa.', icon: 'MessageCircle' },
  { id: 'resume', label: 'Importar currículo', description: 'Use um currículo que você já tem.', icon: 'FileText' },
] satisfies ChatOption[];
type Step = 'choose' | 'linkedin' | 'experience' | 'resume' | 'conversation';
type Message = { role: 'user' | 'assistant'; text: string };
const attachmentPreview: ComposerAttachment[] = [
  { id: 'example-resume', name: 'currículo.pdf', kind: 'document', removeLabel: 'Remover currículo.pdf' },
  { id: 'example-portfolio', name: 'portfólio.png', kind: 'image', removeLabel: 'Remover portfólio.png' },
  { id: 'example-results', name: 'resultados.xlsx', kind: 'spreadsheet', removeLabel: 'Remover resultados.xlsx' },
];
function attachmentFromFile(file: File): ComposerAttachment {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const kind = file.type.startsWith('image/') ? 'image'
    : ['xls', 'xlsx', 'csv'].includes(extension ?? '') ? 'spreadsheet'
    : ['pdf', 'doc', 'docx', 'txt'].includes(extension ?? '') ? 'document' : 'file';
  return { id: crypto.randomUUID(), name: file.name, kind, removeLabel: `Remover ${file.name}` };
}
const stepReplies = {
  linkedin: 'Vamos começar pelo seu LinkedIn. Selecione o PDF do perfil para experimentar esta etapa.',
  experience: 'Me conte sobre uma experiência: o que você fazia, em qual empresa e quais resultados ajudou a alcançar. Pode escrever do seu jeito.',
  resume: 'Selecione um currículo em PDF ou Word (.docx) para experimentar esta etapa. Depois, você poderá revisar as informações antes de usá-las no perfil.',
};

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
  const preview = new URLSearchParams(location.search).get('preview');
  const [theme, setTheme] = useState<Theme>(new URLSearchParams(location.search).get('theme') === 'light' ? 'light' : 'dark');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState<Step>(preview === 'loading' ? 'experience' : preview === 'attachments' ? 'conversation' : 'choose');
  const [attachments, setAttachments] = useState<ComposerAttachment[]>(preview === 'attachments' ? attachmentPreview : []);
  const [files, setFiles] = useState<{ linkedin: File[]; resume: File[] }>({ linkedin: [], resume: [] });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(new URLSearchParams(location.search).get('preview') === 'loading');
  const [failNext, setFailNext] = useState(new URLSearchParams(location.search).get('preview') === 'error');
  const [resetOpen, setResetOpen] = useState(false);
  const [revision, setRevision] = useState(0);
  const [announcement, setAnnouncement] = useState('');

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
    setFiles({ linkedin: [], resume: [] });
    setAttachments([]);
    setStep('choose');
    setError('');
    setBusy(false);
    setResetOpen(false);
    setRevision(value => value + 1);
    setAnnouncement('Nova prévia iniciada. Escolha como começar.');
  }
  function submit() {
    const message = draft.trim();
    if (busy) return;
    if (!message && !attachments.length) { setError('Descreva uma experiência ou anexe um arquivo para continuar.'); return; }
    if (failNext) {
      setFailNext(false);
      setError('Falha simulada. Seu texto e seus anexos foram mantidos; envie novamente para continuar a prévia.');
      return;
    }
    const attachmentNames = attachments.map(item => item.name).join(', ');
    const text = [message, attachmentNames && `Anexos: ${attachmentNames}`].filter(Boolean).join('\n\n');
    const reply = attachments.length
      ? 'Os anexos apareceram nesta prévia, mas não foram lidos nem enviados. Você pode continuar descrevendo suas experiências.'
      : 'Para completar seu relato, conte um projeto ou resultado de que você se orgulha. O que mudou com a sua contribuição?';
    setMessages(previous => [...previous, { role: 'user', text }, { role: 'assistant', text: reply }]);
    setDraft('');
    setAttachments([]);
    setError('');
    setStep('conversation');
    setAnnouncement('Resposta de demonstração disponível na conversa.');
  }
  function choose(id: string) {
    if (id !== 'linkedin' && id !== 'experience' && id !== 'resume') return;
    const choice = choices.find(item => item.id === id)!;
    setMessages(previous => [...previous, { role: 'user', text: choice.label }, { role: 'assistant', text: stepReplies[id] }]);
    setStep(id);
    setError('');
    setAnnouncement(stepReplies[id]);
  }
  function returnToChoices() { setStep('choose'); setError(''); setAnnouncement('Escolha outra forma de adicionar suas experiências. Seus rascunhos foram mantidos.'); }
  function attachFiles(selected: File[]) {
    if (selected.some(file => file.size === 0)) {
      setError('Selecione arquivos que não estejam vazios. O rascunho e os anexos anteriores foram mantidos.');
      return;
    }
    setAttachments(previous => [...previous, ...selected.map(attachmentFromFile)]);
    setError('');
    setAnnouncement(`${selected.length} ${selected.length === 1 ? 'arquivo adicionado' : 'arquivos adicionados'} à prévia. Nada foi enviado.`);
  }
  function selectFiles(next: File[]) {
    if (step !== 'linkedin' && step !== 'resume') return;
    const file = next[0];
    if (step === 'resume') {
      const problem = resumeSelectionError(next);
      if (problem) {
        setError(files.resume.length ? `${problem} O currículo anterior foi mantido.` : problem);
        return;
      }
    }
    if (step === 'linkedin' && file && (!file.name.toLowerCase().endsWith('.pdf') || file.size === 0)) {
      setFiles(previous => ({ ...previous, [step]: [] }));
      setError('Selecione um PDF que não esteja vazio para continuar a prévia.');
      return;
    }
    setFiles(previous => ({ ...previous, [step]: next }));
    setError('');
  }
  function continueFile() {
    if (step !== 'linkedin' && step !== 'resume') return;
    const file = files[step][0];
    if (!file) { setError(step === 'resume' ? 'Selecione um currículo em PDF ou DOCX para continuar a prévia.' : 'Selecione um PDF para continuar a prévia.'); return; }
    setAttachments(previous => [...previous, attachmentFromFile(file)]);
    setMessages(previous => [...previous, { role: 'user', text: file.name }, { role: 'assistant', text: 'O arquivo foi selecionado apenas nesta prévia, sem leitura ou envio. Na aplicação integrada, suas experiências aparecerão aqui para revisão.' }]);
    setStep('conversation');
    setError('');
    setAnnouncement('Arquivo selecionado na prévia. Nada foi importado ou enviado.');
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
      header={<ContentHeader><Inline align="between">
        <Breadcrumbs label="Localização" items={[{ id: 'catalog', label: 'Catálogo', href: '?view=components' }, { id: 'lucy', label: 'Lucy' }]} />
        <Button label="Nova conversa" icon="Plus" variant="ghost" compact onClick={() => messages.length || draft || attachments.length || files.linkedin.length || files.resume.length ? setResetOpen(true) : newConversation()} />
      </Inline></ContentHeader>}>
      <ChatThread title="Conversa com Lucy" stepKey={`${step}-${revision}`} announcement={announcement}
        notice="Prévia de interface. Sem IA, envio de arquivos ou alterações no perfil."
        interaction={step === 'choose'
          ? <ChatOptions title="Como você prefere começar?" options={choices} onChoose={choose} />
          : <Stack>
            {step === 'linkedin' || step === 'resume' ? <Stack>
              <FileUploadField purpose={step === 'resume' ? 'document' : 'default'} documentLabel="PDF / DOCX" label={step === 'linkedin' ? 'PDF do LinkedIn' : 'Importar currículo'} files={files[step]} onFilesChange={selectFiles}
                dropLabel={step === 'resume' ? 'Arraste seu currículo ou escolha um arquivo para começar.' : 'Arraste um PDF ou selecione um arquivo'}
                dragLabel="Solte o arquivo aqui para selecionar." browseLabel={step === 'resume' ? 'Selecionar currículo' : 'Selecionar PDF'} removeLabel="Remover arquivo" accept={step === 'resume' ? resumeAccept : '.pdf,application/pdf'} multiple={step === 'resume'}
                description={step === 'linkedin' ? 'Use o PDF exportado do seu perfil. Nesta prévia, o arquivo não é lido nem enviado.' : 'PDF ou Word (.docx) · até 5 MB · seleção local, sem envio'} error={error || undefined} />
              <Inline gap="tight"><Button label="Continuar prévia" onClick={continueFile} /><Button label="Escolher outra opção" variant="ghost" onClick={returnToChoices} /></Inline>
            </Stack> : <Stack gap="tight">
              <ChatComposer purpose="guided" label="Suas experiências" value={draft} onChange={value => { setDraft(value); if (error) setError(''); }} onSubmit={submit}
                placeholder={attachments.length ? 'Ex.: destaque os resultados destes projetos…' : 'Ex.: trabalhei com atendimento por três anos…'} sendLabel="Enviar mensagem" cancelLabel="Interromper prévia" error={error || undefined}
                attachments={attachments} attachmentsLabel="Anexos da mensagem" attachLabel="Anexar arquivos" attachmentPicker={{ multiple: true, onSelect: attachFiles }}
                onRemoveAttachment={id => { const removed = attachments.find(item => item.id === id); setAttachments(previous => previous.filter(item => item.id !== id)); setError(''); setAnnouncement(`${removed?.name ?? 'Anexo'} removido da mensagem. O arquivo original não foi alterado.`); }}
                busy={busy} onCancel={() => { setBusy(false); setAnnouncement('Carregamento de exemplo interrompido. Você pode escrever.'); }} />
              <Inline><Button label="Escolher outra opção" variant="ghost" onClick={returnToChoices} disabled={busy} />{busy && <Text>Carregamento de exemplo…</Text>}</Inline>
            </Stack>}
          </Stack>}>
        <ChatMessage role="assistant" purpose="thread" author="Lucy" mark={<BrandMark label="Curriculol" />}>
          <Stack><Text variant="body">Olá, Marina. Vamos dar forma à sua trajetória?</Text><Text variant="body">Podemos começar pelo que você já tem ou conversar sobre suas experiências. Depois, você revisa tudo com calma.</Text></Stack>
        </ChatMessage>
        {messages.map((message, index) => <ChatMessage key={index} role={message.role} purpose="thread" author={message.role === 'assistant' ? 'Lucy' : undefined} mark={message.role === 'assistant' ? <BrandMark label="Curriculol" /> : undefined}>{message.text}</ChatMessage>)}
      </ChatThread>
    </AppShell>
    <Dialog open={resetOpen} onOpenChange={setResetOpen} title="Começar uma nova prévia?" description="A conversa, os rascunhos e os arquivos selecionados nesta prévia serão removidos.">
      <Inline><Button label="Manter conversa" variant="ghost" onClick={() => setResetOpen(false)} /><Button label="Começar nova prévia" onClick={newConversation} /></Inline>
    </Dialog>
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
