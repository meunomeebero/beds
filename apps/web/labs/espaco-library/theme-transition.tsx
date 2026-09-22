// Local diagnostic only: real computed colors sampled before each animation-frame paint.
// No browser-global injection, private styling override or production telemetry.
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DesignSystemProvider, NavItem, Sidebar, Text, type Theme } from 'beds';
import 'beds/styles.css';

type Sample = { frame: number; theme: string | null; foreground: string; background: string; contrast: number; suppressed: boolean; duration: string; peerSuppressed: boolean; peerColor: string };
function renderedBackground(element: HTMLElement): string {
  for (let current: HTMLElement | null = element; current; current = current.parentElement) {
    const color = getComputedStyle(current).backgroundColor;
    if (color === 'rgba(0, 0, 0, 0)' || color === 'transparent') continue;
    if (!color.startsWith('rgb(')) throw new Error('Background requires alpha compositing: ' + color);
    return color;
  }
  throw new Error('No opaque background found');
}
function luminance(color: string) {
  const values = color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  if (!values || values.length !== 3) throw new Error('Unsupported computed color: ' + color);
  return values.map(value => value / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4)
    .reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
}
function ThemeInspection() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [samples, setSamples] = useState<Sample[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const host = useRef<HTMLDivElement>(null);
  const peer = useRef<HTMLDivElement>(null);
  const frameId = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frameId.current), []);
  function run(rapid: boolean) {
    if (running) return;
    const root = host.current?.querySelector<HTMLElement>('.es-root');
    const label = root?.querySelector<HTMLElement>('.es-nav-label');
    const nav = root?.querySelector<HTMLElement>('.es-nav-item');
    const other = peer.current?.querySelector<HTMLElement>('.es-root');
    if (!root || !label || !nav || !other) return;
    const records: Sample[] = [];
    const start = theme;
    const next = start === 'dark' ? 'light' : 'dark';
    setRunning(true);
    setError('');
    setSamples([]);
    setTheme(next);
    let frame = 0;
    const sample = () => {
      try {
        const foreground = getComputedStyle(label).color;
        const background = renderedBackground(label);
        const a = luminance(foreground), b = luminance(background);
        records.push({ frame, theme: root.dataset.theme ?? null, foreground, background,
          contrast: (Math.max(a, b) + .05) / (Math.min(a, b) + .05),
          suppressed: root.hasAttribute('data-theme-switching'),
          duration: getComputedStyle(nav).transitionDuration,
          peerSuppressed: other.hasAttribute('data-theme-switching'),
          peerColor: getComputedStyle(other).backgroundColor });
        // Reverse on consecutive paints to exercise cleanup while suppression is active.
        if (rapid && frame < 4) setTheme(frame % 2 === 0 ? start : next);
        frame++;
        if (frame < 24) frameId.current = requestAnimationFrame(sample);
        else { setSamples(records); setRunning(false); }
      } catch (cause) { setError(String(cause)); setRunning(false); }
    };
    frameId.current = requestAnimationFrame(sample);
  }
  const result = samples.length ? {
    frames: samples.length,
    minContrast: Math.min(...samples.map(sample => sample.contrast)),
    themes: [...new Set(samples.map(sample => sample.theme))],
    foregrounds: [...new Set(samples.map(sample => sample.foreground))],
    backgrounds: [...new Set(samples.map(sample => sample.background))],
    initialSuppression: samples[0].suppressed,
    finalSuppression: samples.at(-1)?.suppressed,
    finalDuration: samples.at(-1)?.duration,
    peerSuppressed: samples.some(sample => sample.peerSuppressed),
    peerBackgrounds: [...new Set(samples.map(sample => sample.peerColor))],
  } : null;
  return <main>
    <h1>Inspeção local da troca de tema</h1>
    <p>24 amostras de frames da navegação; não representa uma auditoria de contraste de todos os componentes.</p>
    <button type="button" disabled={running} onClick={() => run(false)}>Alternar e medir</button>
    <button type="button" disabled={running} onClick={() => run(true)}>Alternar rapidamente e medir</button>
    <div ref={host}><DesignSystemProvider brandColor="#d0f300" theme={theme}>
      <Text variant="section-title">Provider alternado</Text>
      <Sidebar label="Navegação de teste"><NavItem label="Documentos de exemplo" icon="FileText" href="#resultado" /></Sidebar>
    </DesignSystemProvider></div>
    <div ref={peer}><DesignSystemProvider brandColor="#d0f300" theme="light"><Text>Provider independente, sempre claro</Text></DesignSystemProvider></div>
    <p role="status">{running ? 'Medindo frames' : result ? 'Medição concluída' : 'Aguardando medição'}</p>
    {error && <p role="alert">{error}</p>}
    <pre id="resultado">{JSON.stringify(result, null, 2)}</pre>
    <details><summary>Amostras completas</summary><pre>{JSON.stringify(samples, null, 2)}</pre></details>
  </main>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><ThemeInspection /></React.StrictMode>);
