import Link from 'next/link'
import { PropsWithChildren, ReactElement } from 'react'

import styles from './FeuillesDeRoute.module.css'
import Tag from '../shared/Tag/Tag'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { FeuilleDeRouteViewModel } from '@/presenters/feuillesDeRoutePresenter'

export default function ResumeFeuilleDeRoute({ feuilleDeRoute, children }: Props): ReactElement {
  return (
    <div className="grey-border border-radius fr-mb-2w fr-p-4w">
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
        <Tag>
          {feuilleDeRoute.porteur}
        </Tag>
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
            href={`/gouvernance/11/feuille-de-route/${feuilleDeRoute.uid}/action/ajouter`}
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
      <section
        aria-labelledby="openPdf"
        className="fr-mb-4w grey-border border-radius fr-p-4w fr-mt-3w"
      >
        <div className="fr-grid-row space-between">
          <div>
            <header>
              <h2
                className="fr-h6 color-blue-france fr-mb-0"
                id="openPdf"
              >
                Feuille de route inclusion.pdf
              </h2>
              <span className="fr-hint-text">
                Le 08/08/2024, 25 Mo, pdf.
              </span>
            </header>
            <div className="fr-upload-group" />
            <button
              className="fr-btn fr-btn--secondary fr-mt-2w"
              type="button"
            >
              Ouvrir le pdf
            </button>
          </div>
          <div>
            <svg
              aria-hidden="true"
              height="107"
              viewBox="0 0 76 107"
              width="76"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 4C0 1.79086 1.79086 0 4 0H72C74.2091 0 76 1.79086 76 4V103C76 105.209 74.2091 107 72 107H4C1.79086 107 0 105.209 0 103V4Z"
                fill="#E8EDFF"
              />
              <path
                d="M26 48.6667L34.004 40.6667H48.664C49.4 40.6667 50 41.2733 50 41.9893V66.0107C49.9993 66.7414 49.4067 67.3333 48.676 67.3333H27.324C26.9704 67.3309 26.6322 67.188 26.3839 66.9362C26.1356 66.6844 25.9975 66.3443 26 65.9907V48.6667ZM35.3334 43.3333V50H28.6667V64.6667H47.3334V43.3333H35.3334Z"
                fill="#6A6AF4"
              />
            </svg>
          </div>
        </div>
      </section>
    </div>
  )
}

type Props = PropsWithChildren<Readonly<{
  feuilleDeRoute: FeuilleDeRouteViewModel
}>>
