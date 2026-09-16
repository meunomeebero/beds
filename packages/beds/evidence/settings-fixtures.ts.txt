// Synthetic preferences adapted from the existing Curriculol settings playground.
export const notificationGroups = [
  { id: 'documents', title: 'Análises e documentos', items: [
    { id: 'analysis_started', label: 'Análise iniciada', description: 'Quando sua análise entra na fila.' },
    { id: 'analysis_ready', label: 'Resultado da análise', description: 'Quando a análise está pronta para consultar.' },
    { id: 'optimization_started', label: 'Otimização iniciada', description: 'Quando a otimização entra na fila.' },
    { id: 'optimization_ready', label: 'Resultado da otimização', description: 'Quando seu currículo otimizado está pronto.' },
    { id: 'cv_started', label: 'Geração de currículo iniciada', description: 'Quando a geração entra na fila.' },
    { id: 'cv_ready', label: 'Currículo pronto', description: 'Quando o documento está disponível para baixar.' },
  ] },
  { id: 'forum', title: 'Comunidade', items: [
    { id: 'forum_comment', label: 'Comentários e respostas', description: 'Quando alguém interage com sua publicação ou comentário.' },
  ] },
  { id: 'financial', title: 'Financeiro', items: [
    { id: 'credits_purchased', label: 'Pagamento confirmado', description: 'Quando sua compra de créditos é confirmada.' },
    { id: 'credits_received', label: 'Primeira comissão de afiliado', description: 'Quando você recebe sua primeira comissão.' },
  ] },
];

export const confirmations = {
  memory: { title: 'Limpar memória da Lucy?', description: 'Esta demonstração não apaga memórias, currículos nem análises. Você está validando apenas a confirmação.', action: 'Simular limpeza' },
  delete: { title: 'Excluir conta?', description: 'Esta ação é definitiva na aplicação. Aqui, a exclusão é apenas simulada: sua conta e seus dados permanecem intactos.', action: 'Simular exclusão' },
  privacy: { title: 'Política de privacidade', description: 'Na aplicação, este acesso abre a política oficial. Esta prévia não contém um documento jurídico.', action: null },
  terms: { title: 'Termos de uso', description: 'Na aplicação, este acesso abre os termos oficiais. Nenhum aceite é registrado nesta prévia.', action: null },
};
