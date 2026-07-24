import { afterEach, describe, expect, it } from 'vitest'

import { PrismaStructureTransfertRepository } from './PrismaStructureTransfertRepository'
import {
  creerUnContact,
  creerUnDepartement,
  creerUneGouvernance,
  creerUnePersonne,
  creerUnePersonneAffectation,
  creerUneRegion,
  creerUneStructure,
  creerUnMembre,
  creerUnUtilisateur,
} from './testHelper'
import prisma from '../../prisma/prismaClient'
import { NotionCle } from '@/use-cases/commands/TransfererNotionsStructure'

// Ids/codes dédiés (le repository ouvre sa PROPRE transaction qui commit ; on nettoie à la main).
const SOURCE = 990011
const CIBLE = 990012
const REGION = 'TU'
const DEPT = '992'
const MEMBRE = 'transfert-notions-source'
const COOP_ID_SOURCE = '11111111-1111-1111-1111-111111111111'
const AC_ID_SOURCE = '22222222-2222-2222-2222-222222222222'
const COOP_ID_CIBLE = '33333333-3333-3333-3333-333333333333'
const TP_ID_SOURCE = 880011
const TP_ID_CIBLE = 880012

let personnesCreees: Array<number> = []

describe('transfert des notions d’une structure (repository Prisma)', () => {
  afterEach(nettoyer)

  it('transfère les notions portées, déplace les ids scalaires, vide la source et la soft-delete', async () => {
    // GIVEN une source portant les 6 notions (idposte/coop/ac via affectations + ids scalaires).
    await seedBase()
    await creerUneStructure({
      id: SOURCE,
      nb_mandats_ac: 4,
      siret: '99001100000001',
      structure_ac_id: AC_ID_SOURCE,
      structure_coop_id: COOP_ID_SOURCE,
      structure_tp_id: TP_ID_SOURCE,
    })
    await creerUneStructure({ id: CIBLE, siret: '99001100000002' })
    await creerUnMembre({ gouvernanceDepartementCode: DEPT, id: MEMBRE, structureId: SOURCE })
    await creerUnUtilisateur({ ssoEmail: 'tn.user@example.com', ssoId: 'tn-user', structureId: SOURCE })
    await lierContact(SOURCE)
    await affecter(SOURCE, 'coop')
    await affecter(SOURCE, 'idposte')
    await affecter(SOURCE, 'aidants-connect')

    // WHEN on transfère les 5 notions.
    const result = await transferer(['aidantsConnect', 'contacts', 'coop', 'idposte', 'membre'])

    // THEN la source est vidée puis supprimée, et la cible porte les 3 ids scalaires.
    expect(result).toBe('OK')
    await expect(structureIdDuMembre()).resolves.toBe(CIBLE)
    await expect(idsScalaires(CIBLE)).resolves.toStrictEqual({
      ac: AC_ID_SOURCE,
      coop: COOP_ID_SOURCE,
      mandats: 4,
      tp: TP_ID_SOURCE,
    })
    await expect(idsScalaires(SOURCE)).resolves.toStrictEqual({ ac: null, coop: null, mandats: null, tp: null })
    await expect(estSupprimee(SOURCE)).resolves.toBe(true)
    await expect(nombreAudits()).resolves.toBe(1)
  })

  it('transfert partiel : ne déplace que la notion choisie et conserve la source non supprimée', async () => {
    // GIVEN une source portant coop ET un membre.
    await seedBase()
    await creerUneStructure({ id: SOURCE, siret: '99001100000001', structure_coop_id: COOP_ID_SOURCE })
    await creerUneStructure({ id: CIBLE, siret: '99001100000002' })
    await creerUnMembre({ gouvernanceDepartementCode: DEPT, id: MEMBRE, structureId: SOURCE })
    await affecter(SOURCE, 'coop')

    // WHEN on ne transfère que coop.
    const result = await transferer(['coop'])

    // THEN coop est déplacé, le membre reste sur la source, qui n'est pas supprimée.
    expect(result).toBe('OK')
    await expect(idsScalaires(CIBLE)).resolves.toMatchObject({ coop: COOP_ID_SOURCE })
    await expect(idsScalaires(SOURCE)).resolves.toMatchObject({ coop: null })
    await expect(structureIdDuMembre()).resolves.toBe(SOURCE)
    await expect(estSupprimee(SOURCE)).resolves.toBe(false)
  })

  it('refuse en cas de collision d’id scalaire (idposte) et ne modifie rien', async () => {
    // GIVEN source et cible portent chacune un structure_tp_id différent (id-poste resynchronise
    // toujours par cet id : le blocage reste, contrairement à l'uuid coop).
    await seedBase()
    await creerUneStructure({ id: SOURCE, siret: '99001100000001', structure_tp_id: TP_ID_SOURCE })
    await creerUneStructure({ id: CIBLE, siret: '99001100000002', structure_tp_id: TP_ID_CIBLE })

    // WHEN
    const result = await transferer(['idposte'])

    // THEN
    expect(result).toBe('collisionIdentifiantSource')
    await expect(idsScalaires(SOURCE)).resolves.toMatchObject({ tp: TP_ID_SOURCE })
    await expect(nombreAudits()).resolves.toBe(0)
  })

  it('abandonne l’uuid coop de la source (sans échec) quand la cible porte déjà le sien', async () => {
    // GIVEN source et cible portent chacune un structure_coop_id différent : depuis la bascule
    // ADR-002 l'uuid n'est plus un vecteur de resync — la cible garde le sien.
    await seedBase()
    await creerUneStructure({ id: SOURCE, siret: '99001100000001', structure_coop_id: COOP_ID_SOURCE })
    await creerUneStructure({ id: CIBLE, siret: '99001100000002', structure_coop_id: COOP_ID_CIBLE })
    await affecter(SOURCE, 'coop')

    // WHEN
    const result = await transferer(['coop'])

    // THEN l'affectation est déplacée, l'uuid de la source est abandonné, la cible garde le sien.
    expect(result).toBe('OK')
    await expect(idsScalaires(SOURCE)).resolves.toMatchObject({ coop: null })
    await expect(idsScalaires(CIBLE)).resolves.toMatchObject({ coop: COOP_ID_CIBLE })
    await expect(nombreAudits()).resolves.toBe(1)
  })

  it('refuse en cas de collision de membre sur la même gouvernance', async () => {
    // GIVEN source et cible déjà membres de la même gouvernance.
    await seedBase()
    await creerUneStructure({ id: SOURCE, siret: '99001100000001' })
    await creerUneStructure({ id: CIBLE, siret: '99001100000002' })
    await creerUnMembre({ gouvernanceDepartementCode: DEPT, id: MEMBRE, structureId: SOURCE })
    await creerUnMembre({ gouvernanceDepartementCode: DEPT, id: 'transfert-notions-cible', structureId: CIBLE })

    // WHEN
    const result = await transferer(['membre'])

    // THEN
    expect(result).toBe('collisionMembreGouvernance')
    await expect(structureIdDuMembre()).resolves.toBe(SOURCE)
  })

  it('retourne structureIntrouvable quand une structure n’existe pas', async () => {
    // GIVEN seule la source existe.
    await seedBase()
    await creerUneStructure({ id: SOURCE, siret: '99001100000001' })

    // WHEN
    const result = await new PrismaStructureTransfertRepository().transfererNotions({
      idCible: 999999,
      idSource: SOURCE,
      notions: ['contacts'],
      parUtilisateur: 'admin-test',
    })

    // THEN
    expect(result).toBe('structureIntrouvable')
  })
})

async function transferer(notions: ReadonlyArray<NotionCle>): Promise<string> {
  return new PrismaStructureTransfertRepository().transfererNotions({
    idCible: CIBLE,
    idSource: SOURCE,
    notions,
    parUtilisateur: 'admin-test',
  })
}

async function seedBase(): Promise<void> {
  await creerUneRegion({ code: REGION, nom: 'Région de test notions' })
  await creerUnDepartement({ code: DEPT, nom: 'Département de test notions', regionCode: REGION })
  await creerUneGouvernance({ departementCode: DEPT })
}

async function lierContact(structureId: number): Promise<void> {
  const contactId = await creerUnContact({ email: 'tn.contact@example.com', nom: 'TransfertNotionsContact' })
  await prisma.contact_structure_administrative.create({
    data: { contact_id: contactId, structure_administrative_id: structureId },
  })
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

async function idsScalaires(id: number): Promise<Record<string, null | number | string>> {
  const structure = await prisma.main_structure_administrative.findUnique({ where: { id } })
  return {
    ac: structure?.structure_ac_id ?? null,
    coop: structure?.structure_coop_id ?? null,
    mandats: structure?.nb_mandats_ac ?? null,
    tp: structure?.structure_tp_id ?? null,
  }
}

async function estSupprimee(id: number): Promise<boolean> {
  const structure = await prisma.main_structure_administrative.findUnique({ where: { id } })
  return structure?.deleted_at != null
}

async function nombreAudits(): Promise<number> {
  const lignes = await prisma.$queryRaw<Array<{ total: bigint }>>`
    SELECT COUNT(*) AS total FROM audit.structure_merge_log
    WHERE dag_id = 'min-ui-transfert' AND loser_id = ${SOURCE}
  `
  return Number(lignes.at(0)?.total ?? 0)
}

async function nettoyer(): Promise<void> {
  await prisma.$executeRaw`
    DELETE FROM audit.structure_merge_log WHERE dag_id = 'min-ui-transfert' AND loser_id IN (${SOURCE}, ${CIBLE})
  `
  await prisma.main_personne_affectations_emploi.deleteMany({
    where: { structure_administrative_id: { in: [SOURCE, CIBLE] } },
  })
  await prisma.membreRecord.deleteMany({ where: { structureId: { in: [SOURCE, CIBLE] } } })
  await prisma.utilisateurRecord.deleteMany({ where: { structureId: { in: [SOURCE, CIBLE] } } })
  await prisma.contact_structure_administrative.deleteMany({
    where: { structure_administrative_id: { in: [SOURCE, CIBLE] } },
  })
  await prisma.main_contact.deleteMany({ where: { nom: 'TransfertNotionsContact' } })
  if (personnesCreees.length > 0) {
    await prisma.personne.deleteMany({ where: { id: { in: personnesCreees } } })
    personnesCreees = []
  }
  await prisma.main_structure_administrative.deleteMany({ where: { id: { in: [SOURCE, CIBLE] } } })
  await prisma.gouvernanceRecord.deleteMany({ where: { departementCode: DEPT } })
  await prisma.departementRecord.deleteMany({ where: { code: DEPT } })
  await prisma.regionRecord.deleteMany({ where: { code: REGION } })
}
