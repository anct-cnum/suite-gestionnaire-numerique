import { ReactElement } from 'react'

import { handleReadModelOrError } from '@/components/shared/ErrorHandler'
import Beneficiaires from '@/components/TableauDeBord/Beneficiaires'
import { PrismaBeneficiairesLoader } from '@/gateways/tableauDeBord/PrismaBeneficiairesLoader'
import { beneficiairesPresenter } from '@/presenters/tableauDeBord/beneficiairesPresenter'
import { Contexte } from '@/use-cases/queries/ResoudreContexte'

export default async function BlocBeneficiaires({ contexte }: Props): Promise<ReactElement> {
  const code = contexte.codeTerritoire()

  const beneficiairesLoader = new PrismaBeneficiairesLoader()
  const beneficiairesReadModel = await beneficiairesLoader.get(code)
  const beneficiairesViewModel = handleReadModelOrError(
    beneficiairesReadModel,
    beneficiairesPresenter
  )

  const lienBeneficiaires = code === 'France'
    ? '/gouvernance/01/beneficiaires'
    : `/gouvernance/${code}/beneficiaires`

  return (
    <Beneficiaires
      beneficiairesViewModel={beneficiairesViewModel}
      lienBeneficiaires={lienBeneficiaires}
    />
  )
}

type Props = Readonly<{
  contexte: Contexte
}>
