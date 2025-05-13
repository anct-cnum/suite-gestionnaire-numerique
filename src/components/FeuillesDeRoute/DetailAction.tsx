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
      <Badge color={action.statut.variant}>
        {action.statut.libelle}
      </Badge>
      <ul
        aria-label="Besoins"
        className="fr-ml-1w"
      >
        {action.besoins.map((besoin) => (
          <li
            className={`color-grey fr-text--bold fr-text--sm ${styles.besoin}`}
            key={besoin}
          >
            {besoin}
          </li>
        ))}
      </ul>
      <div className="color-grey fr-mt-2w fr-text--bold">
        {action.libellePorteurs}
      </div>
      {action.porteurs.length === 0 ? (
        <span>
          -
        </span>
      ) :
        action.porteurs.map((porteur) => (
          <Tag
            href={porteur.link}
            key={porteur.link}
          >
            {porteur.label}
          </Tag>
        ))}
      <div className="color-grey fr-mt-2w fr-text--bold">
        Description de l’action
      </div>
      <ReadMore texte={action.description} />
      <ul
        aria-label="Budget prévisionnel"
        className="grey-border"
      >
        <li className={`${styles.budget__global} fr-grid-row fr-btns-group--space-between fr-mb-1w fr-p-2w`}>
          <span role="term">
            {action.budgetPrevisionnel.global.libelle}
          </span>
          <span role="definition">
            {action.budgetPrevisionnel.global.montant}
          </span>
        </li>
        <li className={`${styles.financement} fr-p-2w background-blue-france`}>
          <p className="fr-mb-1w color-blue-france fr-text--bold">
            Financement :
            {' '}
            {action.libelleEnveloppe}
          </p>
          {action.budgetPrevisionnel.subventions.map((subvention) => (
            <li
              className={`${styles.budget__subvention} fr-grid-row fr-btns-group--space-between fr-mb-1w fr-ml-1w`}
              key={subvention.libelle}
            >
              <span role="term">
                <span className="fr-text--bold">
                  ·
                </span>
                {' '}
                {subvention.libelle}
              </span>
              <span role="definition">
                {subvention.montant}
              </span>
            </li>
          ))}
        </li>
        <li className="fr-p-2w fr-text--bold">
          {action.budgetPrevisionnel.coFinancements.map((coFinancement) => (
            <li
              className="fr-grid-row fr-btns-group--space-between fr-mb-1w"
              key={coFinancement.libelle}
            >
              <span role="term">
                {coFinancement.libelle}
              </span>
              <span role="definition">
                {coFinancement.montant}
              </span>
            </li>
          ))}
        </li>
      </ul>
      <div className="color-grey  fr-text--bold fr-mt-2w">
        Bénéficiaires des subventions
      </div>
      <ul
        aria-label="Bénéficiaires des subventions"
        className="fr-tags-group"
      >
        {action.beneficiaires.map((beneficiaire) => (
          <li key={beneficiaire.label}>
            <Tag href={beneficiaire.link}>
              {beneficiaire.label}
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
