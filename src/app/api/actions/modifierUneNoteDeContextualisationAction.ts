'use server'

import { revalidatePath } from 'next/cache'
import sanitize from 'sanitize-html'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { sanitizeDefaultOptions } from '@/app/shared/sanitizeDefaultOptions'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaFeuilleDeRouteRepository } from '@/gateways/PrismaFeuilleDeRouteRepository'
import { PrismaGouvernanceRepository } from '@/gateways/PrismaGouvernanceRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ModifierUneNoteDeContextualisation } from '@/use-cases/commands/ModifierUneNoteDeContextualisation'

export async function modifierUneNoteDeContextualisationAction(
  actionParam: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParam)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }
  const result = await new ModifierUneNoteDeContextualisation(
    new PrismaFeuilleDeRouteRepository(),
    new PrismaGouvernanceRepository(),
    new PrismaUtilisateurRepository(prisma.utilisateurRecord),
    new Date()
  ).handle({
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
})
