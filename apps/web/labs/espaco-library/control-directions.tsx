// Local fixture: native direction inheritance, no component-style overrides.
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DesignSystemProvider, Switch, type Theme } from 'beds';
import 'beds/styles.css';

function DirectionChecks() {
  const [theme, setTheme] = useState<Theme>('light');
  const [checked, setChecked] = useState(false);
  const [samples, setSamples] = useState<string>('Toggle a switch to sample its rendered movement.');
  const host = useRef<HTMLDivElement>(null);
  const previous = useRef(checked);
  const mode = new URLSearchParams(location.search).get('motion');
  useEffect(() => {
    if (previous.current === checked) return;
    previous.current = checked;
    setSamples('Sampling 24 animation frames…');
    const frames: { ltr: string; rtl: string }[] = [];
    let request = 0;
    const sample = () => {
      const offset = (direction: string) => {
        const thumb = host.current?.querySelector<HTMLElement>(`[dir="${direction}"] [role="switch"] + span > span`);
        return thumb ? getComputedStyle(thumb).insetInlineStart : 'missing';
      };
      frames.push({ ltr: offset('ltr'), rtl: offset('rtl') });
      if (frames.length < 24) request = requestAnimationFrame(sample);
      else setSamples(JSON.stringify({ mode: mode ?? 'native', checked, frames }));
    };
    request = requestAnimationFrame(sample);
    return () => cancelAnimationFrame(request);
  }, [checked, mode]);
  return <>
    <h1>Control direction checks</h1>
    <button type="button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>Toggle theme</button>
    <p>Theme: {theme}. Changes are local, with no request or persistence.</p>
    <p>{mode === 'reduce' || mode === 'standard' ? `Simulated JavaScript preference: ${mode}. CSS media queries and OS settings remain native.` : 'Native browser motion preference.'}</p>
    <div ref={host}>
    {(['ltr', 'rtl'] as const).map(direction => <section key={direction} dir={direction} aria-label={direction} style={{ width: 320, maxWidth: '100%' }}>
      <DesignSystemProvider brandColor="#d0f300" theme={theme}>
        <h2>{direction.toUpperCase()}</h2>
        <Switch label={`${direction} notifications`} description="A deliberately long description to verify wrapping without hiding the switch or losing its label." checked={checked} onChange={setChecked} />
        <Switch label={`${direction} unavailable`} checked={checked} disabled onChange={setChecked} />
      </DesignSystemProvider>
    </section>)}
    </div>
    <output aria-label="Frame samples" style={{ display: 'block', overflowWrap: 'anywhere' }}>{samples}</output>
  </>;
}
createRoot(document.getElementById('root')!).render(<DirectionChecks />);
