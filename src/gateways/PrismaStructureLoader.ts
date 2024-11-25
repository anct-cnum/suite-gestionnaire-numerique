import { PrismaClient } from '@prisma/client'

import { StructureLoader, StructuresReadModel } from '../use-cases/queries/RechercherLesStructures'

export class PrismaStructureLoader implements StructureLoader {
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
        nom: {
          contains: search,
          mode: 'insensitive',
        },
      },
    })

    return transform(structuresRecord)
  }
}

function transform(
  structuresRecord: ReadonlyArray<{ id: number; nom: string }>
): ReadonlyArray<{ nom: string; uid: string }> {
  return structuresRecord.map(({ nom, id }) => ({
    nom,
    uid: `${id}`,
  }))
}
