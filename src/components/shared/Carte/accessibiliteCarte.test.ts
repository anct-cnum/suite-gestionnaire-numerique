import { describe, expect, it } from 'vitest'

import { decrireCanevas, LOCALE_CARTE_FR, nomAccessibleCarteFragilite } from './accessibiliteCarte'

describe('accessibilité des cartes', () => {
  it('le canevas d’une carte est une image nommée, hors tabulation, sans zone ni nom anglais (RGAA 1.1)', () => {
    // GIVEN
    const canevas = document.createElement('canvas')
    canevas.setAttribute('role', 'region')
    canevas.setAttribute('aria-label', 'Map')
    canevas.setAttribute('tabindex', '0')
    canevas.setAttribute('aria-hidden', 'true')

    // WHEN
    decrireCanevas({ getCanvas: () => canevas }, "Carte de l'indice de fragilité numérique par commune, Loir-et-Cher")

    // THEN
    expect(canevas.getAttribute('role')).toBe('img')
    expect(canevas.getAttribute('aria-label')).toBe(
      "Carte de l'indice de fragilité numérique par commune, Loir-et-Cher"
    )
    expect(canevas.getAttribute('tabindex')).toBe('-1')
    expect(canevas.hasAttribute('aria-hidden')).toBe(false)
  })

  it.each([
    {
      intention: 'd’un département, par commune avec le nom du département',
      nom: "Carte de l'indice de fragilité numérique par commune, Loir-et-Cher",
      territoire: { code: '41', type: 'departement' } as const,
    },
    {
      intention: 'd’un EPCI, par commune avec le nom de l’EPCI',
      nom: "Carte de l'indice de fragilité numérique par commune, CA de Blois Agglopolys",
      territoire: { nom: 'CA de Blois Agglopolys', type: 'epci' } as const,
    },
    {
      intention: 'd’une région, par département avec le nom de la région',
      nom: "Carte de l'indice de fragilité numérique par département, Centre-Val de Loire",
      territoire: { nom: 'Centre-Val de Loire', type: 'region' } as const,
    },
    {
      intention: 'd’un département inconnu, avec son code',
      nom: "Carte de l'indice de fragilité numérique par commune, 999",
      territoire: { code: '999', type: 'departement' } as const,
    },
  ])('le nom de la carte de l’indice de fragilité $intention', ({ nom, territoire }) => {
    // WHEN
    const nomAccessible = nomAccessibleCarteFragilite(territoire)

    // THEN
    expect(nomAccessible).toBe(nom)
  })

  it('les textes de MapLibre sont traduits en français', () => {
    // THEN
    expect(LOCALE_CARTE_FR['NavigationControl.ZoomIn']).toBe('Zoomer')
    expect(LOCALE_CARTE_FR['NavigationControl.ZoomOut']).toBe('Dézoomer')
    expect(LOCALE_CARTE_FR['Map.Title']).toBe('Carte')
    expect(LOCALE_CARTE_FR['Popup.Close']).toBe('Fermer')
  })
})
