'use client'

import { ReactElement, Suspense } from 'react'

import AccompagnementsRealisesAsyncLoader from './AccompagnementsRealisesAsyncLoader'
import TitleIcon from '../../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import Information from '@/components/shared/Information/Information'
import { AccompagnementsRealisesResult } from '@/use-cases/queries/fetchAccompagnementsRealises'

export default function AccompagnementsRealises({
  accompagnementsRealisesPromise,
}: Props): ReactElement {
  return (
    <Suspense fallback={<AccompagnementsRealisesSkeleton />}>
      <AccompagnementsRealisesAsyncLoader
        accompagnementsRealisesPromise={accompagnementsRealisesPromise}
      />
    </Suspense>
  )
}

function AccompagnementsRealisesSkeleton(): ReactElement {
  return (
    <>
      <div className="background-blue-france fr-p-4w fr-ml-1w">
        <div className="fr-h1 fr-m-0">
          <TitleIcon
            background="white"
            icon="compass-3-line"
          />
          <span className="color-grey">
            ...
          </span>
        </div>
        <div className="font-weight-500">
          <span>
            {' '}
            Accompagnements réalisés
          </span>
          <Information label="Depuis 2021, avec les dispositifs Conseillers Numériques et Aidants Connect" />
        </div>
      </div>
      <div className="background-blue-france fr-p-4w fr-ml-1w fr-mt-1w">
        <div className="font-weight-500">
          <span>
            {' '}
            Accompagnements des 6 derniers mois
          </span>
          <Information label="Accompagnements saisis sur La Coop" />
        </div>
        <div className="fr-text--sm color-grey fr-mt-2w">
          Chargement...
        </div>
      </div>
    </>
  )
}

type Props = Readonly<{
  accompagnementsRealisesPromise: Promise<AccompagnementsRealisesResult | ErrorViewModel>
}>
