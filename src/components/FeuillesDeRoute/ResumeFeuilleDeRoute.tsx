import Link from 'next/link'
import { PropsWithChildren, ReactElement } from 'react'

import styles from './FeuillesDeRoute.module.css'
import OuvrirPdf from '../shared/OuvrirPdf/OuvrirPdf'
import Tag from '../shared/Tag/Tag'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { FeuilleDeRouteViewModel } from '@/presenters/feuillesDeRoutePresenter'

export default function ResumeFeuilleDeRoute({ children, feuilleDeRoute }: Props): ReactElement {
  return (
    <div
      aria-label={feuilleDeRoute.nom}
      className="grey-border border-radius fr-mb-2w fr-p-4w"
      role="region"
    >
      <div className={styles['align-items']}>
        <TitleIcon icon="survey-line" />
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
        {feuilleDeRoute.porteur === undefined ?
          <div className="fr-tag">
            Aucune structure porteuse
          </div> :
          <Tag href={feuilleDeRoute.porteur.link}>
            {feuilleDeRoute.porteur.label}
          </Tag>}
        {' '}
        <span>
          {feuilleDeRoute.wordingNombreCofinanceursEtBeneficiaires}
        </span>
      </div>
      <div className="fr-p-3w grey-border border-radius">
        <div className={styles['align-items']}>
          <p className="fr-text--bold fr-mb-0">
            {feuilleDeRoute.nombreDActionsAttachees}
          </p>
          <Link
            className="fr-btn fr-btn--primary fr-btn--icon-left fr-fi-add-line"
            href={feuilleDeRoute.links.ajouter}
          >
            Ajouter une action
          </Link>
        </div>
        <hr className="fr-mb-1w fr-py-1w" />
        {children}
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
