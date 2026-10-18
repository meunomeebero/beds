/** Lab-only URL options shared by every page that mounts the provider. `?fieldBorder=strong` previews the opt-in outline. */
export function fieldBorderFromUrl(): 'soft' | 'strong' {
  return new URLSearchParams(window.location.search).get('fieldBorder') === 'strong' ? 'strong' : 'soft';
}
