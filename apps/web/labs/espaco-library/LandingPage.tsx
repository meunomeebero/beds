import { useEffect, useState } from 'react';
import {
  DesignSystemProvider, brands, BrandMark, IconButton, LandingPageLayout, LandingHero,
  LandingSection, ProductDemo, DocumentPreview, ProcessSteps, FAQSection, BenefitsSection,
  BenefitIllustration, PricingSection, LandingFooter, ApplicationCard, Dialog, Stack, Text,
  TextLink, type Theme,
} from 'beds';
import starterArt from './assets/pricing-starter.svg';
import proArt from './assets/pricing-pro.svg';

const benefitItems = [
  { id: 'documents', title: 'A mesma história. O foco certo para cada vaga.', description: 'Prepare um currículo e uma carta que relacionam sua experiência ao que a empresa procura.', illustration: <BenefitIllustration kind="documents" /> },
  { id: 'profile', title: 'Sem recomeçar a cada candidatura.', description: 'Reúna seu currículo, os dados do LinkedIn e suas experiências em um perfil.', illustration: <BenefitIllustration kind="profile" /> },
  { id: 'match', title: 'Saiba onde seu perfil combina.', description: 'Explore vagas e entenda os pontos de compatibilidade antes de preparar seus documentos.', illustration: <BenefitIllustration kind="match" /> },
  { id: 'lucy', title: 'Uma conversa ajuda a organizar.', description: 'Conte sua trajetória para a Lucy. Ela ajuda a dar forma às experiências que você quer destacar.', illustration: <BenefitIllustration kind="conversation" /> },
  { id: 'board', title: 'O próximo passo fica à vista.', description: 'Acompanhe os status, as anotações e os documentos de cada candidatura no mesmo lugar.', illustration: <BenefitIllustration kind="board" /> },
];

const questions = [
  { id: 'free', question: 'O que posso fazer de graça?', answer: 'Analisar seu currículo para uma vaga e buscar oportunidades. Para iniciar a análise, você confirma seu e-mail. A geração de um currículo e uma carta para a mesma vaga custa 1 crédito.' },
  { id: 'start', question: 'Preciso ter um currículo pronto?', answer: 'Não. Você pode importar um currículo, usar os dados do seu LinkedIn ou descrever suas experiências com a ajuda da Lucy para montar seu perfil.' },
  { id: 'credits', question: 'Como funcionam os créditos?', answer: 'Para uma vaga, 1 crédito prepara um currículo e uma carta de apresentação. Você compra quando precisar, sem assinatura. Os créditos não expiram enquanto a conta existir. Também há pacotes de 10 créditos por R$ 27,90 e 50 por R$ 55,90.' },
  { id: 'review', question: 'O Curriculol envia a candidatura por mim?', answer: 'Preparar os documentos não envia uma candidatura. Você revisa o conteúdo e decide o próximo passo. Nenhum envio acontece só por gerar um currículo ou uma carta.' },
  { id: 'guarantee', question: 'Uma boa análise garante uma entrevista?', answer: 'Não. A análise ajuda a identificar ajustes e a apresentar sua experiência com mais clareza, mas não garante aprovação por sistemas de triagem, entrevistas ou contratação.' },
];

export default function LandingPage() {
  const [theme, setTheme] = useState<Theme>(() => new URLSearchParams(location.search).get('theme') === 'dark' ? 'dark' : 'light');
  const [document, setDocument] = useState('resume');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const local = (view: string) => `?view=${view}&theme=${theme}`;
  const start = { label: 'Analisar meu currículo', href: local('upload') };
  useEffect(() => {
    const previousTitle = window.document.title;
    const previousLanguage = window.document.documentElement.lang;
    window.document.title = 'Curriculol — sua experiência, para a vaga certa';
    window.document.documentElement.lang = 'pt-BR';
    return () => { window.document.title = previousTitle; window.document.documentElement.lang = previousLanguage; };
  }, []);
  function changeTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    const url = new URL(location.href); url.searchParams.set('theme', next); history.replaceState(null, '', url);
  }
  return <DesignSystemProvider theme={theme} brandColor={brands.curriculol}>
    <LandingPageLayout brandName="Curriculol" brandMark={<BrandMark label="Curriculol" />} homeHref={local('landing')} skipLabel="Pular para o conteúdo"
      navigationLabel="Navegação principal" menuLabel="Menu" navigation={[{ label: 'Como funciona', href: '#como-funciona' }, { label: 'Vantagens', href: '#vantagens' }, { label: 'Créditos', href: '#creditos' }]}
      accountLink={{ label: 'Entrar', href: local('otp') }}
      appearance={<IconButton label={theme === 'light' ? 'Usar tema escuro' : 'Usar tema claro'} icon={theme === 'light' ? 'Moon' : 'Sun'} onClick={changeTheme} />}
      footer={<LandingFooter brandName="Curriculol" brandMark={<BrandMark label="Curriculol" />} title="Sua próxima candidatura começa com a sua história."
        description="Descubra o que seu currículo já comunica bem — e o que pode ficar mais claro para a vaga que você quer." action={start}
        groups={[{ id: 'product', label: 'Seu próximo passo', links: [{ id: 'profile', label: 'Preparar meu perfil', href: local('onboarding') }, { id: 'applications', label: 'Conhecer o quadro de vagas', href: local('kanban') }, { id: 'faq', label: 'Tirar uma dúvida', href: '#perguntas' }] }]}
        legal={{ label: 'Sobre a prévia', links: [{ id: 'catalog', label: 'Ver componentes no BEDS', href: local('components') }] }}
        note="Prévia de design do Curriculol. Dados ilustrativos; links abrem demonstrações locais. Sem análise, autenticação, envio ou cobrança real." />}
    >
      <LandingHero eyebrow="Sua experiência, para a vaga certa." title="A vaga muda. Seu currículo também."
        description="Entenda o que falta no seu currículo e prepare uma versão com foco na vaga — com uma carta de apresentação e a sua história de verdade."
        action={start} secondaryAction={{ label: 'Ver como funciona', href: '#como-funciona' }} note="Análise grátis. Sem cartão. Você revisa antes de enviar.">
        <ProductDemo label="Sua candidatura, organizada" note="Exemplo ilustrativo · dados fictícios" contextLabel="Uma oportunidade que faz sentido" resultLabel="Do seu perfil para esta vaga"
          value={document} onChange={setDocument}
          context={<ApplicationCard title="Product designer" company="Órbita" location="São Paulo · Híbrido" keywords={['Produto', 'Pesquisa', 'Design systems']}
            status={{ id: 'ready', label: 'Pronta para revisar', tone: 'success' }} onOpen={() => setDetailsOpen(true)} detailsLabel="Conhecer a vaga de exemplo"
            documents={[{ id: 'resume', label: 'Currículo', onOpen: () => setDocument('resume') }, { id: 'letter', label: 'Carta', onOpen: () => setDocument('letter') }]}
          />}
          tabs={[
            { id: 'resume', label: 'Currículo', content: <DocumentPreview name="Marina Costa" subtitle="Product designer · São Paulo"
              sections={[{ id: 'summary', title: 'Uma apresentação com foco', text: 'Designer de produto com experiência em pesquisa com usuários, prototipação e construção de design systems para produtos digitais.' }, { id: 'experience', title: 'A experiência que importa para a vaga', text: 'Colaborou com produto e engenharia para transformar descobertas de pesquisa em fluxos mais claros e componentes consistentes.' }]}
              note="Sua trajetória como ponto de partida. Você revisa cada detalhe." /> },
            { id: 'letter', label: 'Carta de apresentação', content: <DocumentPreview name="Olá, equipe Órbita." subtitle="Uma conexão entre sua trajetória e a oportunidade"
              sections={[{ id: 'intro', title: 'Por que esta vaga', text: 'A oportunidade de aproximar pesquisa, produto e design systems conversa com o trabalho que venho construindo como designer.' }, { id: 'contribution', title: 'Como posso contribuir', text: 'Quero levar minha experiência com equipes de produto e engenharia para criar jornadas mais claras para as pessoas que usam seus serviços.' }]}
              note="Um ponto de partida para a sua voz, não uma história inventada." /> },
          ]} />
      </LandingHero>
      <LandingSection id="como-funciona"><ProcessSteps title="Da sua história à próxima candidatura." description="Seu perfil é o ponto de partida. A oportunidade dá a direção."
        steps={[{ id: 'profile', title: 'Traga a sua história', description: 'Importe seu currículo ou organize suas experiências conversando com a Lucy.' }, { id: 'job', title: 'Escolha uma oportunidade', description: 'Encontre uma vaga ou traga a descrição. Veja onde seu currículo pode melhorar.' }, { id: 'review', title: 'Revise e siga em frente', description: 'Se quiser, prepare currículo + carta por 1 crédito. Revise os documentos e acompanhe a candidatura.' }]} /></LandingSection>
      <LandingSection id="vantagens"><BenefitsSection title="Tudo conversa com a sua próxima oportunidade." description="Do primeiro rascunho ao acompanhamento da candidatura, sem perder de vista o que faz sua trajetória única." items={benefitItems} /></LandingSection>
      <LandingSection id="creditos"><PricingSection title="Comece grátis. Prepare quando fizer sentido." description="Sem assinatura. Você escolhe quando usar créditos." plans={[
        { id: 'analysis', title: 'Entender seu currículo', description: 'Descubra como seu currículo se relaciona com uma vaga antes de preparar uma nova versão.', image: { src: starterArt, alt: '' }, price: { label: 'Grátis', description: 'Análise de currículo para uma vaga. Sem cartão.' }, featuresLabel: 'Seu primeiro passo', features: [{ id: 'analysis', text: 'Análise com pontos de atenção' }, { id: 'search', text: 'Busca de oportunidades sem créditos' }, { id: 'decision', text: 'Você decide o que fazer depois' }], action: start, featured: true, actionNote: 'A análise no aplicativo requer confirmação por e-mail.' },
        { id: 'kit', title: 'Preparar uma candidatura', description: 'Um currículo e uma carta de apresentação preparados para a mesma oportunidade.', image: { src: proArt, alt: '' }, price: { label: 'R$ 5,90', description: '1 crédito · pagamento único, sem renovação.' }, featuresLabel: 'Para a vaga que você escolheu', features: [{ id: 'resume', text: 'Currículo com foco na vaga' }, { id: 'letter', text: 'Carta de apresentação' }, { id: 'review', text: 'Documentos para você revisar e baixar' }], action: { label: 'Conhecer o fluxo de candidatura', href: local('kanban') }, actionNote: 'Os créditos não expiram enquanto a conta existir.' },
      ]} /></LandingSection>
      <LandingSection id="perguntas"><FAQSection title="Antes do próximo passo." description="O que vale saber para começar com clareza." items={questions} /></LandingSection>
    </LandingPageLayout>
    <Dialog open={detailsOpen} onOpenChange={setDetailsOpen} title="Product designer na Órbita" description="Vaga fictícia para demonstrar o fluxo. Nenhuma candidatura será enviada.">
      <Stack><Text variant="body">Neste exemplo, a equipe procura alguém com experiência em pesquisa com usuários, prototipação e design systems.</Text><Text variant="body" tone="secondary">O currículo e a carta mostram como relacionar a trajetória de Marina à oportunidade, sem prometer aprovação ou inventar experiência.</Text><TextLink href={local('kanban')}>Explorar o quadro de vagas de exemplo</TextLink></Stack>
    </Dialog>
  </DesignSystemProvider>;
}
