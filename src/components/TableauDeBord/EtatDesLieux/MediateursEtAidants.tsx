import classNames from 'classnames'
import { ReactElement } from 'react'

import TitleIcon from '../../shared/TitleIcon/TitleIcon'
import styles from '../TableauDeBord.module.css'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import Information from '@/components/shared/Information/Information'
import { MediateursEtAidantsViewModel } from '@/presenters/tableauDeBord/mediateursEtAidantsPresenter'

export default function MediateursEtAidants({ viewModel }: Props): ReactElement {
  if (isErrorViewModel(viewModel)) {
    return (
      <div className={classNames(styles.bloc, 'background-blue-france fr-p-4w fr-mb-1w fr-ml-1w')}>
        <div className={classNames(styles.indicateurValeur, 'fr-m-0')}>
          <TitleIcon background="white" icon="error-warning-line" />—
        </div>
        <div className="font-weight-500 fr-mt-1v">
          <span>Médiateurs et Aidants Connect</span>
          <Information>
            <p className="fr-mb-0">
              Professionnels inscrits sur <strong>la Coop</strong> et/ou labellisés <strong>Aidants Connect.</strong>
            </p>
          </Information>
        </div>
        <div className="fr-text--xs color-blue-france fr-mb-0">{viewModel.message}</div>
      </div>
    )
  }

  return (
    <div className={classNames(styles.bloc, 'background-blue-france fr-p-4w fr-mb-1w fr-ml-1w')}>
      <div className={classNames(styles.indicateurValeur, 'fr-m-0')}>
        <TitleIcon background="white" icon="map-pin-user-line" />
        {viewModel.total}
      </div>
      <div className="font-weight-500 fr-mt-1v">
        <span>Médiateurs et Aidants Connect</span>
        <Information>
          <p className="fr-mb-0">Professionnels inscrits sur la Coop et/ou labellisés Aidants Connect</p>
        </Information>
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
