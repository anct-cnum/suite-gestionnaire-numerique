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
} from '@prisma/client'

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
import prisma from '../../prisma/prismaClient'
import {
  UpdateLieuInclusionDescriptionData,
  UpdateLieuInclusionDescriptionRepository,
  UpdateLieuInclusionServicesModaliteData,
  UpdateLieuInclusionServicesModaliteRepository,
  UpdateLieuInclusionServicesTypeAccompagnementData,
  UpdateLieuInclusionServicesTypeAccompagnementRepository,
  UpdateLieuInclusionServicesTypePublicData,
  UpdateLieuInclusionServicesTypePublicRepository,
  UpdateLieuInclusionVisibiliteCartographieData,
  UpdateLieuInclusionVisibiliteCartographieRepository,
} from '@/use-cases/commands/shared/LieuInclusionRepository'

export class PrismaLieuInclusionRepository
  implements
    UpdateLieuInclusionDescriptionRepository,
    UpdateLieuInclusionServicesModaliteRepository,
    UpdateLieuInclusionServicesTypeAccompagnementRepository,
    UpdateLieuInclusionServicesTypePublicRepository,
    UpdateLieuInclusionVisibiliteCartographieRepository
{
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
      updated_at_min: Date
    } = { edited_by: 'min', updated_at_min: data.date }

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
      updated_at_min: Date
    } = { edited_by: 'min', updated_at_min: data.date }

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
      updated_at_min: Date
    } = { edited_by: 'min', updated_at_min: data.date }

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
      typologies?: Array<main_typologie>
      updated_at_min: Date
    } = { edited_by: 'min', updated_at_min: data.date }

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
}
