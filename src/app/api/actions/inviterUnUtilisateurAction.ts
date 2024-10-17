import prisma from '../../../../prisma/prismaClient'
import { TypologieRole } from '../../../domain/Role'
import { PostgreUtilisateurRepository } from '../../../gateways/PostgreUtilisateurRepository'
import { ResultAsync } from '../../../use-cases/CommandHandler'
import { InviterUnUtilisateur } from '../../../use-cases/commands/InviterUnUtilisateur'

interface UtilisateurACreer {
  prenom: string
  nom: string
  email: string
  role: TypologieRole
  organisation?: string
  uidUtilisateurCourant: string
}

export async function inviterUnUtilisateurAction(utilisateurACreer: UtilisateurACreer): ResultAsync<'KO'> {
  return new InviterUnUtilisateur(new PostgreUtilisateurRepository(prisma)).execute(utilisateurACreer)
}
