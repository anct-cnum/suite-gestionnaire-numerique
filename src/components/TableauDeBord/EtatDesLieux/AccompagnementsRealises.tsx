import { ReactElement } from 'react'

import Bar from '../../shared/Bar/Bar'
import TitleIcon from '../../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { AccompagnementsRealisesViewModel } from '@/presenters/accompagnementsRealisesPresenter'

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
          Accompagnements réalisés
        </div>
        <div className="fr-text--xs color-blue-france fr-mb-0">
          {viewModel.message}
        </div>
      </div>
    )
  }

  return (
    <div className="background-blue-france fr-p-4w fr-ml-1w">
      <div className="fr-h1 fr-m-0">
        <TitleIcon
          background="white"
          icon="compass-3-line"
        />
        {viewModel.nombreTotal}
      </div>
      <div className="font-weight-500">
        Accompagnements réalisés
      </div>
      <div className="fr-text--xs color-blue-france fr-mb-0">
        Total cumulé des dispositifs
      </div>
      <Bar
        backgroundColor={viewModel.graphique.backgroundColor}
        data={viewModel.graphique.data}
        labels={viewModel.graphique.labels}
      />
    </div>
  )
}

function isErrorViewModel(viewModel: AccompagnementsRealisesViewModel | ErrorViewModel): viewModel is ErrorViewModel {
  return 'type' in viewModel
}

type Props = Readonly<{
  viewModel: AccompagnementsRealisesViewModel | ErrorViewModel
}> 