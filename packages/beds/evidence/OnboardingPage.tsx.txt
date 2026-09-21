import { useRef, useState } from 'react';
import { BrandMark, Button, DesignSystemProvider, Inline, Select, Text, TextField, ThemeToggle } from 'beds';
import { Onboarding } from './recipes';

export default function OnboardingPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => new URLSearchParams(location.search).get('theme') === 'dark' ? 'dark' : 'light');
  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [city, setCity] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | 'pending'>('success');
  const [feedback, setFeedback] = useState<{ message: string; tone: 'neutral' | 'success' | 'error' }>();
  const nameInput = useRef<HTMLInputElement>(null);

  function complete() {
    setBusy(false);
    setFeedback({ tone: 'success', message: 'Prévia confirmada. Nenhum dado foi enviado.' });
  }

  function submit() {
    if (!name.trim()) {
      setError('Informe seu nome para continuar.');
      setFeedback(undefined);
      nameInput.current?.focus();
      return;
    }
    setError('');
    if (result === 'error') {
      setFeedback({ tone: 'error', message: 'Falha simulada. Seus campos foram mantidos. Escolha “Sucesso” abaixo e tente novamente.' });
      return;
    }
    if (result === 'pending') {
      setBusy(true);
      setFeedback({ tone: 'neutral', message: 'Aguardando a simulação. Use “Concluir simulação” abaixo.' });
      return;
    }
    complete();
  }

  return <DesignSystemProvider theme={theme} onThemeChange={setTheme} brandColor={"#ffa133"}>
    <Onboarding title="Prepare seu espaço" description="Comece pelo básico. Você pode ajustar depois." brandMark={<BrandMark src="/demo-brand.svg" label="Curriculol" />} submitLabel="Continuar" onSubmit={submit} busy={busy} feedback={feedback}
      preview={{ name: name.trim() || 'Seu espaço', detail: headline.trim() || 'Seu próximo passo', sections: [{ id: 'career', label: 'Sua carreira' }, { id: 'account', label: 'Sua conta' }, { id: 'recent', label: 'Recentes' }] }}
      footer={<Inline><Text variant="caption" tone="secondary">Demonstração local, sem cadastro.</Text><ThemeToggle label="Aparência" lightLabel="Claro" darkLabel="Escuro" /><Select label="Resultado simulado" value={result} options={[{ id: 'success', label: 'Sucesso' }, { id: 'error', label: 'Erro' }, { id: 'pending', label: 'Aguardando' }]} onChange={value => setResult(value === 'error' ? 'error' : value === 'pending' ? 'pending' : 'success')} />{busy && <Button label="Concluir simulação" onClick={complete} />}</Inline>}>
      <TextField ref={nameInput} label="Nome" name="name" autoComplete="name" placeholder="Luísa Costa" value={name} onChange={value => { setName(value); if (error) setError(''); if (feedback) setFeedback(undefined); }} error={error || undefined} />
      <TextField label="Título profissional (opcional)" name="headline" autoComplete="organization-title" placeholder="Product designer" value={headline} onChange={setHeadline} />
      <TextField label="Cidade (opcional)" name="city" autoComplete="address-level2" placeholder="São Paulo" value={city} onChange={setCity} />
      <TextField label="Portfólio ou site (opcional)" name="website" autoComplete="url" inputMode="url" spellCheck={false} placeholder="seusite.com" value={website} onChange={setWebsite} />
    </Onboarding>
  </DesignSystemProvider>;
}
