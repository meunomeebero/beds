import { useState } from 'react';
import { AppShell, BrandMark, ContentHeader, DateItem, DateItemList, DesignSystemProvider, Drawer, Inline, NavItem, PageHeader, SidebarHeader, SidebarSection, Stack, Text, ThemeToggle, brands, type DateItemDate } from 'beds';

const events = [
  { id: 'interview', title: 'Conversa com a equipe de produto', date: { dateTime: '2026-10-22', month: 'out', day: '22', label: '22 de outubro de 2026' }, description: 'Entrevista com a equipe do Ateliê Digital. Horário a combinar.' },
  { id: 'portfolio', title: 'Revisão de portfólio', date: { dateTime: '2026-09-22', month: 'set', day: '22', label: '22 de setembro de 2026' }, description: 'Uma conversa sobre os projetos que você quer destacar.' },
];
const pastDate: DateItemDate = { dateTime: '2026-04-09', month: 'abr', day: '9', label: '9 de abril de 2026' };

export default function DateItemPage() {
  const params = new URLSearchParams(location.search);
  const [theme, setTheme] = useState<'light' | 'dark'>(params.get('theme') === 'light' ? 'light' : 'dark');
  const [current, setCurrent] = useState(params.get('item') ?? '');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const event = events.find(item => item.id === current);
  const long = params.get('preview') === 'long';

  return <DesignSystemProvider theme={theme} onThemeChange={setTheme} brandColor={brands.curriculol}>
    <AppShell contentWidth="home" collapsed={collapsed} onCollapsedChange={setCollapsed} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} navigationLabel="Navegação" closeNavigationLabel="Fechar navegação"
      sidebar={<><SidebarHeader><Inline gap="tight"><BrandMark label="Curriculol" /><Text>Curriculol</Text></Inline></SidebarHeader><SidebarSection label="Playground"><NavItem label="Componentes" icon="Folder" href={`?view=components&theme=${theme}`} /><NavItem label="Itens com data" icon="CalendarDays" active href={`?view=date-item&theme=${theme}`} /></SidebarSection></>}
      header={<ContentHeader actions={<ThemeToggle label="Aparência da página" lightLabel="Claro" darkLabel="Escuro" />}><Text>Componentes / Item com data</Text></ContentHeader>}>
      <Stack gap="section">
        <PageHeader title="Compromissos" description="Datas que merecem um lugar na sua próxima etapa." />
        <DateItemList label="Exemplos de compromissos">
          <DateItem title={long ? 'Conversa sobre pesquisa, acessibilidade e sistemas de design com a equipe internacional de desenvolvimento de produto' : events[0].title} date={events[0].date} status={{ label: long ? 'Aguardando confirmação de disponibilidade da equipe' : 'Em breve', tone: 'info' }} onOpen={() => setCurrent('interview')} />
          <DateItem title={events[1].title} date={events[1].date} status={{ label: 'Em breve', tone: 'info' }} href={`?view=date-item&theme=${theme}&item=portfolio`} />
          <DateItem title="Encontro sobre transição de carreira" date={{ dateTime: '2026-04-21', month: 'abr', day: '21', label: '21 de abril de 2026' }} />
          <DateItem title="Oficina de currículo" date={pastDate} />
        </DateItemList>
        <Stack>
          <Text variant="section-title">Com informações de apoio</Text>
          <DateItemList label="Exemplo com descrição"><DateItem title="Preparar os cases para a entrevista" date={{ dateTime: '2026-09-21', month: 'set', day: '21', label: '21 de setembro de 2026' }} description="Separe dois projetos e destaque suas decisões e aprendizados." status={{ label: 'Confirmado', tone: 'success' }} /></DateItemList>
          <Text variant="body-small" tone="secondary">Dados de demonstração. Nenhum compromisso é criado ou sincronizado. Os dois primeiros itens abrem detalhes; os demais são informativos.</Text>
        </Stack>
      </Stack>
      <Drawer open={Boolean(event)} onOpenChange={open => { if (!open) setCurrent(''); }} title={event?.title ?? 'Compromisso'} description="Detalhes do exemplo">
        {event && <Stack><Inline><Text>{event.date.label}</Text></Inline><Text>{event.description}</Text><Text tone="secondary">Esta é uma prévia local, sem integração com calendário.</Text></Stack>}
      </Drawer>
    </AppShell>
  </DesignSystemProvider>;
}
