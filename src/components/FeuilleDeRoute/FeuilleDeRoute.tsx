import { ReactElement } from 'react'

import ModifierUneFeuilleDeRoute from './ModifierUneFeuilleDeRoute'
import Tag from '../shared/Tag/Tag'
import { FeuilleDeRouteViewModel } from '@/presenters/feuilleDeRoutePresenter'

export default function FeuilleDeRoute({ feuilleDeRouteViewModel }: Props): ReactElement {
  return (
    <>
      <title>
        {feuilleDeRouteViewModel.nom}
      </title>
      <div className="fr-grid-row space-between fr-grid-row--middle">
        <h1 className="color-blue-france fr-mt-5w">
          {feuilleDeRouteViewModel.nom}
        </h1>
        <ModifierUneFeuilleDeRoute
          contratPreexistant={feuilleDeRouteViewModel.formulaire.contratPreexistant}
          membres={feuilleDeRouteViewModel.formulaire.membres}
          nom={feuilleDeRouteViewModel.nom}
          perimetres={feuilleDeRouteViewModel.formulaire.perimetres}
          uidFeuilleDeRoute={feuilleDeRouteViewModel.uidFeuilleDeRoute}
          uidGouvernance={feuilleDeRouteViewModel.uidGouvernance}
        />
      </div>
      <div className="fr-mb-3w">
        <Tag>
          {feuilleDeRouteViewModel.porteur}
        </Tag>
        <div className="fr-tag fr-ml-1w">
          {feuilleDeRouteViewModel.perimetre}
        </div>
        {' '}
      </div>
      <div className="fr-grid-row fr-btns-group--between">
        <span>
          {feuilleDeRouteViewModel.infosActions}
        </span>
        <span className="fr-text--xs center">
          {feuilleDeRouteViewModel.infosDerniereEdition}
        </span>
      </div>
    </>
  )
}

type Props = Readonly<{
  feuilleDeRouteViewModel: FeuilleDeRouteViewModel
}>
