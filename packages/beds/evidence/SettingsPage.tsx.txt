import { useRef, useState } from 'react';
import {
  Avatar, Button, DesignSystemProvider, Dialog, Icon, Inline,
  LoadingIndicator, NavItem, Notice, PageHeader, ResultsStatus, Select,
  SettingsForm, SettingsGroup, SettingsRow, SidebarFooter, SidebarHeader,
  SidebarSection, Stack, Switch, Tabs, Text, TextField, TextLink, ThemeToggle, } from 'beds';
import { AppShell } from './recipes';
import { confirmations, notificationGroups } from './settings-fixtures';

export default function SettingsPage() {
  const params = new URLSearchParams(location.search);
  const [theme, setTheme] = useState<'light' | 'dark'>(params.get('theme') === 'dark' ? 'dark' : 'light');
  const [section, setSection] = useState('account');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [state, setState] = useState(params.get('state') ?? 'ready');
  const [username, setUsername] = useState('luisa');
  const [draft, setDraft] = useState('luisa');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [locale, setLocale] = useState('pt-BR');
  const [sound, setSound] = useState(true);
  const [anonymous, setAnonymous] = useState(true);
  const [personalization, setPersonalization] = useState(false);
  const [notifications, setNotifications] = useState<Record<string, boolean>>(() => Object.fromEntries(notificationGroups.flatMap(group => group.items.map(item => [item.id, true]))));
  const [confirmation, setConfirmation] = useState<keyof typeof confirmations | null>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const long = params.get('preview') === 'long';
  const name = long ? 'Luísa de Albuquerque Costa e Silva' : 'Luísa Costa';
  const email = long ? 'luisa.de.albuquerque.costa.e.silva@example.com' : 'luisa@example.com';
  const dialog = confirmation ? confirmations[confirmation] : null;

  function saveUsername() {
    const normalized = draft.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,24}$/.test(normalized)) {
      setError('Use de 3 a 24 letras minúsculas, números ou sublinhado.');
      setMessage('');
      usernameRef.current?.focus();
      return;
    }
    setError('');
    setUsername(normalized);
    setDraft(normalized);
    setMessage('Nome de usuário salvo apenas nesta prévia.');
  }

  function chooseSection(next: string) {
    setSection(next);
    setMessage('');
  }

  return <DesignSystemProvider theme={theme} onThemeChange={setTheme} brandColor={"#ffa133"}>
    <AppShell contentWidth="home" collapsed={collapsed} onCollapsedChange={setCollapsed} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} navigationLabel="Menu" closeNavigationLabel="Fechar menu" sidebar={<>
      <SidebarHeader closeLabel="Fechar menu" expandLabel="Expandir menu" collapseLabel="Recolher menu"><Inline gap="tight"><Avatar name="Luísa" purpose="workspace" /><Text>Luísa</Text></Inline></SidebarHeader>
      <SidebarSection label="Sua carreira">
        <NavItem label="Candidaturas" icon="Briefcase" href={`?view=kanban&theme=${theme}`} />
        <NavItem label="Fórum" icon="MessageCircle" href={`?view=forum&theme=${theme}`} />
      </SidebarSection>
      <SidebarSection label="Sua conta">
        <NavItem label="Editar perfil com a Lucy" icon="UserRound" href={`?view=lucy&theme=${theme}`} />
        <NavItem label="MCP" icon="Plug" href={`?view=mcp&theme=${theme}`} />
        <NavItem label="Configurações" icon="Settings2" active href={`?view=settings&theme=${theme}`} />
      </SidebarSection>
      <SidebarFooter><NavItem label="Biblioteca de componentes" icon="Folder" href={`?view=components&theme=${theme}`} /></SidebarFooter>
    </>}>
      <Stack gap="section">
        <PageHeader title="Configurações" description="Seu espaço, do seu jeito." leading={<Icon name="Settings2" purpose="feature" />} />
        {state === 'error' ? <Stack><Notice title="Não foi possível carregar as configurações" description="Tente novamente. Nenhuma alteração foi perdida nesta prévia." tone="error" /><Inline><Button label="Tentar novamente" onClick={() => setState('ready')} /></Inline></Stack>
          : state === 'loading' ? <Stack><LoadingIndicator label="Carregando configurações" /><Inline><Button label="Concluir carregamento da prévia" variant="ghost" onClick={() => setState('ready')} /></Inline></Stack>
          : <Tabs label="Seções de configurações" value={section} onChange={chooseSection} variant="settings" items={[
            { id: 'account', label: 'Conta', content: <Stack gap="section">
              <SettingsGroup variant="section" title="Sua conta" description="Sua identificação no Curriculol.">
                <Inline><Avatar name={name} purpose="profile" /><Stack gap="tight"><Text variant="label">{name}</Text><Text tone="secondary">@{username}</Text></Stack></Inline>
                <SettingsForm label="Editar nome de usuário" onSubmit={saveUsername}>
                  <TextField ref={usernameRef} label="Nome de usuário" name="username" autoComplete="username" spellCheck={false} value={draft} onChange={value => { setDraft(value); setError(''); setMessage(''); }} description={error ? undefined : 'De 3 a 24 letras minúsculas, números ou sublinhado.'} error={error || undefined} />
                  <Inline><Button label="Salvar nome" type="submit" />{draft !== username && <Button label="Descartar edição" variant="ghost" onClick={() => { setDraft(username); setError(''); setMessage('Edição descartada.'); usernameRef.current?.focus(); }} />}</Inline>
                </SettingsForm>
                <SettingsRow title="E-mail" description="Usado para entrar na sua conta."><Text>{email}</Text></SettingsRow>
                <SettingsRow title="Identificador da conta"><Text tone="secondary">conta-luisa-demo</Text></SettingsRow>
              </SettingsGroup>
              <SettingsGroup variant="section" title="Seu espaço">
                <SettingsRow title="Perfil profissional" description="Experiências, habilidades e objetivos de carreira."><TextLink href={`?view=lucy&theme=${theme}`}>Editar perfil com a Lucy</TextLink></SettingsRow>
                <SettingsRow title="Aplicativos conectados" description="Gerencie as permissões dos seus assistentes de IA."><TextLink href={`?view=mcp&theme=${theme}`}>Gerenciar MCP</TextLink></SettingsRow>
              </SettingsGroup>
            </Stack> },
            { id: 'preferences', label: 'Preferências', content: <Stack gap="section">
              <SettingsGroup variant="section" title="Aparência" description="Escolha o tema mais confortável para você."><SettingsRow title="Tema do espaço" description="A mudança é aplicada nesta prévia."><ThemeToggle label="Tema do espaço" lightLabel="Claro" darkLabel="Escuro" /></SettingsRow></SettingsGroup>
              <SettingsGroup variant="section" title="Idioma e áudio">
                <SettingsRow title="Idioma" description="Preferência demonstrativa. Os textos da prévia continuam em português."><Select label="Idioma da interface" variant="field" value={locale} onChange={value => { setLocale(value); setMessage('Preferência de idioma registrada apenas nesta prévia.'); }} options={[{ id: 'pt-BR', label: 'Português (Brasil)' }, { id: 'en-US', label: 'English (US)' }]} /></SettingsRow>
                <Switch label="Efeitos sonoros" description="Sons ao interagir com a plataforma. Nenhum áudio é reproduzido nesta prévia." checked={sound} onChange={value => { setSound(value); setMessage(`Efeitos sonoros ${value ? 'ativados' : 'desativados'} apenas nesta prévia.`); }} />
              </SettingsGroup>
            </Stack> },
            { id: 'notifications', label: long ? 'Notificações de análises e documentos' : 'Notificações', content: <Stack gap="section">
              <Text tone="secondary">Escolha quais e-mails receber. Códigos de acesso e avisos essenciais de segurança continuam ativos na aplicação.</Text>
              {notificationGroups.map(group => <SettingsGroup key={group.id} variant="section" title={group.title}>{group.items.map(item => <Switch key={item.id} label={item.label} description={item.description} checked={notifications[item.id]} onChange={value => {
                setNotifications(current => ({ ...current, [item.id]: value }));
                setMessage(`Preferência de ${item.label.toLowerCase()} ${value ? 'ativada' : 'desativada'} apenas nesta prévia.`);
              }} />)}</SettingsGroup>)}
            </Stack> },
            { id: 'privacy', label: 'Privacidade', content: <Stack gap="section">
              <SettingsGroup variant="section" title="Compartilhamento de dados" description="Você escolhe o que compartilha e pode mudar de ideia depois.">
                <Switch label="Dados de uso anônimos" description="Eventos sem nome nem e-mail, para entender o uso e encontrar erros." checked={anonymous} onChange={value => { setAnonymous(value); setMessage(`Dados anônimos ${value ? 'ativados' : 'desativados'} apenas nesta prévia.`); }} />
                <Switch label="Personalização com e-mail" description="Associa dados de uso ao seu e-mail para personalizar recomendações. Opcional." checked={personalization} onChange={value => { setPersonalization(value); setMessage(`Personalização ${value ? 'ativada' : 'desativada'} apenas nesta prévia.`); }} />
              </SettingsGroup>
              <SettingsGroup variant="section" title="Seus dados">
                <SettingsRow title="Memória da Lucy" description="O resumo usado para reconhecer você nas próximas conversas."><Button label="Limpar memória" onClick={() => setConfirmation('memory')} /></SettingsRow>
                <SettingsRow title="Documentos legais" description="Consulte como seus dados são tratados."><Inline gap="tight"><Button label="Política de privacidade" variant="ghost" onClick={() => setConfirmation('privacy')} /><Button label="Termos de uso" variant="ghost" onClick={() => setConfirmation('terms')} /></Inline></SettingsRow>
              </SettingsGroup>
              <SettingsGroup variant="section" title="Excluir conta" description="Uma ação definitiva na aplicação. Nenhum dado real é afetado nesta prévia."><Inline><Button label="Excluir conta" onClick={() => setConfirmation('delete')} /></Inline></SettingsGroup>
            </Stack> },
          ]} />}
        <ResultsStatus>{message || 'Prévia local · Nenhuma alteração é enviada à sua conta.'}</ResultsStatus>
      </Stack>
    </AppShell>
    <Dialog open={Boolean(dialog)} onOpenChange={open => { if (!open) setConfirmation(null); }} title={dialog?.title ?? 'Confirmação'} description={dialog?.description} actions={<Inline>
      <Button label={dialog?.action ? 'Cancelar' : 'Fechar'} onClick={() => setConfirmation(null)} />
      {dialog?.action && <Button label={dialog.action} onClick={() => { setMessage(confirmation === 'memory' ? 'Limpeza simulada. Nenhuma memória foi apagada.' : 'Exclusão simulada. Sua conta permanece intacta.'); setConfirmation(null); }} />}
    </Inline>} />
  </DesignSystemProvider>;
}
