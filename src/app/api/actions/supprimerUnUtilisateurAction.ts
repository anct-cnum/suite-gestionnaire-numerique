'use server'

import prisma from '../../../../prisma/prismaClient'
import { PostgresSoftDeleteUtilisateurGateway } from '@/gateways/PostgreSoftDeleteUtilisateurGateway'
import { PostgreUtilisateurRepository } from '@/gateways/PostgreUtilisateurRepository'
import { getSession } from '@/gateways/ProConnectAuthentificationGateway'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { SupprimerUnUtilisateur, SupprimerUnUtilisateurFailure } from '@/use-cases/commands/SupprimerUnUtilisateur'

export async function supprimerUnUtilisateurAction(
  utilisateurASupprimerUid: string
): ResultAsync<SupprimerUnUtilisateurFailure> {
  const command = new SupprimerUnUtilisateur(
    new PostgreUtilisateurRepository(prisma, new PostgresSoftDeleteUtilisateurGateway(prisma))
  )
  return command.execute({
    utilisateurASupprimerUid,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    utilisateurCourantUid: (await getSession())!.user.sub,
  })
}
