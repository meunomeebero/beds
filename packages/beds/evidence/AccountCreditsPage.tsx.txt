import { useState } from 'react';
import { AccountCredits, AccountMenu, AppShell, Avatar, DesignSystemProvider, PageHeader, ResultsStatus, Select, SidebarHeader, Stack, Text, WorkspaceTrigger, brands, type CreditBalance } from 'beds';

const formatCredits = (value: number) => Math.round(value).toLocaleString('pt-BR');
const normal: CreditBalance = { status: 'ready', value: 12500, formattedValue: '12.500', formatValue: formatCredits, limit: 20000 };

export default function AccountCreditsPage() {
  const params = new URLSearchParams(location.search);
  const [theme, setTheme] = useState<'light' | 'dark'>(params.get('theme') === 'light' ? 'light' : 'dark');
  const [open, setOpen] = useState(params.get('menu') === 'open');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(params.get('menu') === 'open');
  const [scenario, setScenario] = useState('ready');
  const [balance, setBalance] = useState<CreditBalance>(normal);
  const [message, setMessage] = useState('');

  function scenarioChange(value: string) {
    setScenario(value);
    setBalance(value === 'zero' ? { status: 'ready', value: 0, formattedValue: '0', formatValue: formatCredits, limit: 20000 }
      : value === 'no-limit' ? { status: 'ready', value: 12500, formattedValue: '12.500', formatValue: formatCredits }
      : value === 'loading' ? { status: 'loading', message: 'Consultando saldo…' }
      : value === 'unavailable' ? { status: 'unavailable', message: 'Saldo indisponível. Veja os detalhes de créditos.' }
      : value === 'error' ? { status: 'error', message: 'Não foi possível consultar o saldo. Tente novamente.' }
      : value === 'invalid' ? { status: 'ready', value: Number.NaN, formattedValue: 'NaN', limit: 20000 }
      : value === 'long' ? { status: 'ready', value: 123456789, formattedValue: '123.456.789', formatValue: formatCredits, limit: 200000000 }
      : normal);
  }

  return <DesignSystemProvider theme={theme} onThemeChange={setTheme} brandColor={brands.curriculol}>
    <AppShell collapsed={collapsed} onCollapsedChange={setCollapsed} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} contentWidth="home" sidebar={<SidebarHeader><AccountMenu
      open={open} onOpenChange={setOpen} label="Menu do usuário" appearanceLabel="Aparência" lightLabel="Claro" darkLabel="Escuro"
      trigger={<WorkspaceTrigger name="Luísa Costa" menuLabel="Menu de Luísa Costa" expanded={open} mark={<Avatar name="Luísa Costa" purpose="workspace" />} onClick={() => setOpen(!open)} />}
      identity={{ name: 'Luísa Costa', description: 'luisa@example.com', avatar: <Avatar name="Luísa Costa" /> }}
      actions={[{ id: 'settings', label: 'Configurações da conta', icon: 'Settings2' }, { id: 'help', label: 'Ajuda', icon: 'CircleHelp' }, { id: 'logout', label: 'Sair', icon: 'LogOut' }]}
      onAction={() => setMessage('Ação demonstrativa. Nenhuma mudança na conta.')}
      theme={theme} onThemeChange={setTheme}
      footer={<AccountCredits plan={scenario === 'long' ? 'Plano profissional para equipes e projetos de carreira' : 'Plano de exemplo'} label="Créditos" balance={balance} invalidValueLabel="Indisponível"
        action={{ label: balance.status === 'error' ? 'Tentar novamente' : 'Ver créditos', busy: balance.status === 'loading', onClick: () => {
          if (balance.status === 'error') { scenarioChange('ready'); return; }
          setOpen(false); setMobileOpen(false); setMessage('Detalhes de créditos solicitados nesta demonstração. Nenhuma compra foi iniciada.');
        } }} />}
    /></SidebarHeader>}>
      <Stack gap="section"><PageHeader title="Créditos no menu do usuário" description="Abra o menu da Luísa para visualizar o componente." />
        <Stack><Select label="Estado do saldo" value={scenario} onChange={scenarioChange} options={[{ id: 'ready', label: 'Com saldo' }, { id: 'zero', label: 'Saldo zero' }, { id: 'no-limit', label: 'Sem limite informado' }, { id: 'loading', label: 'Carregando' }, { id: 'unavailable', label: 'Indisponível' }, { id: 'error', label: 'Erro com recuperação' }, { id: 'invalid', label: 'Dado inválido' }, { id: 'long', label: 'Conteúdo longo' }]} />
        <Text variant="body-small" tone="secondary">Saldo, limite e plano fictícios. Sem pagamentos ou integração com a conta real.</Text><ResultsStatus>{message}</ResultsStatus></Stack>
      </Stack>
    </AppShell>
  </DesignSystemProvider>;
}
