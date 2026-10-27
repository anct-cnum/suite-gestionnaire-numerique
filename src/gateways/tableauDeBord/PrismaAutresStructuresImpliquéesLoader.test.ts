import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PrismaAutresStructuresLoader } from './PrismaAutresStructuresImpliquéesLoader'
import prisma from '../../../prisma/prismaClient'
import { creerDesMembresPourLesIndicateursDeGouvernance } from '../testHelper'

describe('autres structures impliquées loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('compte les structures membres confirmées qui ne sont ni des collectivités ni des services de l’État', async () => {
    // GIVEN
    await creerDesMembresPourLesIndicateursDeGouvernance()

    // WHEN
    const readModel = await new PrismaAutresStructuresLoader().get()

    // THEN
    expect(readModel).toStrictEqual({
      nombreCoporteurs: 1,
      nombreTotal: 3,
      ventilationParCategorie: [
        { categorie: 'Associations et fondations', count: 1 },
        { categorie: 'Autres', count: 1 },
        { categorie: 'Entreprises et coopératives', count: 1 },
      ],
    })
  })
})
