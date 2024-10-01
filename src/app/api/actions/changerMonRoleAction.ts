'use server'

import prisma from '../../../../prisma/prismaClient'
import { TypologieRole } from '@/domain/Role'
import { InvariantUtilisateur } from '@/domain/Utilisateur'
import { PostgreUtilisateurRepository } from '@/gateways/PostgreUtilisateurRepository'
import { SessionUtilisateurViewModel } from '@/presenters/sessionUtilisateurPresenter'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ChangerMonRole } from '@/use-cases/commands/ChangerMonRole'

export async function changerMonRoleAction(
  sessionUtilisateurViewModel: SessionUtilisateurViewModel,
  nouveauRole: TypologieRole
): ResultAsync<InvariantUtilisateur> {
  return new ChangerMonRole(new PostgreUtilisateurRepository(prisma))
    .execute({
      nouveauRoleState: {
        nom: nouveauRole,
        territoireOuStructure: '',
      },
      utilisateurState: {
        ...sessionUtilisateurViewModel,
        isSuperAdmin: true,
        role: {
          nom: sessionUtilisateurViewModel.role.nom,
          territoireOuStructure: sessionUtilisateurViewModel.role.libelle,
        },
      },
    })
}
