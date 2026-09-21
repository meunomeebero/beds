import { useEffect, useRef, useState } from 'react';
import { BrandMark, Button, ContentHeader, DesignSystemProvider, Dialog, Inline, NavItem, Notice, ResponsiveGrid, SegmentedControl, SegmentedMeter, Select, SidebarHeader, SidebarSection, Stack, Tabs, Text, ThemeToggle } from 'beds';
import { AppShell } from './recipes';
import { PaymentConfirmation } from './recipes';
import { ResultFindings, ResultLayout, ResultOffer, ResultScore, ResultSection } from './recipes';
import { DocumentPreview } from './recipes';
import { parseResultPreview, resultExample, resultPreviewOptions, type ResultMode, type ResultPreview } from './results-fixtures';

type ResultDialog = 'checkout' | 'account' | 'document' | 'letter' | 'edit' | 'share' | 'jobs' | null;

function ResultDemo({ mode, preview, viewHref }: { mode: ResultMode; preview: ResultPreview; viewHref: (view: string) => string }) {
  const optimization = mode === 'optimization';
  const navigate = (view: string) => { location.href = viewHref(view); };
  const [credits, setCredits] = useState<number | null>(preview === 'balance-error' ? null : preview === 'credits' ? 2 : 0);
  const [identified, setIdentified] = useState(preview !== 'anonymous' || optimization);
  const [dialog, setDialog] = useState<ResultDialog>(null);
  const [accountPurpose, setAccountPurpose] = useState<'reports' | 'checkout'>('reports');
  const [paymentState, setPaymentState] = useState<'ready' | 'error' | 'confirmed'>('ready');
  const [deliveryFailed, setDeliveryFailed] = useState(false);
  const [recovered, setRecovered] = useState(false);
  const [template, setTemplate] = useState('standard');
  const [report, setReport] = useState('anya');
  const restoreResultFocus = useRef(false);
  useEffect(() => {
    if (dialog !== null || !restoreResultFocus.current) return;
    restoreResultFocus.current = false;
    // Account/payment success replaces its trigger. Return to the result
    // landmark instead of leaving keyboard focus on the document body.
    document.querySelector<HTMLElement>('main')?.focus({ preventScroll: true });
  }, [dialog, credits]);
  const missing = preview === 'missing' && !recovered;
  const regression = optimization && preview === 'regression';
  const partial = preview === 'partial';
  const preserve = !optimization && preview === 'excellent';
  const lowFit = !optimization && preview === 'low-fit';
  const existing = !optimization && preview === 'existing';
  const score = missing ? null : regression ? 62 : optimization ? 86 : preserve ? 96 : lowFit ? 28 : 62;
  const before = optimization ? missing ? null : regression ? 86 : 62 : undefined;
  const title = optimization ? regression ? 'Vamos conferir o que mudou.' : 'Seu currículo está pronto para revisar.' : preserve ? 'Sua experiência já está bem apresentada.' : lowFit ? 'Esta vaga pede uma trajetória diferente.' : 'Sua experiência pode aparecer melhor.';
  const findings = regression ? resultExample.regressionFindings : optimization ? resultExample.changes : preserve ? resultExample.excellentFindings : lowFit ? resultExample.lowFitFindings : resultExample.findings;

  function openCheckout() {
    setPaymentState('ready');
    setAccountPurpose('checkout');
    setDialog(identified ? 'checkout' : 'account');
  }

  function openDocument(kind: 'document' | 'letter' | 'edit') {
    setDeliveryFailed(false);
    setDialog(kind);
  }

  function nextStep() {
    if (missing) return <ResultOffer eyebrow="Leitura indisponível" title="Recupere a análise antes de decidir." description="O currículo de demonstração continua disponível. Nenhuma nota foi presumida." primaryAction={{ label: 'Tentar carregar novamente', onClick: () => setRecovered(true) }} note="Esta ação recupera somente os dados fictícios da prévia." />;
    if (regression) return <ResultOffer eyebrow="Revise antes de usar" title="A estimativa caiu nesta versão." description="Compare o texto e preserve os fatos importantes. Um novo pagamento não corrige este resultado." primaryAction={{ label: 'Revisar currículo sem novo pagamento', onClick: () => openDocument('edit') }} note="Currículo e carta já estão incluídos no crédito usado." />;
    if (existing) return <ResultOffer eyebrow="Já está pronto" title="Você já tem uma versão para esta vaga." description="Abra a otimização concluída para revisar o currículo e a carta. Não é necessário comprar de novo." primaryAction={{ label: 'Abrir currículo otimizado', href: viewHref('optimization-result') }} />;
    if (lowFit || preserve) return <ResultOffer eyebrow={lowFit ? 'Compare outras oportunidades' : 'Preserve o que funciona'} title={lowFit ? 'Uma nova vaga pode fazer mais sentido.' : 'Uma nova otimização não é prioridade.'} description={lowFit ? 'A análise de exemplo indica distância dos requisitos. Reescrever não substitui a experiência pedida.' : 'O currículo de exemplo já está bem alinhado. Não há motivo para refazer esta versão só para aumentar a nota.'} primaryAction={{ label: 'Buscar outra vaga', onClick: () => setDialog('jobs') }} note="A decisão de se candidatar continua sendo sua." />;
    if (credits === null) return <ResultOffer eyebrow="Saldo não confirmado" title="Confira seu saldo antes de continuar." description="Não foi possível consultar os créditos. Isso não significa que seu saldo terminou." primaryAction={{ label: 'Atualizar saldo de demonstração', onClick: () => { restoreResultFocus.current = true; setCredits(2); } }} note={optimization ? 'O currículo e a carta atuais continuam disponíveis.' : 'A análise gratuita permanece disponível.'} />;
    if (credits > 0) return <ResultOffer eyebrow={`${credits} ${credits === 1 ? 'crédito disponível' : 'créditos disponíveis'} · demonstração`} title={optimization ? 'Prepare sua próxima candidatura.' : 'Transforme os ajustes em uma candidatura.'} description={optimization ? 'Use seu saldo na próxima vaga. O resultado atual permanece salvo no aplicativo.' : 'Um crédito cria o currículo adaptado e a carta para esta vaga.'} terms="Custo da geração: 1 crédito." primaryAction={optimization ? { label: 'Buscar a próxima vaga', onClick: () => setDialog('jobs') } : { label: 'Usar 1 crédito · iniciar prévia', href: viewHref('optimization-loading') }} note="Nenhum crédito real será utilizado nesta demonstração." />;
    return <ResultOffer eyebrow={optimization ? 'Para sua próxima vaga' : 'Próximo passo'} title={optimization ? 'Uma vaga nova merece uma versão própria.' : 'Leve estes ajustes para o currículo.'} description={optimization ? 'Prepare outro currículo e outra carta quando encontrar a próxima oportunidade.' : 'Crie o currículo e a carta para esta candidatura, com base nas experiências que você já tem.'} price={resultExample.price} terms={resultExample.terms} items={resultExample.included} primaryAction={{ label: 'Comprar 1 crédito por R$ 5,90', onClick: openCheckout }} note={optimization ? 'Seu resultado atual já está pago. A compra é opcional, para a próxima vaga.' : 'A análise continua grátis. Você confere a compra antes de pagar.'} />;
  }

  const summary = <Stack>
    <ResultScore label={optimization ? 'Leitura ATS · antes e depois' : 'Leitura ATS para esta vaga'} value={score} before={before} description={missing ? 'Leitura indisponível. Nenhum valor foi substituído por zero.' : regression ? 'A estimativa caiu 24 pontos. Revise as mudanças antes de usar esta versão.' : optimization ? '62 → 86 na estimativa interna deste exemplo. Não é uma chance de entrevista.' : 'Estimativa interna de aderência. Não mede sua capacidade e não prevê entrevista.'} beforeLabel="Antes" afterLabel="Depois" locale="pt-BR" />
    {optimization && <Inline gap="tight"><Button purpose="welcome" label="Ver currículo · prévia" onClick={() => openDocument('document')} /><Button purpose="welcome" label="Ver carta" onClick={() => openDocument('letter')} /></Inline>}
    {optimization && <Text variant="caption" tone="secondary">Documentos já incluídos no crédito usado. Sem novo pagamento para acessar.</Text>}
  </Stack>;

  return <>
    <ResultLayout context={`${resultExample.job} · ${resultExample.company} · exemplo fictício`} title={missing ? 'Esta leitura precisa ser recarregada.' : title} description={optimization ? 'Confira o que mudou e revise os documentos antes de se candidatar.' : 'Veja os pontos que já funcionam e os ajustes para esta vaga.'} mark={<BrandMark src="/demo-brand.svg" label="Curriculol" />} summary={summary} nextStep={nextStep()} evidence={missing ? undefined : <ResultFindings title={regression ? 'Antes de se candidatar' : optimization ? 'Uma mudança que importa' : preserve ? 'Seu ponto forte' : lowFit ? 'O principal desencontro' : 'O ajuste mais importante'} items={findings.slice(0, 1)} />}>
      <Text variant="caption" tone="secondary">Prévia com dados fictícios. Nenhum currículo foi analisado, pagamento realizado ou crédito utilizado.</Text>
      {regression && <Notice tone="warning" title="O resultado precisa de revisão" description="A comparação não indicou melhora. Confira os fatos e as mudanças; comprar mais créditos não corrige este resultado." />}
      <ResultSection title={optimization ? 'Compare as quatro dimensões' : 'Entenda a leitura técnica'} description={partial ? 'A dimensão de impacto não chegou. Ela permanece sem valor, sem média ou diferença presumida.' : 'Palavras-chave, estrutura e clareza de leitura. Valores de demonstração.'}>
        <Stack>{resultExample.dimensions.map(dimension => missing || partial && dimension.id === 'impact' ? <Text key={dimension.id} tone="secondary">{dimension.label} · leitura indisponível</Text> : <SegmentedMeter key={dimension.id} label={optimization ? `${dimension.label} · antes ${regression ? dimension.after : dimension.before}` : dimension.label} value={optimization ? regression ? dimension.before : dimension.after : preserve ? dimension.excellent : lowFit ? dimension.lowFit : dimension.before} tone="brand" />)}</Stack>
      </ResultSection>
      {missing ? <ResultSection title="Os achados não chegaram" description="Não há evidências disponíveis nesta simulação. Nenhum problema ou ponto positivo será inventado."><Inline><Button label="Recuperar achados de demonstração" onClick={() => setRecovered(true)} /></Inline></ResultSection> : <ResultFindings title={optimization ? 'Outros pontos para revisar' : preserve ? 'O que vale preservar' : lowFit ? 'Seu próximo passo' : 'Outros pontos para sua próxima versão'} items={findings.slice(1)} />}
      {optimization && !missing && <ResultSection title="Uma mudança no texto" description="Exemplo de reescrita do mesmo conteúdo, sem acrescentar experiência ou resultados não informados."><ResponsiveGrid><DocumentPreview name="Antes" subtitle="Resumo original · exemplo" sections={[{ id: 'before', title: 'Resumo', text: resultExample.beforeSummary }]} /><DocumentPreview name="Depois" subtitle="Resumo reorganizado · exemplo" sections={[resultExample.resume[0]]} /></ResponsiveGrid></ResultSection>}
      {optimization ? <ResultSection title="O documento continua sendo seu" description="Revise as informações. Editar, consultar ou baixar novamente esta versão não exige outro crédito.">
        <DocumentPreview name={resultExample.name} subtitle="Product designer · documento fictício" sections={resultExample.resume} note="Exemplo de apresentação. Nenhum arquivo real foi gerado." />
        <Inline gap="tight"><Button purpose="welcome" label="Revisar currículo" onClick={() => openDocument('edit')} /><Button purpose="welcome" label="Ver compartilhamento" onClick={() => setDialog('share')} /></Inline>
      </ResultSection> : <ResultSection title="As leituras por trás da análise" description="Anya avalia a leitura técnica. Vanellope observa a relação entre trajetória e vaga.">
        {missing ? <Text tone="secondary">Os relatórios também estão indisponíveis. Recupere a leitura acima; nenhuma conclusão foi presumida.</Text> : identified ? <Stack><Tabs label="Leitura do especialista" value={report} items={resultExample.reports.map(item => ({ id: item.id, label: item.id === 'anya' ? 'Anya' : 'Vanellope', content: <Text>{preserve ? item.excellent : lowFit ? item.lowFit : item.text}</Text> }))} onChange={setReport} variant="settings" /><Text variant="caption" tone="secondary">Arya é uma perspectiva opcional, não ativada automaticamente nesta prévia.</Text></Stack> : <Stack><Text>A nota e os achados acima são gratuitos. Identifique-se para guardar a análise e consultar os relatórios completos; não é necessário pagar.</Text><Inline><Button purpose="welcome" label="Simular acesso aos relatórios grátis" onClick={() => { setAccountPurpose('reports'); setDialog('account'); }} /></Inline></Stack>}
      </ResultSection>}
    </ResultLayout>

    <Dialog open={dialog === 'account'} onOpenChange={open => { if (!open) setDialog(null); }} title="Guarde a análise na sua conta" description="No aplicativo, o acesso é confirmado por e-mail. Esta prévia não pede dados nem envia código." actions={<Button purpose="welcome" variant="primary" label={accountPurpose === 'checkout' ? 'Simular identificação e conferir compra' : 'Simular identificação'} onClick={() => { restoreResultFocus.current = accountPurpose === 'reports'; setIdentified(true); setDialog(accountPurpose === 'checkout' ? 'checkout' : null); }} />}>
      <Text>Os relatórios completos continuam gratuitos. Identificar-se não compra créditos nem inicia uma otimização.</Text>
    </Dialog>

    <Dialog open={dialog === 'checkout'} onOpenChange={open => { if (!open) setDialog(null); }} title={paymentState === 'confirmed' ? 'Compra de demonstração concluída' : 'Confira sua compra · demonstração'} description="Nenhum dado de pagamento é solicitado. Não há cobrança, comprovante real ou nota fiscal." actions={paymentState === 'confirmed' ? <Button purpose="welcome" label="Voltar ao resultado" onClick={() => setDialog(null)} /> : <><Button purpose="welcome" label="Cancelar compra" onClick={() => setDialog(null)} /><Button purpose="welcome" variant="primary" label="Simular pagamento de R$ 5,90" onClick={() => { restoreResultFocus.current = true; setPaymentState('confirmed'); setCredits(current => (current ?? 0) + 1); }} /></>}>
      {paymentState === 'confirmed' ? <PaymentConfirmation title="1 crédito de demonstração disponível" merchant="Curriculol · prévia" description="Nenhum pagamento aconteceu. O recibo abaixo é ilustrativo." purchase={{ label: '1 crédito', description: 'Currículo e carta para uma vaga' }} receipt={{ title: 'Recibo ilustrativo — sem validade fiscal', items: [{ id: 'quantity', label: 'Quantidade', value: '1 crédito' }, { id: 'status', label: 'Estado', value: 'Simulação confirmada' }], total: { label: 'Total simulado', value: resultExample.price }, note: 'Compra única, sem assinatura. Créditos não expiram.' }} continueAction={optimization ? undefined : { label: 'Iniciar otimização de demonstração', onClick: () => navigate('optimization-loading') }} /> : <Stack><Text variant="metric">R$ 5,90</Text><Text>1 crédito para gerar currículo adaptado e carta de apresentação para uma vaga.</Text><Text variant="body-small" tone="secondary">{resultExample.terms}</Text>{paymentState === 'error' && <Notice tone="error" title="A simulação de pagamento falhou" description="Nenhum valor foi cobrado. Tente simular novamente ou cancele; o resultado permanece disponível." />}<Inline><Button label="Simular falha no pagamento" onClick={() => setPaymentState('error')} /></Inline></Stack>}
    </Dialog>

    <Dialog open={dialog === 'document' || dialog === 'letter' || dialog === 'edit'} onOpenChange={open => { if (!open) setDialog(null); }} title={dialog === 'letter' ? 'Carta de apresentação · demonstração' : dialog === 'edit' ? 'Revisão do currículo · demonstração' : 'Currículo pronto para revisar'} description="Documento fictício. Aqui você valida a apresentação; não existe arquivo real para baixar nem edição persistida." actions={<Button purpose="welcome" label="Voltar ao resultado" onClick={() => setDialog(null)} />}>
      <Stack>{dialog === 'letter' ? <DocumentPreview name="Carta para Ateliê Digital" subtitle="Exemplo fictício · Product designer sênior" sections={[{ id: 'letter', title: 'Apresentação', text: 'Tenho experiência em pesquisa, prototipação e colaboração com produto e engenharia. Gostaria de conversar sobre como essa trajetória se relaciona aos desafios da equipe.' }]} /> : <><SegmentedControl label="Modelo do currículo" value={template} options={[{ id: 'standard', label: 'Padrão' }, { id: 'lol', label: 'Curriculol' }]} onChange={setTemplate} /><DocumentPreview name={resultExample.name} subtitle={`${template === 'standard' ? 'Padrão' : 'Curriculol'} · visualização fictícia`} sections={resultExample.resume} /><Text variant="body-small" tone="secondary">A escolha registra o modelo nesta prévia. O renderizador de PDF e o editor reais não estão conectados.</Text></>}
      {deliveryFailed && <Notice tone="error" title="Falha de entrega simulada" description="O documento permanece disponível acima. Tente novamente para limpar a falha da prévia; nenhum crédito será usado." />}
      <Inline><Button label={deliveryFailed ? 'Tentar entrega novamente · prévia' : 'Simular falha de entrega'} onClick={() => setDeliveryFailed(current => !current)} /></Inline></Stack>
    </Dialog>
    <Dialog open={dialog === 'share'} onOpenChange={open => { if (!open) setDialog(null); }} title="Compartilhe a evolução, não seus dados" description="No aplicativo, o link público mostra somente o resultado compartilhável. O texto completo do currículo continua privado."><Text>Esta prévia não gera nem publica um link. Nenhum dado foi enviado a outro serviço.</Text></Dialog>
    <Dialog open={dialog === 'jobs'} onOpenChange={open => { if (!open) setDialog(null); }} title="Buscar outra vaga · demonstração" description="A busca de vagas ainda não está conectada a esta prévia." actions={<Button purpose="welcome" label="Voltar ao resultado" onClick={() => setDialog(null)} />}><Text>No aplicativo, este passo abre a busca para escolher outra oportunidade. Seu resultado atual continua disponível; nenhum crédito foi utilizado.</Text></Dialog>
  </>;
}

export default function ResultsPage({ mode }: { mode: ResultMode }) {
  const params = new URLSearchParams(location.search);
  const options = resultPreviewOptions.filter(option => mode === 'analysis' ? option.id !== 'regression' : !['anonymous', 'low-fit', 'excellent', 'existing'].includes(option.id));
  const requestedPreview = parseResultPreview(params.get('preview'));
  const [theme, setTheme] = useState<'light' | 'dark'>(params.get('theme') === 'light' ? 'light' : 'dark');
  const [preview, setPreview] = useState<ResultPreview>(options.some(option => option.id === requestedPreview) ? requestedPreview : 'default');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const viewHref = (view: string) => `?view=${view}&theme=${theme}`;

  useEffect(() => {
    document.documentElement.lang = 'pt-BR';
    document.title = `Resultado ${mode === 'analysis' ? 'da análise' : 'da otimização'} · Playground Curriculol`;
    document.querySelector<HTMLElement>('main')?.focus({ preventScroll: true });
  }, [mode]);

  function changePreview(value: string) {
    const next = parseResultPreview(value);
    setPreview(next);
    const url = new URL(location.href);
    url.searchParams.set('preview', next);
    history.replaceState(null, '', url);
  }

  return <DesignSystemProvider theme={theme} onThemeChange={setTheme} brandColor={"#ffa133"}>
    <AppShell contentWidth="full" collapsed={collapsed} onCollapsedChange={setCollapsed} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} navigationLabel="Navegação" closeNavigationLabel="Fechar navegação"
      sidebar={<><SidebarHeader closeLabel="Fechar navegação" expandLabel="Expandir menu" collapseLabel="Recolher menu"><Inline gap="tight"><BrandMark src="/demo-brand.svg" label="Curriculol" /><Text>Curriculol</Text></Inline></SidebarHeader><SidebarSection label="Playground"><NavItem label="Componentes" icon="Folder" href={`?view=components&theme=${theme}`} /><NavItem label="Resultado da análise" icon="ScanText" active={mode === 'analysis'} href={`?view=analysis-result&theme=${theme}`} /><NavItem label="Resultado da otimização" icon="FileText" active={mode === 'optimization'} href={`?view=optimization-result&theme=${theme}`} /></SidebarSection></>}
      header={<ContentHeader actions={<ThemeToggle label="Aparência da página" lightLabel="Claro" darkLabel="Escuro" />}><Text>Resultados · demonstração</Text></ContentHeader>}>
      <Stack gap="section"><ResultDemo key={`${mode}-${preview}`} mode={mode} preview={preview} viewHref={viewHref} /><ResultSection title="Estados da demonstração" description="Troque o cenário para validar recuperação, saldo e acesso. Nenhuma mudança é salva em uma conta."><Select label="Cenário de resultado" value={preview} options={options} onChange={changePreview} variant="field" /></ResultSection></Stack>
    </AppShell>
  </DesignSystemProvider>;
}
