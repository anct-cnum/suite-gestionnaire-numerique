import Link from 'next/link'
import { ReactElement } from 'react'

import styles from './FeuillesDeRoute.module.css'
import ResumeAction from './ResumeAction'
import Icon from '../shared/Icon/Icon'
import Tag from '../shared/Tag/Tag'
import { FeuilleDeRouteViewModel } from '@/presenters/feuillesDeRoutePresenter'

export default function ResumeFeuilleDeRoute({ feuilleDeRoute }: Props): ReactElement {
  return (
    <div className="grey-border border-radius fr-mb-2w fr-p-4w">
      <div className={styles['align-items']}>
        <Icon icon="survey-line" />
        <Link
          className="fr-btn fr-btn--secondary"
          href={feuilleDeRoute.links.detail}
          type="button"
        >
          Voir le détail
        </Link>
      </div>
      <div className="fr-mb-3w">
        <h2 className="fr-h3 color-blue-france fr-mb-1w">
          {feuilleDeRoute.nom}
        </h2>
        <Tag>
          {feuilleDeRoute.porteur}
        </Tag>
        {' '}
        <span>
          {feuilleDeRoute.beneficiaires}
        </span>
        {' '}
        <span>
          {feuilleDeRoute.coFinanceurs}
        </span>
      </div>
      <div className="fr-p-3w grey-border border-radius">
        <div className={styles['align-items']}>
          <p className="fr-text--bold fr-mb-0">
            {feuilleDeRoute.nombreDActionsAttachees}
          </p>
          <Link
            className="fr-btn fr-btn--primary fr-btn--icon-left fr-fi-add-line"
            href={`/gouvernance/11/feuille-de-route/${feuilleDeRoute.uid}/action/ajouter`}
          >
            Ajouter une action
          </Link>
        </div>
        <hr className="fr-mb-1w fr-py-1w" />
        <ResumeAction actions={feuilleDeRoute.actions} />
        <div className="container">
          <div className="fr-grid-row">
            <div className="fr-col-4">
              <p className="fr-text--bold">
                Budget total de la feuille de route
              </p>
            </div>
            <div className="fr-col-8">
              <p className="fr-text--bold fr-mb-1w right">
                {feuilleDeRoute.totaux.budget}
              </p>
              <p className="fr-mb-0 right">
                {feuilleDeRoute.wordingDetailDuBudget}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

type Props = Readonly<{
  feuilleDeRoute: FeuilleDeRouteViewModel
}>
