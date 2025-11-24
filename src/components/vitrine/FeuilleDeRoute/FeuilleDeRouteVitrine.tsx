'use client'

import { ReactElement } from 'react'

import ResumeActionVitrine from './ResumeActionVitrine'
import ResumeFeuilleDeRouteVitrine from './ResumeFeuilleDeRouteVitrine'
import SectionSources from '../SyntheseEtIndicateurs/SectionSources'
import { FeuilleDeRouteViewModel, FeuillesDeRouteViewModel } from '@/presenters/feuillesDeRoutePresenter'

/**
 * Composant vitrine pour afficher les feuilles de route
 * Réutilise les composants existants de FeuillesDeRoute mais adapté pour la vitrine
 */
export default function FeuilleDeRouteVitrine({ feuillesDeRouteViewModel }: Props): ReactElement {
  return (
    <div className="fr-pr-10w">
      <ul
        aria-label="Feuilles de route"
        className="fr-p-0"
      >
        {feuillesDeRouteViewModel.feuillesDeRoute.map((feuilleDeRoute: FeuilleDeRouteViewModel) => (
          <li
            key={feuilleDeRoute.uid}
            style={{ listStyle: 'none' }}
          >
            <ResumeFeuilleDeRouteVitrine feuilleDeRoute={feuilleDeRoute}>
              {feuilleDeRoute.actions.length > 0 && (
                <ResumeActionVitrine
                  actions={feuilleDeRoute.actions}
                  uidFeuilleDeRoute={feuilleDeRoute.uid}
                />
              )}
            </ResumeFeuilleDeRouteVitrine>
          </li>
        ))}
      </ul>

      <SectionSources />
    </div>
  )
}

type Props = Readonly<{
  feuillesDeRouteViewModel: FeuillesDeRouteViewModel
}>
