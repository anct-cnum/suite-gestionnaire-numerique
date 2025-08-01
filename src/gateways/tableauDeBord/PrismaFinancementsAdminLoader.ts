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
      // Récupérer toutes les enveloppes
      const enveloppes = await this.#enveloppeDao.findMany()
      const montantTotalEnveloppes = enveloppes.reduce((acc, env) => acc + env.montant, 0)
      const nombreEnveloppes = enveloppes.length

      // Récupérer toutes les demandes de subvention acceptées (en excluant zzz)
      const demandesAcceptees = await this.#demandeDeSubventionDao.findMany({
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
      })

      // Calculer les crédits engagés et la ventilation par enveloppe
      const subventionsParEnveloppe = new Map<string, { enveloppeTotale: number; total: number }>()
      let creditsEngagesTotal = 0
      
      demandesAcceptees.forEach(demande => {
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