import 'vitest-dom/extend-expect'

function toOpenInNewTab(
  element: HTMLElement,
  content: string
): { message: () => string; pass: boolean } {
  if (
    element.title === `${content} - nouvelle fenêtre` &&
    element.getAttribute('target') === '_blank' &&
    element.getAttribute('rel') === 'noopener external noreferrer'
  ) {
    return {
      message: (): string => 'Tout est ok',
      pass: true,
    }
  } else {
    return {
      message: (): string => 'Il manque soit le target, soit le rel ou soit le title',
      pass: false,
    }
  }
}

expect.extend({
  toOpenInNewTab,
})
