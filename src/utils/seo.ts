export function setPageTitle(title: string) {
  try { document.title = title; } catch {}
}