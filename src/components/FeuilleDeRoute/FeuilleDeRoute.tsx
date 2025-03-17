'use client'

import Link from 'next/link'
import { ReactElement } from 'react'

import AjouterUneNoteDeContextualisation from './AjouterUneNoteDeContextualisation'
import styles from './FeuilleDeRoute.module.css'
import ModifierUneFeuilleDeRoute from './ModifierUneFeuilleDeRoute'
import ModifierUneNoteDeContextualisation from './ModifierUneNoteDeContextualisation'
import Badge from '../shared/Badge/Badge'
import Historique from '../shared/Historique/Historique'
import Icon from '../shared/Icon/Icon'
import PageTitle from '../shared/PageTitle/PageTitle'
import ReadMore from '../shared/ReadMore/ReadMore'
import Tag from '../shared/Tag/Tag'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { FeuilleDeRouteViewModel } from '@/presenters/feuilleDeRoutePresenter'

export default function FeuilleDeRoute({ feuilleDeRouteViewModel }: Props): ReactElement {
  return (
    <div className="fr-grid-row fr-grid-row--center">
      <div>
        <title>
          {feuilleDeRouteViewModel.nom}
        </title>
        <div className="fr-grid-row space-between fr-grid-row--middle">
          <PageTitle>
            {feuilleDeRouteViewModel.nom}
          </PageTitle>
          <ModifierUneFeuilleDeRoute
            contratPreexistant={feuilleDeRouteViewModel.formulaire.contratPreexistant}
            membres={feuilleDeRouteViewModel.formulaire.membres}
            nom={feuilleDeRouteViewModel.nom}
            perimetres={feuilleDeRouteViewModel.formulaire.perimetres}
            uidFeuilleDeRoute={feuilleDeRouteViewModel.uidFeuilleDeRoute}
            uidGouvernance={feuilleDeRouteViewModel.uidGouvernance}
          />
        </div>
        <div className="fr-mb-3w">
          <Tag>
            {feuilleDeRouteViewModel.porteur}
          </Tag>
          <div className="fr-tag fr-ml-1w">
            {
              feuilleDeRouteViewModel.formulaire.perimetres
                .filter((perimetre) => Boolean(perimetre.isSelected))
                .map((perimetre) => `Périmètre ${perimetre.label.toLowerCase()}`)
            }
          </div>
          {' '}
        </div>
        <div className="fr-grid-row space-between">
          <span>
            {feuilleDeRouteViewModel.infosActions}
          </span>
          <span className="fr-text--sm color-grey">
            {feuilleDeRouteViewModel.infosDerniereEdition}
          </span>
        </div>
        <section
          aria-labelledby="contextualisation"
          className="fr-mb-4w grey-border border-radius fr-p-4w"
        >
          <header className="fr-grid-row space-between fr-grid-row--middle fr-mb-2w fr-pb-2w separator">
            <h2
              className="fr-h6 color-blue-france fr-m-0"
              id="contextualisation"
            >
              Contextualisation des demandes de subvention
            </h2>
            {
              feuilleDeRouteViewModel.contextualisation
                ? <ModifierUneNoteDeContextualisation contextualisation={feuilleDeRouteViewModel.contextualisation} />
                : <AjouterUneNoteDeContextualisation />
            }
          </header>
          {
            feuilleDeRouteViewModel.contextualisation
              ? (
                <ReadMore
                  texte={feuilleDeRouteViewModel.contextualisation}
                />
              )
              : null
          }
        </section>
        <section
          aria-labelledby="upload"
          className="fr-mb-4w grey-dashed-border border-radius fr-p-4w"
        >
          <div className="fr-grid-row space-between">
            <div>
              <header>
                <h2
                  className="fr-h6 color-blue-france"
                  id="upload"
                >
                  Déposez votre document de stratégie
                </h2>
              </header>
              <div className="fr-upload-group">
                <label
                  className="fr-label"
                  htmlFor="file-upload"
                >
                  <span className="fr-hint-text">
                    Taille maximale : 25 Mo. Format .pdf
                  </span>
                </label>
                <input
                  className="fr-upload"
                  id="file-upload"
                  name="file-upload"
                  type="file"
                />
              </div>
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
        <section
          aria-labelledby="actions"
          className="glycine-background fr-p-4w fr-mb-4w"
        >
          <header>
            <ul className="fr-mb-4w fr-p-0">
              <li className="fr-grid-row space-between fr-mb-1w fr-h4">
                <span>
                  Budget total des actions
                </span>
                {' '}
                <span>
                  {feuilleDeRouteViewModel.budgets.total}
                </span>
              </li>
              <li className="fr-grid-row space-between fr-mb-1w">
                <span>
                  Montant des financements accordés par l’état
                </span>
                {' '}
                <span className="font-weight-700">
                  {feuilleDeRouteViewModel.budgets.etat}
                </span>
              </li>
              <li className="fr-grid-row space-between fr-mb-1w">
                <span>
                  Montant des co-financements
                </span>
                {' '}
                <span className="font-weight-700">
                  {feuilleDeRouteViewModel.budgets.cofinancement}
                </span>
              </li>
            </ul>
            <div className="fr-grid-row space-between fr-grid-row--middle fr-mb-4w">
              <h2
                className="fr-h6 color-blue-france fr-m-0"
                id="actions"
              >
                {feuilleDeRouteViewModel.actions.length}
                {' '}
                actions pour cette feuille de route
              </h2>
              <Link
                className="fr-btn fr-btn--primary fr-btn--icon-left fr-fi-add-line"
                href={feuilleDeRouteViewModel.urlAjouterUneAction}
              >
                Ajouter une action
              </Link>
            </div>
          </header>
          {
            feuilleDeRouteViewModel.actions.map((action) => (
              <article
                aria-labelledby={action.uid}
                className="white-background fr-p-4w fr-mb-2w"
                key={action.uid}
              >
                <header>
                  <div className="fr-grid-row space-between fr-mb-2w">
                    <TitleIcon
                      background={action.statut.background}
                      icon={action.statut.icon}
                    />
                    <div>
                      <Link
                        className="fr-btn fr-btn--tertiary fr-mr-2w"
                        href={action.urlModifier}
                        title={`Modifier ${action.nom}`}
                      >
                        Modifier
                      </Link>
                      <button
                        className="fr-btn fr-btn--tertiary color-red"
                        title={`Supprimer ${action.nom}`}
                        type="button"
                      >
                        <Icon icon="delete-line" />
                      </button>
                    </div>
                  </div>
                  <h3
                    className="fr-h4 color-blue-france fr-mb-1w"
                    id={action.uid}
                  >
                    {action.nom}
                  </h3>
                  <Badge
                    color={action.statut.variant}
                  >
                    {action.statut.libelle}
                  </Badge>
                  <div className="fr-grid-row space-between fr-grid-row--middle fr-mt-4w">
                    <p>
                      {action.perimetre}
                    </p>
                    <p>
                      Porteur :
                      {' '}
                      <Tag>
                        {action.porteur}
                      </Tag>
                    </p>
                  </div>
                  <ul className="grey-border border-radius fr-p-0 fr-pt-2w">
                    <li className="fr-grid-row space-between fr-px-2w fr-mb-2w font-weight-700">
                      <span>
                        Budget prévisionnel de l’action
                      </span>
                      {' '}
                      <span>
                        {action.budgetPrevisionnel.total}
                      </span>
                    </li>
                    <li className="fr-grid-row space-between fr-px-2w fr-mb-2w fr-py-1w color-blue-france blue-background">
                      <span>
                        Subvention demandée pour l’action :
                        {' '}
                        <br />
                        <span className="font-weight-700">
                          Conseiller Numérique - Renouvellement - État
                        </span>
                      </span>
                      {' '}
                      <span>
                        {action.budgetPrevisionnel.montant}
                      </span>
                    </li>
                    <li className="fr-grid-row space-between fr-px-2w fr-mb-2w">
                      <span>
                        2 co-financeurs
                      </span>
                      {' '}
                      <span>
                        {action.budgetPrevisionnel.coFinanceur}
                      </span>
                    </li>
                  </ul>
                </header>
              </article>
            ))
          }
        </section>
        <section
          aria-labelledby="historique"
          className={`fr-mb-4w grey-border border-radius fr-p-4w ${styles['no-margin']}`}
        >
          <Historique
            historique={feuilleDeRouteViewModel.historiques}
            sousTitre="Historique des dernières activités pour cette feuille de route."
            titre="Activité et historique"
          />
        </section>
      </div>
    </div>
  )
}

type Props = Readonly<{
  feuilleDeRouteViewModel: FeuilleDeRouteViewModel
}>
