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
            className={`color-grey fr-text--sm ${styles.besoin}`}
            key={besoin}
          >
            {besoin}
          </li>
        ))}
      </ul>
      <div className="color-grey fr-mt-2w">
        {action.libellePorteurs}
      </div>
      {
        action.porteurs.map((porteur) => (
          <Tag
            href={porteur.link}
            key={porteur.link}
          >
            {porteur.label}
          </Tag>
        ))
      }
      <div className="color-grey fr-mt-2w">
        Description de l’action
      </div>
      <ReadMore texte={action.description} />
      <dl
        aria-label="Budget prévisionnel"
        className={`${styles.budget} grey-border fr-p-2w fr-mt-2w`}
        role="list"
      >
        <div className={`${styles.budget__global} fr-grid-row fr-btns-group--space-between fr-mb-1w`}>
          <dt>
            {action.budgetPrevisionnel.global.libelle}
          </dt>
          <dd>
            {action.budgetPrevisionnel.global.montant}
          </dd>
        </div>
        {action.budgetPrevisionnel.subventions.map((subvention) => (
          <>
            <p>
              Financement :
              {' '}
              {action.libelleEnveloppe}
            </p>
            <div
              className={`${styles.budget__subvention} fr-grid-row fr-btns-group--space-between fr-mb-1w`}
              key={subvention.libelle}
            >
              <dt>
                {subvention.libelle}
              </dt>
              <dd>
                {subvention.montant}
              </dd>
            </div>
          </>
        ))}
        {action.budgetPrevisionnel.coFinancements.map((coFinancement) => (
          <div
            className="fr-grid-row fr-btns-group--space-between fr-mb-1w"
            key={coFinancement.libelle}
          >
            <dt>
              {coFinancement.libelle}
            </dt>
            <dd>
              {coFinancement.montant}
            </dd>
          </div>
        ))}
      </dl>
      <div className="color-grey fr-mt-2w">
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
