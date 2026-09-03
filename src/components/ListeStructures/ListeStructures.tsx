'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactElement, useEffect, useId, useMemo, useState } from 'react'

import ListeStructuresFiltre from './ListeStructuresFiltre'
import BarreRecherche from '../shared/BarreRecherche/BarreRecherche'
import Drawer from '../shared/Drawer/Drawer'
import { Notification } from '../shared/Notification/Notification'
import PageTitle from '../shared/PageTitle/PageTitle'
import Pagination from '../shared/Pagination/Pagination'
import SpinnerSimple from '../shared/Spinner/SpinnerSimple'
import Table from '../shared/Table/Table'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import DrawerTitle from '@/components/shared/DrawerTitle/DrawerTitle'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { TypologieRole } from '@/domain/Role'
import { useNavigationLoading } from '@/hooks/useNavigationLoading'
import { ListeStructuresViewModel, StructureListeViewModel } from '@/presenters/listeStructuresPresenter'
import { formaterEnNombreFrancais } from '@/presenters/shared/number'
import {
  buildURLSearchParamsFromStructuresFilters,
  getActiveStructuresFilters,
  removeStructuresFilterFromParams,
} from '@/shared/filtresListeStructuresUtils'

export default function ListeStructures({
  estScopeNational,
  libelleTerritoireRestreint,
  searchParams,
  utilisateurRole,
  viewModel,
}: Props): ReactElement {
  const isPageLoading = useNavigationLoading()
  const router = useRouter()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isFilterLoading, setIsFilterLoading] = useState(false)
  const drawerId = 'drawerFiltreStructures'
  const labelId = useId()

  const normalizedSearchParams = useMemo(
    () => (searchParams instanceof URLSearchParams ? searchParams : new URLSearchParams(searchParams)),
    [searchParams]
  )

  // Réinitialiser le loading quand la page se charge
  useEffect(() => {
    setIsFilterLoading(false)
  }, [viewModel])

  if ('type' in viewModel) {
    return (
      <div className="fr-alert fr-alert--error">
        <p>{viewModel.message}</p>
      </div>
    )
  }

  const filtresActifs = getActiveStructuresFilters(normalizedSearchParams)

  function onFilter(params: URLSearchParams): void {
    setIsDrawerOpen(false)
    setIsFilterLoading(true)

    const convertedParams = buildURLSearchParamsFromStructuresFilters(params)

    // Conserver la recherche, indépendante des filtres du drawer
    const recherche = normalizedSearchParams.get('recherche')
    if (recherche !== null && recherche !== '') {
      convertedParams.set('recherche', recherche)
    }

    naviguer(convertedParams)
  }

  function onReset(): void {
    setIsFilterLoading(true)
    router.push('/liste-structures')
  }

  // Recherche par nom ou SIRET : pilotée par l'URL, cumulable avec les filtres, remet à la page 1
  function rechercher(valeur: string): void {
    setIsFilterLoading(true)
    const params = new URLSearchParams(normalizedSearchParams)
    params.delete('page')
    if (valeur === '') {
      params.delete('recherche')
    } else {
      params.set('recherche', valeur)
    }
    naviguer(params)
  }

  function handleExportCSV(): void {
    const exportParams = new URLSearchParams()
    for (const cle of ['codeRegion', 'codeDepartement', 'labellisation', 'recherche']) {
      const valeur = normalizedSearchParams.get(cle)
      if (valeur !== null && valeur !== '') {
        exportParams.set(cle, valeur)
      }
    }
    window.open(`/api/export/structures-csv?${exportParams.toString()}`, '_blank')
  }

  function supprimerFiltre(paramKey: string): void {
    setIsFilterLoading(true)
    naviguer(removeStructuresFilterFromParams(normalizedSearchParams, paramKey))
  }

  function naviguer(params: URLSearchParams): void {
    const query = params.toString()
    router.push(query === '' ? '/liste-structures' : `/liste-structures?${query}`)
  }

  return (
    <>
      <div className="fr-grid-row fr-grid-row--middle fr-mt-5w fr-mb-3w">
        <div className="fr-col-auto">
          <PageTitle margin="fr-m-0">
            <TitleIcon icon="building-line" />
            Structures
          </PageTitle>
        </div>
        <div className="fr-col-auto fr-ml-auto">
          {/* Groupe aligné à droite : le DSFR impose inline-reverse et l'ordre DOM inversé (Filtrer avant Exporter) */}
          <ul className="fr-btns-group fr-btns-group--inline-sm fr-btns-group--inline-reverse fr-btns-group--right fr-btns-group--icon-left fr-my-0 fr-ml-0 fr-mr-n1w">
            <li>
              <button
                aria-controls={drawerId}
                className="fr-btn fr-btn--secondary fr-fi-filter-line"
                data-fr-opened="false"
                onClick={() => {
                  setIsDrawerOpen(true)
                }}
                type="button"
              >
                Filtrer
              </button>
            </li>
            <li>
              <button className="fr-btn fr-btn--secondary fr-fi-download-line" onClick={handleExportCSV} type="button">
                Exporter
              </button>
            </li>
          </ul>
        </div>
      </div>

      {filtresActifs.length > 0 ? (
        <div className="fr-mb-2w">
          <div className="fr-grid-row fr-grid-row--gutters">
            {filtresActifs.map((filtre) => (
              <div className="fr-col-auto" key={`${filtre.paramKey}-${filtre.paramValue}`}>
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
          <SpinnerSimple size="large" text="Chargement..." />
        </div>
      ) : null}

      <section aria-label="Indicateurs des structures" className="fr-pb-3w">
        <div className="fr-container-fluid">
          <div className="fr-grid-row fr-grid-row--gutters">
            {carteIndicateur(
              formaterEnNombreFrancais(viewModel.totalHabiliteesAidantsConnect),
              'Structures habilitées Aidants Connect',
              `Sur ${formaterEnNombreFrancais(viewModel.totalStructures)} structures`
            )}
            {carteIndicateur(
              formaterEnNombreFrancais(viewModel.totalLabelliseesConseillerNumerique),
              'Structures labellisées conseiller numérique',
              `Sur ${formaterEnNombreFrancais(viewModel.totalStructures)} structures`
            )}
          </div>
        </div>
      </section>

      <div className="fr-grid-row fr-mt-2w fr-mb-2w">
        <div className="fr-col-12 fr-col-md-4">
          <BarreRecherche
            label="Rechercher une structure"
            rechercher={rechercher}
            valeurInitiale={normalizedSearchParams.get('recherche') ?? ''}
          />
        </div>
      </div>

      {viewModel.structures.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--blue-france-975-75)',
            borderRadius: '1rem',
            padding: '3rem',
            textAlign: 'center',
          }}
        >
          <p className="fr-text--md fr-text--bold fr-mb-0">Aucune structure ne correspond à votre recherche.</p>
        </div>
      ) : (
        <Table
          enTetes={['Structure', 'Adresse', 'N° de SIRET', 'Labellisation / habilitation', '']}
          multiline={true}
          titre="Structures"
        >
          {viewModel.structures.map((structure) => (
            <StructureRow key={structure.id} structure={structure} />
          ))}
        </Table>
      )}

      {viewModel.displayPagination ? (
        <div className="fr-grid-row fr-grid-row--center fr-mt-3w">
          <Pagination pathname="/liste-structures" totalUtilisateurs={viewModel.total} />
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
          Filtrer les structures
        </DrawerTitle>
        <ListeStructuresFiltre
          closeDrawer={() => {
            setIsDrawerOpen(false)
          }}
          currentFilters={{
            codeDepartement: normalizedSearchParams.get('codeDepartement'),
            codeEpci: normalizedSearchParams.get('codeEpci'),
            codeRegion: normalizedSearchParams.get('codeRegion'),
            labellisation: normalizedSearchParams.get('labellisation'),
          }}
          estScopeNational={estScopeNational}
          id={drawerId}
          libelleTerritoireRestreint={libelleTerritoireRestreint}
          onFilterAction={onFilter}
          onResetAction={onReset}
          utilisateurRole={utilisateurRole}
        />
      </Drawer>
    </>
  )
}

function adressePostale(structure: StructureListeViewModel): string {
  return [structure.adresseComplete, structure.codePostalCommune].filter(Boolean).join(' ').trim()
}

function carteIndicateur(indicateur: string, description: string, legende: string): ReactElement {
  return (
    <div className="fr-col-12 fr-col-md-4" style={{ height: '7rem' }}>
      <div
        className="fr-background-alt--blue-france fr-p-2w"
        style={{ borderRadius: '1rem', gap: '1rem', height: '7rem' }}
      >
        <div className="fr-h5 fr-text-title--blue-france fr-m-0">{indicateur}</div>
        <div className="fr-text--sm fr-text-title--blue-france fr-text--bold fr-m-0">{description}</div>
        <div className="fr-text--sm fr-text-title--blue-france fr-m-0">{legende}</div>
      </div>
    </div>
  )
}

function StructureRow({ structure }: Readonly<{ structure: StructureListeViewModel }>): ReactElement {
  const labellisations: Array<string> = []
  if (structure.estLabelliseeConseillerNumerique) {
    labellisations.push('Conseiller numérique')
  }
  if (structure.estHabiliteeAidantsConnect) {
    labellisations.push('Aidants Connect')
  }

  return (
    <tr style={{ height: '4rem' }}>
      <td>
        <div className="fr-text--bold">{structure.nom}</div>
        <div className="fr-text--sm fr-text-mention--grey fr-mb-0">
          {structure.typologie === '' ? '-' : structure.typologie}
        </div>
      </td>
      <td>
        <div className="fr-grid-row fr-grid-row--middle" style={{ flexWrap: 'nowrap' }}>
          <div>
            <div className="fr-text--bold">
              {structure.codePostalCommune === '' ? '-' : structure.codePostalCommune}
            </div>
            <div className="fr-text--sm fr-text-mention--grey fr-mb-0">{structure.adresseComplete}</div>
          </div>
          {adressePostale(structure) === '' ? null : (
            <button
              className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-icon-clipboard-line fr-ml-1v"
              onClick={() => {
                void navigator.clipboard.writeText(adressePostale(structure)).then(() => {
                  Notification('success', { description: adressePostale(structure), title: 'Copié : ' })
                })
              }}
              title={`Copier l’adresse ${adressePostale(structure)}`}
              type="button"
            >
              <span className="fr-sr-only">Copier l’adresse {adressePostale(structure)}</span>
            </button>
          )}
        </div>
      </td>
      <td>
        {structure.lienAnnuaireEntreprises === '' ? (
          <span>-</span>
        ) : (
          <a
            href={structure.lienAnnuaireEntreprises}
            rel="external noopener noreferrer"
            target="_blank"
            title={`SIRET de ${structure.nom} sur l’Annuaire des Entreprises - nouvelle fenêtre`}
          >
            {structure.siret}
          </a>
        )}
      </td>
      <td>
        {labellisations.length > 0 ? (
          <div className="fr-grid-row fr-grid-row--gutters">
            {labellisations.map((labellisation) => (
              <div
                className="fr-badge fr-badge--no-icon fr-badge--sm fr-mr-1v"
                key={`${structure.id}-${labellisation}`}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-default-grey)',
                  color: 'var(--text-default-grey)',
                }}
              >
                {labellisation}
              </div>
            ))}
          </div>
        ) : (
          <span>-</span>
        )}
      </td>
      <td className="fr-cell--center">
        <Link
          className="fr-btn fr-btn--tertiary fr-btn--sm fr-icon-eye-line"
          href={structure.lienFiche}
          title={`Voir la structure ${structure.nom}`}
        >
          <span className="fr-sr-only">Voir la structure {structure.nom}</span>
        </Link>
      </td>
    </tr>
  )
}

type Props = Readonly<{
  estScopeNational: boolean
  libelleTerritoireRestreint: string
  searchParams: Array<[string, string]> | URLSearchParams
  utilisateurRole: TypologieRole
  viewModel: ErrorViewModel | ListeStructuresViewModel
}>
