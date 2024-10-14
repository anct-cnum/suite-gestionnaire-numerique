'use server'

import { redirect } from 'next/navigation'

import prisma from '../../../../prisma/prismaClient'
import { TypologieRole } from '@/domain/Role'
import { PostgreUtilisateurRepository } from '@/gateways/PostgreUtilisateurRepository'
import { getSession } from '@/gateways/ProConnectAuthentificationGateway'
import { ChangerMonRole } from '@/use-cases/commands/ChangerMonRole'

export async function changerMonRoleAction(nouveauRole: TypologieRole): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const utilisateurUid = (await getSession())!.user.sub
  await new ChangerMonRole(new PostgreUtilisateurRepository(prisma))
    .execute({ nouveauRole, utilisateurUid })
    .then(redirect('/'))
}
