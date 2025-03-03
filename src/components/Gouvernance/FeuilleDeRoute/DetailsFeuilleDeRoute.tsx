import Link from 'next/link'
import { ReactElement } from 'react'

import DrawerTitle from '@/components/shared/DrawerTitle/DrawerTitle'
import Tag from '@/components/shared/Tag/Tag'
import TitleIcon from '@/components/shared/TitleIcon/TitleIcon'
import { FeuilleDeRouteViewModel } from '@/presenters/gouvernancePresenter'

export default function DetailsFeuilleDeRoute({ feuilleDeRoute, labelId }: Props): ReactElement {
  return (
    <>
      <DrawerTitle id={labelId}>
        <TitleIcon icon="survey-line" />
        <br />
        {feuilleDeRoute.nom}
      </DrawerTitle>
      <div className="fr-mb-2w">
        <div className="color-grey">
          Responsable de la feuille de route
        </div>
        <Tag>
          {feuilleDeRoute.porteur}
        </Tag>
      </div>
      <div className="fr-mb-2w">
        <div className="color-grey">
          Budget total des actions
        </div>
        <div className="font-weight-700">
          {feuilleDeRoute.budgetGlobal}
        </div>
      </div>
      <div className="fr-mb-2w">
        <div className="color-grey">
          Montant de la subvention demandée
        </div>
        <div className="font-weight-700">
          {feuilleDeRoute.montantSubventionDemande}
        </div>
      </div>
      <div className="fr-mb-2w">
        <div className="color-grey">
          Montant de la subvention accordée
        </div>
        <div className="font-weight-700">
          {feuilleDeRoute.montantSubventionAccorde}
        </div>
      </div>
      <div className="fr-mb-2w">
        <div className="color-grey">
          {`${feuilleDeRoute.wordingBeneficiairesSubvention} des subventions`}
        </div>
        {
          feuilleDeRoute.beneficiairesSubvention.length > 0 ?
            <ul className="fr-tags-group">
              {
                feuilleDeRoute.beneficiairesSubvention.map((beneficiaire) => (
                  <li key={beneficiaire.nom}>
                    <Tag>
                      {beneficiaire.nom}
                    </Tag>
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
                feuilleDeRoute.beneficiairesSubventionFormation.map((beneficiaire) => (
                  <li key={beneficiaire.nom}>
                    <Tag>
                      {beneficiaire.nom}
                    </Tag>
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
            href={feuilleDeRoute.lien}
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

type Props = Readonly<{
  feuilleDeRoute: FeuilleDeRouteViewModel
  labelId: string
}>
