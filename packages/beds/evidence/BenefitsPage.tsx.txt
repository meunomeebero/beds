import { useState } from 'react';
import { ContentHeader, DesignSystemProvider, Inline, Text, TextLink, ThemeToggle } from 'beds';
import { BenefitIllustration, BenefitsSection } from './recipes';

export default function BenefitsPage() {
  const params = new URLSearchParams(location.search);
  const [theme, setTheme] = useState<'light' | 'dark'>(params.get('theme') === 'dark' ? 'dark' : 'light');
  const preview = params.get('preview');
  const long = preview === 'long';
  const href = (view: string) => `?view=${view}&theme=${theme}`;

  return <DesignSystemProvider theme={theme} onThemeChange={setTheme} brandColor={"#ffa133"}>
    <ContentHeader actions={<ThemeToggle label="Aparência" lightLabel="Claro" darkLabel="Escuro" />}>
      <Inline><TextLink href={href('components')}>Componentes</TextLink><Text>Vantagens do Curriculol</Text></Inline>
    </ContentHeader>
    <BenefitsSection purpose="page"
      title="Da sua experiência à próxima candidatura."
      description="Reúna sua trajetória, prepare seus documentos e acompanhe cada oportunidade em um só lugar."
      items={preview === 'empty' ? [] : [
        { id: 'documents', title: long ? 'Um currículo e uma carta de apresentação que conectam suas experiências profissionais aos requisitos de cada oportunidade.' : 'Um currículo que conversa com a vaga.', description: 'Prepare o currículo e a carta de apresentação a partir das suas experiências e dos requisitos da oportunidade.', illustration: preview === 'minimal' ? undefined : <BenefitIllustration kind="documents" /> },
        { id: 'profile', title: 'Sua trajetória, sem começar do zero.', description: 'Traga seu currículo ou os dados do LinkedIn para montar seu perfil.', illustration: <BenefitIllustration kind="profile" /> },
        { id: 'match', title: 'Entenda onde seu perfil combina.', description: 'Veja a compatibilidade com a vaga e o que merece atenção.', illustration: <BenefitIllustration kind="match" /> },
        { id: 'lucy', title: 'Conte sua história para a Lucy.', description: 'Converse para organizar e complementar suas experiências.', illustration: <BenefitIllustration kind="conversation" /> },
        { id: 'board', title: 'Cada candidatura, no seu lugar.', description: 'Acompanhe o status das vagas e mantenha os documentos por perto.', illustration: <BenefitIllustration kind="board" /> },
      ]}
      action={preview === 'minimal' || preview === 'empty' ? undefined : { label: long ? 'Começar a organizar minhas experiências e preparar meu perfil profissional' : 'Preparar meu perfil', href: href('onboarding') }}
      note="Prévia de design · ilustrações demonstrativas, sem dados reais."
    />
  </DesignSystemProvider>;
}
