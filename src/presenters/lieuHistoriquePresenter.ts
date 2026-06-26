import { formaterEnDateFrancaise } from './shared/date'
import { libelleSource } from './shared/libelleSource'
import { LieuHistoriqueReadModel } from '@/use-cases/queries/RecupererLieuHistorique'

export function lieuHistoriquePresenter(readModel: LieuHistoriqueReadModel): LieuHistoriqueViewModel {
  return {
    evenements: readModel.evenements.map((ev) => ({
      couleur: couleurParType(ev.type),
      date: formaterEnDateFrancaise(ev.date),
      description: ev.description,
      details: ev.details.map((detail) => ({ label: detail.label, statut: detail.statut, valeur: detail.valeur })),
      icone: iconeParType(ev.type),
      source: libelleSource(ev.source),
      type: ev.type,
    })),
    nomLieu: readModel.nomLieu,
    sourcesPivots: readModel.sourcesPivots.map((sp) => ({
      libelleSource: libelleSource(sp.source),
      pivot: sp.pivot,
      source: sp.source,
    })),
  }
}

export type DetailViewModel = Readonly<{
  label: string
  statut: 'ajout' | 'contexte' | 'modification' | 'suppression'
  valeur: string
}>

export type EvenementViewModel = Readonly<{
  couleur: string
  date: string
  description: string
  details: ReadonlyArray<DetailViewModel>
  icone: string
  source: string
  type: string
}>

export type LieuHistoriqueViewModel = Readonly<{
  evenements: ReadonlyArray<EvenementViewModel>
  nomLieu: string
  sourcesPivots: ReadonlyArray<SourcePivotViewModel>
}>

export type SourcePivotViewModel = Readonly<{
  libelleSource: string
  pivot: null | string
  source: string
}>

function couleurParType(type: string): string {
  switch (type) {
    case 'ingest delta':
      return 'orange-terre-battue'
    case 'ingest initial':
      return 'green-emeraude'
    case 'suppression':
      return 'pink-macaron'
    default:
      return 'blue-france'
  }
}

function iconeParType(type: string): string {
  switch (type) {
    case 'ingest delta':
      return 'arrow-right-line'
    case 'ingest initial':
      return 'database-line'
    case 'suppression':
      return 'delete-line'
    default:
      return 'information-line'
  }
}
