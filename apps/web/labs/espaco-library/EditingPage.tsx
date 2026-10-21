import { useState } from 'react';
import { AppShell } from './recipes';
import {
  AddSectionTile, Button, ContentHeader, DesignSystemProvider, EditFooter, EditModeBar, EditableSection, Inline, PageHeader, PromptCard,
  SidebarHeader, Stack, StepList, SuccessMark, Text, TextAreaField, TextLink, ThemeToggle, VersionCompare, type StepItem, type Theme,
} from 'beds';

type SectionId = 'experience' | 'education' | 'skills';

const QUESTIONS: { id: string; label: string; question: string }[] = [
  { id: 'about', label: 'Uma frase sobre você', question: 'Como você se apresentaria em uma frase para quem ainda não te conhece?' },
  { id: 'city', label: 'Cidade onde você mora', question: 'Em qual cidade você mora hoje?' },
  { id: 'goal', label: 'O que você procura agora', question: 'Que tipo de trabalho você quer encontrar nos próximos meses?' },
  { id: 'languages', label: 'Idiomas', question: 'Quais idiomas você fala e em que nível?' },
];

const PROGRESS: StepItem[] = [
  { id: 'read', label: 'Lendo o arquivo', state: 'done' },
  { id: 'sections', label: 'Separando as seções', state: 'done' },
  { id: 'compare', label: 'Comparando com o que já existe', state: 'current' },
  { id: 'ready', label: 'Preparando a revisão', state: 'pending' },
];

/** Synthetic catalog fixture: one page in its edit mode — bar, section cards, add tile, checklist, progress, prompt, mark. */
export default function EditingPage() {
  const params = new URLSearchParams(location.search);
  const [theme, setTheme] = useState<Theme>(params.get('theme') === 'dark' ? 'dark' : 'light');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [editing, setEditing] = useState(true);
  const [openSection, setOpenSection] = useState<SectionId | null>('experience');
  const [role, setRole] = useState('Coordenadora de projetos');
  const [summary, setSummary] = useState('Coordeno equipes de cinco a oito pessoas em projetos de reforma de escolas públicas.');
  const [answered, setAnswered] = useState<string[]>(['about']);
  const [current, setCurrent] = useState('city');
  const [answer, setAnswer] = useState('');
  const [prompt, setPrompt] = useState(true);
  const [kept, setKept] = useState<'new' | 'old'>('new');

  const items: StepItem[] = QUESTIONS.map(item => ({ id: item.id, label: item.label, state: answered.includes(item.id) ? 'done' : item.id === current ? 'current' : 'pending' }));
  const currentQuestion = QUESTIONS.find(item => item.id === current && !answered.includes(item.id));
  const nextAfter = (done: string[]) => QUESTIONS.find(item => !done.includes(item.id) && item.id !== current)?.id ?? '';
  const save = () => { const done = [...answered, current]; setAnswered(done); setCurrent(nextAfter(done)); setAnswer(''); };
  const skip = () => { setCurrent(nextAfter(answered)); setAnswer(''); };

  return <DesignSystemProvider theme={theme} onThemeChange={setTheme} brandColor="#ffa133">
    <AppShell collapsed={collapsed} onCollapsedChange={setCollapsed} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} contentWidth="home" sidebar={<SidebarHeader><Text>Catálogo</Text></SidebarHeader>}>
    <ContentHeader actions={<ThemeToggle label="Aparência" lightLabel="Claro" darkLabel="Escuro" />}>
      <Inline><TextLink href={`?view=components&theme=${theme}`}>Componentes</TextLink><Text>Edição no lugar</Text></Inline>
    </ContentHeader>
    <Stack gap="section">
      <PageHeader title="Perfil" description="Um modo de edição por página: cada seção abre onde está, com as decisões fixas no rodapé." />

      {editing
        ? <EditModeBar label="Editando o perfil" actionLabel="Concluir edição" onAction={() => { setEditing(false); setOpenSection(null); }} hint="Toque em uma seção para editar. Nada muda até você salvar." />
        : <Inline><Button label="Editar perfil" icon="Settings2" onClick={() => setEditing(true)} /></Inline>}

      <PromptCard
        open={prompt}
        icon="Sparkles"
        title="Encontramos um resumo mais completo"
        body="O arquivo novo descreve melhor o seu trabalho atual. Escolha qual versão fica no perfil."
        actions={<>
          <Button label={kept === 'new' ? 'Manter o atual' : 'Usar o novo'} variant="secondary" compact onClick={() => setKept(kept === 'new' ? 'old' : 'new')} />
          <Button label="Agora não" variant="ghost" compact onClick={() => setPrompt(false)} />
        </>}
      >
        <VersionCompare rows={[
          { id: 'new', label: 'Novo', value: 'Coordeno equipes de cinco a oito pessoas em reformas de escolas públicas, do orçamento à entrega, com prazos curtos e fornecedores locais.', state: kept === 'new' ? 'stays' : 'unused', clampLines: 3 },
          { id: 'old', label: 'Atual', value: 'Coordenação de projetos de reforma.', state: kept === 'new' ? 'goes' : 'stays' },
        ]} />
      </PromptCard>

      <StepList
        title="O que falta"
        count={`${answered.length} de ${QUESTIONS.length}`}
        items={items}
        onSelect={id => { setCurrent(id); setAnswer(''); }}
        selectLabel="Responder"
        doneLabel="concluído"
        doneMessage="Tudo certo por aqui. Seu perfil está completo."
        currentContent={currentQuestion && <>
          <TextAreaField label={currentQuestion.question} value={answer} onChange={setAnswer} placeholder="Escreva com suas palavras" />
          <Inline><Button label="Salvar" variant="primary" compact disabled={!answer.trim()} onClick={save} /><Button label="Pular" variant="ghost" compact onClick={skip} /></Inline>
        </>}
      />

      <EditableSection
        title="Experiência"
        count="2"
        hint="Comece pelo trabalho mais recente."
        editLabel="Editar"
        open={openSection === 'experience'}
        onOpen={() => setOpenSection('experience')}
        disabled={!editing}
        preview={<Stack gap="tight"><Text variant="label">{role}</Text><Text tone="secondary">Construtora Horizonte · 2021 até hoje</Text></Stack>}
        footer={<EditFooter note="As mudanças aparecem no perfil assim que você salvar." actions={<>
          <Button label="Cancelar" variant="ghost" onClick={() => setOpenSection(null)} />
          <Button label="Salvar alterações" variant="outline" onClick={() => setOpenSection(null)} />
        </>} />}
      >
        <Stack>
          <TextAreaField label="Cargo" value={role} onChange={setRole} />
          <TextAreaField label="O que você fazia" value={summary} onChange={setSummary} />
        </Stack>
      </EditableSection>

      <EditableSection
        title="Formação"
        count="1"
        editLabel="Editar"
        open={openSection === 'education'}
        onOpen={() => setOpenSection('education')}
        disabled={!editing}
        preview={<Stack gap="tight"><Text variant="label">Engenharia civil</Text><Text tone="secondary">Universidade Federal · 2014 a 2019</Text></Stack>}
        footer={<EditFooter note="Não foi possível salvar. Confira a conexão e tente de novo." tone="error" actions={<>
          <Button label="Cancelar" variant="ghost" onClick={() => setOpenSection(null)} />
          <Button label="Tentar de novo" variant="outline" onClick={() => setOpenSection(null)} />
        </>} />}
      >
        <Text tone="secondary">Formulário da formação (exemplo).</Text>
      </EditableSection>

      <AddSectionTile title="Competências" hint="Liste o que você faz bem, uma por vez." actionLabel="Adicionar" disabled={!editing} onClick={() => setOpenSection('skills')} />

      <Stack gap="tight">
        <Text variant="label">Progresso de uma tarefa</Text>
        <StepList purpose="progress" items={PROGRESS} doneLabel="concluído" note="Leva menos de um minuto. Você pode sair desta tela." />
      </Stack>

      <Stack gap="tight">
        <Text variant="label">Confirmação</Text>
        <Inline align="center"><SuccessMark /><SuccessMark compact /><Text>Perfil atualizado.</Text></Inline>
      </Stack>
    </Stack>
    </AppShell>
  </DesignSystemProvider>;
}
