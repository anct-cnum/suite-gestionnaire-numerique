'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { memo, ReactElement, useCallback, useEffect, useId, useMemo, useState } from 'react'

import ListeAidantsMediateurInfos from './ListeAidantsMediateurInfos'
import ListeAidantsMediateursFiltre from './ListeAidantsMediateursFiltre'
import Badge from '../shared/Badge/Badge'
import Drawer from '../shared/Drawer/Drawer'
import PageTitle from '../shared/PageTitle/PageTitle'
import Pagination from '../shared/Pagination/Pagination'
import SpinnerSimple from '../shared/Spinner/SpinnerSimple'
import Table from '../shared/Table/Table'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { useNavigationLoading } from '@/hooks/useNavigationLoading'
import { ListeAidantsMediateursViewModel } from '@/presenters/listeAidantsMediateursPresenter'

// Composant mémorisé pour chaque ligne d'aidant
const AidantRow = memo(({
  aidant,
  badgeStyle,
  getAidantIcons,
}: {
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
        {aidant.nbAccompagnements}
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
  listeAidantsMediateursViewModel,
  searchParams,
  totalBeneficiairesPromise,
}: Props): ReactElement {
  const isPageLoading = useNavigationLoading() // Spinner immédiat au clic
  const router = useRouter()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isFilterLoading, setIsFilterLoading] = useState(false)
  const [filtreParams, setFiltreParams] = useState<URLSearchParams>(new URLSearchParams())
  const drawerId = 'drawerFiltreAidants'
  const labelId = useId()
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

  // Initialiser les filtres à partir des searchParams
  useEffect(() => {
    setFiltreParams(new URLSearchParams(searchParams.toString()))
    setIsFilterLoading(false)
  }, [listeAidantsMediateursViewModel, searchParams])

  // Fonction de filtrage
  function onFilter(params: URLSearchParams): void {
    setFiltreParams(params)
    setIsDrawerOpen(false)
    setIsFilterLoading(true)

    // Convertir les noms de paramètres pour correspondre au controller
    const convertedParams = new URLSearchParams()

    // Filtre géographique
    const region = params.get('region')
    const departement = params.get('departement')

    if (region !== null && region !== '') {
      convertedParams.set('codeRegion', region)
    }
    if (departement !== null && departement !== '') {
      convertedParams.set('codeDepartement', departement)
    }

    // Autres filtres
    const roles = params.get('roles')
    const habilitations = params.get('habilitations')
    const formations = params.get('formations')

    if (roles !== null && roles !== '') {
      convertedParams.set('roles', roles)
    }
    if (habilitations !== null && habilitations !== '') {
      convertedParams.set('habilitations', habilitations)
    }
    if (formations !== null && formations !== '') {
      convertedParams.set('formations', formations)
    }

    // Naviguer avec les nouveaux paramètres
    const url = new URL(window.location.href)
    url.search = convertedParams.toString()
    router.push(url.pathname + url.search)
  }

  // Fonction de réinitialisation
  function onReset(): void {
    setFiltreParams(new URLSearchParams())
    setIsFilterLoading(true)
    router.push('/liste-aidants-mediateurs')
  }

  // Fonction d'export CSV
  function handleExportCSV(): void {
    const exportParams = new URLSearchParams()

    // Copier tous les paramètres de filtre actuels (sans pagination)
    const region = filtreParams.get('region')
    const departement = filtreParams.get('departement')
    const roles = filtreParams.get('roles')
    const habilitations = filtreParams.get('habilitations')
    const formations = filtreParams.get('formations')

    if (region !== null && region !== '') {
      exportParams.set('codeRegion', region)
    }
    if (departement !== null && departement !== '') {
      exportParams.set('codeDepartement', departement)
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

  // Déterminer le label du filtre actif
  function getFiltreLabel(): string {
    const labels: Array<string> = []

    const region = filtreParams.get('region')
    const departement = filtreParams.get('departement')
    const roles = filtreParams.get('roles')
    const habilitations = filtreParams.get('habilitations')
    const formations = filtreParams.get('formations')

    if (departement !== null && departement !== '') {
      labels.push(`Dép: ${departement}`)
    } else if (region !== null && region !== '') {
      labels.push(`Rég: ${region}`)
    }

    if (roles !== null && roles !== '') {
      const rolesCount = roles.split(',').length
      labels.push(`${rolesCount} rôle${rolesCount > 1 ? 's' : ''}`)
    }

    if (habilitations !== null && habilitations !== '') {
      const habilitationsCount = habilitations.split(',').length
      labels.push(`${habilitationsCount} habilitation${habilitationsCount > 1 ? 's' : ''}`)
    }

    if (formations !== null && formations !== '') {
      const formationsCount = formations.split(',').length
      labels.push(`${formationsCount} formation${formationsCount > 1 ? 's' : ''}`)
    }

    return labels.join(', ')
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
          <button
            className="fr-btn fr-btn--secondary fr-btn--icon-left fr-fi-download-line"
            onClick={handleExportCSV}
            type="button"
          >
            Export
          </button>
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
          {getFiltreLabel() ? (
            <button
              aria-label={`Retirer le filtre ${getFiltreLabel()}`}
              className="fr-tag fr-icon-close-line fr-tag--icon-left"
              onClick={() => {
                onReset()
              }}
              type="button"
            >
              {getFiltreLabel()}
            </button>
          ) : null}
        </div>
      </div>
      
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
      
      <>
        <ListeAidantsMediateurInfos
          totalBeneficiairesPromise={totalBeneficiairesPromise}
          viewModel={{
            totalAccompagnements: viewModel.totalAccompagnements,
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
              aidant={aidant}
              badgeStyle={badgeStyle}
              getAidantIcons={getAidantIcons}
              key={aidant.id}
            />
          ))}
        </Table>

        {viewModel.displayPagination ? (
          <div className="fr-grid-row fr-grid-row--center fr-mt-3w">
            <Pagination
              pathname="/liste-aidants-mediateurs"
              totalUtilisateurs={viewModel.total}
            />
          </div>
        ) : null}
      </>

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
        <ListeAidantsMediateursFiltre
          closeDrawer={() => {
            setIsDrawerOpen(false)
          }}
          id={drawerId}
          labelId={labelId}
          onFilterAction={onFilter}
          onResetAction={onReset}
        />
      </Drawer>
    </>
  )
}

type Props = Readonly<{
  listeAidantsMediateursViewModel: ErrorViewModel | ListeAidantsMediateursViewModel
  searchParams: URLSearchParams
  totalBeneficiairesPromise: Promise<ErrorViewModel | number>
}>
