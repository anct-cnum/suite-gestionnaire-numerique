'use client'

import { ReactElement, useContext } from 'react'

import AjouterUneFeuilleDeRoute from './AjouterUneFeuilleDeRoute'
import styles from './FeuillesDeRoute.module.css'
import ResumeAction from './ResumeAction'
import ResumeFeuilleDeRoute from './ResumeFeuilleDeRoute'
import { gouvernanceContext } from '../shared/GouvernanceContext'
import PageTitle from '../shared/PageTitle/PageTitle'
import { FeuilleDeRouteViewModel, FeuillesDeRouteViewModel } from '@/presenters/feuillesDeRoutePresenter'

export default function FeuillesDeRoute({ feuillesDeRouteViewModel }: Props): ReactElement {
  const { gouvernanceViewModel } = useContext(gouvernanceContext)

  return (
    <div className="fr-container fr-mt-5w">
      <div className={styles['align-items']}>
        <PageTitle margin="fr-mb-0">
          {feuillesDeRouteViewModel.titre}
          {' '}
          ·
          {' '}
          {gouvernanceViewModel.departement}
        </PageTitle>
        {gouvernanceViewModel.peutGererGouvernance ?
          <AjouterUneFeuilleDeRoute
            membres={feuillesDeRouteViewModel.formulaire.membres}
            perimetres={feuillesDeRouteViewModel.formulaire.perimetres}
            uidGouvernance={gouvernanceViewModel.uid}
          /> : null}
      </div>
      {
        feuillesDeRouteViewModel.feuillesDeRoute.length === 0 ? (
          <article className="background-blue-france fr-p-6w fr-mb-4w center">
            <p className="fr-h6">
              Aucune feuille de route
            </p>
            <p>
              Cliquez sur le bouton ajouter une feuille de route pour définir votre première feuille de route.
            </p>
          </article>
        ) : (
          <>
            <div
              aria-label="budget-global"
              className={styles['align-items']}
              role="region"
            >
              <div className={styles['card-resume-montant-subvention']}>
                <p className="fr-mb-0 color-blue-france fr-h6">
                  {feuillesDeRouteViewModel.totaux.financementAccorde}
                  {' '}
                </p>
                <p className="color-blue-france fr-mb-0">
                  Total des financements accordés
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
                  {feuillesDeRouteViewModel.totaux.budget}
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
                <li key={feuilleDeRoute.uid}>
                  <ResumeFeuilleDeRoute feuilleDeRoute={feuilleDeRoute} >
                    {feuilleDeRoute.actions.length > 0 ?
                      <ResumeAction
                        actions={feuilleDeRoute.actions}
                        uidFeuilleDeRoute={feuilleDeRoute.uid}
                      /> :
                      null}
                  </ResumeFeuilleDeRoute>
                </li>
              ))}
            </ul>
          </>
        )
      }
    </div>
  )
}

type Props = Readonly<{
  feuillesDeRouteViewModel: FeuillesDeRouteViewModel
}>
