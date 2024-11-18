import { PrismaClient } from '@prisma/client'

import { StructuresLoader, StructuresReadModel } from '../use-cases/queries/RechercherLesStructures'

export class PostgreStructureLoader implements StructuresLoader {
  readonly #prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma
  }

  async findStructures(search: string): Promise<StructuresReadModel> {
    const structuresRecord = await this.#prisma.structureRecord.findMany({
      orderBy: {
        nom: 'asc',
      },
      take: 10,
      where: {
        nom: { contains: search },
      },
    })

    return structuresRecord.map(({ nom, id }) => ({
      nom,
      uid: id.toString(),
    }))
  }
}
