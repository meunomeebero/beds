import { useState } from 'react';
import { DesignSystemProvider, brands, Stack, PageHeader, TextField, Button, Notice, ThemeToggle, type Theme } from '@espaco/ui';
import '@espaco/ui/styles.css';
import '@espaco/ui/reset.css';

export function PersonalSaaS() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  return <DesignSystemProvider theme={theme} onThemeChange={setTheme} brandColor={brands.curriculol}>
    <Stack>
      <PageHeader title="Workspace" actions={<ThemeToggle />} />
      <TextField label="Workspace name" value={name} onChange={value => { setName(value); setSaved(false); }} />
      <Button label="Save" disabled={!name.trim()} onClick={() => setSaved(true)} />
      {saved && <Notice title="Saved locally" description="Connect this callback to your application service." tone="success" />}
    </Stack>
  </DesignSystemProvider>;
}
