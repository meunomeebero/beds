import { useState, type ReactNode } from 'react';
import { AppShell } from './recipes';
import {
  AddSectionTile, BulletFields, Button, Checkbox, Chip, ChipInput, ContentHeader, Dialog, DesignSystemProvider, DocumentSheet, DocumentToolbar,
  DocumentWorkspace, Drawer, EditFooter, EditableSection, EditorPane, EntryList, Inline, Notice, PendingLine, RatingStrip, RevisionList,
  SidebarHeader, Text, TextAreaField, TextField, TextLink, ThemeToggle, VersionNote, type DocumentPane, type RevisionEntry, type Theme,
} from 'beds';
import './document-editor.css';

/* Synthetic catalog fixture: a document workspace with its per-section editor (0.3.0-rc.4). Fictional person and data. */

type Experience = { title: string; company: string; period: string; bullets: string[] };
type Language = { name: string; level: string };
type Doc = { name: string; contacts: string[]; summary: string; experience: Experience[]; skills: string[]; languages: Language[] };
type SectionId = 'contact' | 'summary' | 'experience' | 'skills' | 'languages';

const DELIVERED: Doc = {
  name: 'Marina Costa',
  contacts: ['marina@exemplo.com', '(11) 90000-0000', 'São Paulo, SP'],
  summary: 'Designer de produto com oito anos em serviços digitais. Conduzo pesquisa com pessoas usuárias e transformo problemas complexos em fluxos simples, junto com engenharia e dados.',
  experience: [
    { title: 'Product designer sênior', company: 'Estúdio Exemplo', period: 'jan 2022 – atual', bullets: ['Conduzi pesquisas e testes de usabilidade com clientes.', 'Estruturei uma biblioteca de componentes acessíveis.'] },
    { title: 'Product designer', company: 'Agência Modelo', period: 'mar 2018 – dez 2021', bullets: ['Redesenhei o fluxo de cadastro com a equipe de dados.'] },
  ],
  skills: ['Design de interação', 'Pesquisa com usuários', 'Figma', 'Prototipação'],
  languages: [{ name: 'Português', level: 'Nativo' }, { name: 'Inglês', level: 'Avançado' }],
};
const TITLES: Record<SectionId, string> = { contact: 'Contato', summary: 'Resumo', experience: 'Experiências', skills: 'Competências', languages: 'Idiomas' };
const HINTS: Partial<Record<SectionId, string>> = { contact: 'Nome e contatos do topo do documento.', experience: 'Cada tópico vira uma linha com marcador.', skills: 'Cada item aparece separado por vírgula.' };
const HISTORY: RevisionEntry[] = [
  { id: 'r3', title: 'Sua edição', when: '21 de out., 14:20', dateTime: '2026-10-21T14:20', state: 'current', stateLabel: 'Em uso', summary: ['Competências: 1 item novo'] },
  { id: 'r2', title: 'Sua edição', when: '21 de out., 14:02', dateTime: '2026-10-21T14:02', state: 'previous', stateLabel: 'Anterior', summary: ['Resumo reescrito'] },
  { id: 'r1', title: 'Versão entregue', when: '20 de out., 18:45', dateTime: '2026-10-20T18:45', state: 'previous', stateLabel: 'Anterior', detail: 'Você avaliou com nota 4 de 5' },
];

function Sheet({ doc }: { doc: Doc }) {
  const block = (title: string, children: ReactNode) => <section className="lab-doc-block"><h3>{title}</h3>{children}</section>;
  return <DocumentSheet label="Página 1 de 1">
    <div className="lab-doc">
      <h2>{doc.name}</h2>
      <p className="lab-doc-contacts">{doc.contacts.join('  |  ')}</p>
      {doc.summary && block('Resumo', <p>{doc.summary}</p>)}
      {doc.experience.length > 0 && block('Experiências', doc.experience.map((entry, index) => <div key={index} className="lab-doc-entry">
        <p className="lab-doc-row"><b>{entry.company}</b><span>{entry.period}</span></p>
        <p><i>{entry.title}</i></p>
        <ul>{entry.bullets.filter(Boolean).map((bullet, position) => <li key={position}>{bullet}</li>)}</ul>
      </div>))}
      {doc.skills.length > 0 && block('Competências', <p>{doc.skills.join(', ')}</p>)}
      {doc.languages.length > 0 && block('Idiomas', <ul>{doc.languages.map((language, index) => <li key={index}>{language.name}: {language.level}</li>)}</ul>)}
    </div>
  </DocumentSheet>;
}

export default function DocumentEditorPage() {
  const params = new URLSearchParams(location.search);
  const [theme, setTheme] = useState<Theme>(params.get('theme') === 'dark' ? 'dark' : 'light');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pane, setPane] = useState<DocumentPane>(params.get('pane') === 'side' ? 'side' : 'document');
  const [doc, setDoc] = useState<Doc>(() => params.get('version') === 'delivered' ? DELIVERED : { ...DELIVERED, skills: [...DELIVERED.skills, 'Acessibilidade'] });
  const edited = doc !== DELIVERED && JSON.stringify(doc) !== JSON.stringify(DELIVERED);
  const requested = params.get('open') as SectionId | null;
  const [openId, setOpenId] = useState<SectionId | null>(requested && requested in TITLES ? requested : null);
  const [draft, setDraft] = useState<Doc>(doc);
  const [toProfile, setToProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState<{ to: SectionId | null } | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [viewing, setViewing] = useState<string>('r3');
  const [receipt, setReceipt] = useState<{ rating: number } | null>(null);
  const [ratingPending, setRatingPending] = useState(false);
  const state = params.get('state');
  const dirty = openId !== null && JSON.stringify(draft) !== JSON.stringify(doc);
  const newItems = openId === 'skills' ? draft.skills.filter(item => !doc.skills.includes(item)).length : openId === 'experience' ? Math.max(0, draft.experience.length - doc.experience.length) : 0;
  const locked = viewing !== 'r3' ? 'Você está vendo uma versão do histórico. Volte à versão atual para editar.' : null;

  const open = (id: SectionId | null) => { setOpenId(id); setDraft(doc); setToProfile(false); };
  const request = (id: SectionId | null) => { if (saving) return; if (dirty) setPendingSwitch({ to: id }); else open(id); };
  const save = () => {
    if (!dirty) { open(null); return; }
    setSaving(true);
    window.setTimeout(() => { setDoc(draft); setSaving(false); setOpenId(null); }, 700);
  };

  const footer = (id: SectionId) => <EditFooter layout="stacked" note="Salvar refaz o documento." actions={<>
    <Button label="Cancelar" variant="ghost" disabled={saving} onClick={() => (dirty ? setPendingSwitch({ to: null }) : open(null))} />
    <Button label={saving ? 'Salvando…' : 'Salvar alterações'} variant="primary" busy={saving} disabled={saving || !dirty} onClick={save} />
  </>}>
    {newItems > 0 && (id === 'skills' || id === 'experience') && <Checkbox label="Salvar também no perfil" description={id === 'experience' ? 'Adiciona ao perfil só as experiências novas. Nada do que já está lá muda.' : 'Adiciona ao perfil só os itens novos. Nada do que já está lá muda.'} checked={toProfile} onChange={setToProfile} disabled={saving} />}
  </EditFooter>;

  const section = (id: SectionId, index: number, preview: ReactNode, form: ReactNode) => <EditableSection key={id} index={index} title={TITLES[id]} hint={HINTS[id]} editLabel="Editar"
    open={openId === id} onOpen={() => request(id)} disabled={Boolean(locked) || (saving && openId !== id)} preview={preview} footer={footer(id)}>{form}</EditableSection>;

  const side = <EditorPane title="Editar documento" titleId="lab-sections-title"
    meta={edited ? 'Prévia da última versão salva: 1 página, como a versão entregue.' : 'O documento é a versão entregue: 1 página.'}
    intro={edited && <VersionNote tone="current" label="Os downloads usam a sua versão editada." action={<Button label="Voltar à versão entregue" variant="ghost" compact onClick={() => { setDoc(DELIVERED); open(null); }} />} />}>
    {state === 'preparing'
      ? <PendingLine label="Separando o documento em seções, sem mudar o texto…" />
      : state === 'readonly'
        ? <Notice tone="info" title="A edição por seções ainda não está disponível neste documento." description="Não conseguimos separar este documento em seções sem mudar o texto. Você ainda pode baixar o arquivo, ver o histórico e enviar feedback." />
        : <>
          {locked && <Notice tone="info" title={locked} />}
          {section('contact', 0,
            <div className="lab-doc-read"><b>{doc.name}</b><span>{doc.contacts.join(' · ')}</span></div>,
            <div className="lab-doc-fields">
              <TextField label="Nome" value={draft.name} autoComplete="name" onChange={name => setDraft({ ...draft, name })} />
              {draft.contacts.map((contact, index) => <TextField key={index} label={['E-mail', 'Telefone', 'Localização'][index] ?? 'Outro contato'} value={contact} onChange={value => setDraft({ ...draft, contacts: draft.contacts.map((item, position) => position === index ? value : item) })} />)}
            </div>)}
          {section('summary', 1,
            <p className="lab-doc-clamp">{doc.summary}</p>,
            <TextAreaField label="Resumo" value={draft.summary} spellCheck onChange={summary => setDraft({ ...draft, summary })} />)}
          {section('experience', 2,
            <ol className="lab-doc-rows">{doc.experience.map((entry, index) => <li key={index}><b>{entry.title}</b><span>{entry.company} · {entry.period}</span></li>)}</ol>,
            <EntryList entries={draft.experience} onChange={experience => setDraft({ ...draft, experience })}
              create={() => ({ title: '', company: '', period: '', bullets: [''] })}
              summary={entry => ({ title: entry.title.trim(), meta: [entry.company.trim(), entry.period.trim()].filter(Boolean).join(' · ') })}
              labels={{ add: 'Adicionar experiência', remove: 'Remover experiência', untitled: 'Experiência sem cargo', moveUp: 'Mover para cima', moveDown: 'Mover para baixo' }}
              fields={(entry, update) => <>
                <TextField label="Cargo" value={entry.title} onChange={title => update({ ...entry, title })} />
                <TextField label="Empresa" value={entry.company} onChange={company => update({ ...entry, company })} />
                <TextField label="Período" value={entry.period} placeholder="Ex.: jan 2022 – atual" onChange={period => update({ ...entry, period })} />
                <BulletFields label="Tópicos" items={entry.bullets} onChange={bullets => update({ ...entry, bullets })} itemLabel={index => `Tópico ${index + 1}`} removeLabel={index => `Remover tópico ${index + 1}`} addLabel="Adicionar tópico" max={8} />
              </>} />)}
          {section('skills', 3,
            <ul className="lab-doc-chips">{doc.skills.map(skill => <li key={skill}><Chip label={skill} /></li>)}</ul>,
            <ChipInput label={TITLES.skills} items={draft.skills} onChange={skills => setDraft({ ...draft, skills })} inputLabel="Novo item" addLabel="Adicionar" emptyLabel="Nenhum item ainda." duplicateMessage="Este item já está na lista." max={30} maxLength={60} />)}
          {section('languages', 4,
            <ol className="lab-doc-rows">{doc.languages.map((language, index) => <li key={index}><b>{language.name}</b><span>{language.level}</span></li>)}</ol>,
            <EntryList entries={draft.languages} onChange={languages => setDraft({ ...draft, languages })} create={() => ({ name: '', level: '' })}
              summary={entry => ({ title: entry.name.trim(), meta: entry.level.trim() })}
              labels={{ add: 'Adicionar idioma', remove: 'Remover idioma', untitled: 'Idioma sem nome', moveUp: 'Mover para cima', moveDown: 'Mover para baixo' }}
              fields={(entry, update) => <>
                <TextField label="Idioma" value={entry.name} onChange={name => update({ ...entry, name })} />
                <TextField label="Nível" value={entry.level} placeholder="Ex.: Avançado" onChange={level => update({ ...entry, level })} />
              </>} />)}
          <AddSectionTile title="Certificações" hint="Vazio: não aparece no documento." actionLabel="Adicionar" disabled={Boolean(locked)} onClick={() => undefined} />
        </>}
  </EditorPane>;

  const historyView = viewing !== 'r3';
  return <DesignSystemProvider theme={theme} onThemeChange={setTheme} brandColor="#ffa133">
    <AppShell collapsed={collapsed} onCollapsedChange={setCollapsed} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} contentWidth="full" sidebar={<SidebarHeader><Text>Catálogo</Text></SidebarHeader>}
      header={<ContentHeader actions={<ThemeToggle label="Aparência" lightLabel="Claro" darkLabel="Escuro" />}><Inline><TextLink href={`?view=components&theme=${theme}`}>Componentes</TextLink><Text>Editor de documento</Text></Inline></ContentHeader>}>
      <div className="lab-doc-frame">
        <DocumentWorkspace
          pane={pane} onPaneChange={setPane} documentLabel="Documento" sideLabel="Editar" switchLabel="Áreas do documento" resizeLabel="Largura do painel de edição"
          documentRegionLabel="Documento; texto selecionável"
          toolbar={<DocumentToolbar label="Ações do documento"
            status={historyView ? <VersionNote tone="history" label="Versão do histórico" /> : undefined}
            actions={<>
              <Button label="Baixar" icon="FileText" variant="ghost" compact />
              {historyView && <Button label="Voltar à versão atual" variant="ghost" compact onClick={() => setViewing('r3')} />}
              <Button label="Histórico" variant="ghost" compact onClick={() => setHistoryOpen(true)} />
            </>} />}
          document={<Sheet doc={historyView ? DELIVERED : doc} />}
          side={side}
          footer={<RatingStrip key={viewing} label="Avaliação e feedback" legend="Como ficou o arquivo?" starLabel={value => `${value} ${value === 1 ? 'estrela' : 'estrelas'}`}
            submitLabel="Enviar avaliação" pendingLabel="Enviando…" pending={ratingPending}
            disabledReason={historyView ? 'Volte à versão atual para avaliar.' : undefined}
            receipt={receipt} receiptLabel="Avaliação enviada." scoreLabel={rating => `Nota ${rating} de 5.`}
            lowNote="Você pode revisar as seções ou enviar feedback."
            lowAction={<Button label="Revisar seções" variant="ghost" compact onClick={() => { setPane('side'); requestAnimationFrame(() => document.getElementById('lab-sections-title')?.focus()); }} />}
            onSubmit={rating => { setRatingPending(true); window.setTimeout(() => { setRatingPending(false); setReceipt({ rating }); }, 500); }}
            trailing={<Button label="Envie feedback" variant="outline" />} />}
        />
      </div>
      <Dialog open={pendingSwitch !== null} onOpenChange={value => { if (!value) setPendingSwitch(null); }} title="Descartar as alterações?" description="O que você mudou nesta seção ainda não foi salvo."
        actions={<>
          <Button label="Continuar editando" variant="ghost" onClick={() => setPendingSwitch(null)} />
          <Button label="Descartar alterações" variant="destructive" onClick={() => { const target = pendingSwitch?.to ?? null; setPendingSwitch(null); open(target); }} />
        </>} />
      <Drawer open={historyOpen} onOpenChange={setHistoryOpen} title="Histórico de versões" description="Todas as versões ficam salvas. Abrir uma só mostra o documento: nada muda até você restaurar." closeLabel="Fechar histórico">
        <RevisionList entries={HISTORY} displayedId={viewing} onOpen={id => { setViewing(id); setHistoryOpen(false); }} label="Versões, da mais recente para a mais antiga" openLabel="Ver esta versão" displayedLabel="Aberta no documento" />
      </Drawer>
    </AppShell>
  </DesignSystemProvider>;
}
