import { ReactElement } from 'react'

import TitleIcon from '../../shared/TitleIcon/TitleIcon'
import styles from '../TableauDeBord.module.css'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import InformationDepliable, {
  BoutonInformation,
  TexteInformation,
} from '@/components/shared/Information/InformationDepliable'
import { LieuxInclusionNumeriqueViewModel } from '@/presenters/tableauDeBord/lieuxInclusionNumeriquePresenter'

export default function LieuxInclusionNumerique({ viewModel }: Props): ReactElement {
  if (isErrorViewModel(viewModel)) {
    return (
      <div className="background-blue-france fr-p-3w fr-mb-1w fr-ml-1w">
        <div className={`${styles.indicateurValeur} fr-m-0`}>
          <TitleIcon background="white" icon="error-warning-line" />—
        </div>
        <div className="font-weight-500">Lieux d&apos;inclusion numérique</div>
        <div className="fr-text--xs color-blue-france fr-mb-0">{viewModel.message}</div>
      </div>
    )
  }

  return (
    <div className="background-blue-france fr-p-3w fr-mb-1w fr-ml-1w">
      <div className={`${styles.indicateurValeur} fr-m-0`}>
        <TitleIcon background="white" icon="map-pin-2-line" />
        {viewModel.nombreLieux}
      </div>
      <InformationDepliable>
        <div className="font-weight-500">
          <span>Lieux d&apos;inclusion numérique</span>
          <BoutonInformation libelle="Plus d'information sur les lieux d'inclusion numérique" />
        </div>
        <TexteInformation>
          <p className="fr-text--sm fr-mb-0">
            Lieux référencés sur la <strong>Cartographie nationale</strong> des lieux d&apos;inclusion numérique.
          </p>
        </TexteInformation>
      </InformationDepliable>
    </div>
  )
}

function isErrorViewModel(viewModel: ErrorViewModel | LieuxInclusionNumeriqueViewModel): viewModel is ErrorViewModel {
  return 'type' in viewModel
}

type Props = Readonly<{
  viewModel: ErrorViewModel | LieuxInclusionNumeriqueViewModel
}>
