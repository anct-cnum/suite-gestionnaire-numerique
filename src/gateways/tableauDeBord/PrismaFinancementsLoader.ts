import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { StatutSubvention } from '@/domain/DemandeDeSubvention'
import { FinancementLoader, TableauDeBordLoaderFinancements } from '@/use-cases/queries/RecuperFinancements'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaFinancementsLoader implements FinancementLoader {
  readonly #feuilleDeRouteDao = prisma.feuilleDeRouteRecord

  async get(codeDepartement: string): Promise<ErrorReadModel | TableauDeBordLoaderFinancements> {
    try {
      const feuillesDeRoute = await this.#feuilleDeRouteDao.findMany({
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
        where: {
          gouvernanceDepartementCode: codeDepartement,
        },
      })

      const totalBudget = feuillesDeRoute.reduce((acc, feuille) => {
        return acc + feuille.action.reduce((accAction, action) => accAction + action.budgetGlobal, 0)
      }, 0)

      const subventionsParEnveloppe = new Map<string, number>()
      let nombreDeFinancementsEngages = 0

      feuillesDeRoute.forEach(feuille => {
        feuille.action.forEach(action => {
          action.demandesDeSubvention.forEach(demande => {
            if (demande.statut as StatutSubvention === StatutSubvention.ACCEPTEE) {
              nombreDeFinancementsEngages += 1
              const montant = demande.subventionDemandee
              const enveloppe = demande.enveloppe.libelle
              subventionsParEnveloppe.set(enveloppe, (subventionsParEnveloppe.get(enveloppe) ?? 0) + montant)
            }
          })
        })
      })

      const totalSubventions = Array.from(subventionsParEnveloppe.values()).reduce((acc, val) => acc + val, 0)
      const pourcentageCredit = totalBudget > 0 ? totalSubventions / totalBudget * 100 : 0

      return {
        budget: {
          feuillesDeRoute: feuillesDeRoute.length,
          total: totalBudget.toString(),
        },
        credit: {
          pourcentage: Math.round(pourcentageCredit),
          total: totalSubventions.toString(),
        },
        nombreDeFinancementsEngagesParLEtat: nombreDeFinancementsEngages,
        ventilationSubventionsParEnveloppe: Array.from(subventionsParEnveloppe.entries()).map(([label, total]) => ({
          label,
          total: total.toString(),
        })),
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaFinancementsLoader', {
        codeDepartement,
        operation: 'get',
      })
      return {
        message: 'Impossible de récupérer les données de financement',
        type: 'error',
      }
    }
  }
}

