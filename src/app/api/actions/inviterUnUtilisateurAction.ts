'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { emailInvitationGatewayFactory } from './shared/emailInvitationGatewayFactory'
import prisma from '../../../../prisma/prismaClient'
import { Roles } from '@/domain/Role'
import { getSubSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import {
  InviterUnUtilisateurCommand,
  InviterUnUtilisateur,
} from '@/use-cases/commands/InviterUnUtilisateur'

export async function inviterUnUtilisateurAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  let command: InviterUnUtilisateurCommand = {
    emailDeContact: validationResult.data.emailDeContact,
    nom: validationResult.data.nom,
    prenom: validationResult.data.prenom,
    uidUtilisateurCourant: await getSubSession(),
  }

  if (validationResult.data.role) {
    command = {
      ...command,
      role: {
        codeOrganisation: validationResult.data.codeOrganisation,
        type: validationResult.data.role,
      },
    }
  }
  const result = await new InviterUnUtilisateur(
    new PrismaUtilisateurRepository(prisma),
    emailInvitationGatewayFactory
  ).execute(command)

  if (result === 'OK') {
    revalidatePath('/mes-utilisateurs')
  }

  return [result]
}

type ActionParams = Readonly<{
  prenom: string
  nom: string
  emailDeContact: string
  codeOrganisation?: string
  role?: string
}>

const validator = z.object({
  codeOrganisation: z
    .string()
    .min(1, { message: 'Le code organisation doit être renseigné' })
    .optional(),
  emailDeContact: z.string().email({ message: 'L’email doit être valide' }),
  nom: z.string().min(1, { message: 'Le nom doit contenir au moins 1 caractère' }),
  prenom: z.string().min(1, { message: 'Le prénom doit contenir au moins 1 caractère' }),
  role: z.enum(Roles, { message: 'Le rôle n’est pas correct' }).optional(),
})
