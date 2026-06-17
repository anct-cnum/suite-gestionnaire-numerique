import { afterEach, describe, expect, it } from 'vitest'

import { PrismaMembreTransfertRepository } from './PrismaMembreTransfertRepository'
import {
  creerUnContact,
  creerUnDepartement,
  creerUneGouvernance,
  creerUneRegion,
  creerUneStructure,
  creerUnMembre,
  creerUnUtilisateur,
} from './testHelper'
import prisma from '../../prisma/prismaClient'

// Données namespacées (codes/ids dédiés) pour ne pas entrer en collision avec les autres
// fichiers de test : le repository ouvre sa PROPRE transaction (qui commit), on ne peut donc
// pas s'appuyer sur le wrapper START TRANSACTION/ROLLBACK ; on nettoie explicitement.
const SOURCE = 990001
const CIBLE = 990002
const REGION = 'TT'
const DEPT = '991'
const MEMBRE_SOURCE = 'transfert-test-source'

describe('transfert de membre (repository Prisma)', () => {
  afterEach(nettoyer)

  it('déplace le membre, ses utilisateurs et ses contacts vers la cible, sans supprimer la source, et journalise', async () => {
    // GIVEN
    await seedBaseEtStructures()
    await creerUnMembre({ gouvernanceDepartementCode: DEPT, id: MEMBRE_SOURCE, structureId: SOURCE })
    await creerUnUtilisateur({ ssoEmail: 'tt.user1@example.com', ssoId: 'tt-user-1', structureId: SOURCE })
    await creerUnUtilisateur({ ssoEmail: 'tt.user2@example.com', ssoId: 'tt-user-2', structureId: SOURCE })
    const contactA = await creerUnContact({ email: 'tt.a@example.com', nom: 'TransfertTestContact' })
    const contactB = await creerUnContact({ email: 'tt.b@example.com', nom: 'TransfertTestContact' })
    await lier(contactA, SOURCE)
    await lier(contactB, SOURCE)

    // WHEN
    const result = await transferer()

    // THEN
    expect(result).toBe('OK')
    await expect(structureIdDuMembre(MEMBRE_SOURCE)).resolves.toBe(CIBLE)
    await expect(structuresDesUtilisateurs(['tt-user-1', 'tt-user-2'])).resolves.toStrictEqual([CIBLE, CIBLE])
    await expect(contactsDe(SOURCE)).resolves.toStrictEqual([])
    await expect(contactsDe(CIBLE)).resolves.toStrictEqual([contactA, contactB].sort((un, autre) => un - autre))
    await expect(sourceEstSupprimee()).resolves.toBe(false)
    await expect(dernierAudit()).resolves.toMatchObject({
      contactsDeplaces: 2,
      contactsSupprimes: 0,
      membreId: MEMBRE_SOURCE,
      structureCibleId: CIBLE,
      structureSourceId: SOURCE,
      utilisateursDeplaces: 2,
    })
  })

  it('en cas de collision de contact, supprime le doublon côté source et déplace les autres', async () => {
    // GIVEN
    await seedBaseEtStructures()
    await creerUnMembre({ gouvernanceDepartementCode: DEPT, id: MEMBRE_SOURCE, structureId: SOURCE })
    await creerUnUtilisateur({ ssoEmail: 'tt.user1@example.com', ssoId: 'tt-user-1', structureId: SOURCE })
    const contactPartage = await creerUnContact({ email: 'tt.partage@example.com', nom: 'TransfertTestContact' })
    const contactPropre = await creerUnContact({ email: 'tt.propre@example.com', nom: 'TransfertTestContact' })
    await lier(contactPartage, SOURCE)
    await lier(contactPropre, SOURCE)
    await lier(contactPartage, CIBLE) // déjà côté cible → collision

    // WHEN
    const result = await transferer()

    // THEN
    expect(result).toBe('OK')
    await expect(contactsDe(SOURCE)).resolves.toStrictEqual([])
    await expect(contactsDe(CIBLE)).resolves.toStrictEqual(
      [contactPartage, contactPropre].sort((un, autre) => un - autre)
    )
    await expect(dernierAudit()).resolves.toMatchObject({
      contactsDeplaces: 1,
      contactsSupprimes: 1,
      utilisateursDeplaces: 1,
    })
  })

  it('refuse le transfert si la cible est déjà membre de la même gouvernance, sans rien modifier', async () => {
    // GIVEN
    await seedBaseEtStructures()
    await creerUnMembre({ gouvernanceDepartementCode: DEPT, id: MEMBRE_SOURCE, structureId: SOURCE })
    await creerUnMembre({ gouvernanceDepartementCode: DEPT, id: 'transfert-test-cible', structureId: CIBLE })

    // WHEN
    const result = await transferer()

    // THEN
    expect(result).toBe('transfertCreeraitDoublonMembre')
    await expect(structureIdDuMembre(MEMBRE_SOURCE)).resolves.toBe(SOURCE) // inchangé
    await expect(dernierAudit()).resolves.toBeUndefined()
  })

  it('retourne structureIntrouvable quand la cible n’existe pas', async () => {
    // GIVEN
    await seedBaseEtStructures()
    await creerUnMembre({ gouvernanceDepartementCode: DEPT, id: MEMBRE_SOURCE, structureId: SOURCE })

    // WHEN
    const result = await new PrismaMembreTransfertRepository().transferer({
      idCible: 999999,
      idMembre: MEMBRE_SOURCE,
      idSource: SOURCE,
      parUtilisateur: 'admin-test',
    })

    // THEN
    expect(result).toBe('structureIntrouvable')
    await expect(structureIdDuMembre(MEMBRE_SOURCE)).resolves.toBe(SOURCE)
  })
})

async function transferer(): Promise<string> {
  return new PrismaMembreTransfertRepository().transferer({
    idCible: CIBLE,
    idMembre: MEMBRE_SOURCE,
    idSource: SOURCE,
    parUtilisateur: 'admin-test',
  })
}

async function seedBaseEtStructures(): Promise<void> {
  await creerUneRegion({ code: REGION, nom: 'Région de test transfert' })
  await creerUnDepartement({ code: DEPT, nom: 'Département de test transfert', regionCode: REGION })
  await creerUneGouvernance({ departementCode: DEPT })
  await creerUneStructure({ id: SOURCE, siret: '99000100000001' })
  await creerUneStructure({ id: CIBLE, siret: '99000100000002' })
}

async function lier(contactId: number, structureId: number): Promise<void> {
  await prisma.contact_structure_administrative.create({
    data: { contact_id: contactId, structure_administrative_id: structureId },
  })
}

async function structureIdDuMembre(id: string): Promise<number | undefined> {
  const membre = await prisma.membreRecord.findUnique({ where: { id } })
  return membre?.structureId
}

async function structuresDesUtilisateurs(ssoIds: ReadonlyArray<string>): Promise<ReadonlyArray<null | number>> {
  const utilisateurs = await prisma.utilisateurRecord.findMany({
    orderBy: { ssoId: 'asc' },
    where: { ssoId: { in: [...ssoIds] } },
  })
  return utilisateurs.map((utilisateur) => utilisateur.structureId)
}

async function contactsDe(structureId: number): Promise<ReadonlyArray<number>> {
  const liens = await prisma.contact_structure_administrative.findMany({
    where: { structure_administrative_id: structureId },
  })
  return liens.map((lien) => lien.contact_id).sort((un, autre) => un - autre)
}

async function sourceEstSupprimee(): Promise<boolean> {
  const structure = await prisma.main_structure_administrative.findUnique({ where: { id: SOURCE } })
  return structure?.deleted_at !== null
}

async function dernierAudit(): Promise<Record<string, unknown> | undefined> {
  const lignes = await prisma.membreTransfertLogRecord.findMany({
    orderBy: { id: 'desc' },
    where: { structureSourceId: SOURCE },
  })
  return lignes.at(0) as Record<string, unknown> | undefined
}

async function nettoyer(): Promise<void> {
  await prisma.membreTransfertLogRecord.deleteMany({ where: { structureSourceId: { in: [SOURCE, CIBLE] } } })
  await prisma.membreRecord.deleteMany({ where: { structureId: { in: [SOURCE, CIBLE] } } })
  await prisma.utilisateurRecord.deleteMany({ where: { structureId: { in: [SOURCE, CIBLE] } } })
  await prisma.contact_structure_administrative.deleteMany({
    where: { structure_administrative_id: { in: [SOURCE, CIBLE] } },
  })
  await prisma.main_contact.deleteMany({ where: { nom: 'TransfertTestContact' } })
  await prisma.main_structure_administrative.deleteMany({ where: { id: { in: [SOURCE, CIBLE] } } })
  await prisma.gouvernanceRecord.deleteMany({ where: { departementCode: DEPT } })
  await prisma.departementRecord.deleteMany({ where: { code: DEPT } })
  await prisma.regionRecord.deleteMany({ where: { code: REGION } })
}
