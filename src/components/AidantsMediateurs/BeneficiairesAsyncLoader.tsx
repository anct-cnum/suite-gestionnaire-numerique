'use client'

import { ReactElement, use } from 'react'

export default function BeneficiairesAsyncLoader({ 
  beneficiairesPromise,
}: Props): ReactElement {
  const beneficiaires = use(beneficiairesPromise)
  
  return (
    <div className="fr-display--xs fr-mb-0">
      {beneficiaires.toLocaleString('fr-FR')}
    </div>
  )
}

type Props = Readonly<{
  beneficiairesPromise: Promise<number>
}>