// utils/filtrage.ts

import { FilterType, InfosGouvernances } from '@/components/Gouvernances/GouvernancesList'
import { GouvernanceDetails } from '@/presenters/gouvernancesPresenter'

export function filtrerDetails(details: Array<GouvernanceDetails>, filtreGeographique:string, avance: FilterType)
  : Array<GouvernanceDetails> {
  let nouveauDetails = details
  if (filtreGeographique !== '') {
    nouveauDetails = nouveauDetails.filter((detail) => detail.departementRegion === filtreGeographique)
  }
  switch (avance) {
    case FilterType.MULTI_ROADMAP:
      nouveauDetails = nouveauDetails.filter((detail) => detail.feuilleDeRouteCount >= 2)
      break
    case FilterType.NO_ACTIONS:
      nouveauDetails = nouveauDetails.filter((detail) => detail.actionCount === 0)
      break
    case FilterType.NO_FILTRE:
      break
    case FilterType.NO_GOUV:
      nouveauDetails = nouveauDetails.filter(
        (detail) =>
          detail.feuilleDeRouteCount === 0 &&
          detail.coporteurCount === 1 &&
          detail.membreCount === 1
      )
      break
    case FilterType.NO_ROADMAP:
      nouveauDetails = nouveauDetails.filter((detail) => detail.feuilleDeRouteCount === 0)
      break
    default:
      break
  }
  return nouveauDetails
}

export function getInfosFilrer(details: Array<GouvernanceDetails>): InfosGouvernances {
  const creditEngagerGlobal = details
    // eslint-disable-next-line sonarjs/different-types-comparison,@typescript-eslint/no-unnecessary-condition
    .filter((gouvernanceDetail) =>  gouvernanceDetail.montantEngager !== undefined)
    .flatMap((gouvernanceDetail) => gouvernanceDetail.montantEngager)
    .reduce((count, value) => count + value, 0)

  const subventionValiderCompte = details
    // eslint-disable-next-line sonarjs/different-types-comparison,@typescript-eslint/no-unnecessary-condition
    .filter((gouvernanceDetail) => gouvernanceDetail.montantEngager !== undefined)
    .map((gouvernanceDetail) => gouvernanceDetail.montantEngager.length)
    .reduce((count, value) => count + value, 0)
  const gouvernanceCoporterCompte = details
    // eslint-disable-next-line sonarjs/different-types-comparison,@typescript-eslint/no-unnecessary-condition
    .filter((gouvernanceDetail) => gouvernanceDetail.coporteurCount !== undefined)
    .map((gouvernanceDetail) => gouvernanceDetail.coporteurCount)
    .filter((membre) => membre >= 2).length
  const feuilleDeRouteCompte = details
    // eslint-disable-next-line sonarjs/different-types-comparison,@typescript-eslint/no-unnecessary-condition
    .filter((gouvernanceDetail) => gouvernanceDetail.feuilleDeRouteCount !== undefined)
    .map((gouvernanceDetail) => gouvernanceDetail.feuilleDeRouteCount)
    .reduce((sum, value) => sum + value, 0)

  const actionsCompte = details
    // eslint-disable-next-line sonarjs/different-types-comparison,@typescript-eslint/no-unnecessary-condition
    .filter((gouvernanceDetail) => gouvernanceDetail.actionCount !== undefined)
    .map((gouvernanceDetail) => gouvernanceDetail.actionCount)
    .reduce((count, value) => count + value, 0)
  return {
    creditEngager: {
      creditEngagerGlobal,
      subventionValiderCompte,
    },
    feuilleDeRoutes: {
      actionsCompte,
      feuilleDeRouteCompte,
    },
    gouvernancesTerritoriales: {
      gouvernanceCoporterCompte,
      gouvernancesCompte: details.length,
    },
  }
}
