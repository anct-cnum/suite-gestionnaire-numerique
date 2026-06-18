import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PrismaStructureRepository } from './PrismaStructureRepository'
import { creerUneStructure } from './testHelper'
import prisma from '../../prisma/prismaClient'

describe('prisma structure repository', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  describe('lire le nom d’une structure', () => {
    it('renvoie la denomination_antenne d’une structure existante', async () => {
      // GIVEN
      await creerUneStructure({ denomination_antenne: 'ville de Villiers sur Marne', id: 978 })

      // WHEN
      const nomActuel = await new PrismaStructureRepository().lireNomStructure(978)

      // THEN
      expect(nomActuel).toStrictEqual({ denominationAntenne: 'ville de Villiers sur Marne' })
    })

    it('renvoie null comme denomination_antenne pour une structure canonique', async () => {
      // GIVEN
      await creerUneStructure({ id: 978 })

      // WHEN
      const nomActuel = await new PrismaStructureRepository().lireNomStructure(978)

      // THEN
      expect(nomActuel).toStrictEqual({ denominationAntenne: null })
    })

    it('renvoie null quand la structure est introuvable', async () => {
      // WHEN
      const nomActuel = await new PrismaStructureRepository().lireNomStructure(424_242)

      // THEN
      expect(nomActuel).toBeNull()
    })
  })

  describe('modifier le nom d’affichage', () => {
    it('remplace la denomination_antenne par le nom saisi', async () => {
      // GIVEN
      await creerUneStructure({ denomination_antenne: 'ville de Villiers sur Marne', id: 978 })

      // WHEN
      const succes = await new PrismaStructureRepository().modifierNom({
        denominationAntenne: 'Paris Est Marne et Bois',
        structureId: 978,
      })

      // THEN
      expect(succes).toBe(true)
      const structure = await prisma.main_structure_administrative.findUnique({ where: { id: 978 } })
      expect(structure?.denomination_antenne).toBe('Paris Est Marne et Bois')
    })

    it('met la denomination_antenne à null pour retomber sur le nom SIRENE', async () => {
      // GIVEN
      await creerUneStructure({ denomination_antenne: 'ville de Villiers sur Marne', id: 978 })

      // WHEN
      const succes = await new PrismaStructureRepository().modifierNom({ denominationAntenne: null, structureId: 978 })

      // THEN
      expect(succes).toBe(true)
      const structure = await prisma.main_structure_administrative.findUnique({ where: { id: 978 } })
      expect(structure?.denomination_antenne).toBeNull()
    })

    it('renvoie false quand le nom est déjà utilisé pour le même SIRET (contrainte d’unicité)', async () => {
      // GIVEN
      await creerUneStructure({ denomination_antenne: 'Antenne A', id: 1, siret: '12345678901234' })
      await creerUneStructure({ denomination_antenne: 'Antenne B', id: 2, siret: '12345678901234' })

      // WHEN
      const succes = await new PrismaStructureRepository().modifierNom({
        denominationAntenne: 'Antenne A',
        structureId: 2,
      })

      // THEN
      expect(succes).toBe(false)
    })
  })
})
