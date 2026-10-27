import { ReactElement } from 'react'

import { handleReadModelOrError } from '@/components/shared/ErrorHandler'
import Beneficiaires from '@/components/TableauDeBord/Beneficiaires'
import { PrismaBeneficiairesLoader } from '@/gateways/tableauDeBord/PrismaBeneficiairesLoader'
import { beneficiairesPresenter } from '@/presenters/tableauDeBord/beneficiairesPresenter'
import { TerritoireTableauDeBord } from '@/use-cases/queries/shared/TerritoireTableauDeBord'

export default async function BlocBeneficiaires({ territoire }: Props): Promise<ReactElement> {
  // EPCI : bloc masqué par le registre ; structure : bloc jamais affiché.
  if (territoire.type === 'epci' || territoire.type === 'structure') {
    return <></>
  }

  const beneficiairesLoader = new PrismaBeneficiairesLoader()
  let beneficiairesReadModel
  if (territoire.type === 'region') {
    // Agrégat des départements de la région.
    beneficiairesReadModel = await beneficiairesLoader.getPourDepartements(territoire.codesDepartement)
  } else {
    beneficiairesReadModel = await beneficiairesLoader.get(territoire.type === 'france' ? 'France' : territoire.code)
  }
  const beneficiairesViewModel = handleReadModelOrError(beneficiairesReadModel, beneficiairesPresenter)

  return <Beneficiaires beneficiairesViewModel={beneficiairesViewModel} />
}

type Props = Readonly<{
  territoire: TerritoireTableauDeBord
}>
