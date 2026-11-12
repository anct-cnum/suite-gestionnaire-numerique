import { describe, expect, it } from 'vitest'

import { LOCALE_CARTE_FR, rendreCanevasMuet } from './accessibiliteCarte'

describe('accessibilité des cartes', () => {
  it('le canevas d’une carte est rendu muet : hors tabulation, masqué aux aides techniques, sans zone ni nom anglais', () => {
    // GIVEN
    const canevas = document.createElement('canvas')
    canevas.setAttribute('role', 'region')
    canevas.setAttribute('aria-label', 'Map')
    canevas.setAttribute('tabindex', '0')

    // WHEN
    rendreCanevasMuet({ getCanvas: () => canevas })

    // THEN
    expect(canevas.hasAttribute('role')).toBe(false)
    expect(canevas.hasAttribute('aria-label')).toBe(false)
    expect(canevas.getAttribute('tabindex')).toBe('-1')
    expect(canevas.getAttribute('aria-hidden')).toBe('true')
  })

  it('les textes de MapLibre sont traduits en français', () => {
    // THEN
    expect(LOCALE_CARTE_FR['NavigationControl.ZoomIn']).toBe('Zoomer')
    expect(LOCALE_CARTE_FR['NavigationControl.ZoomOut']).toBe('Dézoomer')
    expect(LOCALE_CARTE_FR['Map.Title']).toBe('Carte')
    expect(LOCALE_CARTE_FR['Popup.Close']).toBe('Fermer')
  })
})
