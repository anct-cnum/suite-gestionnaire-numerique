import { ReactElement } from 'react'

import TitleIcon from '../../shared/TitleIcon/TitleIcon'
import { LieuxInclusionNumeriqueViewModel } from '@/presenters/lieuxInclusionNumeriquePresenter'

export default function LieuxInclusionNumerique({ 
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
          Lieux d&apos;inclusion numérique
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
          icon="map-pin-2-line"
        />
        {viewModel.nombreLieux}
      </div>
      <div className="font-weight-500">
        Lieux d&apos;inclusion numérique
      </div>
      <div className="fr-text--xs color-blue-france fr-mb-0">
        Toutes les typologies de lieux publics ou privés
      </div>
    </div>
  )
}

type ErrorViewModel = Readonly<{
  message: string
  type: 'error'
}>

function isErrorViewModel(viewModel: ErrorViewModel | LieuxInclusionNumeriqueViewModel): viewModel is ErrorViewModel {
  return 'type' in viewModel && viewModel.type === 'error'
}

type Props = Readonly<{
  viewModel: ErrorViewModel | LieuxInclusionNumeriqueViewModel
}> 