'use client'

import { ReactElement, use } from 'react'

import AccompagnementsRealisesView from './AccompagnementsRealisesView'
import { ErrorViewModel, isErrorViewModel } from '@/components/shared/ErrorViewModel'
import { AccompagnementsRealisesResult } from '@/use-cases/queries/fetchAccompagnementsRealises'

export default function AccompagnementsRealisesAsyncLoader({ accompagnementsRealisesPromise }: Props): ReactElement {
  const result = use(accompagnementsRealisesPromise)

  if (isErrorViewModel(result)) {
    return <AccompagnementsRealisesView etat={{ message: result.message, statut: 'erreur' }} />
  }

  return <AccompagnementsRealisesView etat={{ resultat: result, statut: 'charge' }} />
}

type Props = Readonly<{
  accompagnementsRealisesPromise: Promise<AccompagnementsRealisesResult | ErrorViewModel>
}>
