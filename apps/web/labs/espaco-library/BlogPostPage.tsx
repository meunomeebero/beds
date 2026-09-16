import { useState } from 'react';
import { AppShell, BlogPostCard, BlogPostList, BrandMark, Button, ContentHeader, DesignSystemProvider, Inline, NavItem, PageHeader, SidebarHeader, SidebarSection, Stack, Text, TextLink, ThemeToggle, brands, type BlogPostCardProps } from 'beds';
import marina from './assets/forum-marina.svg';
import rafael from './assets/forum-rafael.svg';

const resumeImage = './assets/blog-resume.svg';
const interviewImage = './assets/blog-interview.svg';

const posts: (Omit<BlogPostCardProps, 'href'> & { id: string; body: string })[] = [
  { id: 'curriculo', title: 'Um currículo que conta a sua história', author: { name: 'Marina Costa', avatarSrc: marina }, image: { src: resumeImage, alt: '' }, published: { label: '15 set. 2026', dateTime: '2026-09-15' }, readingTime: '4 min de leitura', excerpt: 'Escolha as experiências que mostram o que você sabe fazer — e dê espaço aos resultados, não só à lista de tarefas.', tags: ['Currículo', 'Carreira'], body: 'Comece pela experiência mais relevante para a oportunidade. Conte o contexto, a decisão que você tomou e o resultado que conseguiu observar. Quando houver números confiáveis, inclua-os; quando não houver, descreva a mudança sem inventar métricas.' },
  { id: 'entrevista', title: 'O que perguntar na sua próxima entrevista', author: { name: 'Rafael Lima', avatarSrc: rafael }, image: { src: interviewImage, alt: '' }, published: { label: '12 set. 2026', dateTime: '2026-09-12' }, readingTime: '3 min de leitura', excerpt: 'A conversa também é sua. Entenda como a equipe trabalha, o que espera da vaga e como as decisões são tomadas no dia a dia.', tags: ['Entrevistas'], body: 'Pergunte quais desafios a pessoa contratada encontrará nos primeiros meses e como a equipe troca feedback. Use as respostas para avaliar se a oportunidade combina com o que você procura.' },
  { id: 'portfolio', title: 'Seu portfólio não precisa contar tudo', author: { name: 'Joana Santos' }, readingTime: '5 min de leitura', excerpt: 'Dois projetos bem explicados podem mostrar mais sobre o seu trabalho do que uma coleção de entregas sem contexto.', tags: ['Portfólio', 'Design'], body: 'Escolha projetos que revelem decisões diferentes. Explique sua participação, os limites de cada projeto e o que você faria de outra forma hoje. Dê crédito às outras pessoas envolvidas.' },
];

export default function BlogPostPage() {
  const params = new URLSearchParams(location.search);
  const [theme, setTheme] = useState<'light' | 'dark'>(params.get('theme') === 'light' ? 'light' : 'dark');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [brokenImage, setBrokenImage] = useState(params.get('preview') === 'image-error');
  const long = params.get('preview') === 'long';
  const post = posts.find(item => item.id === params.get('post'));
  const listHref = `?view=blog-post&theme=${theme}`;

  return <DesignSystemProvider theme={theme} onThemeChange={setTheme} brandColor={brands.curriculol}>
    <AppShell contentWidth="chat" collapsed={collapsed} onCollapsedChange={setCollapsed} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} navigationLabel="Navegação" closeNavigationLabel="Fechar navegação"
      sidebar={<><SidebarHeader><Inline gap="tight"><BrandMark label="Curriculol" /><Text>Curriculol</Text></Inline></SidebarHeader><SidebarSection label="Playground"><NavItem label="Componentes" icon="Folder" href={`?view=components&theme=${theme}`} /><NavItem label="Posts do blog" icon="FileText" active href={listHref} /></SidebarSection></>}
      header={<ContentHeader actions={<ThemeToggle label="Aparência da página" lightLabel="Claro" darkLabel="Escuro" />}><Text>Componentes / Posts do blog</Text></ContentHeader>}>
      {post ? <Stack gap="section">
        <TextLink href={listHref}>Voltar para os artigos</TextLink>
        <PageHeader title={post.title} description={`Por ${post.author!.name} · ${post.readingTime}`} />
        <Stack><Text variant="body">{post.excerpt}</Text><Text variant="body">{post.body}</Text></Stack>
        <Text tone="secondary">Artigo de demonstração, sem conexão com o blog.</Text>
      </Stack> : <Stack gap="section">
        <PageHeader title="Leituras para o próximo passo" description="Ideias para contar sua história e encontrar novas oportunidades." />
        <BlogPostList label="Artigos de demonstração">
          {posts.map((item, index) => <BlogPostCard key={item.id}
            title={long && index === 0 ? 'Como apresentar sua trajetória em pesquisa, acessibilidade e desenvolvimento de sistemas de design para equipes internacionais' : item.title}
            href={`${listHref}&post=${item.id}`}
            author={long && index === 0 ? { name: 'Marina Albuquerque de Vasconcelos e equipe editorial internacional', avatarSrc: marina } : item.author}
            image={item.image ? { src: brokenImage ? './missing-blog-thumbnail.png' : item.image.src, alt: '' } : undefined}
            published={item.published} readingTime={item.readingTime} excerpt={item.excerpt}
            tags={long && index === 0 ? ['Desenvolvimentodecarreiracomacessibilidadeeinclusão', 'Histórias e aprendizados'] : item.tags}
          />)}
        </BlogPostList>
        <Stack gap="tight">
          <Text variant="body-small" tone="secondary">Conteúdo e autores fictícios para validar o componente. Abra um card para ler o exemplo completo.</Text>
          {brokenImage && <Button label="Restaurar imagens" onClick={() => setBrokenImage(false)} />}
        </Stack>
      </Stack>}
    </AppShell>
  </DesignSystemProvider>;
}
