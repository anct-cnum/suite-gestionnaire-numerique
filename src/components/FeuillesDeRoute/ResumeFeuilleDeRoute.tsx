import { ReactElement } from 'react'

import styles from './FeuillesDeRoute.module.css'
import ResumeAction from './ResumeAction'
import Tag from '../shared/Tag/Tag'
import { FeuilleDeRouteViewModel } from '@/presenters/feuillesDeRoutePresenter'

export default function ResumeFeuilleDeRoute({ feuilleDeRoute }: Props): ReactElement {
  return (
    <div className="grey-border border-radius fr-mb-2w fr-p-4w">
      <div className={styles['align-items']}>
        <span
          aria-hidden="true"
          className="fr-icon-survey-line icon-title fr-mr-3w color-blue-france fr-py-2w"
        />
        <button
          className="fr-btn fr-btn--secondary"
          type="button"
        >
          Voir le détail
        </button>
      </div>
      <div className="fr-mb-3w">
        <h3 className="fr-h3 color-blue-france fr-mb-1w">
          {feuilleDeRoute.nom}
        </h3>
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
          <button
            className="fr-btn fr-btn--primary fr-btn--icon-left fr-fi-add-line"
            type="button"
          >
            Ajouter une action
          </button>
        </div>
        <hr className="fr-mb-1w fr-py-1w" />
        <ul
          aria-label="actions"
        >
          {feuilleDeRoute.actions.map((action) => (
            <li key={action.uid}>
              <ResumeAction action={action} />
            </li>
          ))}
        </ul>
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
