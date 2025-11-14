'use client'

import { ReactElement, use } from 'react'

import { ErrorViewModel, isErrorViewModel } from '@/components/shared/ErrorViewModel'
import { BeneficiairesEtAccompagnementsResult } from '@/use-cases/queries/fetchBeneficiaires'

export default function BeneficiairesEtAccompagnementsAsyncLoader({
  beneficiairesEtAccompagnementsPromise,
}: Props): ReactElement {
  const result = use(beneficiairesEtAccompagnementsPromise)

  if (isErrorViewModel(result)) {
    return (
      <div>
        <div className="fr-display--xs fr-mb-0 color-orange">
          -
        </div>
        <div className="fr-text--lg font-weight-700 fr-m-0">
          Bénéficiaires accompagnés
        </div>
        <div className="color-blue-france fr-pb-4w">
          Soit
          {' '}
          <strong>
            -
            {' '}
            accompagnements réalisés
          </strong>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="fr-display--xs fr-mb-0">
        {result.beneficiaires.toLocaleString('fr-FR')}
      </div>
      <div className="fr-text--lg font-weight-700 fr-m-0">
        Bénéficiaires accompagnés
      </div>
      <div className="color-blue-france fr-pb-4w">
        Soit
        {' '}
        <strong>
          {result.accompagnements.toLocaleString('fr-FR')}
          {' '}
          accompagnements réalisés
        </strong>
      </div>
    </div>
  )
}

type Props = Readonly<{
  beneficiairesEtAccompagnementsPromise: Promise<BeneficiairesEtAccompagnementsResult | ErrorViewModel>
}>
