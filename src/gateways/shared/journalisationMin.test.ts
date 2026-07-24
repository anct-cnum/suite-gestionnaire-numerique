import { randomUUID } from 'node:crypto'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { contexteJournalisationMin } from './contexteJournalisationMin'
import {
  journaliserCreateBrut,
  journaliserDeleteBrut,
  journaliserTransaction,
  journaliserUpdateBrut,
  selectionLigne,
} from './journalisationMin'
import prisma from '../../../prisma/prismaClient'
import { creerUnUtilisateur } from '../testHelper'
import { epochTimePlusOneDay } from '@/shared/testHelper'

// Données namespacées (codes/ids dédiés) pour ne pas entrer en collision avec les autres
// fichiers de test ; nettoyage explicite (les écritures commitent réellement).
const REGION = 'J1'
const SSO = 'journalisation-test-sso'
// La table d'audit est en append-only : on ne supprime JAMAIS ses lignes, y compris en test.
// L'isolation se fait par un run_id unique par test, sur lequel les lectures sont filtrées.
let runId = ''

describe('journalisation des événements MIN (source.min__evenements)', () => {
  beforeAll(async () => {
    // Le schéma source est hors Prisma (créé par une migration externe) : on le
    // provisionne pour la base de test, comme le fait PrismaDonneesStructureLoader.test.
    await prisma.$executeRaw`CREATE SCHEMA IF NOT EXISTS source`
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS source.min__evenements (
      id BIGSERIAL PRIMARY KEY,
      run_id TEXT NOT NULL,
      ingested_at TIMESTAMPTZ DEFAULT now(),
      source_key TEXT NOT NULL,
      donnee JSONB NOT NULL
    )`
  })

  beforeEach(() => {
    runId = `journalisation-test-${randomUUID()}`
  })

  afterEach(async () => {
    await prisma.regionRecord.deleteMany({ where: { code: REGION } })
    await prisma.utilisateurRecord.deleteMany({ where: { ssoId: SSO } })
  })

  it('journalise un create avec le snapshot complet, l’acteur résolu et le runId du contexte', async () => {
    // GIVEN
    const acteur = await creerActeur()

    // WHEN
    await avecContexte(async () => prisma.regionRecord.create({ data: { code: REGION, nom: 'Journalisation' } }))

    // THEN
    const [evenement] = await lireEvenements()
    expect(evenement.runId).toBe(runId)
    expect(evenement.sourceKey).toBe('min.region')
    expect(evenement.donnee).toStrictEqual({
      action: 'create',
      entity_id: REGION,
      user_id: acteur,
      value: { code: REGION, nom: 'Journalisation' },
    })
  })

  it('journalise un update avec old et new limités aux colonnes modifiées', async () => {
    // GIVEN
    await creerActeur()
    await prisma.regionRecord.create({ data: { code: REGION, nom: 'Avant' } })

    // WHEN
    await avecContexte(async () => prisma.regionRecord.update({ data: { nom: 'Après' }, where: { code: REGION } }))

    // THEN
    const [evenement] = await lireEvenements()
    expect(evenement.donnee.action).toBe('update')
    expect(evenement.donnee.value).toStrictEqual({ new: { nom: 'Après' }, old: { nom: 'Avant' } })
  })

  it('journalise un delete avec le snapshot de la ligne supprimée', async () => {
    // GIVEN
    await creerActeur()
    await prisma.regionRecord.create({ data: { code: REGION, nom: 'Journalisation' } })

    // WHEN
    await avecContexte(async () => prisma.regionRecord.delete({ where: { code: REGION } }))

    // THEN
    const [evenement] = await lireEvenements()
    expect(evenement.donnee.action).toBe('delete')
    expect(evenement.donnee.value).toStrictEqual({ code: REGION, nom: 'Journalisation' })
  })

  it('n’émet aucun événement quand seule derniere_connexion change sur min.utilisateur', async () => {
    // GIVEN
    await creerActeur()

    // WHEN
    await avecContexte(async () =>
      prisma.utilisateurRecord.updateMany({
        data: { derniereConnexion: epochTimePlusOneDay },
        where: { ssoId: SSO },
      })
    )

    // THEN
    await expect(lireEvenements()).resolves.toStrictEqual([])
  })

  it('n’émet aucun événement hors contexte de journalisation', async () => {
    // GIVEN
    await creerActeur()

    // WHEN
    await prisma.regionRecord.create({ data: { code: REGION, nom: 'Journalisation' } })

    // THEN
    await expect(lireEvenements()).resolves.toStrictEqual([])
  })

  it('écrit les événements d’une transaction après commit', async () => {
    // GIVEN
    await creerActeur()

    // WHEN
    await avecContexte(async () =>
      journaliserTransaction(prisma, async (transaction) => {
        await transaction.regionRecord.create({ data: { code: REGION, nom: 'Journalisation' } })
      })
    )

    // THEN
    const [evenement] = await lireEvenements()
    expect(evenement.donnee.action).toBe('create')
  })

  it('jette les événements d’une transaction qui rollback', async () => {
    // GIVEN
    await creerActeur()

    // WHEN
    const promesse = avecContexte(async () =>
      journaliserTransaction(prisma, async (transaction) => {
        await transaction.regionRecord.create({ data: { code: REGION, nom: 'Journalisation' } })
        throw new Error('rollback')
      })
    )

    // THEN
    await expect(promesse).rejects.toThrow('rollback')
    await expect(lireEvenements()).resolves.toStrictEqual([])
    await expect(prisma.regionRecord.findFirst({ where: { code: REGION } })).resolves.toBeNull()
  })

  it('journalise les écritures en SQL brut : create, update (diff) et delete (snapshot)', async () => {
    // GIVEN
    const acteur = await creerActeur()

    // WHEN
    await avecContexte(async () =>
      prisma.$transaction(async (transaction) => {
        await journaliserUpdateBrut(
          transaction,
          'min.utilisateur',
          selectionLigne('min.utilisateur', acteur),
          async () => transaction.$executeRaw`UPDATE min.utilisateur SET nom = 'Modifié' WHERE id = ${acteur}`
        )
        await transaction.$executeRaw`INSERT INTO min.region (code, nom) VALUES (${REGION}, 'Journalisation')`
        await journaliserCreateBrut(transaction, 'min.utilisateur', acteur)
        await journaliserDeleteBrut(
          transaction,
          'min.utilisateur',
          selectionLigne('min.utilisateur', acteur),
          async () => Promise.resolve()
        )
      })
    )

    // THEN
    const [update, create, suppression] = await lireEvenements()
    expect(update.donnee.action).toBe('update')
    expect(update.donnee.value).toStrictEqual({ new: { nom: 'Modifié' }, old: { nom: 'Tartempion' } })
    expect(create.donnee.action).toBe('create')
    expect((create.donnee.value as Readonly<Record<string, unknown>>).nom).toBe('Modifié')
    expect(suppression.donnee.action).toBe('delete')
    expect(suppression.donnee.entity_id).toBe(String(acteur))
  })
})

type Donnee = Readonly<{
  action: string
  entity_id: string
  user_id: number
  value: unknown
}>

type LigneEvenement = Readonly<{
  donnee: Donnee
  runId: string
  sourceKey: string
}>

async function avecContexte<Retour>(fn: () => Promise<Retour>): Promise<Retour> {
  return contexteJournalisationMin.run(
    {
      actorId: undefined,
      bufferTransaction: null,
      clientTransaction: null,
      async resoudreSub() {
        return Promise.resolve(SSO)
      },
      runId,
    },
    fn
  )
}

async function creerActeur(): Promise<number> {
  await creerUnUtilisateur({ ssoEmail: 'journalisation.test@example.com', ssoId: SSO })
  const utilisateur = await prisma.utilisateurRecord.findFirst({ where: { ssoId: SSO } })

  return utilisateur?.id ?? -1
}

async function lireEvenements(): Promise<ReadonlyArray<LigneEvenement>> {
  return prisma.$queryRaw<Array<LigneEvenement>>`
    SELECT run_id AS "runId", source_key AS "sourceKey", donnee
    FROM source.min__evenements WHERE run_id = ${runId} ORDER BY id
  `
}
