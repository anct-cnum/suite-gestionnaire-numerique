'use server'

import { revalidatePath } from 'next/cache'
import sanitize from 'sanitize-html'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { sanitizeDefaultOptions } from '@/app/shared/sanitizeDefaultOptions'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { AjouterUneNoteDeContextualisation } from '@/use-cases/commands/AjouterUneNoteDeContextualisation'
import { PrismaFeuilleDeRouteRepository } from '@/gateways/PrismaFeuilleDeRouteRepository'

export async function ajouterUneNoteDeContextualisationAction(
  actionParam: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParam)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const ajouterUneNoteDeContextualisation = new AjouterUneNoteDeContextualisation(
    new PrismaFeuilleDeRouteRepository(),
    new PrismaUtilisateurRepository(prisma.utilisateurRecord),
    new Date()
  )
  const result = await ajouterUneNoteDeContextualisation.handle({
    contenu: sanitize(actionParam.contenu, sanitizeDefaultOptions),
    uidEditeur: await getSessionSub(),
    uidFeuilleDeRoute: actionParam.uidFeuilleDeRoute,
  })
  revalidatePath(validationResult.data.path)
  return [result]
}

type ActionParams = Readonly<{
  contenu: string
  path: string
  uidFeuilleDeRoute: string
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  contenu: z.string().min(1, { message: 'Le contenu doit être renseigné' }),
})
