import { ReactElement } from 'react'

import ResumeAction from './ResumeAction'
import styles from '../Gouvernance/Gouvernance.module.css'
import Icon from '../shared/Icon/Icon'
import Tag from '../shared/Tag/Tag'
import { FeuilleDeRouteViewModel } from '@/presenters/gouvernancePresenter'

export default function ResumeFeuilleDeRoute({ feuilleDeRoute }: Props): ReactElement {
  return (
    <div className='grey-border border-radius fr-mb-2w fr-p-4w'>

      <div className={styles['align-items']}>
        <Icon icon='survey-line' />
        <button
          className='fr-btn fr-btn--secondary'
          type='button'
        >
          Voir le détail
        </button>
      </div>
      <div className='fr-mb-3w'>
        <p className='fr-h3 color-blue-france fr-mb-1w'>
          {feuilleDeRoute.nom}
        </p>
        <Tag>
          {feuilleDeRoute.porteur}
        </Tag>
        {' '}
        <span>
          5 bénéficiaires
        </span>
        <span>
          3 co-financeurs
        </span>
      </div>

      <div className='fr-p-3w grey-border border-radius'>

        <div className={styles['align-items']}>
          <p className='fr-text--bold fr-mb-0'>
            3 actions attachées à cette feuille de route
          </p>
          <button
            className='fr-btn fr-btn--primary fr-btn--icon-left fr-fi-add-line'
            type='button'
          >
            Ajouter une action
          </button>
        </div>
        <hr />

        <ul
          aria-label='actions'
          style={{ listStyle: 'none' }}
        >
          <li>
            <ResumeAction />
          </li>
          <li>
            <ResumeAction />
          </li>
        </ul>
        <div className='container'>
          <div className='fr-grid-row'>
            <div className='fr-col-5'>
              <p className='fr-text--bold'>
                Budget total de la feuille de route
              </p>
            </div>
            <div className='fr-col-7'>
              <p className='fr-text--bold fr-mb-1w right'>
                145 000 €
              </p>
              <p className='fr-mb-0 right'>
                dont 90 000 € de co-financements et 55 000 € des financements accordés
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
