import { HomeHeader } from './recipes';
import { useState } from 'react';
import { ApprovalCard, Button, DecisionStatus, Inline, QuestionCard, RadioGroup, ResultsStatus, Stack, Switch, Text, type DecisionState } from 'beds';

const labels: Record<DecisionState, string> = { approval: 'Aprovação', confirmation: 'Confirmação', processing: 'Confirmando', success: 'Confirmado', skipped: 'Pulado', denied: 'Negado', error: 'Não confirmado' };
type ExampleState = { state: DecisionState; feedback: string };
const initialApproval: ExampleState = { state: 'approval', feedback: '' };
const initialQuestion: ExampleState = { state: 'confirmation', feedback: '' };

export default function DecisionExamples() {
  const [access, setAccess] = useState(initialApproval);
  const [batch, setBatch] = useState(initialApproval);
  const [question, setQuestion] = useState(initialQuestion);
  const [value, setValue] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [long, setLong] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [classic, setClassic] = useState('email');
  const [radioValue, setRadioValue] = useState('remote');
  const [radioMode, setRadioMode] = useState<'accept' | 'lag' | 'reject'>('accept');
  const [radioChanges, setRadioChanges] = useState(0);
  const [radioFeedback, setRadioFeedback] = useState('A próxima escolha é aceita imediatamente.');
  const options = unavailable ? [] : [
    { id: 'remote', label: long ? 'Trabalho remoto com colaboração entre equipes distribuídas em diferentes regiões' : 'Remoto' },
    { id: 'hybrid', label: long ? 'Modelo híbrido com encontros presenciais previamente combinados com a equipe' : 'Híbrido' },
    { id: 'office', label: 'Presencial' },
    { id: 'later', label: 'A definir — indisponível neste exemplo', disabled: true },
  ];
  const start = (set: (value: ExampleState) => void) => set({ state: 'processing', feedback: 'Aguardando o resultado simulado. Nenhuma operação real foi iniciada.' });
  const settle = (set: (value: ExampleState) => void, failed = false) => set({ state: failed ? 'error' : 'success', feedback: failed ? 'Não foi possível confirmar o exemplo. Tente novamente; nenhuma operação foi realizada.' : 'Confirmado somente nesta demonstração. Nenhuma operação real foi realizada.' });
  const status = (state: DecisionState) => ({ state, label: long && state === 'approval' ? 'Aguardando aprovação para continuar esta atividade' : labels[state] });
  const radioOptions = [{ id: 'remote', label: 'Remoto' }, { id: 'hybrid', label: 'Híbrido' }, { id: 'office', label: 'Presencial' }, { id: 'later', label: 'A definir — indisponível neste exemplo', disabled: true }];
  const changeRadio = (next: string) => {
    setRadioChanges(count => count + 1);
    if (radioMode === 'reject') {
      setRadioFeedback(`Escolha rejeitada; valor mantido em ${radioOptions.find(option => option.id === radioValue)?.label}.`);
      return;
    }
    if (radioMode === 'lag') {
      setRadioFeedback('Escolha aguardando aceitação controlada.');
      window.setTimeout(() => { setRadioValue(next); setRadioFeedback(`Escolha aceita: ${radioOptions.find(option => option.id === next)?.label}.`); }, 180);
      return;
    }
    setRadioValue(next);
    setRadioFeedback(`Escolha aceita: ${radioOptions.find(option => option.id === next)?.label}.`);
  };
  return <Stack gap="section">
    <HomeHeader title="Uma decisão de cada vez" description="Perguntas e aprovações com contexto. Todos os exemplos são locais; nenhuma permissão ou operação é executada." />
    <Stack>
      <ApprovalCard title={long ? 'Permitir que a Lucy consulte as experiências profissionais e a formação do currículo selecionado?' : 'Permitir acesso ao currículo?'} description="Lucy poderá ler o arquivo selecionado. Nenhum arquivo será enviado nesta demonstração." status={status(access.state)} feedback={access.feedback}
        primaryAction={{ label: 'Permitir', onClick: () => start(setAccess) }}
        alternativeAction={{ label: long ? 'Sempre permitir a leitura dos arquivos que eu selecionar' : 'Sempre permitir', onClick: () => setAccess({ state: 'success', feedback: '“Sempre permitir” selecionado apenas no exemplo. Nenhuma preferência foi salva.' }) }}
        secondaryAction={{ label: 'Negar', onClick: () => setAccess({ state: 'denied', feedback: 'Acesso negado no exemplo. Nenhum arquivo foi consultado.' }) }} />
      {access.state === 'processing' && <Inline gap="tight"><Button label="Concluir simulação de acesso" onClick={() => settle(setAccess)} /><Button label="Simular falha de acesso" onClick={() => settle(setAccess, true)} /></Inline>}
    </Stack>
    <Stack>
      <ApprovalCard title="Preparar 3 candidaturas?" description="Confira os documentos antes de continuar." status={status(batch.state)} feedback={batch.feedback}
        details={[{ id: 'resume', label: long ? 'Currículos adaptados às oportunidades selecionadas' : 'Currículos', value: '3 arquivos' }, { id: 'letter', label: 'Cartas de apresentação', value: '3 arquivos' }, { id: 'total', label: 'Total', value: '6 arquivos', emphasis: true }]}
        context={{ icon: 'FileText', label: 'Lote demonstrativo · sem execução na fila real' }}
        primaryAction={{ label: long ? 'Permitir a preparação dos documentos selecionados' : 'Permitir', onClick: () => start(setBatch) }}
        secondaryAction={{ label: 'Pular', onClick: () => setBatch({ state: 'skipped', feedback: 'Etapa pulada no exemplo. Nenhum documento foi criado.' }) }} />
      {batch.state === 'processing' && <Inline gap="tight"><Button label="Concluir simulação do lote" onClick={() => settle(setBatch)} /><Button label="Simular falha do lote" onClick={() => settle(setBatch, true)} /></Inline>}
    </Stack>
    <Stack>
      <QuestionCard title={long ? 'Qual formato de trabalho faz mais sentido para seu próximo momento profissional?' : 'Como você prefere trabalhar?'} description={unavailable ? 'Nenhuma opção disponível. Você pode pular esta pergunta ou restaurar o exemplo.' : 'Escolha uma opção e confirme para continuar.'} status={status(question.state)} feedback={question.feedback}
        options={options} value={value} onChange={next => { setValue(next); setError(''); }}
        onConfirm={answer => {
          if (!answer) { setError(unavailable ? 'Nenhuma opção disponível. Pule esta pergunta ou restaure o exemplo.' : 'Escolha uma opção antes de confirmar.'); return; }
          setError(''); start(setQuestion);
        }}
        error={error} confirmLabel={long ? 'Confirmar minha preferência de formato de trabalho' : 'Confirmar resposta'}
        skipAction={{ label: 'Pular', onClick: () => { setError(''); setQuestion({ state: 'skipped', feedback: 'Pergunta pulada no exemplo. Nenhuma resposta foi enviada.' }); } }} />
      {question.state === 'processing' && <Inline gap="tight"><Button label="Concluir simulação da resposta" onClick={() => settle(setQuestion)} /><Button label="Simular falha da resposta" onClick={() => settle(setQuestion, true)} /></Inline>}
    </Stack>
    <Stack>
      <Text variant="section-title">Estados da decisão</Text>
      <Inline gap="tight">{(Object.keys(labels) as DecisionState[]).map(state => <DecisionStatus key={state} state={state} label={labels[state]} />)}</Inline>
      <Switch label="Testar texto longo" checked={long} onChange={setLong} />
      <Switch label="Testar pergunta sem opções" checked={unavailable} onChange={next => { setUnavailable(next); setError(''); }} />
      <Button label="Restaurar exemplos" variant="ghost" onClick={() => { setAccess(initialApproval); setBatch(initialApproval); setQuestion(initialQuestion); setValue(null); setError(''); setLong(false); setUnavailable(false); }} />
      <RadioGroup label="Controle compacto existente" value={classic} onChange={setClassic} options={[{ id: 'email', label: 'E-mail' }, { id: 'phone', label: 'Telefone' }]} />
    </Stack>
    <Stack>
      <Text variant="section-title">RadioGroup controlado</Text>
      <Text tone="secondary">Fixture local para aceitação imediata, atraso e rejeição; nenhuma escolha é enviada.</Text>
      <Inline gap="tight">
        <Button label="Aceitar agora" compact onClick={() => { setRadioMode('accept'); setRadioFeedback('A próxima escolha é aceita imediatamente.'); }} />
        <Button label="Atrasar escolha" compact onClick={() => { setRadioMode('lag'); setRadioFeedback('A próxima escolha aguarda 180 ms.'); }} />
        <Button label="Rejeitar escolha" compact onClick={() => { setRadioMode('reject'); setRadioFeedback('A próxima escolha será rejeitada.'); }} />
        <Button label="Definir presencial externamente" compact onClick={() => { setRadioMode('accept'); setRadioValue('office'); setRadioFeedback('Escolha externa: Presencial.'); }} />
      </Inline>
      <RadioGroup label="Preferência controlada com nome explícito" name="ber30-custom-name" value={radioValue} onChange={changeRadio} options={radioOptions} />
      <RadioGroup label="Segunda instância com nome gerado" value={radioValue} onChange={changeRadio} options={radioOptions} />
      <ResultsStatus>{`${radioFeedback} Tentativas de callback: ${radioChanges}.`}</ResultsStatus>
    </Stack>
  </Stack>;
}
