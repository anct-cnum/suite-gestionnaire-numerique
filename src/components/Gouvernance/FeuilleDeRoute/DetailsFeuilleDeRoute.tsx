import Link from 'next/link'
import { ReactElement } from 'react'

import DrawerTitle from '@/components/shared/DrawerTitle/DrawerTitle'
import ExternalLink from '@/components/shared/ExternalLink/ExternalLink'
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
        <div className="color-grey fr-mb-1w">
          Responsable de la feuille de route
        </div>
        {
          feuilleDeRoute.porteur ?
            <Tag href={feuilleDeRoute.porteur.link}>
              {feuilleDeRoute.porteur.label}
            </Tag>
            :
            <div title="Aucun responsable">
              -
            </div>
        }
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
          {feuilleDeRoute.montantSubventionDemandee}
        </div>
      </div>
      <div className="fr-mb-2w">
        <div className="color-grey">
          Montant de la subvention accordée
        </div>
        <div className="font-weight-700">
          {feuilleDeRoute.montantSubventionAccordee}
        </div>
      </div>
      <div className="fr-mb-2w">
        <div className="color-grey fr-mb-1w">
          {`${feuilleDeRoute.wordingBeneficiairesSubvention} des subventions`}
        </div>
        {
          feuilleDeRoute.beneficiairesSubvention.length > 0 ?
            <ul className="fr-tags-group">
              {
                feuilleDeRoute.beneficiairesSubvention.map((beneficiaire) => (
                  <li key={beneficiaire.label}>
                    <Tag href={beneficiaire.link}>
                      {beneficiaire.label}
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
          {`${feuilleDeRoute.montantSubventionFormationAccordee} €`}
        </div>
      </div>
      <div className="fr-mb-2w">
        <div className="color-grey fr-mb-1w">
          {`${feuilleDeRoute.wordingBeneficiairesSubventionFormation} des subventions formation`}
        </div>
        {
          feuilleDeRoute.beneficiairesSubventionFormation.length > 0 ?
            <ul className="fr-tags-group">
              {
                feuilleDeRoute.beneficiairesSubventionFormation.map((beneficiaire) => (
                  <li key={beneficiaire.label}>
                    <Tag href={beneficiaire.link}>
                      {beneficiaire.label}
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
        {feuilleDeRoute.pieceJointe ?
          <li>
            <ExternalLink
              className="fr-btn fr-btn--secondary fr-mt-2w"
              href={feuilleDeRoute.pieceJointe.href}
              title="Ouvrir le document pdf"
            >
              Ouvrir le document pdf
            </ExternalLink>
          </li>
          : null}
      </ul>
    </>
  )
}

type Props = Readonly<{
  feuilleDeRoute: FeuilleDeRouteViewModel
  labelId: string
}>
