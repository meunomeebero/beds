import { useState } from 'react';
import { BrandMark, Button, Inline, PricingSection, Select, Stack, Switch, Text, type PricingPlan } from 'beds';

const starterArt = new URL('./assets/pricing-starter.svg?no-inline', import.meta.url).href;
const proArt = new URL('./assets/pricing-pro.svg?no-inline', import.meta.url).href;
const formatProPrice = (value: number) => value < 100
  ? `R$ ${Math.round(value)}/mês`
  : `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} por mês`;

type DemoState = 'idle' | 'busy' | 'success' | 'error';
type DemoResult = { id: string; state: DemoState; message: string };
const initial: DemoResult = { id: '', state: 'idle', message: '' };

export default function PricingExamples() {
  const [result, setResult] = useState(initial);
  const [long, setLong] = useState(false);
  const [single, setSingle] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [current, setCurrent] = useState(false);
  const [media, setMedia] = useState('ready');
  const source = (art: string) => media === 'missing' ? '' : media === 'broken' ? 'data:image/png;base64,broken' : art;
  const choose = (id: string) => setResult({ id, state: 'busy', message: 'Preparando a seleção demonstrativa. Nenhuma cobrança será realizada.' });
  const plans: PricingPlan[] = [
    {
      id: 'starter', title: long ? 'Essencial para projetos pessoais e pequenas equipes' : 'Essencial',
      description: 'Um espaço para organizar seus primeiros projetos, no seu ritmo.',
      image: { src: source(starterArt), alt: '' }, price: { label: 'Grátis', description: 'Sem cobrança neste exemplo.' },
      featuresLabel: 'O que está incluído',
      features: empty ? [] : [
        { id: 'workspace', text: '1 espaço de trabalho' },
        { id: 'history', text: 'Histórico das atividades' },
        { id: 'export', text: long ? 'Exportação dos projetos com todos os documentos e informações que você adicionou' : 'Exportação dos projetos' },
      ],
      action: { label: current ? 'Plano atual' : 'Escolher Essencial', onClick: () => choose('starter'), disabled: current || result.state === 'busy' || result.id === 'starter' && result.state === 'success', busy: result.id === 'starter' && result.state === 'busy' },
      actionNote: current ? 'Plano atual apenas nesta demonstração.' : undefined,
      feedback: result.id === 'starter' ? result.message : undefined,
    },
    {
      id: 'pro', title: long ? 'Pro para equipes com vários projetos em andamento' : 'Pro', featured: true,
      description: long ? 'Mais espaço para trabalhar com sua equipe, organizar cada projeto e acompanhar as entregas em um só lugar.' : 'Mais espaço para trabalhar em equipe e acompanhar cada entrega.',
      image: { src: source(proArt), alt: '' },
      price: { label: long ? 'R$ 1.249,90 por mês' : 'R$ 49/mês', amount: { value: long ? 1249.9 : 49, format: formatProPrice }, description: 'Cobrança mensal. Valor demonstrativo.' },
      featuresLabel: 'Tudo do Essencial, mais',
      features: empty ? [] : [
        { id: 'team', text: '5 pessoas no espaço de trabalho' },
        { id: 'projects', text: long ? 'Organização de múltiplos projetos com acompanhamento compartilhado das atividades e dos responsáveis' : 'Projetos compartilhados' },
        { id: 'support', text: 'Atendimento prioritário' },
      ],
      action: { label: long ? 'Escolher Pro para continuar com minha equipe' : 'Escolher Pro', onClick: () => choose('pro'), disabled: result.state === 'busy' || result.id === 'pro' && result.state === 'success', busy: result.id === 'pro' && result.state === 'busy' },
      feedback: result.id === 'pro' ? result.message : undefined,
    },
  ];
  return <Stack gap="section">
    <PricingSection headingLevel={1} title="Um plano para cada momento" description="Planos e valores demonstrativos. Nenhuma contratação será realizada." mark={<BrandMark label="Curriculol" />} plans={single ? plans.slice(0, 1) : plans} />
    <Stack>
      <Text variant="section-title">Testar o componente</Text>
      {result.state === 'busy' && <Inline gap="tight">
        <Button label="Concluir simulação" onClick={() => setResult({ ...result, state: 'success', message: 'Plano selecionado somente no exemplo. Nenhuma assinatura foi criada.' })} />
        <Button label="Simular falha" onClick={() => setResult({ ...result, state: 'error', message: 'Não foi possível concluir o exemplo. Escolha o plano novamente para tentar de novo; nenhuma cobrança foi realizada.' })} />
      </Inline>}
      <Select label="Imagem" value={media} onChange={setMedia} options={[{ id: 'ready', label: 'Disponível' }, { id: 'broken', label: 'Falha ao carregar' }, { id: 'missing', label: 'Sem arquivo' }]} />
      <Switch label="Testar texto longo" checked={long} onChange={setLong} />
      <Switch label="Mostrar apenas um plano" checked={single} onChange={setSingle} />
      <Switch label="Ocultar lista de benefícios" checked={empty} onChange={setEmpty} />
      <Switch label="Essencial como plano atual" checked={current} onChange={setCurrent} />
      <Button label="Restaurar exemplos" variant="ghost" onClick={() => { setResult(initial); setLong(false); setSingle(false); setEmpty(false); setCurrent(false); setMedia('ready'); }} />
    </Stack>
  </Stack>;
}
