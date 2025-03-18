import { Prisma } from '@prisma/client'

import { toMembres } from './shared/MembresGouvernance'
import prisma from '../../prisma/prismaClient'
import { FeuillesDeRouteLoader, FeuillesDeRouteReadModel, StatutSubvention } from '@/use-cases/queries/RecupererLesFeuillesDeRoute'

export class PrismaLesFeuillesDeRouteLoader implements FeuillesDeRouteLoader {
  readonly #dataResource = prisma.feuilleDeRouteRecord

  async feuillesDeRoute(codeDepartement: string): Promise<FeuillesDeRouteReadModel> {
    const feuillesDeRouteRecord = await this.#dataResource.findMany({
      include,
      orderBy: {
        creation: 'desc',
      },
      where: {
        gouvernanceDepartementCode: codeDepartement,
      },
    })

    return transform(feuillesDeRouteRecord, codeDepartement)
  }
}

function transform(
  feuillesDeRouteRecord: ReadonlyArray<Prisma.FeuilleDeRouteRecordGetPayload<{
    include: typeof include
  }>>,
  codeDepartement: string
): FeuillesDeRouteReadModel {
  return {
    feuillesDeRoute: feuillesDeRouteRecord.map((feuilleDeRouteRecord) => ({
      actions: feuilleDeRouteRecord.action.map((action) => {
        const demandeDeSubvention = action.demandesDeSubvention.length === 1
          ? action.demandesDeSubvention[0]
          : undefined
        return {
          beneficiaireUids: demandeDeSubvention?.beneficiaire.map(({ membreId }) => membreId) ?? [],
          budgetGlobal: action.budgetGlobal,
          coFinancements: action.coFinancement.map(({ memberId, montant }) => ({ coFinanceurUid: memberId, montant })),
          nom: action.nom,
          porteurs: toMembres(action.porteurAction.map(({ membre }) => membre))
            .map(({ id, nom }) => ({ nom, uid: id.toString() })),
          subvention: demandeDeSubvention ? {
            montants: {
              prestation: demandeDeSubvention.subventionPrestation ?? 0,
              ressourcesHumaines: demandeDeSubvention.subventionEtp ?? 0,
            },
            statut: demandeDeSubvention.statut as StatutSubvention,
          } : undefined,
          totaux: {
            coFinancement: 0,
            financementAccorde: 0,
          },
          uid: action.id.toString(),
        }
      }),
      beneficiaires: 0,
      coFinanceurs: 0,
      nom: feuilleDeRouteRecord.nom,
      structureCoPorteuse: feuilleDeRouteRecord.relationMembre ? {
        nom: feuilleDeRouteRecord.relationMembre.relationContact.nom,
        uid: feuilleDeRouteRecord.relationMembre.id,
      } : undefined,
      totaux: {
        budget: 0,
        coFinancement: 0,
        financementAccorde: 0,
      },
      uid: String(feuilleDeRouteRecord.id),
    })),
    totaux: {
      budget: 0,
      coFinancement: 0,
      financementAccorde: 0,
    },
    uidGouvernance: codeDepartement,
  }
}

const include = {
  action: {
    include: {
      coFinancement: true,
      demandesDeSubvention: {
        include: {
          beneficiaire: true,
        },
      },
      porteurAction: {
        include: {
          membre: {
            include: {
              membresGouvernanceCommune: true,
              membresGouvernanceDepartement: {
                include: {
                  relationDepartement: true,
                },
              },
              membresGouvernanceEpci: true,
              membresGouvernanceSgar: {
                include: {
                  relationSgar: true,
                },
              },
              membresGouvernanceStructure: true,
              relationContact: true,
            },
          },
        },
      },
    },
  },
  relationMembre: {
    include: {
      relationContact: true,
    },
  },
}
