import { Prisma, PrismaClient } from '@prisma/client'

import { Comite } from '@/domain/Comite'
import { AddComiteRepository } from '@/use-cases/commands/shared/ComiteRepository'

export class PrismaComiteRepository implements AddComiteRepository {
  readonly #activeRecord: Prisma.UtilisateurRecordDelegate

  constructor(dbClient: PrismaClient) {
    this.#activeRecord = dbClient.gouvernanceRecord
  }

  async add(comite: Comite): Promise<void> {
    return null
  }
}
