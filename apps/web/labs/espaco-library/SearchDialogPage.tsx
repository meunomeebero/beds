import { useEffect, useState } from 'react';
import { AppShell, Button, DesignSystemProvider, Dialog, Icon, Inline, PageHeader, SearchDialog, Select, Stack, Text, ThemeToggle, type SearchResult } from 'beds';

const items: SearchResult[] = [
  { id: 'cv-product', categoryId: 'resumes', label: 'Currículo — Product designer', description: 'Currículos · Atualizado hoje', icon: 'FileText', keywords: 'design produto figma' },
  { id: 'job-studio', categoryId: 'jobs', label: 'Product designer sênior', description: 'Ateliê Digital · São Paulo · Híbrido', identity: { name: 'Ateliê Digital' }, keywords: 'design produto' },
  { id: 'cv-lead', categoryId: 'resumes', label: 'Currículo — Design lead', description: 'Currículos · Atualizado ontem', icon: 'FileText', keywords: 'liderança' },
  { id: 'job-trama', categoryId: 'jobs', label: 'Design lead', description: 'Trama · Brasil · Remoto', identity: { name: 'Trama' }, keywords: 'liderança gestão' },
  { id: 'job-norte', categoryId: 'jobs', label: 'Designer de produto', description: 'Norte · Curitiba · Híbrido', identity: { name: 'Norte' }, keywords: 'product figma' },
  { id: 'cv-old', categoryId: 'resumes', label: 'Currículo — UX researcher', description: 'Arquivo indisponível nesta demonstração', icon: 'FileText', disabled: true },
  { id: 'job-orbita', categoryId: 'jobs', label: 'Senior UX designer', description: 'Órbita · Brasil · Remoto', identity: { name: 'Órbita' }, keywords: 'pesquisa experiência' },
];

export default function SearchDialogPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => new URLSearchParams(location.search).get('theme') === 'light' ? 'light' : 'dark');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [example, setExample] = useState('ready');
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && !event.isComposing && !document.querySelector('dialog[open]')) {
        event.preventDefault(); setOpen(true);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);
  const fixture = example === 'empty' ? [] : example === 'long' ? [
    { ...items[0], label: 'Currículo profissional — Especialista em pesquisa, acessibilidade e sistemas de design para produtos e serviços digitais internacionais', description: 'Currículos · Versão revisada para oportunidades de liderança em equipes multidisciplinares e distribuídas' }, ...items,
  ].map((item, index) => ({ ...item, id: `${item.id}-${index}` })) : items;
  const state = example === 'loading' ? { kind: 'loading' as const, label: 'Buscando resultados…' }
    : example === 'error' ? { kind: 'error' as const, title: 'Não foi possível buscar', description: 'Tente novamente para carregar os resultados. Seu termo de busca foi mantido.', retry: { label: 'Tentar novamente', onClick: () => setExample('ready') } } : undefined;
  return <DesignSystemProvider theme={theme} onThemeChange={setTheme}>
    <AppShell sidebar={<ThemeToggle lightLabel="Claro" darkLabel="Escuro" />} contentWidth="home" collapsed={collapsed} onCollapsedChange={setCollapsed} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen}>
      <Stack gap="section">
        <PageHeader title="Busca global" leading={<Icon name="Search" purpose="feature" />} description="Currículos e vagas no mesmo lugar. Exemplo com dados fictícios." />
        <Stack><Inline><Button label="Buscar currículos ou vagas" icon="Search" onClick={() => setOpen(true)} /><ThemeToggle lightLabel="Claro" darkLabel="Escuro" /></Inline>
          <Text tone="secondary">Abra a busca ou use ⌘ K / Ctrl K. A busca e os detalhes são locais; nenhum arquivo é enviado.</Text>
          <Select label="Estado da demonstração" value={example} onChange={setExample} options={[
            { id: 'ready', label: 'Resultados' }, { id: 'loading', label: 'Carregando' }, { id: 'error', label: 'Erro recuperável' }, { id: 'empty', label: 'Sem dados' }, { id: 'long', label: 'Texto longo' }, { id: 'manual', label: 'Resultados externos simulados' },
          ]} />
        </Stack>
      </Stack>
      <SearchDialog open={open} onOpenChange={setOpen} title="Buscar no seu espaço" placeholder="Buscar currículos ou vagas…" query={query} onQueryChange={setQuery}
        items={fixture} onSelect={id => setSelected(fixture.find(item => item.id === id) ?? null)}
        resultsLabel={query || category ? 'Resultados da busca' : 'Acessados recentemente'} state={state} filterMode={example === 'manual' ? 'manual' : 'local'}
        categories={{ label: 'Tipo de resultado', value: category, onChange: setCategory, options: [
          { id: '', label: 'Tudo', icon: 'Search' }, { id: 'resumes', label: 'Currículos', icon: 'FileText' }, { id: 'jobs', label: 'Vagas', icon: 'Briefcase' },
        ] }} />
      <Dialog open={Boolean(selected)} onOpenChange={value => { if (!value) setSelected(null); }} title={selected?.label ?? 'Detalhes'} description={selected?.description}>
        <Text>Resultado de demonstração. No aplicativo, esta seleção poderá abrir o currículo ou os detalhes da vaga.</Text>
      </Dialog>
    </AppShell>
  </DesignSystemProvider>;
}
