import { useState } from 'react';
import { Button, FeatureCard, Notice, PageHeader, ResponsiveGrid, Select, Stack, Switch, Text } from 'beds';

const artwork = new URL('./assets/feature-onboarding.svg?no-inline', import.meta.url).href;

export default function FeatureCardExamples() {
  const [imageState, setImageState] = useState('ready');
  const [actionState, setActionState] = useState('ready');
  const [secondary, setSecondary] = useState(true);
  const [longCopy, setLongCopy] = useState(false);
  const [status, setStatus] = useState('');
  const [decorative, setDecorative] = useState(false);
  const source = imageState === 'empty' ? '' : imageState === 'broken' ? 'data:image/png;base64,invalid' : artwork;

  return <Stack gap="section">
    <PageHeader title="Card de apresentação" description="Imagem, contexto e um próximo passo. Para onboarding, novidades e descoberta de recursos." />
    <ResponsiveGrid>
      <FeatureCard
        image={{ src: source, alt: decorative ? '' : 'Conversa ilustrativa com a Lucy para organizar um perfil profissional.', fallbackLabel: 'Prévia indisponível' }}
        title={longCopy ? 'Um ponto de partida para organizar toda a sua trajetória profissional' : 'Seu próximo passo começa aqui'}
        description={longCopy ? 'Reúna suas experiências, projetos e habilidades em um só lugar. A partir dessa base, você pode preparar novos currículos e explorar oportunidades no seu ritmo, sem precisar recomeçar a cada vaga.' : 'Conte sua história para a Lucy e organize um perfil pronto para as próximas oportunidades.'}
        primaryAction={{ label: actionState === 'busy' ? 'Preparando seu perfil' : longCopy ? 'Começar a organizar minha trajetória' : 'Montar meu perfil', onClick: () => setStatus('Exemplo iniciado. Nenhum dado foi enviado.'), busy: actionState === 'busy', disabled: actionState === 'disabled' }}
        secondaryAction={secondary ? { label: 'Saiba mais', onClick: () => setStatus('O card apresenta um recurso. A aplicação decide o que acontece em cada ação.') } : undefined}
      />
      <Stack>
        <Text variant="section-title">Experimente os estados</Text>
        <Text tone="secondary">Conteúdo e ações são configuráveis. Tipografia, cores, cantos e espaçamento pertencem ao DS.</Text>
        <Select label="Imagem do exemplo" value={imageState} onChange={setImageState} options={[{ id: 'ready', label: 'Imagem disponível' }, { id: 'broken', label: 'Falha ao carregar' }, { id: 'empty', label: 'Sem arquivo' }]} />
        <Select label="Ação principal" value={actionState} onChange={setActionState} options={[{ id: 'ready', label: 'Disponível' }, { id: 'busy', label: 'Em espera' }, { id: 'disabled', label: 'Desabilitada' }]} />
        <Switch label="Mostrar ação secundária" checked={secondary} onChange={setSecondary} />
        <Switch label="Testar texto longo" checked={longCopy} onChange={setLongCopy} />
        <Switch label="Imagem apenas decorativa" checked={decorative} onChange={setDecorative} />
        {status && <Notice title="Demonstração local" description={status} onDismiss={() => setStatus('')} />}
        <Button label="Restaurar exemplo" variant="ghost" onClick={() => { setImageState('ready'); setActionState('ready'); setSecondary(true); setLongCopy(false); setDecorative(false); setStatus(''); }} />
      </Stack>
    </ResponsiveGrid>
  </Stack>;
}
