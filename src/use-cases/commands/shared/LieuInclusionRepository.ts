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

export interface UpdateLieuInclusionVisibiliteCartographieRepository {
  updateVisibiliteCartographie(data: UpdateLieuInclusionVisibiliteCartographieData): Promise<void>
}

export type UpdateLieuInclusionVisibiliteCartographieData = Readonly<{
  date: Date
  structureUid: StructureUid
  visiblePourCartographie: boolean
}>
