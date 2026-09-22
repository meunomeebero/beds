import { useState } from 'react';
import { AppShell } from './recipes';
import { ContentHeader, DesignSystemProvider, ExpandingButton, Inline, PageHeader, ResponsiveGrid, SidebarHeader, Stack, Surface, Text, TextLink, ThemeToggle, type Theme } from 'beds';

function XMark() {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
}

/** Synthetic catalog fixture: icons, brand mark, sizes, disabled and long label of ExpandingButton. */
export default function ExpandingButtonPage() {
  const params = new URLSearchParams(location.search);
  const [theme, setTheme] = useState<Theme>(params.get('theme') === 'dark' ? 'dark' : 'light');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [clicks, setClicks] = useState(0);

  return <DesignSystemProvider theme={theme} onThemeChange={setTheme} brandColor="#d0f300">
    <AppShell collapsed={collapsed} onCollapsedChange={setCollapsed} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} contentWidth="home" sidebar={<SidebarHeader><Text>Catálogo</Text></SidebarHeader>}>
    <ContentHeader actions={<ThemeToggle label="Aparência" lightLabel="Claro" darkLabel="Escuro" />}>
      <Inline><TextLink href={`?view=components&theme=${theme}`}>Componentes</TextLink><Text>Botão expansível</Text></Inline>
    </ContentHeader>
    <Stack gap="section">
      <PageHeader title="ExpandingButton" description="Botão pill cujo círculo na cor da marca preenche o controle no hover ou no foco pelo teclado. Um por tela." />

      <Surface role="panel"><Stack gap="tight">
        <Inline align="center">
          <ExpandingButton label="Entrar" accessibleLabel="Entrar com X" mark={<XMark />} onClick={() => setClicks(value => value + 1)} />
          <ExpandingButton label="Entrar com X" mark={<XMark />} context="hero" onClick={() => setClicks(value => value + 1)} />
        </Inline>
        <Text tone="secondary" variant="caption"><span role="status">Cliques: {clicks}</span></Text>
      </Stack></Surface>

      <Stack gap="tight">
        <Text variant="label">Ícones, tamanhos e estados</Text>
        <ResponsiveGrid>
          <Surface role="subtle"><ExpandingButton label="Começar agora" /></Surface>
          <Surface role="subtle"><ExpandingButton label="Criar conta" icon="Sparkles" context="hero" /></Surface>
          <Surface role="subtle"><ExpandingButton label="Enviar" icon="ArrowUp" type="submit" /></Surface>
          <Surface role="subtle"><ExpandingButton label="Indisponível" disabled /></Surface>
          <Surface role="subtle"><ExpandingButton label="Garanta sua vaga no beta fechado antes que os convites acabem" icon="ArrowUpRight" /></Surface>
        </ResponsiveGrid>
      </Stack>
    </Stack>
    </AppShell>
  </DesignSystemProvider>;
}
