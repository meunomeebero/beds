import { useState } from 'react';
import { AppShell } from './recipes';
import { Button, ContentHeader, SidebarHeader, DesignSystemProvider, HandDrawnArrow, Inline, PageHeader, ResponsiveGrid, Stack, Surface, Text, TextLink, ThemeToggle, type HandDrawnArrowDirection, type HandDrawnArrowShape, type Theme } from 'beds';

const shapes: HandDrawnArrowShape[] = ['curve', 'loop', 'straight'];
const directions: HandDrawnArrowDirection[] = ['down-left', 'down-right', 'up-left', 'up-right', 'left', 'right'];

/** Synthetic catalog fixture: every shape, direction, context and tone of HandDrawnArrow. */
export default function HandDrawnArrowPage() {
  const params = new URLSearchParams(location.search);
  const [theme, setTheme] = useState<Theme>(params.get('theme') === 'dark' ? 'dark' : 'light');
  const [replay, setReplay] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const long = params.get('preview') === 'long';
  const note = long ? 'garanta sua vaga antes que o convite expire' : 'não fica de fora!';

  return <DesignSystemProvider theme={theme} onThemeChange={setTheme} brandColor="#d0f300">
    <AppShell collapsed={collapsed} onCollapsedChange={setCollapsed} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} contentWidth="home" sidebar={<SidebarHeader><Text>Catálogo</Text></SidebarHeader>}>
    <ContentHeader actions={<ThemeToggle label="Aparência" lightLabel="Claro" darkLabel="Escuro" />}>
      <Inline><TextLink href={`?view=components&theme=${theme}`}>Componentes</TextLink><Text>Seta manuscrita</Text></Inline>
    </ContentHeader>
    <Stack gap="section">
      <PageHeader title="HandDrawnArrow" description="Seta desenhada à mão com nota manuscrita opcional para apontar um CTA próximo." actions={<Button label="Desenhar de novo" compact onClick={() => setReplay(value => value + 1)} />} />

      <Surface role="panel"><Inline key={`hero-${replay}`} align="center">
        <Button variant="primary" label="Entrar com X" />
        <HandDrawnArrow label={note} direction="left" context="hero" tone="brand" />
      </Inline></Surface>

      {shapes.map(shape => <Stack key={`${shape}-${replay}`} gap="tight">
        <Text variant="label">Forma {shape}</Text>
        <ResponsiveGrid>
          {directions.map(direction => <Surface key={direction} role="subtle"><HandDrawnArrow label={direction} shape={shape} direction={direction} /></Surface>)}
        </ResponsiveGrid>
      </Stack>)}

      <Stack key={`tones-${replay}`} gap="tight">
        <Text variant="label">Contextos e tons</Text>
        <ResponsiveGrid>
          {(['compact', 'default', 'hero'] as const).map(context => <Surface key={context} role="subtle"><HandDrawnArrow label={`contexto ${context}`} context={context} direction="down-right" /></Surface>)}
          {(['default', 'secondary', 'brand'] as const).map(tone => <Surface key={tone} role="subtle"><HandDrawnArrow label={`tom ${tone}`} tone={tone} shape="loop" /></Surface>)}
          <Surface role="subtle"><HandDrawnArrow direction="right" tone="brand" /></Surface>
          <Surface role="subtle"><HandDrawnArrow label="estática" drawIn={false} direction="up-right" /></Surface>
        </ResponsiveGrid>
      </Stack>
    </Stack>
    </AppShell>
  </DesignSystemProvider>;
}
