/* eslint-disable camelcase */
import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { StructureLoader, StructuresReadModel } from '../use-cases/queries/RechercherLesStructures'

export class PrismaStructureLoader implements StructureLoader {
  readonly #dataResource = prisma.main_structure

  async structures(match: string): Promise<StructuresReadModel> {
    return this.#structuresRecord(match).then(transform)
  }

  async structuresByDepartement(match: string, codeDepartement: string): Promise<StructuresReadModel> {
    // TODO: main.structure n'a pas de departementCode direct
    // Il faudra faire une jointure avec adresse pour filtrer par département
    return this.#structuresRecord(match, {
      adresse: {
        departement: {
          equals: codeDepartement,
        },
      },
    }).then(transform)
  }

  async structuresByRegion(match: string, _codeRegion: string): Promise<StructuresReadModel> {
    // TODO: main.structure n'a pas de relationDepartement
    // Il faudra adapter ce filtre avec les tables admin.departement et admin.region
    return this.#structuresRecord(match).then(transform)
  }

  async #structuresRecord(
    match: string,
    where: Prisma.main_structureWhereInput = {}
  ): Promise<ReadonlyArray<StructureAvecAdresse>> {
    return this.#dataResource.findMany({
      include: {
        adresse: true,
      },
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

type StructureAvecAdresse = Prisma.main_structureGetPayload<{
  include: {
    adresse: true
  }
}>

function transform(structuresRecord: ReadonlyArray<StructureAvecAdresse>): StructuresReadModel {
  return structuresRecord.map(({ adresse, id, nom }) => ({
    commune: adresse?.nom_commune ?? '',
    nom,
    uid: String(id),
  }))
}
