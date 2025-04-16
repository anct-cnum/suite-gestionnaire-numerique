'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaFeuilleDeRouteRepository } from '@/gateways/PrismaFeuilleDeRouteRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { SupprimerUneNoteDeContextualisation } from '@/use-cases/commands/SupprimerUneNoteDeContextextualisation'

export async function supprimerUneNoteDeContextualisationAction(
  actionParam: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParam)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const supprimerUneNoteDeContextextualisation = new SupprimerUneNoteDeContextualisation(
    new PrismaFeuilleDeRouteRepository(),
    new PrismaUtilisateurRepository(prisma.utilisateurRecord)
  )
  const result = await supprimerUneNoteDeContextextualisation.handle({
    uidEditeur: await getSessionSub(),
    uidFeuilleDeRoute: actionParam.uidFeuilleDeRoute,
  })

  revalidatePath(validationResult.data.path)
  return [result]
}

type ActionParams = Readonly<{
  path: string
  uidFeuilleDeRoute: string
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
