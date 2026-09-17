// Synthetic catalog data adapted from Curriculol's processing-configs.ts.
// Preserve the source's 90s/75s cadence and chapter offsets. The host must
// identify score values as illustrative, never as a real analysis or forecast.
export type ProcessingDemoKind = 'analysis' | 'optimization';

export interface ProcessingDemoFixture {
  title: string;
  description: string;
  durationSeconds: number;
  steps: { id: string; label: string; detail: string }[];
  chapters: { at: number; title: string; body: string }[];
  logs: string[];
  scores: { id: string; label: string; value: number }[];
  resultTitle: string;
}

export const processingFixtures: Record<ProcessingDemoKind, ProcessingDemoFixture> = {
  analysis: {
    title: 'Analisando seu currículo',
    description: 'Acompanhe a leitura do currículo, a comparação com a vaga e a preparação do diagnóstico.',
    durationSeconds: 90,
    steps: [
      { id: 'read', label: 'Anya lê seu currículo', detail: 'Organizando as informações do documento para a análise.' },
      { id: 'keywords', label: 'Anya compara palavras-chave', detail: 'Relacionando os termos do currículo aos requisitos da vaga.' },
      { id: 'career', label: 'Vanellope avalia sua trajetória', detail: 'Observando experiências, responsabilidades e evolução profissional.' },
      { id: 'strategy', label: 'Revisando as oportunidades de ajuste', detail: 'Identificando pontos que podem ficar mais claros para esta vaga.' },
      { id: 'synthesis', label: 'Preparando o diagnóstico', detail: 'Reunindo as perspectivas dos agentes em uma leitura conjunta.' },
    ],
    chapters: [
      { at: 0, title: 'Cada olhar tem uma especialidade', body: 'Anya avalia a leitura técnica. Vanellope observa a relação entre sua trajetória e a vaga.' },
      { at: 10, title: 'O contexto vem primeiro', body: 'A comparação considera o que a vaga pede e o que sua experiência já comunica.' },
      { at: 22, title: 'Anya cuida da leitura', body: 'Ela observa a estrutura e as palavras-chave que ajudam sistemas de triagem a interpretar o currículo.' },
      { at: 36, title: 'Vanellope conecta sua trajetória', body: 'Ela olha para as experiências, a coerência entre os cargos e a relação com a oportunidade.' },
      { at: 52, title: 'Uma perspectiva opcional', body: 'Você pode ativar Arya no aplicativo para explorar seu posicionamento. Essa leitura não está ativa nesta prévia.' },
      { at: 68, title: 'As perspectivas se encontram', body: 'A síntese reúne os relatórios para organizar os pontos fortes e os ajustes sugeridos.' },
      { at: 82, title: 'Um diagnóstico para orientar o próximo passo', body: 'Ao concluir, a análise ajuda você a decidir o que revisar antes de preparar sua candidatura.' },
    ],
    logs: [
      'Anya examina a estrutura do currículo.',
      'Vanellope observa o contexto da trajetória profissional.',
      'Os pontos pouco claros são organizados para revisão.',
      'Os termos da vaga orientam a leitura das palavras-chave.',
      'As experiências são relacionadas aos requisitos informados.',
      'Os agentes avaliam pontos de compatibilidade e de atenção.',
      'A síntese organiza o diagnóstico para revisão.',
    ],
    scores: [
      { id: 'keywords', label: 'Palavras-chave', value: 78 },
      { id: 'formatting', label: 'Formatação', value: 56 },
      { id: 'experience', label: 'Experiência', value: 34 },
      { id: 'skills', label: 'Habilidades', value: 67 },
    ],
    resultTitle: 'Análise de demonstração pronta',
  },
  optimization: {
    title: 'Otimizando seu currículo',
    description: 'Acompanhe os ajustes de linguagem, a organização das experiências e a revisão do documento.',
    durationSeconds: 75,
    steps: [
      { id: 'keywords', label: 'Anya ajusta as palavras-chave', detail: 'Relacionando a linguagem da vaga às informações do currículo.' },
      { id: 'career', label: 'Vanellope organiza as experiências', detail: 'Revisando a clareza das responsabilidades e dos resultados informados.' },
      { id: 'strategy', label: 'Arya refina o foco', detail: 'Avaliando como destacar experiências relevantes para a oportunidade.' },
      { id: 'compilation', label: 'Reunindo as recomendações', detail: 'Compondo uma versão do currículo com os ajustes propostos.' },
      { id: 'audit', label: 'Revisando o documento', detail: 'Conferindo linguagem, consistência e fidelidade às informações fornecidas.' },
    ],
    chapters: [
      { at: 0, title: 'Sua experiência é o ponto de partida', body: 'A otimização trabalha com as informações do currículo e o contexto da vaga.' },
      { at: 10, title: 'Cada ajuste precisa fazer sentido', body: 'O processo combina linguagem, organização e revisão para preparar uma versão que você possa conferir.' },
      { at: 22, title: 'Anya aproxima a linguagem da vaga', body: 'Ela considera palavras-chave relevantes quando elas correspondem à experiência que você informou.' },
      { at: 36, title: 'Vanellope dá clareza à trajetória', body: 'Ela reorganiza as experiências e destaca responsabilidades e resultados presentes no seu conteúdo.' },
      { at: 50, title: 'Arya ajuda a escolher o foco', body: 'Ela avalia o que merece destaque para tornar a relação com a oportunidade mais fácil de perceber.' },
      { at: 62, title: 'Uma revisão antes da entrega', body: 'A auditoria confere linguagem e consistência e procura informações que não tenham apoio no conteúdo fornecido.' },
      { at: 72, title: 'A próxima leitura é sua', body: 'Quando o documento estiver pronto, revise os ajustes e confirme as informações antes de usá-lo na candidatura.' },
    ],
    logs: [
      'As recomendações dos agentes orientam a preparação do documento.',
      'Anya revisa a relação entre palavras-chave e experiências informadas.',
      'Vanellope organiza as descrições da trajetória profissional.',
      'Arya avalia o foco do currículo para a oportunidade.',
      'O otimizador reúne os ajustes em uma versão para revisão.',
      'A auditoria confere linguagem, consistência e fidelidade ao conteúdo.',
    ],
    scores: [
      { id: 'keywords', label: 'Palavras-chave', value: 96 },
      { id: 'formatting', label: 'Formatação', value: 92 },
      { id: 'impact', label: 'Impacto', value: 78 },
      { id: 'strategy', label: 'Estratégia', value: 89 },
    ],
    resultTitle: 'Currículo de demonstração pronto',
  },
};
