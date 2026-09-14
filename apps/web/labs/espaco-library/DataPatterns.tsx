import { useState } from 'react';
import { ActivityPanel, Avatar, Button, Carousel, CollectionCard, DataTable, FilterSelect, HelpLabel, HorizontalRail, IconToggleButton, Inline, Pagination, ResponsiveGrid, ScrollableList, DesignSystemProvider, Stack, Surface, Text, type DataTableState, type Theme } from '@espaco/ui';

const columns = [
  { id: 'name', label: 'Projeto' },
  { id: 'status', label: 'Estado' },
  { id: 'owner', label: 'Responsável' },
  { id: 'updated', label: 'Atualizado' },
  { id: 'items', label: 'Itens', numeric: true },
];

const rows = [
  { id: 'one', cells: { name: 'Fluxo de integração com um título deliberadamente longo para validar quebra de texto', status: 'Em revisão', owner: 'Alex Morgan', updated: 'Hoje', items: 18 } },
  { id: 'two', cells: { name: 'Painel de referência', status: 'Pronto', owner: null, updated: 'Ontem', items: 4 } },
];

const railCards = [
  { id: 'one', title: 'Primeiro cartão de exemplo', detail: 'Largura fixa para validar continuidade manual.' },
  { id: 'two', title: 'Segundo cartão de exemplo', detail: 'O trilho não avança sem gesto da pessoa.' },
  { id: 'three', title: 'Terceiro cartão de exemplo', detail: 'O próximo cartão fica parcialmente visível.' },
  { id: 'four', title: 'Quarto cartão de exemplo', detail: 'A rolagem nativa preserva todos os cartões.' },
  { id: 'five', title: 'Quinto cartão de exemplo', detail: 'Nenhum cartão avança automaticamente.' },
];

const queueItems = Array.from({ length: 10 }, (_, index) => `Item ${index + 1} da fila de exemplo`);

export default function DataPatterns() {
  const params = new URLSearchParams(window.location.search);
  const [theme, setTheme] = useState<Theme>(params.get('theme') === 'light' ? 'light' : 'dark');
  const [state, setState] = useState<DataTableState>({ kind: 'ready' });
  const [page, setPage] = useState(() => Number(params.get('page') ?? 2));
  const [exampleSelected, setExampleSelected] = useState(false);
  const [period, setPeriod] = useState('30');
  const pageCount = Number(params.get('pageCount') ?? 3);
  const status = state.kind === 'ready' ? 'Dados prontos' : state.kind === 'loading' ? 'Carregando' : state.kind === 'empty' ? 'Vazio' : 'Erro';

  return <DesignSystemProvider theme={theme} brandColor="#d0f300" onThemeChange={setTheme}>
    <main className="esl-data-patterns">
      <header><h1>Padrões de dados</h1><p>Tabela simples e paginação controlada. Todos os dados e transições desta página são locais.</p></header>
      <div className="esl-data-patterns-actions" aria-label="Estados da demonstração">
        <Button label="Tema claro" compact onClick={() => setTheme('light')} /><Button label="Tema escuro" compact onClick={() => setTheme('dark')} />
        <Button label="Dados prontos" compact onClick={() => setState({ kind: 'ready' })} /><Button label="Carregar" compact onClick={() => setState({ kind: 'loading', label: 'Carregando projetos de exemplo' })} />
        <Button label="Mostrar vazio" compact onClick={() => setState({ kind: 'empty', title: 'Nenhum projeto de exemplo', description: 'Adicione um projeto para começar.', action: { label: 'Adicionar projeto de exemplo', onClick: () => setState({ kind: 'ready' }) } })} />
        <Button label="Mostrar erro" compact onClick={() => setState({ kind: 'error', title: 'Não foi possível mostrar os projetos', description: 'Tente atualizar esta demonstração local.', action: { label: 'Tentar novamente', onClick: () => setState({ kind: 'ready' }) } })} />
      </div>
      <p className="esl-data-patterns-status" role="status">Estado atual: {status}.</p>
      <Inline align="between">
        <HelpLabel label="Atividade no período" icon="Activity" description="Operações concluídas no intervalo escolhido. Esta demonstração usa apenas dados locais." />
        <FilterSelect label="Período da atividade" value={period} onChange={setPeriod} options={[
          { id: '7', label: 'Últimos 7 dias' },
          { id: '14', label: 'Últimos 14 dias', disabled: true },
          { id: '30', label: 'Últimos 30 dias' },
          { id: '90', label: 'Últimos 90 dias' },
        ]} />
        <FilterSelect label="Filtro indisponível" value="30" onChange={() => undefined} disabled options={[{ id: '30', label: 'Últimos 30 dias' }]} />
      </Inline>
      <DataTable label="Projetos de exemplo" unavailableLabel="Não disponível" columns={columns} rows={rows} state={state} />
      <Pagination label="Paginação dos projetos de exemplo" page={page} pageCount={pageCount} summary={({ page: currentPage, pageCount: currentPageCount }) => `Página ${currentPage} de ${currentPageCount}`} previousLabel="Anterior" nextLabel="Próxima" onPageChange={setPage} />
      <HorizontalRail label="Trilho manual de exemplos">
        {railCards.map(card => <CollectionCard key={card.id} avatar={<Avatar name="Equipe de exemplo" />} identity="Equipe de exemplo" selection={<IconToggleButton label={`Selecionar ${card.title}`} icon="Bookmark" pressed={exampleSelected} onPressedChange={setExampleSelected} />} title={card.title} metadata={<Text tone="secondary">{card.detail}</Text>} actions={<Button label="Abrir exemplo" compact onClick={() => undefined} />} />)}
      </HorizontalRail>
      <IconToggleButton label="Selecionar item de exemplo" icon="Bookmark" pressed={exampleSelected} onPressedChange={setExampleSelected} />
      <ResponsiveGrid>
        <ActivityPanel title="Atividade de exemplo" icon="Activity" purpose="history" description="Retome operações que você iniciou. Os dados deste painel são demonstrativos."><Stack gap="tight"><Text variant="label">Currículo atualizado</Text><Text tone="secondary">Ação local de exemplo.</Text></Stack></ActivityPanel>
        <ActivityPanel title="Fila de exemplo" icon="Briefcase"><ScrollableList label="10 itens da fila de exemplo"><Stack>{queueItems.map(item => <Text key={item}>{item}</Text>)}</Stack></ScrollableList></ActivityPanel>
      </ResponsiveGrid>
      <Carousel label="Carrossel de exemplos" interactionHint="Role para explorar. Com o carrossel em foco, Espaço pausa ou retoma o movimento.">
        {railCards.map(card => <Surface key={card.id}><Stack><Text variant="section-title">{card.title}</Text><Text tone="secondary">Loop contínuo, com pausa ao interagir e rolagem manual.</Text><IconToggleButton label={`Marcar ${card.title}`} icon="Bookmark" pressed={exampleSelected} onPressedChange={setExampleSelected} /></Stack></Surface>)}
      </Carousel>
      <Carousel label="Carrossel sem excedente"><Text>Um único item: sem movimento nem controles desnecessários.</Text></Carousel>
    </main>
  </DesignSystemProvider>;
}
