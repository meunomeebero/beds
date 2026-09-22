import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, DesignSystemProvider, FileUploadField, RadioGroup, Stack, Text, ThemeToggle } from '../../src';
import '../../dist/styles.css';
import './styles.css';

function FormFieldsLab() {
  const params = new URLSearchParams(location.search);
  const [theme, setTheme] = useState<'light' | 'dark'>(params.get('theme') === 'dark' ? 'dark' : 'light');
  const [format, setFormat] = useState('');
  const [formatError, setFormatError] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState('');
  const removalMode = params.get('removal');
  const chooseFormat = (value: string) => {
    setFormat(value);
    setFormatError('');
  };
  const chooseFiles = (nextFiles: File[]) => {
    if (nextFiles.length < files.length && removalMode === 'reject') return;
    if (nextFiles.length < files.length && removalMode === 'lag') {
      window.setTimeout(() => {
        setFiles(nextFiles);
        setFileError('');
      }, 250);
      return;
    }
    setFiles(nextFiles);
    setFileError('');
  };

  return <DesignSystemProvider brandColor="#d0f300" theme={theme} onThemeChange={setTheme}>
    <main>
      <header>
        <Text variant="page-title">Campos de formulário</Text>
        <ThemeToggle label="Alternar tema" lightLabel="Usar tema claro" darkLabel="Usar tema escuro" />
      </header>
      <Text tone="secondary">Demonstração local. Nenhum arquivo é enviado.</Text>
      <Stack gap="section">
        <section aria-label="RadioGroup">
          <Text variant="section-title">RadioGroup</Text>
          <RadioGroup label="Formato da análise" value={format} onChange={chooseFormat} error={formatError} description="A escolha fica apenas neste exemplo." options={[{ id: 'resume', label: 'Currículo' }, { id: 'profile', label: 'Perfil do LinkedIn' }, { id: 'portfolio', label: 'Portfólio indisponível', disabled: true }]} />
          <Button label="Validar formato" onClick={() => { if (!format) setFormatError('Escolha um formato para continuar.'); }} />
          {format && <div role="status"><Text>Formato selecionado: {format === 'resume' ? 'Currículo' : 'Perfil do LinkedIn'}.</Text></div>}
        </section>
        <form aria-label="Contrato callback-only FileUploadField" onSubmit={event => event.preventDefault()}>
          <section aria-label="FileUploadField">
            <Text variant="section-title">FileUploadField</Text>
            <FileUploadField label="Arquivo de currículo" files={files} onFilesChange={chooseFiles} multiple dropLabel="Solte um arquivo aqui" browseLabel="Escolher arquivo" removeLabel="Remover arquivo" accept=".pdf,.doc,.docx" description="Seleção local; o envio pertence ao aplicativo." error={fileError} />
            <Button label="Validar arquivo" onClick={() => { if (files.length === 0) setFileError('Selecione um arquivo para continuar.'); }} />
          </section>
        </form>
        <section aria-label="Estados desabilitados">
          <Text variant="section-title">Estados desabilitados</Text>
          <RadioGroup label="Formato indisponível" value="resume" onChange={() => undefined} disabled options={[{ id: 'resume', label: 'Currículo' }, { id: 'profile', label: 'Perfil' }]} />
          <FileUploadField label="Arquivo indisponível" files={[]} onFilesChange={() => undefined} dropLabel="Envio indisponível" browseLabel="Escolher arquivo indisponível" removeLabel="Remover arquivo" disabled />
        </section>
      </Stack>
    </main>
  </DesignSystemProvider>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><FormFieldsLab /></React.StrictMode>);
