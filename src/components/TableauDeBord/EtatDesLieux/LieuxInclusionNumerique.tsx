import { ReactElement } from 'react'

import TitleIcon from '../../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import Information from '@/components/shared/Information/Information'
import { LieuxInclusionNumeriqueViewModel } from '@/presenters/tableauDeBord/lieuxInclusionNumeriquePresenter'

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
        <span>
          Lieux d&apos;inclusion numérique
        </span>
        <Information label="Lieux référencés sur la Cartographie nationale des lieux d'inclusion numérique" />
      </div>
    </div>
  )
}

function isErrorViewModel(viewModel: ErrorViewModel | LieuxInclusionNumeriqueViewModel): viewModel is ErrorViewModel {
  return 'type' in viewModel
}

type Props = Readonly<{
  viewModel: ErrorViewModel | LieuxInclusionNumeriqueViewModel
}>
