'use client'

import { ReactElement, Suspense } from 'react'

import AccompagnementsRealisesAsyncLoader from './AccompagnementsRealisesAsyncLoader'
import AccompagnementsRealisesView from './AccompagnementsRealisesView'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { AccompagnementsRealisesResult } from '@/use-cases/queries/fetchAccompagnementsRealises'

export default function AccompagnementsRealises({ accompagnementsRealisesPromise }: Props): ReactElement {
  return (
    <Suspense fallback={<AccompagnementsRealisesView etat={{ statut: 'chargement' }} />}>
      <AccompagnementsRealisesAsyncLoader accompagnementsRealisesPromise={accompagnementsRealisesPromise} />
    </Suspense>
  )
}

type Props = Readonly<{
  accompagnementsRealisesPromise: Promise<AccompagnementsRealisesResult | ErrorViewModel>
}>
