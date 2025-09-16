
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
        indiceDeConfiance: detail.indiceDeConfiance,
        indiceDeConfianceClass: getIndiceDeConfianceClass(detail.indiceDeConfiance),
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
  indiceDeConfiance: string
  indiceDeConfianceClass: string
  membreCount: number
  montantEngager: Array<number>
}

function getIndiceDeConfianceClass(indice: string): string {
  switch (indice) {
    case 'appuis nécessaires':
      return 'fr-badge--green-tilleul-verveine'
    case 'objectifs atteignables':
      return 'fr-badge--green-menthe'
    case 'objectifs compromis':
      return 'fr-badge--purple-glycine'
    case 'objectifs sécurisés':
      return 'fr-badge--green-emeraude'
    case 'non enregistré':
    default:
      return 'fr-badge--grey'
  }
}
