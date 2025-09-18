'use client'

import Link from 'next/link'
import { memo, ReactElement, useCallback, useId, useMemo, useState } from 'react'

import ListeAidantsMediateurInfos from './ListeAidantsMediateurInfos'
import Badge from '../shared/Badge/Badge'
import Drawer from '../shared/Drawer/Drawer'
import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
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
  totalBeneficiairesPromise,
}: Props): ReactElement {
  const isPageLoading = useNavigationLoading() // Spinner immédiat au clic
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
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
      
      {/* Overlay de loading pendant la navigation */}
      {isPageLoading ? (
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
        <DrawerTitle id={labelId}>
          <TitleIcon
            background="blue"
            icon="filter-line"
          />
          <br />
          Filtrer les aidants et médiateurs
        </DrawerTitle>
        <div className="fr-p-2w">
          <p>
            Filtres à venir...
          </p>
        </div>
      </Drawer>
    </>
  )
}

type Props = Readonly<{
  listeAidantsMediateursViewModel: ErrorViewModel | ListeAidantsMediateursViewModel
  totalBeneficiairesPromise: Promise<ErrorViewModel | number>
}>
