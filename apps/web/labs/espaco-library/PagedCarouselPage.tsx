import { AppShell, DesignSystemProvider, PageHeader, PagedCarousel, Stack, Surface, Text, brands } from 'beds';

const slides = [
  ['Importe seu perfil', 'Envie o PDF do LinkedIn para preencher suas experiências e habilidades.'],
  ['Revise seus dados', 'Confira as informações importadas antes de continuar.'],
  ['Encontre vagas', 'Use seu perfil para descobrir oportunidades mais compatíveis.'],
];

export default function PagedCarouselPage() {
  const theme = new URLSearchParams(location.search).get('theme') === 'light' ? 'light' : 'dark';
  return <DesignSystemProvider theme={theme} brandColor={brands.curriculol}>
    <AppShell sidebar={null} contentWidth="chat" collapsed={true} onCollapsedChange={() => {}} mobileOpen={false} onMobileOpenChange={() => {}}>
      <Stack>
        <PageHeader title="Carrossel paginado" description="Galeria manual para onboarding e conteúdo editorial." />
        <PagedCarousel label="Etapas de introdução" previousLabel="Etapa anterior" nextLabel="Próxima etapa" slideLabel={({ index, count }) => `Etapa ${index} de ${count}`}>
          {slides.map(([title, description]) => <Surface key={title} role="panel"><Stack><Text variant="section-title">{title}</Text><Text tone="secondary">{description}</Text></Stack></Surface>)}
        </PagedCarousel>
      </Stack>
    </AppShell>
  </DesignSystemProvider>;
}
