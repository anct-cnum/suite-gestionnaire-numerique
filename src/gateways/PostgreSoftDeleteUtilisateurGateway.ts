import { Prisma, PrismaClient } from '@prisma/client'

import { SuppressionUtilisateurGateway } from '@/use-cases/commands/SupprimerMonCompte'

export class PostgresSoftDeleteUtilisateurGateway implements SuppressionUtilisateurGateway {
  readonly #activeRecord: Prisma.UtilisateurRecordDelegate

  constructor(dbClient: PrismaClient) {
    this.#activeRecord = dbClient.utilisateurRecord
  }

  async delete(ssoId: string): Promise<boolean> {
    return this.#activeRecord.update({
      data: {
        isSupprime: true,
      },
      select: {
        id: true,
      },
      where: {
        isSupprime: false,
        ssoId,
      },
    })
      .then(() => true)
      .catch((error: unknown) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          return false
        }
        throw error
      })
  }
}
