import { AppShell } from './recipes';
import { useState } from 'react';
import { Badge, DesignSystemProvider, Dialog, Inline, PageHeader, ResponsiveGrid, ResultsStatus, SegmentedMeter, Select, Stack, Text, ThemeToggle } from 'beds';
import { ApplicationCard } from './recipes';

export default function ApplicationCardPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => new URLSearchParams(location.search).get('theme') === 'light' ? 'light' : 'dark');
  const [selected, setSelected] = useState(false);
  const [status, setStatus] = useState('ready');
  const [detail, setDetail] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scoreValue, setScoreValue] = useState('92');
  const [scoreKind, setScoreKind] = useState<'ats' | 'fit' | 'match'>('ats');
  return <DesignSystemProvider theme={theme} onThemeChange={setTheme} brandColor={"#ffa133"}>
    <AppShell sidebar={<ThemeToggle />} contentWidth="dashboard" collapsed={collapsed} onCollapsedChange={setCollapsed} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen}><Stack gap="section">
      <PageHeader title="Card de candidatura" description="Identidade, contexto pessoal, documentos e próximo passo. Dados fictícios." />
      <ResultsStatus>{selected ? '1 candidatura selecionada' : 'Nenhuma candidatura selecionada'}</ResultsStatus>
      <Inline gap="default">
        <Badge label="Salva" purpose="status" />
        <Badge label="Pronta para enviar" purpose="status" tone="success" />
        <Badge label="Em preparação" purpose="status" tone="warning" />
        <Badge label="Precisa de atenção" purpose="status" tone="error" />
        <Badge label="Em análise" purpose="status" tone="info" />
        <Badge label="Novo" />
      </Inline>
      <ResponsiveGrid>
        <ApplicationCard title="Product designer sênior" company="Ateliê Digital" companyImage="data:image/png;base64,invalid" status={{ id: status, label: status === 'ready' ? 'Pronta para enviar' : 'Enviada', tone: 'success' }}
          date={{ label: 'Adicionada em 13 de set.', dateTime: '2026-09-13' }} location="São Paulo · Híbrido" salary="R$ 12 mil – R$ 16 mil" source="Busca de vagas" keywords={['Produto', 'Design systems', 'Figma']} tag="Favorita"
          note={{ text: 'Adorei o produto. Vale contar sobre o projeto de design system.', onOpen: () => setDetail('Anotação completa') }}
          score={scoreKind === 'ats' ? { kind: 'ats', value: Number(scoreValue), before: 68, explanation: 'Alinhamento do currículo com a vaga. Não é uma probabilidade de contratação.' } : { kind: scoreKind, value: Number(scoreValue), explanation: 'Afinidade da vaga com o perfil profissional. Não é a nota ATS do currículo.' }}
          documents={[{ id: 'cv', label: 'Currículo', onOpen: () => setDetail('Currículo demonstrativo') }, { id: 'letter', label: 'Carta', onOpen: () => setDetail('Carta demonstrativa') }]}
          selection={{ checked: selected, onChange: setSelected }} primaryAction={status === 'ready' ? { label: 'Marcar como enviada', onClick: () => setStatus('sent') } : undefined} onOpen={() => setDetail('Detalhes da candidatura')} />
        <ApplicationCard title="Especialista em experiência de plataformas com um título deliberadamente longo para testar a quebra natural do conteúdo" company="Empresa de pesquisa e desenvolvimento de produtos digitais" status={{ id: 'pending', label: 'Salva' }}
          score={{ kind: 'fit', value: 88.9, explanation: 'Afinidade da vaga com o perfil profissional. Não é a nota ATS do currículo.' }} location="Brasil · Remoto" onOpen={() => setDetail('Vaga salva')} jobHref="https://example.com" />
        <ApplicationCard title="Senior UX designer" company="Órbita" status={{ id: 'processing', label: 'Em preparação', tone: 'warning' }} score={{ kind: 'processing', label: 'Preparando seu currículo' }} feedback="A atividade está na fila de demonstração." onOpen={() => setDetail('Processamento demonstrativo')} />
        <ApplicationCard title="Product designer" company="Núcleo" status={{ id: 'failed', label: 'Precisa de atenção', tone: 'error' }} score={{ kind: 'unavailable', label: 'ATS ainda não disponível' }} feedback="Não foi possível concluir a preparação. Tente novamente." primaryAction={{ label: 'Tentar novamente', onClick: () => setDetail('Nova tentativa simulada') }} onOpen={() => setDetail('Detalhes do erro')} />
      </ResponsiveGrid>
      <Stack>
        <Text variant="section-title">Testar o medidor</Text>
        <Select label="Nota do exemplo" value={scoreValue} onChange={setScoreValue} options={['92', '0', '1', '29', '99', '100', '-1', '101', 'NaN'].map(value => ({ id: value, label: value === 'NaN' ? 'Inválida' : value }))} />
        <Select label="Tipo da nota" value={scoreKind} onChange={value => setScoreKind(value === 'ats' ? 'ats' : value === 'fit' ? 'fit' : 'match')} options={[{ id: 'ats', label: 'ATS' }, { id: 'fit', label: 'FIT' }, { id: 'match', label: 'Compatibilidade' }]} />
        <SegmentedMeter label="Medidor compartilhado" value={Number(scoreValue)} tone="brand" />
      </Stack>
      <Dialog open={Boolean(detail)} onOpenChange={value => { if (!value) setDetail(''); }} title={detail || 'Detalhes'}><Text>Exemplo local. Nenhum documento, cobrança ou envio real.</Text></Dialog>
    </Stack></AppShell>
  </DesignSystemProvider>;
}
