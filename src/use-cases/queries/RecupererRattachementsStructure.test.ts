import { describe, expect, it } from 'vitest'

import {
  RattachementsStructureLoader,
  RattachementsStructureReadModel,
  RecupererRattachementsStructure,
} from './RecupererRattachementsStructure'

describe('récupérer les rattachements d’une structure', () => {
  it('délègue le comptage au loader pour la structure demandée', async () => {
    // GIVEN
    const readModel: RattachementsStructureReadModel = {
      affectations: 0,
      contacts: 0,
      contrats: 0,
      membres: 0,
      postes: 0,
      utilisateurs: 0,
    }
    const compter = vi
      .fn<(structureId: number) => Promise<RattachementsStructureReadModel>>()
      .mockResolvedValue(readModel)
    const loader: RattachementsStructureLoader = { compter }

    // WHEN
    const result = await new RecupererRattachementsStructure(loader).handle({ structureId: 978 })

    // THEN
    expect(compter).toHaveBeenCalledWith(978)
    expect(result).toBe(readModel)
  })
})
