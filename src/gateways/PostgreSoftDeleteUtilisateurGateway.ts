import { Prisma, PrismaClient } from '@prisma/client'

import { SuppressionUtilisateurGateway } from '@/use-cases/commands/SupprimerMonCompteCommand'

export class PostgresSoftDeleteUtilisateurGateway implements SuppressionUtilisateurGateway {
  readonly #activeRecord: Prisma.UtilisateurRecordDelegate

  constructor(dbClient: PrismaClient) {
    this.#activeRecord = dbClient.utilisateurRecord
  }

  async delete(email: string): Promise<boolean> {
    return this.#activeRecord.update({
      data: {
        isSupprime: true,
      },
      select: {
        id: true,
      },
      where: {
        email,
        isSupprime: false,
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
