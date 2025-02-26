import 'vitest-dom/extend-expect'

function toOpenInNewTab(element: HTMLElement, content: string): { pass: boolean; message(): string } {
  if (
    element.title === `${content} - nouvelle fenêtre` &&
    element.getAttribute('target') === '_blank' &&
    element.getAttribute('rel') === 'noopener external noreferrer'
  ) {
    return {
      message: (): string => 'Tout est ok',
      pass: true,
    }
  }

  return {
    message: (): string => 'Il manque soit le target, soit le rel ou soit le title',
    pass: false,
  }
}

expect.extend({
  toOpenInNewTab,
})

// Cela permet d'éviter la notification "Not implemented: HTMLCanvasElement.prototype.getContext"
vi.mock('react-chartjs-2', () => ({ Bar: (): null => null, Doughnut: (): null => null }))
