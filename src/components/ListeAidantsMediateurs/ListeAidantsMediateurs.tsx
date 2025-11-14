'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { memo, ReactElement, useCallback, useEffect, useId, useMemo, useState } from 'react'

import AccompagnementsTableCell from './AccompagnementsTableCell'
import ListeAidantsMediateurInfos from './ListeAidantsMediateurInfos'
import ListeAidantsMediateursFiltre from './ListeAidantsMediateursFiltre'
import Badge from '../shared/Badge/Badge'
import Drawer from '../shared/Drawer/Drawer'
import PageTitle from '../shared/PageTitle/PageTitle'
import Pagination from '../shared/Pagination/Pagination'
import SpinnerSimple from '../shared/Spinner/SpinnerSimple'
import Table from '../shared/Table/Table'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import DrawerTitle from '@/components/shared/DrawerTitle/DrawerTitle'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { TypologieRole } from '@/domain/Role'
import { useNavigationLoading } from '@/hooks/useNavigationLoading'
import { ListeAidantsMediateursViewModel } from '@/presenters/listeAidantsMediateursPresenter'
import { buildURLSearchParamsFromFilters, getActiveFilters, parseURLParamsToFiltresInternes, removeFilterFromParams } from '@/shared/filtresAidantsMediateursUtils'

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

// Composant mémorisé pour chaque ligne d'aidant
const AidantRow = memo(({
  accompagnementsPromise,
  aidant,
  badgeStyle,
  getAidantIcons,
}: {
  readonly accompagnementsPromise: Promise<Map<string, number>>
  readonly aidant: ListeAidantsMediateursViewModel['aidants'][0]
  readonly badgeStyle: React.CSSProperties
  // eslint-disable-next-line @typescript-eslint/method-signature-style
  readonly getAidantIcons: (labelisations: Array<'aidants connect' | 'conseiller numérique'>) => Array<{ alt: string; src: string }>
}) => {
  const icons = useMemo(() => getAidantIcons(aidant.labelisations), [aidant.labelisations, getAidantIcons])

  return (
    <tr style={{ height: '4rem' }}>
      <td>
        <div className="fr-grid-row fr-text--bold fr-grid-row--middle">
          {aidant.nom}
          {' '}
          {aidant.prenom}
          {icons.map((icon) => (
            <img
              alt={icon.alt}
              className="fr-ml-1w"
              height={24}
              key={`${aidant.id}-${icon.src}`}
              src={icon.src}
              width={24}
            />
          ))}
        </div>
      </td>
      <td>
        <div className="fr-grid-row fr-grid-row--gutters fr-text--sm">
          {aidant.role.map((roleItem) => (
            <Badge
              color={roleItem === 'Coordinateur' ? 'info' : 'grey'}
              key={`${aidant.id}-role-${roleItem}`}
              small={true}
            >
              {roleItem}
            </Badge>
          ))}
        </div>
      </td>
      <td>
        {aidant.labelisations.length > 0 ? (
          <div className="fr-grid-row fr-grid-row--gutters">
            {aidant.labelisations.map((labelisation) => (
              <div
                className="fr-badge fr-badge--no-icon fr-badge--sm fr-mr-1v"
                key={`${aidant.id}-labelisation-${labelisation}`}
                style={badgeStyle}
              >
                {labelisation}
              </div>
            ))}
          </div>
        ) : (
          <span>
            -
          </span>
        )}
      </td>
      <td>
        {typeof aidant.formations === 'object' && aidant.formations.length > 0 ? (
          <div className="fr-grid-row fr-grid-row--gutters">
            {aidant.formations.map((form) => (
              <div
                className="fr-badge fr-badge--no-icon fr-badge--sm fr-mr-1v"
                key={`${aidant.id}-formation-${form}`}
                style={badgeStyle}
              >
                {form}
              </div>
            ))}
          </div>
        ) : (
          <span>
            -
          </span>
        )}
      </td>
      <td className="fr-cell--center">
        <AccompagnementsTableCell
          accompagnementsPromise={accompagnementsPromise}
          aidantId={aidant.id}
        />
      </td>
      <td className="fr-cell--center">
        <Link
          className="fr-btn fr-btn--secondary fr-btn--sm"
          href={`/aidant/${aidant.id}`}
        >
          Détail
        </Link>
      </td>
    </tr>
  )
})

AidantRow.displayName = 'AidantRow'

export default function ListeAidantsMediateurs({
  accompagnementsPromise,
  listeAidantsMediateursViewModel,
  searchParams,
  totalAccompagnementsPromise,
  totalBeneficiairesPromise,
  utilisateurRole,
}: Props): ReactElement {
  const isPageLoading = useNavigationLoading() // Spinner immédiat au clic
  const router = useRouter()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isFilterLoading, setIsFilterLoading] = useState(false)
  const drawerId = 'drawerFiltreAidants'
  const labelId = useId()

  // Normaliser searchParams une fois pour toute l'utilisation
  const normalizedSearchParams = useMemo(() => normalizeSearchParams(searchParams), [searchParams])
  if ('type' in listeAidantsMediateursViewModel) {
    return (
      <div className="fr-alert fr-alert--error">
        <p>
          {listeAidantsMediateursViewModel.message}
        </p>
      </div>
    )
  }
  const viewModel = listeAidantsMediateursViewModel

  // Réinitialiser le loading quand la page se charge
  useEffect(() => {
    setIsFilterLoading(false)
  }, [listeAidantsMediateursViewModel])

  // Fonction de filtrage
  function onFilter(params: URLSearchParams): void {
    setIsDrawerOpen(false)
    setIsFilterLoading(true)

    // Utiliser la fonction utilitaire pour convertir les paramètres
    const convertedParams = buildURLSearchParamsFromFilters(params)

    // Naviguer avec les nouveaux paramètres
    const url = new URL(window.location.href)
    url.search = convertedParams.toString()
    router.push(url.pathname + url.search)
  }

  // Fonction de réinitialisation
  function onReset(): void {
    setIsFilterLoading(true)
    router.push('/liste-aidants-mediateurs')
  }

  // Fonction d'export CSV
  function handleExportCSV(): void {
    const exportParams = new URLSearchParams()

    // Utiliser normalizedSearchParams qui est déjà un URLSearchParams valide
    const codeRegion = normalizedSearchParams.get('codeRegion')
    const codeDepartement = normalizedSearchParams.get('codeDepartement')
    const roles = normalizedSearchParams.get('roles')
    const habilitations = normalizedSearchParams.get('habilitations')
    const formations = normalizedSearchParams.get('formations')

    if (codeRegion !== null && codeRegion !== '') {
      exportParams.set('codeRegion', codeRegion)
    }
    if (codeDepartement !== null && codeDepartement !== '') {
      exportParams.set('codeDepartement', codeDepartement)
    }
    if (roles !== null && roles !== '') {
      exportParams.set('roles', roles)
    }
    if (habilitations !== null && habilitations !== '') {
      exportParams.set('habilitations', habilitations)
    }
    if (formations !== null && formations !== '') {
      exportParams.set('formations', formations)
    }

    // Déclencher le téléchargement
    const url = `/api/export/aidants-mediateurs-csv?${exportParams.toString()}`
    window.open(url, '_blank')
  }

  // Obtenir la liste des filtres actifs individuels
  function getFiltresActifs(): Array<{ label: string; paramKey: string; paramValue: string }> {
    return getActiveFilters(normalizedSearchParams)
  }

  // Fonction pour supprimer un filtre spécifique
  function supprimerFiltre(paramKey: string, paramValue: string): void {
    const newParams = removeFilterFromParams(normalizedSearchParams, paramKey, paramValue)

    setIsFilterLoading(true)
    const url = new URL(window.location.href)
    url.search = newParams.toString()
    router.push(url.pathname + url.search)
  }

  const getAidantIcons = useCallback((labelisations: Array<'aidants connect' | 'conseiller numérique'>): Array<{ alt: string; src: string }> => {
    const icons: Array<{ alt: string; src: string }> = []

    if (labelisations.includes('conseiller numérique')) {
      icons.push({ alt: 'Conseiller numérique', src: '/conum.svg' })
    }

    if (labelisations.includes('aidants connect')) {
      icons.push({ alt: 'Aidant numérique', src: '/aidant-numerique.svg' })
    }

    return icons
  }, [])

  // Styles constants mémorisés
  const badgeStyle = useMemo(() => ({
    backgroundColor: 'transparent',
    border: '1px solid var(--border-default-grey)',
    color: 'var(--text-default-grey)',
  }), [])

  return (
    <>
      <div className="fr-grid-row fr-grid-row--middle">
        <div className="fr-col">
          <PageTitle>
            <TitleIcon icon="group-line" />
            Suivi aidants et médiateurs
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
              data-fr-opened="false"
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

      {viewModel.aidants.length === 0 ? (
        <div
          style={{ backgroundColor: 'var(--blue-france-975-75)', borderRadius: '1rem', padding: '3rem', textAlign: 'center' }}
        >
          <p
            className="fr-text--md fr-mb-0"
            style={{ textAlign: 'center' }}
          >
            <span className="fr-text--bold">
              👻 Aucuns aidants et médiateurs trouvés sur votre territoire
            </span>
          </p>
        </div>
      ) : (
        <>
          <ListeAidantsMediateurInfos
            hasActiveFilters={getFiltresActifs().length > 0}
            totalAccompagnementsPromise={totalAccompagnementsPromise}
            totalBeneficiairesPromise={totalBeneficiairesPromise}
            viewModel={{
              totalActeursNumerique: viewModel.totalActeursNumerique,
              totalConseillersNumerique: viewModel.totalConseillersNumerique,
            }}
          />

          <Table
            enTetes={[
              'Prénom et nom',
              'Rôle',
              'Labelisation / habilitation',
              'Formation',
              'Nb accomp.',
              '',
            ]}
            titre="Aidants et médiateurs numériques"
          >
            {viewModel.aidants.map((aidant) => (
              <AidantRow
                accompagnementsPromise={accompagnementsPromise}
                aidant={aidant}
                badgeStyle={badgeStyle}
                getAidantIcons={getAidantIcons}
                key={aidant.id}
              />
            ))}
          </Table>
        </>)}

      {viewModel.displayPagination ? (
        <div className="fr-grid-row fr-grid-row--center fr-mt-3w">
          <Pagination
            pathname="/liste-aidants-mediateurs"
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
          <TitleIcon
            icon="filter-line"
          />
          <br />
          Filtrer les aidants et médiateurs
        </DrawerTitle>
        <ListeAidantsMediateursFiltre
          closeDrawer={() => {
            setIsDrawerOpen(false)
          }}
          currentFilters={parseURLParamsToFiltresInternes(normalizedSearchParams)}
          id={drawerId}
          onFilterAction={onFilter}
          onResetAction={onReset}
          utilisateurRole={utilisateurRole}
        />
      </Drawer>
    </>
  )
}

type Props = Readonly<{
  accompagnementsPromise: Promise<Map<string, number>>
  listeAidantsMediateursViewModel: ErrorViewModel | ListeAidantsMediateursViewModel
  searchParams: SerializedSearchParams
  totalAccompagnementsPromise: Promise<ErrorViewModel | number>
  totalBeneficiairesPromise: Promise<ErrorViewModel | number>
  utilisateurRole: TypologieRole
}>
