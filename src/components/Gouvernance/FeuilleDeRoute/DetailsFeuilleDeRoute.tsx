import { ReactElement } from 'react'

import Tag from '@/components/shared/Tag/Tag'
import { GouvernanceViewModel } from '@/presenters/gouvernancePresenter'

type FeuilleDeRoute = NonNullable<GouvernanceViewModel['sectionFeuillesDeRoute']['feuillesDeRoute']>[number];
interface DetailsFeuilleDeRouteProps { readonly feuilleDeRoute: FeuilleDeRoute }

export default function DetailsFeuilleDeRoute({ feuilleDeRoute }:DetailsFeuilleDeRouteProps):ReactElement {
  return (
    <>
      <h2
        className="color-blue-france fr-mt-5w"
      >
        {feuilleDeRoute.nom}
      </h2>
      <div
        className="fr-mb-2w"
      >
        <div className="color-grey">
          Responsable de la feuille de route
        </div>
        <Tag >
          CC des Monts du Lyonnais
        </Tag>
      </div>
      <div
        className="fr-mb-2w"
      >
        <div className="color-grey">
          Budget total des actions
        </div>
        <div className="font-weight-700">
          {`${feuilleDeRoute.budgetGlobal}€`}
        </div>
      </div>
      <div
        className="fr-mb-2w"
      >
        <div className="color-grey">
          Montant de la subvention demandée
        </div>
        <div className="font-weight-700">
          30 000€
        </div>
      </div>
      <div
        className="fr-mb-2w"
      >
        <div className="color-grey">
          Montant de la subvention accordée
        </div>
        <div className="font-weight-700">
          30 000€
        </div>
      </div>
      <div
        className="fr-mb-2w"
      >
        <div className="color-grey">
          Bénéficiaires des subventions
        </div>
        <Tag>
          CC des Monts du Lyonnais
        </Tag>
      </div>
      <div
        className="fr-mb-2w"
      >
        <div className="color-grey">
          Montant de la subvention formation accordée
        </div>
        <div className="font-weight-700">
          20 000€
        </div>
      </div>
      <div
        className="fr-mb-2w"
      >
        <div className="color-grey">
          Bénéficiaires des subventions formation
        </div>
        <Tag>
          Croix Rouge Française
        </Tag>
      </div>
      <ul className="fr-btns-group">
        <li>
          <button
            className="fr-btn fr-btn--secondary"
            type="button"
          >
            Plus de détails
          </button>
        </li>
        <li>
          <button
            className="fr-btn fr-btn--secondary"
            type="button"
          >
            Télécharger le document PDF
          </button>
        </li>
      </ul>
    </>
  )
}
