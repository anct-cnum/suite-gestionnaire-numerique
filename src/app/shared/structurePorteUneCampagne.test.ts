import { describe, expect, it } from 'vitest'

import { structureDeLaMesureDImpact } from './structurePorteUneCampagne'

describe('structure retenue pour la mesure d’impact', () => {
  it.each([
    {
      attendu: 42,
      intention: 'une personne bêta-testeuse agit pour sa structure',
      isBetaTesteur: true,
      structureId: 42,
    },
    {
      attendu: undefined,
      intention: 'pendant le pilote, une personne qui n’est pas bêta-testeuse n’agit pour aucune structure',
      isBetaTesteur: false,
      structureId: 42,
    },
    {
      attendu: undefined,
      intention: 'une personne sans structure n’agit pour aucune structure',
      isBetaTesteur: true,
      structureId: null,
    },
  ])('$intention', ({ attendu, isBetaTesteur, structureId }) => {
    // WHEN
    const structure = structureDeLaMesureDImpact({ isBetaTesteur, structureId })

    // THEN
    expect(structure).toBe(attendu)
  })
})
