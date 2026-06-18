import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PrismaStructureRepository } from './PrismaStructureRepository'
import { creerUneStructure } from './testHelper'
import prisma from '../../prisma/prismaClient'

describe('prisma structure repository', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  describe('modifier le nom d’affichage', () => {
    it('remplace la denomination_antenne par le nom saisi', async () => {
      // GIVEN
      await creerUneStructure({ denomination_antenne: 'ville de Villiers sur Marne', id: 978 })

      // WHEN
      await new PrismaStructureRepository().modifierNom({
        denominationAntenne: 'Paris Est Marne et Bois',
        structureId: 978,
      })

      // THEN
      const structure = await prisma.main_structure_administrative.findUnique({ where: { id: 978 } })
      expect(structure?.denomination_antenne).toBe('Paris Est Marne et Bois')
    })

    it('met la denomination_antenne à null pour retomber sur le nom SIRENE', async () => {
      // GIVEN
      await creerUneStructure({ denomination_antenne: 'ville de Villiers sur Marne', id: 978 })

      // WHEN
      await new PrismaStructureRepository().modifierNom({ denominationAntenne: null, structureId: 978 })

      // THEN
      const structure = await prisma.main_structure_administrative.findUnique({ where: { id: 978 } })
      expect(structure?.denomination_antenne).toBeNull()
    })
  })
})
