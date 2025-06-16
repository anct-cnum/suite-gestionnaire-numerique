import prisma from '../../prisma/prismaClient'
import { StatutSubvention } from '@/domain/DemandeDeSubvention'
import { TableauDeBordLoader, TableauDeBordLoaderFinancements } from '@/use-cases/queries/RecuperLeTableauDeBord'

export class PrismaTableauDeBordLoader implements TableauDeBordLoader {
  readonly #feuilleDeRouteDao = prisma.feuilleDeRouteRecord

  async get(codeDepartement: string): Promise<TableauDeBordLoaderFinancements> {
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
  }
}

