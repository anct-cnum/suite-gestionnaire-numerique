import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import { buildLieuxDansScopeCte, conditionLieuDeLaStructure } from './lieuxDansScope'
import prisma from '../../../prisma/prismaClient'
import { PrismaLieuxDeLaStructureLoader } from '../PrismaLieuxDeLaStructureLoader'
import { creerUnePersonne, creerUneStructure } from '../testHelper'
import { LieuInclusion } from '@/domain/LieuInclusion'
import { utilisateurFactory } from '@/domain/testHelper'

// Règle « lieux de ma structure » (#2092) : un lieu est à ma structure si une personne employée par ma
// structure y est affectée aujourd'hui. Le rattachement des lieux Coop quittés (présence pendant l'emploi)
// a été retiré avec la suppression de coop.employes_structures par la Coop (16/11/2026). Une seule
// définition pour le listing (conditionLieuDeLaStructure) et pour les droits de modification
// (PrismaLieuxDeLaStructureLoader).
const MA_STRUCTURE = 990201
const AUTRE_EMPLOYEUR = 990200
const LIEU = 990210
const LIEU_DU_05 = 990211
const LIEU_DU_26 = 990212
const CLEF_INTEROP = 'test_2092_perimetre_lieux'
const LIEU_COOP_ID = '7a2c4e6f-1b3d-4f5a-8c9e-0d1f2a3b4c5d'

let personnesCreees: Array<number> = []
let adressesCreees = 0

describe('lieux d’inclusion de ma structure (#2092)', () => {
  beforeAll(async () => {
    // Même verrou que les autres fichiers qui matérialisent le schéma coop (non couvert par les migrations) :
    // le test de non-régression supprime coop.employes_structures dans une transaction annulée.
    await prisma.$queryRaw`SELECT pg_advisory_lock(420001)::text`
  })

  afterAll(async () => prisma.$queryRaw`SELECT pg_advisory_unlock(420001)`)

  describe('lieux de ma structure : définition unique pour le listing et la modification (#2092)', () => {
    afterEach(nettoyer)

    it('un lieu où un salarié actif de ma structure est affecté est de ma structure', async () => {
      // GIVEN
      await creerLeLieuEtLesStructures()
      await affecterUnSalarie(MA_STRUCTURE)

      // WHEN
      const visible = await estDansLeListingDe(MA_STRUCTURE)
      const modifiable = await estModifiablePar(MA_STRUCTURE)

      // THEN
      expect(visible).toBe(true)
      expect(modifiable).toBe(true)
    })

    it('un lieu sans personne affectée n’est à aucune structure', async () => {
      // GIVEN
      await creerLeLieuEtLesStructures()

      // WHEN
      const visible = await estDansLeListingDe(MA_STRUCTURE)
      const modifiable = await estModifiablePar(MA_STRUCTURE)

      // THEN
      expect(visible).toBe(false)
      expect(modifiable).toBe(false)
    })

    it('un lieu où plusieurs employeurs ont des salariés est visible et modifiable par chacun', async () => {
      // GIVEN
      await creerLeLieuEtLesStructures()
      await affecterUnSalarie(AUTRE_EMPLOYEUR)
      await affecterUnSalarie(MA_STRUCTURE)

      // WHEN
      const visibleParMaStructure = await estDansLeListingDe(MA_STRUCTURE)
      const visibleParAutreEmployeur = await estDansLeListingDe(AUTRE_EMPLOYEUR)
      const modifiableParMaStructure = await estModifiablePar(MA_STRUCTURE)
      const modifiableParAutreEmployeur = await estModifiablePar(AUTRE_EMPLOYEUR)

      // THEN
      expect(visibleParMaStructure).toBe(true)
      expect(visibleParAutreEmployeur).toBe(true)
      expect(modifiableParMaStructure).toBe(true)
      expect(modifiableParAutreEmployeur).toBe(true)
    })

    it('un salarié de ma structure dont l’affectation au lieu est terminée ne le rattache plus', async () => {
      // GIVEN
      await creerLeLieuEtLesStructures()
      await affecterUnSalarie(MA_STRUCTURE, { lieuActif: false })

      // WHEN
      const visible = await estDansLeListingDe(MA_STRUCTURE)
      const modifiable = await estModifiablePar(MA_STRUCTURE)

      // THEN
      expect(visible).toBe(false)
      expect(modifiable).toBe(false)
    })

    it('ne dépend plus de coop.employes_structures, supprimée par la Coop le 16/11/2026', async () => {
      // GIVEN la table n'existe plus (transaction annulée : les autres fichiers de test la matérialisent)
      await creerLeLieuEtLesStructures()
      await affecterUnSalarie(MA_STRUCTURE)
      const ANNULATION = 'annulation'

      // WHEN
      let visible: boolean | undefined
      await prisma
        .$transaction(async (tx) => {
          await tx.$executeRaw`DROP TABLE IF EXISTS coop.employes_structures`
          const lieux = await tx.$queryRaw<ReadonlyArray<Readonly<{ id: number }>>>`
            SELECT l.id FROM main.lieu_inclusion l
            WHERE l.id = ${LIEU} AND ${conditionLieuDeLaStructure(MA_STRUCTURE)}
          `
          visible = lieux.length === 1
          throw new Error(ANNULATION)
        })
        .catch((error: unknown) => {
          if (!(error instanceof Error && error.message === ANNULATION)) {
            throw error
          }
        })

      // THEN
      expect(visible).toBe(true)
    })
  })

  describe('périmètre des écrans lieux d’un co-porteur (#2092)', () => {
    afterEach(nettoyer)

    it('voit les lieux du département co-porté et ceux de sa structure, pas les autres lieux d’un département où il n’est que membre', async () => {
      // GIVEN ma structure co-porte le 05, est membre du 26 et a un lieu dans le 26
      await creerLeLieuEtLesStructures('26362')
      await affecterUnSalarie(MA_STRUCTURE)
      await creerUnLieuAutreStructure(LIEU_DU_05, '05061')
      await creerUnLieuAutreStructure(LIEU_DU_26, '26362')
      const scope = buildLieuxDansScopeCte(
        { codesCoportes: ['05'], id: MA_STRUCTURE, type: 'structure_et_departements' },
        'actif'
      )

      // WHEN
      const lieux = await prisma.$queryRaw<ReadonlyArray<Readonly<{ id: number }>>>`
        WITH ${scope} SELECT id FROM lieux_dans_scope WHERE id IN (${LIEU}, ${LIEU_DU_05}, ${LIEU_DU_26}) ORDER BY id
      `

      // THEN
      expect(lieux.map(({ id }) => id)).toStrictEqual([LIEU, LIEU_DU_05])
    })
  })
})

async function creerLeLieuEtLesStructures(codeInsee?: string): Promise<void> {
  await creerUneStructure({ id: AUTRE_EMPLOYEUR, nom: 'Autre employeur' })
  await creerUneStructure({ id: MA_STRUCTURE, nom: 'Ma structure' })
  await prisma.main_lieu_inclusion.create({
    data: {
      adresse_id: codeInsee === undefined ? undefined : await creerUneAdresse(codeInsee),
      id: LIEU,
      nom: 'Lieu partagé',
      structure_coop_id: LIEU_COOP_ID,
    },
  })
}

async function creerUnLieuAutreStructure(id: number, codeInsee: string): Promise<void> {
  await prisma.main_lieu_inclusion.create({
    data: { adresse_id: await creerUneAdresse(codeInsee), id, nom: 'Lieu tiers' },
  })
}

async function creerUneAdresse(codeInsee: string): Promise<number> {
  adressesCreees += 1
  const adresse = await prisma.adresse.create({
    data: {
      clef_interop: `${CLEF_INTEROP}_${adressesCreees}`,
      code_insee: codeInsee,
      code_postal: '00000',
      nom_commune: 'Commune',
      nom_voie: `Rue ${adressesCreees}`,
    },
  })
  return adresse.id
}

async function affecterUnSalarie(
  structureId: number,
  { lieuActif = true }: Readonly<{ lieuActif?: boolean }> = {}
): Promise<void> {
  const personneId = await creerUnePersonne()
  personnesCreees.push(personneId)
  await prisma.main_personne_affectations_emploi.create({
    data: { est_active: true, personne_id: personneId, source: 'coop', structure_administrative_id: structureId },
  })
  await prisma.main_personne_affectations_lieu.create({
    data: { est_active: lieuActif, lieu_id: LIEU, personne_id: personneId, source: 'coop' },
  })
}

async function estDansLeListingDe(structureId: number): Promise<boolean> {
  const lieux = await prisma.$queryRaw<ReadonlyArray<Readonly<{ id: number }>>>`
    SELECT l.id FROM main.lieu_inclusion l
    WHERE l.id = ${LIEU} AND ${conditionLieuDeLaStructure(structureId)}
  `
  return lieux.length === 1
}

async function estModifiablePar(structureId: number): Promise<boolean> {
  const estDeLaStructureDuDemandeur = await new PrismaLieuxDeLaStructureLoader().estLieuDeLaStructure(LIEU, structureId)
  return LieuInclusion.peutEtreModifiePar(
    utilisateurFactory({ codeOrganisation: String(structureId), role: 'Gestionnaire structure' }),
    { codeDepartement: '75', codeRegion: '11', estDeLaStructureDuDemandeur }
  )
}

async function nettoyer(): Promise<void> {
  await prisma.main_personne_affectations_lieu.deleteMany({ where: { lieu_id: LIEU } })
  await prisma.main_personne_affectations_emploi.deleteMany({ where: { personne_id: { in: personnesCreees } } })
  await prisma.personne.deleteMany({ where: { id: { in: personnesCreees } } })
  await prisma.main_lieu_inclusion.deleteMany({ where: { id: { in: [LIEU, LIEU_DU_05, LIEU_DU_26] } } })
  await prisma.adresse.deleteMany({ where: { clef_interop: { startsWith: CLEF_INTEROP } } })
  await prisma.main_structure_administrative.deleteMany({ where: { id: { in: [AUTRE_EMPLOYEUR, MA_STRUCTURE] } } })
  personnesCreees = []
}
