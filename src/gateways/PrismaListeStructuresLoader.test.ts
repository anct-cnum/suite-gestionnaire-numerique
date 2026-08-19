import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PrismaListeStructuresLoader } from './PrismaListeStructuresLoader'
import { creerUneStructure, creerUnUtilisateur } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { epochTime } from '@/shared/testHelper'
import {
  FiltresListeStructures,
  ListeStructuresReadModel,
  StructureListeReadModel,
} from '@/use-cases/queries/RecupererListeStructures'

describe('liste structures loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  describe('périmètre d’accès', () => {
    it('en scope départemental, seules les structures des départements autorisés sont visibles', async () => {
      // GIVEN
      await creerUneStructure({ departementCode: '69', id: 1, nom: 'Structure Rhône' })
      await creerUneStructure({ departementCode: '75', id: 2, nom: 'Structure Paris' })

      // WHEN
      const readModel = await new PrismaListeStructuresLoader().get(
        filtres({ scopeFiltre: { codes: ['69'], type: 'departemental' } })
      )

      // THEN
      expect(nomsDesStructures(readModel)).toStrictEqual(['Structure Rhône'])
    })

    it('en scope structure, seule la structure de l’utilisateur est visible', async () => {
      // GIVEN
      await creerUneStructure({ departementCode: '69', id: 1, nom: 'Ma structure' })
      await creerUneStructure({ departementCode: '69', id: 2, nom: 'Autre structure du département' })

      // WHEN
      const readModel = await new PrismaListeStructuresLoader().get(
        filtres({ scopeFiltre: { id: 1, type: 'structure' } })
      )

      // THEN
      expect(nomsDesStructures(readModel)).toStrictEqual(['Ma structure'])
    })

    it('en scope national, toutes les structures sont visibles sauf les structures supprimées', async () => {
      // GIVEN
      await creerUneStructure({ departementCode: '69', id: 1, nom: 'Structure Rhône' })
      await creerUneStructure({ id: 2, nom: 'Structure sans adresse' })
      await creerUneStructure({ deleted_at: epochTime, departementCode: '75', id: 3, nom: 'Structure supprimée' })

      // WHEN
      const readModel = await new PrismaListeStructuresLoader().get(filtres({}))

      // THEN
      expect(nomsDesStructures(readModel)).toStrictEqual(['Structure Rhône', 'Structure sans adresse'])
    })

    it('en scope national, le filtre géographique du drawer restreint au département choisi', async () => {
      // GIVEN
      await creerUneStructure({ departementCode: '69', id: 1, nom: 'Structure Rhône' })
      await creerUneStructure({ departementCode: '75', id: 2, nom: 'Structure Paris' })

      // WHEN
      const readModel = await new PrismaListeStructuresLoader().get(
        filtres({ geographique: { code: '75', type: 'departement' } })
      )

      // THEN
      expect(nomsDesStructures(readModel)).toStrictEqual(['Structure Paris'])
    })

    it('en scope national, le filtre géographique du drawer restreint aux départements de la région choisie', async () => {
      // GIVEN
      await creerUneStructure({ departementCode: '69', id: 1, nom: 'Structure Rhône' })
      await creerUneStructure({ departementCode: '75', id: 2, nom: 'Structure Paris' })

      // WHEN — région Auvergne-Rhône-Alpes (84) contient le Rhône (69)
      const readModel = await new PrismaListeStructuresLoader().get(
        filtres({ geographique: { code: '84', type: 'region' } })
      )

      // THEN
      expect(nomsDesStructures(readModel)).toStrictEqual(['Structure Rhône'])
    })
  })

  describe('recherche', () => {
    it('la recherche porte sur le nom, insensible à la casse, et sur le SIRET', async () => {
      // GIVEN
      await creerUneStructure({ id: 1, identifiantEtablissement: '11111111111111', nom: 'Association Connect 71' })
      await creerUneStructure({ id: 2, identifiantEtablissement: '22222222222222', nom: 'Emmaüs Connect' })
      await creerUneStructure({ id: 3, identifiantEtablissement: '33333000000000', nom: 'Déclic Ardèche' })

      // WHEN
      const parNom = await new PrismaListeStructuresLoader().get(filtres({ recherche: 'coNNect' }))
      const parSiret = await new PrismaListeStructuresLoader().get(filtres({ recherche: '33333' }))

      // THEN
      expect(nomsDesStructures(parNom)).toStrictEqual(['Association Connect 71', 'Emmaüs Connect'])
      expect(nomsDesStructures(parSiret)).toStrictEqual(['Déclic Ardèche'])
    })

    it('la recherche porte aussi sur la dénomination d’antenne', async () => {
      // GIVEN
      await creerUneStructure({
        denomination_antenne: 'Antenne de Lyon',
        id: 1,
        nom: 'Grand réseau national',
      })
      await creerUneStructure({ id: 2, nom: 'Autre structure' })

      // WHEN
      const readModel = await new PrismaListeStructuresLoader().get(filtres({ recherche: 'lyon' }))

      // THEN
      expect(nomsDesStructures(readModel)).toStrictEqual(['Antenne de Lyon'])
    })
  })

  describe('filtre labellisation / habilitation', () => {
    it('le filtre conseiller numérique retient les structures avec label actif ou poste actif, pas les labels expirés seuls ni les postes rendus', async () => {
      // GIVEN
      await creerUnUtilisateur({ id: 7 })
      await creerUneStructure({ id: 1, nom: 'Labellisée récemment' })
      await creerUneAttestation(1, ilYaDesMois(2))
      await creerUneStructure({ id: 2, nom: 'Label expiré avec poste actif' })
      await creerUneAttestation(2, ilYaDesMois(18))
      await creerUnPoste(2, 'occupe')
      await creerUneStructure({ id: 3, nom: 'Label expiré sans poste' })
      await creerUneAttestation(3, ilYaDesMois(18))
      await creerUneStructure({ id: 4, nom: 'Sans rien' })
      await creerUneStructure({ id: 5, nom: 'Poste vacant' })
      await creerUnPoste(5, 'vacant')
      await creerUneStructure({ id: 6, nom: 'Poste rendu' })
      await creerUnPoste(6, 'rendu')

      // WHEN
      const readModel = await new PrismaListeStructuresLoader().get(filtres({ labellisation: 'conseiller-numerique' }))

      // THEN
      expect(nomsDesStructures(readModel)).toStrictEqual([
        'Label expiré avec poste actif',
        'Labellisée récemment',
        'Poste vacant',
      ])
    })

    it('le filtre aidants connect retient les structures rattachées à Aidants Connect', async () => {
      // GIVEN
      await creerUneStructure({ id: 1, nom: 'Habilitée', structure_ac_id: '019520f0-0000-7000-8000-000000000001' })
      await creerUneStructure({ id: 2, nom: 'Non habilitée' })

      // WHEN
      const readModel = await new PrismaListeStructuresLoader().get(filtres({ labellisation: 'aidants-connect' }))

      // THEN
      expect(nomsDesStructures(readModel)).toStrictEqual(['Habilitée'])
    })
  })

  describe('indicateurs', () => {
    it('les indicateurs comptent les structures habilitées Aidants Connect et labellisées conum (label actif ou poste actif), recherche comprise', async () => {
      // GIVEN
      await creerUnUtilisateur({ id: 7 })
      await creerUneStructure({ id: 1, nom: 'Habilitée AC', structure_ac_id: '019520f0-0000-7000-8000-000000000001' })
      await creerUneStructure({ id: 2, nom: 'Labellisée conum' })
      await creerUneAttestation(2, ilYaDesMois(2))
      await creerUneStructure({ id: 3, nom: 'Label expiré' })
      await creerUneAttestation(3, ilYaDesMois(18))
      await creerUneStructure({ id: 4, nom: 'Avec poste actif seulement' })
      await creerUnPoste(4, 'occupe')

      // WHEN
      const sansRecherche = await new PrismaListeStructuresLoader().get(filtres({}))
      const avecRecherche = await new PrismaListeStructuresLoader().get(filtres({ recherche: 'Habilitée' }))

      // THEN
      expect(sansRecherche).toMatchObject({
        total: 4,
        totalHabiliteesAidantsConnect: 1,
        totalLabelliseesConseillerNumerique: 2,
        totalStructures: 4,
      })
      expect(avecRecherche).toMatchObject({
        total: 1,
        totalHabiliteesAidantsConnect: 1,
        totalLabelliseesConseillerNumerique: 0,
        totalStructures: 1,
      })
    })
  })

  describe('liste et pagination', () => {
    it('les structures sont triées par nom avec leurs informations et paginées', async () => {
      // GIVEN
      await creerUnUtilisateur({ id: 7 })
      await creerUneStructure({
        adresse: '3 BIS AVENUE CHARLES DE GAULLE',
        codePostal: '69002',
        commune: 'LYON',
        departementCode: '69',
        id: 1,
        identifiantEtablissement: '41816609600069',
        nom: 'Bravo',
        structure_ac_id: '019520f0-0000-7000-8000-000000000001',
      })
      await creerUneAttestation(1, ilYaDesMois(2))
      await creerUnPoste(1, 'occupe')
      await creerUneStructure({ id: 2, nom: 'Alpha' })
      await creerUneStructure({ id: 3, nom: 'Charlie' })

      // WHEN
      const readModel = await new PrismaListeStructuresLoader().get(filtres({ pagination: { limite: 2, page: 1 } }))

      // THEN
      expect(readModel).toMatchObject({
        displayPagination: true,
        limite: 2,
        page: 1,
        total: 3,
        totalPages: 2,
      })
      const listeReadModel = readModel as ListeStructuresReadModel
      expect(listeReadModel.structures).toHaveLength(2)
      expect(listeReadModel.structures[0].nom).toBe('Alpha')
      expect(listeReadModel.structures[1]).toMatchObject({
        adresse: '3 BIS AVENUE CHARLES DE GAULLE - Dept 69',
        codePostal: '69002',
        commune: 'LYON',
        estHabiliteeAidantsConnect: true,
        id: 1,
        nom: 'Bravo',
        possedePosteConumActif: true,
        siret: '41816609600069',
      })
      expect(listeReadModel.structures[1].derniereAttestationLabelConum).not.toBeNull()
    })
  })

  describe('export', () => {
    it('l’export retourne toutes les structures du périmètre sans pagination', async () => {
      // GIVEN
      await creerUneStructure({ id: 1, nom: 'Bravo' })
      await creerUneStructure({ id: 2, nom: 'Alpha' })
      await creerUneStructure({ id: 3, nom: 'Charlie' })

      // WHEN
      const structures = await new PrismaListeStructuresLoader().getForExport(
        filtres({ pagination: { limite: 2, page: 1 } })
      )

      // THEN
      const structuresExport = structures as Array<StructureListeReadModel>
      expect(structuresExport.map((structure) => structure.nom)).toStrictEqual(['Alpha', 'Bravo', 'Charlie'])
    })
  })
})

async function creerUneAttestation(structureId: number, dateAttestation: Date): Promise<void> {
  await prisma.main_conum_labellisation.create({
    data: { date_attestation: dateAttestation, structure_id: structureId, utilisateur_id: 7 },
  })
}

async function creerUnPoste(structureId: number, etat: string): Promise<void> {
  await prisma.poste.create({
    data: {
      date_attribution: epochTime,
      date_rendu_poste: etat === 'rendu' ? epochTime : null,
      etat,
      poste_conum_id: structureId,
      structure_id: structureId,
    },
  })
}

function filtres(override: Partial<FiltresListeStructures>): FiltresListeStructures {
  return {
    pagination: { limite: 10, page: 1 },
    scopeFiltre: { type: 'national' },
    ...override,
  }
}

function ilYaDesMois(mois: number): Date {
  const date = new Date(Date.now())
  date.setMonth(date.getMonth() - mois)
  return date
}

function nomsDesStructures(readModel: Awaited<ReturnType<PrismaListeStructuresLoader['get']>>): Array<string> {
  if ('type' in readModel) {
    return []
  }
  return (readModel as ListeStructuresReadModel).structures.map((structure) => structure.nom)
}
