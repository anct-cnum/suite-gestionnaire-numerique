import { ReactElement } from 'react'

import { DemandeDeSubvention } from '@/presenters/actionPresenter'
import { formatMontant } from '@/presenters/shared/number'

export function AlertePrevisionnel({ budgetGlobal, cofinancements, demandeDeSubvention }: Props): null | ReactElement {
  const montantSubvention = demandeDeSubvention?.total ?? 0
  const montantCofinancements = cofinancements.reduce((acc, cofinancement) => 
    acc + (Number(cofinancement.montant) || 0), 0)
  const bilan = budgetGlobal - montantSubvention - montantCofinancements
    
  if (bilan === 0) {return null}
  
  return (
    <div className="fr-p-2w background-red space-between">
      <div className="fr-grid-row space-between">
        <p className="fr-col-10 fr-mb-0 fr-text--bold color-red-strong">
          Total prévisionnel 
        </p>
        <p className="fr-mb-0 fr-mr-2w color-red-strong fr-text--lg fr-text--bold">
          {formatMontant(-bilan)}
        </p>
      </div>
    </div>
      
  )
}

type Props = {
  readonly budgetGlobal: number
  readonly cofinancements: ReadonlyArray<{
    coFinanceur: string
    montant: string
  }>
  readonly demandeDeSubvention: DemandeDeSubvention | undefined
}
    