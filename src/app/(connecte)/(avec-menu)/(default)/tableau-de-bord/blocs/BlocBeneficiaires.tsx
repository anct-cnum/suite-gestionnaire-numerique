import { ReactElement } from 'react'

import { handleReadModelOrError } from '@/components/shared/ErrorHandler'
import Beneficiaires from '@/components/TableauDeBord/Beneficiaires'
import { PrismaBeneficiairesLoader } from '@/gateways/tableauDeBord/PrismaBeneficiairesLoader'
import { beneficiairesPresenter } from '@/presenters/tableauDeBord/beneficiairesPresenter'
import { Scope } from '@/use-cases/queries/ResoudreContexte'

export default async function BlocBeneficiaires({ scope }: Props): Promise<ReactElement> {
  const code = scope.type === 'france' ? 'France' : scope.code

  const beneficiairesLoader = new PrismaBeneficiairesLoader()
  const beneficiairesReadModel = await beneficiairesLoader.get(code)
  const beneficiairesViewModel = handleReadModelOrError(beneficiairesReadModel, beneficiairesPresenter)

  const lienBeneficiaires =
    scope.type === 'france' ? '/gouvernance/01/beneficiaires' : `/gouvernance/${code}/beneficiaires`

  return <Beneficiaires beneficiairesViewModel={beneficiairesViewModel} lienBeneficiaires={lienBeneficiaires} />
}

type Props = Readonly<{
  scope: Scope
}>
