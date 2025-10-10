'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import departements from '../../../../ressources/departements.json'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ChangerMonDepartement } from '@/use-cases/commands/ChangerMonDepartement'

export async function changerMonDepartementAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const uid = await getSessionSub()

  const message = await new ChangerMonDepartement(new PrismaUtilisateurRepository(prisma.utilisateurRecord))
    .handle({
      nouveauCodeDepartement: validationResult.data.nouveauCodeDepartement,
      uidUtilisateurCourant: uid,
    })

  revalidatePath(actionParams.path)

  return [message]
}

type ActionParams = Readonly<{
  nouveauCodeDepartement: string
  path: string
}>

const codesDepartements = departements.map((departement) => departement.code) as [string, ...Array<string>]

const validator = z.object({
  nouveauCodeDepartement: z.enum(codesDepartements, { message: 'Le code département n\'est pas correct' }),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
