'use client'

import Link from 'next/link'
import { ReactElement } from 'react'

import PageTitle from '../shared/PageTitle/PageTitle'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { DetailViewModel, EvenementViewModel, LieuHistoriqueViewModel } from '@/presenters/lieuHistoriquePresenter'

export default function LieuInclusionHistorique({ lieuId, viewModel }: Props): ReactElement {
  return (
    <div className="fr-container fr-py-4w">
      <Link className="fr-link fr-icon-arrow-left-line fr-link--icon-left fr-mb-3w" href={`/lieu/${lieuId}`}>
        Retour au détail du lieu
      </Link>
      <PageTitle>
        <TitleIcon icon="time-line" />
        Historique — {viewModel.nomLieu}
      </PageTitle>

      {viewModel.sourcesPivots.length > 0 ? (
        <section className="fr-mb-4w">
          <h2 className="fr-h4">Pivots de raccordement</h2>
          <div className="fr-table fr-table--bordered">
            <table>
              <caption className="fr-sr-only">Identifiants pivots par source de données</caption>
              <thead>
                <tr>
                  <th scope="col">Source</th>
                  <th scope="col">Identifiant pivot</th>
                </tr>
              </thead>
              <tbody>
                {viewModel.sourcesPivots.map((sp) => (
                  <tr key={sp.source}>
                    <td>{sp.libelleSource}</td>
                    <td>
                      <code>{sp.pivot}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="fr-h4 fr-mb-2w">Événements ({viewModel.evenements.length})</h2>
        {viewModel.evenements.length === 0 ? (
          <div className="fr-callout">
            <p className="fr-callout__text">Aucun événement enregistré pour ce lieu.</p>
          </div>
        ) : (
          <div className="fr-grid-row fr-grid-row--gutters">
            {viewModel.evenements.map((ev, index) => (
              <div className="fr-col-12" key={index}>
                <EvenementCard evenement={ev} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function EvenementCard({ evenement }: Readonly<{ evenement: EvenementViewModel }>): ReactElement {
  return (
    <div
      className="fr-card fr-card--no-arrow"
      style={{ borderLeft: `4px solid var(--background-contrast-${evenement.couleur})` }}
    >
      <div className="fr-card__body">
        <div className="fr-card__content" style={{ paddingBottom: '0.5rem', paddingTop: '0.5rem' }}>
          <div className="fr-grid-row fr-grid-row--middle fr-grid-row--gutters">
            <div className="fr-col-auto">
              <span
                aria-hidden="true"
                className={`fr-icon-${evenement.icone}`}
                style={{ color: `var(--background-contrast-${evenement.couleur})` }}
              />
            </div>
            <div className="fr-col">
              <div className="fr-card__title fr-text--md fr-mb-0">{evenement.description}</div>
              <div className="fr-card__desc fr-text--xs fr-mb-0">
                <span className={`fr-badge fr-badge--${evenement.couleur} fr-badge--no-icon fr-badge--sm`}>
                  {evenement.type}
                </span>{' '}
                <span style={{ color: 'var(--text-mention-grey)' }}>
                  {evenement.date} — via {evenement.source}
                </span>
              </div>
            </div>
          </div>
          {evenement.details.length > 0 ? <DetailsBlock details={evenement.details} /> : null}
        </div>
      </div>
    </div>
  )
}

function DetailsBlock({ details }: Readonly<{ details: ReadonlyArray<DetailViewModel> }>): ReactElement {
  return (
    <pre
      className="fr-mt-2w fr-mb-0 fr-ml-4w"
      style={{
        backgroundColor: 'var(--background-contrast-grey)',
        borderRadius: '4px',
        fontSize: '0.75rem',
        lineHeight: '1.6',
        overflow: 'auto',
        padding: '0.75rem 1rem',
      }}
    >
      {details.map((detail, index) => (
        <DiffLine detail={detail} key={index} />
      ))}
    </pre>
  )
}

function DiffLine({ detail }: Readonly<{ detail: DetailViewModel }>): ReactElement {
  const prefixe = prefixeParStatut(detail.statut)
  const couleur = couleurParStatut(detail.statut)

  return (
    <span style={{ color: couleur, display: 'block', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {prefixe}
      {detail.label}: {detail.valeur}
    </span>
  )
}

function couleurParStatut(statut: string): string {
  switch (statut) {
    case 'ajout':
      return 'var(--text-default-success)'
    case 'suppression':
      return 'var(--text-default-error)'
    default:
      return 'var(--text-mention-grey)'
  }
}

function prefixeParStatut(statut: string): string {
  switch (statut) {
    case 'ajout':
      return '+ '
    case 'suppression':
      return '- '
    default:
      return '  '
  }
}

type Props = Readonly<{
  lieuId: string
  viewModel: LieuHistoriqueViewModel
}>
