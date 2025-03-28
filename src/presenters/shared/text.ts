export function formatPluriel(count: number): '' | 's' {
  return count > 1 ? 's' : ''
}
