import { useState } from 'react';
import { AppShell } from './recipes';
import { Badge, BinaryQuestionList, Button, ChangeSummary, ChipChecklist, ConfettiBurst, ContentHeader, DesignSystemProvider, Inline, NextStepCard, PageHeader, ResponsiveGrid, ScoreComparison, SelectionNote, SidebarHeader, Stack, Text, TextLink, ThemeToggle, type ChoiceStatus, type Theme } from 'beds';

const criteria = (lit: boolean) => ({
  title: 'Por critério',
  items: [
    { id: 'keywords', label: 'Palavras-chave', before: 41, after: lit ? 78 : 44, accessibleLabel: lit ? 'Palavras-chave: antes 41, agora 78 de 100.' : 'Palavras-chave: antes 41, agora 44 de 100.' },
    { id: 'format', label: 'Formatação', before: 80, after: 80, accessibleLabel: 'Formatação: antes 80, agora 80 de 100.' },
    { id: 'sections', label: 'Seções', before: 62, after: lit ? 74 : 60, accessibleLabel: lit ? 'Seções: antes 62, agora 74 de 100.' : 'Seções: antes 62, agora 60 de 100.' },
    { id: 'impact', label: 'Impacto', before: 55, after: lit ? 70 : 57, accessibleLabel: lit ? 'Impacto: antes 55, agora 70 de 100.' : 'Impacto: antes 55, agora 57 de 100.' },
  ],
});

/** Synthetic fixtures for the 0.3.0-rc.3 result patterns: score board (celebrated, neutral, unavailable), summaries, next step and choice cards. */
export default function ResultPatternsPage() {
  const params = new URLSearchParams(location.search);
  const [theme, setTheme] = useState<Theme>(params.get('theme') === 'dark' ? 'dark' : 'light');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [burst, setBurst] = useState(0);
  const [chosen, setChosen] = useState<string[]>(['figma']);
  const [answers, setAnswers] = useState<Record<string, 'yes' | 'no' | null>>({ sql: 'yes', grafana: null, kafka: 'no' });
  const [emphasis, setEmphasis] = useState(false);
  const chipStatus: ChoiceStatus = chosen.length ? { phase: 'saved', text: `${chosen.length} ${chosen.length === 1 ? 'item confirmado' : 'itens confirmados'}. Eles entram na próxima versão.` } : { phase: 'idle' };

  return <DesignSystemProvider theme={theme} onThemeChange={setTheme} brandColor="#ff5a00">
    <AppShell collapsed={collapsed} onCollapsedChange={setCollapsed} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} contentWidth="full" sidebar={<SidebarHeader><Text>Catálogo</Text></SidebarHeader>}>
      <ContentHeader actions={<ThemeToggle label="Aparência" lightLabel="Claro" darkLabel="Escuro" />}>
        <Inline><TextLink href={`?view=components&theme=${theme}`}>Componentes</TextLink><Text>Padrões de resultado</Text></Inline>
      </ContentHeader>
      <Stack gap="section">
        <PageHeader title="Padrões de resultado" description="Placar antes e depois, o que mudou, o próximo passo e as perguntas rápidas. Dados de demonstração." />

        <ResponsiveGrid>
          <ScoreComparison label="Nota estimada para este pedido" value={72} before={51} beforeLabel="Antes" afterLabel="Agora" accessibleSummary="Antes 51, agora 72 de 100. Subiu 21 pontos." gain={{ label: '+21', unit: 'pontos' }} band={{ text: 'Entrou na faixa forte.', emphasis: true }} criteria={criteria(true)} notes={['Estimativa medida do mesmo jeito nos dois lados.']} onGainShown={() => setBurst(Date.now())} />
          <ScoreComparison label="Nota estimada para este pedido" value={54} before={51} beforeLabel="Antes" afterLabel="Agora" accessibleSummary="Antes 51, agora 54 de 100." band={{ text: 'Continua abaixo da faixa forte.' }} criteria={criteria(false)} notes={['Abaixo de +5 o placar fica neutro: sem destaque, sem comemoração.']} />
          <ScoreComparison label="Nota estimada para este pedido" value={null} before={null} beforeLabel="Antes" afterLabel="Agora" accessibleSummary="" status="Não deu para comparar as duas versões do mesmo jeito. O crédito voltou para a sua conta." />
        </ResponsiveGrid>
        <Inline><Button label="Comemorar de novo" variant="outline" compact onClick={() => setBurst(Date.now())} /><Text variant="caption" tone="secondary">Confete só para um ganho medido; nunca sob movimento reduzido.</Text></Inline>

        <ResponsiveGrid>
          <ChangeSummary title="O que mudou nesta versão" groups={[
            { id: 'terms', title: 'Termos que entraram', helper: 'Cada um aparece onde você já tinha a experiência.', items: ['Design systems', 'Pesquisa com usuários', 'Acessibilidade', 'Figma'] },
            { id: 'facts', title: 'Fatos destacados', action: { label: 'Ver no documento', href: '#documento' }, items: ['Liderou 3 squads', 'Reduziu 30% do retrabalho'] },
          ]} lines={['Partes reescritas: resumo e 2 experiências.']} footer={{ text: 'Ainda faltam: Kafka, Grafana e mais 2.', action: { label: 'Confirmar o que você sabe', onClick: () => undefined } }} />
          <SelectionNote title="Foco desta versão" summary="Esta versão usa 4 das suas 6 experiências. O seu perfil continua completo." groups={[
            { id: 'out', title: 'Ficaram de fora', rows: [{ id: 'a', title: 'Assistente administrativo', meta: 'Empresa Exemplo · 2015–2016', reason: 'Fora do foco' }, { id: 'b', title: 'Estágio em atendimento', meta: '2014', reason: 'Mais antiga' }] },
            { id: 'short', title: 'Resumidas', rows: [{ id: 'c', title: 'Designer gráfico', meta: 'Estúdio Norte · 2016–2019', reason: 'Encurtada' }] },
          ]} footer={{ text: 'Nada foi apagado do seu perfil.' }} />
        </ResponsiveGrid>

        <ResponsiveGrid>
          <Stack gap="tight">
            <Inline><Badge label="Recomendado" tone="info" purpose="status" /></Inline>
            <Text variant="body" tone="secondary">Variante recomendada: começa pelo que falta, sem número nem veredito.</Text>
            <NextStepCard title="O seu documento ainda mostra pouco do que este pedido quer." actions={<><Button label="Analisar outro pedido" variant="primary" onClick={() => undefined} /><Button label="Preparar mesmo assim" onClick={() => undefined} /></>} note="Preparar custa 1 crédito. Se a nota não subir, o crédito volta." />
          </Stack>
          <NextStepCard title="Próximo pedido" momentum={emphasis ? 'Bom ritmo: mais um para hoje?' : undefined} description="Leve o mesmo cuidado para a próxima oportunidade." emphasis={emphasis} actions={<><Button label="Analisar o próximo" variant="primary" onClick={() => undefined} /><Button label={emphasis ? 'Tirar destaque' : 'Destacar (baixou o arquivo)'} variant="ghost" compact onClick={() => setEmphasis(value => !value)} /></>} />
        </ResponsiveGrid>

        <ResponsiveGrid>
          <ChipChecklist title="O pedido cita, o documento não mostra" description="Marque só o que você explicaria numa conversa." lockedNote="já está no seu perfil" options={[{ id: 'figma', label: 'Figma' }, { id: 'a11y', label: 'Acessibilidade' }, { id: 'research', label: 'Pesquisa com usuários' }, { id: 'tokens', label: 'Design tokens', locked: true }, { id: 'motion', label: 'Animação de interface' }]} value={chosen} onChange={setChosen} status={chipStatus} />
          <BinaryQuestionList title="Antes de preparar: 3 perguntas rápidas" description="Responder leva segundos e deixa a versão mais fiel a você." questions={[
            { id: 'sql', prompt: <>O pedido cita <strong>SQL</strong>. Você já usou no trabalho?</>, answer: answers.sql ?? null },
            { id: 'grafana', prompt: <>O pedido cita <strong>Grafana</strong>. Você já usou no trabalho?</>, answer: answers.grafana ?? null },
            { id: 'kafka', prompt: <>O pedido cita <strong>Kafka</strong>. Você já usou no trabalho?</>, answer: answers.kafka ?? null },
          ]} yesLabel="Sim" noLabel="Não" onAnswer={(id, answer) => setAnswers(current => ({ ...current, [id]: answer }))} help="Diga sim só ao que você explicaria numa entrevista." status={{ phase: 'saved', text: 'Salvo no seu perfil: SQL.', action: { label: 'Desfazer', onClick: () => setAnswers({ sql: null, grafana: null, kafka: null }) } }} />
        </ResponsiveGrid>
      </Stack>
      <ConfettiBurst burst={burst} />
    </AppShell>
  </DesignSystemProvider>;
}
