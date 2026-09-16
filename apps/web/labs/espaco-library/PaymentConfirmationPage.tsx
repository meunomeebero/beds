import { useState } from 'react';
import { AppShell, BrandMark, Button, ContentHeader, DefinitionTable, DesignSystemProvider, Dialog, Inline, NavItem, PaymentConfirmation, SidebarHeader, SidebarSection, Stack, Text, ThemeToggle, brands, type PaymentInvoice } from 'beds';

export default function PaymentConfirmationPage() {
  const params = new URLSearchParams(location.search);
  const [theme, setTheme] = useState<'light' | 'dark'>(params.get('theme') === 'light' ? 'light' : 'dark');
  const [invoiceState, setInvoiceState] = useState<'available' | 'pending' | 'error'>(params.get('invoice') === 'pending' ? 'pending' : params.get('invoice') === 'error' ? 'error' : 'available');
  const [open, setOpen] = useState(false);
  const [replay, setReplay] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const long = params.get('preview') === 'long';
  const invoice: PaymentInvoice = invoiceState === 'available'
    ? { state: 'available', message: 'Sua nota fiscal está disponível.', action: { label: 'Ver nota fiscal', onClick: () => setOpen(true) } }
    : invoiceState === 'pending'
      ? { state: 'pending', message: 'O pagamento foi confirmado. Sua nota fiscal ainda está em emissão.' }
      : { state: 'error', message: 'Não foi possível carregar a nota fiscal. Tente novamente; você não será cobrado de novo.', action: { label: 'Tentar novamente', onClick: () => setInvoiceState('available') } };

  return <DesignSystemProvider theme={theme} onThemeChange={setTheme} brandColor={brands.curriculol}>
    <AppShell contentWidth="home" collapsed={collapsed} onCollapsedChange={setCollapsed} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} navigationLabel="Navegação" closeNavigationLabel="Fechar navegação"
      sidebar={<><SidebarHeader><Inline gap="tight"><BrandMark label="Curriculol" /><Text>Curriculol</Text></Inline></SidebarHeader><SidebarSection label="Playground"><NavItem label="Componentes" icon="Folder" href={`?view=components&theme=${theme}`} /><NavItem label="Pagamento confirmado" icon="CreditCard" active href={`?view=payment-confirmation&theme=${theme}`} /></SidebarSection></>}
      header={<ContentHeader actions={<ThemeToggle label="Aparência da página" lightLabel="Claro" darkLabel="Escuro" />}><Text>Componentes / Confirmação de pagamento</Text></ContentHeader>}>
      <Stack gap="section">
        <PaymentConfirmation key={replay} title="Pagamento confirmado" description="Tudo certo. Guarde os detalhes da sua compra." merchant={long ? 'Curriculol — experiências e oportunidades para sua próxima etapa profissional' : 'Curriculol'} mark={<BrandMark label="Curriculol" />} purchase={{ label: long ? 'Créditos para preparar currículos e cartas personalizados para suas próximas candidaturas' : 'Créditos para sua próxima etapa', description: 'Compra de demonstração' }} receipt={{
          title: 'Comprovante de pagamento',
          items: [{ id: 'credits', label: 'Créditos', value: 'R$ 20,00' }],
          total: { label: 'Total pago', value: 'R$ 20,00' },
          details: [{ id: 'method', label: 'Pagamento', value: 'Pix' }, { id: 'date', label: 'Data', value: '15 set. 2026' }, { id: 'order', label: 'Pedido', value: long ? 'DEMONSTRACAO-SEM-VALIDADE-FISCAL-2026-0915' : 'DEMO-0915' }],
          note: 'Exemplo sem validade fiscal.',
        }} invoice={invoice} animate={params.get('motion') !== 'off'} />
        <Stack>
          <Text variant="body-small" tone="secondary">Prévia com dados fictícios. Nenhum pagamento é feito e nenhuma nota fiscal é emitida. O valor não representa uma oferta do Curriculol.</Text>
          <Inline gap="tight"><Button label="Rever animação" onClick={() => setReplay(value => value + 1)} /><Button label="Nota em emissão" onClick={() => setInvoiceState('pending')} /><Button label="Simular erro da nota" onClick={() => setInvoiceState('error')} /><Button label="Nota disponível" onClick={() => setInvoiceState('available')} /></Inline>
        </Stack>
      </Stack>
      <Dialog open={open} onOpenChange={setOpen} title="Nota fiscal — demonstração" description="Prévia de apresentação, sem validade fiscal. Não é um documento emitido.">
        <Stack><DefinitionTable title="Dados de demonstração" unavailableLabel="Não informado" emptyMessage="Nenhum dado disponível." headingLevel={3} rows={[{ id: 'issuer', label: 'Empresa', value: 'Curriculol (exemplo)' }, { id: 'total', label: 'Total', value: 'R$ 20,00' }, { id: 'date', label: 'Data', value: '15 de setembro de 2026' }]} /><Text tone="secondary">Na integração real, esta ação abrirá a nota fiscal fornecida pelo serviço de emissão.</Text></Stack>
      </Dialog>
    </AppShell>
  </DesignSystemProvider>;
}
