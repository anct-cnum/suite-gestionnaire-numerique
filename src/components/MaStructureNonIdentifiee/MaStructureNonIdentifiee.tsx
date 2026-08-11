'use client'

import { ReactElement } from 'react'

import PageTitle from '../shared/PageTitle/PageTitle'
import TitleIcon from '../shared/TitleIcon/TitleIcon'

export default function MaStructureNonIdentifiee({ departement }: Props): ReactElement {
  return (
    <div className="fr-grid-row fr-grid-row--center">
      <div>
        <PageTitle>
          <TitleIcon icon="building-line" />
          Ma structure
        </PageTitle>
        <div className="fr-alert fr-alert--info fr-mt-2w">
          <h3 className="fr-alert__title">Votre structure n’a pas encore été identifiée</h3>
          <p>
            Pour l’instant, votre structure pour le département {departement} n’a pas été identifiée dans Mon Inclusion
            Numérique, mais cela va venir d’ici peu. Vous pouvez contacter le support en écrivant à{' '}
            <a className="fr-link" href="mailto:moninclusionnumerique@anct.gouv.fr">
              moninclusionnumerique@anct.gouv.fr
            </a>{' '}
            pour connaître l’état d’avancement.
          </p>
        </div>
      </div>
    </div>
  )
}

type Props = Readonly<{
  departement: string
}>
