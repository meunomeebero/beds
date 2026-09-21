import { HomeHeader } from './recipes';
import { useState } from 'react';
import { Button, EmptyState, EmptyStateCard, Inline, ResultsStatus, Select, Stack, Switch, useDesignSystem } from 'beds';

const lightArtwork = new URL('./assets/empty-state-light.svg?no-inline', import.meta.url).href;
const darkArtwork = new URL('./assets/empty-state-dark.svg?no-inline', import.meta.url).href;

export default function EmptyStateExamples() {
  const { theme } = useDesignSystem();
  const [example, setExample] = useState(() => new URLSearchParams(location.search).get('preview') === 'folder' ? 'applications' : 'clear');
  const [imageState, setImageState] = useState('ready');
  const [decorative, setDecorative] = useState(true);
  const [feedback, setFeedback] = useState('');
  const firstUse = ['first-use', 'long', 'busy', 'disabled'].includes(example);
  const folder = ['applications', 'jobs', 'folder-long'].includes(example);
  const long = example === 'long';
  const artwork = theme === 'light' ? lightArtwork : darkArtwork;
  const src = imageState === 'missing' ? '' : imageState === 'broken' ? 'data:image/png;base64,invalid' : artwork;

  return <Stack gap="section">
    <HomeHeader title="Um pouco de espaço" description="Estados vazios que explicam o momento, sem adicionar ruído. Demonstração local." />
    {example === 'compact'
      ? <EmptyState title="Nenhum processo em andamento" description="Novas atividades aparecerão aqui." icon="Inbox" />
      : folder ? <EmptyStateCard
          illustration="empty-folder"
          icon={example === 'jobs' ? 'Search' : 'Briefcase'}
          title={example === 'jobs' ? 'Nenhuma vaga por aqui' : example === 'folder-long' ? 'Nenhuma candidatura para oportunidades em pesquisa, acessibilidade e design de produto por enquanto' : 'Sua primeira candidatura começa aqui'}
          description={example === 'jobs' ? 'Não encontramos vagas com esses filtros. Experimente ampliar sua busca.' : 'Salve uma vaga que combine com você. Seus próximos passos ficam organizados aqui.'}
          action={{ label: example === 'jobs' ? 'Rever filtros' : example === 'folder-long' ? 'Explorar oportunidades de acordo com meu perfil profissional' : 'Buscar vagas', onClick: () => setFeedback(example === 'jobs' ? 'Revisão de filtros selecionada nesta demonstração. Nenhuma consulta foi enviada.' : 'Busca de vagas selecionada nesta demonstração. Nenhuma consulta foi enviada.') }}
        />
      : <EmptyStateCard
          title={long ? 'Nenhuma candidatura para oportunidades em pesquisa, acessibilidade e design de produto por enquanto' : firstUse ? 'Sua próxima oportunidade começa aqui' : 'Tudo em dia por aqui'}
          description={long ? 'Explore oportunidades de acordo com seu momento profissional. Quando encontrar uma vaga que faça sentido, salve-a para organizar os próximos passos e acompanhar sua candidatura com calma.' : firstUse ? 'Encontre uma vaga e salve sua primeira candidatura.' : 'Nenhum processo pendente. Seus próximos passos podem esperar um pouco.'}
          icon={firstUse ? 'Briefcase' : 'Inbox'}
          image={{ src, alt: decorative ? '' : 'Ilustração de uma lista organizada diante de uma paisagem tranquila.', fallbackLabel: 'Ilustração indisponível' }}
          action={firstUse ? { label: long ? 'Explorar oportunidades de acordo com meu perfil profissional' : example === 'busy' ? 'Buscando oportunidades' : 'Buscar vagas', busy: example === 'busy', disabled: example === 'disabled', onClick: () => setFeedback('Busca de vagas selecionada nesta demonstração. Nenhuma consulta foi enviada.') } : undefined}
        />}
    <Stack>
      <Inline align="between">
        <Select label="Situação" value={example} onChange={value => { setExample(value); setFeedback(''); }} options={[
          { id: 'applications', label: 'Sem candidaturas' }, { id: 'jobs', label: 'Sem vagas' }, { id: 'folder-long', label: 'Pasta com texto longo' },
          { id: 'clear', label: 'Tudo em dia' }, { id: 'first-use', label: 'Primeiro uso' }, { id: 'long', label: 'Texto longo' },
          { id: 'busy', label: 'Ação em espera' }, { id: 'disabled', label: 'Ação indisponível' }, { id: 'compact', label: 'Compacto existente' },
        ]} />
        {!folder && <Select label="Ilustração" value={imageState} onChange={setImageState} options={[
          { id: 'ready', label: 'Disponível' }, { id: 'broken', label: 'Falha ao carregar' }, { id: 'missing', label: 'Sem arquivo' },
        ]} />}
      </Inline>
      {!folder && <Switch label="Ilustração apenas decorativa" checked={decorative} onChange={setDecorative} />}
      <ResultsStatus>{feedback}</ResultsStatus>
      <Button label="Restaurar exemplo" variant="ghost" onClick={() => { setExample('clear'); setImageState('ready'); setDecorative(true); setFeedback(''); }} />
    </Stack>
  </Stack>;
}
