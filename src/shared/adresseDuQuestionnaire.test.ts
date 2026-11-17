import { describe, expect, it } from 'vitest'

import { adresseDuQuestionnaire } from './adresseDuQuestionnaire'

describe('adresse du questionnaire de mesure d’impact', () => {
  it.each([
    {
      adresse: 'https://inclusion-numerique.anct.gouv.fr/questionnaire/sicoval',
      hote: 'https://mon.inclusion-numerique.anct.gouv.fr/',
      intention: 'en production, sur le site vitrine et jamais sur MIN',
    },
    {
      adresse: 'https://mon-inclusion-numerique-preprod.osc-fr1.scalingo.io/questionnaire/sicoval',
      hote: 'https://mon-inclusion-numerique-preprod.osc-fr1.scalingo.io',
      intention: 'ailleurs, sur le même hôte : une réponse de test n’arrive jamais en production',
    },
    {
      adresse: 'http://localhost:3000/questionnaire/sicoval',
      hote: 'http://localhost:3000/',
      intention: 'en local',
    },
  ])('$intention', ({ adresse, hote }) => {
    // THEN
    expect(adresseDuQuestionnaire(hote, 'sicoval')).toBe(adresse)
  })
})
