import { StructureRecord, PrismaClient, Prisma } from '@prisma/client'

import { StructureLoader, StructuresReadModel } from '../use-cases/queries/RechercherLesStructures'

export class PrismaStructureLoader implements StructureLoader {
  readonly #prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma
  }

  async findStructures(match: string): Promise<StructuresReadModel> {
    return this.#structuresRecord(match).then(transform)
  }

  async findStructuresByDepartement(match: string, codeDepartement: string): Promise<StructuresReadModel> {
    return this.#structuresRecord(match, {
      departementCode: {
        equals: codeDepartement,
      },
    }).then(transform)
  }

  async findStructuresByRegion(match: string, codeRegion: string): Promise<StructuresReadModel> {
    return this.#structuresRecord(match, {
      relationDepartement: {
        regionCode: {
          equals: codeRegion,
        },
      },
    }).then(transform)
  }

  async #structuresRecord(
    match: string,
    where: Prisma.StructureRecordWhereInput = {}
  ): Promise<ReadonlyArray<StructureRecord>> {
    return this.#prisma.structureRecord.findMany({
      orderBy: {
        nom: 'asc',
      },
      take: 10,
      where: {
        nom: {
          contains: match,
          mode: 'insensitive',
        },
        ...where,
      },
    })
  }
}

function transform(structuresRecord: ReadonlyArray<StructureRecord>): StructuresReadModel {
  return structuresRecord.map(({ commune, nom, id }) => ({
    commune,
    nom,
    uid: String(id),
  }))
}
