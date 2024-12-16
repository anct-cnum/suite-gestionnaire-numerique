'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { emailInvitationGatewayFactory } from './shared/emailInvitationGatewayFactory'
import prisma from '../../../../prisma/prismaClient'
import { Roles } from '@/domain/Role'
import { getSubSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { InviterUnUtilisateur } from '@/use-cases/commands/InviterUnUtilisateur'

export async function inviterUnUtilisateurAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const message = await new InviterUnUtilisateur(
    new PrismaUtilisateurRepository(prisma),
    emailInvitationGatewayFactory
  ).execute({
    email: validationResult.data.email,
    nom: validationResult.data.nom,
    prenom: validationResult.data.prenom,
    role: validationResult.data.role ? {
      codeOrganisation: validationResult.data.codeOrganisation,
      type: validationResult.data.role,
    } : undefined,
    uidUtilisateurCourant: await getSubSession(),
  })

  revalidatePath(validationResult.data.path)

  return [message]
}

type ActionParams = Readonly<{
  email: string
  codeOrganisation?: string
  nom: string
  role?: string
  path: string
  prenom: string
}>

const validator = z.object({
  codeOrganisation: z
    .string()
    .min(1, { message: 'Le code organisation doit être renseigné' })
    .optional(),
  email: z.string().email({ message: 'L’email doit être valide' }),
  nom: z.string().min(1, { message: 'Le nom doit contenir au moins 1 caractère' }),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  prenom: z.string().min(1, { message: 'Le prénom doit contenir au moins 1 caractère' }),
  role: z.enum(Roles, { message: 'Le rôle n’est pas correct' }).optional(),
})
