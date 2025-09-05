import { ReactElement } from 'react'

import Bar from '../../shared/Bar/Bar'
import TitleIcon from '../../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import Information from '@/components/shared/Information/Information'
import { AccompagnementsRealisesViewModel } from '@/presenters/tableauDeBord/accompagnementsRealisesPresenter'

export default function AccompagnementsRealises({
  viewModel,
}: Props): ReactElement {
  if (isErrorViewModel(viewModel)) {
    return (
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
          <Information label="Depuis 2021, avec les dispositifs Conseillers Numériques et Aidants Connect" />
        </div>
        <div className="fr-text--xs color-blue-france fr-mb-0">
          {viewModel.message}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="background-blue-france fr-p-4w fr-ml-1w">
        <div className="fr-h1 fr-m-0">
          <TitleIcon
            background="white"
            icon="compass-3-line"
          />
          {viewModel.nombreTotal}
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
        <Bar
          backgroundColor={viewModel.graphique.backgroundColor}
          data={viewModel.graphique.data}
          header={(
            <div className="font-weight-500">
              <span>
                {' '}
                Accompagnements des 6 derniers mois
              </span>
              <Information label="Accompagnements saisis sur La Coop" />
            </div>
          )}
          labels={viewModel.graphique.labels}
        />
      </div>
    </>
  )
}

function isErrorViewModel(viewModel: AccompagnementsRealisesViewModel | ErrorViewModel): viewModel is ErrorViewModel {
  return 'type' in viewModel
}

type Props = Readonly<{
  viewModel: AccompagnementsRealisesViewModel | ErrorViewModel
}>
