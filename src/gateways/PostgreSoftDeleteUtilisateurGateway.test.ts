import { Prisma } from '@prisma/client'

import { PostgresSoftDeleteUtilisateurGateway } from './PostgreSoftDeleteUtilisateurGateway'
import { utilisateurRecordFactory } from './testHelper'
import prisma from '../../prisma/prismaClient'

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
    const result = await new PostgresSoftDeleteUtilisateurGateway(prisma).delete(ssoIdUtilisateurExistant)

    // THEN
    expect(result).toBe(true)
    const utilisateurModifie = await prisma.utilisateurRecord.findUnique({
      where: { ssoId: utilisateurExistant.ssoId },
    })
    const utilisateurRecord = utilisateurRecordFactory({ isSupprime: true })
    expect(utilisateurModifie).toMatchObject(utilisateurRecord)
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
    const result = await new PostgresSoftDeleteUtilisateurGateway(prisma).delete(ssoIdUtilisateurSupprime)

    // THEN
    expect(result).toBe(false)
    const utilisateurModifie = await prisma.utilisateurRecord.findUnique({
      where: { ssoId: utilisateurExistant.ssoId },
    })
    expect(utilisateurModifie?.isSupprime).toBe(false)
  })

  it('compte inexistant : aucune écriture', async () => {
    // GIVEN
    await prisma.utilisateurRecord.create({
      data: utilisateurRecordFactory(utilisateurSupprime),
    })

    // WHEN
    const result = await new PostgresSoftDeleteUtilisateurGateway(prisma).delete(ssoIdUtilisateurExistant)

    // THEN
    expect(result).toBe(false)
    const utilisateurModifie = await prisma.utilisateurRecord.findUnique({
      where: { ssoId: utilisateurSupprime.ssoId },
    })
    expect(utilisateurModifie?.isSupprime).toBe(true)
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
        .delete(ssoIdUtilisateurExistant)
    const unhandledUnknownRequestError =
      new PostgresSoftDeleteUtilisateurGateway(prismaClientUnknownRequestErrorOnUpdateStub)
        .delete(ssoIdUtilisateurExistant)

    // THEN
    await expect(unhandledKnownRequestError).rejects.toMatchObject({ code: 'P1000' })
    await expect(unhandledUnknownRequestError).rejects.toStrictEqual(new Error('error'))
  })
})

const ssoIdUtilisateurExistant = '8e39c6db-2f2a-45cf-ba65-e2831241cbe4'
const ssoIdUtilisateurSupprime = 'adc38b16-b303-487e-b1c0-8d33bcb6d0e6'
const utilisateurExistant: Partial<Prisma.UtilisateurRecordCreateInput> = {
  isSupprime: false,
  ssoId: ssoIdUtilisateurExistant,
}
const utilisateurSupprime: Partial<Prisma.UtilisateurRecordCreateInput> = {
  isSupprime: true,
  ssoId: ssoIdUtilisateurSupprime,
}
