import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { StatutSubvention } from '@/domain/DemandeDeSubvention'
import { classifierTypeEnveloppe } from '@/shared/enveloppeFinancement'
import { FinancementAdminLoader, TableauDeBordLoaderFinancementsAdmin } from '@/use-cases/queries/RecuperFinancements'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaFinancementsAdminLoader implements FinancementAdminLoader {
  readonly #demandeDeSubventionDao = prisma.demandeDeSubventionRecord
  readonly #enveloppeDao = prisma.enveloppeFinancementRecord

  async get(): Promise<ErrorReadModel | TableauDeBordLoaderFinancementsAdmin> {
    try {
      const [enveloppes, demandesAcceptees, conseillerNumerique] = await Promise.all([
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
        this.#chargerConseillerNumerique(),
      ])

      // Disponible FNE : somme des valeurs absolues du montant des enveloppes FNE.
      const fneDisponible = enveloppes
        .filter((enveloppe) => classifierTypeEnveloppe(enveloppe.libelle) === 'fne')
        .reduce((acc, enveloppe) => acc + Math.abs(enveloppe.montant), 0)

      // Engagé FNE et ventilation par enveloppe : demandes de subvention acceptées
      // (rattachées à une feuille de route, donc exclusivement FNE).
      const subventionsParEnveloppe = new Map<string, { enveloppeTotale: number; total: number }>()
      let fneEngage = 0

      demandesAcceptees.forEach((demande) => {
        fneEngage += demande.subventionDemandee
        const label = demande.enveloppe.libelle
        const enveloppeTotale = demande.enveloppe.montant

        const current = subventionsParEnveloppe.get(label) ?? { enveloppeTotale, total: 0 }
        subventionsParEnveloppe.set(label, {
          enveloppeTotale,
          total: current.total + demande.subventionDemandee,
        })
      })

      return {
        conseillerNumerique,
        fneDisponible: fneDisponible.toString(),
        fneEngage: fneEngage.toString(),
        nombreDeFinancementsEngagesParLEtat: demandesAcceptees.length,
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

  // Montants versé / conventionné de tous les postes Conseiller Numérique (niveau national).
  // Source canonique : vue min.postes_conseiller_numerique_synthese.
  async #chargerConseillerNumerique(): Promise<{ conventionne: string; verse: string }> {
    const rows = await prisma.$queryRaw<Array<{ conventionne: bigint; verse: bigint }>>`
      SELECT
        COALESCE(SUM(v.montant_subvention_cumule), 0)::bigint AS conventionne,
        COALESCE(SUM(v.montant_versement_cumule), 0)::bigint AS verse
      FROM min.postes_conseiller_numerique_synthese v
    `

    return {
      conventionne: rows[0].conventionne.toString(),
      verse: rows[0].verse.toString(),
    }
  }
}
