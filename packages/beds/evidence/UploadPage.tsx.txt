import { useState } from 'react';
import {
  BrandMark, Breadcrumbs, Button, ContentHeader, DesignSystemProvider,
  FileUploadField, Inline, NavItem, PageHeader, SidebarHeader, SidebarSection,
  Stack, Text, ThemeToggle, } from 'beds';
import { AppShell } from './recipes';
import { resumeAccept, resumeSelectionError } from './resume-upload';

export default function UploadPage() {
  const params = new URLSearchParams(location.search);
  const [theme, setTheme] = useState<'light' | 'dark'>(params.get('theme') === 'light' ? 'light' : 'dark');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const disabled = params.get('preview') === 'disabled';
  const compact = params.get('purpose') === 'default';

  function selectFiles(next: File[]) {
    const file = next[0];
    const problem = resumeSelectionError(next);
    if (problem) {
      setError(files.length ? `${problem} O currículo anterior foi mantido.` : problem);
      setStatus('');
      return;
    }
    setFiles(next);
    setError('');
    setStatus(file ? `${file.name} selecionado. Nada foi enviado.` : 'Currículo removido da seleção. O arquivo original não foi alterado.');
  }

  return <DesignSystemProvider theme={theme} onThemeChange={setTheme} brandColor={"#ffa133"}>
    <AppShell contentWidth="home" collapsed={collapsed} onCollapsedChange={setCollapsed} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} navigationLabel="Navegação" closeNavigationLabel="Fechar navegação"
      sidebar={<><SidebarHeader closeLabel="Fechar navegação" expandLabel="Expandir navegação" collapseLabel="Recolher navegação"><Inline gap="tight"><BrandMark src="/demo-brand.svg" label="Curriculol" /><Text>Curriculol</Text></Inline></SidebarHeader><SidebarSection label="Playground"><NavItem label="Componentes" icon="Folder" href={`?view=components&theme=${theme}`} /><NavItem label="Importar currículo" icon="FileText" active href={`?view=upload&theme=${theme}`} /><NavItem label="Lucy" icon="MessageCircle" href={`?view=lucy&theme=${theme}`} /></SidebarSection></>}
      header={<ContentHeader actions={<ThemeToggle label="Aparência" lightLabel="Claro" darkLabel="Escuro" />}><Breadcrumbs label="Localização" items={[{ id: 'catalog', label: 'Componentes', href: `?view=components&theme=${theme}` }, { id: 'upload', label: 'Upload' }]} /></ContentHeader>}>
      <Stack gap="section">
        <PageHeader title="Importar currículo" description="Comece pelo que você já tem." />
        <Stack>
          <FileUploadField purpose={compact ? 'default' : 'document'} documentLabel="PDF / DOCX" label="Sua trajetória começa aqui" files={files} onFilesChange={selectFiles}
            dropLabel="Arraste seu currículo ou escolha um arquivo para começar." dragLabel="Solte o currículo aqui para selecionar."
            browseLabel={files.length ? 'Trocar currículo' : 'Selecionar currículo'} removeLabel="Remover currículo"
            accept={resumeAccept} multiple disabled={disabled} description="PDF ou Word (.docx) · até 5 MB" error={error || undefined} status={status} />
          {files.length > 0 && <Inline align="between"><Text tone="secondary">Pronto para a próxima etapa da prévia.</Text><Button label="Continuar prévia" purpose="welcome" onClick={() => setStatus('Seleção confirmada na prévia. A leitura do currículo e a revisão do perfil ainda não estão conectadas.')} /></Inline>}
          <Text variant="body-small" tone="secondary">Demonstração local. O arquivo não é lido, enviado ou salvo.</Text>
          {disabled && <Text>Seleção desativada neste exemplo.</Text>}
        </Stack>
      </Stack>
    </AppShell>
  </DesignSystemProvider>;
}
