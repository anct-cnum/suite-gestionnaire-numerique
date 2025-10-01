import prisma from '../../prisma/prismaClient'
import {
  LieuDetailsReadModel,
  RecupererLieuDetailsLoader,
} from '@/use-cases/queries/RecupererLieuDetails'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaRecupererLieuDetailsLoader implements RecupererLieuDetailsLoader {
  async recuperer(id: string): Promise<ErrorReadModel | LieuDetailsReadModel> {
    try {
      const structureResult = await this.recupererStructure(id)
      if (structureResult.length === 0) {
        return { message: 'Lieu non trouvé', type: 'error' } as ErrorReadModel
      }

      const structure = structureResult[0]
      const adresseComplete = this.construireAdresse(structure)
      const personnes = await this.recupererPersonnes(id)
      const tags = this.determinerTags(structure)

      return this.construireReadModel(structure, adresseComplete, personnes, tags)
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
    return {
      conseillerNumeriqueLabellePhase2: structure.dispositif_programmes_nationaux?.includes('Conseillers numériques') ?? false,
      conseillerNumeriqueLabellePhase3: false,
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
      telephone: structure.contact?.telephone as string | undefined,
      typologies: structure.typologies ?? [],
      websiteUrl: structure.contact?.site_web as string | undefined,
    }
  }

  private construireReadModel(
    structure: {
      contact: null | Record<string, unknown>
      dispositif_programmes_nationaux: Array<string> | null
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
      conseiller_numerique_id: null | string
      contact: null | Record<string, unknown>
      id: number
      is_active_ac: boolean | null
      is_coordinateur: boolean | null
      is_mediateur: boolean | null
      nom: string
      prenom: string
    }>,
    tags: Array<string>
  ): LieuDetailsReadModel {
    const lieuAccueilPublic = this.construireLieuAccueilPublic(structure)
    const personnesTravaillant = personnes.map((personne) => this.mapperPersonne(personne))
    const servicesInclusionNumerique = this.construireServices(structure)

    return {
      header: {
        modificationDate: structure.updated_at?.toISOString(),
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

  private determinerTags(structure: { dispositif_programmes_nationaux: Array<string> | null }): Array<string> {
    const tags: Array<string> = []
    if (structure.dispositif_programmes_nationaux?.includes('Conseillers numériques') === true) {
      tags.push('Conseiller numérique')
    }

    return tags
  }

  private mapperPersonne(personne: {
    conseiller_numerique_id: null | string
    contact: null | Record<string, unknown>
    id: number
    is_active_ac: boolean | null
    is_coordinateur: boolean | null
    is_mediateur: boolean | null
    nom: string
    prenom: string
  }): {
      email: string | undefined
      id: number
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
    if (personne.conseiller_numerique_id !== null) {
      role = 'Conseiller numérique'
    } else if (personne.is_mediateur === true) {
      role = 'Médiateur'
    } else if (personne.is_active_ac === true) {
      role = 'Aidant'
    } else if (personne.is_coordinateur === true) {
      role = 'Coordinateur'
    }

    return {
      email,
      id: personne.id,
      nom: personne.nom,
      prenom: personne.prenom,
      role,
      telephone,
    }
  }

  private async recupererPersonnes(id: string): Promise<
    Array<{
      conseiller_numerique_id: null | string
      contact: null | Record<string, unknown>
      id: number
      is_active_ac: boolean | null
      is_coordinateur: boolean | null
      is_mediateur: boolean | null
      nom: string
      prenom: string
    }>
  > {
    return prisma.$queryRaw`
      SELECT DISTINCT
        p.id,
        p.nom,
        p.prenom,
        p.contact,
        p.is_coordinateur,
        p.is_mediateur,
        p.conseiller_numerique_id,
        p.is_active_ac
      FROM main.personne_affectations pa
      INNER JOIN main.personne p ON pa.personne_id = p.id
      WHERE pa.structure_id = ${parseInt(id, 10)}
        AND pa.suppression IS NULL
    `
  }

  private async recupererStructure(id: string): Promise<
    Array<{
      code_postal: null | string
      contact: null | Record<string, unknown>
      dispositif_programmes_nationaux: Array<string> | null
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
      typologies: Array<string> | null
      updated_at: Date | null
    }>
  > {
    return prisma.$queryRaw`
      SELECT
        s.id::text,
        s.nom,
        s.siret,
        s.dispositif_programmes_nationaux,
        s.horaires,
        s.itinerance,
        s.modalites_acces,
        s.modalites_accompagnement,
        s.contact,
        s.typologies,
        s.presentation_resume,
        s.presentation_detail,
        s.prise_en_charge_specifique,
        s.prise_rdv,
        s.publics_specifiquement_adresses,
        s.frais_a_charge,
        s.services,
        s.updated_at,
        a.numero_voie,
        a.nom_voie,
        a.code_postal,
        a.nom_commune
      FROM main.structure s
      LEFT JOIN main.adresse a ON s.adresse_id = a.id
      WHERE s.id = ${parseInt(id, 10)}
    `
  }
}
