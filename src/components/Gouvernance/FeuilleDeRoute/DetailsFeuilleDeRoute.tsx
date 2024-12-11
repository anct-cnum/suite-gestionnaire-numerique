import Link from 'next/link'
import { ReactElement } from 'react'

import DrawerTitle from '@/components/shared/DrawerTitle/DrawerTitle'
import { FeuilleDeRouteViewModel } from '@/presenters/gouvernancePresenter'

export default function DetailsFeuilleDeRoute({ feuilleDeRoute, labelId }: DetailsFeuilleDeRouteProps): ReactElement {
  return (
    <>
      <DrawerTitle id={labelId}>
        {feuilleDeRoute.nom}
      </DrawerTitle>
      <div className="fr-mb-2w">
        <div className="color-grey">
          Responsable de la feuille de route
        </div>
        <a
          className="fr-tag"
          href="/"
          target="_self"
        >
          {feuilleDeRoute.porteur}
        </a>
      </div>
      <div className="fr-mb-2w">
        <div className="color-grey">
          Budget total des actions
        </div>
        <div className="font-weight-700">
          {`${feuilleDeRoute.budgetGlobal} €`}
        </div>
      </div>
      <div className="fr-mb-2w">
        <div className="color-grey">
          Montant de la subvention demandée
        </div>
        <div className="font-weight-700">
          {`${feuilleDeRoute.montantSubventionDemande} €`}
        </div>
      </div>
      <div className="fr-mb-2w">
        <div className="color-grey">
          Montant de la subvention accordée
        </div>
        <div className="font-weight-700">
          {`${feuilleDeRoute.montantSubventionAccorde} €`}
        </div>
      </div>
      <div className="fr-mb-2w">
        <div className="color-grey">
          {`${feuilleDeRoute.wordingBeneficiaires} des subventions`}
        </div>
        {
          feuilleDeRoute.beneficiaires.length > 0 ?
            <ul className="fr-tags-group">
              {
                feuilleDeRoute.beneficiaires.map((membre) => (
                  <li key={membre.nom}>
                    <a
                      className="fr-tag"
                      href="/"
                      key={membre.nom}
                      target="_self"
                    >
                      {membre.nom}
                    </a>
                  </li>

                ))
              }
            </ul>
            : '-'
        }
      </div>
      <div className="fr-mb-2w">
        <div className="color-grey">
          Montant de la subvention formation accordée
        </div>
        <div className="font-weight-700">
          {`${feuilleDeRoute.montantSubventionFormationAccorde} €`}
        </div>
      </div>
      <div className="fr-mb-2w">
        <div className="color-grey">
          {`${feuilleDeRoute.wordingBeneficiairesSubventionFormation} des subventions formation`}
        </div>
        {
          feuilleDeRoute.beneficiairesSubventionFormation.length > 0 ?
            <ul className="fr-tags-group">
              {
                feuilleDeRoute.beneficiairesSubventionFormation.map((membre) => (
                  <li key={membre.nom}>
                    <a
                      className="fr-tag"
                      href="/"
                      target="_self"
                    >
                      {membre.nom}
                    </a>
                  </li>
                ))
              }
            </ul>
            : '-'
        }
      </div>
      <ul className="fr-btns-group--icon-left fr-btns-group">
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
  labelId: string
}>
