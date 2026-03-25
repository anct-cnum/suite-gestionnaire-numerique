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
      const membres = await this.#membreDao.findMany({
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
      })

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

      const totalFinancements = Array.from(subventionsParEnveloppe.values()).reduce(
        (acc, val) => acc + val.total,
        0
      )

      return {
        nombreDeFinancementsEngagesParLEtat: nombreDeFinancementsEngages,
        totalFinancements: totalFinancements.toString(),
        ventilationSubventionsParEnveloppe: Array.from(subventionsParEnveloppe.entries()).map(
          ([label, data]) => ({
            enveloppeTotale: data.enveloppeTotale.toString(),
            label,
            total: data.total.toString(),
          })
        ),
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
}
