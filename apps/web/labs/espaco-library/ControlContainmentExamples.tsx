import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrandMark, ChatComposer, DesignSystemProvider, DropdownMenu, NavItem, RadioGroup, SegmentedControl, Select, Sidebar, SidebarHeader, SidebarSection, Switch, Tabs, TextAreaField, TextField, TextLink, ThemeToggle, type Theme } from 'beds';
import 'beds/styles.css';

function Controls({ prefix }: { prefix: string }) {
  const stress = new URLSearchParams(location.search).get('long') === '1';
  const description = stress ? 'A deliberately long explanation that must remain readable without changing the dimensions or behavior of adjacent controls.' : undefined;
  const [text, setText] = useState('Example');
  const [checked, setChecked] = useState(false);
  const [option, setOption] = useState('one');
  const [notes, setNotes] = useState(stress ? 'Long editable text with an unbroken identifier: ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ' : 'Example notes');
  const [radio, setRadio] = useState('one');
  const [segment, setSegment] = useState('one');
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastAction, setLastAction] = useState('None');
  const choices = [
    { id: 'one', label: stress ? 'First choice with a deliberately long localized label' : 'First' },
    { id: 'blocked', label: 'Unavailable', disabled: true },
    { id: 'two', label: stress ? 'Second choice with a longer localized label' : 'Second' },
  ];
  return <div style={{ display: 'grid', gap: 16 }}>
    <TextField label={`${prefix} name`} description={description} value={text} onChange={setText} />
    <TextAreaField label={`${prefix} notes`} description={description} value={notes} onChange={setNotes} />
    <RadioGroup label={`${prefix} preference`} value={radio} options={choices} onChange={setRadio} description={description} />
    <SegmentedControl label={`${prefix} view`} value={segment} options={choices} onChange={setSegment} />
    <DropdownMenu label={`${prefix} actions`} open={menuOpen} onOpenChange={setMenuOpen} items={choices} onSelect={setLastAction} />
    <output aria-label={`${prefix} last action`}>{lastAction}</output>
    <Select label={`${prefix} choice`} value={option} onChange={setOption} options={[
      { id: 'one', label: stress ? 'First option with a deliberately long localized name that should be fully readable in the open menu' : 'One', description },
      { id: 'two', label: stress ? 'Second option with an unbroken identifier: ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ' : 'Two', description },
    ]} />
    <Switch label={`${prefix} notifications`} description={description} checked={checked} onChange={setChecked} />
    <ThemeToggle label={`${prefix} theme`} lightLabel={stress ? 'Light appearance with a longer localized label' : undefined} darkLabel={stress ? 'Dark appearance with a longer localized label' : undefined} />
    <p><TextLink href="#explanation">{prefix} documentation</TextLink></p>
  </div>;
}

function NavigationAndComposer() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState('first');
  const [message, setMessage] = useState('A long local draft with identifier ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  const [disabled, setDisabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(0);
  return <section aria-label="Independent navigation and composer">
    <h2>Independent widgets</h2>
    <div style={{ width: collapsed ? 64 : '100%', maxWidth: 288 }}>
      <Sidebar label="Example destinations" collapsed={collapsed} onCollapsedChange={setCollapsed}>
        <SidebarHeader>Example</SidebarHeader>
        <SidebarSection>
          <NavItem label="First destination with a deliberately long localized name" icon="FileText" active={active === 'first'} onClick={() => setActive('first')} />
          <NavItem label="Second destination with another long localized name" icon="Folder" active={active === 'second'} onClick={() => setActive('second')} />
          <NavItem label="Unavailable destination" icon="Folder" locked="Not available in this local example" />
        </SidebarSection>
      </Sidebar>
    </div>
    <Switch label="Disable composer" checked={disabled} onChange={setDisabled} />
    <Switch label="Busy composer" checked={busy} onChange={setBusy} />
    <ChatComposer label="Local draft" value={message} onChange={setMessage} disabled={disabled} busy={busy} onCancel={() => setBusy(false)} onSubmit={() => setSent(count => count + 1)} sendLabel="Submit local draft" cancelLabel="Cancel local response" />
    <output aria-label="Local submissions">{sent}</output>
  </section>;
}

export function ControlContainmentExamples() {
  const direction = new URLSearchParams(location.search).get('dir') === 'rtl' ? 'rtl' : 'ltr';
  const motionMode = new URLSearchParams(location.search).get('motion');
  const frame = useRef(0);
  const [samples, setSamples] = useState('Interact to sample rendered motion.');
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  function sampleMotion() {
    if (!motionMode) return;
    cancelAnimationFrame(frame.current);
    setSamples('Sampling24frames');
    const frames: { options: string[]; navigation: string[]; radios: string[]; popupColors: string[] }[] = [];
    const sample = () => {
      const read = (selector: string, property: 'opacity' | 'transform') => [...document.querySelectorAll(selector)].map(element => getComputedStyle(element)[property]);
      const popupColors = [...document.querySelectorAll('[role="listbox"], [role="menu"]')].map(element => {
        const style = getComputedStyle(element);
        return `${style.color} / ${style.backgroundColor}`;
      });
      frames.push({ options: read('[role="option"]', 'opacity'), navigation: read('.es-nav-item--active .es-nav-active-indicator', 'transform'), radios: read('.es-radio-dot', 'transform'), popupColors });
      if (frames.length < 24) frame.current = requestAnimationFrame(sample);
      else setSamples(JSON.stringify({ mode: motionMode, frames }));
    };
    frame.current = requestAnimationFrame(sample);
  }
  const [theme, setTheme] = useState<Theme>('light');
  const [activeTab, setActiveTab] = useState('one');
  return <DesignSystemProvider theme={theme} onThemeChange={setTheme}>
    <main dir={direction} style={{ maxWidth: 640, padding: 16 }} onClickCapture={sampleMotion} onKeyDownCapture={event => {
      if (event.key === 'F6') { event.preventDefault(); setTheme(current => current === 'light' ? 'dark' : 'light'); }
      sampleMotion();
    }}>
      <h1>Control containment</h1>
      <p id="explanation">Identical reusable controls outside and inside settings tabs. Local state only.</p>
      <p>Fixture shortcut: F6 changes the local theme while a popup is open.</p>
      <section aria-label="Caller identity examples">
        <BrandMark src="/demo-brand.svg" label="Caller-owned identity with a deliberately long accessible name" />
        <BrandMark src="data:image/svg+xml,invalid" label="Unavailable caller artwork" />
      </section>
      <Tabs label="Long-label tabs" value={activeTab} onChange={setActiveTab} items={[
        { id: 'one', label: 'First tab with a deliberately long localized name', content: <p>First local panel</p> },
        { id: 'blocked', label: 'Unavailable tab', disabled: true, content: <p>Unavailable panel</p> },
        { id: 'two', label: 'Second tab with another long localized name', content: <p>Second local panel</p> },
      ]} />
      <p>{motionMode === 'reduce' || motionMode === 'standard' ? `Simulated JavaScript motion preference: ${motionMode}. CSS media queries and OS settings remain native.` : 'Native browser motion preference.'}</p>
      {motionMode && <output aria-label="Control motion samples" style={{ display: 'block', maxHeight: 80, overflow: 'auto', overflowWrap: 'anywhere' }}>{samples}</output>}
      <section aria-label="Standalone controls"><h2>Standalone</h2><Controls prefix="Standalone" /></section>
      <section aria-label="Nested controls"><h2>Inside tabs</h2>
        <Tabs label="Settings example" variant="settings" value="one" onChange={() => {}} items={[{ id: 'one', label: 'Controls', content: <Controls prefix="Nested" /> }]} />
      </section>
      <NavigationAndComposer />
    </main>
  </DesignSystemProvider>;
}
createRoot(document.getElementById('root')!).render(<ControlContainmentExamples />);
