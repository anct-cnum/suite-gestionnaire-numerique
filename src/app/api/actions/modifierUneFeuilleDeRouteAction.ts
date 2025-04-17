'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaFeuilleDeRouteRepository } from '@/gateways/PrismaFeuilleDeRouteRepository'
import { PrismaGouvernanceRepository } from '@/gateways/PrismaGouvernanceRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ModifierUneFeuilleDeRoute } from '@/use-cases/commands/ModifierUneFeuilleDeRoute'

export async function modifierUneFeuilleDeRouteAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const result = await new ModifierUneFeuilleDeRoute(
    new PrismaFeuilleDeRouteRepository(),
    new PrismaGouvernanceRepository(),
    new PrismaUtilisateurRepository(prisma.utilisateurRecord),
    new Date()
  ).handle({
    nom: actionParams.nom,
    perimetreGeographique: actionParams.perimetre,
    uidEditeur: await getSessionSub(),
    uidFeuilleDeRoute: actionParams.uidFeuilleDeRoute,
    uidGouvernance: actionParams.uidGouvernance,
    uidPorteur: actionParams.uidPorteur,
  })

  revalidatePath(validationResult.data.path)

  return [result]
}

type ActionParams = Readonly<{
  nom: string
  path: string
  perimetre: string
  uidFeuilleDeRoute: string
  uidGouvernance: string
  uidPorteur: string
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
