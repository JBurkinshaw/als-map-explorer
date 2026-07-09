/** Escape a string for safe insertion into HTML (used in marker popups). */
export function escapeHtml(value: string): string {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}
