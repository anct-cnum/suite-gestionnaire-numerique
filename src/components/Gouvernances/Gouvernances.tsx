import Link from 'next/link'
import { ReactElement } from 'react'

import AutresStructuresImpliquees from './AutresStructuresImpliquees'
import CollectivitesImpliquees from './CollectivitesImpliquees'
import FeuillesDeRouteDeposees from './FeuillesDeRouteDeposees'
import GouvernancesTerritoriales from './GouvernancesTerritoriales'
import PageTitle from '../shared/PageTitle/PageTitle'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { AutresStructuresViewModel } from '@/presenters/tableauDeBord/autresStructuresImpliquéesPresenter'
import { CollectivitesViewModel } from '@/presenters/tableauDeBord/collectivitesImpliquéesPresenter'
import { FeuillesDeRouteDeposeesViewModel } from '@/presenters/tableauDeBord/feuillesDeRouteDeposeesPresenter'
import { GouvernancesTerritorialesViewModel } from '@/presenters/tableauDeBord/gouvernancesTerritorialesPresenter'

export default function Gouvernances({
  autresStructuresViewModel,
  collectivitesViewModel,
  dateGeneration,
  feuillesDeRouteDeposeesViewModel,
  gouvernancesTerritorialesViewModel,
}: Props): ReactElement {
  const nombreGouvernances =
    'nombreTotal' in gouvernancesTerritorialesViewModel ? gouvernancesTerritorialesViewModel.nombreTotal : 105

  return (
    <>
      <div className="fr-grid-row fr-grid-row--middle fr-mb-2w">
        <div className="fr-col">
          <PageTitle>
            <TitleIcon icon="france-line" />
            Gouvernances
          </PageTitle>
          <p className="fr-text--lg fr-mb-0">Vision globale des gouvernances, des membres et des feuilles de route</p>
        </div>
        <div className="fr-col-auto">
          <Link className="fr-btn fr-btn--icon-right fr-icon-arrow-right-line" href="/gouvernances/list">
            {`Voir les ${nombreGouvernances} gouvernances`}
          </Link>
        </div>
      </div>

      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-md-6">
          <GouvernancesTerritoriales
            dateGeneration={dateGeneration}
            gouvernancesTerritoriales={gouvernancesTerritorialesViewModel}
          />
        </div>
        <div className="fr-col-12 fr-col-md-6">
          <FeuillesDeRouteDeposees
            dateGeneration={dateGeneration}
            feuillesDeRouteDeposees={feuillesDeRouteDeposeesViewModel}
          />
        </div>
        <div className="fr-col-12 fr-col-md-6">
          <CollectivitesImpliquees collectivites={collectivitesViewModel} dateGeneration={dateGeneration} />
        </div>
        <div className="fr-col-12 fr-col-md-6">
          <AutresStructuresImpliquees autresStructures={autresStructuresViewModel} dateGeneration={dateGeneration} />
        </div>
      </div>
    </>
  )
}

type Props = Readonly<{
  autresStructuresViewModel: AutresStructuresViewModel | ErrorViewModel
  collectivitesViewModel: CollectivitesViewModel | ErrorViewModel
  dateGeneration: Date
  feuillesDeRouteDeposeesViewModel: ErrorViewModel | FeuillesDeRouteDeposeesViewModel
  gouvernancesTerritorialesViewModel: ErrorViewModel | GouvernancesTerritorialesViewModel
}>
