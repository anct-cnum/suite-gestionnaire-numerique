import { ErrorReadModel } from './shared/ErrorReadModel'

export type EtatPoste = 'occupe' | 'rendu' | 'vacant'

export type PosteConseillerNumeriqueDetailReadModel = Readonly<{
  contrats: ReadonlyArray<
    Readonly<{
      dateDebut: Date | null
      dateFin: Date | null
      dateRupture: Date | null
      mediateur: string
      role: string
      typeContrat: string
    }>
  >
  conventions: Readonly<{
    creditsEngagesParLEtat: number
    v1: null | Readonly<{
      bonification: number
      dateDebut: Date | null
      dateFin: Date | null
      subvention: number
      versement: number
    }>
    v2: null | Readonly<{
      bonification: number
      dateDebut: Date | null
      dateFin: Date | null
      subvention: number
      versement: number
    }>
  }>
  estBonifie: boolean
  estCoordinateur: boolean
  posteConumId: number
  posteId: number
  statut: EtatPoste
  structure: Readonly<{
    adresse: string
    contacts: ReadonlyArray<
      Readonly<{
        email: string
        estReferentFNE: boolean
        fonction: string
        id: number
        nom: string
        prenom: string
        telephone: string
      }>
    >
    departement: string
    nom: string
    region: string
    siret: string
    structureId: number
    typologie: string
  }>
}>

export interface PosteConseillerNumeriqueDetailLoader {
  get(posteConumId: number, structureId: number): Promise<ErrorReadModel | PosteConseillerNumeriqueDetailReadModel>
}
