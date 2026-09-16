import { useState } from 'react';
import { BrandMark, ContentHeader, DesignSystemProvider, Inline, LandingFooter, Text, TextLink, ThemeToggle, brands } from 'beds';

export default function LandingFooterPage() {
  const params = new URLSearchParams(location.search);
  const [theme, setTheme] = useState<'light' | 'dark'>(params.get('theme') === 'dark' ? 'dark' : 'light');
  const long = params.get('preview') === 'long';
  const minimal = params.get('preview') === 'minimal';
  const href = (view: string) => `?view=${view}&theme=${theme}`;

  return <DesignSystemProvider theme={theme} onThemeChange={setTheme} brandColor={brands.curriculol}>
    <ContentHeader actions={<ThemeToggle label="Aparência" lightLabel="Claro" darkLabel="Escuro" />}>
      <Inline><TextLink href={href('components')}>Componentes</TextLink><Text>Rodapé da landing</Text></Inline>
    </ContentHeader>
    <LandingFooter brandName={long ? 'Curriculol — sua próxima oportunidade' : 'Curriculol'} brandMark={<BrandMark />}
      title={long ? 'Conte sua trajetória com clareza e encontre espaço para o próximo capítulo da sua carreira.' : 'Seu próximo passo começa com a sua história.'}
      description="Reúna suas experiências, encontre vagas e acompanhe suas candidaturas em um só lugar."
      action={minimal ? undefined : { label: long ? 'Começar a organizar minhas experiências profissionais' : 'Preparar meu perfil', href: href('onboarding') }}
      groups={minimal ? [] : [{ id: 'explore', label: 'Explore', links: [
        { id: 'search', label: 'Buscar vagas', href: href('search') },
        { id: 'applications', label: long ? 'Acompanhar e organizar candidaturas por etapa do processo seletivo' : 'Candidaturas', href: href('kanban') },
        { id: 'lucy', label: 'Conhecer a Lucy', href: href('lucy') },
      ] }]}
      community={minimal ? undefined : { label: 'Conteúdo e comunidade', links: [{ id: 'blog', label: 'Blog', href: href('blog-post') }, { id: 'forum', label: 'Fórum', href: href('forum') }] }}
      legal={long ? { label: 'Documentação da prévia', links: [{ id: 'docs', label: 'Voltar ao catálogo de componentes', href: href('components') }] } : undefined}
      note="Prévia de design · os links abrem exemplos do playground."
    />
  </DesignSystemProvider>;
}
