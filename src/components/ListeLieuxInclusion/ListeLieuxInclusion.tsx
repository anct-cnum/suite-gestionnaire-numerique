'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { ChangeEvent, ReactElement, useEffect, useId, useMemo, useState } from 'react'

import styles from './ListeLieuxInclusion.module.css'
import ListeLieuxInclusionFiltre from './ListeLieuxInclusionFiltre'
import Badge from '../shared/Badge/Badge'
import Drawer from '../shared/Drawer/Drawer'
import PageTitle from '../shared/PageTitle/PageTitle'
import Pagination from '../shared/Pagination/Pagination'
import SpinnerSimple from '../shared/Spinner/SpinnerSimple'
import Table from '../shared/Table/Table'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { modifierLieuInclusionVisibiliteCartographieAction } from '@/app/api/actions/modifierLieuInclusionVisibiliteCartographieAction'
import ListeLieuxInclusionInfo from '@/components/ListeLieuxInclusion/ListeLieuxInclusionInfo'
import DrawerTitle from '@/components/shared/DrawerTitle/DrawerTitle'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { Notification } from '@/components/shared/Notification/Notification'
import { TypologieRole } from '@/domain/Role'
import { useNavigationLoading } from '@/hooks/useNavigationLoading'
import { LieuInclusionViewModel, ListeLieuxInclusionViewModel } from '@/presenters/listeLieuxInclusionPresenter'
import { CouleurFraicheur } from '@/presenters/shared/fraicheur'
import {
  buildURLSearchParamsFromLieuxInclusionFilters,
  getActiveLieuxInclusionFilters,
  parseURLParamsToFiltresLieuxInclusionInternes,
  removeLieuxInclusionFilterFromParams,
} from '@/shared/filtresLieuxInclusionUtils'

export default function ListeLieuxInclusion({
  estBetaTesteur,
  listeLieuxInclusionViewModel,
  searchParams,
  utilisateurRole,
}: Props): ReactElement {
  const isPageLoading = useNavigationLoading() // Spinner immédiat au clic
  const router = useRouter()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false)
  const [isFilterLoading, setIsFilterLoading] = useState(false)
  const drawerId = 'drawerFiltreLieux'
  const drawerInfoId = 'drawerInfoFraicheur'
  const labelId = useId()
  const labelInfoId = useId()

  // Normaliser searchParams une fois pour toute l'utilisation
  const normalizedSearchParams = useMemo(() => normalizeSearchParams(searchParams), [searchParams])
  const estOngletArchives = normalizedSearchParams.get('statut') === 'archives'

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
    if (estOngletArchives) {
      convertedParams.set('statut', 'archives')
    }

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
      router.push(estOngletArchives ? '/liste-lieux-inclusion?statut=archives' : '/liste-lieux-inclusion')
    }, 150)
  }

  // Changement d'onglet : on conserve les filtres mais on repart à la première page
  function changerOnglet(versArchives: boolean): void {
    if (versArchives === estOngletArchives) {
      return
    }
    setIsFilterLoading(true)
    const params = new URLSearchParams(normalizedSearchParams)
    params.delete('page')
    if (versArchives) {
      params.set('statut', 'archives')
    } else {
      params.delete('statut')
    }
    setTimeout(() => {
      const query = params.toString()
      router.push(query === '' ? '/liste-lieux-inclusion' : `/liste-lieux-inclusion?${query}`)
    }, 150)
  }

  // Fonction d'export CSV
  function handleExportCSV(): void {
    const exportParams = buildExportParams(normalizedSearchParams, estOngletArchives)

    // Déclencher le téléchargement avec fetch et blob
    const url = `/api/export/lieux-inclusion-csv?${exportParams.toString()}`

    fetch(url)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.blob()
      })
      .then((blob) => {
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
        console.error('Erreur lors du téléchargement:', error)

        alert('Erreur lors du téléchargement du fichier')
      })
  }

  // Obtenir la liste des filtres actifs individuels
  function getFiltresActifs(): Array<{ label: string; paramKey: string; paramValue: string }> {
    return getActiveLieuxInclusionFilters(normalizedSearchParams)
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

  async function handleToggleVisibleCarto(event: ChangeEvent<HTMLInputElement>, lieuId: string): Promise<void> {
    const newValue = event.target.checked
    const messages = await modifierLieuInclusionVisibiliteCartographieAction({
      lieuId,
      path: '/liste-lieux-inclusion',
      visiblePourCartographie: newValue,
    })

    if (messages.includes('OK')) {
      Notification('success', { description: 'modifiée', title: 'Visibilité cartographique ' })
    } else {
      Notification('error', {
        description: (messages as ReadonlyArray<string>).join(', '),
        title: 'Erreur : ',
      })
      event.target.checked = !newValue
    }
  }

  const afficherColonneMajInfos =
    (utilisateurRole === 'Administrateur dispositif' ||
      utilisateurRole === 'Gestionnaire département' ||
      utilisateurRole === 'Gestionnaire structure') &&
    !estOngletArchives

  if ('type' in listeLieuxInclusionViewModel) {
    return (
      <div className="fr-alert fr-alert--error">
        <p>{listeLieuxInclusionViewModel.message}</p>
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

      <div className="fr-tabs fr-tabs__list fr-pb-0 fr-mb-3w">
        <ul className="fr-nav__list">
          <li className="fr-nav__item">
            <button
              aria-current={!estOngletArchives}
              className="fr-nav__link"
              onClick={() => {
                changerOnglet(false)
              }}
              role="tab"
              type="button"
            >
              Lieux actuels ({viewModel.totalActifs})
            </button>
          </li>
          {estBetaTesteur ? (
            <li className="fr-nav__item">
              <button
                aria-current={estOngletArchives}
                className="fr-nav__link"
                onClick={() => {
                  changerOnglet(true)
                }}
                role="tab"
                type="button"
              >
                Lieux archivés ({viewModel.totalArchives})
              </button>
            </li>
          ) : null}
        </ul>
      </div>

      {/* Indicateur de filtres actifs */}
      {getFiltresActifs().length > 0 ? (
        <div className="fr-mb-2w">
          <div className="fr-grid-row fr-grid-row--gutters">
            {getFiltresActifs().map((filtre) => (
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
          <SpinnerSimple size="large" text="Chargement..." />
        </div>
      ) : null}

      {viewModel.lieux.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--blue-france-975-75)',
            borderRadius: '1rem',
            marginBottom: '2rem',
            padding: '3rem',
            textAlign: 'center',
          }}
        >
          <p className="fr-text--md fr-mb-0" style={{ textAlign: 'center' }}>
            <span className="fr-text--bold">👻 Aucun lieu d&apos;inclusion numérique trouvé.</span>
          </p>
        </div>
      ) : (
        <>
          {estOngletArchives ? null : (
            <ListeLieuxInclusionInfo
              infos={{
                total: viewModel.total,
                totalConseillerNumerique: viewModel.totalConseillerNumerique,
                totalLabellise: viewModel.totalLabellise,
              }}
            />
          )}
          <Table enTetes={buildEnTetes(estOngletArchives, afficherColonneMajInfos)} titre="Lieux d'inclusion numérique">
            {viewModel.lieux.map((lieu) => (
              <LigneLieu
                afficherColonneMajInfos={afficherColonneMajInfos}
                drawerInfoId={drawerInfoId}
                estOngletArchives={estOngletArchives}
                key={lieu.id}
                lieu={lieu}
                onOpenInfoDrawer={() => {
                  setIsInfoDrawerOpen(true)
                }}
                onToggleVisibleCarto={handleToggleVisibleCarto}
              />
            ))}
          </Table>

          {viewModel.displayPagination ? (
            <div className="fr-grid-row fr-grid-row--center fr-mt-3w">
              <Pagination pathname="/liste-lieux-inclusion" totalUtilisateurs={viewModel.total} />
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
        <DrawerTitle id={labelId}>
          <TitleIcon icon="filter-line" />
          <br />
          Filtrer les lieux
        </DrawerTitle>
        <ListeLieuxInclusionFiltre
          closeDrawer={() => {
            setIsDrawerOpen(false)
          }}
          currentFilters={parseURLParamsToFiltresLieuxInclusionInternes(normalizedSearchParams)}
          onFilterAction={onFilter}
          onResetAction={onReset}
          utilisateurRole={utilisateurRole}
        />
      </Drawer>

      <Drawer
        boutonFermeture="Fermer"
        closeDrawer={() => {
          setIsInfoDrawerOpen(false)
        }}
        id={drawerInfoId}
        isFixedWidth={false}
        isOpen={isInfoDrawerOpen}
        labelId={labelInfoId}
      >
        <DrawerTitle id={labelInfoId}>
          <TitleIcon className="fr-mb-2w" icon="information-line" />
          <br />
          Fraîcheur des informations du lieu
        </DrawerTitle>
        <p className="fr-text--md">
          {'Cet indicateur signale depuis combien de temps les informations du lieu '}
          <strong>{'(coordonnées, horaires, services proposés)'}</strong>
          {
            ' n\u2019ont pas été mises à jour. Il ne signifie pas qu\u2019une information est fausse\u00a0: une donnée ancienne peut rester exacte. Il indique le niveau de vérification recommandé.'
          }
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {niveauxFraicheur.map((niveau) => (
            <div key={niveau.libelle} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span
                style={{
                  alignItems: 'center',
                  backgroundColor: niveau.badgeBg,
                  borderRadius: '4px',
                  color: niveau.badgeTexte,
                  display: 'inline-flex',
                  fontSize: '14px',
                  fontWeight: 700,
                  gap: '4px',
                  lineHeight: '20px',
                  padding: '4px 8px',
                  width: 'fit-content',
                }}
              >
                <span
                  style={{
                    backgroundColor: niveau.couleurPastille,
                    borderRadius: '50%',
                    display: 'inline-block',
                    flexShrink: 0,
                    height: '10px',
                    width: '10px',
                  }}
                />
                {niveau.libelle}
              </span>
              <p className="fr-text--md fr-mb-0">{niveau.description}</p>
            </div>
          ))}
        </div>
      </Drawer>
    </>
  )
}

const couleursFraicheur: Readonly<Record<CouleurFraicheur, string>> = {
  blue: '#0078F3',
  orange: '#D64D00',
  red: '#C9191E',
  yellow: '#E2CF58',
}

const niveauxFraicheur = [
  {
    badgeBg: '#e8edff',
    badgeTexte: '#0063cb',
    couleurPastille: '#0078F3',
    description: 'Informations mises à jour il y a moins de 6 mois. Aucune action nécessaire.',
    libelle: 'À jour',
  },
  {
    badgeBg: '#fceeac',
    badgeTexte: '#66673d',
    couleurPastille: '#E2CF58',
    description: 'Informations mises à jour il y a 6 à 12 mois. Un contrôle ponctuel est conseillé.',
    libelle: 'À surveiller',
  },
  {
    badgeBg: '#ffe9e6',
    badgeTexte: '#b34000',
    couleurPastille: '#D64D00',
    description: 'Informations datant de 12 à 18 mois. Une vérification est recommandée en priorité.',
    libelle: 'À vérifier',
  },
  {
    badgeBg: '#fddede',
    badgeTexte: '#ce0500',
    couleurPastille: '#C9191E',
    description:
      'Informations non mises à jour depuis plus de 18 mois. Une mise à jour est recommandée pour qu\u2019elles restent fiables sur la cartographie.',
    libelle: 'À actualiser',
  },
]

function LigneLieu({
  afficherColonneMajInfos,
  drawerInfoId,
  estOngletArchives,
  lieu,
  onOpenInfoDrawer,
  onToggleVisibleCarto,
}: Readonly<{
  afficherColonneMajInfos: boolean
  drawerInfoId: string
  estOngletArchives: boolean
  lieu: LieuInclusionViewModel
  onOpenInfoDrawer(): void
  onToggleVisibleCarto(event: ChangeEvent<HTMLInputElement>, lieuId: string): Promise<void>
}>): ReactElement {
  return (
    <tr>
      <td style={{ maxWidth: '25vw' }}>
        <div
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          <strong title={lieu.nom}>{lieu.nom}</strong>
          <br />
          <span className="fr-text--sm" title={lieu.typeStructure}>
            {lieu.typeStructure}
          </span>
        </div>
      </td>
      <td style={{ maxWidth: '20vw' }}>
        <div
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          <AdresseLieu adresse={lieu.adresse} idCartographieNationale={lieu.idCartographieNationale} />
        </div>
      </td>
      {estOngletArchives ? <td>{lieu.dateArchivage}</td> : null}
      {afficherColonneMajInfos ? (
        <td>
          {lieu.derniereMiseAJour !== null ? (
            <button
              aria-controls={drawerInfoId}
              data-fr-opened="false"
              onClick={onOpenInfoDrawer}
              style={{
                alignItems: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                gap: '4px',
                padding: 0,
              }}
              type="button"
            >
              <span
                style={{
                  backgroundColor: couleursFraicheur[lieu.derniereMiseAJour.couleur],
                  borderRadius: '50%',
                  display: 'inline-block',
                  flexShrink: 0,
                  height: '12px',
                  width: '12px',
                }}
              />
              {lieu.derniereMiseAJour.date}
            </button>
          ) : null}
        </td>
      ) : null}
      <td>
        <div className="fr-tags-group">
          {lieu.tags.map((tag) => (
            <Badge color={tag.couleur} key={`${lieu.id}-tag-${tag.libelle}`}>
              {tag.libelle}
            </Badge>
          ))}
        </div>
      </td>
      <td>
        {lieu.nbAccompagnements}
        {' accomp.'}
      </td>
      {afficherColonneMajInfos ? (
        <td>
          <div className={styles['toggle-carto']}>
            <div className="fr-toggle" style={{ margin: 0 }}>
              <input
                className="fr-toggle__input"
                defaultChecked={lieu.visiblePourCartographie}
                disabled
                id={`visible-carto-${lieu.id}`}
                onChange={async (event) => onToggleVisibleCarto(event, lieu.id)}
                type="checkbox"
              />
              <label className="fr-toggle__label" htmlFor={`visible-carto-${lieu.id}`} />
            </div>
          </div>
        </td>
      ) : null}
      <td className="fr-cell--center">
        <Link
          className="fr-btn fr-btn--secondary fr-btn--sm fr-icon-eye-line"
          href={`/lieu/${lieu.id}`}
          title={`Voir le détail de ${lieu.nom}`}
        >
          {`Voir le détail de ${lieu.nom}`}
        </Link>
      </td>
    </tr>
  )
}

function buildEnTetes(estOngletArchives: boolean, afficherColonneMajInfos: boolean): Array<string> {
  return [
    'Lieu',
    'Adresse',
    ...(estOngletArchives ? ['Date d\u2019archivage'] : []),
    ...(afficherColonneMajInfos ? ['MAJ Infos'] : []),
    'FRR / QPV',
    'Activités',
    ...(afficherColonneMajInfos ? ['Visible Carto'] : []),
    'Action',
  ]
}

function buildExportParams(normalizedSearchParams: URLSearchParams, estOngletArchives: boolean): URLSearchParams {
  const exportParams = new URLSearchParams()

  if (estOngletArchives) {
    exportParams.set('statut', 'archives')
  }

  for (const cle of ['codeDepartement', 'codeRegion', 'qpv', 'frr', 'horsZonePrioritaire']) {
    const valeur = normalizedSearchParams.get(cle)
    if (valeur !== null && valeur !== '') {
      exportParams.set(cle, valeur)
    }
  }

  return exportParams
}

function AdresseLieu({
  adresse,
  idCartographieNationale,
}: Readonly<{
  adresse: LieuInclusionViewModel['adresse']
  idCartographieNationale: null | string
}>): ReactElement {
  const contenu = (
    <>
      {adresse.ligne1}
      {adresse.ligne2 === '' ? null : (
        <>
          <br />
          {adresse.ligne2}
        </>
      )}
    </>
  )

  if (idCartographieNationale === null) {
    return contenu
  }

  return (
    <a
      href={`https://cartographie.societenumerique.gouv.fr/cartographie/${idCartographieNationale}/details`}
      rel="noopener noreferrer"
      target="_blank"
    >
      {contenu}
    </a>
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
  estBetaTesteur: boolean
  listeLieuxInclusionViewModel: ErrorViewModel | ListeLieuxInclusionViewModel
  searchParams: SerializedSearchParams
  utilisateurRole: TypologieRole
}>
