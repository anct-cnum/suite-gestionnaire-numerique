import { PropsWithChildren, ReactElement } from 'react'

import localStyles from './ResumeFeuilleDeRouteVitrine.module.css'
import styles from '../../FeuillesDeRoute/FeuillesDeRoute.module.css'
import OuvrirPdf from '../../shared/OuvrirPdf/OuvrirPdf'
import TitleIcon from '../../shared/TitleIcon/TitleIcon'
import { FeuilleDeRouteViewModel } from '@/presenters/feuillesDeRoutePresenter'

/**
 * Version vitrine du composant ResumeFeuilleDeRoute
 * Sans les boutons d'édition et sans le contexte gouvernance
 */
export default function ResumeFeuilleDeRouteVitrine({ children, feuilleDeRoute }: Props): ReactElement {
  return (
    <div
      aria-label={feuilleDeRoute.nom}
      className={localStyles.card}
      role="region"
    >
      <div className={styles['align-items']}>
        <TitleIcon icon="survey-line" />
      </div>
      <div className="fr-mb-3w">
        <h2 className="fr-h3 color-blue-france fr-mb-1w">
          {feuilleDeRoute.nom}
        </h2>
        {feuilleDeRoute.porteur === undefined ?
          <div className="fr-tag">
            Aucune structure porteuse
          </div> :
          <div className="fr-tag">
            {feuilleDeRoute.porteur.label}
          </div>}
        {' '}
        <span>
          {feuilleDeRoute.wordingNombreCofinanceursEtBeneficiaires}
        </span>
      </div>
      <div className={localStyles.innerCard}>
        <div className={styles['align-items']}>
          <p className="fr-text--bold fr-mb-0">
            {feuilleDeRoute.nombreDActionsAttachees}
          </p>
        </div>
        <hr className="fr-mb-1w fr-py-1w" />
        {children}
        <div className="container">
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12 fr-col-md-4">
              <p className="fr-text--bold fr-mb-1w fr-mb-md-0">
                Budget total de la feuille de route
              </p>
            </div>
            <div className="fr-col-12 fr-col-md-8">
              <p className={`fr-text--bold fr-mb-1w ${localStyles.budgetValue}`}>
                {feuilleDeRoute.totaux.budget}
              </p>
              <p className={`fr-mb-0 ${localStyles.budgetValue}`}>
                {feuilleDeRoute.wordingDetailDuBudget}
              </p>
            </div>
          </div>
        </div>
      </div>
      {feuilleDeRoute.pieceJointe ?
        <section
          aria-labelledby="document"
          className="fr-mb-4w grey-border border-radius fr-p-4w fr-mt-3w"
        >
          <OuvrirPdf
            href={feuilleDeRoute.pieceJointe.href}
            metadonnee={feuilleDeRoute.pieceJointe.metadonnee}
            nom={feuilleDeRoute.pieceJointe.nom}
          />
        </section>
        : null}
    </div>
  )
}

type Props = PropsWithChildren<Readonly<{
  feuilleDeRoute: FeuilleDeRouteViewModel
}>>
