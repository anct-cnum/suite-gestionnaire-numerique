'use server'

import { z, ZodIssue } from 'zod'

import { emailInvitationGatewayFactory } from './shared/emailInvitationGatewayFactory'
import prisma from '../../../../prisma/prismaClient'
import { Roles } from '@/domain/Role'
import { getSubSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import {
  InviterUnUtilisateurCommand,
  InviterUnUtilisateur,
  InviterUnUtilisateurFailure,
} from '@/use-cases/commands/InviterUnUtilisateur'

export async function inviterUnUtilisateurAction(
  actionParams: ActionParams
): ResultAsync<InviterUnUtilisateurFailure | ReadonlyArray<ZodIssue>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues
  }

  let command: InviterUnUtilisateurCommand = {
    email: validationResult.data.email,
    nom: validationResult.data.nom,
    prenom: validationResult.data.prenom,
    uidUtilisateurCourant: await getSubSession(),
  }

  if (validationResult.data.role) {
    command = {
      ...command,
      role: {
        organisation: validationResult.data.organisation,
        type: validationResult.data.role,
      },
    }
  }

  return new InviterUnUtilisateur(new PrismaUtilisateurRepository(prisma), emailInvitationGatewayFactory).execute(
    command
  )
}

type ActionParams = Readonly<{
  prenom: string
  nom: string
  email: string
  organisation?: string
  role?: string
}>

const validator = z.object({
  email: z.string().email({ message: 'L’email doit être valide' }),
  nom: z.string().min(1, { message: 'Le nom doit contenir au moins 1 caractère' }),
  organisation: z.string().min(1, { message: 'L’organisation doit être renseignée' }).optional(),
  prenom: z.string().min(1, { message: 'Le prénom doit contenir au moins 1 caractère' }),
  role: z.enum(Roles, { message: 'Le rôle n’est pas correct' }).optional(),
})

