import { ScopeFiltre } from './ResoudreContexte'
import { ErrorReadModel } from './shared/ErrorReadModel'

export type EtatPoste = 'occupe' | 'rendu' | 'vacant'

export type PosteConseillerNumeriqueReadModel = Readonly<{
  bonification: boolean
  codeDepartement: string
  dateFinContrat: Date | null
  dateFinConvention: Date | null
  estCoordinateur: boolean
  nomStructure: string
  posteConumId: number
  // Sources de financement cumulées (ex: "DGE, DITP")
  sourcesFinancement: null | string
  statut: EtatPoste
  structureId: number
  structureTpId: null | number
  totalConventionne: number
  totalVerse: number
}>

export type PostesConseillerNumeriqueStatistiquesReadModel = Readonly<{
  budgetTotalConventionne: number
  budgetTotalVerse: number
  nombreDePostes: number
  nombreDePostesOccupes: number
  nombreDeStructuresConventionnees: number
  totalPostesPourPagination: number
}>

export type PostesConseillerNumeriqueReadModel = Readonly<{
  displayPagination: boolean
  limite: number
  page: number
  postes: ReadonlyArray<PosteConseillerNumeriqueReadModel>
  statistiques: PostesConseillerNumeriqueStatistiquesReadModel
  total: number
  totalPages: number
}>

export type FiltresPostesConseillerNumerique = Readonly<{
  bonification?: boolean
  codeDepartement?: string
  codeRegion?: string
  conventions?: Array<string>
  pagination: Readonly<{
    limite: number
    page: number
  }>
  scopeFiltre: ScopeFiltre
  statut?: EtatPoste
  typesEmployeur?: Array<string>
  typesPoste?: Array<string>
}>

export interface PostesConseillerNumeriqueLoader {
  get(filtres: FiltresPostesConseillerNumerique): Promise<ErrorReadModel | PostesConseillerNumeriqueReadModel>
}
