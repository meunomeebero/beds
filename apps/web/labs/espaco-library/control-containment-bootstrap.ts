// Same explicit test-only JS signal as the direction fixture; no OS/CSS emulation.
const mode = new URLSearchParams(location.search).get('motion');
if (mode === 'reduce' || mode === 'standard') {
  const nativeMatchMedia = window.matchMedia.bind(window);
  window.matchMedia = query => {
    const native = nativeMatchMedia(query);
    if (!['(prefers-reduced-motion)', '(prefers-reduced-motion: reduce)'].includes(query)) return native;
    return new Proxy(native, {
      get(target, key) {
        if (key === 'matches') return mode === 'reduce';
        const value = Reflect.get(target, key, target);
        return typeof value === 'function' ? value.bind(target) : value;
      },
    });
  };
}
await import('./ControlContainmentExamples');
export {};
