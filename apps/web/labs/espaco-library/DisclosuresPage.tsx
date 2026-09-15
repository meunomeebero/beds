import { useState } from 'react';
import {
  AppShell, Avatar, Button, DataList, DesignSystemProvider, DisclosureText, DisclosedRecords,
  Inline, LabelField, NavItem, Notice, PageContentHeader, SectionHeader, SidebarFooter,
  SidebarHeader, SidebarSection, Stack, Surface, Text, brands, type Theme,
} from 'beds';

const CLAMPED_INTRO = 'A prévia local carrega o mesmo catálogo usado pela aplicação de referência. O texto abaixo é sintético e existe para demonstrar o comportamento medido do clamp: o controle só aparece quando o conteúdo realmente transborda o limite de linhas, e o texto completo permanece no documento para leitura assistiva. Redimensione a janela para ver a remedição após a troca de layout ou o assentamento das fontes.';

const workspaceLabels = [
  'produto', 'growth', 'pesquisa', 'design-system', 'onboarding', 'faturamento',
  'suporte', 'dados', 'parcerias', 'comunidade', 'carreira', 'infra',
];

const olderRecords = [
  { id: 'r8', title: 'Ajuste de permissões do painel', description: 'Editor e leitura' },
  { id: 'r7', title: 'Nova integração ativada', description: 'Canal de notificações' },
  { id: 'r6', title: 'Convite aceito pela equipe', description: 'Dois novos membros' },
  { id: 'r5', title: 'Relatório mensal gerado', description: 'Agosto, síntese automática' },
  { id: 'r4', title: 'Backup verificado', description: 'Retenção de 30 dias' },
  { id: 'r3', title: 'Chave de API renovada', description: 'Rotação automática' },
  { id: 'r2', title: 'Domínio verificado', description: 'exemplo.com' },
  { id: 'r1', title: 'Espaço criado', description: 'Marcação inicial concluída' },
] as const;

/** Application composition only. Local synthetic state; no product data. */
export default function DisclosuresPage() {
  const [theme, setTheme] = useState<Theme>(new URLSearchParams(location.search).get('theme') === 'light' ? 'light' : 'dark');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [status, setStatus] = useState('');

  return <DesignSystemProvider theme={theme} onThemeChange={setTheme} brandColor={brands.reference}>
    <AppShell
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
      mobileOpen={mobileOpen}
      onMobileOpenChange={setMobileOpen}
      contentWidth="home"
      navigationLabel="Navegação"
      sidebar={<>
        <SidebarHeader>
          <Avatar name="Equipe Demonstração" purpose="workspace" />
          <Text variant="option">Divulgação</Text>
        </SidebarHeader>
        <SidebarSection label="Espaço" purpose="primary">
          <NavItem label="Conteúdo" icon="FileText" href="?view=disclosures" active />
          <NavItem label="Histórico" icon="MessageCircle" onClick={() => setStatus('A navegação desta prévia é demonstrativa.')} />
        </SidebarSection>
        <SidebarFooter><Text tone="secondary">Prévia de divulgação</Text></SidebarFooter>
      </>}
      header={<PageContentHeader title="Divulgação de conteúdo" description="Medição, rótulos e histórico com estado sintético." />}>
      <Stack gap="section">
        {status && <Notice title="Prévia local" description={status} onDismiss={() => setStatus('')} />}
        <Stack>
          <SectionHeader title="Texto com medição" description="O botão existe apenas quando o layout realmente transborda." />
          <Surface><Stack gap="tight">
            <Text variant="label">Resumo do espaço</Text>
            <DisclosureText lines={3} moreLabel="Mostrar texto completo" lessLabel="Mostrar menos">{CLAMPED_INTRO}</DisclosureText>
          </Stack></Surface>
          <Surface><Stack gap="tight">
            <Text variant="label">Resumo curto (sem transbordo, controle ausente)</Text>
            <DisclosureText lines={6} moreLabel="Mostrar texto completo" lessLabel="Mostrar menos">Texto curto que cabe no limite.</DisclosureText>
          </Stack></Surface>
        </Stack>
        <Stack>
          <SectionHeader title="Rótulos revelados por linha" description="O excedente entra no documento apenas quando expandido." />
          <Surface><LabelField
            labels={workspaceLabels}
            initialRows={3}
            moreLabel={hidden => `Mostrar mais ${hidden} rótulos`}
            lessLabel="Mostrar menos"
          /></Surface>
        </Stack>
        <Stack>
          <SectionHeader title="Histórico dividido por contagem" description="Registros antigos saem do documento até a expansão." />
          <DisclosedRecords
            records={olderRecords}
            visibleCount={3}
            moreLabel={hidden => `Mostrar ${hidden} eventos anteriores`}
            lessLabel="Mostrar menos eventos"
            render={records => <DataList label="Eventos do espaço">
              {records.map(record => <Stack key={record.id} gap="tight">
                <Inline gap="tight" align="center">
                  <Avatar name="Equipe Demonstração" purpose="account" lazy />
                  <Text variant="option">{record.title}</Text>
                </Inline>
                {record.description && <Text tone="secondary">{record.description}</Text>}
              </Stack>)}
            </DataList>}
          />
        </Stack>
        <Inline>
          <Button label="Reiniciar prévia" variant="ghost" onClick={() => setStatus('Estado local reiniciado; nenhum dado real foi alterado.')} />
        </Inline>
      </Stack>
    </AppShell>
  </DesignSystemProvider>;
}