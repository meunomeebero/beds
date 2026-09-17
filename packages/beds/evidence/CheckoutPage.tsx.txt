import { useEffect, useRef, useState } from 'react';
import { BrandMark, Button, CheckoutLayout, CheckoutSection, CodeSnippet, DesignSystemProvider, Dialog, Inline, Notice, OrderSummary, PaymentConfirmation, RadioGroup, SettingsForm, Stack, Text, TextField, TextLink, ThemeToggle, brands } from 'beds';
import { checkoutCredits, checkoutExample, checkoutMoney, checkoutQuantityOptions, checkoutStorageKey, checkoutTotalCents, parseCheckoutQuantity, parseCheckoutReturn, readCheckoutRecord, validDemoCpf, type CheckoutMethod, type CheckoutRecord, type CheckoutState } from './checkout-fixtures';

type CheckoutDialog = 'terms' | 'privacy' | 'help' | 'restart' | null;

export default function CheckoutPage() {
  const [params] = useState(() => new URLSearchParams(location.search));
  const requestedQuantity = parseCheckoutQuantity(params.get('quantity'));
  const returnTo = parseCheckoutReturn(params.get('return'));
  const storageKey = checkoutStorageKey(returnTo);
  const [restored] = useState(() => {
    try { return readCheckoutRecord(sessionStorage.getItem(storageKey), requestedQuantity, Date.now()); }
    catch { return null; }
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(params.get('theme') === 'light' ? 'light' : 'dark');
  const [option, setOption] = useState(requestedQuantity !== null && [1, 10, 50].includes(requestedQuantity) ? String(requestedQuantity) : 'custom');
  const [custom, setCustom] = useState(params.get('quantity') ?? '1');
  const [method, setMethod] = useState<CheckoutMethod>(restored?.method ?? 'pix');
  const [cpf, setCpf] = useState<string>(checkoutExample.cpf);
  const [record, setRecord] = useState<CheckoutRecord | null>(restored);
  const [state, setState] = useState<CheckoutState>(restored?.state ?? 'form');
  const [busy, setBusy] = useState(false);
  const [cpfError, setCpfError] = useState<string>();
  const [quantityError, setQuantityError] = useState<string>(requestedQuantity === null ? 'Escolha uma quantidade inteira de 1 a 100 créditos.' : '');
  const [createError, setCreateError] = useState(false);
  const [dialog, setDialog] = useState<CheckoutDialog>(null);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const [failureScheduled, setFailureScheduled] = useState(params.get('preview') === 'create-error');
  const createFailureArmed = useRef(params.get('preview') === 'create-error');
  const creationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submitting = useRef(false);
  const needsFocus = useRef(false);
  const customInput = useRef<HTMLInputElement>(null);
  const cpfInput = useRef<HTMLInputElement>(null);
  const main = useRef<HTMLElement>(null);
  const quantity = option === 'custom' ? parseCheckoutQuantity(custom) : parseCheckoutQuantity(option);
  const activeQuantity = record?.quantity ?? quantity;
  const total = activeQuantity === null ? null : checkoutTotalCents(activeQuantity);
  const price = total === null ? '—' : checkoutMoney(total);
  const pending = state === 'pending' || state === 'slow' || state === 'status-error';
  const destination = returnTo === 'components' ? 'components' : `${returnTo}-result`;
  const returnLabel = returnTo === 'components' ? 'Voltar aos componentes' : `Voltar ao resultado da ${returnTo === 'analysis' ? 'análise' : 'otimização'}`;
  const returnHref = `?view=${destination}&theme=${theme}`;

  useEffect(() => {
    document.documentElement.lang = 'pt-BR';
    document.title = 'Checkout · Playground Curriculol';
    return () => { if (creationTimer.current) clearTimeout(creationTimer.current); };
  }, []);

  useEffect(() => {
    if (!needsFocus.current || dialog !== null) return;
    needsFocus.current = false;
    main.current?.focus({ preventScroll: true });
    main.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [state, dialog]);

  function persist(next: CheckoutRecord | null) {
    setRecord(next);
    try {
      if (next) sessionStorage.setItem(storageKey, JSON.stringify(next));
      else sessionStorage.removeItem(storageKey);
      setStorageUnavailable(false);
    } catch { setStorageUnavailable(true); }
  }

  function transition(nextState: CheckoutRecord['state']) {
    if (!record) return;
    needsFocus.current = true;
    persist({ ...record, state: nextState });
    setState(nextState);
  }

  function updateQuantity(nextOption: string, nextCustom = custom) {
    setOption(nextOption);
    setCustom(nextCustom);
    setQuantityError('');
    setCreateError(false);
    const next = parseCheckoutQuantity(nextOption === 'custom' ? nextCustom : nextOption);
    const url = new URL(location.href);
    url.searchParams.set('quantity', next === null ? nextCustom : String(next));
    history.replaceState(null, '', url);
  }

  function submit() {
    if (submitting.current || state !== 'form') return;
    if (quantity === null) {
      setQuantityError('Escolha uma quantidade inteira de 1 a 100 créditos.');
      customInput.current?.focus();
      return;
    }
    if (method === 'pix' && !validDemoCpf(cpf)) {
      setCpfError('Use 111.222.333-44 para testar: são 11 dígitos de demonstração, sem repetição.');
      cpfInput.current?.focus();
      return;
    }
    submitting.current = true;
    setBusy(true);
    setCreateError(false);
    creationTimer.current = setTimeout(() => {
      creationTimer.current = null;
      submitting.current = false;
      setBusy(false);
      if (createFailureArmed.current) {
        createFailureArmed.current = false;
        setFailureScheduled(false);
        setCreateError(true);
        return;
      }
      const createdAt = Date.now();
      persist({ version: 1, quantity, method, state: 'pending', order: `DEMO-${createdAt.toString(36)}`, createdAt });
      needsFocus.current = true;
      setState('pending');
    }, 350);
  }

  function reset() {
    needsFocus.current = true;
    persist(null);
    setState('form');
    setCreateError(false);
    setCpfError(undefined);
    setDialog(null);
  }

  const summary = state === 'confirmed' ? undefined : <OrderSummary title="Resumo da compra" items={[
    { id: 'credits', label: 'Quantidade', value: activeQuantity === null ? 'Ainda não definida' : checkoutCredits(activeQuantity) },
    { id: 'unit', label: 'Média por crédito (aprox.)', value: total === null || activeQuantity === null ? '—' : checkoutMoney(Math.round(total / activeQuantity)) },
  ]} total={{ label: 'Total da compra', value: price }} terms={checkoutExample.terms} benefits={state === 'form' ? checkoutExample.benefits : undefined} note="Prévia de compra. Nenhum valor será cobrado." />;

  const demoControls = <CheckoutSection title="Controles da demonstração" description="Ferramentas de validação do playground, fora do fluxo de pagamento real.">
    <Button variant="ghost" label={controlsOpen ? 'Ocultar controles de demonstração' : 'Mostrar controles de demonstração'} aria-expanded={controlsOpen} onClick={() => setControlsOpen(open => !open)} />
    {controlsOpen && <Stack>{state === 'form' ? <><Text variant="body-small" tone="secondary">A simulação começa apenas pelo botão de pagamento. O endereço não confirma uma compra.</Text><Button label="Simular falha na próxima tentativa" onClick={() => { createFailureArmed.current = true; setFailureScheduled(true); setCreateError(false); }} disabled={busy} />{failureScheduled && <Notice title="Falha de demonstração preparada" description="A próxima tentativa exibirá uma falha recuperável, sem gerar pedido." />}</> : pending ? <Inline gap="tight"><Button label="Simular espera prolongada" onClick={() => transition('slow')} /><Button label="Simular falha na consulta" onClick={() => transition('status-error')} /><Button label="Simular pagamento encerrado" onClick={() => transition('closed')} /><Button label="Simular confirmação do pagamento" onClick={() => transition('confirmed')} /></Inline> : <Button label="Reiniciar demonstração" onClick={reset} />}</Stack>}
  </CheckoutSection>;

  return <DesignSystemProvider theme={theme} onThemeChange={next => { setTheme(next); const url = new URL(location.href); url.searchParams.set('theme', next); history.replaceState(null, '', url); }} brandColor={brands.curriculol}>
    <CheckoutLayout ref={main} title={state === 'confirmed' ? 'Compra de demonstração concluída.' : 'Prepare sua próxima candidatura.'} description={state === 'confirmed' ? 'Veja a confirmação e continue de onde parou. Nenhum crédito real foi adicionado.' : 'Transforme os ajustes da análise em um currículo e uma carta para a vaga.'} mark={<BrandMark label="Curriculol" />} back={{ label: returnLabel, href: returnHref }} utilities={<ThemeToggle label="Aparência do checkout" lightLabel="Claro" darkLabel="Escuro" />} summary={summary} footer={<Stack><Stack gap="tight"><Text variant="caption" tone="secondary">Curriculol é um produto da BEROLAB LTDA · CNPJ 61.026.871/0001-79.</Text><Inline gap="tight"><Button variant="ghost" label="Termos" onClick={() => setDialog('terms')} /><Button variant="ghost" label="Privacidade" onClick={() => setDialog('privacy')} /><Button variant="ghost" label="Ajuda com o pagamento" onClick={() => setDialog('help')} /></Inline><Text variant="caption" tone="secondary">Playground: pagamento, confirmação e recibo são demonstrativos. Não informe dados reais.</Text></Stack>{demoControls}</Stack>}>
      <Stack>
        {state === 'form' && <SettingsForm label="Finalizar compra de demonstração" onSubmit={submit}>
          <CheckoutSection title="Escolha seus créditos" description="A quantidade muda; os recursos continuam os mesmos.">
            <RadioGroup label="Quantidade de créditos" name="checkout-quantity" value={option} options={checkoutQuantityOptions} onChange={value => updateQuantity(value)} disabled={busy} />
            {option === 'custom' && <TextField ref={customInput} label="Quantidade de créditos personalizada" value={custom} onChange={value => updateQuantity('custom', value)} description="Escolha um número inteiro de 1 a 100." inputMode="numeric" autoComplete="off" disabled={busy} error={quantityError || undefined} />}
          </CheckoutSection>
          <CheckoutSection title="Forma de pagamento" description="Confira o total antes de continuar.">
            <RadioGroup label="Forma de pagamento" name="checkout-method" value={method} options={[{ id: 'pix', label: 'Pix' }, { id: 'card', label: 'Cartão de crédito' }]} onChange={value => { setMethod(value === 'card' ? 'card' : 'pix'); setCpfError(undefined); setCreateError(false); }} disabled={busy} />
            {method === 'pix' ? <TextField ref={cpfInput} label="CPF de demonstração" value={cpf} onChange={value => { setCpf(value); setCpfError(undefined); setCreateError(false); }} description="Use o exemplo 111.222.333-44. Não informe seu documento real; este campo não é salvo." error={cpfError} inputMode="numeric" autoComplete="off" disabled={busy} /> : <Text tone="secondary">No aplicativo, os dados do cartão são preenchidos no Asaas, em outra aba. Aqui a simulação permanece nesta página, sem solicitar dados.</Text>}
            {createError && <Notice tone="error" title="O pagamento de demonstração não foi gerado" description="A tentativa falhou. Confira a forma escolhida e tente novamente; nenhum valor foi cobrado e sua seleção foi mantida." />}
            <Button purpose="welcome" type="submit" variant="primary" busy={busy} label={busy ? method === 'pix' ? 'Gerando Pix de demonstração…' : 'Preparando pagamento de demonstração…' : method === 'pix' ? `Gerar Pix${total === null ? '' : ` de ${price}`}` : `Continuar com cartão${total === null ? '' : ` — ${price}`}`} />
            <Text variant="body-small" tone="secondary">Demonstração sem cobrança. Os créditos só seriam liberados após a confirmação do pagamento pelo serviço.</Text>
          </CheckoutSection>
        </SettingsForm>}

        {pending && <CheckoutSection title={method === 'pix' ? 'Seu Pix de demonstração está pronto.' : 'Continue com cartão · demonstração'} description={method === 'pix' ? 'No aplicativo, você pagaria no app do banco. O código abaixo é ilustrativo e não pode ser pago.' : 'O checkout real abriria em outra aba. Nenhuma página de pagamento será aberta nesta prévia.'}>
          {method === 'pix' ? <CodeSnippet label="Código ilustrativo — não pagável" value={checkoutExample.code} messages={{ copy: 'Copiar exemplo', copying: 'Copiando exemplo…', copied: 'Exemplo copiado', copyLabel: () => 'Copiar código ilustrativo', success: 'Código ilustrativo copiado. Não use no banco.', error: 'Não foi possível copiar. Selecione o código ilustrativo e copie manualmente.' }} /> : <Notice title="Seus dados não entram nesta página" description="O formulário de cartão pertence ao provedor no aplicativo real. Esta prévia não coleta número, validade, CVV ou CPF." />}
          <Text variant="body-small" tone="secondary">Referência do recebedor no aplicativo: {checkoutExample.merchant} · {checkoutExample.merchantDocument}.</Text>
          <Notice tone={state === 'status-error' ? 'error' : 'info'} title={state === 'status-error' ? 'Confirmação indisponível no momento' : 'Aguardando confirmação do pagamento'} description={state === 'status-error' ? 'Não foi possível consultar o status nesta simulação. Se já pagou, não pague novamente. Consulte o mesmo pedido para tentar recuperar a confirmação.' : state === 'slow' ? 'Ainda não recebemos a confirmação. A espera não significa que o pagamento expirou. Confira no banco antes de gerar outro.' : 'O pedido só muda para confirmado quando você usa o controle explícito da demonstração. O tempo nesta tela não confirma a compra.'} />
          {(state === 'slow' || state === 'status-error') && <Button label="Consultar pagamento novamente" onClick={() => transition('pending')} />}
          <Inline><Button variant="ghost" label="Trocar forma de pagamento" onClick={() => setDialog('restart')} /></Inline>
          <Text variant="caption" tone="secondary">Pedido {record?.order}. A recarga desta página mantém apenas o pedido fictício; nenhum CPF é armazenado.</Text>
        </CheckoutSection>}

        {state === 'closed' && <CheckoutSection title="Este pagamento foi encerrado" description="O código ou link anterior não está mais ativo nesta simulação."><Notice tone="warning" title="Confira se houve débito antes de tentar novamente" description="No aplicativo real, consulte seu banco. Se o pagamento foi concluído, aguarde a confirmação; não pague outra vez." /><Button purpose="welcome" variant="primary" label="Voltar às formas de pagamento" onClick={reset} /></CheckoutSection>}

        {state === 'confirmed' && record && <Stack><PaymentConfirmation title="Pagamento confirmado · demonstração" description="Nenhuma cobrança aconteceu. Este recibo é ilustrativo e não tem validade fiscal." merchant="Curriculol · demonstração" mark={<BrandMark label="Curriculol" />} purchase={{ label: checkoutCredits(record.quantity), description: 'Compra única, sem assinatura' }} receipt={{ title: 'Recibo DEMO — sem validade fiscal', items: [{ id: 'order', label: 'Pedido fictício', value: record.order }, { id: 'method', label: 'Forma', value: method === 'pix' ? 'Pix · simulação' : 'Cartão · simulação' }, { id: 'quantity', label: 'Quantidade', value: checkoutCredits(record.quantity) }], total: { label: 'Total simulado', value: price }, note: 'Nenhum saldo real foi alterado. Este recibo não é uma nota fiscal.' }} animate={restored?.state !== 'confirmed'} /><TextLink href={returnHref}>{returnLabel}</TextLink></Stack>}

        {storageUnavailable && <Notice tone="warning" title="A prévia não pôde ser guardada nesta aba" description="Você pode continuar normalmente. Ao recarregar ou sair, o pedido fictício poderá ser perdido; nenhum dado foi enviado." />}

      </Stack>

    <Dialog open={dialog !== null} onOpenChange={open => { if (!open) setDialog(null); }} title={dialog === 'restart' ? 'Conferiu o pagamento anterior?' : dialog === 'terms' ? 'Termos · prévia de interface' : dialog === 'privacy' ? 'Privacidade · prévia de interface' : 'Ajuda com o pagamento'} description={dialog === 'restart' ? 'Se já houve débito, não inicie outro pagamento. Consulte seu banco e aguarde a confirmação.' : 'Este conteúdo explica a demonstração. Não substitui os textos legais nem o suporte do aplicativo.'} actions={dialog === 'restart' ? <><Button label="Continuar aguardando" onClick={() => setDialog(null)} /><Button label="Não paguei · escolher outra forma" onClick={reset} /></> : <Button label="Voltar ao checkout" onClick={() => setDialog(null)} />}>
      <Text>{dialog === 'privacy' ? 'O CPF digitado existe somente na memória desta página e não é salvo. Apenas o pedido fictício, a quantidade, o método e o estado da prévia podem permanecer nesta aba por até 24 horas. Não há envio a provedores.' : dialog === 'terms' ? 'Os valores exibidos seguem a tabela atual de créditos do Curriculol. Esta prévia não realiza venda, não gera saldo e não emite nota fiscal. A revisão dos textos legais finais pertence à integração do produto.' : dialog === 'restart' ? 'A troca descarta somente este pedido fictício e mantém a quantidade escolhida. No aplicativo real, o status deve ser conferido antes de criar outra cobrança.' : 'Se houver falha ao consultar um pagamento, mantenha o pedido e tente consultar novamente. Se já pagou, não pague uma segunda vez. Nesta prévia, use os controles da demonstração para validar cada estado.'}</Text>
    </Dialog>
    </CheckoutLayout>
  </DesignSystemProvider>;
}
