import { useState } from 'react';
import { Avatar, Button, DefinitionTable, OptionList, PageHeader, Stack, Switch, Text, type OptionListItem } from 'beds';

export default function RecordExamples() {
  const [expanded, setExpanded] = useState(true);
  const [documents, setDocuments] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [long, setLong] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState('');
  const records: OptionListItem[] = [
    { id: 'atelie', title: 'Ateliê Digital', mark: <Avatar name="Ateliê Digital" />, link: { label: 'Ateliê no catálogo', href: '?view=feature-card' }, meta: 'Atualizado há 11 minutos' },
    { id: 'estudio', title: long ? 'Estúdio de Carreira e Desenvolvimento Profissional' : 'Estúdio de Carreira', mark: <Avatar name="Estúdio de Carreira" />, link: { label: long ? 'Documentos-compartilhados-com-toda-a-equipe-de-desenvolvimento-profissional' : 'Documentos no catálogo', href: '?view=components' }, meta: long ? 'Última atualização em 15 de setembro de 2026, às 10h30' : 'Atualizado há 11 minutos',
      options: { title: 'Permissões do espaço', toggleLabel: 'Opções do Estúdio de Carreira', expanded, onExpandedChange: setExpanded, feedback,
        items: [
          { id: 'documents', label: long ? 'Permitir que os documentos preparados sejam compartilhados com as pessoas deste espaço' : 'Compartilhar documentos', description: 'Disponibilize os documentos preparados para as pessoas do espaço.', checked: documents, disabled: locked, onChange: value => { setDocuments(value); setFeedback(value ? 'Compartilhamento ativado somente neste exemplo.' : 'Compartilhamento desativado somente neste exemplo.'); } },
          { id: 'notifications', label: 'Receber atualizações', description: 'Avise quando uma nova atividade for concluída.', checked: notifications, disabled: locked, onChange: value => { setNotifications(value); setFeedback(value ? 'Atualizações ativadas somente neste exemplo.' : 'Atualizações desativadas somente neste exemplo.'); } },
        ],
      },
    },
    { id: 'orbita', title: 'Órbita', mark: <Avatar name="Órbita" />, meta: 'Ainda não sincronizado' },
  ];
  return <Stack gap="section">
    <PageHeader title="Dados e opções" description="Informações compactas e ajustes no contexto de cada item. Dados demonstrativos, sem conexões reais." />
    <DefinitionTable title="Sincronização de dados" unavailableLabel="Não informado" emptyMessage="Nenhum dado sincronizado neste exemplo." rows={empty ? [] : [
      { id: 'documents', label: long ? 'Documentos e informações profissionais disponíveis para a equipe' : 'Documentos sincronizados', icon: 'FileText', value: 15, link: { href: '?view=components', label: 'Ver os 15 documentos no catálogo' } },
      { id: 'collections', label: 'Coleções sincronizadas', icon: 'Folder', value: 12, link: { href: '?view=components', label: 'Ver as 12 coleções no catálogo' } },
    ]} />
    <OptionList title="Espaços conectados" items={empty ? [] : records} emptyMessage="Nenhum espaço conectado neste exemplo." />
    <Stack>
      <Text variant="section-title">Testar o componente</Text>
      <Switch label="Testar texto longo" checked={long} onChange={setLong} />
      <Switch label="Mostrar estado vazio" checked={empty} onChange={setEmpty} />
      <Switch label="Desabilitar as opções" checked={locked} onChange={setLocked} />
      <DefinitionTable title="Valores indisponíveis e zero" unavailableLabel="Não informado" emptyMessage="Nenhum valor." rows={[{ id: 'zero', label: 'Na fila', value: 0 }, { id: 'missing', label: 'Última sincronização', value: null }]} />
      <Button label="Restaurar exemplos" variant="ghost" onClick={() => { setExpanded(true); setDocuments(true); setNotifications(false); setLong(false); setEmpty(false); setLocked(false); setFeedback(''); }} />
    </Stack>
  </Stack>;
}
