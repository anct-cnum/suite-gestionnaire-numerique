'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { emailInvitationGatewayFactory } from './shared/emailInvitationGatewayFactory'
import prisma from '../../../../prisma/prismaClient'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaContactReferentFneLoader } from '@/gateways/PrismaContactReferentFneLoader'
import { PrismaGouvernanceRepository } from '@/gateways/PrismaGouvernanceRepository'
import { PrismaMembreRepository } from '@/gateways/PrismaMembreRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { AccepterUnMembre } from '@/use-cases/commands/AccepterUnMembre'
import { InviterContactsReferentsFne } from '@/use-cases/commands/InviterContactsReferentsFne'

export async function accepterUnMembreAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const membreRepository = new PrismaMembreRepository()
  const utilisateurRepository = new PrismaUtilisateurRepository(prisma.utilisateurRecord)
  const uidUtilisateurCourant = await getSessionSub()

  const result = await new AccepterUnMembre(
    utilisateurRepository,
    new PrismaGouvernanceRepository(),
    membreRepository
  ).handle({
    uidGestionnaire: uidUtilisateurCourant,
    uidGouvernance: actionParams.uidGouvernance,
    uidMembrePotentiel: actionParams.uidMembrePotentiel,
  })

  if (result === 'OK') {
    const structureId = await membreRepository.getStructureId(actionParams.uidMembrePotentiel)

    await new InviterContactsReferentsFne(
      utilisateurRepository,
      new PrismaContactReferentFneLoader(),
      emailInvitationGatewayFactory,
      new Date()
    ).handle({
      structureId,
      uidUtilisateurCourant,
    })
  }

  revalidatePath(validationResult.data.path)

  return [result]
}

type ActionParams = Readonly<{
  path: string
  uidGouvernance: string
  uidMembrePotentiel: string
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
