'use server'

import prisma from '../../../../prisma/prismaClient'
import { TypologieRole } from '@/domain/Role'
import { PostgreUtilisateurRepository } from '@/gateways/PostgreUtilisateurRepository'
import { getSession } from '@/gateways/ProConnectAuthentificationGateway'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ChangerMonRole, ChangerMonRoleFailure } from '@/use-cases/commands/ChangerMonRole'

export async function changerMonRoleAction(nouveauRole: TypologieRole): ResultAsync<ChangerMonRoleFailure> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const utilisateurUid = (await getSession())!.user.sub
  return new ChangerMonRole(new PostgreUtilisateurRepository(prisma))
    .execute({ nouveauRole, utilisateurUid })
}
