import { useState } from 'react';
import { Avatar, Button, DesignSystemProvider, Drawer, DrawerSection, EmptyState, ForumTopicCard, ForumTopicList, Icon, Inline, LoadingIndicator, NavItem, Notice, PageHeader, ResultsStatus, Select, SidebarHeader, SidebarSection, Stack, Text, ThemeToggle, type ForumTopicCardProps } from 'beds';
import { AppShell } from './recipes';
import marinaAvatar from './assets/forum-marina.svg';
import rafaelAvatar from './assets/forum-rafael.svg';
import joanaAvatar from './assets/forum-joana.svg';

type ExampleTopic = Omit<ForumTopicCardProps, 'href' | 'onOpen'> & { id: string; response: string };
const topics: ExampleTopic[] = [
  { id: 'portfolio', author: { name: 'Marina Costa', avatarSrc: marinaAvatar }, title: 'O que vocês priorizam em um portfólio?', excerpt: 'Estou reorganizando meus cases e tentando mostrar melhor as decisões por trás de cada projeto. Vocês preferem poucos projetos bem detalhados ou uma visão mais ampla do trabalho?', repliesLabel: '8 respostas', activity: { label: 'Há 2 horas', dateTime: '2026-09-15T12:00:00-03:00' }, unreadLabel: 'Não lido', response: 'Para mim, dois ou três cases com contexto, escolhas e resultados ajudam mais do que uma coleção extensa de telas.' },
  { id: 'interview', author: { name: 'Rafael Lima', avatarSrc: rafaelAvatar }, title: 'Como contar uma transição de carreira na entrevista?', excerpt: 'Saí de atendimento para produto. Gostaria de conectar essa experiência à vaga sem parecer que estou começando do zero.', repliesLabel: '5 respostas', activity: { label: 'Há 4 horas', dateTime: '2026-09-15T10:00:00-03:00' }, response: 'Vale trazer uma situação em que você identificou um problema de clientes e ajudou a resolvê-lo. A experiência anterior pode tornar sua perspectiva mais concreta.' },
  { id: 'resume', author: { name: 'Joana Almeida', avatarSrc: joanaAvatar }, title: 'Currículo de uma ou duas páginas?', excerpt: 'Depois de enxugar as experiências antigas, consegui deixar os projetos mais relevantes em uma página. Obrigada pelas sugestões!', repliesLabel: '12 respostas', activity: { label: 'Ontem', dateTime: '2026-09-14' }, status: { label: 'Resolvido', tone: 'success' }, response: 'Ficou muito mais fácil encontrar a experiência relevante. Obrigada por voltar e contar o que funcionou.' },
  { id: 'remote', author: { name: 'Pedro Santos' }, title: 'Primeira entrevista para uma vaga remota', excerpt: 'Além de testar câmera e áudio, o que vocês costumam preparar antes da conversa?', repliesLabel: 'Sem respostas', activity: { label: 'Ontem', dateTime: '2026-09-14' }, response: '' },
];
const longTitle = 'Como organizar um portfólio com projetos de pesquisa, acessibilidade e sistemas de design para uma transição de carreira em equipes internacionais?';

export default function ForumTopicPage() {
  const initial = new URLSearchParams(location.search);
  const [theme, setTheme] = useState<'light' | 'dark'>(initial.get('theme') === 'light' ? 'light' : 'dark');
  const [selected, setSelected] = useState(initial.get('topic') ?? '');
  const [open, setOpen] = useState(initial.has('topic'));
  const [read, setRead] = useState<string[]>([]);
  const [example, setExample] = useState('ready');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLong = example === 'long';
  const displayed = topics.map((topic, index) => index === 0 ? { ...topic,
    title: isLong ? longTitle : topic.title,
    author: { ...topic.author, name: isLong ? 'Marina de Oliveira Costa e Albuquerque' : topic.author.name, avatarSrc: example === 'image-error' ? '/missing-forum-avatar.svg' : topic.author.avatarSrc },
  } : topic);
  const current = displayed.find(topic => topic.id === selected);
  const selectTopic = (id: string) => { setSelected(id); setRead(previous => previous.includes(id) ? previous : [...previous, id]); setOpen(true); };
  const updateExample = (next: string) => { setExample(next); setOpen(false); };

  return <DesignSystemProvider theme={theme} onThemeChange={setTheme} brandColor={"#ffa133"}>
    <AppShell contentWidth="home" collapsed={collapsed} onCollapsedChange={setCollapsed} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} navigationLabel="Navegação" closeNavigationLabel="Fechar navegação"
      sidebar={<><SidebarHeader><ThemeToggle label="Tema" lightLabel="Claro" darkLabel="Escuro" /></SidebarHeader><SidebarSection label="Catálogo"><NavItem label="Componentes" icon="Folder" href={`?view=components&theme=${theme}`} /><NavItem label="Cards do fórum" icon="MessageCircle" href={`?view=forum&theme=${theme}`} active /></SidebarSection></>}>
      <Stack gap="section">
        <PageHeader title="Fórum" description="Troque experiências sobre os próximos passos da sua carreira." leading={<Icon name="MessageCircle" purpose="feature" />} />
        {example === 'loading' ? <LoadingIndicator label="Carregando conversas…" /> : example === 'empty' ? <EmptyState icon="MessageCircle" title="Nenhuma conversa neste exemplo" description="Restaure os tópicos para explorar os cards e suas respostas." action={{ label: 'Restaurar tópicos', onClick: () => updateExample('ready') }} /> : example === 'error' ? <Stack>
          <Notice tone="error" title="Não foi possível carregar as conversas" description="Tente novamente para recuperar os tópicos. Esta falha é simulada." />
          <Button label="Tentar novamente" onClick={() => updateExample('ready')} />
        </Stack> : <ForumTopicList label="Conversas da comunidade">{displayed.map(topic => <ForumTopicCard key={topic.id} title={topic.title} author={topic.author} excerpt={topic.excerpt} activity={topic.activity} repliesLabel={topic.repliesLabel} status={topic.status} unreadLabel={read.includes(topic.id) ? undefined : topic.unreadLabel} selected={selected === topic.id} onOpen={() => selectTopic(topic.id)} />)}</ForumTopicList>}
        <Stack>
          <Text variant="section-title">Testar os cards</Text>
          <Text tone="secondary">Pessoas, conversas e contagens fictícias. Abrir um tópico não publica nem envia mensagens.</Text>
          <Inline align="between"><Select label="Estado do exemplo" value={example} onChange={updateExample} options={[
            { id: 'ready', label: 'Conversas' }, { id: 'long', label: 'Texto longo' }, { id: 'image-error', label: 'Avatar indisponível' },
            { id: 'loading', label: 'Carregando' }, { id: 'empty', label: 'Vazio' }, { id: 'error', label: 'Erro recuperável' },
          ]} /><Button label="Restaurar exemplos" variant="ghost" onClick={() => { updateExample('ready'); setSelected(''); setRead([]); }} /></Inline>
          <ForumTopicList label="Exemplo com link nativo"><ForumTopicCard title="Abrir o tópico em uma página" author={topics[0].author} excerpt="Este card usa um link nativo: permite abrir em outra aba e copiar o endereço." href={`?view=forum&theme=${theme}&topic=portfolio`} /></ForumTopicList>
        </Stack>
      </Stack>
      <Drawer open={open && Boolean(current)} onOpenChange={setOpen} title={current?.title ?? 'Tópico'} description="Conversa de demonstração">
        {current && <Stack>
          <Inline><Avatar name={current.author.name} src={current.author.avatarSrc} purpose="forum" /><Text>{current.author.name}</Text></Inline>
          <Text variant="body">{current.excerpt}</Text>
          <DrawerSection title={current.response ? 'Uma resposta da conversa' : 'Ainda sem respostas'}><Text variant="body">{current.response || 'Este tópico fictício ainda não recebeu respostas.'}</Text></DrawerSection>
          <ResultsStatus>Você está lendo um exemplo. As contagens ilustram o card; esta prévia não contém uma conversa completa.</ResultsStatus>
        </Stack>}
      </Drawer>
    </AppShell>
  </DesignSystemProvider>;
}
