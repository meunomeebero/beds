// Catalog-only policy; the portable field never validates or reads file bytes.
// Mirrors Curriculol's PDF/DOCX and 5 MiB boundary, not its server parser.
export const resumeAccept = '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export function resumeSelectionError(files: readonly File[]): string {
  const file = files[0];
  if (files.length > 1) return 'Selecione um currículo por vez.';
  if (!file) return '';
  if (!/\.(pdf|docx)$/i.test(file.name)) return 'Use um arquivo PDF ou Word (.docx). Para um .doc antigo, salve uma cópia em PDF ou DOCX.';
  if (file.size === 0) return 'Este arquivo está vazio. Selecione outra cópia do currículo.';
  if (file.size > MAX_RESUME_BYTES) return 'O arquivo ultrapassa 5 MB. Reduza o tamanho ou selecione outra cópia.';
  return '';
}
