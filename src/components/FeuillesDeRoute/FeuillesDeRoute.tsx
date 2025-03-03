import { ReactElement } from 'react'

import AjouterUneFeuilleDeRoute from './AjouterUneFeuilleDeRoute'
import styles from './FeuillesDeRoute.module.css'
import ResumeFeuilleDeRoute from './ResumeFeuilleDeRoute'
import PageTitle from '../shared/PageTitle/PageTitle'
import { FeuilleDeRouteViewModel, FeuillesDeRouteViewModel } from '@/presenters/feuillesDeRoutePresenter'

export default function FeuillesDeRoute({ feuillesDeRouteViewModel }: Props): ReactElement {
  return (
    <div className={`fr-container fr-mt-5w ${styles['feuilles-de-route']}`}>
      <div className={styles['align-items']}>
        <PageTitle margin="fr-mb-0">
          {feuillesDeRouteViewModel.titre}
        </PageTitle>
        <AjouterUneFeuilleDeRoute
          contratPreexistant={feuillesDeRouteViewModel.formulaire.contratPreexistant}
          membres={feuillesDeRouteViewModel.formulaire.membres}
          perimetres={feuillesDeRouteViewModel.formulaire.perimetres}
          uidGouvernance={feuillesDeRouteViewModel.uidGouvernance}
        />
      </div>
      <div
        aria-label="budget-global"
        className={styles['align-items']}
        role="region"
      >
        <div className={styles['card-resume-montant-subvention']}>
          <p className="fr-mb-0 color-blue-france fr-h6">
            {feuillesDeRouteViewModel.totaux.budget}
            {' '}
          </p>
          <p className="color-blue-france fr-mb-0">
            Total des subventions de l‘État
            {' '}
          </p>
        </div>
        <div className={styles['card-resume-montant-subvention']}>
          <p className=" fr-mb-0 color-blue-france fr-h6">
            {feuillesDeRouteViewModel.totaux.coFinancement}
            {' '}
          </p>
          <p className="color-blue-france fr-mb-0">
            {' '}
            Total des co-financements
          </p>
        </div>
        <div className={styles['card-resume-montant-subvention']}>
          <p className="fr-mb-0 color-blue-france fr-h6">
            {feuillesDeRouteViewModel.totaux.financementAccorde}
          </p>
          <p className="color-blue-france fr-mb-0">
            Budget total des feuilles de route
          </p>
        </div>
      </div>
      <ul
        aria-label="Feuilles de route"
        className="fr-p-0"
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
