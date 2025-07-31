import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { StatutSubvention } from '@/domain/DemandeDeSubvention'
import { BeneficiairesLoader, TableauDeBordLoaderBeneficiaires } from '@/use-cases/queries/RecuperBeneficiaires'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaBeneficiairesLoader implements BeneficiairesLoader {
  readonly #demandeDeSubventionDao = prisma.demandeDeSubventionRecord
  
  async get(territoire: string): Promise<ErrorReadModel | TableauDeBordLoaderBeneficiaires> {
    try {
      // Récupérer toutes les demandes de subvention acceptées avec leurs bénéficiaires et enveloppes
      const demandesAcceptees = await this.#demandeDeSubventionDao.findMany({
        include: {
          action: {
            include: {
              feuilleDeRoute: true,
            },
          },
          beneficiaire: true,
          enveloppe: true,
        },
        where: {
          action: {
            feuilleDeRoute: territoire === 'France' ? {
              gouvernanceDepartementCode: {
                not: 'zzz',
              },
            } : {
              gouvernanceDepartementCode: territoire,
            },
          },
          statut: StatutSubvention.ACCEPTEE,
        },
      })

      // Regrouper les bénéficiaires par enveloppe
      const beneficiairesParEnveloppe = new Map<string, Set<string>>()

      demandesAcceptees.forEach(demande => {
        const enveloppeLabel = demande.enveloppe.libelle
        if (!beneficiairesParEnveloppe.has(enveloppeLabel)) {
          beneficiairesParEnveloppe.set(enveloppeLabel, new Set())
        }
        
        demande.beneficiaire.forEach(beneficiaire => {
          const beneficiairesSet = beneficiairesParEnveloppe.get(enveloppeLabel)
          if (beneficiairesSet) {
            beneficiairesSet.add(beneficiaire.membreId)
          }
        })
      })

      // Créer le tableau des détails par enveloppe
      const details = Array.from(beneficiairesParEnveloppe.entries()).map(([label, beneficiaires]) => ({
        label,
        total: beneficiaires.size,
      }))

      // Calculer le total unique de bénéficiaires (tous les bénéficiaires uniques)
      const tousLesBeneficiaires = new Set<string>()
      beneficiairesParEnveloppe.forEach(beneficiaires => {
        beneficiaires.forEach(id => tousLesBeneficiaires.add(id))
      })

      return {
        collectivite: 0, // Pour l'instant on ne peut pas catégoriser
        details,
        total: tousLesBeneficiaires.size,
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaBeneficiairesLoader', {
        operation: 'get',
        territoire,
      })
      return {
        message: 'Impossible de récupérer les données des bénéficiaires',
        type: 'error',
      }
    }
  }
}