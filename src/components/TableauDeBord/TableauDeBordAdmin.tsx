import Link from 'next/link'
import { ReactElement } from 'react'

import FeuillesDeRouteDeposees from './FeuillesDeRouteDeposees'
import GouvernancesTerritoriales from './GouvernancesTerritoriales'
import PageTitle from '../shared/PageTitle/PageTitle'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { FeuillesDeRouteDeposeesViewModel } from '@/presenters/tableauDeBord/feuillesDeRouteDeposeesPresenter'
import { GouvernancesTerritorialesViewModel } from '@/presenters/tableauDeBord/gouvernancesTerritorialesPresenter'

export default function TableauDeBordAdmin({
  feuillesDeRouteDeposeesViewModel,
  gouvernancesTerritorialesViewModel,
}: Props): ReactElement {
  return (
    <>
      <div className="fr-grid-row fr-grid-row--middle fr-mb-4w">
        <div className="fr-col">
          <PageTitle>
            <TitleIcon icon="france-line" />
            Gouvernances
          </PageTitle>
          <p className="fr-text--lg fr-mb-0">
            Vision globale des gouvernances, des membres et des feuilles de route
          </p>
        </div>
        <div className="fr-col-auto">
          <Link
            className="fr-btn fr-btn--tertiary fr-btn--icon-right fr-icon-arrow-right-line"
            href="/gouvernances"
          >
            Voir les 105 gouvernances
          </Link>
        </div>
      </div>
      
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-md-6">
          <GouvernancesTerritoriales
            gouvernancesTerritoriales={gouvernancesTerritorialesViewModel}
          />
        </div>
        <div className="fr-col-12 fr-col-md-6">
          <FeuillesDeRouteDeposees
            feuillesDeRouteDeposees={feuillesDeRouteDeposeesViewModel}
          />
        </div>
      </div>
    </>
  )
}

type Props = Readonly<{
  feuillesDeRouteDeposeesViewModel: ErrorViewModel | FeuillesDeRouteDeposeesViewModel
  gouvernancesTerritorialesViewModel: ErrorViewModel | GouvernancesTerritorialesViewModel
}>