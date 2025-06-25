import { ReactElement } from 'react'

import TitleIcon from '../../shared/TitleIcon/TitleIcon'
import { MediateursEtAidantsViewModel } from '@/presenters/mediateursEtAidantsPresenter'

export default function MediateursEtAidants({ 
  viewModel,
}: Props): ReactElement {
  if (isErrorViewModel(viewModel)) {
    return (
      <div className="background-blue-france fr-p-4w fr-mb-1w fr-ml-1w">
        <div className="fr-h1 fr-m-0">
          <TitleIcon
            background="white"
            icon="error-warning-line"
          />
          —
        </div>
        <div className="font-weight-500">
          Médiateurs et aidants numériques
        </div>
        <div className="fr-text--xs color-blue-france fr-mb-0">
          {viewModel.message}
        </div>
      </div>
    )
  }

  return (
    <div className="background-blue-france fr-p-4w fr-mb-1w fr-ml-1w">
      <div className="fr-h1 fr-m-0">
        <TitleIcon
          background="white"
          icon="map-pin-user-line"
        />
        {viewModel.total}
      </div>
      <div className="font-weight-500">
        Médiateurs et aidants numériques
      </div>
      <div className="fr-text--xs color-blue-france fr-mb-0">
        Conseillers numériques, coordinateurs, Aidants, …
      </div>
    </div>
  )
}

type ErrorViewModel = Readonly<{
  message: string
  type: 'error'
}>

function isErrorViewModel(viewModel: ErrorViewModel | MediateursEtAidantsViewModel): viewModel is ErrorViewModel {
  return 'type' in viewModel && viewModel.type === 'error'
}

type Props = Readonly<{
  viewModel: ErrorViewModel | MediateursEtAidantsViewModel
}> 