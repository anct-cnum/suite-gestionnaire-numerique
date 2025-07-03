import { ReactElement } from 'react'

import TitleIcon from '../../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import Information from '@/components/shared/Information/Information'
import { MediateursEtAidantsViewModel } from '@/presenters/tableauDeBord/mediateursEtAidantsPresenter'

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
          <span>
            Médiateurs et aidants numériques
          </span>
          <Information label="Professionnels inscrits sur la Coop et/ou labellisés Aidants Connect" />
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
        <span>
          Médiateurs et aidants numériques
        </span>
        <Information label="Professionnels inscrits sur la Coop et/ou labellisés Aidants Connect" />
      </div>

    </div>
  )
}

function isErrorViewModel(viewModel: ErrorViewModel | MediateursEtAidantsViewModel): viewModel is ErrorViewModel {
  return 'type' in viewModel
}

type Props = Readonly<{
  viewModel: ErrorViewModel | MediateursEtAidantsViewModel
}>
