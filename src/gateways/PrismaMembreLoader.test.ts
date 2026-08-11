import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PrismaMembreLoader } from './PrismaMembreLoader'
import { creerUnDepartement, creerUneGouvernance, creerUneRegion, creerUneStructure, creerUnMembre } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { epochTime } from '@/shared/testHelper'

describe('prisma membre loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  describe('chercher la structure de la préfecture d’un département', () => {
    it('quand le membre préfecture existe alors je récupère sa structure, même s’il est supprimé de la gouvernance', async () => {
      // GIVEN
      await creerUneRegion({ code: '32', nom: 'Hauts-de-France' })
      await creerUnDepartement({ code: '02', nom: 'Aisne', regionCode: '32' })
      await creerUneGouvernance({ departementCode: '02' })
      await creerUneStructure({ id: 163, nom: 'PREFECTURE DE DEPARTEMENT AISNE' })
      await creerUnMembre({
        dateSuppression: epochTime,
        gouvernanceDepartementCode: '02',
        id: 'prefecture-02',
        structureId: 163,
      })

      // WHEN
      const structureId = await new PrismaMembreLoader().structurePrefectureDuDepartement('02')

      // THEN
      expect(structureId).toBe(163)
    })

    it('quand le membre préfecture n’existe pas alors je récupère null', async () => {
      // WHEN
      const structureId = await new PrismaMembreLoader().structurePrefectureDuDepartement('02')

      // THEN
      expect(structureId).toBeNull()
    })
  })
})
