import { useState } from 'react';
import { ApplicationBoard, AppShell, BrandMark, ContentHeader, DesignSystemProvider, Drawer, DrawerSection, Inline, NavItem, PageHeader, ResultsStatus, SidebarHeader, SidebarSection, Stack, Text, ThemeToggle, brands, type ApplicationBoardColumn, type ApplicationScore } from 'beds';

const stages: Omit<ApplicationBoardColumn, 'items'>[] = [
  { id: 'saved', label: 'Salvas' },
  { id: 'preparing', label: 'Em preparação', tone: 'warning' },
  { id: 'ready', label: 'Prontas para enviar', tone: 'success' },
  { id: 'sent', label: 'Enviadas', tone: 'info', emptyLabel: 'As vagas que você marcar como enviadas aparecem aqui.' },
];
const match = (value: number): ApplicationScore => ({ kind: 'match', value, explanation: 'Afinidade com seu perfil. Não é uma nota ATS nem uma probabilidade de contratação.' });
const ats = (value: number, before: number): ApplicationScore => ({ kind: 'ats', value, before, explanation: 'Alinhamento do currículo com esta vaga. Não é uma probabilidade de contratação.' });
const jobs = [
  { id: 'atelie', status: 'ready', title: 'Product designer sênior', company: 'Ateliê Digital', location: 'São Paulo · Híbrido', salary: 'R$ 12 mil – R$ 16 mil', score: ats(92, 68), note: 'Vale contar sobre o projeto de design system.', documents: true, keywords: ['Produto', 'Design systems', 'Figma'] },
  { id: 'norte', status: 'saved', title: 'Product designer', company: 'Norte', location: 'Brasil · Remoto', salary: 'R$ 10 mil – R$ 14 mil', score: match(84), keywords: ['Pesquisa', 'Produto'] },
  { id: 'orbita', status: 'preparing', title: 'Senior UX designer', company: 'Órbita', location: 'Brasil · Remoto', score: { kind: 'processing', label: 'Preparando currículo e carta' } as ApplicationScore, keywords: ['Experiência', 'Serviços'] },
  { id: 'estudio', status: 'ready', title: 'Lead product designer', company: 'Estúdio de Carreira', location: 'Brasil · Remoto', score: ats(86, 72), documents: true, keywords: ['Liderança', 'Pesquisa', 'Estratégia'] },
  { id: 'nucleo', status: 'saved', title: 'Design operations', company: 'Núcleo', location: 'Recife · Híbrido', score: { kind: 'unavailable', label: 'Compatibilidade não informada' } as ApplicationScore, note: 'Revisar o portfólio antes de preparar a candidatura.', keywords: ['Operações', 'Design'] },
];

export default function KanbanPage() {
  const params = new URLSearchParams(location.search);
  const [theme, setTheme] = useState<'light' | 'dark'>(params.get('theme') === 'light' ? 'light' : 'dark');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, string>>(() => Object.fromEntries(jobs.map(job => [job.id, job.status])));
  const [announcement, setAnnouncement] = useState('');
  const [detail, setDetail] = useState<{ id: string; section?: string } | null>(null);
  const selected = jobs.find(job => job.id === detail?.id);
  const long = params.get('preview') === 'long';
  const titleFor = (job: typeof jobs[number]) => long && job.id === 'norte' ? 'Especialista em pesquisa, acessibilidade e sistemas de design para plataformas internacionais' : job.title;
  const columns: ApplicationBoardColumn[] = stages.map(stage => ({ ...stage, items: params.get('preview') === 'empty' ? [] : jobs.filter(job => statuses[job.id] === stage.id).map(job => ({
    id: job.id, title: titleFor(job), company: job.company, location: job.location, score: job.score,
    moveTo: job.status === 'preparing' || params.get('preview') === 'readonly' ? undefined : ['saved', 'ready', 'sent'],
    note: job.note ? { text: job.note, onOpen: () => setDetail({ id: job.id, section: 'Sua anotação' }) } : undefined,
    documents: job.documents ? ['Currículo', 'Carta'].map(label => ({ id: label, label, onOpen: () => setDetail({ id: job.id, section: label }) })) : undefined,
    onOpen: () => setDetail({ id: job.id }),
  })) }));

  return <DesignSystemProvider theme={theme} onThemeChange={setTheme} brandColor={brands.curriculol}>
    <AppShell contentWidth="full" collapsed={collapsed} onCollapsedChange={setCollapsed} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} navigationLabel="Navegação" closeNavigationLabel="Fechar navegação"
      sidebar={<><SidebarHeader><Inline gap="tight"><BrandMark label="Curriculol" /><Text>Curriculol</Text></Inline></SidebarHeader><SidebarSection label="Playground"><NavItem label="Componentes" icon="Folder" href={`?view=components&theme=${theme}`} /><NavItem label="Quadro de vagas" icon="Briefcase" active href={`?view=kanban&theme=${theme}`} /></SidebarSection></>}
      header={<ContentHeader actions={<ThemeToggle label="Aparência da página" lightLabel="Claro" darkLabel="Escuro" />}><Text>Componentes / Quadro de vagas</Text></ContentHeader>}>
      <Stack gap="section">
        <PageHeader title="Candidaturas" description="Cada oportunidade, no seu próximo passo." />
        <Stack>
          <ResultsStatus>{`${columns.reduce((total, column) => total + column.items.length, 0)} vagas · Dados de demonstração`}</ResultsStatus>
          <ApplicationBoard label="Vagas por status" columns={columns} announcement={announcement} onMove={(id, status) => {
            if (params.get('preview') === 'move-error') { setAnnouncement('Não foi possível mover a vaga. Ela continua na etapa anterior. Tente novamente.'); return; }
            setStatuses(current => ({ ...current, [id]: status }));
            setAnnouncement(`${jobs.find(job => job.id === id)?.title} movida para ${stages.find(stage => stage.id === status)?.label}. Alteração apenas nesta prévia.`);
          }} />
          <Text variant="body-small" tone="secondary">Use o menu de opções do card para mudar de etapa. Marcar como enviada não envia a candidatura.</Text>
          {params.get('preview') === 'move-error' && <Text tone="secondary">{announcement}</Text>}
        </Stack>
      </Stack>
      <Drawer open={Boolean(selected)} onOpenChange={open => { if (!open) setDetail(null); }} title={selected ? titleFor(selected) : 'Detalhes da vaga'} description={selected?.company}>
        {selected && <>
          <Stack gap="tight"><Text>{selected.location}</Text>{selected.salary && <Text>{selected.salary}</Text>}<Text tone="secondary">{selected.keywords.join(' · ')}</Text><Text tone="secondary">Adicionada em 15 de setembro de 2026 · Busca de vagas</Text></Stack>
          <DrawerSection title={detail?.section ?? 'Sobre a oportunidade'}><Text variant="body">{detail?.section === 'Sua anotação' ? selected.note! : detail?.section === 'Currículo' || detail?.section === 'Carta' ? 'Documento demonstrativo. Nenhum arquivo real foi gerado ou enviado.' : 'Ajude a criar experiências digitais claras e acessíveis, colaborando com produto e engenharia. Esta descrição é fictícia e serve para validar a leitura dos detalhes sem sair do quadro.'}</Text></DrawerSection>
          {selected.note && detail?.section !== 'Sua anotação' && <DrawerSection title="Sua anotação"><Text>{selected.note}</Text></DrawerSection>}
          <DrawerSection title="Sobre esta prévia"><Text tone="secondary">Empresas, notas e vagas fictícias. As alterações ficam apenas nesta sessão; recarregar restaura o exemplo. Nenhum envio, cobrança ou alteração no seu perfil.</Text></DrawerSection>
        </>}
      </Drawer>
    </AppShell>
  </DesignSystemProvider>;
}
