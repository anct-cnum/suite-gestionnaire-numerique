import { journaliserCreateBrut, journaliserTransaction } from './shared/journalisationMin'
import {
  fraisAChargeVersEnum,
  itineranceVersEnum,
  modalitesAccesVersEnum,
  modalitesAccompagnementVersEnum,
  priseEnChargeSpecifiqueVersEnum,
  publicsSpecifiquementAdressesVersEnum,
  servicesVersEnum,
  typologiesVersEnum,
  versEnumsLieuInclusion,
} from './shared/lieuInclusionEnums'
import {
  main_frais_a_charge,
  main_itinerance,
  main_modalite_acces,
  main_modalite_accompagnement,
  main_prise_en_charge_specifique,
  main_public_specifiquement_adresse,
  main_service,
  main_typologie,
  Prisma,
} from '../../prisma/generated/client'
import prisma from '../../prisma/prismaClient'
import {
  AdresseLieuEnrichie,
  AdresseLieuSirene,
  CreerLieuInclusionData,
  CreerLieuInclusionRepository,
  SupprimerLieuInclusionData,
  SupprimerLieuInclusionRepository,
  UpdateLieuInclusionDescriptionData,
  UpdateLieuInclusionDescriptionRepository,
  UpdateLieuInclusionInformationsGeneralesData,
  UpdateLieuInclusionInformationsGeneralesRepository,
  UpdateLieuInclusionServicesModaliteData,
  UpdateLieuInclusionServicesModaliteRepository,
  UpdateLieuInclusionServicesTypeAccompagnementData,
  UpdateLieuInclusionServicesTypeAccompagnementRepository,
  UpdateLieuInclusionServicesTypePublicData,
  UpdateLieuInclusionServicesTypePublicRepository,
  UpdateLieuInclusionVisibiliteCartographieData,
  UpdateLieuInclusionVisibiliteCartographieRepository,
} from '@/use-cases/commands/shared/LieuInclusionRepository'

// Provenance des DONNÉES posée par MIN sur ses écritures métier (jamais sur une
// suppression ni un changement de visibilité : ce sont des états). Même règle
// que la signature coop ('Coop numérique'), cf. docs cycle-de-vie §2.3.
const SOURCE_MIN = 'Mon Inclusion Numérique'

export class PrismaLieuInclusionRepository
  implements
    CreerLieuInclusionRepository,
    SupprimerLieuInclusionRepository,
    UpdateLieuInclusionDescriptionRepository,
    UpdateLieuInclusionInformationsGeneralesRepository,
    UpdateLieuInclusionServicesModaliteRepository,
    UpdateLieuInclusionServicesTypeAccompagnementRepository,
    UpdateLieuInclusionServicesTypePublicRepository,
    UpdateLieuInclusionVisibiliteCartographieRepository
{
  // Création (#1495) : signée MIN (source, edited_by, updated_at_min — cette dernière
  // sort la ligne du cycle de vie nocturne du carto-dag), drapeau carte = choix du
  // gestionnaire, aucun identifiant externe. created_at et updated_at (générée) sont
  // laissés à la base.
  async creer(data: CreerLieuInclusionData): Promise<number> {
    return journaliserTransaction(prisma, async (transaction) => {
      const adresseId = await this.trouverOuCreerAdresseLieu(transaction, data.adresseEnrichie, data.adresseSirene)

      const lieu = await transaction.main_lieu_inclusion.create({
        data: {
          adresse_id: adresseId,
          complement_adresse: data.complementAdresse,
          edited_by: 'min',
          itinerance: versEnumsLieuInclusion(data.itinerance, itineranceVersEnum, 'itinerance'),
          nom: data.nom,
          siret_a_l_enrichissement: data.siret,
          source: SOURCE_MIN,
          typologies: versEnumsLieuInclusion(data.typologies, typologiesVersEnum, 'typologies'),
          updated_at_min: data.date,
          visible_pour_cartographie_nationale: data.visiblePourCartographie,
        },
        select: { id: true },
      })

      return lieu.id
    })
  }

  async supprimer(data: SupprimerLieuInclusionData): Promise<void> {
    await prisma.main_lieu_inclusion.update({
      data: {
        deleted_at: data.date,
        edited_by: 'min',
        updated_at_min: data.date,
        // Un lieu supprimé ne doit plus être publié sur la cartographie nationale.
        visible_pour_cartographie_nationale: false,
      },
      where: {
        id: data.structureUid.state.value,
      },
    })
  }

  async updateDescription(data: UpdateLieuInclusionDescriptionData): Promise<void> {
    const existingStructure = await prisma.main_lieu_inclusion.findUnique({
      select: { contact: true },
      where: { id: data.structureUid.state.value },
    })

    const existingContact = (existingStructure?.contact ?? {}) as Record<string, unknown>
    const updatedContact = this.prepareContactUpdate(existingContact, data.websiteUrl)
    const updateData = this.prepareDescriptionUpdateData(data, updatedContact)

    await prisma.main_lieu_inclusion.update({
      data: updateData,
      where: {
        id: data.structureUid.state.value,
      },
    })
  }

  async updateInformationsGenerales(data: UpdateLieuInclusionInformationsGeneralesData): Promise<void> {
    await journaliserTransaction(prisma, async (transaction) => {
      const adresseId = await this.trouverOuCreerAdresseLieu(transaction, data.adresseEnrichie, data.adresseSirene)

      const updateData: {
        adresse_id: null | number
        complement_adresse: null | string
        edited_by: string
        itinerance?: Array<main_itinerance>
        nom: string
        siret_a_l_enrichissement: null | string
        source: string
        typologies?: Array<main_typologie>
        updated_at_min: Date
      } = {
        adresse_id: adresseId,
        complement_adresse: data.complementAdresse,
        edited_by: 'min',
        nom: data.nom,
        siret_a_l_enrichissement: data.siret,
        source: SOURCE_MIN,
        updated_at_min: data.date,
      }

      if (data.itinerance !== undefined) {
        updateData.itinerance = versEnumsLieuInclusion(data.itinerance, itineranceVersEnum, 'itinerance')
      }

      if (data.typologies !== undefined) {
        updateData.typologies = versEnumsLieuInclusion(data.typologies, typologiesVersEnum, 'typologies')
      }

      await transaction.main_lieu_inclusion.update({
        data: updateData,
        where: {
          id: data.structureUid.state.value,
        },
      })
    })
  }

  async updateServicesModalite(data: UpdateLieuInclusionServicesModaliteData): Promise<void> {
    // Récupérer la structure existante pour merger le champ contact (JSON)
    const existingStructure = await prisma.main_lieu_inclusion.findUnique({
      select: { contact: true },
      where: { id: data.structureUid.state.value },
    })

    // Préparer le champ contact mis à jour
    const existingContact = (existingStructure?.contact ?? {}) as Record<string, unknown>
    const updatedContact: Record<string, unknown> = { ...existingContact }

    // Mettre à jour le téléphone dans le contact
    if (data.telephone !== undefined) {
      updatedContact.telephone = data.telephone === '' ? null : data.telephone
    }

    // Mettre à jour l'email dans le contact
    if (data.email !== undefined) {
      const existingCourriels = (updatedContact.courriels ?? {}) as Record<string, unknown>
      updatedContact.courriels = {
        ...existingCourriels,
        contact_public: data.email === '' ? null : data.email,
      }
    }

    // Préparer les données à mettre à jour (libellés référentiel → enums main, cf lieuInclusionEnums)
    const updateData: {
      contact?: Prisma.InputJsonValue
      edited_by: string
      frais_a_charge?: Array<main_frais_a_charge>
      modalites_acces?: Array<main_modalite_acces>
      source: string
      updated_at_min: Date
    } = { edited_by: 'min', source: SOURCE_MIN, updated_at_min: data.date }

    // Mettre à jour les modalités d'accès
    updateData.modalites_acces = versEnumsLieuInclusion(data.modalitesAcces, modalitesAccesVersEnum, 'modalites_acces')

    // Mettre à jour les frais à charge
    updateData.frais_a_charge = versEnumsLieuInclusion(data.fraisACharge, fraisAChargeVersEnum, 'frais_a_charge')

    // Mettre à jour le contact si nécessaire
    if (data.telephone !== undefined || data.email !== undefined) {
      updateData.contact = updatedContact as Prisma.InputJsonValue
    }

    // Refonte 2026 : ces champs lieu (services, modalites, typologies, horaires…)
    // vivent sur main.lieu_inclusion et plus sur main.structure legacy.
    await prisma.main_lieu_inclusion.update({
      data: updateData,
      where: {
        id: data.structureUid.state.value,
      },
    })
  }

  async updateServicesTypeAccompagnement(data: UpdateLieuInclusionServicesTypeAccompagnementData): Promise<void> {
    // Préparer les données à mettre à jour (libellés référentiel → enums main, cf lieuInclusionEnums)
    const updateData: {
      edited_by: string
      modalites_acces?: Array<main_modalite_acces>
      modalites_accompagnement?: Array<main_modalite_accompagnement>
      services?: Array<main_service>
      source: string
      updated_at_min: Date
    } = { edited_by: 'min', source: SOURCE_MIN, updated_at_min: data.date }

    // Mettre à jour les services (thématiques)
    updateData.services = versEnumsLieuInclusion(data.thematiques, servicesVersEnum, 'services')

    // Mettre à jour les modalités d'accès
    updateData.modalites_acces = versEnumsLieuInclusion(data.modalites, modalitesAccesVersEnum, 'modalites_acces')

    // Mettre à jour les types d'accompagnement (modalites_accompagnement)
    updateData.modalites_accompagnement = versEnumsLieuInclusion(
      data.typesAccompagnement,
      modalitesAccompagnementVersEnum,
      'modalites_accompagnement'
    )

    // Refonte 2026 : ces champs lieu (services, modalites, typologies, horaires…)
    // vivent sur main.lieu_inclusion et plus sur main.structure legacy.
    await prisma.main_lieu_inclusion.update({
      data: updateData,
      where: {
        id: data.structureUid.state.value,
      },
    })
  }

  async updateServicesTypePublic(data: UpdateLieuInclusionServicesTypePublicData): Promise<void> {
    // Préparer les données à mettre à jour (libellés référentiel → enums main, cf lieuInclusionEnums)
    const updateData: {
      edited_by: string
      prise_en_charge_specifique?: Array<main_prise_en_charge_specifique>
      publics_specifiquement_adresses?: Array<main_public_specifiquement_adresse>
      source: string
      updated_at_min: Date
    } = { edited_by: 'min', source: SOURCE_MIN, updated_at_min: data.date }

    // Mettre à jour les publics spécifiquement adressés
    updateData.publics_specifiquement_adresses = versEnumsLieuInclusion(
      data.publicsSpecifiquementAdresses,
      publicsSpecifiquementAdressesVersEnum,
      'publics_specifiquement_adresses'
    )

    // Mettre à jour les prises en charge spécifiques
    updateData.prise_en_charge_specifique = versEnumsLieuInclusion(
      data.priseEnChargeSpecifique,
      priseEnChargeSpecifiqueVersEnum,
      'prise_en_charge_specifique'
    )

    // Refonte 2026 : ces champs lieu (services, modalites, typologies, horaires…)
    // vivent sur main.lieu_inclusion et plus sur main.structure legacy.
    await prisma.main_lieu_inclusion.update({
      data: updateData,
      where: {
        id: data.structureUid.state.value,
      },
    })
  }

  async updateVisibiliteCartographie(data: UpdateLieuInclusionVisibiliteCartographieData): Promise<void> {
    await prisma.main_lieu_inclusion.update({
      data: {
        edited_by: 'min',
        updated_at_min: data.date,
        visible_pour_cartographie_nationale: data.visiblePourCartographie,
      },
      where: {
        id: data.structureUid.state.value,
      },
    })
  }

  private prepareContactUpdate(
    existingContact: Record<string, unknown>,
    websiteUrl: string | undefined
  ): Record<string, unknown> {
    const updatedContact = { ...existingContact }
    if (websiteUrl !== undefined) {
      updatedContact.site_web = websiteUrl === '' ? null : websiteUrl
    }
    return updatedContact
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  private prepareDescriptionUpdateData(
    data: UpdateLieuInclusionDescriptionData,
    updatedContact: Record<string, unknown>
  ): {
    contact?: Prisma.InputJsonValue
    edited_by: string
    horaires?: null | string
    itinerance?: Array<main_itinerance>
    presentation_detail?: null | string
    presentation_resume?: null | string
    prise_rdv?: null | string
    source: string
    typologies?: Array<main_typologie>
    updated_at_min: Date
  } {
    const updateData: {
      contact?: Prisma.InputJsonValue
      edited_by: string
      horaires?: null | string
      itinerance?: Array<main_itinerance>
      presentation_detail?: null | string
      presentation_resume?: null | string
      prise_rdv?: null | string
      source: string
      typologies?: Array<main_typologie>
      updated_at_min: Date
    } = { edited_by: 'min', source: SOURCE_MIN, updated_at_min: data.date }

    if (data.presentationDetail !== undefined) {
      updateData.presentation_detail = data.presentationDetail === '' ? null : data.presentationDetail
    }

    if (data.presentationResume !== undefined) {
      updateData.presentation_resume = data.presentationResume === '' ? null : data.presentationResume
    }

    if (data.typologie !== undefined) {
      updateData.typologies =
        data.typologie === '' ? [] : versEnumsLieuInclusion([data.typologie], typologiesVersEnum, 'typologies')
    }

    if (data.horaires !== undefined) {
      updateData.horaires = data.horaires === '' ? null : data.horaires
    }

    if (data.priseRdvUrl !== undefined) {
      updateData.prise_rdv = data.priseRdvUrl === '' ? null : data.priseRdvUrl
    }

    if (data.itinerance !== undefined) {
      updateData.itinerance = versEnumsLieuInclusion(data.itinerance, itineranceVersEnum, 'itinerance')
    }

    if (data.websiteUrl !== undefined) {
      updateData.contact = updatedContact as Prisma.InputJsonValue
    }

    return updateData
  }

  // Clé naturelle de main.adresse (contrainte adresse_ukey) : NULL ≡ 0 pour le numéro,
  // NULL ≡ '' pour la répétition, comme dans l'index.
  private async trouverAdresseParCleNaturelle(
    transaction: Prisma.TransactionClient,
    cle: CleNaturelleAdresse
  ): Promise<null | number> {
    const lignes = await transaction.$queryRaw<Array<{ id: number }>>`
      SELECT id FROM main.adresse
      WHERE code_postal = ${cle.codePostal}
        AND nom_commune = ${cle.nomCommune}
        AND nom_voie IS NOT DISTINCT FROM ${cle.nomVoie}
        AND COALESCE(numero_voie, 0) = COALESCE(${cle.numeroVoie}::int, 0)
        AND COALESCE(repetition, '') = COALESCE(${cle.repetition}::text, '')
      LIMIT 1
    `

    return lignes[0]?.id ?? null
  }

  // On ne modifie jamais une ligne main.adresse (partagée entre lieux et structures) :
  // on réutilise une adresse existante ou on en crée une nouvelle, puis
  // lieu_inclusion.adresse_id est re-pointé. Réutilisation dans l'ordre : clef BAN, puis
  // clé naturelle (code postal, commune, voie, numéro, répétition — la contrainte unique
  // adresse_ukey, que porte aussi une ligne carto sans clef BAN) ; l'INSERT tolère la
  // course (ON CONFLICT DO NOTHING puis relecture), même contrat que
  // main.trouver_ou_creer_adresse_lieu (dataspace V155).
  private async trouverOuCreerAdresseLieu(
    transaction: Prisma.TransactionClient,
    adresseEnrichie: AdresseLieuEnrichie | null,
    adresseSirene: AdresseLieuSirene | null
  ): Promise<null | number> {
    if (adresseEnrichie !== null) {
      const parClef = await transaction.adresse.findFirst({
        select: { id: true },
        where: { clef_interop: adresseEnrichie.banClefInterop },
      })
      if (parClef) {
        return parClef.id
      }

      const cleNaturelle: CleNaturelleAdresse = {
        codePostal: adresseEnrichie.banCodePostal,
        nomCommune: adresseEnrichie.banNomCommune,
        nomVoie: adresseEnrichie.banNomVoie,
        numeroVoie: adresseEnrichie.banNumeroVoie,
        repetition: adresseEnrichie.banRepetition,
      }
      const parCleNaturelle = await this.trouverAdresseParCleNaturelle(transaction, cleNaturelle)
      if (parCleNaturelle !== null) {
        return parCleNaturelle
      }

      const resultat = await transaction.$queryRaw<Array<{ id: number }>>`
        INSERT INTO main.adresse (
          clef_interop, code_ban, code_insee, code_postal,
          nom_commune, nom_voie, numero_voie, repetition, geom
        ) VALUES (
          ${adresseEnrichie.banClefInterop},
          ${adresseEnrichie.banCodeBan}::uuid,
          ${adresseEnrichie.banCodeInsee},
          ${adresseEnrichie.banCodePostal},
          ${adresseEnrichie.banNomCommune},
          ${adresseEnrichie.banNomVoie},
          ${adresseEnrichie.banNumeroVoie},
          ${adresseEnrichie.banRepetition},
          public.ST_Point(${adresseEnrichie.banLongitude}::double precision, ${adresseEnrichie.banLatitude}::double precision, 4326)
        )
        ON CONFLICT (code_postal, nom_commune, nom_voie, COALESCE(numero_voie, 0), COALESCE(repetition, '')) DO NOTHING
        RETURNING id
      `
      if (resultat.length === 0) {
        // Course perdue : une transaction concurrente vient d'insérer la même adresse.
        return this.trouverAdresseParCleNaturelle(transaction, cleNaturelle)
      }
      await journaliserCreateBrut(transaction, 'main.adresse', resultat[0].id)

      return resultat[0].id
    }

    if (adresseSirene !== null) {
      const existante = await this.trouverAdresseParCleNaturelle(transaction, {
        codePostal: adresseSirene.codePostal,
        nomCommune: adresseSirene.commune,
        nomVoie: adresseSirene.nomVoie,
        numeroVoie: adresseSirene.numeroVoie,
        repetition: null,
      })
      if (existante !== null) {
        return existante
      }

      // Les champs BAN restent NULL (clef_interop, code_ban, geom, repetition)
      const creee = await transaction.adresse.create({
        data: {
          code_insee: adresseSirene.codeInsee,
          code_postal: adresseSirene.codePostal,
          nom_commune: adresseSirene.commune,
          nom_voie: adresseSirene.nomVoie,
          numero_voie: adresseSirene.numeroVoie,
        },
        select: { id: true },
      })

      return creee.id
    }

    return null
  }
}

type CleNaturelleAdresse = Readonly<{
  codePostal: string
  nomCommune: string
  nomVoie: string
  numeroVoie: null | number
  repetition: null | string
}>
