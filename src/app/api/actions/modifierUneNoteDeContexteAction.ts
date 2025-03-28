'use server'

import { revalidatePath } from 'next/cache'
import sanitize from 'sanitize-html'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { sanitizeDefaultOptions } from '@/app/shared/sanitizeDefaultOptions'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaGouvernanceRepository } from '@/gateways/PrismaGouvernanceRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ModifierUneNoteDeContexte } from '@/use-cases/commands/ModifierUneNoteDeContexte'

export async function modifierUneNoteDeContexteAction(
  actionParam: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParam)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const modifierUneNoteDeContexte = new ModifierUneNoteDeContexte(
    new PrismaGouvernanceRepository(),
    new PrismaUtilisateurRepository(prisma.utilisateurRecord),
    new Date()
  )
  const result = await modifierUneNoteDeContexte.handle({
    contenu: sanitize(actionParam.contenu, sanitizeDefaultOptions),
    uidEditeur: await getSessionSub(),
    uidGouvernance: actionParam.uidGouvernance,
  })
  revalidatePath(validationResult.data.path)
  return [result]
}

type ActionParams = Readonly<{
  contenu: string
  path: string
  uidGouvernance: string
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
