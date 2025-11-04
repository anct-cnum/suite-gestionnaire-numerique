import { Prisma } from '@prisma/client'

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
} from '@/use-cases/commands/shared/LieuInclusionRepository'

export class PrismaLieuInclusionRepository implements
  UpdateLieuInclusionDescriptionRepository,
  UpdateLieuInclusionServicesModaliteRepository,
  UpdateLieuInclusionServicesTypeAccompagnementRepository,
  UpdateLieuInclusionServicesTypePublicRepository {
  async updateDescription(data: UpdateLieuInclusionDescriptionData): Promise<void> {
    const existingStructure = await prisma.main_structure.findUnique({
      select: { contact: true },
      where: { id: data.structureUid.state.value },
    })

    const existingContact = (existingStructure?.contact ?? {}) as Record<string, unknown>
    const updatedContact = this.prepareContactUpdate(existingContact, data.websiteUrl)
    const updateData = this.prepareDescriptionUpdateData(data, updatedContact)

    await prisma.main_structure.update({
      data: updateData,
      where: {
        id: data.structureUid.state.value,
      },
    })
  }

  async updateServicesModalite(data: UpdateLieuInclusionServicesModaliteData): Promise<void> {
    // Récupérer la structure existante pour merger le champ contact (JSON)
    const existingStructure = await prisma.main_structure.findUnique({
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

    // Préparer les données à mettre à jour
    const updateData: {
      contact?: Prisma.InputJsonValue
      frais_a_charge?: Array<string>
      modalites_acces?: Array<string>
    } = {}

    // Mettre à jour les modalités d'accès
    updateData.modalites_acces = [...data.modalitesAcces]

    // Mettre à jour les frais à charge
    updateData.frais_a_charge = [...data.fraisACharge]

    // Mettre à jour le contact si nécessaire
    if (data.telephone !== undefined || data.email !== undefined) {
      updateData.contact = updatedContact as Prisma.InputJsonValue
    }

    // Mettre à jour la structure dans la table main.structure
    await prisma.main_structure.update({
      data: updateData,
      where: {
        id: data.structureUid.state.value,
      },
    })
  }

  async updateServicesTypeAccompagnement(data: UpdateLieuInclusionServicesTypeAccompagnementData): Promise<void> {
    // Préparer les données à mettre à jour
    const updateData: {
      modalites_acces?: Array<string>
      modalites_accompagnement?: Array<string>
      services?: Array<string>
    } = {}

    // Mettre à jour les services (thématiques)
    updateData.services = [...data.thematiques]

    // Mettre à jour les modalités d'accès
    updateData.modalites_acces = [...data.modalites]

    // Mettre à jour les types d'accompagnement (modalites_accompagnement)
    updateData.modalites_accompagnement = [...data.typesAccompagnement]

    // Mettre à jour la structure dans la table main.structure
    await prisma.main_structure.update({
      data: updateData,
      where: {
        id: data.structureUid.state.value,
      },
    })
  }

  async updateServicesTypePublic(data: UpdateLieuInclusionServicesTypePublicData): Promise<void> {
    // Préparer les données à mettre à jour
    const updateData: {
      prise_en_charge_specifique?: Array<string>
      publics_specifiquement_adresses?: Array<string>
    } = {}

    // Mettre à jour les publics spécifiquement adressés
    updateData.publics_specifiquement_adresses = [...data.publicsSpecifiquementAdresses]

    // Mettre à jour les prises en charge spécifiques
    updateData.prise_en_charge_specifique = [...data.priseEnChargeSpecifique]

    // Mettre à jour la structure dans la table main.structure
    await prisma.main_structure.update({
      data: updateData,
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
      horaires?: null | string
      itinerance?: Array<string>
      presentation_detail?: null | string
      presentation_resume?: null | string
      prise_rdv?: null | string
      typologies?: Array<string>
    } {
    const updateData: {
      contact?: Prisma.InputJsonValue
      horaires?: null | string
      itinerance?: Array<string>
      presentation_detail?: null | string
      presentation_resume?: null | string
      prise_rdv?: null | string
      typologies?: Array<string>
    } = {}

    if (data.presentationDetail !== undefined) {
      updateData.presentation_detail = data.presentationDetail === '' ? null : data.presentationDetail
    }

    if (data.presentationResume !== undefined) {
      updateData.presentation_resume = data.presentationResume === '' ? null : data.presentationResume
    }

    if (data.typologie !== undefined) {
      updateData.typologies = data.typologie === '' ? [] : [data.typologie]
    }

    if (data.horaires !== undefined) {
      updateData.horaires = data.horaires === '' ? null : data.horaires
    }

    if (data.priseRdvUrl !== undefined) {
      updateData.prise_rdv = data.priseRdvUrl === '' ? null : data.priseRdvUrl
    }

    if (data.itinerance !== undefined) {
      updateData.itinerance = [...data.itinerance]
    }

    if (data.websiteUrl !== undefined) {
      updateData.contact = updatedContact as Prisma.InputJsonValue
    }

    return updateData
  }
}
