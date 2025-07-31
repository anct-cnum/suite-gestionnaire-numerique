export type BeneficiairesViewModel = Readonly<{
  collectivite: number
  details: ReadonlyArray<Readonly<{
    color: string
    label: string
    total: number
  }>>
  graphique: Readonly<{
    backgroundColor: ReadonlyArray<string>
  }>
  total: number
}>

import { obtenirCouleurEnveloppe, obtenirCouleurGraphique } from '../shared/enveloppe'
import { TableauDeBordLoaderBeneficiaires } from '@/use-cases/queries/RecuperBeneficiaires'

export function beneficiairesPresenter(
  beneficiairesReadModel: TableauDeBordLoaderBeneficiaires
): BeneficiairesViewModel {
  const details = beneficiairesReadModel.details.map((detail) => ({
    color: obtenirCouleurEnveloppe(detail.label),
    label: detail.label,
    total: detail.total,
  }))
  
  const backgroundColor = details.map(detail => obtenirCouleurGraphique(detail.color))
  
  return {
    collectivite: beneficiairesReadModel.collectivite,
    details,
    graphique: {
      backgroundColor,
    },
    total: beneficiairesReadModel.total,
  }
}