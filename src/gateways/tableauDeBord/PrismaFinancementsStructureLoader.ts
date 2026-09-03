import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { StatutSubvention } from '@/domain/DemandeDeSubvention'
import {
  FinancementsStructureLoader,
  FinancementsStructureReadModel,
} from '@/use-cases/queries/RecupererFinancementsStructure'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaFinancementsStructureLoader implements FinancementsStructureLoader {
  readonly #membreDao = prisma.membreRecord

  async get(structureId: number): Promise<ErrorReadModel | FinancementsStructureReadModel> {
    try {
      const [membres, conseillerNumerique] = await Promise.all([
        this.#membreDao.findMany({
          include: {
            BeneficiaireSubventionRecord: {
              include: {
                demandeDeSubvention: {
                  include: {
                    enveloppe: true,
                  },
                },
              },
              where: {
                demandeDeSubvention: {
                  statut: StatutSubvention.ACCEPTEE,
                },
              },
            },
          },
          where: { structureId },
        }),
        this.#chargerConseillerNumerique(structureId),
      ])

      const subventionsParEnveloppe = new Map<string, { enveloppeTotale: number; total: number }>()
      let nombreDeFinancementsEngages = 0

      membres.forEach((membre) => {
        membre.BeneficiaireSubventionRecord.forEach((beneficiaire) => {
          nombreDeFinancementsEngages += 1
          const montant = beneficiaire.demandeDeSubvention.subventionDemandee
          const label = beneficiaire.demandeDeSubvention.enveloppe.libelle
          const enveloppeTotale = beneficiaire.demandeDeSubvention.enveloppe.montant
          const current = subventionsParEnveloppe.get(label) ?? { enveloppeTotale, total: 0 }
          subventionsParEnveloppe.set(label, {
            enveloppeTotale,
            total: current.total + montant,
          })
        })
      })

      const fneEngage = Array.from(subventionsParEnveloppe.values()).reduce((acc, val) => acc + val.total, 0)

      return {
        conseillerNumerique,
        fneEngage: fneEngage.toString(),
        nombreDeFinancementsEngagesParLEtat: nombreDeFinancementsEngages,
        ventilationSubventionsParEnveloppe: Array.from(subventionsParEnveloppe.entries()).map(([label, data]) => ({
          enveloppeTotale: data.enveloppeTotale.toString(),
          label,
          total: data.total.toString(),
        })),
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaFinancementsStructureLoader', {
        operation: 'get',
        structureId,
      })
      return {
        message: 'Impossible de récupérer les données de financement',
        type: 'error',
      }
    }
  }

  // Montants versé / conventionné des postes Conseiller Numérique de la structure.
  // Source canonique : vue min.postes_conseiller_numerique_synthese (dédoublonnage de
  // l'historique des postes et cumul V1/V2 déjà gérés par la vue).
  async #chargerConseillerNumerique(structureId: number): Promise<{ conventionne: string; verse: string }> {
    const rows = await prisma.$queryRaw<Array<{ conventionne: bigint; verse: bigint }>>`
      SELECT
        COALESCE(SUM(v.montant_subvention_cumule), 0)::bigint AS conventionne,
        COALESCE(SUM(v.montant_versement_cumule), 0)::bigint AS verse
      FROM min.postes_conseiller_numerique_synthese v
      WHERE v.structure_id = ${structureId}
    `

    return {
      conventionne: rows[0].conventionne.toString(),
      verse: rows[0].verse.toString(),
    }
  }
}
