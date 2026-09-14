import { useState } from 'react';
import {
  AccountMenu, AppShell, Avatar, Button, CodeSnippet,
  DataList, DesignSystemProvider, EmptyState, Icon, Inline, NavItem, Notice,
  PageContentHeader, SectionHeader, SegmentedControl, SidebarFooter, SidebarHeader,
  SidebarSection, Stack, Surface, Tabs, Text, TextField, WorkspaceTrigger,
  brands, type IconName, type Theme,
} from 'beds';

const accountActions = [
  { id: 'settings', label: 'Configurações', icon: 'Settings2' },
  { id: 'integrations', label: 'Integrações', icon: 'Plug' },
  { id: 'support', label: 'Ajuda', icon: 'CircleHelp' },
] satisfies { id: string; label: string; icon: IconName }[];

const codexAdd = "codex mcp add curriculol --url 'https://api.curricu.lol/mcp' --oauth-client-id 'agent_<client-id>'";
const codexLogin = "codex mcp login curriculol --scopes 'profile.read,credits.read,job.search,job.apply,email.send'";
const codexSetup = `${codexAdd} && ${codexLogin}`;

function validRedirectUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || (url.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(url.hostname));
  } catch {
    return false;
  }
}

/** Application composition only. OAuth and MCP calls remain outside this local preview. */
export default function McpPage() {
  const [theme, setTheme] = useState<Theme>(new URLSearchParams(location.search).get('theme') === 'light' ? 'light' : 'dark');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [policy, setPolicy] = useState('confirm');
  const [client, setClient] = useState('claude');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [registeredRedirect, setRegisteredRedirect] = useState('');
  const [attemptedRedirect, setAttemptedRedirect] = useState(false);
  const [status, setStatus] = useState('');

  const redirectError = attemptedRedirect && !validRedirectUrl(redirectUrl)
    ? 'Use uma URL HTTPS ou o callback local 127.0.0.1/localhost.'
    : undefined;

  function showStatus(message: string) {
    setStatus(message);
    setMobileOpen(false);
  }

  function addRedirectUrl() {
    setAttemptedRedirect(true);
    if (!validRedirectUrl(redirectUrl)) return;
    setRegisteredRedirect(redirectUrl);
    setStatus('URL de retorno adicionada apenas nesta prévia. Nenhuma aplicação OAuth foi registrada.');
  }

  const clientTabs = [
    {
      id: 'claude', label: 'Claude', content: <Stack>
        <Text>1. Cole o endpoint remoto no terminal.</Text>
        <Text>2. Autorize o acesso na janela que o Claude abrir.</Text>
        <CodeSnippet label="Adicionar servidor" value="https://api.curricu.lol/mcp" />
        <Text tone="secondary">O Curriculol estará disponível nas sessões do Claude dentro dos escopos autorizados.</Text>
      </Stack>,
    },
    {
      id: 'chatgpt', label: 'ChatGPT', content: <Stack>
        <Text>Adicione o endpoint remoto ao conector MCP e conclua o consentimento no navegador.</Text>
        <CodeSnippet label="Endpoint MCP" value="https://api.curricu.lol/mcp" />
      </Stack>,
    },
    {
      id: 'codex', label: 'Codex', content: <Stack>
        <Text>Copie o comando e conclua o consentimento na janela que o Codex abrir.</Text>
        <CodeSnippet label="Conectar no Codex" value={codexSetup} />
        <Text tone="secondary">O Curriculol estará disponível nas sessões do Codex dentro dos escopos autorizados.</Text>
      </Stack>,
    },
    {
      id: 'cursor', label: 'Cursor', content: <Stack>
        <Text>Registre o endpoint remoto no Cursor e prossiga com o consentimento no navegador.</Text>
        <CodeSnippet label="Endpoint MCP" value="https://api.curricu.lol/mcp" />
      </Stack>,
    },
    {
      id: 'other', label: 'Outros', content: <Stack>
        <Text>Use um cliente compatível com Streamable HTTP MCP e OAuth 2.1 com PKCE.</Text>
        <CodeSnippet label="Endpoint MCP" value="https://api.curricu.lol/mcp" />
      </Stack>,
    },
  ];

  return <DesignSystemProvider theme={theme} onThemeChange={setTheme} brandColor={brands.curriculol}>
    <AppShell contentWidth="home" collapsed={collapsed} onCollapsedChange={setCollapsed}
      mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} navigationLabel="Navegação"
      sidebar={<>
        <SidebarHeader search={{ label: 'Buscar no espaço', onClick: () => showStatus('A busca é apenas demonstrativa nesta composição.') }}>
          <AccountMenu open={accountOpen} onOpenChange={setAccountOpen}
            trigger={<WorkspaceTrigger name="Marina Costa" mark={<Avatar name="Marina Costa" purpose="workspace" />} expanded={accountOpen} onClick={() => setAccountOpen(!accountOpen)} />}
            identity={{ name: 'Marina Costa', avatar: <Avatar name="Marina Costa" /> }}
            actions={accountActions} onAction={id => showStatus(`${accountActions.find(action => action.id === id)?.label ?? 'Ação'} é uma prévia local.`)}
            workspaces={[{ id: 'personal', label: 'Meu espaço', mark: <Avatar name="Marina Costa" purpose="workspace" /> }]}
            activeWorkspace="personal" onWorkspaceChange={() => showStatus('A troca de espaço não foi conectada nesta prévia.')}
            theme={theme} onThemeChange={setTheme} />
        </SidebarHeader>
        <SidebarSection purpose="primary">
          <NavItem label="Início" icon="House" href="?view=components" />
          <NavItem label="Lucy" icon="MessageCircle" href="?view=lucy" />
        </SidebarSection>
        <SidebarSection label="Seu espaço">
          <NavItem label="Currículos" icon="FileText" onClick={() => showStatus('Currículos é uma seção demonstrativa nesta composição.')} />
          <NavItem label="Análises" icon="ChartColumn" onClick={() => showStatus('Análises é uma seção demonstrativa nesta composição.')} />
          <NavItem label="LinkedIn" icon="UserRound" onClick={() => showStatus('LinkedIn é uma seção demonstrativa nesta composição.')} />
          <NavItem label="MCP" icon="Plug" active onClick={() => showStatus('Você já está na prévia do MCP.')} />
        </SidebarSection>
        <SidebarSection label="Oportunidades">
          <NavItem label="Buscar vagas" icon="Search" onClick={() => showStatus('Buscar vagas é uma seção demonstrativa nesta composição.')} />
          <NavItem label="Candidaturas" icon="Briefcase" onClick={() => showStatus('Candidaturas é uma seção demonstrativa nesta composição.')} />
        </SidebarSection>
        <SidebarSection label="Conversas" purpose="history">
          <NavItem label="Próximo passo na carreira" icon="MessageCircle" href="?view=lucy" />
        </SidebarSection>
        <SidebarFooter><NavItem label="8 créditos" icon="Coins" onClick={() => showStatus('O saldo exibido é sintético e não foi consultado.')} /></SidebarFooter>
      </>}
      header={<PageContentHeader title="MCP do Curriculol" description="Conecte aplicativos de IA ao seu espaço." leading={<Icon name="Plug" purpose="feature" />} actions={<Button label="Guia de configuração" icon="FileText" variant="ghost" compact onClick={() => showStatus('Esta página reúne o guia de configuração demonstrativo.')} />} />}>
      <Stack gap="section">
        {status && <Notice title="Prévia local" description={status} onDismiss={() => setStatus('')} />}

        <Surface>
          <Inline align="between">
            <Stack gap="tight">
              <Text variant="section-title">Aprovação para alterações</Text>
              <Text tone="secondary">Por padrão, pessoas com permissão de edição aplicam alterações diretamente. Seus limites, registros e proteções continuam ativos em qualquer escolha.</Text>
            </Stack>
            <SegmentedControl label="Política de aprovação" variant="joined" value={policy} onChange={setPolicy} options={[
              { id: 'confirm', label: 'Pedir aprovação' },
              { id: 'scoped', label: 'Aplicar diretamente' },
            ]} />
          </Inline>
        </Surface>

        <Stack>
          <SectionHeader title="Conecte seu espaço com aplicativos de IA" />
          <Tabs label="Aplicativos de IA" variant="connection" value={client} onChange={setClient} items={clientTabs} />
        </Stack>

        <Stack>
          <SectionHeader title="URLs de redirecionamento OAuth" />
          <Surface><Stack gap="tight">
            <TextField label="URL de redirecionamento OAuth" purpose="connection" value={redirectUrl} onChange={value => { setRedirectUrl(value); setAttemptedRedirect(false); }} error={redirectError} placeholder="https://exemplo.com/oauth/callback" />
            <Inline><Button label="Adicionar" purpose="connection" onClick={addRedirectUrl} /><Button label="Usar callback local" variant="ghost" onClick={() => { setRedirectUrl('http://127.0.0.1/callback'); setAttemptedRedirect(false); }} /></Inline>
          </Stack></Surface>
          {registeredRedirect && <DataList label="URLs permitidas nesta prévia"><Text variant="option">{registeredRedirect}</Text></DataList>}
        </Stack>

        <Stack>
          <SectionHeader title="Credenciais do cliente" />
          {registeredRedirect ? <EmptyState title="Nenhuma credencial ativa" description="Crie credenciais depois de registrar o callback OAuth." icon="Plug" action={{ label: 'Simular criação de credenciais', onClick: () => setStatus('Nenhuma credencial foi criada. Esta é uma prévia visual; a criação real exige uma aplicação registrada.') }} /> : <EmptyState title="Adicione uma URL de retorno" description="As credenciais ficam disponíveis depois de registrar uma URL OAuth permitida." icon="Plug" />}
        </Stack>
      </Stack>
    </AppShell>
  </DesignSystemProvider>;
}
