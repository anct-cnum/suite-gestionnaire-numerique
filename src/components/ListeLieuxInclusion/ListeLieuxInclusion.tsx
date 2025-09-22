'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactElement, useEffect, useId, useMemo, useState } from 'react'

import ListeLieuxInclusionFiltre from './ListeLieuxInclusionFiltre'
import Badge from '../shared/Badge/Badge'
import Drawer from '../shared/Drawer/Drawer'
import PageTitle from '../shared/PageTitle/PageTitle'
import Pagination from '../shared/Pagination/Pagination'
import SpinnerSimple from '../shared/Spinner/SpinnerSimple'
import Table from '../shared/Table/Table'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import ListeLieuxInclusionInfo from '@/components/ListeLieuxInclusion/ListeLieuxInclusionInfo'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { useNavigationLoading } from '@/hooks/useNavigationLoading'
import { ListeLieuxInclusionViewModel } from '@/presenters/listeLieuxInclusionPresenter'
import { buildURLSearchParamsFromLieuxInclusionFilters, getActiveLieuxInclusionFilters, parseURLParamsToFiltresLieuxInclusionInternes, removeLieuxInclusionFilterFromParams } from '@/shared/filtresLieuxInclusionUtils'

export default function ListeLieuxInclusion({
  listeLieuxInclusionViewModel,
  searchParams,
  typesStructure,
  utilisateurRole,
}: Props): ReactElement {
  const isPageLoading = useNavigationLoading() // Spinner immédiat au clic
  const router = useRouter()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isFilterLoading, setIsFilterLoading] = useState(false)
  const drawerId = 'drawerFiltreLieux'
  const labelId = useId()

  // Normaliser searchParams une fois pour toute l'utilisation
  const normalizedSearchParams = useMemo(() => normalizeSearchParams(searchParams), [searchParams])

  // Réinitialiser le loading quand la page se charge
  useEffect(() => {
    setIsFilterLoading(false)
  }, [listeLieuxInclusionViewModel])

  // Fonction de filtrage
  function onFilter(params: URLSearchParams): void {
    setIsDrawerOpen(false)
    setIsFilterLoading(true)

    // Utiliser la fonction utilitaire pour convertir les paramètres
    const convertedParams = buildURLSearchParamsFromLieuxInclusionFilters(params)

    // Navigation avec délai (solution temporaire qui fonctionne)
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
      router.push('/liste-lieux-inclusion')
    }, 150)
  }

  // Fonction d'export CSV
  function handleExportCSV(): void {
    const exportParams = new URLSearchParams()

    // Utiliser normalizedSearchParams qui est déjà un URLSearchParams valide
    const codeDepartement = normalizedSearchParams.get('codeDepartement')
    const codeRegion = normalizedSearchParams.get('codeRegion')
    const typeStructure = normalizedSearchParams.get('typeStructure')
    const qpv = normalizedSearchParams.get('qpv')
    const frr = normalizedSearchParams.get('frr')
    const horsZonePrioritaire = normalizedSearchParams.get('horsZonePrioritaire')

    if (codeDepartement !== null && codeDepartement !== '') {
      exportParams.set('codeDepartement', codeDepartement)
    }
    if (codeRegion !== null && codeRegion !== '') {
      exportParams.set('codeRegion', codeRegion)
    }
    if (typeStructure !== null && typeStructure !== '') {
      exportParams.set('typeStructure', typeStructure)
    }
    if (qpv !== null && qpv !== '') {
      exportParams.set('qpv', qpv)
    }
    if (frr !== null && frr !== '') {
      exportParams.set('frr', frr)
    }
    if (horsZonePrioritaire !== null && horsZonePrioritaire !== '') {
      exportParams.set('horsZonePrioritaire', horsZonePrioritaire)
    }

    // Déclencher le téléchargement avec fetch et blob
    const url = `/api/export/lieux-inclusion-csv?${exportParams.toString()}`

    fetch(url)
      .then(async response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.blob()
      })
      .then(blob => {
        // Créer un lien de téléchargement temporaire
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = `lieux-inclusion-${Date.now()}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(downloadUrl)
      })
      .catch((error: unknown) => {
        // eslint-disable-next-line no-console
        console.error('Erreur lors du téléchargement:', error)
        // eslint-disable-next-line no-alert
        alert('Erreur lors du téléchargement du fichier')
      })
  }

  // Obtenir la liste des filtres actifs individuels
  function getFiltresActifs(): Array<{ label: string; paramKey: string; paramValue: string }> {
    return getActiveLieuxInclusionFilters(normalizedSearchParams, typesStructure)
  }

  // Fonction pour supprimer un filtre spécifique
  function supprimerFiltre(paramKey: string): void {
    const newParams = removeLieuxInclusionFilterFromParams(normalizedSearchParams, paramKey)

    setIsFilterLoading(true)
    setTimeout(() => {
      const url = new URL(window.location.href)
      url.search = newParams.toString()
      router.push(url.pathname + url.search)
    }, 50)
  }

  if ('type' in listeLieuxInclusionViewModel) {
    return (
      <div className="fr-alert fr-alert--error">
        <p>
          {listeLieuxInclusionViewModel.message}
        </p>
      </div>
    )
  }

  const viewModel = listeLieuxInclusionViewModel

  return (
    <>

      <div className="fr-grid-row fr-grid-row--middle">
        <div className="fr-col">
          <PageTitle>
            <TitleIcon icon="map-pin-2-line" />
            Suivi des lieux d&apos;inclusion numérique
          </PageTitle>
        </div>
        <div className="fr-col-auto fr-grid-row fr-grid-row--middle fr-grid-row--gutters">
          <div className="fr-col-auto">
            <button
              className="fr-btn fr-btn--secondary fr-btn--icon-left fr-fi-download-line"
              onClick={handleExportCSV}
              type="button"
            >
              Export
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
              Filtres
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
                    supprimerFiltre(filtre.paramKey)
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

      {viewModel.lieux.length === 0 ? (
        <p>
          Aucun lieu d&apos;inclusion numérique trouvé.
        </p>
      ) : (
        <>
          <ListeLieuxInclusionInfo infos={{
            total: viewModel.total,
            totalConseillerNumerique: viewModel.totalConseillerNumerique,
            totalLabellise: viewModel.totalLabellise,
          }}
          />
          <Table
            enTetes={[
              'Lieu',
              'Adresse',
              'Siret',
              'FRR / QPV',
              'Mandats AC',
              'Nb Accompagnements',
              //'Action',
            ]}
            titre="Lieux d'inclusion numérique"
          >
            {viewModel.lieux.map((lieu) => (
              <tr key={lieu.id}>
                <td style={{ maxWidth: '25vw' }}>
                  <div style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  >
                    <strong
                      title={lieu.nom}
                    >
                      {lieu.nom}
                    </strong>
                    <br />
                    <span
                      className="fr-text--sm"
                      title={lieu.typeStructure}
                    >
                      {lieu.typeStructure}
                    </span>
                  </div>
                </td>
                <td style={{ maxWidth: '20vw' }}>
                  <div style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  >
                    {lieu.idCartographieNationale === null ?
                      lieu.adresse
                      : (
                        <a
                          href={`https://cartographie.societenumerique.gouv.fr/cartographie/${lieu.idCartographieNationale}/details`}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {lieu.adresse}
                        </a>
                      )}
                  </div>
                </td>
                <td>
                  {lieu.siret === null ? 'Non renseigné' :
                    (
                      <a
                        href={`https://annuaire-entreprises.data.gouv.fr/etablissement/${lieu.siret}`}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {lieu.siret}
                      </a>
                    ) }
                </td>
                <td>
                  <div className="fr-tags-group">
                    {lieu.tags.map((tag) => (
                      <Badge
                        color={tag.couleur}
                        key={`${lieu.id}-tag-${tag.libelle}`}
                      >
                        {tag.libelle}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="fr-cell--center">
                  {lieu.nbMandatsAC}
                </td>
                <td className="fr-cell--center">
                  {lieu.nbAccompagnements}
                </td>
                <td
                  className="fr-cell--center"
                  style={{ display: 'none' }}
                >
                  <Link
                    className="fr-btn fr-btn--secondary fr-btn--sm"
                    href={`/lieu/${lieu.id}`}
                  >
                    Détail
                  </Link>
                </td>
              </tr>
            ))}
          </Table>

          {viewModel.displayPagination ? (
            <div className="fr-grid-row fr-grid-row--center fr-mt-3w">
              <Pagination
                pathname="/liste-lieux-inclusion"
                totalUtilisateurs={viewModel.total}
              />
            </div>
          ) : null}
        </>
      )}

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
        <ListeLieuxInclusionFiltre
          closeDrawer={() => {
            setIsDrawerOpen(false)
          }}
          currentFilters={parseURLParamsToFiltresLieuxInclusionInternes(normalizedSearchParams)}
          labelId={labelId}
          onFilterAction={onFilter}
          onResetAction={onReset}
          typesStructure={typesStructure}
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
  // Si c'est déjà un URLSearchParams, le retourner tel quel
  if (params instanceof URLSearchParams) {
    return params
  }
  // Si c'est un tableau de paires [clé, valeur], le convertir
  return new URLSearchParams(params)
}

type Props = Readonly<{
  listeLieuxInclusionViewModel: ErrorViewModel | ListeLieuxInclusionViewModel
  searchParams: SerializedSearchParams
  typesStructure: Array<{ code: string; nom: string }>
  utilisateurRole: string
}>
