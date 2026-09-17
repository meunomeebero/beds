/** Synthetic checkout data. No provider identifiers, credentials or payment payloads. */
export type CheckoutMethod = 'pix' | 'card';
export type CheckoutState = 'form' | 'pending' | 'slow' | 'status-error' | 'closed' | 'confirmed';
export type CheckoutReturn = 'analysis' | 'optimization' | 'components';

export const checkoutExample = {
  cpf: '111.222.333-44',
  merchant: 'BEROLAB LTDA',
  merchantDocument: 'CNPJ 61.026.871/0001-79',
  terms: 'Compra única, sem assinatura. Seus créditos não expiram.',
  code: 'DEMONSTRACAO-CURRICULOL-NAO-PAGAVEL-NAO-USAR-NO-BANCO',
  benefits: ['1 crédito gera um currículo adaptado + carta para uma vaga.', 'A análise continua gratuita. Você paga para gerar as melhorias.'],
} as const;

export function parseCheckoutQuantity(value: string | null): number | null {
  if (value === null) return 1;
  if (!/^\d+$/.test(value)) return null;
  const quantity = Number(value);
  return Number.isInteger(quantity) && quantity >= 1 && quantity <= 100 ? quantity : null;
}

/** Exact HALF-UP cents, matching the product's piecewise total-price curve. */
export function checkoutTotalCents(quantity: number): number {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) throw new RangeError('Quantity must be an integer from 1 to 100.');
  if (quantity <= 10) return Math.floor((2 * (590 * 9 + (quantity - 1) * 2200) + 9) / 18);
  if (quantity <= 50) return 2790 + (quantity - 10) * 70;
  return 5590 + (quantity - 50) * 48;
}

export function checkoutMoney(cents: number): string {
  return `R$\u00a0${(cents / 100).toFixed(2).replace('.', ',')}`;
}

export function checkoutCredits(quantity: number): string {
  return `${quantity} ${quantity === 1 ? 'crédito' : 'créditos'}`;
}

export const checkoutQuantityOptions = [1, 10, 50].map(quantity => ({
  id: String(quantity), label: `${checkoutCredits(quantity)} — ${checkoutMoney(checkoutTotalCents(quantity))}`,
})).concat({ id: 'custom', label: 'Outra quantidade' });

export function parseCheckoutReturn(value: string | null): CheckoutReturn {
  return value === 'analysis' || value === 'optimization' ? value : 'components';
}

export function validDemoCpf(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length === 11 && !/^(\d)\1{10}$/.test(digits);
}

export type CheckoutRecord = {
  version: 1;
  quantity: number;
  method: CheckoutMethod;
  state: Exclude<CheckoutState, 'form'>;
  order: string;
  createdAt: number;
};

const MAX_DEMO_AGE_MS = 24 * 60 * 60 * 1000;
const recordStates = ['pending', 'slow', 'status-error', 'closed', 'confirmed'];

export function checkoutStorageKey(destination: CheckoutReturn): string {
  return `beds:checkout-demo:v1:${destination}`;
}

export function readCheckoutRecord(raw: string | null, quantity: number | null, now: number): CheckoutRecord | null {
  if (!raw || quantity === null) return null;
  try {
    const record: unknown = JSON.parse(raw);
    if (!record || typeof record !== 'object') return null;
    const value = record as Record<string, unknown>;
    const valid = value.version === 1 && value.quantity === quantity
      && (value.method === 'pix' || value.method === 'card')
      && typeof value.state === 'string' && recordStates.includes(value.state)
      && typeof value.order === 'string' && /^DEMO-[a-z0-9-]{1,48}$/i.test(value.order)
      && typeof value.createdAt === 'number' && Number.isFinite(value.createdAt)
      && value.createdAt <= now && now - value.createdAt < MAX_DEMO_AGE_MS;
    if (!valid) return null;
    return { version: 1, quantity, method: value.method as CheckoutMethod, state: value.state as CheckoutRecord['state'], order: value.order as string, createdAt: value.createdAt as number };
  } catch {
    return null;
  }
}
