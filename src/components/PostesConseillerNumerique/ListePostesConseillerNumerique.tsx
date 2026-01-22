'use client'

import { useRouter } from 'next/navigation'
import { memo, ReactElement, useEffect, useId, useMemo, useState } from 'react'

import styles from './ListePostesConseillerNumerique.module.css'
import PostesConseillerNumeriqueFiltre from './PostesConseillerNumeriqueFiltre'
import PostesConseillerNumeriqueInfos from './PostesConseillerNumeriqueInfos'
import Badge from '../shared/Badge/Badge'
import Drawer from '../shared/Drawer/Drawer'
import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import PageTitle from '../shared/PageTitle/PageTitle'
import Pagination from '../shared/Pagination/Pagination'
import SpinnerSimple from '../shared/Spinner/SpinnerSimple'
import Table from '../shared/Table/Table'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import AlerteConstruction from '@/components/shared/AlerteConstruction/AlerteConstruction'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { TypologieRole } from '@/domain/Role'
import { useNavigationLoading } from '@/hooks/useNavigationLoading'
import { PosteConseillerNumeriqueViewModel, PostesConseillerNumeriqueViewModel } from '@/presenters/postesConseillerNumeriquePresenter'
import {
  buildURLSearchParamsFromPostesConseillerNumeriqueFilters,
  getActivePostesConseillerNumeriqueFilters,
  parseURLParamsToFiltresPostesConseillerNumeriqueInternes,
  removePostesConseillerNumeriqueFilterFromParams,
} from '@/shared/filtresPostesConseillerNumeriqueUtils'

const statutBadgeStyles: Record<string, string> = {
  occupe: styles.badgeOccupe,
  rendu: styles.badgeRendu,
  vacant: styles.badgeVacant,
}

const PosteRow = memo(({
  poste,
}: {
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
      <td>
        {poste.codeDepartement}
      </td>
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
        <a
          className="fr-btn fr-btn--tertiary-no-outline fr-icon-eye-line"
          href={`/poste/${poste.idPoste}`}
          title="Voir le détail du poste"
        />
      </td>
    </tr>
  )
})

PosteRow.displayName = 'PosteRow'

export default function ListePostesConseillerNumerique({
  postesConseillerNumeriqueViewModel,
  searchParams,
  utilisateurRole,
}: Props): ReactElement {
  const isPageLoading = useNavigationLoading()
  const router = useRouter()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isFilterLoading, setIsFilterLoading] = useState(false)
  const drawerId = 'drawerFiltrePostes'
  const labelId = useId()

  // Normaliser searchParams une fois pour toute l'utilisation
  const normalizedSearchParams = useMemo(() => normalizeSearchParams(searchParams), [searchParams])

  // Réinitialiser le loading quand la page se charge
  useEffect(() => {
    setIsFilterLoading(false)
  }, [postesConseillerNumeriqueViewModel])

  // Fonction de filtrage
  function onFilter(params: URLSearchParams): void {
    setIsDrawerOpen(false)
    setIsFilterLoading(true)

    const convertedParams = buildURLSearchParamsFromPostesConseillerNumeriqueFilters(params)

    setTimeout(() => {
      const url = new URL(window.location.href)
      url.search = convertedParams.toString()
      router.push(url.pathname + url.search)
    }, 150)
  }

  // Fonction de réinitialisation
  function onReset(): void {
    setIsFilterLoading(true)
    setIsDrawerOpen(false)
    setTimeout(() => {
      router.push('/postes-conseiller-numerique')
    }, 150)
  }

  // Obtenir la liste des filtres actifs
  function getFiltresActifs(): Array<{ label: string; paramKey: string; paramValue: string }> {
    return getActivePostesConseillerNumeriqueFilters(normalizedSearchParams)
  }

  // Fonction pour supprimer un filtre spécifique
  function supprimerFiltre(paramKey: string, paramValue: string): void {
    const newParams = removePostesConseillerNumeriqueFilterFromParams(normalizedSearchParams, paramKey, paramValue)

    setIsFilterLoading(true)
    setTimeout(() => {
      const url = new URL(window.location.href)
      url.search = newParams.toString()
      router.push(url.pathname + url.search)
    }, 50)
  }

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
    const exportParams = new URLSearchParams(normalizedSearchParams)
    exportParams.delete('page')
    const queryString = exportParams.toString()
    const baseUrl = '/api/export/postes-conseiller-numerique-csv'
    const url = queryString === '' ? baseUrl : `${baseUrl}?${queryString}`
    window.open(url, '_blank')
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
              aria-controls={drawerId}
              className="fr-btn fr-btn--secondary fr-btn--icon-left fr-fi-filter-line"
              data-fr-opened={isDrawerOpen}
              onClick={() => {
                setIsDrawerOpen(true)
              }}
              type="button"
            >
              Filtrer
            </button>
          </div>
        </div>
      </div>

      {/* Indicateur de filtres actifs */}
      {getFiltresActifs().length > 0 ? (
        <div className="fr-mb-2w">
          <div className="fr-grid-row fr-grid-row--gutters">
            {getFiltresActifs().map((filtre) => (
              <div
                className="fr-col-auto"
                key={`${filtre.paramKey}-${filtre.paramValue}`}
              >
                <button
                  aria-label={`Retirer le filtre ${filtre.label}`}
                  className="fr-tag fr-icon-close-line fr-tag--icon-left"
                  onClick={() => {
                    supprimerFiltre(filtre.paramKey, filtre.paramValue)
                  }}
                  type="button"
                >
                  {filtre.label}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Overlay de loading pendant la navigation */}
      {isPageLoading || isFilterLoading ? (
        <div
          style={{
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            left: 0,
            position: 'fixed',
            right: 0,
            top: 0,
            zIndex: 9999,
          }}
        >
          <SpinnerSimple
            size="large"
            text="Chargement..."
          />
        </div>
      ) : null}

      <AlerteConstruction />
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
              'Dép.',
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

      <Drawer
        boutonFermeture="Fermer les filtres"
        closeDrawer={() => {
          setIsDrawerOpen(false)
        }}
        id={drawerId}
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelId}
      >
        <DrawerTitle id={labelId}>
          <TitleIcon icon="filter-line" />
          <br />
          Filtrer les postes
        </DrawerTitle>
        <PostesConseillerNumeriqueFiltre
          closeDrawer={() => {
            setIsDrawerOpen(false)
          }}
          currentFilters={parseURLParamsToFiltresPostesConseillerNumeriqueInternes(normalizedSearchParams)}
          onFilterAction={onFilter}
          onResetAction={onReset}
          utilisateurRole={utilisateurRole}
        />
      </Drawer>
    </>
  )
}

// Type pour les searchParams sérialisés depuis le serveur
type SerializedSearchParams = Array<[string, string]> | URLSearchParams

// Fonction utilitaire pour normaliser les searchParams
function normalizeSearchParams(params: SerializedSearchParams): URLSearchParams {
  if (params instanceof URLSearchParams) {
    return params
  }
  return new URLSearchParams(params)
}

type Props = Readonly<{
  postesConseillerNumeriqueViewModel: ErrorViewModel | PostesConseillerNumeriqueViewModel
  searchParams: SerializedSearchParams
  utilisateurRole: TypologieRole
}>
