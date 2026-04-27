import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { StatutSubvention } from '@/domain/DemandeDeSubvention'
import { FinancementAdminLoader, TableauDeBordLoaderFinancementsAdmin } from '@/use-cases/queries/RecuperFinancements'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaFinancementsAdminLoader implements FinancementAdminLoader {
  readonly #demandeDeSubventionDao = prisma.demandeDeSubventionRecord
  readonly #enveloppeDao = prisma.enveloppeFinancementRecord

  async get(): Promise<ErrorReadModel | TableauDeBordLoaderFinancementsAdmin> {
    try {
      const [enveloppes, demandesAcceptees, cnConsomme] = await Promise.all([
        this.#enveloppeDao.findMany(),
        // Récupérer toutes les demandes de subvention acceptées (en excluant zzz)
        this.#demandeDeSubventionDao.findMany({
          include: {
            enveloppe: true,
          },
          where: {
            action: {
              feuilleDeRoute: {
                gouvernanceDepartementCode: {
                  not: 'zzz',
                },
              },
            },
            statut: StatutSubvention.ACCEPTEE,
          },
        }),
        prisma.$queryRaw<[{ total: bigint }]>`
          SELECT (COALESCE(SUM(montant_subvention_v1), 0) + COALESCE(SUM(montant_subvention_v2), 0))::bigint AS total
          FROM main.subvention
        `,
      ])

      const montantTotalEnveloppes = enveloppes.reduce((acc, env) => acc + env.montant, 0)
      const nombreEnveloppes = enveloppes.length

      // Calculer les crédits engagés et la ventilation par enveloppe (hors CN)
      const subventionsParEnveloppe = new Map<string, { enveloppeTotale: number; total: number }>()
      let creditsEngagesTotal = Number(cnConsomme[0].total)

      demandesAcceptees.forEach((demande) => {
        creditsEngagesTotal += demande.subventionDemandee
        const label = demande.enveloppe.libelle
        const enveloppeTotale = demande.enveloppe.montant

        const current = subventionsParEnveloppe.get(label) ?? { enveloppeTotale, total: 0 }
        subventionsParEnveloppe.set(label, {
          enveloppeTotale,
          total: current.total + demande.subventionDemandee,
        })
      })

      // Compter le nombre d'enveloppes utilisées
      const nombreEnveloppesUtilisees = subventionsParEnveloppe.size

      return {
        creditsEngages: creditsEngagesTotal.toString(),
        montantTotalEnveloppes: montantTotalEnveloppes.toString(),
        nombreDeFinancementsEngagesParLEtat: demandesAcceptees.length,
        nombreEnveloppes,
        nombreEnveloppesUtilisees,
        ventilationSubventionsParEnveloppe: Array.from(subventionsParEnveloppe.entries()).map(([label, data]) => ({
          enveloppeTotale: data.enveloppeTotale.toString(),
          label,
          total: data.total.toString(),
        })),
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaFinancementsAdminLoader', {
        operation: 'get',
      })
      return {
        message: 'Impossible de récupérer les données de financement admin',
        type: 'error',
      }
    }
  }
}
