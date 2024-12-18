import { Prisma, PrismaClient } from '@prisma/client'

import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { FindGouvernanceRepository, UpdateGouvernanceRepository } from '@/use-cases/commands/shared/GouvernanceRepository'

export class PrismaGouvernanceRepository implements FindGouvernanceRepository, UpdateGouvernanceRepository {
  readonly #activeRecord: Prisma.UtilisateurRecordDelegate

  constructor(dbClient: PrismaClient) {
    this.#activeRecord = dbClient.gouvernanceRecord
  }

  async find(uid: GouvernanceUid): Promise<Gouvernance | null> {
    return null
  }

  async update(gouvernance: Gouvernance): Promise<void> {
    return null
  }
}
