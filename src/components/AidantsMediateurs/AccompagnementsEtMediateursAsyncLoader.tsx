'use client'

import { ReactElement, use } from 'react'

import AccompagnementsEtMediateurs from './AccompagnementsEtMediateurs'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { AccompagnementsEtMediateursViewModel } from '@/presenters/tableauDeBord/accompagnementsEtMediateursPresenter'
import { BeneficiairesEtAccompagnementsResult } from '@/use-cases/queries/fetchBeneficiaires'

export default function AccompagnementsEtMediateursAsyncLoader({
  accompagnementsEtMediateursPromise,
  beneficiairesEtAccompagnementsPromise,
  dateGeneration,
}: Props): ReactElement {
  const accompagnementsEtMediateurs = use(accompagnementsEtMediateursPromise)

  return (
    <AccompagnementsEtMediateurs
      accompagnementsEtMediateurs={accompagnementsEtMediateurs}
      beneficiairesEtAccompagnementsPromise={beneficiairesEtAccompagnementsPromise}
      dateGeneration={dateGeneration}
    />
  )
}

type Props = Readonly<{
  accompagnementsEtMediateursPromise: Promise<AccompagnementsEtMediateursViewModel | ErrorViewModel>
  beneficiairesEtAccompagnementsPromise: Promise<BeneficiairesEtAccompagnementsResult | ErrorViewModel>
  dateGeneration: Date
}>
