'use client'

import Link from 'next/link'
import { ReactElement, useContext, useId, useTransition } from 'react'

import departements from '../../../ressources/departements.json'
import { clientContext } from '../shared/ClientContext'
import Select from '../shared/Select/Select'
import SpinnerSimple from '../shared/Spinner/SpinnerSimple'
import Table from '../shared/Table/Table'
import {
  GroupeDoublonViewModel,
  optionsSignal,
  StructuresDoublonsViewModel,
} from '@/presenters/structuresDoublonsPresenter'

export default function StructuresDoublons({ filtres, tri, viewModel }: Props): ReactElement {
  const { router } = useContext(clientContext)
  const signalId = useId()
  const departementId = useId()
  // Affiche un loader tant que le serveur recalcule les doublons (la détection est coûteuse).
  const [isPending, startTransition] = useTransition()

  const pluriel = viewModel.total > 1 ? 's' : ''
  const resume =
    viewModel.total === 0
      ? 'Aucun doublon candidat détecté.'
      : `${viewModel.total} groupe${pluriel} de doublons candidats à examiner.`

  function naviguer(url: string): void {
    startTransition(() => {
      router.push(url)
    })
  }

  function filtrer(formData: FormData): void {
    const params = new URLSearchParams()
    for (const cle of ['nom', 'siret', 'rna', 'ridet', 'signal', 'departement']) {
      const valeur = formData.get(cle)
      if (typeof valeur === 'string' && valeur.trim() !== '') {
        params.set(cle, valeur.trim())
      }
    }
    params.set('tri', tri.colonne)
    params.set('ordre', tri.ordre)
    naviguer(`/structures-doublons?${params.toString()}`)
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
    naviguer(`/structures-doublons?${params.toString()}`)
  }

  function enTeteTriable(label: string, colonne: string, ordreParDefaut: 'asc' | 'desc'): EnTeteTriable {
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
          title={`Trier par ${label.toLowerCase()}`}
          type="button"
        >
          {label}
        </button>
      ),
      label,
    }
  }

  return (
    <section>
      <h1>Doublons de structures</h1>

      {/* La clé force le remontage du formulaire quand les filtres de l'URL changent (champs non contrôlés) */}
      <form
        className="fr-mb-2w"
        key={Object.values(filtres).join('|')}
        onSubmit={(event) => {
          event.preventDefault()
          filtrer(new FormData(event.currentTarget))
        }}
      >
        <div className="fr-grid-row fr-grid-row--gutters">
          <ChampTexte label="Nom" largeur="fr-col-md-6" name="nom" valeur={filtres.nom} />
          <ChampTexte label="Siret" largeur="fr-col-md-3" name="siret" valeur={filtres.siret} />
          <ChampTexte label="RNA" largeur="fr-col-md-3" name="rna" valeur={filtres.rna} />
        </div>
        <div className="fr-grid-row fr-grid-row--bottom fr-grid-row--gutters fr-mt-1v">
          <ChampTexte label="Ridet" largeur="fr-col-md-2" name="ridet" valeur={filtres.ridet} />
          <div className="fr-col-12 fr-col-md-3">
            <Select
              id={signalId}
              name="signal"
              options={[
                { isSelected: filtres.signal === '', label: 'Tous les signaux', value: '' },
                ...optionsSignal.map((option) => ({
                  isSelected: filtres.signal === option.valeur,
                  label: option.label,
                  value: option.valeur,
                })),
              ]}
            >
              Signal
            </Select>
          </div>
          <div className="fr-col-12 fr-col-md-3">
            <Select
              id={departementId}
              name="departement"
              options={[
                { isSelected: filtres.departement === '', label: 'Tous les départements', value: '' },
                ...departements.map((departement) => ({
                  isSelected: filtres.departement === departement.code,
                  label: `${departement.code} · ${departement.nom}`,
                  value: departement.code,
                })),
              ]}
            >
              Département
            </Select>
          </div>
          <div className="fr-col-12 fr-col-md-4">
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="fr-btn" type="submit">
                Filtrer
              </button>
              <button
                className="fr-btn fr-btn--secondary"
                onClick={() => {
                  naviguer('/structures-doublons')
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
        <SpinnerSimple text="Recherche des doublons…" />
      ) : (
        <>
          <p className="fr-text--sm fr-text-mention--grey">{resume}</p>

          {viewModel.total > 0 ? (
            <Table
              enTetes={[
                enTeteTriable('Signal', 'signal', 'asc'),
                'Structures concernées',
                enTeteTriable('Commune', 'commune', 'asc'),
                enTeteTriable('Rattachements', 'rattachements', 'desc'),
                '',
              ]}
              multiline={true}
              titre="Doublons de structures"
            >
              {viewModel.groupes.map((groupe) => (
                <LigneGroupe groupe={groupe} key={groupe.cle} />
              ))}
            </Table>
          ) : null}
        </>
      )}
    </section>
  )
}

function LigneGroupe({ groupe }: Readonly<{ groupe: GroupeDoublonViewModel }>): ReactElement {
  return (
    <tr>
      <td>
        <span className="fr-badge fr-badge--no-icon fr-badge--sm fr-badge--info">{groupe.signalLibelle}</span>
      </td>
      {/* width 100% : la colonne absorbe tout l'espace disponible, les autres restent compactes. */}
      <td style={{ width: '100%' }}>
        <ul className="fr-raw-list">
          {groupe.structures.map((structure) => (
            <li className="fr-mb-1w" key={structure.id}>
              <span className="fr-text--bold">{structure.denomination}</span>{' '}
              <span className="fr-text--xs fr-text-mention--grey">
                ({structure.identifiant} · {structure.nbRattachements} rattachement
                {structure.nbRattachements > 1 ? 's' : ''})
              </span>
              <br />
              <span className="fr-badge fr-badge--no-icon fr-badge--sm">{structure.source}</span>
              {structure.estAntenne ? (
                <span className="fr-badge fr-badge--no-icon fr-badge--sm fr-badge--purple-glycine fr-ml-1w">
                  Antenne
                </span>
              ) : null}
              {structure.dejaFusionnee ? (
                <span className="fr-badge fr-badge--no-icon fr-badge--sm fr-badge--info fr-ml-1w">Déjà fusionnée</span>
              ) : null}
            </li>
          ))}
        </ul>
      </td>
      {/* Le presenter peut joindre plusieurs communes : on borne la largeur et on laisse
          le texte passer à la ligne pour ne pas voler l'espace de la colonne structures. */}
      <td style={{ maxWidth: '12rem', minWidth: '10rem' }}>{groupe.commune}</td>
      <td className="fr-cell--center">{groupe.nbRattachements}</td>
      <td>
        <Link
          className="fr-btn fr-btn--secondary fr-btn--sm"
          href={`/structures-doublons/comparer?ids=${groupe.idsParam}`}
        >
          Examiner
        </Link>
      </td>
    </tr>
  )
}

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

type PropsChampTexte = Readonly<{
  label: string
  largeur: string
  name: string
  valeur: string
}>

type Props = Readonly<{
  filtres: Readonly<{
    departement: string
    nom: string
    ridet: string
    rna: string
    signal: string
    siret: string
  }>
  tri: Readonly<{
    colonne: string
    ordre: 'asc' | 'desc'
  }>
  viewModel: StructuresDoublonsViewModel
}>
