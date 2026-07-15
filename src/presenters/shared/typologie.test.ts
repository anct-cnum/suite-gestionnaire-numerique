import { describe, expect, it } from 'vitest'

import { libelleTypologie } from './typologie'

describe('libellé de typologie', () => {
  it.each([
    { $intention: 'code connu', attendu: 'Réseau France Services', code: 'RFS' },
    { $intention: 'code « Autre »', attendu: 'Autre', code: 'Autre' },
    { $intention: 'code inconnu', attendu: 'Non renseigné', code: 'ZZZ' },
    { $intention: 'chaîne vide', attendu: 'Non renseigné', code: '' },
    { $intention: 'null', attendu: 'Non renseigné', code: null },
    { $intention: 'undefined', attendu: 'Non renseigné', code: undefined },
  ])('traduit $intention en libellé lisible', ({ attendu, code }) => {
    // WHEN
    const libelle = libelleTypologie(code)

    // THEN
    expect(libelle).toBe(attendu)
  })
})
