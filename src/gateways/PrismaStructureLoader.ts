import { Prisma } from '@prisma/client'

import { RechercherStruturesQuery, StructureLoader, StructuresReadModel } from '../use-cases/queries/RechercherLesStructures'

export class PrismaStructureLoader implements StructureLoader {
  readonly #dataResource: Prisma.StructureRecordDelegate

  constructor(dataResource: Prisma.StructureRecordDelegate) {
    this.#dataResource = dataResource
  }

  async findStructures(query: RechercherStruturesQuery): Promise<StructuresReadModel> {
    const departementOuRegion = query.zone?.[0]
    const code = query.zone?.[1]
    const structuresRecord = await this.#dataResource.findMany({
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

function transform(
  structuresRecord: ReadonlyArray<{ id: number; nom: string }>
): ReadonlyArray<{ nom: string; uid: string }> {
  return structuresRecord.map(({ nom, id }) => ({
    nom,
    uid: `${id}`,
  }))
}
