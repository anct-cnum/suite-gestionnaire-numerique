import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PrismaCollectivitesLoader } from './PrismaCollectivitesImpliquéesLoader'
import prisma from '../../../prisma/prismaClient'
import { creerDesMembresPourLesIndicateursDeGouvernance } from '../testHelper'

describe('collectivités impliquées loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('compte une seule fois chaque collectivité membre confirmée et non supprimée, hors candidats et services de l’État', async () => {
    // GIVEN
    await creerDesMembresPourLesIndicateursDeGouvernance()

    // WHEN
    const readModel = await new PrismaCollectivitesLoader().get()

    // THEN
    expect(readModel).toStrictEqual({
      // Commune (coporteuse dans l'une de ses deux gouvernances) et EPCI ;
      // le département candidat, la région supprimée et les préfectures sont exclus
      nombreCoporteurs: 1,
      nombreTotal: 2,
      ventilationParCategorie: [
        { categorie: 'Communes', count: 1 },
        { categorie: 'EPCI', count: 1 },
      ],
    })
  })
})
