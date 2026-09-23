import { useState } from 'react';
import { Avatar, BrandMark, Button, DisclosureText, DisclosedRecords, DesignSystemProvider, Inline, LabelField, LinkButton, NavItem, PageHeader, SidebarFooter, SidebarHeader, SidebarSection, Stack, Text, TextLink, type Theme } from 'beds';
import { AppShell } from './recipes';

const longAbout = 'Linha um com bastante texto para garantir que o parágrafo realmente transborde o limite configurado de linhas visíveis. '.repeat(6);
const shortAbout = 'Texto curto.';
const manyLabels = ['Competência verificada em produto digital','Competência verificada em gestão técnica','Competência verificada em pesquisa com usuários','Competência verificada em métricas de crescimento','Competência verificada em design de sistemas','Competência verificada em documentação','Competência verificada em facilitação','Competência verificada em priorização','Competência verificada em prototipagem','Competência verificada em acessibilidade'];
const fewLabels = ['Uma habilidade', 'Outra habilidade'];

type Record_ = { id: string; title: string; detail: string };

const records: Record_[] = Array.from({ length: 7 }, (_, index) => ({ id: `r${index}`, title: `Registro ${index + 1}`, detail: `Detalhe do registro ${index + 1}` }));

const TINY_GIF = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

function AvatarProbe({ src }: { src?: string }) {
  const [current, setCurrent] = useState(src);
  return <Stack gap="tight">
    <Avatar name="Marina Costa" src={current} purpose="profile" />
    <Avatar name="Marina Costa" src={current} />
    <Button label="Trocar foto" onClick={() => setCurrent(TINY_GIF)} />
  </Stack>;
}

/** Library evidence route: measured disclosure, avatar recovery, locked navigation and text links. */
export default function DisclosuresPage() {
  const [theme, setTheme] = useState<Theme>((new URLSearchParams(location.search).get('theme') === 'light' ? 'light' : 'dark'));
  const [collapsed, setCollapsed] = useState(false);
  const [linkClicks, setLinkClicks] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  return <DesignSystemProvider theme={theme} onThemeChange={setTheme} brandColor={"#ffa133"}>
    <AppShell contentWidth="dashboard" collapsed={collapsed} onCollapsedChange={setCollapsed} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} navigationLabel="Navegação" sidebar={<>
        <SidebarHeader closeLabel="Fechar navegação" expandLabel="Expandir barra lateral" collapseLabel="Recolher barra lateral"><Avatar name="Marina Costa" purpose="workspace" /></SidebarHeader>
        <SidebarSection purpose="primary">
          <NavItem label="Início" icon="House" href="?view=components" />
        </SidebarSection>
        <SidebarSection label="Espaço">
          <NavItem label="Fórum" icon="MessageCircle" locked="O fórum está disponível para contas com créditos ativos." />
          <NavItem label="Perfil" icon="UserRound" active href="?view=disclosures" />
        </SidebarSection>
        <SidebarFooter><NavItem label="8 créditos" icon="Coins" href="?view=account-credits" /></SidebarFooter>
      </>}>
          <Stack gap="section">
            <PageHeader title="Informações do perfil" description="Exemplos de expansão de conteúdo e recuperação de avatar." />
            <Stack gap="tight">
              <Text variant="section-title">Avatar recovery</Text>
              <AvatarProbe src="/avatars/quebrada.png" />
            </Stack>
            <Stack gap="tight">
              <Text variant="section-title">DisclosureText</Text>
              <DisclosureText lines={2} moreLabel="Ler mais" lessLabel="Ler menos">{longAbout}</DisclosureText>
              <DisclosureText lines={6} moreLabel="Ler mais" lessLabel="Ler menos">{shortAbout}</DisclosureText>
            </Stack>
            <Stack gap="tight">
              <Text variant="section-title">LabelField</Text>
              <LabelField labels={manyLabels} moreLabel={hidden => `Ver todas (${hidden})`} lessLabel="Mostrar menos" />
              <LabelField labels={fewLabels} moreLabel={hidden => `Ver todas (${hidden})`} lessLabel="Mostrar menos" />
            </Stack>
            <Stack gap="tight">
              <Text variant="section-title">DisclosedRecords</Text>
              <DisclosedRecords records={records} visibleCount={3} moreLabel={hidden => `Ver registros anteriores (${hidden})`} lessLabel="Mostrar menos" render={visible => <Stack gap="tight">{visible.map(record => <Stack gap="tight" key={record.id}><Text variant="label">{record.title}</Text><Text tone="secondary">{record.detail}</Text></Stack>)}</Stack>} />
            </Stack>
            <Stack gap="tight">
              <Text variant="section-title">TextLink</Text>
              <Text><TextLink href="https://example.com/perfil" external>Perfil público</TextLink></Text>
              <Text><TextLink href="/interna">Página interna</TextLink></Text>
              <Text><TextLink href="tel:+5511999999999">+55 11 99999-9999</TextLink></Text>
            </Stack>
            <Stack gap="tight">
              <Text variant="section-title">TextLink e LinkButton de navegação</Text>
              <Text>Em header, rodapé e listas de links o sublinhado surge da esquerda ao passar o mouse ou focar pelo teclado.</Text>
              <nav aria-label="Exemplo de navegação"><Inline gap="default"><TextLink href="#como-funciona" purpose="nav">Como funciona</TextLink><TextLink href="https://example.com/blog" purpose="nav" external>Blog</TextLink><LinkButton label="Abrir ajuda" purpose="nav" onClick={() => setLinkClicks(count => count + 1)} /><LinkButton label="Indisponível" purpose="nav" disabled onClick={() => undefined} /></Inline></nav>
              <p role="status">Ajuda aberta: {linkClicks}</p>
            </Stack>
            <Stack gap="tight"><BrandMark src="/demo-brand.svg" label="Curriculol" /></Stack>
          </Stack>
    </AppShell>
  </DesignSystemProvider>;
}
