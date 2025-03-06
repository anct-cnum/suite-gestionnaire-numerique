import { FeuilleDeRouteRecord } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { FeuillesDeRouteLoader, FeuillesDeRouteReadModel } from '@/use-cases/queries/RecupererLesFeuillesDeRoute'

export class PrismaLesFeuillesDeRouteLoader implements FeuillesDeRouteLoader {
  readonly #dataResource = prisma.feuilleDeRouteRecord

  async feuillesDeRoute(codeDepartement: string): Promise<FeuillesDeRouteReadModel> {
    const feuillesDeRouteRecord = await this.#dataResource.findMany({
      orderBy: {
        creation: 'desc',
      },
      where: {
        gouvernanceDepartementCode: codeDepartement,
      },
    })

    return transform(feuillesDeRouteRecord)
  }
}

function transform(
  feuillesDeRouteRecord: ReadonlyArray<FeuilleDeRouteRecord>
): FeuillesDeRouteReadModel {
  return {
    feuillesDeRoute: feuillesDeRouteRecord.map((feuilleDeRouteRecord) => {
      return {
        actions: [
          {
            nom: 'Structurer une filière de reconditionnement locale 1',
            statut: 'deposee',
            totaux: {
              coFinancement: 30_000,
              financementAccorde: 40_000,
            },
            uid: 'actionFooId1',
          },
          {
            nom: 'Structurer une filière de reconditionnement locale 2',
            statut: 'enCours',
            totaux: {
              coFinancement: 50_000,
              financementAccorde: 20_000,
            },
            uid: 'actionFooId2',
          },
        ],
        beneficiaires: 5,
        coFinanceurs: 3,
        nom: feuilleDeRouteRecord.nom,
        structureCoPorteuse: {
          nom: 'CC des Monts du Lyonnais',
          uid: 'structureCoPorteuseFooId',
        },
        totaux: {
          budget: 0,
          coFinancement: 0,
          financementAccorde: 0,
        },
        uid: String(feuilleDeRouteRecord.id),
        uidGouvernance: feuilleDeRouteRecord.gouvernanceDepartementCode,
      }
    }),
    totaux: {
      budget: 0,
      coFinancement: 0,
      financementAccorde: 0,
    },
  }
}
