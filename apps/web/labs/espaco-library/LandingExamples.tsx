import { useState } from 'react';
import {
  Avatar, Badge, BrandMark, Button, DesignSystemProvider, Icon, Inline, LandingPage,
  Metric, PromoHero, RankedList, SectionHeader, Stack, Surface, Text, brands, type Theme,
} from 'beds';

function SidePanel({ title, tone }: { title: string; tone: 'subtle' | 'raised' }) {
  return <Surface role={tone}>
    <Stack gap="tight">
      <Text variant="overline" tone="secondary">Painel compacto</Text>
      <Text variant="section-title">{title}</Text>
      <Inline gap="tight" align="center"><Icon name="Check" purpose="small" /><Text variant="body-small">Benefício demonstrativo em uma linha curta.</Text></Inline>
      <Inline gap="tight" align="center"><Icon name="Check" purpose="small" /><Text variant="body-small">Benefício demonstrativo em uma linha curta.</Text></Inline>
      <Button label="Ação do painel" purpose="welcome" touchTarget onClick={() => {}} />
    </Stack>
  </Surface>;
}

function RankedCard({ position, name, followers }: { position: number; name: string; followers: string }) {
  // Dois perfis usam asset real (lazy loading); o segundo usa src inexistente
  // para demonstrar a recuperação única para iniciais.
  const src = position === 2 ? '/inexistente.svg' : position === 1 ? '/assets/feature-onboarding.svg' : undefined;
  return <Surface role="subtle">
    <Stack gap="tight">
      <Inline gap="tight" align="center">
        <Badge label={`#${position}`} />
        <Avatar name={name} src={src} purpose="profile" lazy />
        <Stack gap="tight">
          <Text variant="label">{name}</Text>
          <Text variant="caption" tone="secondary">@exemplo</Text>
        </Stack>
      </Inline>
      <Inline gap="default" align="start">
        <Metric label="Seguidores" value={followers} />
        <Metric label="Views/post" value="12 mil" />
      </Inline>
      <Button label={`Anunciar com ${name.split(' ')[0]}`} variant="primary" touchTarget onClick={() => {}} />
    </Stack>
  </Surface>;
}

const rankedNames = ['Ana Duarte', 'Bruno Costa', 'Carla Reis', 'Davi Mota', 'Elisa Prado', 'Felipe Araújo'];
const rankedFollowers = ['128 mil', '96,5 mil', '74,2 mil', '58,1 mil', '43,6 mil', '31,8 mil'];

/**
 * Catalog composition for the public landing primitives: page lane, asymmetric
 * promotional hero and the semantic ranked list. All state is synthetic.
 */
export default function LandingExamples() {
  const [theme, setTheme] = useState<Theme>(new URLSearchParams(location.search).get('theme') === 'light' ? 'light' : 'dark');
  return <DesignSystemProvider theme={theme} brandColor={brands.reference}>
    <LandingPage>
      <Stack gap="section">
        <Inline align="between">
          <Inline gap="tight" align="center"><BrandMark label="Prévia" /><Text variant="metric">prévia</Text></Inline>
          <Button label="Ação do cabeçalho" variant="ghost" onClick={() => {}} />
        </Inline>
        <Stack gap="tight">
          <Text variant="page-title">Heró de divulgação assimétrica</Text>
          <Text variant="caption" tone="secondary">Exemplo de catálogo · conteúdo sintético</Text>
        </Stack>
        <PromoHero
          leading={<SidePanel title="Lado inicial" tone="subtle" />}
          center={<Surface role="raised"><Stack gap="tight">
            <Inline gap="tight" align="center">
              <Avatar name="Centro Demonstrativo" purpose="account" />
              <Text variant="label">Centro dominante</Text>
            </Inline>
            <Text variant="body">A coluna central recebe a composição principal da página pública. Entre 1024px e o limite do contêiner, a coluna central fica entre 500 e 540px e os painéis laterais compartilham o espaço restante. Abaixo de 1024px, o centro vem primeiro e os painéis seguem em duas colunas; abaixo de 768px, tudo empilha em uma coluna.</Text>
            <Text variant="caption" tone="secondary">Métricas decorativas · 24 respostas · 216 curtidas</Text>
          </Stack></Surface>}
          trailing={<SidePanel title="Lado final" tone="raised" />}
        />
        <Stack gap="tight">
          <SectionHeader title="Lista ordenada de exemplo" description="Três colunas a partir de 1024px; duas de 768px; uma abaixo. Semântica de lista ordenada." />
          <RankedList label="Exemplo de ranking">
            {rankedNames.map((name, index) => <RankedCard key={name} position={index + 1} name={name} followers={rankedFollowers[index] ?? '10 mil'} />)}
          </RankedList>
        </Stack>
      </Stack>
    </LandingPage>
  </DesignSystemProvider>;
}