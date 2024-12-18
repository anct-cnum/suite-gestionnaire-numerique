'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { Frequences, Types } from '@/domain/Gouvernance'
import { getSubSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaGouvernanceRepository } from '@/gateways/PrismaGouvernanceRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { AjouterUnComite } from '@/use-cases/commands/AjouterUnComite'

export async function ajouterUnComiteAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const result = await new AjouterUnComite(
    new PrismaGouvernanceRepository(prisma),
    new PrismaUtilisateurRepository(prisma)
  ).execute({
    commentaire: validationResult.data.commentaire,
    date: validationResult.data.date?.toJSON(),
    frequence: validationResult.data.frequence,
    type: validationResult.data.type,
    uidGouvernance: validationResult.data.uidGouvernance,
    uidUtilisateur: await getSubSession(),
  })

  revalidatePath(validationResult.data.path)

  return [result]
}

type ActionParams = Readonly<{
  commentaire?: string
  date?: string
  frequence: string
  path: string
  type: string
  uidGouvernance: string
}>

const validator = z.object({
  commentaire: z.string()
    .min(1, { message: 'Le commentaire doit contenir au moins 1 caractère' })
    .max(500, { message: 'Le commentaire doit contenir au maximum 500 caractères' })
    .optional(),
  date: z
    .coerce.date().refine((data) => data > new Date(), { message: 'La date doit être dans le futur' })
    .optional(),
  frequence: z.enum(Frequences, { message: 'La fréquence du comité est invalide' }),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  type: z.enum(Types, { message: 'Le type de comité est invalide' }),
  uidGouvernance: z.string().min(1, { message: 'L’identifiant de la gouvernance doit être renseigné' }),
})
