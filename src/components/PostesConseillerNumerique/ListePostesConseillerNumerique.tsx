'use client'

import { memo, ReactElement } from 'react'

import styles from './ListePostesConseillerNumerique.module.css'
import PostesConseillerNumeriqueInfos from './PostesConseillerNumeriqueInfos'
import Badge from '../shared/Badge/Badge'
import PageTitle from '../shared/PageTitle/PageTitle'
import Pagination from '../shared/Pagination/Pagination'
import Table from '../shared/Table/Table'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { PosteConseillerNumeriqueViewModel, PostesConseillerNumeriqueViewModel } from '@/presenters/postesConseillerNumeriquePresenter'

const statutBadgeStyles: Record<string, string> = {
  occupe: styles.badgeOccupe,
  rendu: styles.badgeRendu,
  vacant: styles.badgeVacant,
}

const PosteRow = memo(({
  afficherColonneDepartement,
  poste,
}: {
  readonly afficherColonneDepartement: boolean
  readonly poste: PosteConseillerNumeriqueViewModel
}) => {
  return (
    <tr style={{ height: '4rem' }}>
      <td>
        <div className="fr-grid-row fr-grid-row--middle">
          <div>
            <div className="fr-text--bold">
              {poste.nomStructure}
            </div>
            <div className="fr-text--sm fr-text-mention--grey fr-mb-0">
              Poste #
              {poste.posteConumId}
              {poste.estCoordinateur ? (
                <Badge
                  color="info"
                  small={true}
                >
                  Coordinateur
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </td>
      {afficherColonneDepartement ? (
        <td>
          {poste.codeDepartement}
        </td>
      ) : null}
      <td>
        <span className={`${styles.badgeStatut} ${statutBadgeStyles[poste.statut]}`}>
          {poste.statutLabel}
        </span>
      </td>
      <td>
        {poste.sourcesFinancement}
      </td>
      <td>
        {poste.dateFinConvention}
      </td>
      <td>
        {poste.dateFinContrat}
      </td>
      <td>
        {poste.bonification}
      </td>
      <td className="fr-text--bold">
        {poste.totalConventionne}
      </td>
      <td className="fr-text--bold">
        {poste.totalVerse}
      </td>
      <td>
        <button
          className="fr-btn fr-btn--tertiary-no-outline fr-icon-eye-line"
          disabled={true}
          title="Voir le détail du poste"
          type="button"
        />
      </td>
    </tr>
  )
})

PosteRow.displayName = 'PosteRow'

export default function ListePostesConseillerNumerique({
  postesConseillerNumeriqueViewModel,
}: Props): ReactElement {
  if ('type' in postesConseillerNumeriqueViewModel) {
    return (
      <div className="fr-alert fr-alert--error">
        <p>
          {postesConseillerNumeriqueViewModel.message}
        </p>
      </div>
    )
  }

  const viewModel = postesConseillerNumeriqueViewModel

  function handleExportCSV(): void {
    window.open('/api/export/postes-conseiller-numerique-csv', '_blank')
  }

  return (
    <>
      <div className="fr-grid-row fr-grid-row--middle">
        <div className="fr-col">
          <PageTitle>
            <TitleIcon icon="map-pin-2-line" />
            Suivi des postes Conseiller Numérique
          </PageTitle>
        </div>
        <div className="fr-col-auto fr-grid-row fr-grid-row--middle fr-grid-row--gutters">
          <div className="fr-col-auto">
            <button
              className="fr-btn fr-btn--secondary fr-btn--icon-left fr-fi-download-line"
              onClick={handleExportCSV}
              type="button"
            >
              Exporter
            </button>
          </div>
          <div className="fr-col-auto">
            <button
              className="fr-btn fr-btn--secondary fr-btn--icon-left fr-fi-filter-line"
              disabled={true}
              type="button"
            >
              Filtrer
            </button>
          </div>
        </div>
      </div>

      <div className="fr-alert fr-alert--warning fr-mb-3w">
        <p>
          Cette page est en cours de développement. Les données affichées peuvent ne pas être correctes.
        </p>
      </div>

      <div className="fr-callout fr-callout--blue-ecume fr-mb-3w">
        <p className="fr-callout__text fr-text--sm fr-mb-0">
          <span className="fr-icon-information-fill fr-mr-1w" />
          {'Pour gérer les postes de conseiller numérique, connectez-vous au tableau de pilotage '}
          <a
            className="fr-link"
            href="https://pilotage.conseiller-numerique.gouv.fr"
            rel="noopener noreferrer"
            target="_blank"
          >
            {'Tableau de pilotage Conseiller Numérique '}
            <span
              aria-hidden="true"
              className="fr-icon-external-link-line fr-icon--sm"
            />
          </a>
        </p>
      </div>

      {viewModel.postes.length === 0 ? (
        <div
          style={{ backgroundColor: 'var(--blue-france-975-75)', borderRadius: '1rem', padding: '3rem', textAlign: 'center' }}
        >
          <p
            className="fr-text--md fr-mb-0"
            style={{ textAlign: 'center' }}
          >
            <span className="fr-text--bold">
              Aucun poste de conseiller numérique trouvé sur votre territoire
            </span>
          </p>
        </div>
      ) : (
        <>
          <PostesConseillerNumeriqueInfos statistiques={viewModel.statistiques} />

          <Table
            enTetes={[
              'Structure - ID poste',
              ...viewModel.afficherColonneDepartement ? ['Dép.'] : [],
              'Statut',
              'Convention',
              'Fin de convention',
              'Fin de contrat',
              'Bonification',
              'Total conventionné',
              'Total versé',
              '',
            ]}
            titre="Postes Conseiller Numérique"
          >
            {viewModel.postes.map((poste) => (
              <PosteRow
                afficherColonneDepartement={viewModel.afficherColonneDepartement}
                key={poste.idPoste}
                poste={poste}
              />
            ))}
          </Table>
        </>
      )}

      {viewModel.displayPagination ? (
        <div className="fr-grid-row fr-grid-row--center fr-mt-3w">
          <Pagination
            pathname="/postes-conseiller-numerique"
            totalUtilisateurs={viewModel.total}
          />
        </div>
      ) : null}
    </>
  )
}

type Props = Readonly<{
  postesConseillerNumeriqueViewModel: ErrorViewModel | PostesConseillerNumeriqueViewModel
}>
