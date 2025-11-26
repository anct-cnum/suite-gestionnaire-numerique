import { reportLoaderError } from './shared/sentryErrorReporter'
import prisma from '../../prisma/prismaClient'
import {
  AidantDetailsErrorReadModel,
  AidantDetailsLoader,
  AidantDetailsReadModel,
  ContactReferentReadModel,
} from '@/use-cases/queries/RecupererAidantDetails'

export default class PrismaAidantDetailsLoader implements AidantDetailsLoader {
  async findById(id: string, graphiquePeriode: 'journalier' | 'mensuel' = 'mensuel'): Promise<AidantDetailsErrorReadModel | AidantDetailsReadModel> {
    const personneId = parseInt(id, 10)

    try {
      const personneResult = await prisma.$queryRaw<Array<PersonneEnrichieResult>>`
        SELECT
          min.personne_enrichie.id as aidant_id,
          min.personne_enrichie.coop_id as aidant_coop_uid,
          min.personne_enrichie.prenom as aidant_prenom,
          min.personne_enrichie.nom as aidant_nom,
          min.personne_enrichie.contact as aidant_contact,
          min.personne_enrichie.est_actuellement_coordo_actif,
          min.personne_enrichie.est_actuellement_conseiller_numerique,
          min.personne_enrichie.est_actuellement_aidant_numerique_en_poste,
          min.personne_enrichie.est_actuellement_mediateur_en_poste,
          min.personne_enrichie.labellisation_aidant_connect,
          main.structure.nom as employeur_raison_social,
          reference.categories_juridiques.nom as employeur_categorie_juridique,
          main.structure.siret as employeur_siret,
          main.structure.contact as employeur_contact_referent,
          main.adresse.code_postal as employeur_code_postal,
          main.adresse.nom_commune as employeur_nom_commune,
          main.adresse.nom_voie as employeur_nom_voie,
          main.adresse.numero_voie as employeur_numero_voie,
          admin.departement.nom  as employeur_departement,
          admin.region.nom as employeur_region

        FROM min.personne_enrichie
               LEFT JOIN main.structure ON main.structure.id = min.personne_enrichie.structure_employeuse_id
               LEFT JOIN reference.categories_juridiques
                         ON reference.categories_juridiques.code = main.structure.categorie_juridique
               LEFT JOIN main.adresse ON main.adresse.id = main.structure.adresse_id
               LEFT JOIN admin.departement ON admin.departement.code = main.adresse.departement
               LEFT JOIN admin.region ON admin.region.id = admin.departement.region_id
        WHERE min.personne_enrichie.id = ${personneId}
      `
      if (personneResult.length === 0) {
        return {
          message: 'Personne non trouvée',
          type: 'error',
        }
      }

      const personne = personneResult[0]
      // Récupérer les accompagnements depuis activites_coop
      const accompagnementsCoopResult = await prisma.$queryRaw<Array<{ total_accompagnements: number }>>`
        SELECT
          COALESCE(SUM(main.activites_coop.accompagnements), 0) as total_accompagnements
        FROM main.activites_coop
        WHERE main.activites_coop.personne_id = ${personneId}
        GROUP BY main.activites_coop.personne_id
      `
      // Récupérer les accompagnements individuels
      const accompagnementsIndividuelsResult = await prisma.$queryRaw<Array<{ total_individuels: number }>>`
        SELECT
          COALESCE(SUM(main.activites_coop.accompagnements), 0) as total_individuels
        FROM main.activites_coop
        WHERE main.activites_coop.personne_id = ${personneId}
          AND main.activites_coop.type = 'individuel'
        GROUP BY main.activites_coop.personne_id
      `
      // Récupérer les ateliers collectifs
      const ateliersResult = await prisma.$queryRaw<Array<{ nombre_ateliers: number; total_participations: number }>>`
        SELECT
          COALESCE(COUNT(*), 0) as nombre_ateliers,
          COALESCE(SUM(main.activites_coop.accompagnements), 0) as total_participations
        FROM main.activites_coop
        WHERE main.activites_coop.personne_id = ${personneId}
          AND main.activites_coop.type = 'collectif'
        GROUP BY main.activites_coop.personne_id
      `
      // Récupérer les accompagnements AidantConnect
      const accompagnementsAcResult = await prisma.$queryRaw<Array<{ total_accompagnements_ac: number }>>`
        SELECT
          COALESCE(main.personne.nb_accompagnements_ac, 0) as total_accompagnements_ac
        FROM main.personne
        WHERE id = ${personneId}
      `
      // Récupérer les données du graphique selon la période demandée
      let graphiqueData: Array<{ date: string; totalAccompagnements: number }>

      if (graphiquePeriode === 'journalier') {
        // Requête par jour - 30 derniers jours uniquement
        const graphiqueJourResult = await prisma.$queryRaw<Array<{ date: string; total_accompagnements: number }>>`
          SELECT
            main.activites_coop.date::text as date,
            COALESCE(SUM(main.activites_coop.accompagnements), 0) as total_accompagnements
          FROM main.activites_coop
          WHERE main.activites_coop.personne_id = ${personneId}
            AND main.activites_coop.date >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY main.activites_coop.date
          ORDER BY main.activites_coop.date
        `

        graphiqueData = graphiqueJourResult.map(row => ({
          date: row.date,
          totalAccompagnements: Number(row.total_accompagnements),
        }))
      } else {
        // Requête par mois (par défaut) - 12 derniers mois uniquement
        const graphiqueMoisResult = await prisma.$queryRaw<Array<{ mois: string; total_accompagnements: number }>>`
          SELECT
            TO_CHAR(DATE_TRUNC('month', ac.date), 'YYYY-MM') AS mois,
            COALESCE(SUM(ac.accompagnements), 0) AS total_accompagnements
          FROM main.personne p
          LEFT JOIN main.activites_coop ac
            ON ac.personne_id = p.id
          WHERE p.id = ${personneId}
            AND ac.date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
          GROUP BY DATE_TRUNC('month', ac.date)
          ORDER BY DATE_TRUNC('month', ac.date)
        `

        graphiqueData = graphiqueMoisResult.map(row => ({
          date: row.mois,
          totalAccompagnements: Number(row.total_accompagnements),
        }))
      }

      // Récupérer les lieux d'activité
      const lieuxActiviteResult = await prisma.$queryRaw<Array<LieuActiviteResult>>`
        SELECT
          main.activites_coop.structure_id,
          main.structure.nom,
          COALESCE(
            SUM(main.activites_coop.accompagnements) FILTER (
            WHERE main.activites_coop.date >= CURRENT_DATE - INTERVAL '30 days'
              ), 0) AS total_accompagnements,
          main.structure.structure_cartographie_nationale_id,
          main.adresse.numero_voie,
          main.adresse.nom_voie,
          main.adresse.code_postal,
          main.adresse.nom_commune
        FROM main.personne_affectations
               LEFT JOIN main.activites_coop
                         ON main.activites_coop.structure_id = main.personne_affectations.structure_id
               LEFT JOIN main.structure
                         ON main.structure.id = main.activites_coop.structure_id
               LEFT JOIN main.adresse
                         ON main.adresse.id = main.structure.adresse_id
        WHERE
          main.personne_affectations.personne_id = ${personneId}
          AND main.personne_affectations.suppression IS NULL
          AND main.personne_affectations.type = 'lieu_activite'
        GROUP BY
          main.activites_coop.structure_id,
          main.structure.nom,
          main.structure.structure_cartographie_nationale_id,
          main.adresse.numero_voie,
          main.adresse.nom_voie,
          main.adresse.code_postal,
          main.adresse.nom_commune
        ORDER BY total_accompagnements DESC;
      `
      const totalAccompagnementsCoop = accompagnementsCoopResult.length > 0 ?
        Number(accompagnementsCoopResult[0].total_accompagnements) : 0
      const totalAccompagnementsAc = accompagnementsAcResult.length > 0 ?
        Number(accompagnementsAcResult[0].total_accompagnements_ac) : 0
      const totalIndividuels = accompagnementsIndividuelsResult.length > 0 ?
        Number(accompagnementsIndividuelsResult[0].total_individuels) : 0
      const nombreAteliers = ateliersResult.length > 0 ?
        Number(ateliersResult[0].nombre_ateliers) : 0
      const totalParticipationsAteliers = ateliersResult.length > 0 ?
        Number(ateliersResult[0].total_participations) : 0

      return this.mapToReadModel(
        personne,
        totalAccompagnementsCoop,
        totalAccompagnementsAc,
        totalIndividuels,
        nombreAteliers,
        totalParticipationsAteliers,
        graphiqueData,
        lieuxActiviteResult
      )
    } catch (error) {
      reportLoaderError(error, 'PrismaAidantDetailsLoader', {
        id,
        operation: 'findById',
      })
      return {
        message: 'Impossible de récupérer les détails de l\'aidant',
        type: 'error',
      }
    }
  }

  private formatAdresse(adresse: {
    codePostal?: null | string
    nomCommune?: null | string
    nomVoie?: null | string
    numeroVoie?: null | number
  }): string {
    const parts = []
    if (adresse.numeroVoie !== null && adresse.numeroVoie !== undefined) {parts.push(String(adresse.numeroVoie))}
    if (adresse.nomVoie !== null && adresse.nomVoie !== undefined) {parts.push(adresse.nomVoie)}
    const hasPostalCode = adresse.codePostal !== null && adresse.codePostal !== undefined
    const hasCommune = adresse.nomCommune !== null && adresse.nomCommune !== undefined
    if (hasPostalCode && hasCommune) {
      parts.push(`${adresse.codePostal} ${adresse.nomCommune}`)
    }
    return parts.join(', ')
  }

  private generateTags(personne: PersonneEnrichieResult): ReadonlyArray<string> {
    const tags: Array<string> = []

    if (personne.est_actuellement_coordo_actif === true) {
      tags.push('Coordinateur')
    }

    if (personne.est_actuellement_conseiller_numerique === true) {
      tags.push('Conseiller numérique')
    }

    if (personne.est_actuellement_aidant_numerique_en_poste === true) {
      tags.push('Aidant numérique')
    }

    if (personne.est_actuellement_mediateur_en_poste === true) {
      tags.push('Médiateur')
    }

    if (personne.labellisation_aidant_connect === true) {
      tags.push('Aidant Connect')
    }

    return tags
  }

  private mapToReadModel(
    personne: PersonneEnrichieResult,
    totalAccompagnementsCoop: number,
    totalAccompagnementsAc: number,
    totalIndividuels: number,
    nombreAteliers: number,
    totalParticipationsAteliers: number,
    graphiqueData: ReadonlyArray<Readonly<{ date: string; totalAccompagnements: number }>>,
    lieuxActiviteData: ReadonlyArray<LieuActiviteResult>
  ): AidantDetailsReadModel {
    // Extraire les informations de contact depuis le JSON
    const contact = (personne.aidant_contact as null | Record<string, unknown>) ?? {}

    return {
      accompagnements: {
        avecAidantsConnect: totalAccompagnementsAc,
        individuels: totalIndividuels,
        nombreAteliers,
        participationsAteliers: totalParticipationsAteliers,
        total: totalAccompagnementsCoop + totalAccompagnementsAc,
      },
      coopId: personne.aidant_coop_uid ?? '',
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      email: ((contact.courriels as Record<string, unknown>)?.mail_pro as string) || '',
      graphiqueAccompagnements: graphiqueData,
      lieuxActivite: lieuxActiviteData.map(lieu => ({
        adresse: this.formatAdresse({
          codePostal: lieu.code_postal,
          nomCommune: lieu.nom_commune,
          nomVoie: lieu.nom_voie,
          numeroVoie: lieu.numero_voie,
        }),
        idCoopCarto: lieu.structure_cartographie_nationale_id,
        nom: lieu.nom ?? 'Structure inconnue',
        nombreAccompagnements: Number(lieu.total_accompagnements),
      })),
      nom: personne.aidant_nom ?? '',
      prenom: personne.aidant_prenom ?? '',
      structureEmployeuse: {
        adresse: this.formatAdresse({
          codePostal: personne.employeur_code_postal,
          nomCommune: personne.employeur_nom_commune,
          nomVoie: personne.employeur_nom_voie,
          numeroVoie: personne.employeur_numero_voie,
        }),
        contactReferent: this.parseContactReferent(personne.employeur_contact_referent),
        departement: personne.employeur_departement ?? '',
        nom: personne.employeur_raison_social ?? '',
        region: personne.employeur_region ?? '',
        siret: personne.employeur_siret ?? '',
        type: personne.employeur_categorie_juridique ?? '',
      },
      tags: this.generateTags(personne),
      telephone: (contact.telephone as string) || '',
    }
  }

  private parseContactReferent(contactReferentJson: unknown): ContactReferentReadModel {
    try {
      const contact = (contactReferentJson as null | Record<string, unknown>) ?? {}
      const courriels = (contact.courriels as Array<string> | null) ?? []
      return {
        email: courriels[0] || '',
        nom: (contact.nom as string) || '',
        post: (contact.poste as string) || (contact.fonction as string) || '',
        prenom: (contact.prenom as string) || '',
        telephone: (contact.telephone as string) || '',
      }
    } catch {
      return {
        email: '',
        nom: '',
        post: '',
        prenom: '',
        telephone: '',
      }
    }
  }
}

type LieuActiviteResult = Readonly<{
  code_postal: null | string
  nom: null | string
  nom_commune: null | string
  nom_voie: null | string
  numero_voie: null | number
  structure_cartographie_nationale_id: null | string
  structure_id: null | number
  total_accompagnements: number
}>

type PersonneEnrichieResult = Readonly<{
  aidant_contact: unknown
  aidant_coop_uid: null | string
  aidant_id: number
  aidant_nom: null | string
  aidant_prenom: null | string
  employeur_categorie_juridique: null | string
  employeur_code_postal: null | string
  employeur_contact_referent: unknown
  employeur_departement: null | string
  employeur_nom_commune: null | string
  employeur_nom_voie: null | string
  employeur_numero_voie: null | number
  employeur_raison_social: null | string
  employeur_region: null | string
  employeur_siret: null | string
  est_actuellement_aidant_numerique_en_poste: boolean | null
  est_actuellement_conseiller_numerique: boolean | null
  est_actuellement_coordo_actif: boolean | null
  est_actuellement_mediateur_en_poste: boolean | null
  labellisation_aidant_connect: boolean | null
}>

