import { Prisma } from '@prisma/client'

import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { StatutSubvention } from '@/domain/DemandeDeSubvention'
import { FinancementLoader, TableauDeBordLoaderFinancements } from '@/use-cases/queries/RecuperFinancements'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaFinancementsLoader implements FinancementLoader {
  readonly #feuilleDeRouteDao = prisma.feuilleDeRouteRecord

  async get(territoire: string): Promise<ErrorReadModel | TableauDeBordLoaderFinancements> {
    try {
      const [feuillesDeRoute, conseillerNumerique] = await Promise.all([
        this.#feuilleDeRouteDao.findMany({
          include: {
            action: {
              include: {
                demandesDeSubvention: {
                  include: {
                    enveloppe: true,
                  },
                },
              },
            },
          },
          where:
            territoire === 'France'
              ? {
                  gouvernanceDepartementCode: {
                    not: 'zzz',
                  },
                }
              : {
                  gouvernanceDepartementCode: territoire,
                },
        }),
        this.#chargerConseillerNumerique(territoire),
      ])

      const totalBudget = feuillesDeRoute.reduce((acc, feuille) => {
        return acc + feuille.action.reduce((accAction, action) => accAction + action.budgetGlobal, 0)
      }, 0)

      const subventionsParEnveloppe = new Map<string, { enveloppeTotale: number; total: number }>()
      let nombreDeFinancementsEngages = 0

      feuillesDeRoute.forEach((feuille) => {
        feuille.action.forEach((action) => {
          action.demandesDeSubvention.forEach((demande) => {
            if ((demande.statut as StatutSubvention) === StatutSubvention.ACCEPTEE) {
              nombreDeFinancementsEngages += 1
              const montant = demande.subventionDemandee
              const enveloppe = demande.enveloppe.libelle
              const enveloppeTotale = demande.enveloppe.montant
              const current = subventionsParEnveloppe.get(enveloppe) ?? { enveloppeTotale, total: 0 }
              subventionsParEnveloppe.set(enveloppe, {
                enveloppeTotale,
                total: current.total + montant,
              })
            }
          })
        })
      })

      const totalSubventions = Array.from(subventionsParEnveloppe.values()).reduce((acc, val) => acc + val.total, 0)

      return {
        budgetGlobalRenseigne: totalBudget.toString(),
        conseillerNumerique,
        fneEngage: totalSubventions.toString(),
        nombreDeFinancementsEngagesParLEtat: nombreDeFinancementsEngages,
        ventilationSubventionsParEnveloppe: Array.from(subventionsParEnveloppe.entries()).map(([label, data]) => ({
          enveloppeTotale: data.enveloppeTotale.toString(),
          label,
          total: data.total.toString(),
        })),
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaFinancementsLoader', {
        operation: 'get',
        territoire,
      })
      return {
        message: 'Impossible de récupérer les données de financement',
        type: 'error',
      }
    }
  }

  // Montants versé / conventionné des postes Conseiller Numérique liés au territoire.
  // Source canonique : vue min.postes_conseiller_numerique_synthese (dédoublonnage de
  // l'historique des postes et cumul V1/V2 déjà gérés par la vue). Filtre territoire
  // identique à la liste des postes conum (structure -> adresse.departement).
  async #chargerConseillerNumerique(territoire: string): Promise<{ conventionne: string; verse: string }> {
    const filtreTerritoire = territoire === 'France' ? Prisma.empty : Prisma.sql`WHERE a.departement = ${territoire}`

    const rows = await prisma.$queryRaw<Array<{ conventionne: bigint; verse: bigint }>>`
      SELECT
        COALESCE(SUM(v.montant_subvention_cumule), 0)::bigint AS conventionne,
        COALESCE(SUM(v.montant_versement_cumule), 0)::bigint AS verse
      FROM min.postes_conseiller_numerique_synthese v
      LEFT JOIN main.structure st ON st.id = v.structure_id
      LEFT JOIN main.adresse a ON a.id = st.adresse_id
      ${filtreTerritoire}
    `

    return {
      conventionne: rows[0].conventionne.toString(),
      verse: rows[0].verse.toString(),
    }
  }
}
