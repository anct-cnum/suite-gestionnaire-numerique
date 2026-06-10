'use client'

import { CSSProperties, ReactElement, useContext, useState } from 'react'

import Information from '../shared/Information/Information'
import ConfirmationModal from '../shared/Modal/ConfirmationModal'
import { Notification } from '../shared/Notification/Notification'
import { clientContext } from '@/components/shared/ClientContext'
import {
  ComparaisonViewModel,
  matriceDistances,
  MatriceDistancesViewModel,
  NiveauDistance,
  StructureComparaisonViewModel,
} from '@/presenters/comparaisonDoublonsPresenter'

type Choix = 'conserver' | 'fusionner' | 'ignorer'

type Vue = 'comparer' | 'distances'

const CHOIX_OPTIONS: ReadonlyArray<Readonly<{ label: string; valeur: Choix }>> = [
  { label: 'Conserver (survivante)', valeur: 'conserver' },
  { label: 'Fusionner dans la survivante', valeur: 'fusionner' },
  { label: 'Ne pas toucher', valeur: 'ignorer' },
]

export default function ComparerStructures({ viewModel }: Props): ReactElement {
  const { fusionnerStructuresAction, pathname, router } = useContext(clientContext)

  const [idSurvivante, setIdSurvivante] = useState(viewModel[0]?.id ?? 0)
  const [idsAbsorbees, setIdsAbsorbees] = useState<ReadonlyArray<number>>(
    viewModel.slice(1, 2).map((structure) => structure.id)
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [vue, setVue] = useState<Vue>('comparer')

  const survivante = viewModel.find((structure) => structure.id === idSurvivante)
  const absorbees = viewModel.filter((structure) => idsAbsorbees.includes(structure.id))
  const fusionPossible = survivante !== undefined && absorbees.length > 0

  function choixDe(id: number): Choix {
    if (id === idSurvivante) {
      return 'conserver'
    }
    if (idsAbsorbees.includes(id)) {
      return 'fusionner'
    }
    return 'ignorer'
  }

  // La survivante est unique ; on peut en revanche fusionner PLUSIEURS structures dans celle-ci.
  // Choisir un rôle sur une carte la retire des autres rôles. « Ne pas toucher » = neutre.
  function definirChoix(id: number, choix: Choix): void {
    if (choix === 'conserver') {
      setIdSurvivante(id)
      setIdsAbsorbees((ids) => ids.filter((autre) => autre !== id))
    } else if (choix === 'fusionner') {
      setIdsAbsorbees((ids) => (ids.includes(id) ? ids : [...ids, id]))
      if (id === idSurvivante) {
        setIdSurvivante(0)
      }
    } else {
      setIdsAbsorbees((ids) => ids.filter((autre) => autre !== id))
      if (id === idSurvivante) {
        setIdSurvivante(0)
      }
    }
  }

  async function confirmerFusion(): Promise<void> {
    if (!fusionPossible) {
      return
    }
    setIsSubmitting(true)
    const messages = await fusionnerStructuresAction({
      idsAbsorbees,
      idSurvivante,
      path: pathname,
    })
    setIsSubmitting(false)
    setIsModalOpen(false)

    if (messages.includes('OK')) {
      Notification('success', { description: 'fusionnées', title: 'Structures ' })
      router.push('/structures-doublons')
    } else {
      Notification('error', { description: messages.join(', '), title: 'Erreur : ' })
    }
  }

  return (
    <section>
      <h1>Examiner un doublon</h1>
      <p className="fr-text--sm fr-text-mention--grey">
        Choisissez la structure à conserver (survivante) et celle à fusionner. Tous les rattachements de la structure
        absorbée seront déplacés vers la survivante, qui conserve ses propres identifiants (SIRET, RNA…).
      </p>

      <div className="fr-btns-group fr-btns-group--inline fr-btns-group--sm fr-mb-2w">
        <button
          className={vue === 'comparer' ? 'fr-btn' : 'fr-btn fr-btn--secondary'}
          onClick={() => {
            setVue('comparer')
          }}
          type="button"
        >
          Comparer
        </button>
        <button
          className={vue === 'distances' ? 'fr-btn' : 'fr-btn fr-btn--secondary'}
          onClick={() => {
            setVue('distances')
          }}
          type="button"
        >
          Distances
        </button>
      </div>

      {vue === 'comparer' ? (
        <div className="fr-grid-row fr-grid-row--gutters">
          {viewModel.map((structure) => (
            <div className="fr-col-12 fr-col-md-6" key={structure.id}>
              <CarteStructure
                choix={choixDe(structure.id)}
                onChoix={(choix) => {
                  definirChoix(structure.id, choix)
                }}
                structure={structure}
              />
            </div>
          ))}
        </div>
      ) : (
        <MatriceDistances matrice={matriceDistances(viewModel)} />
      )}

      <div className="fr-mt-4w">
        <button
          className="fr-btn"
          disabled={!fusionPossible}
          onClick={() => {
            setIsModalOpen(true)
          }}
          type="button"
        >
          Fusionner
        </button>
        {fusionPossible ? null : (
          <p className="fr-text--sm fr-text-mention--grey fr-mt-1w">
            Sélectionnez une structure à conserver et au moins une à fusionner.
          </p>
        )}
      </div>

      <ConfirmationModal
        confirmLabel={isSubmitting ? 'Fusion en cours…' : 'Confirmer la fusion'}
        confirmVariant="error"
        id="confirmer-fusion"
        isOpen={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
        }}
        onConfirm={() => {
          void confirmerFusion()
        }}
        title="Confirmer la fusion des structures"
      >
        {fusionPossible ? <AvertissementFusion absorbees={absorbees} survivante={survivante} /> : null}
      </ConfirmationModal>
    </section>
  )
}

function MatriceDistances({ matrice }: Readonly<{ matrice: MatriceDistancesViewModel }>): ReactElement {
  return (
    <>
      <p className="fr-text--sm fr-text-mention--grey fr-mb-1v">
        Distances à vol d’oiseau (km) entre les adresses des structures candidates.
        {matrice.coordsIncompletes ? ' Certaines structures n’ont pas de coordonnées (n/a).' : ''}
      </p>
      <p className="fr-text--xs fr-text-mention--grey">
        <span style={{ fontWeight: 700 }}>0.0</span> = même adresse · <span style={{ opacity: 0.4 }}>&lt; 100 m</span> ·{' '}
        <span style={{ color: 'var(--text-default-warning)', fontWeight: 700 }}>&gt; 1 km</span>
      </p>
      <div className="fr-table fr-table--md">
        <div className="fr-table__wrapper">
          <div className="fr-table__container">
            <div className="fr-table__content">
              <table>
                <caption className="fr-sr-only">Distances entre structures candidates</caption>
                <thead>
                  <tr>
                    <th scope="col">Structure</th>
                    {matrice.colonnes.map((colonne) => (
                      <th key={colonne.id} scope="col">
                        {colonne.nom}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrice.lignes.map((ligne) => (
                    <tr key={ligne.id}>
                      <th scope="row">
                        <span className="fr-text--bold">{ligne.nom}</span>
                        <br />
                        <span className="fr-text--xs fr-text-mention--grey">{ligne.adresse}</span>
                      </th>
                      {ligne.cellules.map((cellule) => (
                        <td key={cellule.colonneId} style={styleCellule(cellule.niveau)}>
                          {cellule.valeur}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function CarteStructure({
  choix,
  onChoix,
  structure,
}: Readonly<{
  choix: Choix
  onChoix(choix: Choix): void
  structure: StructureComparaisonViewModel
}>): ReactElement {
  const rattachementsDetail = structure.rattachements.filter((rattachement) => rattachement.nombre > 0)

  return (
    <div className="fr-p-3w" style={{ borderStyle: 'solid', borderWidth: 1, ...styleCarte(choix) }}>
      <p className="fr-mb-1w">
        {structure.estCanonique ? (
          <span className="fr-badge fr-badge--no-icon fr-badge--sm fr-badge--success">Canonique</span>
        ) : (
          <span className="fr-badge fr-badge--no-icon fr-badge--sm fr-badge--purple-glycine">Antenne</span>
        )}
        {structure.estMembre ? (
          <span className="fr-badge fr-badge--no-icon fr-badge--sm fr-badge--green-emeraude fr-ml-1w">Membre</span>
        ) : null}
        {structure.estAssocieLieuInclusion ? (
          <span className="fr-badge fr-badge--no-icon fr-badge--sm fr-badge--blue-ecume fr-ml-1w">
            Lieu d’inclusion rattaché
          </span>
        ) : null}
      </p>
      <h2 className="fr-h5">{structure.denomination}</h2>
      <p className="fr-text--xs fr-text-mention--grey">
        {structure.adresse} · {structure.rattachementsTotal} rattachement{structure.rattachementsTotal > 1 ? 's' : ''}
      </p>

      <dl className="fr-text--sm">
        {structure.champs.map((champ) => (
          <div className="fr-grid-row" key={champ.label}>
            <dt className="fr-col-6 fr-text-mention--grey">{champ.label}</dt>
            <dd className="fr-col-6">{champ.valeur}</dd>
          </div>
        ))}
      </dl>

      <p className="fr-text--sm fr-text--bold fr-mb-1v">Détail des rattachements</p>
      {rattachementsDetail.length === 0 ? (
        <p className="fr-text--sm fr-text-mention--grey">Aucun rattachement.</p>
      ) : (
        <ul className="fr-text--sm">
          {rattachementsDetail.map((rattachement) => (
            <li key={rattachement.label}>
              {rattachement.label} : <span className="fr-text--bold">{rattachement.nombre}</span>
              {rattachement.info === undefined ? null : <Information>{rattachement.info}</Information>}
            </li>
          ))}
        </ul>
      )}

      <fieldset className="fr-fieldset fr-mt-2w">
        <div className="fr-fieldset__content">
          {CHOIX_OPTIONS.map((option) => (
            <div className="fr-radio-group" key={option.valeur}>
              <input
                checked={choix === option.valeur}
                id={`choix-${option.valeur}-${structure.id}`}
                name={`choix-${structure.id}`}
                onChange={() => {
                  onChoix(option.valeur)
                }}
                type="radio"
              />
              <label className="fr-label" htmlFor={`choix-${option.valeur}-${structure.id}`}>
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

function AvertissementFusion({
  absorbees,
  survivante,
}: Readonly<{
  absorbees: ReadonlyArray<StructureComparaisonViewModel>
  survivante: StructureComparaisonViewModel
}>): ReactElement {
  const rattachementsDeplaces = agregerRattachements(absorbees)

  return (
    <>
      <div className="fr-alert fr-alert--warning fr-mb-2w">
        <p>
          Chaque structure ci-dessous sera marquée comme supprimée (réversible via le journal d&apos;audit) et ses
          rattachements déplacés vers <span className="fr-text--bold">{survivante.denomination}</span> :
        </p>
        <ul>
          {absorbees.map((absorbee) => (
            <li key={absorbee.id}>
              <span className="fr-text--bold">{absorbee.denomination}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="fr-text--bold">Ce que la fusion implique :</p>
      {rattachementsDeplaces.length === 0 ? (
        <p>Aucun rattachement à déplacer.</p>
      ) : (
        <ul>
          {rattachementsDeplaces.map((rattachement) => (
            <li key={rattachement.label}>
              {rattachement.nombre} {rattachement.label.toLowerCase()}
            </li>
          ))}
        </ul>
      )}

      <p className="fr-text--sm fr-text-mention--grey">
        Les identifiants uniques des structures absorbées (SIRET, RNA, identifiants Coop/AC…) seront conservés dans le
        journal d&apos;audit puis perdus. Cette action est tracée.
      </p>
    </>
  )
}

// Cumule les rattachements (par libellé) de toutes les absorbées, ne garde que les non nuls.
function agregerRattachements(
  absorbees: ReadonlyArray<StructureComparaisonViewModel>
): ReadonlyArray<Readonly<{ label: string; nombre: number }>> {
  const totaux = new Map<string, number>()
  for (const absorbee of absorbees) {
    for (const rattachement of absorbee.rattachements) {
      totaux.set(rattachement.label, (totaux.get(rattachement.label) ?? 0) + rattachement.nombre)
    }
  }

  return Array.from(totaux, ([label, nombre]) => ({ label, nombre })).filter((rattachement) => rattachement.nombre > 0)
}

// Couleur de carte selon le rôle : conservée (vert), fusionnée (bleu), non touchée (gris).
function styleCarte(choix: Choix): CSSProperties {
  if (choix === 'conserver') {
    return { backgroundColor: 'var(--background-contrast-success)', borderColor: 'var(--border-plain-success)' }
  }
  if (choix === 'fusionner') {
    return { backgroundColor: 'var(--background-contrast-info)', borderColor: 'var(--border-plain-info)' }
  }

  return { borderColor: 'var(--border-default-grey)' }
}

// Mise en forme d'une distance : 0 (même adresse) en gras, < 100 m grisé, > 1 km en orange.
function styleCellule(niveau: NiveauDistance): CSSProperties {
  if (niveau === 'identique') {
    return { fontWeight: 700 }
  }
  if (niveau === 'proche') {
    return { opacity: 0.4 }
  }
  if (niveau === 'eloigne') {
    return { color: 'var(--text-default-warning)', fontWeight: 700 }
  }
  if (niveau === 'diagonale' || niveau === 'inconnu') {
    return { color: 'var(--text-mention-grey)' }
  }

  return {}
}

type Props = Readonly<{
  viewModel: ComparaisonViewModel
}>
