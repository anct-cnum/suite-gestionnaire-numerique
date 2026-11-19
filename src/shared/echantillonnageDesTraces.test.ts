import { describe, expect, it } from 'vitest'

import { tauxDeTraces } from './echantillonnageDesTraces'

describe('échantillonnage des traces de performance Sentry', () => {
  it.each([
    { intention: 'le questionnaire de mesure d’impact', nom: '/questionnaire/sicoval', taux: 0 },
    { intention: 'la route paramétrée du questionnaire', nom: '/questionnaire/[identifiantPublic]', taux: 0 },
    { intention: 'une page de MIN', nom: '/tableau-de-bord', taux: 1 },
    { intention: 'une page de la vitrine', nom: '/vitrine/lieux', taux: 1 },
  ])('$intention : taux $taux', ({ nom, taux }) => {
    // WHEN
    const resultat = tauxDeTraces(nom)

    // THEN
    expect(resultat).toBe(taux)
  })
})
