import Link from 'next/link'
import { ReactElement } from 'react'

import FeuillesDeRouteDeposees from './FeuillesDeRouteDeposees'
import GouvernancesTerritoriales from './GouvernancesTerritoriales'
import PageTitle from '../shared/PageTitle/PageTitle'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { FeuillesDeRouteDeposeesViewModel } from '@/presenters/tableauDeBord/feuillesDeRouteDeposeesPresenter'
import { GouvernancesTerritorialesViewModel } from '@/presenters/tableauDeBord/gouvernancesTerritorialesPresenter'

export default function TableauDeBordAdmin({
  feuillesDeRouteDeposeesViewModel,
  gouvernancesTerritorialesViewModel,
}: Props): ReactElement {
  return (
    <>
      <PageTitle>
        <span>
          Gouvernances
        </span>
      </PageTitle>
      
      <div className="fr-grid-row fr-grid-row--gutters fr-mb-2w">
        <div className="fr-col-12 fr-col-md-6">
          <Link
            className="fr-btn fr-btn--tertiary fr-btn--icon-right fr-icon-arrow-right-line"
            href="/gouvernances"
          >
            Voir toutes les gouvernances
          </Link>
        </div>
      </div>
      
      <GouvernancesTerritoriales
        gouvernancesTerritoriales={gouvernancesTerritorialesViewModel}
      />
      
      <FeuillesDeRouteDeposees
        feuillesDeRouteDeposees={feuillesDeRouteDeposeesViewModel}
      />
    </>
  )
}

type Props = Readonly<{
  feuillesDeRouteDeposeesViewModel: ErrorViewModel | FeuillesDeRouteDeposeesViewModel
  gouvernancesTerritorialesViewModel: ErrorViewModel | GouvernancesTerritorialesViewModel
}>