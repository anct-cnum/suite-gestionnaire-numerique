// Mocks globaux pour les tests
import { vi } from 'vitest'

// Mock de Chart.js
vi.mock('chart.js', () => ({
  ArcElement: {},
  BarElement: {},
  CategoryScale: {},
  Chart: {
    register: vi.fn(),
  },
  LinearScale: {},
  Tooltip: {},
}))

// Mock de react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Bar: vi.fn(() => 'Bar Chart Mock'),
  Doughnut: vi.fn(() => 'Doughnut Chart Mock'),
  Line: vi.fn(() => 'Line Chart Mock'),
}))

import 'vitest-dom/extend-expect'

// Mock de l'API Canvas pour jsdom
class MockCanvasRenderingContext2D {
  arc = vi.fn()
  beginPath = vi.fn()
  clearRect = vi.fn()
  clip = vi.fn()
  closePath = vi.fn()
  createImageData = vi.fn(() => ({ data: new Uint8ClampedArray(4) }))
  drawImage = vi.fn()
  fill = vi.fn()
  // Méthodes de base du contexte 2D
  fillRect = vi.fn()
  fillText = vi.fn()
  getImageData = vi.fn(() => ({ data: new Uint8ClampedArray(4) }))
  lineTo = vi.fn()
  measureText = vi.fn(() => ({ width: 0 }))
  moveTo = vi.fn()
  putImageData = vi.fn()
  rect = vi.fn()
  restore = vi.fn()
  rotate = vi.fn()
  save = vi.fn()
  scale = vi.fn()
  setTransform = vi.fn()
  stroke = vi.fn()
  transform = vi.fn()
  translate = vi.fn()
}

// Mock de HTMLCanvasElement
Object.defineProperty(global, 'HTMLCanvasElement', {
  value: class HTMLCanvasElement {
    getContext(contextId: string) {
      if (contextId === '2d') {
        return new MockCanvasRenderingContext2D()
      }
      if (contextId === 'webgl' || contextId === 'experimental-webgl') {
        // Mock basique pour WebGL
        return {
          attachShader: vi.fn(),
          bindBuffer: vi.fn(),
          bufferData: vi.fn(),
          clear: vi.fn(),
          clearColor: vi.fn(),
          compileShader: vi.fn(),
          createBuffer: vi.fn(),
          createProgram: vi.fn(),
          createShader: vi.fn(),
          drawArrays: vi.fn(),
          enableVertexAttribArray: vi.fn(),
          getAttribLocation: vi.fn(),
          getExtension: vi.fn(),
          getParameter: vi.fn(),
          linkProgram: vi.fn(),
          shaderSource: vi.fn(),
          useProgram: vi.fn(),
          vertexAttribPointer: vi.fn(),
          viewport: vi.fn(),
        }
      }
      return null
    }
  },
})

function toOpenInNewTab(element: HTMLElement, content: string): { message(): string; pass: boolean } {
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

// Mock de ResizeObserver pour les tests
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}))
