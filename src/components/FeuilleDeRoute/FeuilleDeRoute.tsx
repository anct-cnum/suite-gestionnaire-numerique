'use client'

import Link from 'next/link'
import { ReactElement, useContext } from 'react'

import AjouterUneNoteDeContextualisation from './AjouterUneNoteDeContextualisation'
import styles from './FeuilleDeRoute.module.css'
import ModifierUneFeuilleDeRoute from './ModifierUneFeuilleDeRoute'
import ModifierUneNoteDeContextualisation from './ModifierUneNoteDeContextualisation'
import Badge from '../shared/Badge/Badge'
import { clientContext } from '../shared/ClientContext'
import DocumentVide from '../shared/DocumentVide/DocumentVide'
import Historique from '../shared/Historique/Historique'
import Icon from '../shared/Icon/Icon'
import { Notification } from '../shared/Notification/Notification'
import OuvrirPdf from '../shared/OuvrirPdf/OuvrirPdf'
import PageTitle from '../shared/PageTitle/PageTitle'
import ReadMore from '../shared/ReadMore/ReadMore'
import Tag from '../shared/Tag/Tag'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { FeuilleDeRouteViewModel } from '@/presenters/feuilleDeRoutePresenter'
import { isNullish } from '@/shared/lang'

export default function FeuilleDeRoute({ viewModel }: Props): ReactElement {
  const { pathname, supprimerDocumentAction } = useContext(clientContext)

  return (
    <div className="fr-grid-row fr-grid-row--center">
      <div>
        <title>
          {viewModel.nom}
        </title>
        <div className="fr-grid-row space-between fr-grid-row--middle">
          <PageTitle>
            {viewModel.nom}
          </PageTitle>
          <ModifierUneFeuilleDeRoute
            membres={viewModel.formulaire.membres}
            nom={viewModel.nom}
            perimetres={viewModel.formulaire.perimetres}
            uidFeuilleDeRoute={viewModel.uidFeuilleDeRoute}
            uidGouvernance={viewModel.uidGouvernance}
          />
        </div>
        <div className="fr-mb-3w">
          {
            viewModel.porteur ?
              <Tag href={viewModel.porteur.link}>
                {viewModel.porteur.label}
              </Tag>
              :
              <span title="Aucun responsable de la feuille de route">
                -
              </span>
          }
          <div className="fr-tag fr-ml-1w">
            {
              viewModel.formulaire.perimetres
                .filter((perimetre) => Boolean(perimetre.isSelected))
                .map((perimetre) => `Périmètre ${perimetre.label.toLowerCase()}`)
            }
          </div>
          {' '}
        </div>
        <div className="fr-grid-row space-between">
          <span>
            {viewModel.infosActions}
          </span>
          <span className="fr-text--sm color-grey">
            {viewModel.infosDerniereEdition}
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
            { isNullish(viewModel.contextualisation) ?
              <AjouterUneNoteDeContextualisation uidFeuilleDeRoute={viewModel.uidFeuilleDeRoute} /> :
              <ModifierUneNoteDeContextualisation
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                contextualisation={viewModel.contextualisation!}
                uidFeuilleDeRoute={viewModel.uidFeuilleDeRoute}
              />}
          </header>
          { isNullish(viewModel.contextualisation) ? null : (
            <ReadMore
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              texte={viewModel.contextualisation!}
            />
          )}
        </section>
        <section
          aria-labelledby="document"
          className="fr-mb-4w grey-dashed-border border-radius fr-p-4w"
        >
          {
            viewModel.document ? (
              <OuvrirPdf
                href={viewModel.document.href}
                nom={viewModel.document.nom}
                onDelete={async () => handleSupprimerDocument()}
              />
            ) : (
              <div className="fr-grid-row space-between">
                <div>
                  <header>
                    <h2
                      className="fr-h6 color-blue-france"
                      id="document"
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
                  <DocumentVide />
                </div>
              </div>
            )
          }
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
                  {viewModel.budgets.total}
                </span>
              </li>
              <li className="fr-grid-row space-between fr-mb-1w">
                <span>
                  Montant des financements accordés par l’état
                </span>
                {' '}
                <span className="font-weight-700">
                  {viewModel.budgets.etat}
                </span>
              </li>
              <li className="fr-grid-row space-between fr-mb-1w">
                <span>
                  Montant des co-financements
                </span>
                {' '}
                <span className="font-weight-700">
                  {viewModel.budgets.cofinancement}
                </span>
              </li>
            </ul>
            <div className="fr-grid-row space-between fr-grid-row--middle fr-mb-4w">
              <h2
                className="fr-h6 color-blue-france fr-m-0"
                id="actions"
              >
                {viewModel.action}
              </h2>
              <Link
                className="fr-btn fr-btn--primary fr-btn--icon-left fr-fi-add-line"
                href={viewModel.urlAjouterUneAction}
              >
                Ajouter une action
              </Link>
            </div>
          </header>
          {
            viewModel.actions.map((action) => (
              <article
                aria-labelledby={action.uid}
                className="white-background fr-p-4w fr-mb-2w"
                key={action.uid}
              >
                <header>
                  <div className="fr-grid-row space-between fr-mb-2w">
                    <TitleIcon
                      background={action.icone.background}
                      icon={action.icone.icon}
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
                  <Badge color={action.statut.variant}>
                    {action.statut.libelle}
                  </Badge>
                  <div className="fr-grid-row space-between fr-grid-row--middle fr-mt-4w">
                    <p>
                      {action.besoins}
                    </p>
                    <div>
                      Porteur :
                      {' '}
                      {
                        action.porteurs.length ?
                          action.porteurs.map((porteur) => (
                            <Tag
                              href={porteur.link}
                              key={porteur.link}
                            >
                              {porteur.label}
                            </Tag>
                          ))
                          :
                          <span title="Aucun responsable">
                            -
                          </span>
                      }
                    </div>
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
                          {action.budgetPrevisionnel.enveloppe}
                        </span>
                      </span>
                      {' '}
                      <span>
                        {action.budgetPrevisionnel.montant}
                      </span>
                    </li>
                    <li className="fr-grid-row space-between fr-px-2w fr-mb-2w">
                      <span>
                        {action.budgetPrevisionnel.coFinanceur}
                      </span>
                      {' '}
                      <span>
                        {action.budgetPrevisionnel.coFinancement}
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
          className={`fr-mb-4w grey-border border-radius fr-p-4w ${styles['no-margin']} fr-sr-only`}
        >
          <Historique
            historique={viewModel.historiques}
            sousTitre="Historique des dernières activités pour cette feuille de route."
            titre="Activité et historique"
          />
        </section>
      </div>
    </div>
  )
  async function handleSupprimerDocument(): Promise<void> {
    const messages = await supprimerDocumentAction({
      path: pathname,
      uidFeuilleDeRoute: viewModel.uidFeuilleDeRoute,
    })

    if (messages.includes('OK')) {
      Notification('success', { description: 'supprimé', title: 'Document ' })
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }
  }
}

type Props = Readonly<{
  viewModel: FeuilleDeRouteViewModel
}>
