import { ReactElement } from 'react'

import ContratsRattaches from '@/components/shared/ContratsRattaches/ContratsRattaches'
import ExternalLink from '@/components/shared/ExternalLink/ExternalLink'
import { StructureViewModel } from '@/presenters/structurePresenter'

export default function StructureContratsRattaches({ contratsRattaches }: Props): ReactElement {
  return (
    <ContratsRattaches
      bandeau={
        <div className="fr-notice fr-notice--info border-radius fr-mt-3w">
          <div className="fr-notice__body fr-px-3w">
            <p className="fr-notice__title fr-text--sm fr-text--regular">
              <span className="fr-text-default--grey">
                Un contrat est considéré comme en cours tant qu’aucune rupture n’a été déclarée sur le{' '}
                <ExternalLink
                  className="fr-link fr-text--sm"
                  href="https://pilotage.conseiller-numerique.gouv.fr/"
                  title="Tableau de pilotage"
                >
                  tableau de pilotage
                </ExternalLink>{' '}
                et que les documents de fin de contrat n’ont pas été transmis.
              </span>
            </p>
          </div>
        </div>
      }
      contrats={contratsRattaches}
      titre="Contrats des conseillers numériques"
    />
  )
}

type Props = Readonly<{
  contratsRattaches: StructureViewModel['contratsRattaches']
}>
