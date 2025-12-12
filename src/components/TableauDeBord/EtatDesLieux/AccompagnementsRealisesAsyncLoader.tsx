'use client'

import { ReactElement, use } from 'react'

import Bar from '../../shared/Bar/Bar'
import TitleIcon from '../../shared/TitleIcon/TitleIcon'
import { ErrorViewModel, isErrorViewModel } from '@/components/shared/ErrorViewModel'
import Information from '@/components/shared/Information/Information'
import { formaterEnNombreFrancais } from '@/presenters/shared/number'
import { AccompagnementsRealisesResult } from '@/use-cases/queries/fetchAccompagnementsRealises'

export default function AccompagnementsRealisesAsyncLoader({
  accompagnementsRealisesPromise,
}: Props): ReactElement {
  const result = use(accompagnementsRealisesPromise)

  if (isErrorViewModel(result)) {
    return (
      <>
        <div className="background-blue-france fr-p-4w fr-ml-1w">
          <div className="fr-h1 fr-m-0">
            <TitleIcon
              background="white"
              icon="error-warning-line"
            />
            —
          </div>
          <div className="font-weight-500">
            <span>
              {' '}
              Accompagnements réalisés
            </span>
            <Information>
              <p>
                Depuis 2021, avec les dispositifs Conseillers Numériques et Aidants Connect
              </p>
            </Information>
          </div>
          <div className="fr-text--xs color-blue-france fr-mb-0">
            {result.message}
          </div>
        </div>
        <div className="background-blue-france fr-p-4w fr-ml-1w fr-mt-1w">
          <div className="font-weight-500">
            <span>
              {' '}
              Accompagnements des 6 derniers mois
            </span>
            <Information>
              <p className="fr-mb-0">
                Accompagnements saisis sur La Coop
              </p>
            </Information>
          </div>
          <div className="fr-text--xs color-blue-france fr-mb-0">
            {result.message}
          </div>
        </div>
      </>
    )
  }

  const backgroundColor = ['#CACAFB', '#CACAFB', '#CACAFB', '#CACAFB', '#CACAFB', '#6A6AF4']

  return (
    <>
      <div className="background-blue-france fr-p-4w fr-ml-1w">
        <div className="fr-h1 fr-m-0">
          <TitleIcon
            background="white"
            icon="compass-3-line"
          />
          {formaterEnNombreFrancais(result.nombreTotal)}
        </div>
        <div className="font-weight-500">
          <span>
            {' '}
            Accompagnements réalisés
          </span>
          <Information>
            <p className="fr-mb-0">
              Depuis 2021, avec les dispositifs Conseillers Numériques et Aidants Connect
            </p>
          </Information>
        </div>
      </div>
      <div className="background-blue-france fr-p-4w fr-ml-1w fr-mt-1w">
        <Bar
          backgroundColor={backgroundColor}
          data={result.repartitionMensuelle.map((item) => item.nombre)}
          header={
            <div className="font-weight-500">
              <span>
                {' '}
                Accompagnements des 6 derniers mois
              </span>
              <Information>
                <p className="fr-mb-0">
                  Accompagnements saisis sur La Coop
                </p>
              </Information>
            </div>
          }
          labels={result.repartitionMensuelle.map((item) => item.mois)}
        />
      </div>
    </>
  )
}

type Props = Readonly<{
  accompagnementsRealisesPromise: Promise<AccompagnementsRealisesResult | ErrorViewModel>
}>
