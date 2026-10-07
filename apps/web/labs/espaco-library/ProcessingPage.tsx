import { useEffect, useState } from 'react';
import { AppShell, BrandMark, Button, ContentHeader, DesignSystemProvider, DocumentPreview, Inline, NavItem, PageHeader, ProcessingView, SidebarHeader, SidebarSection, Stack, Surface, Text, ThemeToggle, brands, type ProcessingStep } from 'beds';
import { processingFixtures, type ProcessingDemoKind } from './processing-fixtures';

type DemoState = 'running' | 'waiting' | 'success' | 'error' | 'manual';
const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

function ProcessingDemo({ kind, onExit, onResult }: { kind: ProcessingDemoKind; onExit: () => void; onResult: () => void }) {
  const fixture = processingFixtures[kind];
  const [state, setState] = useState<DemoState>('running');
  const [clock, setClock] = useState({ elapsed: 0, presentation: 0 });
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const [reducedMotion, setReducedMotion] = useState(false);
  const isTerminal = state === 'success' || state === 'error' || state === 'manual';
  const clocksFinished = clock.elapsed >= fixture.durationSeconds && clock.presentation >= fixture.durationSeconds;
  const long = new URLSearchParams(location.search).get('preview') === 'long';

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const update = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  useEffect(() => {
    if (isTerminal || clocksFinished) return;
    let previous = Date.now();
    const timer = window.setInterval(() => {
      const now = Date.now();
      const delta = (now - previous) / 1000;
      previous = now;
      setClock(current => {
        const elapsed = Math.min(fixture.durationSeconds, current.elapsed + delta);
        const presentation = Math.min(fixture.durationSeconds, current.presentation + (paused || hidden ? 0 : delta));
        if (elapsed === current.elapsed && presentation === current.presentation) return current;
        return { elapsed, presentation };
      });
    }, 250);
    return () => window.clearInterval(timer);
  }, [fixture.durationSeconds, isTerminal, clocksFinished, paused, hidden]);

  const waiting = state === 'waiting' || (!isTerminal && clock.elapsed >= fixture.durationSeconds);
  const viewState = state === 'manual' ? 'error' : waiting ? 'waiting' : state;
  const stageDuration = fixture.durationSeconds / fixture.steps.length;
  const steps: ProcessingStep[] = fixture.steps.map((step, index) => {
    const age = clock.presentation - index * stageDuration;
    const complete = state === 'success' || age >= Math.min(stageDuration * .85, 10.5);
    const active = !complete && age >= 0;
    return { ...step, state: complete ? 'complete' : active ? 'active' : 'pending', statusLabel: complete ? 'Concluída na prévia' : active ? isTerminal ? 'Interrompida' : 'Em andamento' : 'A seguir', progress: complete ? 100 : Math.min(100, Math.max(0, (age - .2) / Math.min(stageDuration * .8, 10) * 100)) };
  });
  const chapterIndex = reducedMotion ? 0 : fixture.chapters.reduce((active, chapter, index) => chapter.at <= clock.presentation ? index : active, 0);
  const chapter = fixture.chapters[Math.max(0, chapterIndex)];
  const activeStep = steps.find(step => step.state === 'active');
  const message = state === 'manual'
    ? 'Esta solicitação precisa de revisão manual. No aplicativo, procure o suporte antes de tentar novamente. Nenhuma cobrança ocorreu nesta prévia.'
    : state === 'error'
      ? 'Não foi possível concluir a demonstração. Tente novamente para reiniciar a prévia; nenhum arquivo ou crédito foi utilizado.'
      : state === 'success'
        ? 'Resultado de exemplo disponível. Nenhum currículo foi analisado ou gerado de verdade.'
        : waiting ? 'O processamento está demorando mais que o esperado. Aguardamos a confirmação do resultado; o progresso permanece em até 95%.' : undefined;
  const statusLabel = state === 'success' ? 'Concluído' : isTerminal ? 'Interrompido' : waiting ? 'Aguardando confirmação' : 'Em andamento';

  function retry() {
    setClock({ elapsed: 0, presentation: 0 });
    setState('running');
    setPaused(false);
  }

  return <Stack gap="section">
    <ProcessingView title={state === 'success' ? fixture.resultTitle : fixture.title} description={fixture.description}
      context={long ? 'Curriculol · currículo e vaga de demonstração para uma oportunidade em pesquisa e design de produtos digitais' : 'Curriculol · currículo de demonstração'} mark={<BrandMark label="Curriculol" />}
      state={viewState} statusLabel={statusLabel} progress={Math.min(95, 10 + clock.elapsed / fixture.durationSeconds * 85)} progressLabel="Progresso estimado"
      progressDescription="Estimativa ilustrativa. Só a confirmação do resultado libera 100%." stepsLabel={kind === 'analysis' ? 'Etapas da análise' : 'Etapas da otimização'} steps={steps}
      message={message} announcement={message ?? (activeStep ? `${activeStep.label}. ${activeStep.statusLabel}.` : 'Etapa visual concluída. Aguardando o próximo passo.')}
      detailsLabel="Ver atividade de demonstração" logs={fixture.logs.slice(0, Math.max(1, Math.min(fixture.logs.length, Math.floor((clock.presentation - 2) / (fixture.durationSeconds * .8 / fixture.logs.length)) + 1)))}
      scores={clock.presentation >= fixture.durationSeconds * .67 || state === 'success' ? { label: 'Indicadores ilustrativos', note: 'Dados fictícios para visualizar as barras. Não são uma previsão do seu resultado.', items: fixture.scores } : undefined}
      story={{ title: chapter.title, caption: chapter.body, speaker: 'Por dentro do Curriculol', elapsedLabel: formatTime(clock.presentation), durationLabel: formatTime(fixture.durationSeconds), transcriptLabel: 'Ler todas as etapas', chapters: fixture.chapters.map((item, index) => ({ id: String(item.at), time: formatTime(item.at), title: item.title, body: item.body, current: index === chapterIndex })) }}
      motion={{ paused: paused || hidden, pauseLabel: 'Pausar apresentação', resumeLabel: 'Retomar apresentação', description: reducedMotion ? 'Movimento reduzido ativo. Leia a explicação completa em “Ler todas as etapas”. O progresso continua.' : 'Pausa a animação e a explicação, não o progresso da simulação.', onPausedChange: setPaused }}
      actions={[
        ...(state === 'error' ? [{ label: 'Tentar novamente', onClick: retry, primary: true }] : []),
        ...(state === 'success' ? [{ label: 'Ver resultado de demonstração', onClick: onResult, primary: true }] : []),
        { label: 'Voltar à prévia', onClick: onExit },
      ]}
    />
    <Stack><Text variant="section-title">Controles da demonstração</Text><Text variant="body-small" tone="secondary">Sequência original: {fixture.durationSeconds} segundos. Estes controles simulam respostas do serviço; não há envio de arquivo, cobrança ou e-mail.</Text><Inline gap="tight"><Button label="Simular conclusão" disabled={isTerminal} onClick={() => setState('success')} /><Button label="Simular espera prolongada" disabled={isTerminal} onClick={() => setState('waiting')} /><Button label="Simular falha" disabled={isTerminal} onClick={() => setState('error')} /><Button label="Simular revisão manual" disabled={isTerminal} onClick={() => setState('manual')} /></Inline></Stack>
  </Stack>;
}

export default function ProcessingPage() {
  const params = new URLSearchParams(location.search);
  const kind: ProcessingDemoKind = params.get('view') === 'optimization-loading' ? 'optimization' : 'analysis';
  const [theme, setTheme] = useState<'light' | 'dark'>(params.get('theme') === 'light' ? 'light' : 'dark');
  const [started, setStarted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const entryTitle = kind === 'analysis' ? 'Analisar um currículo' : 'Otimizar um currículo';

  useEffect(() => {
    document.documentElement.lang = 'pt-BR';
    document.title = `${entryTitle} · Playground Curriculol`;
  }, [entryTitle]);
  useEffect(() => { document.querySelector<HTMLElement>('main')?.focus({ preventScroll: true }); }, [started]);

  return <DesignSystemProvider theme={theme} onThemeChange={setTheme} brandColor={brands.curriculol}>
    <AppShell contentWidth={started ? 'full' : 'home'} collapsed={collapsed} onCollapsedChange={setCollapsed} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} navigationLabel="Navegação" closeNavigationLabel="Fechar navegação"
      sidebar={<><SidebarHeader closeLabel="Fechar navegação" expandLabel="Expandir menu" collapseLabel="Recolher menu"><Inline gap="tight"><BrandMark label="Curriculol" /><Text>Curriculol</Text></Inline></SidebarHeader><SidebarSection label="Playground"><NavItem label="Componentes" icon="Folder" href={`?view=components&theme=${theme}`} /><NavItem label="Análise em andamento" icon="ScanText" active={kind === 'analysis'} href={`?view=analysis-loading&theme=${theme}`} /><NavItem label="Otimização em andamento" icon="FileText" active={kind === 'optimization'} href={`?view=optimization-loading&theme=${theme}`} /></SidebarSection></>}
      header={<ContentHeader actions={<ThemeToggle label="Aparência da página" lightLabel="Claro" darkLabel="Escuro" />}><Text>Prévia do processamento</Text></ContentHeader>}>
      {started ? <ProcessingDemo kind={kind} onExit={() => setStarted(false)} onResult={() => location.assign(`?view=${kind}-result&theme=${theme}`)} /> : <Stack gap="section"><PageHeader purpose="home" title={entryTitle} description="Veja como as etapas do Curriculol aparecem no redesign, com dados fictícios." leading={<BrandMark label="Curriculol" />} /><Surface><Stack><DocumentPreview name="Luísa Andrade" subtitle="Product designer · currículo de demonstração" sections={[{ id: 'experience', title: 'Experiência', text: 'Pesquisa, design de produtos digitais e colaboração com equipes de produto.' }, { id: 'job', title: 'Vaga de referência', text: 'Product designer sênior · Ateliê Digital (empresa fictícia).' }]} /><Inline><Button purpose="welcome" variant="primary" label={kind === 'analysis' ? 'Iniciar análise de demonstração' : 'Iniciar otimização de demonstração'} onClick={() => setStarted(true)} /></Inline></Stack></Surface><Text variant="body-small" tone="secondary">Esta prévia não processa arquivos nem usa créditos. O aplicativo permite sair e receber o resultado por e-mail. Aqui, sair encerra somente a prévia local; nada é enviado ou salvo.</Text></Stack>}
    </AppShell>
  </DesignSystemProvider>;
}
