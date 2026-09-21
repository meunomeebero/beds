import { AppShell } from './recipes';
import { useLayoutEffect, useRef, useState } from 'react';
import { AnimatedNumber, Button, DesignSystemProvider, Inline, PageHeader, SidebarHeader, Stack, Surface, Text, type Theme } from 'beds';

type NumberState = 'unavailable' | 'invalid' | 'ready' | 'updated';

export default function AnimatedNumberPage() {
  const params = new URLSearchParams(window.location.search);
  const [theme, setTheme] = useState<Theme>(params.get('theme') === 'light' ? 'light' : 'dark');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [state, setState] = useState<NumberState>('unavailable');
  const [startOnView, setStartOnView] = useState(false);
  const frames = useRef<number[]>([]);
  const value = state === 'unavailable' ? null : state === 'invalid' ? Number.NaN : state === 'updated' ? 84 : 42;
  const initialValue = state === 'updated' ? 42 : undefined;
  const format = (number: number) => {
    frames.current.push(number);
    return String(Math.round(number));
  };

  useLayoutEffect(() => {
    document.querySelector('.es-animated-number')?.setAttribute('data-frame-trace', frames.current.join(','));
  }, [state, startOnView]);

  return <DesignSystemProvider theme={theme} brandColor={"#ffa133"} onThemeChange={setTheme}>
    <AppShell collapsed={collapsed} onCollapsedChange={setCollapsed} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} contentWidth="home" sidebar={<SidebarHeader><Text>Fixture F3</Text></SidebarHeader>}>
      <Stack gap="section">
        <PageHeader title="AnimatedNumber regression" description="Controlled synthetic values for first-frame, visibility and reduced-motion checks." />
        <Stack>
          <Inline>
            <Button label="Indisponível" compact onClick={() => setState('unavailable')} />
            <Button label="Inválido" compact onClick={() => setState('invalid')} />
            <Button label="Pronto" compact onClick={() => setState('ready')} />
            <Button label="Atualizar 84" compact onClick={() => setState('updated')} />
            <Button label={startOnView ? 'Iniciar ao entrar' : 'Iniciar imediatamente'} compact onClick={() => setStartOnView(previous => !previous)} />
          </Inline>
        </Stack>
        {Array.from({ length: 16 }, (_, index) => <Text key={index} tone="secondary">Área de rolagem sintética para validar a animação somente quando o valor entra na viewport.</Text>)}
        <Surface role="panel"><Stack gap="tight">
          <Text variant="label">Valor</Text>
          <AnimatedNumber value={value} initialValue={initialValue} format={format} fallback="Indisponível" startOnView={startOnView} />
        </Stack></Surface>
      </Stack>
    </AppShell>
  </DesignSystemProvider>;
}
