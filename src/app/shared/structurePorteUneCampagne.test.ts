import { describe, expect, it } from 'vitest'

import { structureDeLaMesureDImpact } from './structurePorteUneCampagne'

describe('structure retenue pour la mesure d’impact', () => {
  it.each([
    {
      attendu: 42,
      intention: 'une personne agit pour sa structure',
      structureId: 42,
    },
    {
      attendu: undefined,
      intention: 'une personne sans structure n’agit pour aucune structure',
      structureId: null,
    },
  ])('$intention', ({ attendu, structureId }) => {
    // WHEN
    const structure = structureDeLaMesureDImpact({ structureId })

    // THEN
    expect(structure).toBe(attendu)
  })
})
