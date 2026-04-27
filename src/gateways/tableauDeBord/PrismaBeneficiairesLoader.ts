import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { StatutSubvention } from '@/domain/DemandeDeSubvention'
import { BeneficiairesLoader, TableauDeBordLoaderBeneficiaires } from '@/use-cases/queries/RecuperBeneficiaires'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaBeneficiairesLoader implements BeneficiairesLoader {
  readonly #demandeDeSubventionDao = prisma.demandeDeSubventionRecord

  async get(territoire: string): Promise<ErrorReadModel | TableauDeBordLoaderBeneficiaires> {
    try {
      const [demandesAcceptees, beneficiairesCn] = await Promise.all([
        this.#demandeDeSubventionDao.findMany({
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
              feuilleDeRoute:
                territoire === 'France'
                  ? {
                      gouvernanceDepartementCode: {
                        not: 'zzz',
                      },
                    }
                  : {
                      gouvernanceDepartementCode: territoire,
                    },
            },
            statut: StatutSubvention.ACCEPTEE,
          },
        }),
        this.#queryBeneficiairesCn(territoire),
      ])

      // Regrouper les bénéficiaires par enveloppe
      const beneficiairesParEnveloppe = new Map<string, Set<string>>()

      demandesAcceptees.forEach((demande) => {
        const enveloppeLabel = demande.enveloppe.libelle
        if (!beneficiairesParEnveloppe.has(enveloppeLabel)) {
          beneficiairesParEnveloppe.set(enveloppeLabel, new Set())
        }

        demande.beneficiaire.forEach((beneficiaire) => {
          const beneficiairesSet = beneficiairesParEnveloppe.get(enveloppeLabel)
          if (beneficiairesSet) {
            beneficiairesSet.add(beneficiaire.membreId)
          }
        })
      })

      const details = Array.from(beneficiairesParEnveloppe.entries()).map(([label, beneficiaires]) => ({
        label,
        total: beneficiaires.size,
      }))

      const tousLesBeneficiaires = new Set<string>()
      beneficiairesParEnveloppe.forEach((beneficiaires) => {
        beneficiaires.forEach((id) => {
          tousLesBeneficiaires.add(id)
        })
      })

      const detailsCn = beneficiairesCn.map((row) => ({
        label: row.label,
        total: Number(row.total),
      }))

      const totalCn = detailsCn.reduce((acc, row) => acc + row.total, 0)

      return {
        collectivite: 0,
        details: [...details, ...detailsCn],
        total: tousLesBeneficiaires.size + totalCn,
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

  async #queryBeneficiairesCn(territoire: string): Promise<ReadonlyArray<BeneficiairesCnQueryResult>> {
    if (territoire === 'France') {
      return prisma.$queryRaw<Array<BeneficiairesCnQueryResult>>`
        WITH agg AS (
          SELECT
            COUNT(DISTINCT CASE WHEN s.montant_subvention_v1 > 0 THEN p.structure_id END) AS total_v1,
            COUNT(DISTINCT CASE WHEN s.montant_subvention_v2 > 0 THEN p.structure_id END) AS total_v2
          FROM main.subvention s
          JOIN main.poste p ON p.id = s.poste_id
        )
        SELECT
          e.libelle AS label,
          CASE WHEN e.libelle LIKE '%Renouvellement%' THEN agg.total_v2 WHEN e.libelle LIKE '%Plan France Relance%' THEN agg.total_v1 ELSE 0 END AS total
        FROM min.enveloppe_financement e
        CROSS JOIN agg
        WHERE e.libelle LIKE 'Conseiller Numérique%'
        ORDER BY e.libelle
      `
    }

    return prisma.$queryRaw<Array<BeneficiairesCnQueryResult>>`
      WITH agg AS (
        SELECT
          COUNT(DISTINCT CASE WHEN s.montant_subvention_v1 > 0 THEN p.structure_id END) AS total_v1,
          COUNT(DISTINCT CASE WHEN s.montant_subvention_v2 > 0 THEN p.structure_id END) AS total_v2
        FROM main.subvention s
        JOIN main.poste p ON p.id = s.poste_id
        JOIN main.structure st ON st.id = p.structure_id
        JOIN main.adresse a ON a.id = st.adresse_id
        WHERE a.departement = ${territoire}
      )
      SELECT
        e.libelle AS label,
        CASE WHEN e.libelle LIKE '%Renouvellement%' THEN agg.total_v2 WHEN e.libelle LIKE '%Plan France Relance%' THEN agg.total_v1 ELSE 0 END AS total
      FROM min.enveloppe_financement e
      CROSS JOIN agg
      WHERE e.libelle LIKE 'Conseiller Numérique%'
      ORDER BY e.libelle
    `
  }
}

type BeneficiairesCnQueryResult = {
  label: string
  total: bigint
}
