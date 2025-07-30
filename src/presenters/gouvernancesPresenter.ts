
import { GouvernancesInfosReadModel } from '@/use-cases/queries/RecupererGouvernancesInfos'

export function gouvernancePresenter(viewModel: GouvernancesInfosReadModel) : GouvernancesViewModel {
  return {
    details: viewModel.details.map(detail => {
      return {
        actionCount : detail.actionCount,
        coFinancementMontant: detail.coFinancementMontant,
        coporteurCount: detail.coporteurCount,
        departementCode: detail.departementCode,
        departementNom: detail.departementNom,
        departementRegion: detail.departementRegion,
        dotationEtatMontant: detail.dotationEtatMontant,
        feuilleDeRouteCount: detail.feuilleDeRouteCount,
        membreCount: detail.membreCount,
        montantEngager: detail.montantEngager,
      }
    } ),
  }
}

export type GouvernancesViewModel = Readonly<{
  details: Array<GouvernanceDetails>
}>

export interface GouvernanceDetails {
  actionCount: number
  coFinancementMontant: number
  coporteurCount: number
  departementCode: string
  departementNom: string
  departementRegion: string
  dotationEtatMontant: number
  feuilleDeRouteCount: number
  membreCount: number
  montantEngager: Array<number>
}
