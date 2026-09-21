// Test-only signal simulation, installed before Motion initializes. Native mode
// leaves matchMedia untouched. This does not emulate CSS media queries or OS settings.
const mode = new URLSearchParams(location.search).get('motion');
if (mode === 'reduce' || mode === 'standard') {
  const nativeMatchMedia = window.matchMedia.bind(window);
  const queries = new Map<string, MediaQueryList>();
  window.matchMedia = query => {
    if (!['(prefers-reduced-motion)', '(prefers-reduced-motion: reduce)'].includes(query)) return nativeMatchMedia(query);
    if (!queries.has(query)) {
      const native = nativeMatchMedia(query);
      queries.set(query, new Proxy(native, {
        get(target, key) {
          if (key === 'matches') return mode === 'reduce';
          const value = Reflect.get(target, key, target);
          return typeof value === 'function' ? value.bind(target) : value;
        },
      }));
    }
    return queries.get(query)!;
  };
}
await import('./control-directions');
export {};
