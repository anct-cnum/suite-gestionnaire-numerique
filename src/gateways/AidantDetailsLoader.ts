import { reportLoaderError } from './shared/sentryErrorReporter'
import prisma from '../../prisma/prismaClient'
import {
  AidantDetailsErrorReadModel,
  AidantDetailsLoader,
  AidantDetailsReadModel,
  ContactReferentReadModel,
} from '@/use-cases/queries/RecupererAidantDetails'

export default class PrismaAidantDetailsLoader implements AidantDetailsLoader {
  async findById(id: string): Promise<AidantDetailsErrorReadModel | AidantDetailsReadModel> {
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
          -- Refonte 2026 : personne_enrichie.structure_employeuse_id pointe sur
          -- main.structure_administrative (V092 dataspace). Le nom employeur =
          -- denomination_sirene de la SA.
          COALESCE(main.structure_administrative.denomination_antenne, main.structure_administrative.denomination_sirene) as employeur_raison_social,
          reference.categories_juridiques.nom as employeur_categorie_juridique,
          main.structure_administrative.siret as employeur_siret,
          main.structure_administrative.contact as employeur_contact_referent,
          main.adresse.code_postal as employeur_code_postal,
          main.adresse.nom_commune as employeur_nom_commune,
          main.adresse.nom_voie as employeur_nom_voie,
          main.adresse.numero_voie as employeur_numero_voie,
          admin.departement.nom  as employeur_departement,
          admin.region.nom as employeur_region

        FROM min.personne_enrichie
               LEFT JOIN main.structure_administrative ON main.structure_administrative.id = min.personne_enrichie.structure_employeuse_id
               LEFT JOIN reference.categories_juridiques
                         ON reference.categories_juridiques.code = main.structure_administrative.categorie_juridique
               LEFT JOIN main.adresse ON main.adresse.id = main.structure_administrative.adresse_id
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

      // Refonte 2026 : "lieux d'activite" = lieux ou la personne est active
      // (personne_affectations_lieu, anciennement personne_affectations
      // type='lieu_activite'). Activites_coop est desormais indexe par lieu_id
      // (V084 dataspace). On garde le champ `structure_id` du resultat pour
      // compat ascendante avec le presenter, mais il contient maintenant un
      // lieu_inclusion.id.
      const lieuxActiviteResult = await prisma.$queryRaw<Array<LieuActiviteResult>>`
        SELECT
          lieux.lieu_id AS structure_id,
          l.nom,
          l.structure_cartographie_nationale_id,
          a.numero_voie,
          a.nom_voie,
          a.code_postal,
          a.nom_commune
        FROM (
          SELECT DISTINCT lieu_id
          FROM main.personne_affectations_lieu
          WHERE personne_id = ${personneId}
            AND est_active = true
        ) AS lieux
        LEFT JOIN main.lieu_inclusion l ON l.id = lieux.lieu_id
        LEFT JOIN main.adresse a ON a.id = l.adresse_id
        GROUP BY
          lieux.lieu_id,
          l.nom,
          l.structure_cartographie_nationale_id,
          a.numero_voie,
          a.nom_voie,
          a.code_postal,
          a.nom_commune
        ORDER BY nom;
      `

      return this.mapToReadModel(personne, lieuxActiviteResult)
    } catch (error) {
      reportLoaderError(error, 'PrismaAidantDetailsLoader', {
        id,
        operation: 'findById',
      })
      return {
        message: "Impossible de récupérer les détails de l'aidant",
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
    if (adresse.numeroVoie !== null && adresse.numeroVoie !== undefined) {
      parts.push(String(adresse.numeroVoie))
    }
    if (adresse.nomVoie !== null && adresse.nomVoie !== undefined) {
      parts.push(adresse.nomVoie)
    }
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
    lieuxActiviteData: ReadonlyArray<LieuActiviteResult>
  ): AidantDetailsReadModel {
    // Extraire les informations de contact depuis le JSON
    const contact = (personne.aidant_contact as null | Record<string, unknown>) ?? {}

    // Nouvelle structure: {"coop": {"email": "..."}, "idposte": {"mail_pro": "...", "mail_perso": "..."}}
    const coop = (contact.coop as null | Record<string, unknown>) ?? {}
    const idposte = (contact.idposte as null | Record<string, unknown>) ?? {}

    const emails = [
      coop.email as null | string,
      idposte.mail_pro as null | string,
      idposte.mail_perso as null | string,
    ].filter((email): email is string => Boolean(email))

    return {
      coopId: personne.aidant_coop_uid ?? '',
      emails,
      lieuxActivite: lieuxActiviteData.map((lieu) => ({
        adresse: this.formatAdresse({
          codePostal: lieu.code_postal,
          nomCommune: lieu.nom_commune,
          nomVoie: lieu.nom_voie,
          numeroVoie: lieu.numero_voie,
        }),
        idCoopCarto: lieu.structure_cartographie_nationale_id,
        nom: lieu.nom ?? 'Structure inconnue',
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
      telephone: (coop.telephone as string) || '',
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
