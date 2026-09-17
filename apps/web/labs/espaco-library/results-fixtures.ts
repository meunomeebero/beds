export type ResultMode = 'analysis' | 'optimization';
export type ResultPreview = 'default' | 'credits' | 'anonymous' | 'low-fit' | 'excellent' | 'missing' | 'regression' | 'partial' | 'balance-error' | 'existing';

export const resultPreviewOptions: { id: ResultPreview; label: string }[] = [
  { id: 'default', label: 'Resultado completo · sem saldo' },
  { id: 'credits', label: 'Com 2 créditos' },
  { id: 'anonymous', label: 'Sem identificação' },
  { id: 'low-fit', label: 'Baixa compatibilidade' },
  { id: 'excellent', label: 'Currículo já alinhado' },
  { id: 'missing', label: 'Leitura indisponível' },
  { id: 'regression', label: 'Estimativa menor' },
  { id: 'partial', label: 'Dimensões incompletas' },
  { id: 'balance-error', label: 'Falha ao consultar saldo' },
  { id: 'existing', label: 'Otimização já concluída' },
];

export function parseResultPreview(value: string | null): ResultPreview {
  return resultPreviewOptions.find(option => option.id === value)?.id ?? 'default';
}

// Synthetic presentation data. Prices mirror the product's individual credit;
// no product package, scoring rules, requests or account data are imported.
export const resultExample = {
  job: 'Product designer sênior',
  company: 'Ateliê Digital',
  name: 'Luísa Andrade',
  price: 'R$ 5,90',
  terms: '1 crédito · compra única, sem assinatura. Créditos não expiram.',
  included: ['Currículo adaptado para a vaga escolhida', 'Carta de apresentação para a mesma candidatura', 'Revisão, edição e download dos documentos'],
  dimensions: [
    { id: 'keywords', label: 'Palavras-chave', before: 54, after: 82, excellent: 97, lowFit: 22 },
    { id: 'formatting', label: 'Formatação', before: 78, after: 92, excellent: 96, lowFit: 54 },
    { id: 'sections', label: 'Seções', before: 70, after: 88, excellent: 97, lowFit: 28 },
    { id: 'impact', label: 'Impacto', before: 46, after: 82, excellent: 94, lowFit: 8 },
  ],
  findings: [
    { id: 'evidence', title: 'Dê contexto às suas entregas', description: 'A experiência cita pesquisa e protótipos, mas ainda não explica como essas atividades apoiaram decisões do produto.', tone: 'attention' as const },
    { id: 'terms', title: 'Aproxime o vocabulário da vaga', description: 'A vaga cita descoberta de produto e testes de usabilidade. Inclua esses termos apenas quando descrevem experiências reais.', tone: 'attention' as const },
    { id: 'strength', title: 'Preserve sua experiência em pesquisa', description: 'A colaboração com produto e engenharia já aparece. Essa base deve continuar presente na versão adaptada.', tone: 'positive' as const },
  ],
  lowFitFindings: [
    { id: 'scope', title: 'O escopo da vaga é diferente', description: 'Este cenário pede liderança de uma equipe de design. A trajetória de exemplo descreve contribuição individual, sem evidência dessa responsabilidade.', tone: 'attention' as const },
    { id: 'next', title: 'Procure uma oportunidade mais próxima', description: 'Compare vagas que valorizem pesquisa e prototipação. Reescrever o currículo não preenche uma experiência que ainda não existe.', tone: 'neutral' as const },
  ],
  excellentFindings: [
    { id: 'alignment', title: 'Experiências relevantes já estão claras', description: 'A versão de exemplo apresenta as atividades e responsabilidades pedidas para esta oportunidade.', tone: 'positive' as const },
    { id: 'preserve', title: 'Preserve esta versão', description: 'Revise nomes, datas e contatos antes de enviar. Uma nova otimização não é necessária para perseguir mais pontos.', tone: 'positive' as const },
  ],
  regressionFindings: [
    { id: 'regression', title: 'A nova leitura ficou abaixo da anterior', description: 'Não trate a reescrita como uma melhoria comprovada. Compare as duas versões e confira se algum contexto importante foi perdido.', tone: 'attention' as const },
    { id: 'review', title: 'Revise o documento que já é seu', description: 'Acesso e revisão permanecem disponíveis. Um novo pagamento não é necessário para conferir este resultado.', tone: 'neutral' as const },
  ],
  changes: [
    { id: 'summary', title: 'Resumo mais direto', description: 'Pesquisa e colaboração passaram para o início. A leitura chega antes às experiências relevantes para a vaga.', tone: 'positive' as const },
    { id: 'experience', title: 'Experiências com mais contexto', description: 'As atividades foram agrupadas por entrega, preservando os fatos do currículo de demonstração.', tone: 'positive' as const },
    { id: 'skills', title: 'Competências organizadas', description: 'Pesquisa, prototipação e colaboração foram separadas para facilitar a leitura. Nenhuma competência nova foi inventada.', tone: 'neutral' as const },
  ],
  reports: [
    { id: 'anya', title: 'Leitura técnica · Anya', text: 'O currículo tem seções reconhecíveis e apresenta experiência em pesquisa. O principal ajuste é relacionar atividades a entregas concretas e usar o vocabulário da vaga quando houver evidência. A nota é uma estimativa interna, não uma previsão de entrevista.', lowFit: 'Os termos de liderança exigidos nesta vaga não têm evidências na trajetória de exemplo. A formatação pode ser legível sem que o perfil se aproxime dos requisitos.', excellent: 'As seções são legíveis e as experiências relevantes já estão contextualizadas. Preserve a versão e confira os dados antes de enviar.' },
    { id: 'vanellope', title: 'Posicionamento · Vanellope', text: 'A trajetória tem pontos de contato com esta oportunidade. Explique melhor sua contribuição nas decisões e a colaboração com produto e engenharia. Se a vaga exigir uma responsabilidade que você ainda não assumiu, deixe essa diferença clara; a otimização não cria experiência.', lowFit: 'A trajetória de contribuição individual está distante do escopo de liderança deste cenário. Compare oportunidades que valorizem a experiência que você já tem, sem inventar responsabilidades.', excellent: 'A trajetória de exemplo está bem posicionada para o escopo da vaga. Não há motivo para pagar por uma nova versão apenas para aumentar a estimativa.' },
  ],
  beforeSummary: 'Experiência em pesquisa, entrevistas, testes, protótipos e contato com produto e engenharia.',
  resume: [
    { id: 'summary', title: 'Resumo', text: 'Product designer com experiência em pesquisa com pessoas usuárias, prototipação e colaboração com equipes de produto e engenharia.' },
    { id: 'experience', title: 'Experiência', text: 'Condução de entrevistas e testes de usabilidade. Síntese dos aprendizados para apoiar decisões de produto. Criação de fluxos e protótipos em colaboração com a equipe.' },
    { id: 'skills', title: 'Competências', text: 'Pesquisa qualitativa · Testes de usabilidade · Prototipação · Figma · Colaboração multidisciplinar.' },
  ],
};
