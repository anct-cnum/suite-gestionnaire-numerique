'use server'

import { z, ZodIssue } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { Roles } from '@/domain/Role'
import { EmailInvitationGateway } from '@/gateways/EmailInvitationGateway'
import { PostgreUtilisateurRepository } from '@/gateways/PostgreUtilisateurRepository'
import { getSubSession } from '@/gateways/ProConnectAuthentificationGateway'
import { ResultAsync } from '@/use-cases/CommandHandler'
import {
  InviterUnUtilisateurCommand,
  InviterUnUtilisateur,
  InviterUnUtilisateurFailure,
  EmailGateway,
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

  return new InviterUnUtilisateur(new PostgreUtilisateurRepository(prisma), emailInvitationGatewayFactory).execute(
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

const {
  SMTP_HOST,
  SMTP_TEST_ACCOUNT_HOST,
  SMTP_PORT,
  SMTP_TEST_ACCOUNT_PORT,
  SMTP_USER,
  SMTP_TEST_ACCOUNT_USER,
  SMTP_PASSWORD,
  SMTP_TEST_ACCOUNT_PASSWORD,
  NEXT_PUBLIC_HOST,
} = process.env as NodeJS.Process['env'] & Readonly<{
  SMTP_HOST: string,
  SMTP_TEST_ACCOUNT_HOST: string,
  SMTP_PORT: string,
  SMTP_TEST_ACCOUNT_PORT: string,
  SMTP_USER: string,
  SMTP_TEST_ACCOUNT_USER: string,
  SMTP_PASSWORD: string,
  SMTP_TEST_ACCOUNT_PASSWORD: string,
  NEXT_PUBLIC_HOST: string,
}>

function emailInvitationGatewayFactory(isSuperAdmin: boolean): EmailGateway {
  return isSuperAdmin
    ? new EmailInvitationGateway(
      SMTP_TEST_ACCOUNT_HOST,
      SMTP_TEST_ACCOUNT_PORT,
      NEXT_PUBLIC_HOST,
      SMTP_TEST_ACCOUNT_USER,
      SMTP_TEST_ACCOUNT_PASSWORD
    )
    : new EmailInvitationGateway(
      SMTP_HOST,
      SMTP_PORT,
      NEXT_PUBLIC_HOST,
      SMTP_USER,
      SMTP_PASSWORD
    )
}
