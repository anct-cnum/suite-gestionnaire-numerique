'use client'

import { ReactElement, use } from 'react'

import { ErrorViewModel, isErrorViewModel } from '@/components/shared/ErrorViewModel'

export default function BeneficiairesAsyncLoader({ 
  totalBeneficiairesPromise,
}: Props): ReactElement {
  const totalBeneficiaires = use(totalBeneficiairesPromise)
  
  if (isErrorViewModel(totalBeneficiaires)) {
    return (
      <div className="fr-display--xs fr-mb-0 color-orange">
        -
      </div>
    )
  }
  
  return (
    <div className="fr-display--xs fr-mb-0">
      {totalBeneficiaires.toLocaleString('fr-FR')}
    </div>
  )
}

type Props = Readonly<{
  totalBeneficiairesPromise: Promise<ErrorViewModel | number>
}>