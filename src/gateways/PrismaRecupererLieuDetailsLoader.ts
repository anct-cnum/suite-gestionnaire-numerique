import prisma from '../../prisma/prismaClient'
import { LieuDetailsReadModel, RecupererLieuDetailsLoader } from '@/use-cases/queries/RecupererLieuDetails'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaRecupererLieuDetailsLoader implements RecupererLieuDetailsLoader {
  async recuperer(id: string): Promise<ErrorReadModel | LieuDetailsReadModel> {
    try {
      // Refonte 2026 : id = main.lieu_inclusion.id (et non plus main.structure.id legacy).
      // La SA "principale" est resolue via la table d'asso (LATERAL LIMIT 1, cf N8).
      const structureResult = await this.recupererStructure(id)
      if (structureResult.length === 0) {
        return { message: 'Lieu non trouvé', type: 'error' } as ErrorReadModel
      }

      const structure = structureResult[0]
      const adresseComplete = this.construireAdresse(structure)
      const personnes = await this.recupererPersonnes(id)
      const tags = this.determinerTags(structure, personnes)
      // structureId du read model = SA.id (utilise par la page pour les lookups
      // sur min.membre.structureId et les checks de permission). Fallback sur
      // lieu_inclusion.id si aucune SA associee (peu probable mais defensif).
      const structureId = structure.structure_administrative_id ?? parseInt(id, 10)

      return this.construireReadModel(structure, adresseComplete, personnes, tags, structureId)
    } catch {
      return { message: 'Erreur interne du serveur', type: 'error' } as ErrorReadModel
    }
  }

  private construireAdresse(structure: {
    code_postal: null | string
    nom_commune: null | string
    nom_voie: null | string
    numero_voie: null | number
  }): string {
    return [
      structure.numero_voie === null ? null : structure.numero_voie.toString(),
      structure.nom_voie,
      structure.code_postal,
      structure.nom_commune,
    ]
      .filter(Boolean)
      .join(' ')
  }

  private construireLieuAccueilPublic(structure: {
    contact: null | Record<string, unknown>
    dispositif_programmes_nationaux: Array<string> | null
    frais_a_charge: Array<string> | null
    horaires: null | string
    itinerance: Array<string> | null
    modalites_acces: Array<string> | null
    modalites_accompagnement: Array<string> | null
    presentation_detail: null | string
    presentation_resume: null | string
    prise_en_charge_specifique: Array<string> | null
    prise_rdv: null | string
    publics_specifiquement_adresses: Array<string> | null
    typologies: Array<string> | null
  }): LieuDetailsReadModel['lieuAccueilPublic'] {
    const contactInfo = this.extraireContactInfo(structure.contact)

    return {
      conseillerNumeriqueLabellePhase2:
        structure.dispositif_programmes_nationaux?.includes('Conseillers numériques') ?? false,
      conseillerNumeriqueLabellePhase3: false,
      email: contactInfo.email,
      fraisACharge: structure.frais_a_charge ?? [],
      horaires: structure.horaires ?? undefined,
      itinerance: structure.itinerance ?? [],
      modalitesAcces: structure.modalites_acces ?? [],
      modalitesAccueil: structure.modalites_accompagnement?.join(', ') ?? undefined,
      presentationDetail: structure.presentation_detail ?? undefined,
      presentationResume: structure.presentation_resume ?? undefined,
      priseEnChargeSpecifique: structure.prise_en_charge_specifique ?? [],
      priseRdvUrl: structure.prise_rdv ?? undefined,
      publicsSpecifiquementAdresses: structure.publics_specifiquement_adresses ?? [],
      telephone: contactInfo.telephone,
      typologies: structure.typologies ?? [],
      websiteUrl: contactInfo.websiteUrl,
    }
  }

  private construireReadModel(
    structure: {
      code_postal: null | string
      contact: null | Record<string, unknown>
      dispositif_programmes_nationaux: Array<string> | null
      edited_by: null | string
      frais_a_charge: Array<string> | null
      horaires: null | string
      itinerance: Array<string> | null
      modalites_acces: Array<string> | null
      modalites_accompagnement: Array<string> | null
      nom: string
      presentation_detail: null | string
      presentation_resume: null | string
      prise_en_charge_specifique: Array<string> | null
      prise_rdv: null | string
      publics_specifiquement_adresses: Array<string> | null
      services: Array<string> | null
      siret: null | string
      typologies: Array<string> | null
      updated_at: Date | null
    },
    adresseComplete: string,
    personnes: Array<{
      contact: null | Record<string, unknown>
      est_actuellement_conseiller_numerique: boolean
      id: number
      is_aidant_connect: boolean | null
      is_coordinateur: boolean | null
      is_mediateur: boolean | null
      nom: string
      prenom: string
    }>,
    tags: Array<string>,
    structureId: number
  ): LieuDetailsReadModel {
    const lieuAccueilPublic = this.construireLieuAccueilPublic(structure)
    const personnesTravaillant = personnes.map((personne) => this.mapperPersonne(personne))
    const servicesInclusionNumerique = this.construireServices(structure)
    const codeDepartement = this.extraireCodeDepartement(structure.code_postal)

    return {
      codeDepartement,
      header: {
        editeur: structure.edited_by ?? undefined,
        miseAJourLe: structure.updated_at ?? undefined,
        nom: structure.nom,
        tags,
      },
      informationsGenerales: {
        adresse: adresseComplete.length > 0 ? adresseComplete : 'Adresse non renseignée',
        nomStructure: structure.nom,
        siret: structure.siret ?? undefined,
      },
      lieuAccueilPublic,
      personnesTravaillant,
      servicesInclusionNumerique,
      structureId,
    }
  }

  private construireServices(structure: {
    modalites_acces: Array<string> | null
    services: Array<string> | null
  }): Array<{
    description: undefined
    modalites: Array<string>
    nom: string
    thematiques: Array<string>
  }> {
    return (structure.services ?? []).map((service) => ({
      description: undefined,
      modalites: structure.modalites_acces ?? [],
      nom: service,
      thematiques: [service],
    }))
  }

  private determinerTags(
    structure: {
      dispositif_programmes_nationaux: Array<string> | null
      est_frr: boolean
      est_qpv: boolean
    },
    personnes: Array<{
      est_actuellement_conseiller_numerique: boolean
      is_aidant_connect: boolean | null
      is_mediateur: boolean | null
    }>
  ): Array<string> {
    const tags: Array<string> = []

    // Tag FRR (France Relance Ruralité)
    if (structure.est_frr) {
      tags.push('FRR')
    }

    // Tag QPV (Quartier Prioritaire de la Ville)
    if (structure.est_qpv) {
      tags.push('QPV')
    }

    // Tag Conseiller numérique
    // On affiche le tag si la structure a le dispositif OU si au moins une personne est conseiller numérique
    const hasConseillerNumerique =
      structure.dispositif_programmes_nationaux?.includes('Conseillers numériques') === true ||
      personnes.some((personne) => personne.est_actuellement_conseiller_numerique)
    if (hasConseillerNumerique) {
      tags.push('Conseiller numérique')
    }

    // Tag Médiateur
    // On ne compte que les médiateurs qui ne sont PAS conseillers numériques
    // Une personne peut être à la fois médiateur et aidant
    const hasMediateur = personnes.some(
      (personne) => personne.is_mediateur === true && !personne.est_actuellement_conseiller_numerique
    )
    if (hasMediateur) {
      tags.push('Médiateur')
    }

    // Tag Aidants Connect
    // On ne compte que les aidants qui ne sont PAS conseillers numériques
    // Une personne peut être à la fois aidant et médiateur
    const hasAidantConnect = personnes.some(
      (personne) => personne.is_aidant_connect === true && !personne.est_actuellement_conseiller_numerique
    )
    if (hasAidantConnect) {
      tags.push('Aidants Connect')
    }

    return tags
  }

  private extraireCodeDepartement(codePostal: null | string): string | undefined {
    if (codePostal === null || codePostal.length < 2) {
      return undefined
    }
    // Extraire les 2 premiers caractères du code postal
    return codePostal.slice(0, 2)
  }

  private extraireContactInfo(contact: null | Record<string, unknown>): {
    email: string | undefined
    telephone: string | undefined
    websiteUrl: string | undefined
  } {
    const courriels = contact?.courriels as Record<string, unknown> | undefined
    const emailRaw = courriels?.contact_public
    const email = emailRaw === null ? undefined : (emailRaw as string | undefined)

    const siteWeb = contact?.site_web
    const telephone = contact?.telephone

    return {
      email,
      telephone: telephone === null ? undefined : (telephone as string | undefined),
      websiteUrl: siteWeb === null ? undefined : (siteWeb as string | undefined),
    }
  }

  private mapperPersonne(personne: {
    contact: null | Record<string, unknown>
    est_actuellement_conseiller_numerique: boolean
    id: number
    is_aidant_connect: boolean | null
    is_coordinateur: boolean | null
    is_mediateur: boolean | null
    nom: string
    prenom: string
  }): {
    email: string | undefined
    id: number
    labelisations: Array<'aidants connect' | 'conseiller numérique'>
    nom: string
    prenom: string
    role: string | undefined
    telephone: string | undefined
  } {
    const contact = personne.contact
    const courriels = contact?.courriels as Record<string, unknown> | undefined
    const email = courriels?.mail_pro as string | undefined
    const telephone = contact?.telephone as string | undefined

    let role: string | undefined
    if (personne.est_actuellement_conseiller_numerique) {
      role = 'Conseiller numérique'
    } else if (personne.is_mediateur === true) {
      role = 'Médiateur'
    } else if (personne.is_aidant_connect === true) {
      role = 'Aidant'
    } else if (personne.is_coordinateur === true) {
      role = 'Coordinateur'
    }

    const labelisations: Array<'aidants connect' | 'conseiller numérique'> = []
    if (personne.est_actuellement_conseiller_numerique) {
      labelisations.push('conseiller numérique')
    }
    if (personne.is_aidant_connect === true) {
      labelisations.push('aidants connect')
    }

    return {
      email,
      id: personne.id,
      labelisations,
      nom: personne.nom,
      prenom: personne.prenom,
      role,
      telephone,
    }
  }

  private async recupererPersonnes(id: string): Promise<
    Array<{
      contact: null | Record<string, unknown>
      est_actuellement_conseiller_numerique: boolean
      id: number
      is_aidant_connect: boolean | null
      is_coordinateur: boolean | null
      is_mediateur: boolean | null
      nom: string
      prenom: string
    }>
  > {
    // Refonte 2026 : "personnes travaillant sur ce lieu" = personne_affectations_lieu
    // (anciennement personne_affectations type='lieu_activite'). On distinct sur
    // pe.id pour eviter les doublons si une personne a plusieurs affectations
    // sur ce meme lieu (sources differentes).
    return prisma.$queryRaw`
      SELECT DISTINCT
        pe.id,
        pe.nom,
        pe.prenom,
        pe.contact,
        pe.is_coordinateur,
        pe.is_mediateur,
        pe.est_actuellement_conseiller_numerique,
        pe.labellisation_aidant_connect as is_aidant_connect
      FROM main.personne_affectations_lieu pal
      INNER JOIN min.personne_enrichie pe ON pal.personne_id = pe.id
      WHERE pal.lieu_id = ${parseInt(id, 10)}
        AND pal.est_active = true
    `
  }

  private async recupererStructure(id: string): Promise<
    Array<{
      code_insee: null | string
      code_postal: null | string
      contact: null | Record<string, unknown>
      dispositif_programmes_nationaux: Array<string> | null
      edited_by: null | string
      est_frr: boolean
      est_qpv: boolean
      frais_a_charge: Array<string> | null
      horaires: null | string
      id: string
      itinerance: Array<string> | null
      modalites_acces: Array<string> | null
      modalites_accompagnement: Array<string> | null
      nom: string
      nom_commune: null | string
      nom_voie: null | string
      numero_voie: null | number
      presentation_detail: null | string
      presentation_resume: null | string
      prise_en_charge_specifique: Array<string> | null
      prise_rdv: null | string
      publics_specifiquement_adresses: Array<string> | null
      services: Array<string> | null
      siret: null | string
      structure_administrative_id: null | number
      typologies: Array<string> | null
      updated_at: Date | null
    }>
  > {
    // Refonte 2026 : recupere les champs "lieu" depuis main.lieu_inclusion
    // (typologies, presentation_*, horaires, services, contact JSON…).
    // Le SIRET et l'id de la SA "principale" sont resolus via la table d'asso
    // (LATERAL ordonne par sa.id ASC pour la stabilite, cf N8).
    return prisma.$queryRaw`
      SELECT
        l.id::text,
        l.nom,
        sa_first.siret,
        sa_first.structure_administrative_id,
        l.dispositif_programmes_nationaux,
        l.horaires,
        l.itinerance,
        l.modalites_acces,
        l.modalites_accompagnement,
        l.contact,
        l.typologies,
        l.presentation_resume,
        l.presentation_detail,
        l.prise_en_charge_specifique,
        l.prise_rdv,
        l.publics_specifiquement_adresses,
        l.frais_a_charge,
        l.services,
        l.updated_at,
        l.edited_by,
        a.numero_voie,
        a.nom_voie,
        a.code_postal,
        a.nom_commune,
        a.code_insee,
        CASE
          WHEN EXISTS (
            SELECT 1 FROM admin.zonage z
            WHERE z.type = 'FRR' AND z.code_insee = a.code_insee
          ) THEN true
          ELSE false
        END AS est_frr,
        CASE
          WHEN EXISTS (
            SELECT 1 FROM admin.zonage z
            WHERE z.type = 'QPV' AND public.st_contains(z.geom, a.geom)
          ) THEN true
          ELSE false
        END AS est_qpv
      FROM main.lieu_inclusion l
      LEFT JOIN main.adresse a ON l.adresse_id = a.id
      LEFT JOIN LATERAL (
        SELECT sa.siret, sa.id AS structure_administrative_id
        FROM main.lieu_inclusion_structure_administrative asso
        JOIN main.structure_administrative sa ON sa.id = asso.structure_administrative_id
        WHERE asso.lieu_id = l.id
        ORDER BY sa.id
        LIMIT 1
      ) sa_first ON true
      WHERE l.id = ${parseInt(id, 10)}
    `
  }
}
