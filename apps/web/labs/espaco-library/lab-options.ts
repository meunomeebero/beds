/** Lab-only URL options shared by every page that mounts the provider. */
export function fieldBorderFromUrl(): 'default' | 'soft' {
  return new URLSearchParams(window.location.search).get('fieldBorder') === 'soft' ? 'soft' : 'default';
}
