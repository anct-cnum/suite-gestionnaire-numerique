import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { 
  NiveauDeFormationLoader,
  NiveauDeFormationReadModel,
} from '@/use-cases/queries/RecupererNiveauDeFormation'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaNiveauDeFormationLoader implements NiveauDeFormationLoader {
  async get(territoire = 'France'): Promise<ErrorReadModel |NiveauDeFormationReadModel> {
    try {
      // Nombre total d'aidants et médiateurs
      const totalResult = territoire === 'France'
        ? await prisma.$queryRaw<Array<{ total_aidants_connect_et_mediateurs: bigint }>>`
            SELECT COUNT(*) AS total_aidants_connect_et_mediateurs
            FROM main.personne
            WHERE aidant_connect_id IS NOT NULL OR is_mediateur
          `
        : await prisma.$queryRaw<Array<{ total_aidants_connect_et_mediateurs: bigint }>>`
            SELECT COUNT(DISTINCT p.id) AS total_aidants_connect_et_mediateurs
            FROM main.personne p
            LEFT JOIN main.structure s ON p.structure_id = s.id
            LEFT JOIN main.personne_structures_emplois pl ON p.id = pl.personne_id
            LEFT JOIN main.structure s2 ON s2.id = pl.structure_id
            LEFT JOIN main.adresse a ON COALESCE(s.adresse_id, s2.adresse_id) = a.id
            WHERE (p.aidant_connect_id IS NOT NULL OR p.is_mediateur)
              AND a.departement = ${territoire}
          `
      const totalAidantsEtMediateurs = Number(totalResult[0]?.total_aidants_connect_et_mediateurs || 0)

      // Nombre d'aidants et médiateurs formés  
      const formesResult = territoire === 'France'
        ? await prisma.$queryRaw<Array<{ total_aidants_connect_et_mediateurs_formes: bigint }>>`
            WITH mediateur_formes AS (
              SELECT COUNT(*) AS total_mediateurs_formes
              FROM main.personne
              JOIN main.formation ON personne.id = formation.personne_id
              WHERE is_mediateur AND (conseiller_numerique_id IS NOT NULL OR cn_pg_id IS NOT NULL)
            ),
            aidants_connect_formes AS (
              SELECT COUNT(*) AS total_aidants_connect_formes
              FROM main.personne
              WHERE aidant_connect_id IS NOT NULL AND formation_fne_ac
            )
            SELECT
              (SELECT total_mediateurs_formes FROM mediateur_formes) +
              (SELECT total_aidants_connect_formes FROM aidants_connect_formes) AS total_aidants_connect_et_mediateurs_formes
          `
        : await prisma.$queryRaw<Array<{ total_aidants_connect_et_mediateurs_formes: bigint }>>`
            WITH mediateur_formes AS (
              SELECT COUNT(*) AS total_mediateurs_formes
              FROM main.personne p
              JOIN main.formation ON p.id = formation.personne_id
              JOIN main.personne_structures_emplois pl ON p.id = pl.personne_id
              JOIN main.structure s ON s.id = pl.structure_id
              JOIN main.adresse a ON s.adresse_id = a.id
              WHERE p.is_mediateur AND (p.conseiller_numerique_id IS NOT NULL OR p.cn_pg_id IS NOT NULL)
                AND a.departement = ${territoire}
            ),
            aidants_connect_formes AS (
              SELECT COUNT(*) AS total_aidants_connect_formes
              FROM main.personne p
              JOIN main.structure s ON p.structure_id = s.id
              JOIN main.adresse a ON s.adresse_id = a.id
              WHERE p.aidant_connect_id IS NOT NULL AND p.formation_fne_ac
                AND a.departement = ${territoire}
            )
            SELECT
              (SELECT total_mediateurs_formes FROM mediateur_formes) +
              (SELECT total_aidants_connect_formes FROM aidants_connect_formes) AS total_aidants_connect_et_mediateurs_formes
          `
      const aidantsEtMediateursFormes = Number(formesResult[0]?.total_aidants_connect_et_mediateurs_formes || 0)

      // Répartition par certification
      const certificationsResult = territoire === 'France'
        ? await prisma.$queryRaw<Array<{ total: bigint; type_certification: string }>>`
            WITH certifications AS (
                SELECT p.id,
                       unnest(ARRAY[
                           CASE WHEN f.label = 'CCP1' THEN 'CCP1' END,
                           CASE WHEN f.label = 'CCP2' THEN 'CCP2' END,
                           CASE WHEN f.label = 'CCP2 & CCP3' THEN 'CCP2 & CCP3' END,
                           CASE WHEN f.pix IS TRUE THEN 'Pix' END,
                           CASE WHEN f.remn IS TRUE THEN 'REMN' END,
                           CASE WHEN f.label NOT IN ('CCP1','CCP2','CCP2 & CCP3')
                                 AND f.pix IS NOT TRUE
                                 AND f.remn IS NOT TRUE 
                                 AND f.label IS NOT NULL THEN 'Autres' END
                       ]) AS type_certification
                FROM main.personne p
                JOIN main.formation f ON p.id = f.personne_id
            )
            SELECT type_certification, COUNT(*) AS total
            FROM certifications
            WHERE type_certification IS NOT NULL
            GROUP BY type_certification
            ORDER BY total DESC
          `
        : await prisma.$queryRaw<Array<{ total: bigint; type_certification: string }>>`
            WITH certifications AS (
                SELECT p.id,
                       unnest(ARRAY[
                           CASE WHEN f.label = 'CCP1' THEN 'CCP1' END,
                           CASE WHEN f.label = 'CCP2' THEN 'CCP2' END,
                           CASE WHEN f.label = 'CCP2 & CCP3' THEN 'CCP2 & CCP3' END,
                           CASE WHEN f.pix IS TRUE THEN 'Pix' END,
                           CASE WHEN f.remn IS TRUE THEN 'REMN' END,
                           CASE WHEN f.label NOT IN ('CCP1','CCP2','CCP2 & CCP3')
                                 AND f.pix IS NOT TRUE
                                 AND f.remn IS NOT TRUE 
                                 AND f.label IS NOT NULL THEN 'Autres' END
                       ]) AS type_certification
                FROM main.personne p
                LEFT JOIN main.formation f ON p.id = f.personne_id
                LEFT JOIN main.structure s ON p.structure_id = s.id
                LEFT JOIN main.personne_structures_emplois pl ON p.id = pl.personne_id
                LEFT JOIN main.structure s2 ON s2.id = pl.structure_id
                LEFT JOIN main.adresse a ON COALESCE(s.adresse_id, s2.adresse_id) = a.id
                WHERE a.departement = ${territoire}
            )
            SELECT type_certification, COUNT(*) AS total
            FROM certifications
            WHERE type_certification IS NOT NULL
            GROUP BY type_certification
            ORDER BY total DESC
          `

      const formations = certificationsResult.map(cert => ({
        nom: cert.type_certification,
        nombre: Number(cert.total),
      }))

      return {
        aidantsEtMediateursFormes,
        formations,
        totalAidantsEtMediateurs,
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaNiveauDeFormationLoader', {
        operation: 'get',
        territoire,
      })
      return {
        message: 'Impossible de récupérer les données de niveau de formation',
        type: 'error',
      }
    }
  }
}