import { ErrorReadModel } from './shared/ErrorReadModel'

export interface LieuDetailsReadModel {
  codeDepartement?: string
  estArchive: boolean
  // Lieu porté par la Coop numérique (structure_coop_id) : la Coop garde sa vérité,
  // MIN le présente en lecture seule (#1951).
  estLieuCoop: boolean
  // Référencé sur la carte nationale (structure_cartographie_nationale_id) : sans ce lien,
  // api.carto ne sert pas le lieu même visible (#1495).
  estReferenceSurLaCarte: boolean
  header: {
    editeur?: string
    miseAJourLe?: Date
    nom: string
    tags: ReadonlyArray<string>
  }
  informationsGenerales: {
    adresse: string
    complementAdresse?: string
    nomStructure: string
    siret?: string
    typologies?: ReadonlyArray<string>
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
    labelisations: ReadonlyArray<'aidants connect' | 'conseiller numérique'>
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
  visiblePourCartographie: boolean
}

export interface RecupererLieuDetailsLoader {
  recuperer(id: string): Promise<ErrorReadModel | LieuDetailsReadModel>
}
