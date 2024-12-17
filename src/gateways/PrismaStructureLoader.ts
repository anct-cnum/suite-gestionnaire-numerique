import { StructureRecord, PrismaClient } from '@prisma/client'

import { RechercherStruturesQuery, StructureLoader, StructuresReadModel } from '../use-cases/queries/RechercherLesStructures'

export class PrismaStructureLoader implements StructureLoader {
  readonly #prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma
  }

  async findStructures(query: RechercherStruturesQuery): Promise<StructuresReadModel> {
    const departementOuRegion = query.zone?.[0]
    const code = query.zone?.[1]
    const structuresRecord = await this.#prisma.structureRecord.findMany({
      orderBy: {
        nom: 'asc',
      },
      take: 10,
      where: {
        nom: {
          contains: query.match,
          mode: 'insensitive',
        },
        ...(departementOuRegion === 'departement' ? { departementCode: { equals: code } } : {}),
        ...(departementOuRegion === 'region'
          ? {
            relationDepartement: {
              regionCode: {
                equals: code,
              },
            },
          }
          : {}
        ),
      },
    })
    return transform(structuresRecord)
  }
}

function transform(structuresRecord: ReadonlyArray<StructureRecord>): StructuresReadModel {
  return structuresRecord.map(({ commune, nom, id }) => ({
    commune,
    nom,
    uid: `${id}`,
  }))
}
