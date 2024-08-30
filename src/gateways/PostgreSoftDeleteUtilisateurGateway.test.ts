import { Prisma } from '@prisma/client'

import { PostgresSoftDeleteUtilisateurGateway } from './PostgreSoftDeleteUtilisateurGateway'
import prisma from '../../prisma/prismaClient'

const emailUtilisateurExistant = 'martin.tartempion@example.net'
const emailUtilisateurSupprime = 'tanguy.liauradaisaume@example.net'
const utilisateurExistant: Partial<Prisma.UtilisateurRecordCreateInput> = {
  email: emailUtilisateurExistant,
  isSupprime: false,
}
const utilisateurSupprime: Partial<Prisma.UtilisateurRecordCreateInput> = {
  email: emailUtilisateurSupprime,
  isSupprime: true,
  sub: 'adc38b16-b303-487e-b1c0-8d33bcb6d0e6',
}

describe('suppression "soft delete" d’un compte utilisateur', () => {

  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('compte existant, non préalablement supprimé : l’entrée est marquée comme supprimée', async () => {
    // GIVEN
    await prisma.utilisateurRecord.create({
      data: utilisateurRecordFactory(utilisateurExistant),
    })
    await prisma.utilisateurRecord.create({
      data: utilisateurRecordFactory(utilisateurSupprime),
    })

    // WHEN
    const result = await new PostgresSoftDeleteUtilisateurGateway(prisma).delete(emailUtilisateurExistant)

    // THEN
    expect(result).toBe(true)
  })

  it('compte existant, préalablement supprimé : aucune écriture', async () => {
    // GIVEN
    await prisma.utilisateurRecord.create({
      data: utilisateurRecordFactory(utilisateurExistant),
    })
    await prisma.utilisateurRecord.create({
      data: utilisateurRecordFactory(utilisateurSupprime),
    })

    // WHEN
    const result = await new PostgresSoftDeleteUtilisateurGateway(prisma).delete(emailUtilisateurSupprime)

    // THEN
    expect(result).toBe(false)
  })

  it('compte inexistant : aucune écriture', async () => {
    // GIVEN
    await prisma.utilisateurRecord.create({
      data: utilisateurRecordFactory(utilisateurSupprime),
    })

    // WHEN
    const result = await new PostgresSoftDeleteUtilisateurGateway(prisma).delete(emailUtilisateurExistant)

    // THEN
    expect(result).toBe(false)
  })

  it('erreur inattendue : non gérée', async () => {
    // GIVEN
    const prismaClientKnownRequestErrorOnUpdateStub = {
      utilisateurRecord: {
        async update(): Promise<never> {
          return Promise.reject(new Prisma.PrismaClientKnownRequestError('', { clientVersion: '', code: 'P1000' }))
        },
      },
    } as unknown as typeof prisma
    const prismaClientUnknownRequestErrorOnUpdateStub = {
      utilisateurRecord: {
        async update(): Promise<never> {
          return Promise.reject(new Error('error'))
        },
      },
    } as unknown as typeof prisma

    // WHEN
    const unhandledKnownRequestError =
      new PostgresSoftDeleteUtilisateurGateway(prismaClientKnownRequestErrorOnUpdateStub)
        .delete(emailUtilisateurExistant)
    const unhandledUnknownRequestError =
      new PostgresSoftDeleteUtilisateurGateway(prismaClientUnknownRequestErrorOnUpdateStub)
        .delete(emailUtilisateurExistant)

    // THEN
    await expect(unhandledKnownRequestError).rejects.toMatchObject({ code: 'P1000' })
    await expect(unhandledUnknownRequestError).rejects.toStrictEqual(new Error('error'))
  })
})

function utilisateurRecordFactory(
  override: Partial<Prisma.UtilisateurRecordCreateInput>
): Prisma.UtilisateurRecordCreateInput {
  return {
    dateDeCreation: new Date(0),
    email: emailUtilisateurExistant,
    inviteLe: new Date(0),
    isSupprime: false,
    nom: 'Tartempion',
    prenom: 'Martin',
    role: 'gestionnaire_region',
    sub: '8e39c6db-2f2a-45cf-ba65-e2831241cbe4',
    telephone: '0102030405',
    ...override,
  }
}
