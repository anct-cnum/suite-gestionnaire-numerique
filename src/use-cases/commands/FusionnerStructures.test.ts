import { beforeEach, describe, expect, it } from 'vitest'

import { Fusion, FusionnerStructures, StructureFusionRepository } from './FusionnerStructures'
import { ResultAsync } from '../CommandHandler'

describe('fusionner deux structures', () => {
  beforeEach(() => {
    spiedFusion = null
  })

  it('refuse de fusionner une structure avec elle-même, sans appeler le repository', async () => {
    // GIVEN
    const fusionner = new FusionnerStructures(new StructureFusionRepositorySpy())

    // WHEN
    const result = await fusionner.handle({
      idAbsorbee: 42,
      idSurvivante: 42,
      uidUtilisateur: 'admin-1',
    })

    // THEN
    expect(result).toBe('fusionImpossibleMemeStructure')
    expect(spiedFusion).toBeNull()
  })

  it('délègue au repository la fusion de deux structures distinctes', async () => {
    // GIVEN
    const fusionner = new FusionnerStructures(new StructureFusionRepositorySpy())

    // WHEN
    const result = await fusionner.handle({
      idAbsorbee: 7,
      idSurvivante: 3,
      uidUtilisateur: 'admin-1',
    })

    // THEN
    expect(result).toBe('OK')
    expect(spiedFusion).toStrictEqual({
      idAbsorbee: 7,
      idSurvivante: 3,
      parUtilisateur: 'admin-1',
    })
  })
})

let spiedFusion: Fusion | null

class StructureFusionRepositorySpy implements StructureFusionRepository {
  fusionner(fusion: Fusion): ResultAsync<never> {
    spiedFusion = fusion
    return Promise.resolve('OK')
  }
}
