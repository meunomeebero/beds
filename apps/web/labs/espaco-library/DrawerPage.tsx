import { useState } from 'react';
import { ApplicationCard, AppShell, Avatar, Button, DesignSystemProvider, Dialog, Drawer, DrawerSection, EmptyState, Icon, Inline, LoadingIndicator, Notice, PageHeader, ResponsiveGrid, ResultsStatus, Select, Stack, Text, ThemeToggle, brands } from 'beds';

const title = 'Product designer sênior';
const longTitle = 'Especialista em pesquisa, acessibilidade e sistemas de design para plataformas internacionais de produtos e serviços digitais';
const about = 'Você vai ajudar a transformar problemas complexos em experiências simples. No Ateliê Digital, design, produto e engenharia trabalham juntos, da descoberta ao cuidado com cada detalhe da interface.';

export default function DrawerPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => new URLSearchParams(location.search).get('theme') === 'light' ? 'light' : 'dark');
  const [open, setOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [example, setExample] = useState('ready');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ready = example === 'ready' || example === 'long';
  return <DesignSystemProvider theme={theme} onThemeChange={setTheme} brandColor={brands.curriculol}>
    <AppShell sidebar={<ThemeToggle lightLabel="Claro" darkLabel="Escuro" />} contentWidth="home" collapsed={collapsed} onCollapsedChange={setCollapsed} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen}>
      <Stack gap="section">
        <PageHeader title="Detalhes da vaga" leading={<Icon name="Briefcase" purpose="feature" />} description="Explore uma oportunidade sem sair da lista. Demonstração com dados fictícios." />
        <Inline align="between"><Select label="Estado da demonstração" value={example} onChange={setExample} options={[
          { id: 'ready', label: 'Detalhes' }, { id: 'long', label: 'Texto longo' }, { id: 'loading', label: 'Carregando' }, { id: 'error', label: 'Erro recuperável' }, { id: 'empty', label: 'Vaga indisponível' },
        ]} /><ThemeToggle lightLabel="Claro" darkLabel="Escuro" /></Inline>
        <ResponsiveGrid>
          <ApplicationCard title={title} company="Ateliê Digital" status={{ id: saved ? 'saved' : 'new', label: saved ? 'Salva' : 'Nova oportunidade' }} location="São Paulo · Híbrido" salary="R$ 12 mil – R$ 16 mil" keywords={['Produto', 'Design systems', 'Figma']} date={{ label: 'Publicada em 13 de set.', dateTime: '2026-09-13' }} onOpen={() => setOpen(true)} />
        </ResponsiveGrid>
      </Stack>
      <Drawer open={open} onOpenChange={setOpen} title={example === 'long' ? longTitle : title} description="Vaga de demonstração"
        headerActions={ready ? <Button label="Ver origem" icon="ArrowUpRight" variant="ghost" onClick={() => setSourceOpen(true)} /> : undefined}
        actions={ready ? <Button label={saved ? 'Remover das salvas' : 'Salvar vaga'} icon="Bookmark" variant={saved ? 'secondary' : 'primary'} onClick={() => {
          setSaved(value => !value); setFeedback(saved ? 'Vaga removida das salvas nesta demonstração.' : 'Vaga salva nesta demonstração.');
        }} /> : undefined}>
        {ready ? <>
          <Stack><Inline><Avatar name="Ateliê Digital" /><Text variant="body">Ateliê Digital</Text></Inline>
            <Stack gap="tight"><Inline gap="tight"><Icon name="Globe" /><Text>São Paulo · Híbrido · Tempo integral</Text></Inline><Inline gap="tight"><Icon name="Coins" /><Text>R$ 12 mil – R$ 16 mil por mês</Text></Inline><Text tone="secondary">Publicada em 13 de setembro de 2026</Text></Stack>
          </Stack>
          <DrawerSection title="Sobre a oportunidade"><Text variant="body">{about}</Text></DrawerSection>
          <DrawerSection title="O que você vai fazer"><Stack gap="tight">
            <Text variant="body">Conduzir pesquisas e transformar aprendizados em jornadas, protótipos e interfaces.</Text>
            <Text variant="body">Evoluir o design system com componentes acessíveis e consistentes.</Text>
            <Text variant="body">Acompanhar a implementação com engenharia, do primeiro protótipo à entrega.</Text>
          </Stack></DrawerSection>
          <DrawerSection title="O que buscamos"><Text variant="body">Experiência com produtos digitais, pesquisa, Figma e design systems. Um portfólio que mostre suas decisões e os resultados do seu trabalho.</Text></DrawerSection>
          <DrawerSection title="O que a empresa oferece"><Text variant="body">Horários flexíveis, apoio para desenvolvimento profissional e encontros presenciais combinados com a equipe.</Text></DrawerSection>
          {example === 'long' && Array.from({ length: 6 }, (_, index) => <DrawerSection key={index} title={`Contexto adicional ${index + 1}`}><Text variant="body">{about} {about}</Text></DrawerSection>)}
          <DrawerSection title="Sobre este exemplo"><Text tone="secondary">Empresa, vaga e faixa salarial fictícias. Salvar altera apenas esta prévia; não envia candidatura nem consome créditos.</Text></DrawerSection>
          <ResultsStatus>{feedback}</ResultsStatus>
        </> : example === 'loading' ? <LoadingIndicator label="Carregando detalhes da vaga…" /> : example === 'error' ? <Stack>
          <Notice tone="error" title="Não foi possível carregar a vaga" description="Tente novamente para ver os detalhes. A lista de vagas continua disponível ao fechar este painel." />
          <Button label="Tentar novamente" onClick={() => { setExample('ready'); }} />
        </Stack> : <EmptyState icon="Briefcase" title="Esta vaga não está disponível" description="Feche os detalhes para explorar outras oportunidades." action={{ label: 'Voltar às vagas', onClick: () => setOpen(false) }} />}
        <Dialog open={sourceOpen} onOpenChange={setSourceOpen} title="Origem da oportunidade"><Text>Vaga criada para esta demonstração. Não há anúncio externo, coleta de dados ou conexão com uma empresa real.</Text></Dialog>
      </Drawer>
    </AppShell>
  </DesignSystemProvider>;
}
