import { useState, type ReactNode } from 'react';
import {
  AccountMenu, AppShell, Avatar, Badge, BrandMark, Breadcrumbs, Button, ChatComposer, ChatLayout, ChatMessage, Checkbox, ContentHeader,
  CodeSnippet, DataList, DataTable, FilterSelect, HelpLabel, Pagination, CommandPalette, DesignSystemProvider, Dialog, Divider, DropdownMenu, EmptyState, Icon, IconButton, Inline, IntegrationRow, LoadingIndicator, Metric, NavItem, Notice,
  PageContentHeader, PageHeader, PlanCard, ProgressBar, RecentItem, SearchField, SectionHeader, SegmentedControl, SegmentedMeter, Select, SettingsGroup, SettingsRow,
  ResponsiveGrid, SidebarFooter, SidebarHeader, SidebarSection, Skeleton, Stack, StatusDot, SuggestionRow, Surface, Switch, Tabs, Text, TextAreaField,
  TextField, ThemeToggle, Tooltip, WorkspaceTrigger, brands, geometry, neutrals, themes, typography,
  type IconName, type TextVariant, type Theme,
} from 'beds';
import './catalog.css';
import FeatureCardExamples from './FeatureCardExamples';
import EmptyStateExamples from './EmptyStateExamples';
import DecisionExamples from './DecisionExamples';
import PricingExamples from './PricingExamples';
import RecordExamples from './RecordExamples';

type View = 'chat' | 'components' | 'tokens' | 'feature-card' | 'empty-state' | 'decisions' | 'pricing' | 'records';
const views: { id: View; label: string; icon: IconName }[] = [{ id: 'chat', label: 'Chat', icon: 'MessageSquare' }, { id: 'components', label: 'Componentes', icon: 'Plug' }, { id: 'tokens', label: 'Tokens', icon: 'Settings2' }, { id: 'feature-card', label: 'Card de apresentação', icon: 'FileText' }, { id: 'empty-state', label: 'Estado vazio', icon: 'Inbox' }, { id: 'decisions', label: 'Perguntas e aprovações', icon: 'ShieldCheck' }, { id: 'pricing', label: 'Precificação', icon: 'CreditCard' }, { id: 'records', label: 'Dados e opções', icon: 'Folder' }];
const accountActions: { id: string; label: string; icon: IconName }[] = [{ id: 'settings', label: 'Account settings', icon: 'Settings2' }, { id: 'integrations', label: 'Integrations', icon: 'Plug' }, { id: 'support', label: 'Support', icon: 'CircleHelp' }, { id: 'sign-out', label: 'Sign Out', icon: 'LogOut' }];
const textExamples: { variant: TextVariant; label: string }[] = [
  { variant: 'page-title', label: 'Page title · 16 / 20' }, { variant: 'section-title', label: 'Section title · 13 / 20' },
  { variant: 'chat-title', label: 'Chat title · 16 / 24' }, { variant: 'body', label: 'Body · 14 / 21' },
  { variant: 'body-small', label: 'Body small · 13 / 20' }, { variant: 'label', label: 'Label · 13 / 16' },
  { variant: 'caption', label: 'Caption · 11 / 16' }, { variant: 'option', label: 'Option · 13 / 16' },
];
const workModes: { id: string; label: string; description: string; icon: IconName; disabled?: boolean }[] = [
  { id: 'auto', label: 'Auto', description: 'Routes each request', icon: 'Sparkles' },
  { id: 'review', label: 'Review', description: 'Review a local example', icon: 'FileText' },
  { id: 'long', label: 'Review a project with a deliberately long name', description: 'Check wrapping and selection in a narrow viewport.', icon: 'Folder' },
  { id: 'unavailable', label: 'Unavailable', description: 'Disabled example option.', icon: 'Info', disabled: true },
];
const exampleDataColumns = [{ id: 'name', label: 'Item' }, { id: 'state', label: 'Estado' }, { id: 'score', label: 'Valor', numeric: true }];
const exampleDataRows = [{ id: 'one', cells: { name: 'Linha de exemplo', state: 'Pronto', score: 18 } }, { id: 'two', cells: { name: 'Sem valor disponível', state: 'Pendente', score: null } }];

function Demo({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <Surface><Stack><SectionHeader title={title} description={description} />{children}</Stack></Surface>;
}

function SegmentedControlRegressionFixture() {
  const [delayed, setDelayed] = useState('first');
  const [rejected, setRejected] = useState('first');
  const [regular, setRegular] = useState('first');
  const [sibling, setSibling] = useState('first');
  const [longLabel, setLongLabel] = useState('short');
  const [oversizedLabel, setOversizedLabel] = useState('short');
  const acceptLater = (next: string) => { window.setTimeout(() => setDelayed(next), 180); };
  return <div className="w-[calc(100vw-32px)] min-w-0 max-w-full" role="region" aria-label="BER-10 regression fixtures" data-testid="ber10-fixture"><Text variant="section-title">BER-10 regression fixtures</Text><Text tone="secondary">Synthetic states.</Text><SegmentedControl label="BER-10 disabled skip" value={regular} options={[{ id: 'first', label: 'First' }, { id: 'blocked', label: 'Blocked', disabled: true }, { id: 'last', label: 'Last' }]} onChange={setRegular} /><SegmentedControl label="BER-10 delayed acceptance" value={delayed} options={[{ id: 'first', label: 'First' }, { id: 'second', label: 'Second' }]} onChange={acceptLater} /><SegmentedControl label="BER-10 rejection" value={rejected} options={[{ id: 'first', label: 'First' }, { id: 'second', label: 'Second' }]} onChange={() => setRejected('first')} /><SegmentedControl label="BER-10 sibling instance" value={sibling} options={[{ id: 'first', label: 'First' }, { id: 'second', label: 'Second' }]} onChange={setSibling} /><SegmentedControl label="BER-10 long labels" variant="joined" value={longLabel} options={[{ id: 'short', label: 'Short' }, { id: 'middle', label: 'Long localized choice' }, { id: 'long', label: 'Another localized choice' }]} onChange={setLongLabel} /><SegmentedControl label="BER-10 oversized label" value={oversizedLabel} options={[{ id: 'short', label: 'Short' }, { id: 'long', label: 'An intentionally oversized localized label wider than the narrow lane' }]} onChange={setOversizedLabel} /></div>;
}

function ComponentsView({ announce, ber10 }: { announce: (message: string) => void; ber10?: boolean }) {
  const [name, setName] = useState('Projeto exemplo');
  const [notes, setNotes] = useState('Um exemplo local, sem dados da conta de referência.');
  const [query, setQuery] = useState('');
  const [checked, setChecked] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [density, setDensity] = useState('compact');
  const [tab, setTab] = useState('overview');
  const [attempted, setAttempted] = useState(false);
  const [value, setValue] = useState<number | null>(68);
  const [connected, setConnected] = useState(false);
  const [noticeVisible, setNoticeVisible] = useState(true);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [retried, setRetried] = useState(false);
  const [mode, setMode] = useState('auto');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogName, setDialogName] = useState('Exemplo no diálogo');
  const [commandsOpen, setCommandsOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [connectionPolicy, setConnectionPolicy] = useState('allow');
  const [client, setClient] = useState('desktop');
  const [endpoint, setEndpoint] = useState('https://example.com/api');
  const [copyFails, setCopyFails] = useState(false);
  const [dataPage, setDataPage] = useState(1);
  const [period, setPeriod] = useState('30');
  const error = attempted && !name.trim() ? 'Informe um nome para salvar o exemplo.' : undefined;

  return <div className="esl-document"><Stack gap="section">
    <PageHeader title="Componentes" description="Peças reutilizáveis, com dimensões fixas e estados que você pode conferir. Ações e dados desta página são demonstrativos." />
    {ber10 && <SegmentedControlRegressionFixture />}
    <section><Stack><SectionHeader title="Fundação e estrutura" description="Inter, hierarquia compacta, ícones por função e uma única cor de marca configurável." />
      <div className="esl-demo-grid">
        <Demo title="Text"><Stack gap="tight">{textExamples.map(item => <Text key={item.variant} variant={item.variant}>{item.label}</Text>)}</Stack></Demo>
        <Demo title="Icon · Avatar · BrandMark"><Stack><Inline><Icon name="Home" purpose="navigation" /><Icon name="Plus" purpose="action" /><Icon name="ChevronRight" purpose="small" /><Icon name="Sparkles" purpose="feature" /></Inline><Inline><Avatar name="Alex Morgan" /><Avatar name="Workspace" purpose="workspace" /><BrandMark label="Marca do exemplo" /></Inline><Text tone="secondary">Ícones: 14 / 16 / 12 / 20 px. Avatar: 28 px. Marca: 18 px.</Text><ThemeToggle /></Stack></Demo>
      </div>
      <Demo title="ContentHeader · Breadcrumbs"><ContentHeader actions={<IconButton label="Ação do cabeçalho" icon="MoreHorizontal" onClick={() => announce('Ação do cabeçalho demonstrada.')} />}><Breadcrumbs label="Caminho demonstrativo" items={[{ id: 'library', label: 'Biblioteca', href: '?view=components' }, { id: 'current', label: 'Componente' }]} /></ContentHeader></Demo>
      <Demo title="PageContentHeader"><PageContentHeader title="Identidade da página" description="Cabeçalho medido para uma tela com título, contexto e ação." leading={<Icon name="Plug" purpose="feature" />} actions={<Button label="Ação" compact onClick={() => announce('Ação de cabeçalho demonstrada.')} />} /></Demo>
      <Demo title="Stack · Inline · Divider · Surface"><Stack><Inline align="between"><Text>Alinhamento e espaçamento</Text><Badge label="16 px" /></Inline><Divider /><Surface role="subtle"><Text tone="secondary">Superfície sutil</Text></Surface><Surface role="raised"><Text>Superfície elevada</Text></Surface></Stack></Demo>
      <Demo title="ResponsiveGrid" description="Duas colunas relacionadas no desktop; uma coluna no breakpoint compartilhado."><ResponsiveGrid><Surface role="subtle"><Stack gap="tight"><Text variant="section-title">Primeiro painel</Text><Text tone="secondary">A grade não cria estado nem interação próprios.</Text><Button label="Abrir primeiro painel" compact onClick={() => announce('Primeiro painel da grade acionado.')} /></Stack></Surface><Surface role="raised"><Stack gap="tight"><Text variant="section-title">Segundo painel</Text><Text tone="secondary">Filhos preservam a semântica e o foco que já possuem.</Text><Button label="Abrir segundo painel" compact onClick={() => announce('Segundo painel da grade acionado.')} /></Stack></Surface></ResponsiveGrid></Demo>
    </Stack></section>

    <section><Stack><SectionHeader title="Controles" description="Seleção, edição, foco, indisponibilidade e recuperação na mesma escala visual." />
      <Demo title="Button · IconButton"><Inline><Button label="Principal" variant="primary" onClick={() => announce('Ação principal demonstrada.')} /><Button label="Secundário" onClick={() => announce('Ação secundária demonstrada.')} /><Button label="Discreto" variant="ghost" onClick={() => announce('Ação discreta demonstrada.')} /><Button label="Compacto" compact onClick={() => announce('Ação compacta demonstrada.')} /><IconButton label="Adicionar exemplo" icon="Plus" onClick={() => announce('Exemplo adicionado localmente.')} /><Button label="Indisponível" disabled /><Button label="Em andamento" busy /></Inline></Demo>
      <div className="esl-demo-grid">
        <Demo title="TextField · TextAreaField"><Stack><TextField label="Nome do exemplo" name="example-name" autoComplete="name" spellCheck={false} focusOnError value={name} onChange={setName} description="Apague o nome e salve para conferir o erro." error={error} /><TextAreaField label="Anotações do exemplo" name="example-notes" autoComplete="off" spellCheck value={notes} onChange={setNotes} /><Inline><Button label="Salvar exemplo" onClick={() => { setAttempted(true); if (name.trim()) announce('Exemplo salvo apenas nesta demonstração.'); }} /><Button label="Limpar nome" variant="ghost" onClick={() => { setName(''); setAttempted(false); }} /></Inline><TextField label="Identificador de somente leitura" value="example-01" onChange={setName} readOnly /><TextField label="Campo indisponível" value="Indisponível" onChange={setName} disabled /></Stack></Demo>
        <Demo title="SearchField · Checkbox · Switch"><Stack><SearchField label="Buscar exemplos" name="example-search" autoComplete="off" spellCheck={false} value={query} onChange={setQuery} placeholder="Buscar exemplos" /><div role="status"><Text tone="secondary">{['Button', 'Select', 'Dialog'].filter(item => item.toLowerCase().includes(query.toLowerCase())).join(' · ') || 'Nenhum exemplo encontrado.'}</Text></div><Checkbox label="Incluir detalhes" checked={checked} onChange={setChecked} description="A escolha pertence a este exemplo." /><Checkbox label="Opção indisponível" checked={false} onChange={setChecked} disabled /><Switch label="Notificações do exemplo" checked={enabled} onChange={setEnabled} /><Text tone="secondary">{enabled ? 'Notificações ativadas neste exemplo.' : 'Notificações desativadas neste exemplo.'}</Text></Stack></Demo>
      </div>
      <Demo title="SegmentedControl · Tabs"><Stack><SegmentedControl label="Densidade demonstrativa" value={density} options={[{ id: 'compact', label: 'Compacto' }, { id: 'comfortable', label: 'Confortável' }]} onChange={setDensity} /><Text tone="secondary">Densidade selecionada: {density === 'compact' ? 'Compacto' : 'Confortável'}.</Text><Tabs label="Seções do exemplo" value={tab} onChange={setTab} items={[{ id: 'overview', label: 'Visão geral', content: <Text>Conteúdo da visão geral.</Text> }, { id: 'details', label: 'Detalhes', content: <Text>Conteúdo dos detalhes.</Text> }, { id: 'disabled', label: 'Indisponível', disabled: true, content: <Text>Indisponível.</Text> }]} /></Stack></Demo>
    </Stack></section>

    <section><Stack><SectionHeader title="Menus e sobreposições" description="Seleção controlada, foco contido, Escape e retorno ao controle de origem." />
      <Demo title="FilterSelect · HelpLabel" description="Filtro com ícone e ajuda discreta: a linha pontilhada sinaliza uma explicação.">
        <Inline align="between"><HelpLabel label="Atividade no período" icon="Activity" description="Operações concluídas no intervalo escolhido. Dados ilustrativos, sem requisições de rede." /><FilterSelect label="Período da atividade" value={period} onChange={setPeriod} options={[{ id: '7', label: 'Últimos 7 dias' }, { id: '30', label: 'Últimos 30 dias' }, { id: '90', label: 'Últimos 90 dias' }]} /></Inline>
      </Demo>
      <div className="esl-demo-grid">
        <Demo title="Select · DropdownMenu"><Stack><Select label="Modo de trabalho" value={mode} options={workModes} onChange={setMode} /><Text tone="secondary">Modo selecionado: {workModes.find(option => option.id === mode)?.label}.</Text><Select label="Modo indisponível" value="auto" options={workModes} onChange={setMode} disabled variant="field" /><DropdownMenu label="Menu de ações" icon="MoreHorizontal" open={menuOpen} onOpenChange={setMenuOpen} items={[{ id: 'review', label: 'Revisar exemplo', icon: 'FileText' }, { id: 'disabled', label: 'Ação indisponível', disabled: true }]} onSelect={() => announce('Exemplo marcado para revisão.')} /></Stack></Demo>
        <Demo title="Tooltip · Dialog · CommandPalette"><Inline><Tooltip label="Adicionar um exemplo local"><IconButton label="Ação com tooltip" icon="Plus" onClick={() => announce('Exemplo local adicionado.')} /></Tooltip><Button label="Abrir diálogo" onClick={() => setDialogOpen(true)} /><Button label="Abrir boas-vindas" onClick={() => setWelcomeOpen(true)} /><Button label="Abrir comandos" icon="Command" onClick={() => setCommandsOpen(true)} /></Inline></Demo>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} title="Configuração demonstrativa" description="Edite o exemplo e confira o retorno do foco ao fechar." actions={<Button label="Salvar diálogo" variant="primary" onClick={() => { setDialogOpen(false); announce(`Diálogo salvo localmente: ${dialogName}.`); }} />}><TextField label="Nome no diálogo" value={dialogName} onChange={setDialogName} /></Dialog>
      <Dialog open={welcomeOpen} onOpenChange={setWelcomeOpen} variant="welcome" artwork={<BrandMark label="Marca do exemplo de boas-vindas" />} title="Boas-vindas ao exemplo" description="A mesma anatomia compacta do diálogo de boas-vindas da referência." actions={<Button label="Conhecer o exemplo" variant="primary" purpose="welcome" onClick={() => { setWelcomeOpen(false); announce('Exemplo de boas-vindas concluído.'); }} />} />
      <CommandPalette open={commandsOpen} onOpenChange={setCommandsOpen} label="Comandos do catálogo" query={commandQuery} onQueryChange={setCommandQuery} items={[{ id: 'foundation', label: 'Fundamentos', description: 'Tipografia, ícones e identidade', icon: 'Home' }, { id: 'settings', label: 'Configurações', description: 'Campos e preferências', icon: 'Settings2' }, { id: 'disabled', label: 'Comando indisponível', disabled: true, icon: 'Info' }]} onSelect={id => announce(`Comando demonstrativo selecionado: ${id === 'foundation' ? 'Fundamentos' : 'Configurações'}.`)} emptyLabel="Nenhum comando encontrado." />
    </Stack></section>

    <section><Stack><SectionHeader title="Chat" description="Compositor, mensagens e sugestões usam a mesma largura e os mesmos controles da composição inicial." />
      <Demo title="ChatComposer · ChatMessage · SuggestionRow"><Stack><ChatMessage role="user" status="sent">Mensagem de exemplo.</ChatMessage><ChatMessage role="assistant" status={retried ? 'sent' : 'error'} onRetry={() => setRetried(true)}>{retried ? 'Estado recuperado nesta demonstração.' : 'Exemplo de resposta com erro recuperável.'}</ChatMessage><ChatComposer label="Mensagem demonstrativa" value={draft} onChange={setDraft} onSubmit={() => { announce(`Mensagem local: ${draft}`); setDraft(''); }} placeholder="Escreva uma mensagem de exemplo" busy={busy} onAttach={() => announce('Anexo demonstrativo selecionado.')} onCancel={() => setBusy(false)} /><Inline><Button label={busy ? 'Concluir estado de espera' : 'Mostrar estado de espera'} onClick={() => setBusy(!busy)} /><Button label="Preencher mensagem" variant="ghost" onClick={() => setDraft('Uma mensagem para conferir o compositor.')} /></Inline><SuggestionRow icon="Sparkles" title="Usar uma sugestão" description="Preencher o compositor" onClick={() => setDraft('Uma mensagem preenchida pela sugestão.')} /></Stack></Demo>
    </Stack></section>

    <section><Stack><SectionHeader title="Feedback" description="Estado, resultado, erro e ausência de dados ficam explícitos sem depender apenas da cor." />
      <Demo title="Badge · StatusDot · Notice"><Stack><Inline>{(['neutral', 'success', 'warning', 'error', 'info'] as const).map(tone => <Badge key={tone} label={tone} tone={tone} />)}</Inline><Inline><StatusDot label="Disponível" status="success" /><StatusDot label="Atenção" status="warning" /><StatusDot label="Erro" status="error" /><StatusDot label="Inativo" status="neutral" /></Inline>{noticeVisible ? <Notice title="Estado demonstrativo" description="Esta mensagem pode ser dispensada." tone="info" onDismiss={() => setNoticeVisible(false)} /> : <Button label="Mostrar aviso" onClick={() => setNoticeVisible(true)} />}</Stack></Demo>
      <div className="esl-demo-grid"><Demo title="ProgressBar · SegmentedMeter"><Stack><ProgressBar label="Progresso do exemplo" value={value} tone="brand" /><SegmentedMeter label="Medidor neutro" value={value} /><SegmentedMeter label="Medidor de marca" value={value} tone="brand" /><SegmentedMeter label="Medidor de uso" value={value} tone="success" /><Inline><Button label="Zero" compact onClick={() => setValue(0)} /><Button label="Máximo" compact onClick={() => setValue(100)} /><Button label="Sem dado" compact onClick={() => setValue(null)} /><Button label="68 de 100" compact onClick={() => setValue(68)} /></Inline></Stack></Demo><Demo title="Metric · LoadingIndicator · Skeleton"><Stack><Metric label="Valor ilustrativo" value="128" numericValue={128} formatValue={metricValue => metricValue.toLocaleString('pt-BR')} description="Sem vínculo com dados reais." /><LoadingIndicator label="Carregamento demonstrativo" /><Skeleton purpose="line" /><Skeleton purpose="avatar" /><Skeleton purpose="card" /></Stack></Demo></div>
      <Demo title="EmptyState"><EmptyState title="Nenhum item neste exemplo" description="Adicione um item para conferir a ação de recuperação." icon="Folder" action={{ label: 'Adicionar item de exemplo', onClick: () => announce('Item de exemplo adicionado localmente.') }} /></Demo>
    </Stack></section>

    <section><Stack><SectionHeader title="Configurações e conteúdo" description="Grupos, linhas e listas se adaptam à largura disponível." />
      <SettingsGroup title="SettingsGroup · SettingsRow"><SettingsRow title="Nome do projeto" description="Rótulo à esquerda e controle à direita no desktop."><TextField label="Projeto das configurações" value={name} onChange={setName} /></SettingsRow><SettingsRow title="Preferências" description="As alterações existem apenas neste catálogo."><Switch label="Habilitar preferência" checked={enabled} onChange={setEnabled} /></SettingsRow></SettingsGroup>
      <Demo title="Variantes de conexão" description="Clientes, política, campo e ação preservam a geometria medida nas configurações da referência."><Stack><SegmentedControl label="Política do exemplo" variant="joined" value={connectionPolicy} options={[{ id: 'allow', label: 'Permitir' }, { id: 'confirm', label: 'Confirmar' }]} onChange={setConnectionPolicy} /><Tabs label="Clientes do exemplo" variant="connection" value={client} onChange={setClient} items={[{ id: 'desktop', label: 'Desktop', content: <Text tone="secondary">Exemplo para um cliente desktop.</Text> }, { id: 'web', label: 'Web', content: <Text tone="secondary">Exemplo para um cliente web.</Text> }]} /><TextField label="Endereço do exemplo" purpose="connection" value={endpoint} onChange={setEndpoint} description="Endereço sintético; nenhuma conexão será feita." /><Button label="Conectar exemplo" purpose="connection" onClick={() => announce(`Conexão demonstrativa selecionada: ${client}, política ${connectionPolicy}. Nenhum pedido de rede foi realizado.`)} /></Stack></Demo>
      <Demo title="CodeSnippet" description="Geist Mono, texto selecionável e cópia com confirmação e recuperação de erro."><Stack><CodeSnippet label="Configuração sintética" value={endpoint} onCopy={copyFails ? async () => { throw new Error('Falha de cópia simulada.'); } : undefined} /><Button label={copyFails ? 'Restaurar cópia' : 'Testar falha de cópia'} onClick={() => setCopyFails(!copyFails)} /></Stack></Demo>
      <Demo title="IntegrationRow"><Stack gap="tight"><IntegrationRow name="Integração de exemplo" description="Uma conexão demonstrativa." mark={<Icon name="Plug" purpose="feature" />} status={connected ? 'Conectada neste exemplo' : 'Não conectada'} action={{ label: connected ? 'Desconectar' : 'Conectar', onClick: () => setConnected(!connected) }} /><IntegrationRow name="Integração indisponível" mark={<Icon name="Globe" purpose="feature" />} action={{ label: 'Indisponível', onClick: () => announce('Integração indisponível.'), disabled: true }} /></Stack></Demo>
      <Demo title="DataList · RecentItem · PlanCard"><Stack><DataList label="Arquivos do exemplo"><RecentItem title="Documento de exemplo" description="Um item recente com metadados." icon="FileText" meta="Hoje" onClick={() => announce('Documento de exemplo aberto.')} /></DataList><PlanCard title="Plano de exemplo" usage={{ label: 'Unidades ilustrativas', value: 18, max: 28 }} note="Dados fictícios para conferir a composição." action={{ label: 'Ver exemplo de plano', onClick: () => announce('Detalhes do plano de exemplo selecionados.') }} /></Stack></Demo>
      <Demo title="DataTable · Pagination" description="Tabela sem seleção ou ordenação e paginação adjacente, ambas controladas pelo consumidor."><Stack><DataTable label="Itens de exemplo" unavailableLabel="Não disponível" columns={exampleDataColumns} rows={exampleDataRows} state={{ kind: 'ready' }} /><Pagination label="Paginação de exemplo" page={dataPage} pageCount={2} summary={({ page, pageCount }) => `Página ${page} de ${pageCount}`} previousLabel="Anterior" nextLabel="Próxima" onPageChange={setDataPage} /></Stack></Demo>
      <Text tone="secondary">AppShell, SidebarHeader, WorkspaceTrigger, SidebarSection, NavItem, SidebarFooter e AccountMenu compõem a navegação deste catálogo.</Text>
    </Stack></section>
  </Stack></div>;
}

function TokensView({ theme }: { theme: Theme }) {
  return <div className="esl-document"><Stack gap="section"><PageHeader title="Tokens" description="Contrato visual da referência. Tema e cor de marca são as únicas escolhas de aparência disponíveis para quem usa a biblioteca." />
    <section><Stack><SectionHeader title="Cores semânticas" description={`Valores do tema ${theme}. Cada componente usa um papel, sem aceitar cores avulsas.`} /><div className="esl-swatches">{Object.entries(themes[theme]).map(([name, color]) => <div className="esl-swatch" key={name}><span style={{ background: color }} aria-hidden="true" /><div><strong>{name}</strong><code>{color}</code></div></div>)}</div></Stack></section>
    <section><Stack><SectionHeader title="Escala neutra" /><div className="esl-swatches">{Object.entries(neutrals).map(([name, color]) => <div className="esl-swatch" key={name}><span style={{ background: color }} aria-hidden="true" /><div><strong>{name}</strong><code>{color}</code></div></div>)}</div></Stack></section>
    <section><Stack><SectionHeader title="Tipografia" description="Inter variável incluída na biblioteca. M = medido ao vivo; D = derivado do sistema observado." /><div className="esl-table-wrap"><table className="esl-table"><thead><tr><th>Papel</th><th>Tamanho / linha</th><th>Peso</th><th>Tracking</th><th>Origem</th></tr></thead><tbody>{Object.entries(typography).map(([name, spec]) => <tr key={name}><th scope="row">{name}</th><td>{spec.size} / {spec.line} px</td><td>{spec.weight}</td><td>{spec.tracking} px</td><td>{spec.evidence}</td></tr>)}</tbody></table></div></Stack></section>
    <section><Stack><SectionHeader title="Geometria" description="Valores fixos. A adaptação para toque é documentada separadamente da referência de desktop." /><div className="esl-table-wrap"><table className="esl-table"><thead><tr><th>Dimensão</th><th>Valor</th></tr></thead><tbody>{Object.entries(geometry).map(([name, value]) => <tr key={name}><th scope="row">{name}</th><td>{value}</td></tr>)}</tbody></table></div></Stack></section>
  </Stack></div>;
}

export default function Catalog() {
  const initial = new URLSearchParams(window.location.search);
  const initialView = initial.get('view');
  const ber10 = initial.get('ber10') === '1';
  const [view, setView] = useState<View>(initialView === 'components' || initialView === 'tokens' || initialView === 'feature-card' || initialView === 'empty-state' || initialView === 'decisions' || initialView === 'pricing' || initialView === 'records' ? initialView : 'chat');
  const [theme, setTheme] = useState<Theme>(initial.get('theme') === 'light' ? 'light' : 'dark');
  const [brand, setBrand] = useState<'reference' | 'curriculol'>(initial.get('brand') === 'curriculol' ? 'curriculol' : 'reference');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [workspace, setWorkspace] = useState('workspace');
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [context, setContext] = useState(false);
  const [chatMode, setChatMode] = useState('auto');
  const [model, setModel] = useState('example');
  const [navigationSearchOpen, setNavigationSearchOpen] = useState(false);
  const [navigationQuery, setNavigationQuery] = useState('');

  function navigate(next: View) {
    setView(next); setMobileOpen(false); setStatus('');
    const url = new URL(window.location.href); url.searchParams.set('view', next); window.history.replaceState(null, '', url);
  }

  return <DesignSystemProvider theme={theme} brandColor={brands[brand]} onThemeChange={setTheme}>
    <AppShell collapsed={collapsed} onCollapsedChange={setCollapsed} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} contentWidth={view === 'chat' || view === 'decisions' ? 'chat' : view === 'empty-state' || view === 'pricing' || view === 'records' ? 'home' : view === 'feature-card' ? 'dashboard' : 'full'}
      sidebar={<>
        <SidebarHeader search={{ label: 'Buscar no catálogo', onClick: () => setNavigationSearchOpen(true) }}><AccountMenu open={accountOpen} onOpenChange={setAccountOpen} trigger={<WorkspaceTrigger name={workspace === 'workspace' ? 'Workspace' : 'Example studio'} mark={<Avatar name={workspace === 'workspace' ? 'Workspace' : 'Example studio'} purpose="workspace" />} expanded={accountOpen} onClick={() => setAccountOpen(!accountOpen)} />} identity={{ name: 'Alex Morgan', description: 'Local example', avatar: <Avatar name="Alex Morgan" /> }} actions={accountActions} onAction={id => setStatus(`Ação demonstrativa: ${accountActions.find(action => action.id === id)?.label}.`)} workspaces={[{ id: 'workspace', label: 'Workspace', mark: <Avatar name="Workspace" purpose="workspace" /> }, { id: 'studio', label: 'Example studio', mark: <Avatar name="Example studio" purpose="workspace" /> }]} activeWorkspace={workspace} onWorkspaceChange={setWorkspace} theme={theme} onThemeChange={setTheme} allWorkspaces={{ label: 'All workspaces', onClick: () => setStatus('Os dois workspaces deste catálogo são exemplos locais.') }} footer={<PlanCard title="Example plan" usage={{ label: 'Sample units', value: 18, max: 28 }} action={{ label: 'View example', onClick: () => { setAccountOpen(false); setStatus('Plano demonstrativo: nenhuma assinatura ou compra será realizada.'); } }} />} /></SidebarHeader>
        <SidebarSection purpose="primary">{views.filter(item => item.id === 'chat' || item.id === 'components').map(item => <NavItem key={item.id} label={item.label} icon={item.icon} active={view === item.id} onClick={() => navigate(item.id)} />)}</SidebarSection>
        <SidebarSection label="Biblioteca">
          <NavItem label="Tokens" icon="Settings2" active={view === 'tokens'} onClick={() => navigate('tokens')} />
          <NavItem label="Fundação e controles" icon="Folder" onClick={() => navigate('components')} />
          <NavItem label="Card de apresentação" icon="FileText" active={view === 'feature-card'} onClick={() => navigate('feature-card')} />
          <NavItem label="Estado vazio" icon="Inbox" active={view === 'empty-state'} onClick={() => navigate('empty-state')} />
          <NavItem label="Perguntas e aprovações" icon="ShieldCheck" active={view === 'decisions'} onClick={() => navigate('decisions')} />
          <NavItem label="Precificação" icon="CreditCard" active={view === 'pricing'} onClick={() => navigate('pricing')} />
          <NavItem label="Dados e opções" icon="Folder" active={view === 'records'} onClick={() => navigate('records')} />
          <NavItem label="Onboarding" icon="UserRound" href={`?view=onboarding&theme=${theme}`} />
          <NavItem label="Upload de currículo" icon="FileText" href={`?view=upload&theme=${theme}`} />
          <NavItem label="Itens com data" icon="CalendarDays" href={`?view=date-item&theme=${theme}`} />
          <NavItem label="Posts do blog" icon="FileText" href={`?view=blog-post&theme=${theme}`} />
          <NavItem label="Rodapé da landing" icon="Globe" href={`?view=landing-footer&theme=${theme}`} />
          <NavItem label="Landing do Curriculol" icon="Globe" href={`?view=landing&theme=${theme}`} />
          <NavItem label="Análise em andamento" icon="ScanText" href={`?view=analysis-loading&theme=${theme}`} />
          <NavItem label="Otimização em andamento" icon="FileText" href={`?view=optimization-loading&theme=${theme}`} />
          <NavItem label="Resultado da análise" icon="BarChart3" href={`?view=analysis-result&theme=${theme}`} />
          <NavItem label="Checkout" icon="CreditCard" href={`?view=checkout&theme=${theme}`} />
          <NavItem label="Resultado da otimização" icon="FileText" href={`?view=optimization-result&theme=${theme}`} />
          <NavItem label="Vantagens da landing" icon="Sparkles" href={`?view=benefits&theme=${theme}`} />
          <NavItem label="Configurações" icon="Settings2" href={`?view=settings&theme=${theme}`} />
          <NavItem label="Quadro de vagas" icon="Briefcase" href={`?view=kanban&theme=${theme}`} />
          <NavItem label="Pagamento confirmado" icon="CreditCard" href={`?view=payment-confirmation&theme=${theme}`} />
          <NavItem label="Créditos no menu" icon="Coins" href={`?view=account-credits&theme=${theme}`} />
          <NavItem label="Cards do fórum" icon="MessageCircle" href={`?view=forum&theme=${theme}`} />
          <NavItem label="Medidas da referência" icon="BarChart3" onClick={() => navigate('tokens')} />
          <NavItem label="Página da Lucy" icon="MessageSquare" href="?view=lucy" />
          <NavItem label="Página MCP" icon="Plug" href="?view=mcp" />
        </SidebarSection>
        <SidebarFooter><NavItem label="Sobre esta demonstração" icon="CircleHelp" onClick={() => setStatus('Biblioteca portátil extraída da referência. Todos os dados desta prévia são sintéticos.')} /></SidebarFooter>
      </>}
      header={<ContentHeader actions={<Inline gap="tight"><ThemeToggle /><Select label="Cor da marca" value={brand} options={[{ id: 'reference', label: 'Referência' }, { id: 'curriculol', label: 'Curriculol' }]} onChange={value => setBrand(value === 'curriculol' ? 'curriculol' : 'reference')} /></Inline>}><Breadcrumbs items={[{ id: 'catalog', label: view === 'chat' ? 'Chat' : 'Biblioteca', href: '?view=chat' }, { id: 'view', label: view === 'chat' ? 'Getting started' : views.find(item => item.id === view)!.label }]} /></ContentHeader>}>
      <Stack gap="section">
        {status && <Notice title="Demonstração local" description={status} onDismiss={() => setStatus('')} />}
        {view === 'chat' && <ChatLayout title="How can I help you today?" mark={<BrandMark />} suggestions={<><SuggestionRow icon="Search" title="Research" description="Research competitors’ ads" onClick={() => setMessage('Research competitors’ ads')} /><SuggestionRow icon="Sparkles" title="Optimize" description="Find & fix wasted budget" onClick={() => setMessage('Find & fix wasted budget')} /><SuggestionRow icon="Globe" title="Plan" description="Draft a campaign plan" onClick={() => setMessage('Draft a campaign plan')} /></>} recent={<Stack gap="section"><SectionHeader title="Recent tasks" actions={<Button label="View more" variant="ghost" compact onClick={() => setStatus('Nenhuma tarefa real foi consultada; esta é uma composição de referência.')} />} />{messages.length ? <RecentItem title="Local conversation" description="A conversa desta demonstração." onClick={() => setStatus('Você está na conversa local mais recente.')} /> : <Text tone="secondary">No recent agent tasks yet.</Text>}</Stack>}>
          <Stack>{messages.map((sent, index) => <ChatMessage key={`${index}-${sent}`} role="user" status="sent">{sent}</ChatMessage>)}{messages.length > 0 && <ChatMessage role="assistant">Mensagem recebida nesta demonstração local. Nenhum serviço de IA foi acionado.</ChatMessage>}<ChatComposer label="Chat message" value={message} onChange={setMessage} onSubmit={() => { if (message.trim()) { setMessages(previous => [...previous, message]); setMessage(''); } }} placeholder="Ask anything or @ to add context" context={<Inline gap="tight"><Select label="Working mode" variant="context" value={chatMode} options={workModes} onChange={setChatMode} />{context && <Badge label="Example context" />}</Inline>} tools={<Select label="Example model" value={model} options={[{ id: 'example', label: 'Example model' }, { id: 'alternate', label: 'Alternate example' }]} onChange={setModel} />} onAttach={() => setContext(!context)} /></Stack>
        </ChatLayout>}
        {view === 'components' && <ComponentsView announce={setStatus} ber10={ber10} />}
        {view === 'tokens' && <TokensView theme={theme} />}
        {view === 'feature-card' && <FeatureCardExamples />}
        {view === 'empty-state' && <EmptyStateExamples />}
        {view === 'decisions' && <DecisionExamples />}
        {view === 'pricing' && <PricingExamples />}
        {view === 'records' && <RecordExamples />}
      </Stack>
    </AppShell>
    <CommandPalette open={navigationSearchOpen} onOpenChange={setNavigationSearchOpen} label="Buscar no catálogo" query={navigationQuery} onQueryChange={setNavigationQuery} items={views.map(item => ({ id: item.id, label: item.label, icon: item.icon }))} onSelect={id => navigate(id as View)} emptyLabel="Nenhuma seção encontrada." />
  </DesignSystemProvider>;
}
