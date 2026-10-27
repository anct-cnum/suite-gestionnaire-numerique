import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PrismaGouvernancesTerritorialesLoader } from './PrismaGouvernancesTerritorialesLoader'
import prisma from '../../../prisma/prismaClient'
import { creerDesMembresPourLesIndicateursDeGouvernance } from '../testHelper'

describe('gouvernances territoriales loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('une gouvernance dont le seul coporteur est la préfecture est sans coporteur ; les autres sont ventilées par catégorie de coporteur', async () => {
    // GIVEN
    await creerDesMembresPourLesIndicateursDeGouvernance()

    // WHEN
    const readModel = await new PrismaGouvernancesTerritorialesLoader().get()

    // THEN
    expect(readModel).toStrictEqual({
      // 13 : préfecture seule ; 69 : association (la région supprimée et le département candidat ne comptent pas) ;
      // 75 : commune
      nombreSansCoporteur: 1,
      nombreTotal: 3,
      ventilationParTypeDeCoporteur: [
        { count: 1, type: 'Associations et fondations' },
        { count: 1, type: 'Communes' },
      ],
    })
  })
})
