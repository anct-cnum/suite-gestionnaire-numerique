import Link from 'next/link'
import { ReactElement } from 'react'

import styles from './FeuillesDeRoute.module.css'
import Badge from '../shared/Badge/Badge'
import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import ReadMore from '../shared/ReadMore/ReadMore'
import Tag from '../shared/Tag/Tag'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { FeuilleDeRouteViewModel } from '@/presenters/feuillesDeRoutePresenter'

export default function DetailAction({ action, labelId }: Props): ReactElement {
  return (
    <>
      <DrawerTitle id={labelId}>
        <TitleIcon
          background={action.statut.background}
          icon={action.statut.icon}
        />
        <br />
        {action.nom}
      </DrawerTitle>
      <ul
        aria-label="Besoins"
        className="fr-tags-group fr-mb-2w"
      >
        <li className="fr-mr-1w">
          <Badge color={action.statut.variant}>
            {action.statut.libelle}
          </Badge>
        </li>
        {action.besoins.map((besoin) => (
          <li
            className="fr-mr-1w color-grey"
            key={besoin}
          >
            {besoin}
          </li>
        ))}
      </ul>
      <div className="color-grey fr-mt-2w">
        Porteur de l’action
      </div>
      <Tag>
        {action.porteur}
      </Tag>
      <div className="color-grey fr-mt-2w">
        Description de l’action
      </div>
      <ReadMore texte={action.description} />
      <ul
        aria-label="Budget prévisionnel"
        className={`${styles.budget} grey-border fr-p-2w fr-mt-2w`}
      >
        {action.budgetPrevisionnel.map((budget) => (
          <li
            className="fr-grid-row fr-btns-group--space-between fr-mb-1w"
            key={budget.coFinanceur}
          >
            <div>
              {budget.coFinanceur}
            </div>
            <div>
              {budget.montant}
            </div>
          </li>
        ))}
      </ul>
      <div className="color-grey fr-mt-2w">
        Bénéficiaires des subventions
      </div>
      <ul
        aria-label="Bénéficiaires des subventions"
        className="fr-tags-group"
      >
        {action.beneficiaires.map((beneficiaire) => (
          <li key={beneficiaire.nom}>
            <Tag>
              {beneficiaire.nom}
            </Tag>
          </li>
        ))}
      </ul>
      <div className="fr-btns-group fr-mt-2w">
        <Link
          className="fr-btn fr-btn--secondary"
          href={action.lienPourModifier}
        >
          Modifier cette action
        </Link>
      </div>
    </>
  )
}

type Props = Readonly<{
  action: FeuilleDeRouteViewModel['actions'][number]
  labelId: string
}>
