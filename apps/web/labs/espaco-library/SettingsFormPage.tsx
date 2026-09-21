import { useRef, useState } from 'react';
import { Button, DesignSystemProvider, Inline, PageHeader, ResultsStatus, SettingsForm, SettingsGroup, Stack, TextField, ThemeToggle } from 'beds';
import { AppShell } from './recipes';

export default function SettingsFormPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => new URLSearchParams(location.search).get('theme') === 'light' ? 'light' : 'dark');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  return <DesignSystemProvider theme={theme} onThemeChange={setTheme}>
    <AppShell sidebar={<ThemeToggle />} contentWidth="home" collapsed={collapsed} onCollapsedChange={setCollapsed} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen}>
      <Stack gap="section"><PageHeader title="Formulário de configurações" description="Enter, validação e retorno local. Nenhuma requisição." />
        <SettingsGroup title="Identidade"><SettingsForm label="Editar identidade" onSubmit={() => {
          if (!value.trim()) { setError('Informe um nome.'); ref.current?.focus(); return; }
          setError(''); setMessage('Nome salvo nesta demonstração.');
        }}>
          <TextField ref={ref} label="Nome" name="name" autoComplete="name" value={value} onChange={setValue} error={error || undefined} />
          <Inline><Button label="Salvar nome" type="submit" /></Inline>
        </SettingsForm></SettingsGroup>
        <ResultsStatus>{message}</ResultsStatus>
      </Stack>
    </AppShell>
  </DesignSystemProvider>;
}
