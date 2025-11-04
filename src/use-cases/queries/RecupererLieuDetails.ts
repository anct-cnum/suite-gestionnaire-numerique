import { ErrorReadModel } from './shared/ErrorReadModel'

export interface LieuDetailsReadModel {
  codeDepartement?: string
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
    email?: string
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
  structureId: number
}

export interface RecupererLieuDetailsLoader {
  recuperer(id: string): Promise<ErrorReadModel | LieuDetailsReadModel>
}
