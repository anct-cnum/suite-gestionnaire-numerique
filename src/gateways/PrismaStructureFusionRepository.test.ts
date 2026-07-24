import { afterEach, describe, expect, it } from 'vitest'

import { PrismaStructureFusionRepository } from './PrismaStructureFusionRepository'
import {
  creerUnDepartement,
  creerUneGouvernance,
  creerUnePersonne,
  creerUnePersonneAffectation,
  creerUneRegion,
  creerUneStructure,
  creerUnMembre,
} from './testHelper'
import prisma from '../../prisma/prismaClient'

// Survivante = canonique (INSEE) ; absorbée = antenne. Ids/codes dédiés ; nettoyage manuel.
const SURVIVANTE = 990021
const ABSORBEE = 990022
const REGION = 'TV'
const DEPT = '993'
const MEMBRE = 'fusion-test-membre'
const COOP_ID = '44444444-4444-4444-4444-444444444444'
const COOP_ID_SURVIVANTE = '55555555-5555-5555-5555-555555555555'
const TP_ID_SURVIVANTE = 990031
const TP_ID_ABSORBEE = 990032

let personnesCreees: Array<number> = []

describe('fusion de structures (repository Prisma)', () => {
  afterEach(nettoyer)

  it('déplace les notions (ids de source inclus), balaie les FK résiduelles, soft-delete l’absorbée et préserve les champs de la survivante', async () => {
    // GIVEN une survivante canonique (APE 84.11Z) et une absorbée antenne portant membre, coop et une
    // affectation source='min' (résiduelle, hors notions).
    await seedBase()
    await creerUneStructure({
      code_activite_principale: '84.11Z',
      id: SURVIVANTE,
      nom: 'SURVIVANTE',
      siret: '99002100000001',
    })
    await creerUneStructure({
      code_activite_principale: '99.99Z',
      denomination_antenne: 'Antenne absorbée',
      id: ABSORBEE,
      nom: 'ABSORBEE',
      siret: '99002100000002',
      structure_coop_id: COOP_ID,
    })
    await creerUnMembre({ gouvernanceDepartementCode: DEPT, id: MEMBRE, structureId: ABSORBEE })
    await affecter(ABSORBEE, 'coop')
    await affecter(ABSORBEE, 'min')

    // WHEN
    const result = await fusionner()

    // THEN
    expect(result).toBe('OK')
    await expect(structureIdDuMembre()).resolves.toBe(SURVIVANTE)
    await expect(coopIdDe(SURVIVANTE)).resolves.toBe(COOP_ID) // id de source transféré
    await expect(apeDe(SURVIVANTE)).resolves.toBe('84.11Z') // champ descriptif de la survivante intact
    await expect(nbAffectations(ABSORBEE)).resolves.toBe(0) // coop ET source='min' déplacées
    await expect(nbAffectations(SURVIVANTE)).resolves.toBe(2)
    await expect(estSupprimee(ABSORBEE)).resolves.toBe(true)
    await expect(dernierAuditReussi()).resolves.toMatchObject({ moved_identifiers: { siret: '99002100000002' } })
  })

  it('refuse de fusionner une canonique (INSEE) dans une antenne', async () => {
    // GIVEN survivante antenne, absorbée canonique (pas de denomination_antenne).
    await seedBase()
    await creerUneStructure({
      denomination_antenne: 'Antenne survivante',
      id: SURVIVANTE,
      nom: 'SURVIVANTE',
      siret: '99002100000001',
    })
    await creerUneStructure({ id: ABSORBEE, nom: 'ABSORBEE-CANONIQUE', siret: '99002100000002' })

    // WHEN
    const result = await fusionner()

    // THEN
    expect(result).toBe('fusionImpossibleCanoniqueDansAntenne')
    await expect(estSupprimee(ABSORBEE)).resolves.toBe(false)
  })

  it('autorise la fusion d’une canonique (INSEE) dans une autre canonique', async () => {
    // GIVEN survivante ET absorbée canoniques (deux SIRET distincts, doublon inter-SIRET).
    await seedBase()
    await creerUneStructure({ id: SURVIVANTE, nom: 'SURVIVANTE', siret: '99002100000001' })
    await creerUneStructure({ id: ABSORBEE, nom: 'ABSORBEE-CANONIQUE', siret: '99002100000002' })

    // WHEN
    const result = await fusionner()

    // THEN
    expect(result).toBe('OK')
    await expect(estSupprimee(ABSORBEE)).resolves.toBe(true)
  })

  it('abandonne l’uuid coop de l’absorbée (sans échec) quand la survivante porte déjà le sien, et le trace', async () => {
    // GIVEN survivante et absorbée portent chacune un structure_coop_id différent : depuis la bascule
    // ADR-002 l'uuid n'est plus un vecteur de resync — plus de blocage, la survivante garde le sien.
    await seedBase()
    await creerUneStructure({
      id: SURVIVANTE,
      nom: 'SURVIVANTE',
      siret: '99002100000001',
      structure_coop_id: COOP_ID_SURVIVANTE,
    })
    await creerUneStructure({
      denomination_antenne: 'Antenne absorbée',
      id: ABSORBEE,
      nom: 'ABSORBEE',
      siret: '99002100000002',
      structure_coop_id: COOP_ID,
    })

    // WHEN
    const result = await fusionner()

    // THEN
    expect(result).toBe('OK')
    await expect(coopIdDe(SURVIVANTE)).resolves.toBe(COOP_ID_SURVIVANTE)
    await expect(coopIdDe(ABSORBEE)).resolves.toBeNull()
    await expect(estSupprimee(ABSORBEE)).resolves.toBe(true)
    await expect(dernierAuditReussi()).resolves.toMatchObject({ moved_identifiers: { structure_coop_id: COOP_ID } })
  })

  it('refuse la fusion en cas de collision d’id de source (idposte) et ne supprime pas l’absorbée', async () => {
    // GIVEN survivante et absorbée portent chacune un structure_tp_id différent (id-poste resynchronise
    // toujours par cet id : le blocage reste).
    await seedBase()
    await creerUneStructure({
      id: SURVIVANTE,
      nom: 'SURVIVANTE',
      siret: '99002100000001',
      structure_tp_id: TP_ID_SURVIVANTE,
    })
    await creerUneStructure({
      denomination_antenne: 'Antenne absorbée',
      id: ABSORBEE,
      nom: 'ABSORBEE',
      siret: '99002100000002',
      structure_tp_id: TP_ID_ABSORBEE,
    })

    // WHEN
    const result = await fusionner()

    // THEN
    expect(result).toBe('collisionIdentifiantSource')
    await expect(estSupprimee(ABSORBEE)).resolves.toBe(false)
  })

  it('repointe les références coop (activites, employes_structures) vers la survivante quand les colonnes de la bascule existent', async () => {
    // GIVEN le schéma coop post-bascule ADR-002 (colonnes int dual-write) avec des lignes pointant l'absorbée.
    await seedBase()
    await creerUneStructure({ id: SURVIVANTE, nom: 'SURVIVANTE', siret: '99002100000001' })
    await creerUneStructure({
      denomination_antenne: 'Antenne absorbée',
      id: ABSORBEE,
      nom: 'ABSORBEE',
      siret: '99002100000002',
    })
    await creerSchemaCoopPostBascule()

    // WHEN
    const result = await fusionner()

    // THEN
    expect(result).toBe('OK')
    await expect(referencesCoopVers(SURVIVANTE)).resolves.toStrictEqual({ activites: 2, employesStructures: 1 })
    await expect(referencesCoopVers(ABSORBEE)).resolves.toStrictEqual({ activites: 0, employesStructures: 0 })
    await expect(dernierAuditReussi()).resolves.toMatchObject({
      moved_identifiers: { coop_activites_repointees: 2, coop_employes_structures_repointes: 1 },
    })
  })

  it('retourne structureIntrouvable quand la survivante n’existe pas', async () => {
    // GIVEN seule l'absorbée existe.
    await seedBase()
    await creerUneStructure({ denomination_antenne: 'Antenne', id: ABSORBEE, nom: 'ABSORBEE', siret: '99002100000002' })

    // WHEN
    const result = await new PrismaStructureFusionRepository().fusionner({
      idAbsorbee: ABSORBEE,
      idSurvivante: 999999,
      parUtilisateur: 'admin-test',
    })

    // THEN
    expect(result).toBe('structureIntrouvable')
  })
})

async function fusionner(): Promise<string> {
  return new PrismaStructureFusionRepository().fusionner({
    idAbsorbee: ABSORBEE,
    idSurvivante: SURVIVANTE,
    parUtilisateur: 'admin-test',
  })
}

async function seedBase(): Promise<void> {
  await creerUneRegion({ code: REGION, nom: 'Région de test fusion' })
  await creerUnDepartement({ code: DEPT, nom: 'Département de test fusion', regionCode: REGION })
  await creerUneGouvernance({ departementCode: DEPT })
}

async function affecter(structureId: number, source: string): Promise<void> {
  const personneId = await creerUnePersonne()
  personnesCreees.push(personneId)
  await creerUnePersonneAffectation({
    personne_id: personneId,
    source,
    structure_id: structureId,
    type: 'structure_emploi',
  })
}

async function structureIdDuMembre(): Promise<number | undefined> {
  const membre = await prisma.membreRecord.findUnique({ where: { id: MEMBRE } })
  return membre?.structureId
}

async function coopIdDe(id: number): Promise<null | string> {
  const structure = await prisma.main_structure_administrative.findUnique({ where: { id } })
  return structure?.structure_coop_id ?? null
}

async function apeDe(id: number): Promise<null | string> {
  const structure = await prisma.main_structure_administrative.findUnique({ where: { id } })
  return structure?.code_activite_principale ?? null
}

async function nbAffectations(structureId: number): Promise<number> {
  return prisma.main_personne_affectations_emploi.count({ where: { structure_administrative_id: structureId } })
}

async function estSupprimee(id: number): Promise<boolean> {
  const structure = await prisma.main_structure_administrative.findUnique({ where: { id } })
  return structure?.deleted_at != null
}

// Simule le schéma coop post-bascule ADR-002 (colonnes int dual-write) : tables minimales sans FK
// (les vraies vivent côté coop) — seules les colonnes détectées par le repointage comptent.
async function creerSchemaCoopPostBascule(): Promise<void> {
  await prisma.$executeRaw`CREATE SCHEMA IF NOT EXISTS coop`
  await prisma.$executeRaw`CREATE TABLE coop.activites (id serial PRIMARY KEY, structure_employeuse_main_id integer)`
  await prisma.$executeRaw`CREATE TABLE coop.employes_structures (id serial PRIMARY KEY, structure_main_id integer)`
  await prisma.$executeRaw`INSERT INTO coop.activites (structure_employeuse_main_id) VALUES (${ABSORBEE}), (${ABSORBEE})`
  await prisma.$executeRaw`INSERT INTO coop.employes_structures (structure_main_id) VALUES (${ABSORBEE})`
}

async function referencesCoopVers(structureId: number): Promise<Record<string, number>> {
  const lignes = await prisma.$queryRaw<Array<{ activites: bigint; employes: bigint }>>`
    SELECT
      (SELECT count(*) FROM coop.activites WHERE structure_employeuse_main_id = ${structureId}) AS activites,
      (SELECT count(*) FROM coop.employes_structures WHERE structure_main_id = ${structureId}) AS employes
  `
  const ligne = lignes[0]

  return { activites: Number(ligne.activites), employesStructures: Number(ligne.employes) }
}

async function dernierAuditReussi(): Promise<Record<string, unknown> | undefined> {
  const lignes = await prisma.$queryRaw<Array<Record<string, unknown>>>`
    SELECT moved_identifiers FROM audit.structure_merge_log
    WHERE status = 'SUCCESS' AND dag_id = 'min-ui' AND winner_id = ${SURVIVANTE} AND loser_id = ${ABSORBEE}
    ORDER BY id DESC LIMIT 1
  `
  return lignes.at(0)
}

async function nettoyer(): Promise<void> {
  // Le schéma coop n'existe pas dans la base de test MIN hors du test de repointage qui le crée.
  await prisma.$executeRaw`DROP SCHEMA IF EXISTS coop CASCADE`
  await prisma.$executeRaw`
    DELETE FROM audit.structure_merge_log
    WHERE winner_id IN (${SURVIVANTE}, ${ABSORBEE}) OR loser_id IN (${SURVIVANTE}, ${ABSORBEE})
  `
  await prisma.main_personne_affectations_emploi.deleteMany({
    where: { structure_administrative_id: { in: [SURVIVANTE, ABSORBEE] } },
  })
  await prisma.membreRecord.deleteMany({ where: { structureId: { in: [SURVIVANTE, ABSORBEE] } } })
  if (personnesCreees.length > 0) {
    await prisma.personne.deleteMany({ where: { id: { in: personnesCreees } } })
    personnesCreees = []
  }
  await prisma.main_structure_administrative.deleteMany({ where: { id: { in: [SURVIVANTE, ABSORBEE] } } })
  await prisma.gouvernanceRecord.deleteMany({ where: { departementCode: DEPT } })
  await prisma.departementRecord.deleteMany({ where: { code: DEPT } })
  await prisma.regionRecord.deleteMany({ where: { code: REGION } })
}
