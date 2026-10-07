export type NavigableOption = { id: string; disabled?: boolean };

/** Move through enabled options while preserving the caller's option ordering. */
export function nextOption(options: readonly NavigableOption[], current: string | undefined, key: string) {
  const enabled = options.filter(option => !option.disabled);
  const index = enabled.findIndex(option => option.id === current);
  const next = key === 'Home' ? 0 : key === 'End' ? enabled.length - 1 : (index + (key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length;
  return enabled[next]?.id ?? null;
}
