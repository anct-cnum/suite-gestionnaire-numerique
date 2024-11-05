'use server'

import { z, ZodIssue } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import {
  InviterUnUtilisateurCommand,
  InviterUnUtilisateur, InviterUnUtilisateurFailure,
} from '../../../use-cases/commands/InviterUnUtilisateur'
import { Roles } from '@/domain/Role'
import { PostgreUtilisateurRepository } from '@/gateways/PostgreUtilisateurRepository'
import { getSession } from '@/gateways/ProConnectAuthentificationGateway'
import { ResultAsync } from '@/use-cases/CommandHandler'

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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    uidUtilisateurCourant: (await getSession())!.user.sub,
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

  return new InviterUnUtilisateur(new PostgreUtilisateurRepository(prisma)).execute(command)
}

export type ActionParams = Partial<Readonly<{
  prenom: string
  nom: string
  email: string
  organisation?: string
  role?: string
}>>

const validator = z.object({
  email: z.string().email({ message: 'L’email doit être valide' }),
  nom: z.string().min(1, { message: 'Le nom doit contenir au moins 1 caractère' }),
  organisation: z.string().min(1, { message: 'L’organisation doit être renseignée' }).optional(),
  prenom: z.string().min(1, { message: 'Le prénom doit contenir au moins 1 caractère' }),
  role: z.enum(Roles, { message: 'Le rôle n’est pas correct' }).optional(),
})
