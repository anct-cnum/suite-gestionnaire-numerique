export function matchWithoutMarkup(wording: string) {
  return function(_: string, element: Element | null): boolean {
    return element?.textContent === wording
  }
}
