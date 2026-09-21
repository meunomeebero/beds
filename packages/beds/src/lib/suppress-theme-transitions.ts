/** Freeze CSS transitions only inside this provider while new theme tokens settle.
 * Follows better-ui/animations.md (linked from docs/INTERFACE-QUALITY.md).
 * No global stylesheet, OS-theme listener or cancellation of Motion animations.
 */
export function suppressThemeTransitions(root: HTMLElement) {
  const view = root.ownerDocument.defaultView;
  if (!view) return () => {};
  root.setAttribute('data-theme-switching', '');
  // Commit the new token values with transitions disabled before the next paint.
  void root.offsetHeight;
  let frame = view.requestAnimationFrame(() => {
    frame = view.requestAnimationFrame(() => root.removeAttribute('data-theme-switching'));
  });
  return () => {
    view.cancelAnimationFrame(frame);
    root.removeAttribute('data-theme-switching');
  };
}
