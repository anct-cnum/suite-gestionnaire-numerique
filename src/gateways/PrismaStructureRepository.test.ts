import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PrismaStructureRepository } from './PrismaStructureRepository'
import { creerUneStructure } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { AdresseARattacher } from '@/use-cases/commands/shared/StructureRepository'

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

  describe('rattacher une adresse', () => {
    it('crée une nouvelle adresse et re-pointe la structure dessus', async () => {
      // GIVEN
      await creerUneStructure({ id: 978 })

      // WHEN
      await new PrismaStructureRepository().rattacherAdresse(978, adresseARattacher())

      // THEN
      const structure = await prisma.main_structure_administrative.findUnique({
        include: { adresse: true },
        where: { id: 978 },
      })
      expect(structure?.adresse?.clef_interop).toBe('94017_aaaa')
      expect(structure?.adresse?.nom_commune).toBe('Champigny-sur-Marne')
    })

    it('réutilise une adresse existante de même clef_interop (pas de doublon)', async () => {
      // GIVEN
      await creerUneStructure({ id: 978 })
      await new PrismaStructureRepository().rattacherAdresse(978, adresseARattacher())
      const premiere = await prisma.main_structure_administrative.findUnique({ where: { id: 978 } })

      // WHEN
      await creerUneStructure({ id: 979, siret: '99999999999999' })
      await new PrismaStructureRepository().rattacherAdresse(979, adresseARattacher())
      const seconde = await prisma.main_structure_administrative.findUnique({ where: { id: 979 } })

      // THEN
      expect(seconde?.adresse_id).toBe(premiere?.adresse_id)
      await expect(prisma.adresse.count({ where: { clef_interop: '94017_aaaa' } })).resolves.toBe(1)
    })
  })
})

function adresseARattacher(): AdresseARattacher {
  return {
    clefInterop: '94017_aaaa',
    codeBan: null,
    codeInsee: '94017',
    codePostal: '94500',
    latitude: 48.81,
    longitude: 2.51,
    nomCommune: 'Champigny-sur-Marne',
    nomVoie: 'Rue Louis Talamoni',
    numeroVoie: 14,
    repetition: null,
  }
}
