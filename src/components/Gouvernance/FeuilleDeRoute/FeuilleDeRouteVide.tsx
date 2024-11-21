import { ReactElement } from 'react'

import SectionVide from '../SectionVide'

export default function FeuilleDeRouteVide(): ReactElement {
  return (
    <SectionVide
      buttonLabel="Ajouter une feuille de route"
      id="feuilleDeRoute"
      title="0 feuille de route"
    >
      <p className="fr-h6">
        Aucune feuille de route
      </p>
      <p>
        Commencez par créer des porteurs au sein de la gouvernance pour définir votre première feuille de route.
      </p>
    </SectionVide>
  )
}
