import { ReactElement } from 'react'

import styles from './FeuillesDeRoute.module.css'
import Tag from '../shared/Tag/Tag'
import { ActionViewModel } from '@/presenters/feuillesDeRoutePresenter'

export default function ResumeAction({ action }: Props): ReactElement {
  return (
    <div className="fr-container fr-p-0">
      <div
        className="fr-grid-row fr-grid-row--middle"
      >
        <div className="fr-col-1">
          <span
            aria-hidden="true"
            className={`${action.statut.icon} ${styles[action.statut.iconStyle]} icon-title fr-mr-3w fr-py-2w`}
          />
        </div>
        <div className="fr-col-7">
          <p className="fr-text--bold color-blue-france fr-mb-1w">
            {action.nom}
          </p>
          <Tag>
            {action.porteur}
          </Tag>

        </div>
        <div
          className="fr-col-4 right"
        >
          <p className={`fr-badge fr-badge--${action.statut.variant} fr-badge--md`}>
            {action.statut.libelle}
          </p>
        </div>
      </div>
      <hr className="fr-mt-3w" />
    </div>
  )
}

type Props = {
  readonly action: ActionViewModel
}
