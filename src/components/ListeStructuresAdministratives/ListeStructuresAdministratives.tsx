'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactElement, useId, useState, useTransition } from 'react'

import departements from '../../../ressources/departements.json'
import { Notification } from '../shared/Notification/Notification'
import PageTitle from '../shared/PageTitle/PageTitle'
import Pagination from '../shared/Pagination/Pagination'
import SpinnerSimple from '../shared/Spinner/SpinnerSimple'
import Table from '../shared/Table/Table'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import {
  ListeStructuresAdministrativesViewModel,
  StructureAdministrativeViewModel,
} from '@/presenters/listeStructuresAdministrativesPresenter'

export default function ListeStructuresAdministratives({ filtres, tri, viewModel }: Props): ReactElement {
  const router = useRouter()
  const departementId = useId()
  const adresseId = useId()
  const typeId = useId()
  const gouvernanceId = useId()
  // Affiche un loader tant que le serveur recalcule la liste (filtres, tri, réinitialisation).
  const [isPending, startTransition] = useTransition()
  // Sélection de structures pour lancer une comparaison en vue d'une fusion.
  // Seules les structures de la page courante comptent : un changement de page ou de
  // filtre fait sortir les ids non affichés de la sélection effective.
  const [selection, setSelection] = useState<ReadonlyArray<number>>([])
  // Bloc de recherche replié par défaut pour privilégier le tableau.
  const [filtresVisibles, setFiltresVisibles] = useState(false)
  const idsSelectionnes = viewModel.structures
    .filter((structure) => selection.includes(structure.id))
    .map((structure) => structure.id)

  function basculerSelection(id: number): void {
    setSelection((precedente) =>
      precedente.includes(id) ? precedente.filter((idCourant) => idCourant !== id) : [...precedente, id]
    )
  }

  function naviguer(url: string): void {
    startTransition(() => {
      router.push(url)
    })
  }

  function rechercher(formData: FormData): void {
    const params = new URLSearchParams()
    for (const cle of [
      'nom',
      'siret',
      'rna',
      'ridet',
      'coop',
      'idposte',
      'aidantsConnect',
      'departement',
      'commune',
      'adresse',
      'type',
      'gouvernance',
    ]) {
      const valeur = formData.get(cle)
      if (typeof valeur === 'string' && valeur.trim() !== '') {
        params.set(cle, valeur.trim())
      }
    }
    if (tri.colonne !== '') {
      params.set('tri', tri.colonne)
      params.set('ordre', tri.ordre)
    }
    const query = params.toString()
    naviguer(query === '' ? '/liste-structures-administratives' : `/liste-structures-administratives?${query}`)
  }

  function trierPar(colonne: string, ordreParDefaut: 'asc' | 'desc'): void {
    const params = new URLSearchParams()
    for (const [cle, valeur] of Object.entries(filtres)) {
      if (valeur !== '') {
        params.set(cle, valeur)
      }
    }
    const ordre = tri.colonne === colonne ? (ordreInverse[tri.ordre] ?? ordreParDefaut) : ordreParDefaut
    params.set('tri', colonne)
    params.set('ordre', ordre)
    naviguer(`/liste-structures-administratives?${params.toString()}`)
  }

  // largeurMax : contraint la largeur du bouton pour faire passer le libellé sur
  // deux lignes et réduire la largeur de la colonne (ex : « Personnes employées »).
  function enTeteTriable(
    label: string,
    colonne: string,
    ordreParDefaut: 'asc' | 'desc',
    largeurMax?: string
  ): EnTeteTriable {
    const estActif = tri.colonne === colonne
    let icone = 'fr-icon-arrow-up-down-line'
    if (estActif) {
      icone = tri.ordre === 'asc' ? 'fr-icon-sort-asc' : 'fr-icon-sort-desc'
    }

    return {
      ariaSort: estActif ? ariaSortParOrdre[tri.ordre] : undefined,
      contenu: (
        <button
          className={`fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-btn--icon-right ${icone}`}
          onClick={() => {
            trierPar(colonne, ordreParDefaut)
          }}
          style={largeurMax === undefined ? undefined : { maxWidth: largeurMax, whiteSpace: 'normal' }}
          title={`Trier par ${label.toLowerCase()}`}
          type="button"
        >
          {label}
        </button>
      ),
      label,
    }
  }

  const enTetes = [
    '',
    enTeteTriable('Structure', 'nom', 'asc'),
    enTeteTriable('Adresse', 'commune', 'asc'),
    'Identifiants',
    enTeteTriable('Personnes employées', 'personnesEmployees', 'desc', '8rem'),
    enTeteTriable('Rattachements', 'rattachements', 'desc'),
    'Action',
  ]

  return (
    <>
      <PageTitle>
        <TitleIcon icon="building-line" />
        Structures administratives
      </PageTitle>

      <button
        aria-expanded={filtresVisibles}
        className={`fr-btn fr-btn--tertiary fr-btn--sm fr-btn--icon-right ${
          filtresVisibles ? 'fr-icon-arrow-up-s-line' : 'fr-icon-arrow-down-s-line'
        } fr-mb-2w`}
        onClick={() => {
          setFiltresVisibles(!filtresVisibles)
        }}
        type="button"
      >
        Filtres
      </button>

      {/* La clé force le remontage du formulaire quand les filtres de l'URL changent (champs non contrôlés) */}
      <form
        className="fr-mb-2w"
        hidden={!filtresVisibles}
        key={Object.values(filtres).join('|')}
        onSubmit={(event) => {
          event.preventDefault()
          rechercher(new FormData(event.currentTarget))
        }}
      >
        <div className="fr-grid-row fr-grid-row--gutters">
          <ChampTexte label="Nom" largeur="fr-col-md-6" name="nom" valeur={filtres.nom} />
          <ChampTexte label="Siret" largeur="fr-col-md-3" name="siret" valeur={filtres.siret} />
          <ChampTexte label="RNA" largeur="fr-col-md-3" name="rna" valeur={filtres.rna} />
        </div>
        <div className="fr-grid-row fr-grid-row--gutters fr-mt-1v">
          <ChampTexte label="Ridet" largeur="fr-col-md-3" name="ridet" valeur={filtres.ridet} />
          <ChampTexte label="Coop" largeur="fr-col-md-3" name="coop" valeur={filtres.coop} />
          <ChampTexte label="Idposte" largeur="fr-col-md-3" name="idposte" valeur={filtres.idposte} />
          <ChampTexte
            label="Aidants Connect"
            largeur="fr-col-md-3"
            name="aidantsConnect"
            valeur={filtres.aidantsConnect}
          />
        </div>
        <div className="fr-grid-row fr-grid-row--bottom fr-grid-row--gutters fr-mt-1v">
          <div className="fr-col-12 fr-col-md-3">
            <div className="fr-select-group">
              <label className="fr-label" htmlFor={departementId}>
                Département
              </label>
              <select className="fr-select" defaultValue={filtres.departement} id={departementId} name="departement">
                <option value="">Tous les départements</option>
                {departements.map((departement) => (
                  <option key={departement.code} value={departement.code}>
                    {`${departement.code} · ${departement.nom}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <ChampTexte label="Commune" largeur="fr-col-md-2" name="commune" valeur={filtres.commune} />
          <div className="fr-col-12 fr-col-md-2">
            <div className="fr-select-group">
              <label className="fr-label" htmlFor={adresseId}>
                Adresse
              </label>
              <select className="fr-select" defaultValue={filtres.adresse} id={adresseId} name="adresse">
                <option value="">Toutes</option>
                <option value="avec">Avec adresse</option>
                <option value="sans">Sans adresse</option>
              </select>
            </div>
          </div>
          <div className="fr-col-12 fr-col-md-2">
            <div className="fr-select-group">
              <label className="fr-label" htmlFor={typeId}>
                Type
              </label>
              <select className="fr-select" defaultValue={filtres.type} id={typeId} name="type">
                <option value="">Toutes</option>
                <option value="canonique">Canoniques</option>
                <option value="antenne">Antennes</option>
              </select>
            </div>
          </div>
          <div className="fr-col-12 fr-col-md-2">
            <div className="fr-select-group">
              <label className="fr-label" htmlFor={gouvernanceId}>
                Gouvernance
              </label>
              <select className="fr-select" defaultValue={filtres.gouvernance} id={gouvernanceId} name="gouvernance">
                <option value="">Toutes</option>
                <option value="gouvernance">Gouvernance</option>
                <option value="horsGouvernance">Hors gouvernance</option>
              </select>
            </div>
          </div>
          <div className="fr-col-12 fr-col-md-3">
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="fr-btn" type="submit">
                Rechercher
              </button>
              <button
                className="fr-btn fr-btn--secondary"
                onClick={() => {
                  naviguer('/liste-structures-administratives')
                }}
                type="button"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </form>

      {isPending ? (
        <SpinnerSimple text="Chargement des structures administratives…" />
      ) : (
        <>
          <div className="fr-grid-row fr-grid-row--middle fr-mb-1w" style={{ justifyContent: 'space-between' }}>
            <p className="fr-text--md fr-mb-0">
              {viewModel.total}
              {' structures administratives'}
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                className="fr-btn fr-btn--secondary fr-btn--sm"
                disabled={idsSelectionnes.length === 0}
                onClick={() => {
                  setSelection([])
                }}
                type="button"
              >
                Vider la sélection
              </button>
              {idsSelectionnes.length < 2 ? (
                <button className="fr-btn fr-btn--sm fr-icon-git-merge-line fr-btn--icon-left" disabled type="button">
                  {`Comparer la sélection (${idsSelectionnes.length})`}
                </button>
              ) : (
                <Link
                  className="fr-btn fr-btn--sm fr-icon-git-merge-line fr-btn--icon-left"
                  href={`/structures-doublons/comparer?ids=${idsSelectionnes.join(',')}`}
                  target="_blank"
                  title="Comparer les structures sélectionnées en vue d’une fusion (nouvel onglet)"
                >
                  {`Comparer la sélection (${idsSelectionnes.length})`}
                </Link>
              )}
            </div>
          </div>

          {viewModel.structures.length === 0 ? (
            <p className="fr-text--md fr-text--bold">Aucune structure administrative trouvée.</p>
          ) : (
            <>
              <Table enTetes={enTetes} titre="Structures administratives">
                {viewModel.structures.map((structure) => (
                  <LigneStructure
                    key={structure.id}
                    selectionnee={idsSelectionnes.includes(structure.id)}
                    structure={structure}
                    surSelection={() => {
                      basculerSelection(structure.id)
                    }}
                  />
                ))}
              </Table>

              {viewModel.displayPagination ? (
                <div className="fr-grid-row fr-grid-row--center fr-mt-3w">
                  <Pagination
                    onNavigation={naviguer}
                    pathname="/liste-structures-administratives"
                    totalUtilisateurs={viewModel.total}
                  />
                </div>
              ) : null}
            </>
          )}
        </>
      )}
    </>
  )
}

const ariaSortParOrdre: Readonly<Record<string, 'ascending' | 'descending'>> = {
  asc: 'ascending',
  desc: 'descending',
}

const ordreInverse: Readonly<Record<string, 'asc' | 'desc'>> = {
  asc: 'desc',
  desc: 'asc',
}

type EnTeteTriable = Readonly<{
  ariaSort?: 'ascending' | 'descending'
  contenu: ReactElement
  label: string
}>

function ChampTexte({ label, largeur, name, valeur }: PropsChampTexte): ReactElement {
  const id = useId()

  return (
    <div className={`fr-col-12 ${largeur}`}>
      <div className="fr-input-group">
        <label className="fr-label" htmlFor={id}>
          {label}
        </label>
        <input className="fr-input" defaultValue={valeur} id={id} name={name} type="text" />
      </div>
    </div>
  )
}

type PropsChampTexte = Readonly<{
  label: string
  largeur: string
  name: string
  valeur: string
}>

function LigneStructure({ selectionnee, structure, surSelection }: PropsLigneStructure): ReactElement {
  return (
    <tr>
      <td>
        <div className="fr-checkbox-group fr-checkbox-group--sm">
          <input
            checked={selectionnee}
            id={`selection-structure-${structure.id}`}
            onChange={surSelection}
            type="checkbox"
          />
          <label className="fr-label" htmlFor={`selection-structure-${structure.id}`}>
            <span className="fr-sr-only">{`Sélectionner ${structure.nom}`}</span>
          </label>
        </div>
      </td>
      <td style={{ maxWidth: '25vw' }}>
        <div
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          <strong title={structure.nom}>{structure.nom}</strong>
          {structure.antenne === null ? null : (
            <>
              <br />
              <span className="fr-text--sm" title={structure.antenne}>
                {structure.antenne}
              </span>
            </>
          )}
          <br />
          <span className="fr-text--sm fr-text-mention--grey" title={structure.categorieJuridique}>
            {structure.categorieJuridique}
          </span>
        </div>
        <span
          className={`fr-badge fr-badge--no-icon fr-badge--sm fr-mr-1v ${
            structure.estCanonique ? 'fr-badge--success' : ''
          }`}
        >
          {structure.estCanonique ? 'Canonique' : 'Antenne'}
        </span>
        <span
          className={`fr-badge fr-badge--no-icon fr-badge--sm fr-mr-1v ${structure.estGouvernance ? 'fr-badge--new' : ''}`}
        >
          {structure.estGouvernance ? 'Gouvernance' : 'Hors gouvernance'}
        </span>
        {structure.dejaFusionnee ? (
          <span className="fr-badge fr-badge--info fr-badge--no-icon fr-badge--sm">Déjà fusionnée</span>
        ) : null}
      </td>
      <td style={{ maxWidth: '20vw' }}>
        <div
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {structure.adresse.ligne1}
          {structure.adresse.ligne2 === '' ? null : (
            <>
              <br />
              {structure.adresse.ligne2}
            </>
          )}
        </div>
      </td>
      <td>
        {structure.identifiants.length === 0 ? '-' : null}
        {structure.identifiants.map((identifiant) => (
          <div className="fr-mb-1v" key={identifiant.label} style={{ whiteSpace: 'nowrap' }}>
            <span className="fr-badge fr-badge--no-icon fr-badge--sm fr-mr-1v">{identifiant.label}</span>
            <span className="fr-text--xs" title={identifiant.valeur}>
              {identifiant.valeurCourte}
            </span>
            <button
              className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-icon-clipboard-line fr-ml-1v"
              onClick={() => {
                void navigator.clipboard.writeText(identifiant.valeur).then(() => {
                  Notification('success', { description: identifiant.valeur, title: 'Copié : ' })
                })
              }}
              title={`Copier ${identifiant.label} ${identifiant.valeur}`}
              type="button"
            >
              {`Copier ${identifiant.label} ${identifiant.valeur}`}
            </button>
          </div>
        ))}
      </td>
      <td>{structure.nbPersonnesEmployees}</td>
      <td>
        <strong>{structure.rattachements.total}</strong>
        {structure.rattachements.details.length === 0 ? null : (
          <ul className="fr-raw-list fr-text--xs fr-text-mention--grey fr-mb-0">
            {structure.rattachements.details.map((detail) => (
              <li key={detail} style={{ whiteSpace: 'nowrap' }}>
                {detail}
              </li>
            ))}
          </ul>
        )}
      </td>
      <td className="fr-cell--center">
        <Link
          className="fr-btn fr-btn--secondary fr-btn--sm fr-icon-eye-line"
          href={`/structure/${structure.id}`}
          title={`Voir le détail de ${structure.nom}`}
        >
          {`Voir le détail de ${structure.nom}`}
        </Link>
        <Link
          className="fr-btn fr-btn--secondary fr-btn--sm fr-icon-time-line fr-ml-1w"
          href={`/structure/${structure.id}/historique`}
          title={`Voir l’historique de ${structure.nom}`}
        >
          {`Voir l’historique de ${structure.nom}`}
        </Link>
      </td>
    </tr>
  )
}

type PropsLigneStructure = Readonly<{
  selectionnee: boolean
  structure: StructureAdministrativeViewModel
  surSelection(): void
}>

type Props = Readonly<{
  filtres: Readonly<{
    adresse: string
    aidantsConnect: string
    commune: string
    coop: string
    departement: string
    gouvernance: string
    idposte: string
    nom: string
    ridet: string
    rna: string
    siret: string
    type: string
  }>
  tri: Readonly<{
    colonne: string
    ordre: string
  }>
  viewModel: ListeStructuresAdministrativesViewModel
}>
