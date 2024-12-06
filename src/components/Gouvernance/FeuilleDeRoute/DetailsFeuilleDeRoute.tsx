import Link from 'next/link'
import { ReactElement } from 'react'

import Tag from '@/components/shared/Tag/Tag'
import { FeuilleDeRouteViewModel } from '@/presenters/gouvernancePresenter'

export default function DetailsFeuilleDeRoute({ feuilleDeRoute }: DetailsFeuilleDeRouteProps): ReactElement {
  return (
    <>
      <h1
        className="color-blue-france fr-mt-5w fr-h2"
      >
        {feuilleDeRoute.nom}
      </h1>
      <div
        className="fr-mb-2w"
      >
        <div className="color-grey">
          Responsable de la feuille de route
        </div>
        <Tag>
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
          {`${feuilleDeRoute.budgetGlobal} €`}
        </div>
      </div>
      <div
        className="fr-mb-2w"
      >
        <div className="color-grey">
          Montant de la subvention demandée
        </div>
        <div className="font-weight-700">
          30 000 €
        </div>
      </div>
      <div
        className="fr-mb-2w"
      >
        <div className="color-grey">
          Montant de la subvention accordée
        </div>
        <div className="font-weight-700">
          30 000 €
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
          20 000 €
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
      <ul
        className="fr-btns-group--icon-left fr-btns-group"
      >
        <li>
          <Link
            className="fr-btn fr-btn--secondary"
            href="/"
          >
            Plus de détails
          </Link>
        </li>
        <li>
          <button
            className="fr-btn fr-btn--secondary fr-icon-download-line"
            type="button"
          >
            Télécharger le document PDF
          </button>
        </li>
      </ul>
    </>
  )
}

type DetailsFeuilleDeRouteProps = Readonly<{
   feuilleDeRoute: FeuilleDeRouteViewModel
}>
