import { useState } from 'react';
import { AppShell } from './recipes';
import './commerce-lab.css';
import {
  CodeSnippet, ConsentNotice, ContentHeader, CouponField, DesignSystemProvider, Inline, InlineSuggestion, InstructionSteps,
  PageHeader, ResponsiveGrid, SettingsGroup, SidebarHeader, Stack, Surface, Switch, Text, TextLink, ThemeToggle, Button, StruckPrice,
  type CouponFieldLabels, type CouponFieldState, type Theme,
} from 'beds';

const couponLabels = (note?: string): CouponFieldLabels => ({
  toggle: 'Tem um cupom?',
  field: 'Cupom de desconto',
  apply: 'Aplicar',
  remove: 'Remover',
  appliedTitle: code => `${code} aplicado:`,
  appliedDescription: '20% de desconto nesta compra.',
  keptTitle: code => `${code} guardado:`,
  keptDescription: 'conferimos o cupom no pagamento.',
  appliedNote: note,
});

/** One CouponField with its own synthetic lifecycle: BEMVINDO applies, MINIMO asks for a bigger package, anything else fails. */
function CouponDemo({ initial, suggestion, note }: { initial: CouponFieldState; suggestion?: boolean; note?: string }) {
  const [state, setState] = useState<CouponFieldState>(initial);
  const [showSuggestion, setShowSuggestion] = useState(Boolean(suggestion));
  const apply = (raw: string) => {
    const code = raw.toUpperCase();
    setShowSuggestion(false);
    setState({ phase: 'open', code, busy: true });
    window.setTimeout(() => {
      if (code === 'BEMVINDO') setState({ phase: 'applied', code });
      else if (code === 'MINIMO') { setState({ phase: 'open', code }); setShowSuggestion(true); }
      else setState({ phase: 'open', code, error: code ? 'Este cupom não existe ou já expirou.' : 'Digite um cupom.' });
    }, 700);
  };
  return <CouponField
    state={state}
    labels={couponLabels(note)}
    onOpen={() => setState({ phase: 'open' })}
    onApply={apply}
    onRemove={() => setState({ phase: 'closed' })}
    suggestion={showSuggestion ? { text: 'O MINIMO vale a partir de 20 créditos.', action: { label: 'Mudar para 20 créditos por R$ 40,00', onClick: () => setState({ phase: 'applied', code: 'MINIMO' }) } } : undefined}
  />;
}

/** Synthetic catalog fixture: discount code phases, inline suggestion, consent notice, privacy setting and setup steps. */
export default function CommercePage() {
  const params = new URLSearchParams(location.search);
  const [theme, setTheme] = useState<Theme>(params.get('theme') === 'dark' ? 'dark' : 'light');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [usage, setUsage] = useState(true);
  const [inlineNotice, setInlineNotice] = useState(true);
  const [floatingNotice, setFloatingNotice] = useState(false);
  const [status, setStatus] = useState('');

  return <DesignSystemProvider theme={theme} onThemeChange={setTheme} brandColor="#d0f300">
    <AppShell collapsed={collapsed} onCollapsedChange={setCollapsed} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} contentWidth="home" sidebar={<SidebarHeader><Text>Catálogo</Text></SidebarHeader>}>
    <ContentHeader actions={<ThemeToggle label="Aparência" lightLabel="Claro" darkLabel="Escuro" />}>
      <Inline><TextLink href={`?view=components&theme=${theme}`}>Componentes</TextLink><Text>Compra e conexão</Text></Inline>
    </ContentHeader>
    <Stack gap="section">
      <PageHeader title="Compra e conexão" description="Cupom de desconto, sugestão em linha, aviso de consentimento e passos de configuração." />

      <Stack gap="tight">
        <Text variant="label">Cupom de desconto</Text>
        <Text variant="caption" tone="secondary">Experimente BEMVINDO (aplica), MINIMO (pede um pacote maior) ou qualquer outro código (erro).</Text>
        <ResponsiveGrid>
          <Surface role="panel"><CouponDemo initial={{ phase: 'closed' }} /></Surface>
          <Surface role="panel"><CouponDemo initial={{ phase: 'open', code: 'VERAO', error: 'Este cupom não existe ou já expirou.' }} /></Surface>
          <Surface role="panel"><CouponDemo initial={{ phase: 'open', code: 'MINIMO' }} suggestion /></Surface>
          <Surface role="panel"><CouponDemo initial={{ phase: 'applied', code: 'BEMVINDO' }} note="Não soma com outras ofertas." /></Surface>
          <Surface role="panel"><CouponDemo initial={{ phase: 'kept', code: 'BEMVINDO' }} /></Surface>
        </ResponsiveGrid>
      </Stack>

      <Stack gap="tight">
        <Text variant="label">Preço de tabela riscado</Text>
        <Surface role="panel">
          <p className="lab-total-row"><span>Total</span><strong><StruckPrice label="R$ 59,00" accessibleLabel="Preço de tabela R$ 59,00." />R$ 29,50</strong></p>
        </Surface>
        <Text variant="caption" tone="secondary">Aparece só depois que o servidor aceita o cupom; a linha do cupom diz o desconto.</Text>
      </Stack>

      <Stack gap="tight">
        <Text variant="label">Sugestão em linha</Text>
        <Surface role="panel">
          <InlineSuggestion text="Pelo mesmo preço, você leva 30 créditos." action={{ label: 'Mudar para 30 créditos', onClick: () => setStatus('Pacote trocado nesta prévia.') }} />
        </Surface>
        <Text variant="caption" tone="secondary"><span role="status">{status}</span></Text>
      </Stack>

      <Stack gap="tight">
        <Text variant="label">Aviso de consentimento</Text>
        <ConsentNotice
          open={inlineNotice}
          placement="inline"
          message="Usamos dados de uso anônimos para melhorar o app. Você pode desativar quando quiser nas configurações."
          declineLabel="Desativar"
          acceptLabel="Entendi"
          onDecline={() => { setUsage(false); setInlineNotice(false); }}
          onAccept={() => setInlineNotice(false)}
        />
        <Inline>
          <Button label={floatingNotice ? 'Ocultar aviso flutuante' : 'Mostrar aviso flutuante'} compact onClick={() => setFloatingNotice(value => !value)} />
          {!inlineNotice && <Button label="Mostrar aviso em linha" variant="ghost" compact onClick={() => setInlineNotice(true)} />}
        </Inline>
        <ConsentNotice
          open={floatingNotice}
          message="Usamos dados de uso anônimos para melhorar o app. Você pode desativar quando quiser nas configurações."
          declineLabel="Desativar"
          acceptLabel="Entendi"
          onDecline={() => { setUsage(false); setFloatingNotice(false); }}
          onAccept={() => setFloatingNotice(false)}
        />
      </Stack>

      <SettingsGroup variant="section" title="Privacidade" description="Escolha o que o app pode registrar.">
        <Switch label="Dados de uso" description="Registros anônimos de navegação que ajudam a melhorar o app. Nenhum dado pessoal é enviado." checked={usage} onChange={setUsage} />
      </SettingsGroup>

      <Stack gap="tight">
        <Text variant="section-title">Conectar um agente</Text>
        <Surface role="panel">
          <InstructionSteps
            steps={[
              { id: 'open', text: 'Abra as configurações de conectores do seu agente.' },
              { id: 'paste', text: 'Adicione um conector personalizado e cole este endereço:', content: <CodeSnippet variant="pill" hideLabel label="Endereço do conector" value="https://exemplo.app/mcp" /> },
              { id: 'authorize', text: 'Entre com sua conta e autorize o acesso.' },
            ]}
            note="O agente só vê o que você autorizar. Você pode desconectar quando quiser."
          />
        </Surface>
        <Surface role="panel">
          <CodeSnippet variant="pill" label="Endereço com rótulo visível" value="https://exemplo.app/mcp" />
        </Surface>
      </Stack>
    </Stack>
    </AppShell>
  </DesignSystemProvider>;
}
