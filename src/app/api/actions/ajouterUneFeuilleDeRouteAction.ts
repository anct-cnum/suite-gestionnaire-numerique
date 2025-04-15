'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaFeuilleDeRouteRepository } from '@/gateways/PrismaFeuilleDeRouteRepository'
import { PrismaGouvernanceRepository } from '@/gateways/PrismaGouvernanceRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { AjouterUneFeuilleDeRoute } from '@/use-cases/commands/AjouterUneFeuilleDeRoute'

export async function ajouterUneFeuilleDeRouteAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const result = await new AjouterUneFeuilleDeRoute(
    new PrismaGouvernanceRepository(),
    new PrismaUtilisateurRepository(prisma.utilisateurRecord),
    new PrismaFeuilleDeRouteRepository(),
    new Date()
  ).handle({
    nom: actionParams.nom,
    perimetreGeographique: actionParams.perimetre,
    uidEditeur: await getSessionSub(),
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
  uidGouvernance: string
  uidPorteur: string
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
