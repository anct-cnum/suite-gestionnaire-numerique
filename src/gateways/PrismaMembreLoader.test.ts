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

  describe('chercher les départements d’une région', () => {
    it('je récupère les codes des départements de la région uniquement', async () => {
      // GIVEN
      await creerUneRegion({ code: '32', nom: 'Hauts-de-France' })
      await creerUneRegion({ code: '11', nom: 'Île-de-France' })
      await creerUnDepartement({ code: '02', nom: 'Aisne', regionCode: '32' })
      await creerUnDepartement({ code: '59', nom: 'Nord', regionCode: '32' })
      await creerUnDepartement({ code: '75', nom: 'Paris', regionCode: '11' })

      // WHEN
      const departements = await new PrismaMembreLoader().getDepartementsByRegionCode('32')

      // THEN
      expect(departements).toStrictEqual(['02', '59'])
    })

    it('quand la région n’a pas de département alors je récupère une liste vide', async () => {
      // WHEN
      const departements = await new PrismaMembreLoader().getDepartementsByRegionCode('93')

      // THEN
      expect(departements).toStrictEqual([])
    })
  })
})
