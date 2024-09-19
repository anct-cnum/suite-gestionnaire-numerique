import { Prisma, PrismaClient } from '@prisma/client'

import { fromTypologieRole } from './roleMapper'
import { Utilisateur } from '@/domain/Utilisateur'
import { UtilisateurRepository } from '@/use-cases/commands/ChangerMonRole'

export class PostgreUtilisateurRepository implements UtilisateurRepository {
  readonly #activeRecord: Prisma.UtilisateurRecordDelegate

  constructor(dbClient: PrismaClient) {
    this.#activeRecord = dbClient.utilisateurRecord
  }

  async update(utilisateur: Utilisateur): Promise<void> {
    const utilisateurState = utilisateur.state()
    await this.#activeRecord.update({
      data: {
        role: fromTypologieRole(utilisateurState.role.nom),
      },
      where: {
        ssoId: utilisateurState.uid,
      },
    })
  }
}
