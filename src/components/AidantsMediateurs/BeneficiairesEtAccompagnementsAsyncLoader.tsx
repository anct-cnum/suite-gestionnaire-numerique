'use client'

import { ReactElement, use } from 'react'

import { ErrorViewModel, isErrorViewModel } from '@/components/shared/ErrorViewModel'
import { formaterEnNombreAvecK } from '@/presenters/shared/number'
import { BeneficiairesEtAccompagnementsResult } from '@/use-cases/queries/fetchBeneficiaires'

export default function BeneficiairesEtAccompagnementsAsyncLoader({
  beneficiairesEtAccompagnementsPromise,
}: Props): ReactElement {
  const result = use(beneficiairesEtAccompagnementsPromise)

  if (isErrorViewModel(result)) {
    return (
      <div>
        <div className="metrique-nombre-grand fr-mb-0 color-orange">-</div>
        <div className="fr-text--lg font-weight-700 fr-m-0">Bénéficiaires accompagnés</div>
        <div className="color-blue-france fr-text--xs fr-m-0 fr-pb-4w">
          Soit <strong>- accompagnements réalisés</strong>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="metrique-nombre-grand fr-mb-0">{formaterEnNombreAvecK(result.beneficiaires)}</div>
      <div className="fr-text--lg font-weight-700 fr-m-0">Bénéficiaires accompagnés</div>
      <div className="color-blue-france fr-text--xs fr-m-0 fr-pb-4w">
        Soit <strong>{formaterEnNombreAvecK(result.accompagnements)} accompagnements réalisés</strong>
      </div>
    </div>
  )
}

type Props = Readonly<{
  beneficiairesEtAccompagnementsPromise: Promise<BeneficiairesEtAccompagnementsResult | ErrorViewModel>
}>
