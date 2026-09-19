import { useLayoutEffect, useRef, useState } from 'react';
import { AnimatedNumber, Button, DesignSystemProvider, Inline, Stack, Text, type Theme } from 'beds';

type NumberState = 'unavailable' | 'invalid' | 'ready' | 'updated';

export default function AnimatedNumberPage() {
  const params = new URLSearchParams(window.location.search);
  const [theme, setTheme] = useState<Theme>(params.get('theme') === 'light' ? 'light' : 'dark');
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
    document.querySelector('[data-testid="animated-number-state"]')?.setAttribute('data-frame-trace', frames.current.join(','));
  }, [state, startOnView]);

  return <DesignSystemProvider theme={theme} brandColor="#d0f300" onThemeChange={setTheme}>
    <main>
      <Stack gap="section">
        <Stack>
          <Text variant="page-title">AnimatedNumber regression</Text>
          <Text tone="secondary">Controlled synthetic values for first-frame, visibility and reduced-motion checks.</Text>
          <Inline>
            <Button label="Indisponível" compact onClick={() => setState('unavailable')} />
            <Button label="Inválido" compact onClick={() => setState('invalid')} />
            <Button label="Pronto" compact onClick={() => setState('ready')} />
            <Button label="Atualizar 84" compact onClick={() => setState('updated')} />
            <Button label={startOnView ? 'Iniciar ao entrar' : 'Iniciar imediatamente'} compact onClick={() => setStartOnView(previous => !previous)} />
          </Inline>
        </Stack>
        <div style={{ minHeight: '1200px' }} aria-hidden="true" />
        <section aria-label="Número animado" data-testid="animated-number-state">
          <Text variant="label">Valor</Text>
          <AnimatedNumber value={value} initialValue={initialValue} format={format} fallback="Indisponível" startOnView={startOnView} />
        </section>
      </Stack>
    </main>
  </DesignSystemProvider>;
}
