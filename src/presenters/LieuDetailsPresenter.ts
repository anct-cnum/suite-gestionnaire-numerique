import { LieuDetailsReadModel } from '@/use-cases/queries/RecupererLieuDetails'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export function lieuDetailsPresenter(
  lieuDetailsReadModel: ErrorReadModel | LieuDetailsReadModel
): LieuInclusionDetailsData | null {
  if (isErrorReadModel(lieuDetailsReadModel)) {
    return null
  }

  return {
    header: {
      modificationAuteur: lieuDetailsReadModel.header.modificationAuteur,
      modificationDate: lieuDetailsReadModel.header.modificationDate,
      nom: lieuDetailsReadModel.header.nom,
      tags: lieuDetailsReadModel.header.tags,
    },
    informationsGenerales: {
      adresse: lieuDetailsReadModel.informationsGenerales.adresse,
      complementAdresse: lieuDetailsReadModel.informationsGenerales.complementAdresse,
      nomStructure: lieuDetailsReadModel.informationsGenerales.nomStructure,
      siret: lieuDetailsReadModel.informationsGenerales.siret,
    },
    lieuAccueilPublic: {
      accessibilite: lieuDetailsReadModel.lieuAccueilPublic.accessibilite,
      conseillerNumeriqueLabellePhase2: lieuDetailsReadModel.lieuAccueilPublic.conseillerNumeriqueLabellePhase2,
      conseillerNumeriqueLabellePhase3: lieuDetailsReadModel.lieuAccueilPublic.conseillerNumeriqueLabellePhase3,
      fraisACharge: lieuDetailsReadModel.lieuAccueilPublic.fraisACharge,
      horaires: lieuDetailsReadModel.lieuAccueilPublic.horaires,
      itinerance: lieuDetailsReadModel.lieuAccueilPublic.itinerance,
      modalitesAcces: lieuDetailsReadModel.lieuAccueilPublic.modalitesAcces,
      modalitesAccueil: lieuDetailsReadModel.lieuAccueilPublic.modalitesAccueil,
      presentationDetail: lieuDetailsReadModel.lieuAccueilPublic.presentationDetail,
      presentationResume: lieuDetailsReadModel.lieuAccueilPublic.presentationResume,
      priseEnChargeSpecifique: lieuDetailsReadModel.lieuAccueilPublic.priseEnChargeSpecifique,
      priseRdvUrl: lieuDetailsReadModel.lieuAccueilPublic.priseRdvUrl,
      publicsSpecifiquementAdresses: lieuDetailsReadModel.lieuAccueilPublic.publicsSpecifiquementAdresses,
      telephone: lieuDetailsReadModel.lieuAccueilPublic.telephone,
      typologies: lieuDetailsReadModel.lieuAccueilPublic.typologies,
      websiteUrl: lieuDetailsReadModel.lieuAccueilPublic.websiteUrl,
    },
    personnesTravaillant: lieuDetailsReadModel.personnesTravaillant,
    servicesInclusionNumerique: lieuDetailsReadModel.servicesInclusionNumerique,
  }
}

function isErrorReadModel(
  model: ErrorReadModel | LieuDetailsReadModel
): model is ErrorReadModel {
  return 'type' in model
}

interface LieuInclusionDetailsData {
  header: {
    modificationAuteur?: string
    modificationDate?: string
    nom: string
    tags: ReadonlyArray<string>
  }
  informationsGenerales: {
    adresse: string
    complementAdresse?: string
    nomStructure: string
    siret?: string
  }
  lieuAccueilPublic: {
    accessibilite?: string
    conseillerNumeriqueLabellePhase2?: boolean
    conseillerNumeriqueLabellePhase3?: boolean
    fraisACharge?: ReadonlyArray<string>
    horaires?: string
    itinerance?: ReadonlyArray<string>
    modalitesAcces?: ReadonlyArray<string>
    modalitesAccueil?: string
    presentationDetail?: string
    presentationResume?: string
    priseEnChargeSpecifique?: ReadonlyArray<string>
    priseRdvUrl?: string
    publicsSpecifiquementAdresses?: ReadonlyArray<string>
    telephone?: string
    typologies?: ReadonlyArray<string>
    websiteUrl?: string
  }
  personnesTravaillant: ReadonlyArray<{
    email?: string
    id: number
    nom: string
    prenom: string
    role?: string
    telephone?: string
  }>
  servicesInclusionNumerique: ReadonlyArray<{
    description?: string
    modalites: ReadonlyArray<string>
    nom: string
    thematiques: ReadonlyArray<string>
  }>
}