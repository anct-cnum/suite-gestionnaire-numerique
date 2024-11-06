import { PrismaClient } from '@prisma/client'

import { UneGouvernanceReadModel, UneGouvernanceReadModelLoader } from '@/use-cases/queries/RecupererUneGouvernance'

export class PrismaGouvernanceLoader implements UneGouvernanceReadModelLoader {
  readonly #prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma
  }

  async find(codeDepartement: string): Promise<UneGouvernanceReadModel | null> {
    const gouvernanceRecord = await this.#prisma.departementRecord.findUnique({
      select: {
        nom: true,
      },
      where: {
        code: codeDepartement,
      },
    })

    return gouvernanceRecord
  }
}
