import { ErrorReadModel } from './shared/ErrorReadModel'

export type EtatPoste = 'occupe' | 'rendu' | 'vacant'

export type PosteConseillerNumeriqueDetailReadModel = Readonly<{
  contrats: ReadonlyArray<Readonly<{
    dateDebut: Date | null
    dateFin: Date | null
    dateRupture: Date | null
    mediateur: string
    role: string
    typeContrat: string
  }>>
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
    departement: string
    nom: string
    referent: null | Readonly<{
      email: string
      fonction: string
      nom: string
      telephone: string
    }>
    region: string
    siret: string
    structureId: number
    typologie: string
  }>
}>

export interface PosteConseillerNumeriqueDetailLoader {
  getById(posteId: number): Promise<ErrorReadModel | PosteConseillerNumeriqueDetailReadModel>
}
