'use server'
import { revalidatePath } from 'next/cache'
import sanitize from 'sanitize-html'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaGouvernanceRepository } from '@/gateways/PrismaGouvernanceRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { AjouterNoteDeContexteAGouvernance } from '@/use-cases/commands/AjouterNoteDeContexteAGouvernance'

export async function ajouterUneNoteDeContexteAction(
  actionParam: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParam)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const ajouterNoteDeContexteAGouvernance = new AjouterNoteDeContexteAGouvernance(
    new PrismaGouvernanceRepository(prisma.gouvernanceRecord, prisma.noteDeContexteRecord),
    new PrismaUtilisateurRepository(prisma.utilisateurRecord),
    new Date()
  )
  const result = await ajouterNoteDeContexteAGouvernance.execute({
    contenu: sanitize(actionParam.contenu, defaultOptions),
    uidEditeur: await getSessionSub(),
    uidGouvernance: actionParam.uidGouvernance,
  })
  revalidatePath(validationResult.data.path)
  return [result]
}

type ActionParams = Readonly<{
  contenu: string
  uidGouvernance: string
  path: string
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})

const defaultOptions = {
  allowedAttributes: {
    /* eslint-disable id-length */
    a: ['href'],
  },
  allowedTags: [
    'p',
    'h2',
    'h3',
    'h4',
    'b',
    'strong',
    'i',
    'em',
    'ul',
    'ol',
    'li',
    'a',
  ],
}
