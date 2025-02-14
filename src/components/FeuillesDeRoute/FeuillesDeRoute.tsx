import { ReactElement } from 'react'

import styles from './FeuillesDeRoute.module.css'
import ResumeFeuilleDeRoute from './ResumeFeuilleDeRoute'
import { FeuilleDeRouteViewModel, FeuillesDeRouteViewModel } from '@/presenters/feuillesDeRoutePresenter'

export default function FeuillesDeRoute({ feuillesDeRouteViewModel }: Props): ReactElement {
  return (
    <div className='fr-container fr-mt-5w'>
      <div className={styles['align-items']}>
        <h1
          className="color-blue-france fr-mb-0 fr-h1"
        >
          {feuillesDeRouteViewModel.titre}
        </h1>
        <button
          className="fr-btn fr-btn--secondary fr-btn--icon-left fr-fi-add-line"
          type="button"
        >
          Ajouter une feuille de route
        </button>
      </div>
      <div
        aria-label='budget-global'
        className={styles['align-items']}
        role='region'
      >
        <div className={styles['card-resume-montant-subvention']}>
          <p className='fr-mb-0 color-blue-france fr-h6'>
            {feuillesDeRouteViewModel.totaux.budget}
            {' '}
          </p>
          <p className='color-blue-france fr-mb-0'>
            Total des subventions de l‘État
            {' '}
          </p>
        </div>
        <div className={styles['card-resume-montant-subvention']}>
          <p className=' fr-mb-0 color-blue-france fr-h6'>
            {feuillesDeRouteViewModel.totaux.coFinancement}
            {' '}
          </p>
          <p className='color-blue-france fr-mb-0'>
            {' '}
            Total des co-financements
          </p>
        </div>
        <div className={styles['card-resume-montant-subvention']}>
          <p className='fr-mb-0 color-blue-france fr-h6'>
            {feuillesDeRouteViewModel.totaux.financementAccorde}
          </p>
          <p className='color-blue-france fr-mb-0'>
            Budget total des feuilles de route
          </p>
        </div>
      </div>
      <ul
        aria-label='feuilles-de-route'
        className='fr-p-0'
        style={{ listStyle: 'none' }}
      >
        {feuillesDeRouteViewModel.feuillesDeRoute.map((feuilleDeRoute: FeuilleDeRouteViewModel) => (
          <li key={feuilleDeRoute.nom}>
            <ResumeFeuilleDeRoute feuilleDeRoute={feuilleDeRoute} />
          </li>
        ))}

      </ul>
    </div>
  )
}

type Props = Readonly<{
  feuillesDeRouteViewModel: FeuillesDeRouteViewModel
}>
