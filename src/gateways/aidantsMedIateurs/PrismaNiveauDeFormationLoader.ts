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
      // Nombre total d'aidants et médiateurs (actuellement en poste)
      const totalResult = territoire === 'France'
        ? await prisma.$queryRaw<Array<{ total_aidants_connect_et_mediateurs: bigint }>>`
            SELECT COUNT(*) AS total_aidants_connect_et_mediateurs
            FROM min.personne_enrichie
            WHERE est_actuellement_mediateur_en_poste = true 
              OR est_actuellement_aidant_numerique_en_poste = true
          `
        : await prisma.$queryRaw<Array<{ total_aidants_connect_et_mediateurs: bigint }>>`
            SELECT COUNT(*) AS total_aidants_connect_et_mediateurs
            FROM min.personne_enrichie
            WHERE (est_actuellement_mediateur_en_poste = true 
              OR est_actuellement_aidant_numerique_en_poste = true)
              AND departement_employeur = ${territoire}
          `
      const totalAidantsEtMediateurs = Number(totalResult[0]?.total_aidants_connect_et_mediateurs || 0)

      // Nombre d'aidants et médiateurs formés (en poste avec au moins une formation)
      const formesResult = territoire === 'France'
        ? await prisma.$queryRaw<Array<{ total_aidants_connect_et_mediateurs_formes: bigint }>>`
            SELECT COUNT(DISTINCT pe.id) AS total_aidants_connect_et_mediateurs_formes
            FROM min.personne_enrichie pe
            WHERE (pe.est_actuellement_mediateur_en_poste = true 
              OR pe.est_actuellement_aidant_numerique_en_poste = true)
              AND EXISTS (
                SELECT 1 FROM main.formation f 
                WHERE f.personne_id = pe.id
              )
          `
        : await prisma.$queryRaw<Array<{ total_aidants_connect_et_mediateurs_formes: bigint }>>`
            SELECT COUNT(DISTINCT pe.id) AS total_aidants_connect_et_mediateurs_formes
            FROM min.personne_enrichie pe
            WHERE (pe.est_actuellement_mediateur_en_poste = true 
              OR pe.est_actuellement_aidant_numerique_en_poste = true)
              AND pe.departement_employeur = ${territoire}
              AND EXISTS (
                SELECT 1 FROM main.formation f 
                WHERE f.personne_id = pe.id
              )
          `
      const aidantsEtMediateursFormes = Number(formesResult[0]?.total_aidants_connect_et_mediateurs_formes || 0)

      // Répartition par certification (pour les personnes en poste)
      const certificationsResult = territoire === 'France'
        ? await prisma.$queryRaw<Array<{ total: bigint; type_certification: string }>>`
            WITH certifications AS (
                SELECT pe.id,
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
                FROM min.personne_enrichie pe
                JOIN main.formation f ON pe.id = f.personne_id
                WHERE (pe.est_actuellement_mediateur_en_poste = true 
                  OR pe.est_actuellement_aidant_numerique_en_poste = true)
            )
            SELECT type_certification, COUNT(*) AS total
            FROM certifications
            WHERE type_certification IS NOT NULL
            GROUP BY type_certification
            ORDER BY total DESC
          `
        : await prisma.$queryRaw<Array<{ total: bigint; type_certification: string }>>`
            WITH certifications AS (
                SELECT pe.id,
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
                FROM min.personne_enrichie pe
                JOIN main.formation f ON pe.id = f.personne_id
                WHERE (pe.est_actuellement_mediateur_en_poste = true 
                  OR pe.est_actuellement_aidant_numerique_en_poste = true)
                  AND pe.departement_employeur = ${territoire}
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