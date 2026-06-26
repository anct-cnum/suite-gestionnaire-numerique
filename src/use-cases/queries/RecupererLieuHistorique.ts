import { ErrorReadModel } from './shared/ErrorReadModel'

export type DetailEvenement = Readonly<{
  label: string
  statut: 'ajout' | 'contexte' | 'modification' | 'suppression'
  valeur: string
}>

export type EvenementHistorique = Readonly<{
  date: Date
  description: string
  details: ReadonlyArray<DetailEvenement>
  source: string
  type: string
}>

export type SourcePivot = Readonly<{
  pivot: null | string
  source: string
}>

export type LieuHistoriqueReadModel = Readonly<{
  evenements: ReadonlyArray<EvenementHistorique>
  nomLieu: string
  sourcesPivots: ReadonlyArray<SourcePivot>
}>

export interface RecupererLieuHistoriqueLoader {
  recuperer(id: string): Promise<ErrorReadModel | LieuHistoriqueReadModel>
}
