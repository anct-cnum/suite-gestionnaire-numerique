import { describe, expect, it } from 'vitest'

import { CampagnesDeLaStructureLoader, RecupererLesCampagnesDeLaStructure } from './RecupererLesCampagnesDeLaStructure'
import { Campagne } from '@/domain/mesure-impact/Campagne'
import { epochTime } from '@/shared/testHelper'

describe('récupérer les campagnes de mesure d’impact d’une structure', () => {
  it('donne les campagnes que la structure porte', async () => {
    // WHEN
    const campagnes = await new RecupererLesCampagnesDeLaStructure(loader).handle({ structureId: 42 })

    // THEN
    expect(campagnes).toStrictEqual([
      { identifiantPublic: 'sicoval', libelleTerritoire: 'Sicoval', nom: 'Campagne test' },
    ])
  })

  it('une personne sans structure n’en a aucune', async () => {
    // WHEN
    const campagnes = await new RecupererLesCampagnesDeLaStructure(loader).handle({})

    // THEN
    expect(campagnes).toStrictEqual([])
  })
})

const loader: CampagnesDeLaStructureLoader = {
  async deLaStructure(structureId: number): Promise<ReadonlyArray<Campagne>> {
    return Promise.resolve(
      structureId === 42
        ? [
            Campagne.create({
              fermeture: null,
              identifiantPublic: 'sicoval',
              libelleTerritoire: 'Sicoval',
              nom: 'Campagne test',
              ouverture: epochTime,
              questionnaireVersion: 'socle-v22',
              structureId: 42,
              uid: { value: 7 },
            }),
          ]
        : []
    )
  },
}
