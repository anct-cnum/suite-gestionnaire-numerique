import { StructureUid } from '@/domain/Structure'

export interface UpdateLieuInclusionDescriptionRepository {
  updateDescription(data: UpdateLieuInclusionDescriptionData): Promise<void>
}

export type UpdateLieuInclusionDescriptionData = Readonly<{
  date: Date
  horaires?: string
  itinerance?: ReadonlyArray<string>
  presentationDetail?: string
  presentationResume?: string
  priseRdvUrl?: string
  structureUid: StructureUid
  typologie?: string
  websiteUrl?: string
}>

export interface UpdateLieuInclusionInformationsGeneralesRepository {
  // Lu avant d'écrire : sert à savoir si une adresse perdant son adresse BAN doit forcer
  // la visibilité à false (#1495), sans quoi un lieu déjà publié resterait visible sans BAN.
  estVisiblePourCartographie(structureUid: StructureUid): Promise<boolean>
  updateInformationsGenerales(data: UpdateLieuInclusionInformationsGeneralesData): Promise<void>
}

// L'adresse n'est jamais modifiée en place : le repository réutilise une ligne main.adresse
// existante ou en crée une nouvelle, puis re-pointe lieu_inclusion.adresse_id.
export type AdresseLieuEnrichie = Readonly<{
  banClefInterop: string
  banCodeBan: null | string
  banCodeInsee: string
  banCodePostal: string
  banLatitude: number
  banLongitude: number
  banNomCommune: string
  banNomVoie: string
  banNumeroVoie: null | number
  banRepetition: null | string
}>

export type AdresseLieuSirene = Readonly<{
  codeInsee: string
  codePostal: string
  commune: string
  nomVoie: string
  numeroVoie: null | number
}>

export type UpdateLieuInclusionInformationsGeneralesData = Readonly<{
  adresseEnrichie: AdresseLieuEnrichie | null
  adresseSirene: AdresseLieuSirene | null
  complementAdresse: null | string
  date: Date
  itinerance?: ReadonlyArray<string>
  nom: string
  siret: null | string
  structureUid: StructureUid
  typologies?: ReadonlyArray<string>
  // Renseigné seulement pour forcer la visibilité à false (#1495) ; omis sinon, cette
  // commande ne gérant pas la visibilité au quotidien (cf. ModifierLieuInclusionVisibiliteCartographie).
  visiblePourCartographie?: false
}>

export interface CreerLieuInclusionRepository {
  // Renvoie l'identifiant main.lieu_inclusion créé.
  creer(data: CreerLieuInclusionData): Promise<number>
}

export type CreerLieuInclusionData = Readonly<{
  adresseEnrichie: AdresseLieuEnrichie | null
  adresseSirene: AdresseLieuSirene | null
  complementAdresse: null | string
  date: Date
  itinerance: ReadonlyArray<string>
  nom: string
  siret: null | string
  typologies: ReadonlyArray<string>
  visiblePourCartographie: boolean
}>

export interface UpdateLieuInclusionServicesTypeAccompagnementRepository {
  updateServicesTypeAccompagnement(data: UpdateLieuInclusionServicesTypeAccompagnementData): Promise<void>
}

export type UpdateLieuInclusionServicesTypeAccompagnementData = Readonly<{
  date: Date
  modalites: ReadonlyArray<string>
  structureUid: StructureUid
  thematiques: ReadonlyArray<string>
  typesAccompagnement: ReadonlyArray<string>
}>

export interface UpdateLieuInclusionServicesModaliteRepository {
  updateServicesModalite(data: UpdateLieuInclusionServicesModaliteData): Promise<void>
}

export type UpdateLieuInclusionServicesModaliteData = Readonly<{
  date: Date
  email?: string
  fraisACharge: ReadonlyArray<string>
  modalitesAcces: ReadonlyArray<string>
  structureUid: StructureUid
  telephone?: string
}>

export interface UpdateLieuInclusionServicesTypePublicRepository {
  updateServicesTypePublic(data: UpdateLieuInclusionServicesTypePublicData): Promise<void>
}

export type UpdateLieuInclusionServicesTypePublicData = Readonly<{
  date: Date
  priseEnChargeSpecifique: ReadonlyArray<string>
  publicsSpecifiquementAdresses: ReadonlyArray<string>
  structureUid: StructureUid
}>

export interface SupprimerLieuInclusionRepository {
  supprimer(data: SupprimerLieuInclusionData): Promise<void>
}

export type SupprimerLieuInclusionData = Readonly<{
  date: Date
  structureUid: StructureUid
}>

export interface UpdateLieuInclusionVisibiliteCartographieRepository {
  // Un lieu sans adresse BAN ne peut pas être rendu visible sur la cartographie (#1495).
  aUneAdresseBan(structureUid: StructureUid): Promise<boolean>
  updateVisibiliteCartographie(data: UpdateLieuInclusionVisibiliteCartographieData): Promise<void>
}

export type UpdateLieuInclusionVisibiliteCartographieData = Readonly<{
  date: Date
  structureUid: StructureUid
  visiblePourCartographie: boolean
}>
