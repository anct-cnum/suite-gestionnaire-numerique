import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { StatutSubvention } from '@/domain/DemandeDeSubvention'
import { FinancementLoader, TableauDeBordLoaderFinancements } from '@/use-cases/queries/RecuperFinancements'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaFinancementsLoader implements FinancementLoader {
  readonly #feuilleDeRouteDao = prisma.feuilleDeRouteRecord

  async get(territoire: string): Promise<ErrorReadModel | TableauDeBordLoaderFinancements> {
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
        where: territoire === 'France' ? {
          gouvernanceDepartementCode: {
            not: 'zzz',
          },
        } : {
          gouvernanceDepartementCode: territoire,
        },
      })

      const totalBudget = feuillesDeRoute.reduce((acc, feuille) => {
        return acc + feuille.action.reduce((accAction, action) => accAction + action.budgetGlobal, 0)
      }, 0)

      const subventionsParEnveloppe = new Map<string, { enveloppeTotale: number; total: number }>()
      let nombreDeFinancementsEngages = 0

      feuillesDeRoute.forEach(feuille => {
        feuille.action.forEach(action => {
          action.demandesDeSubvention.forEach(demande => {
            if (demande.statut as StatutSubvention === StatutSubvention.ACCEPTEE) {
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
}

