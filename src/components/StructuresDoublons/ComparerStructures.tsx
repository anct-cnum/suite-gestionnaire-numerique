'use client'

import Link from 'next/link'
import { CSSProperties, ReactElement, useContext, useState } from 'react'

import ModaleCanonisation from './ModaleCanonisation'
import Information from '../shared/Information/Information'
import ConfirmationModal from '../shared/Modal/ConfirmationModal'
import { Notification } from '../shared/Notification/Notification'
import { clientContext } from '@/components/shared/ClientContext'
import {
  ComparaisonViewModel,
  ConceptViewModel,
  matriceDistances,
  MatriceDistancesViewModel,
  NiveauDistance,
  StructureComparaisonViewModel,
} from '@/presenters/comparaisonDoublonsPresenter'
import { NotionCle } from '@/use-cases/commands/TransfererNotionsStructure'

type RoleCarte = 'cible' | 'fusionner' | 'rien' | 'transferer'

type Vue = 'comparer' | 'distances'

// État de sélection d'une carte source : les notions cochées + le flag « fusionner » (surcoche qui
// coche toutes les notions et marque la structure pour suppression). La carte cible n'a pas d'état.
type EtatCarte = Readonly<{
  fusionner: boolean
  notions: ReadonlyArray<NotionCle>
}>

const ETAT_VIDE: EtatCarte = { fusionner: false, notions: [] }

export default function ComparerStructures({ viewModel }: Props): ReactElement {
  const { fusionnerStructuresAction, pathname, router, transfererNotionsStructureAction } = useContext(clientContext)

  // Cible par défaut : la canonique (INSEE) si elle existe — c'est la destination naturelle.
  const canoniqueParDefaut = viewModel.find((structure) => structure.estCanonique)
  const [idCible, setIdCible] = useState(canoniqueParDefaut?.id ?? viewModel[0].id)
  const [etats, setEtats] = useState<Readonly<Record<number, EtatCarte | undefined>>>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [idCanonisation, setIdCanonisation] = useState<null | number>(null)
  const [vue, setVue] = useState<Vue>('comparer')

  // Une antenne ne peut être canonisée s'il existe déjà une canonique de même SIRET dans le groupe :
  // la contrainte UNIQUE (siret, denomination_antenne) l'interdirait (garde aussi appliquée côté serveur).
  function collisionCanonique(structure: StructureComparaisonViewModel): boolean {
    return viewModel.some(
      (autre) =>
        autre.id !== structure.id && autre.estCanonique && autre.siret !== null && autre.siret === structure.siret
    )
  }

  const structureCanonisation = viewModel.find((structure) => structure.id === idCanonisation)

  const cible = viewModel.find((structure) => structure.id === idCible)
  const cartesFusion = viewModel.filter((structure) => etats[structure.id]?.fusionner)
  const cartesTransfert = viewModel.filter((structure) => {
    const etat = etats[structure.id]
    return etat !== undefined && !etat.fusionner && etat.notions.length > 0
  })
  const operationPossible = cible !== undefined && (cartesFusion.length > 0 || cartesTransfert.length > 0)

  function etatDe(id: number): EtatCarte {
    return etats[id] ?? ETAT_VIDE
  }

  // Un id de source (coop/tp/ac) ne peut alimenter la cible qu'une fois : indisponible s'il entre en
  // collision avec celui de la cible, ou s'il est déjà réclamé par une autre carte cochée.
  function idScalaireDisponible(concept: ConceptViewModel, idCarte: number): boolean {
    if (concept.idExterne === null) {
      return true
    }
    const conceptCible = cible?.concepts.find((autre) => autre.cle === concept.cle)
    if (conceptCible !== undefined && conceptCible.idExterne !== null && conceptCible.idExterne !== concept.idExterne) {
      return false
    }

    return !viewModel.some((autre) => {
      if (autre.id === idCarte || autre.id === idCible) {
        return false
      }
      const etatAutre = etats[autre.id]
      if (etatAutre === undefined || !etatAutre.notions.includes(concept.cle)) {
        return false
      }
      const conceptAutre = autre.concepts.find((candidat) => candidat.cle === concept.cle)

      return conceptAutre !== undefined && conceptAutre.idExterne !== null
    })
  }

  function definirCible(id: number): void {
    setIdCible(id)
    setEtats((precedent) => sansClef(precedent, id))
  }

  function basculerFusion(structure: StructureComparaisonViewModel): void {
    setEtats((precedent) => {
      if (precedent[structure.id]?.fusionner) {
        return sansClef(precedent, structure.id)
      }
      const notions = structure.concepts
        .filter((concept) => concept.present && idScalaireDisponible(concept, structure.id))
        .map((concept) => concept.cle)

      return { ...precedent, [structure.id]: { fusionner: true, notions } }
    })
  }

  // Une notion n'est déplaçable que si son id scalaire (coop/idposte/ac) n'est pas déjà réclamé.
  function notionDisponible(structure: StructureComparaisonViewModel, concept: ConceptViewModel): boolean {
    return idScalaireDisponible(concept, structure.id)
  }

  function basculerNotion(structure: StructureComparaisonViewModel, cle: NotionCle): void {
    setEtats((precedent) => {
      const actuel = precedent[structure.id] ?? ETAT_VIDE
      const activer = !actuel.notions.includes(cle)
      const notions = activer ? [...actuel.notions, cle] : actuel.notions.filter((autre) => autre !== cle)
      if (notions.length === 0) {
        return sansClef(precedent, structure.id)
      }

      return { ...precedent, [structure.id]: { fusionner: false, notions } }
    })
  }

  async function appliquer(): Promise<void> {
    setIsSubmitting(true)
    const echecs: Array<string> = []

    if (cartesFusion.length > 0) {
      const messages = await fusionnerStructuresAction({
        idsAbsorbees: cartesFusion.map((structure) => structure.id),
        idSurvivante: idCible,
        path: pathname,
      })
      if (!messages.includes('OK')) {
        echecs.push(...messages)
      }
    }
    for (const carte of cartesTransfert) {
      const messages = await transfererNotionsStructureAction({
        idCible,
        idSource: carte.id,
        notions: [...etatDe(carte.id).notions],
        path: pathname,
      })
      if (!messages.includes('OK')) {
        echecs.push(`${carte.denomination} : ${messages.join(', ')}`)
      }
    }

    setIsSubmitting(false)
    setIsModalOpen(false)
    if (echecs.length === 0) {
      Notification('success', { description: 'appliquées', title: 'Opérations ' })
      router.push('/structures-doublons')
    } else {
      Notification('error', { description: echecs.join(' · '), title: 'Erreur : ' })
    }
  }

  return (
    <section>
      <h1>Examiner un doublon</h1>
      <p className="fr-text--sm fr-text-mention--grey">
        Choisissez la structure <span className="fr-text--bold">cible (destination)</span>, puis sur chaque autre carte
        cochez les notions à transférer — ou « Fusionner » pour tout déplacer et supprimer la structure. Une canonique
        (INSEE) ne peut être absorbée que par une autre canonique.
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
                cibleEstCanonique={cible?.estCanonique ?? false}
                collisionCanonique={collisionCanonique(structure)}
                estCible={structure.id === idCible}
                etat={etatDe(structure.id)}
                notionDisponible={(concept) => notionDisponible(structure, concept)}
                onCanoniser={() => {
                  setIdCanonisation(structure.id)
                }}
                onCible={() => {
                  definirCible(structure.id)
                }}
                onToggleFusion={() => {
                  basculerFusion(structure)
                }}
                onToggleNotion={(cle) => {
                  basculerNotion(structure, cle)
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
          disabled={!operationPossible}
          onClick={() => {
            setIsModalOpen(true)
          }}
          type="button"
        >
          Appliquer
        </button>
        {operationPossible ? null : (
          <p className="fr-text--sm fr-text-mention--grey fr-mt-1w">
            Choisissez une cible et, sur au moins une autre carte, une notion à transférer ou « Fusionner ».
          </p>
        )}
      </div>

      <ConfirmationModal
        confirmLabel={isSubmitting ? 'Application…' : 'Confirmer'}
        confirmVariant="error"
        id="confirmer-consolidation"
        isOpen={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
        }}
        onConfirm={() => {
          void appliquer()
        }}
        title="Confirmer les opérations"
      >
        {cible === undefined ? null : (
          <RecapitulatifOperations
            cartesFusion={cartesFusion}
            cartesTransfert={cartesTransfert}
            cible={cible}
            etatDe={etatDe}
          />
        )}
      </ConfirmationModal>

      <ModaleCanonisation
        isOpen={idCanonisation !== null}
        onClose={() => {
          setIdCanonisation(null)
        }}
        structure={structureCanonisation ?? viewModel[0]}
      />
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
  cibleEstCanonique,
  collisionCanonique,
  estCible,
  etat,
  notionDisponible,
  onCanoniser,
  onCible,
  onToggleFusion,
  onToggleNotion,
  structure,
}: Readonly<{
  cibleEstCanonique: boolean
  collisionCanonique: boolean
  estCible: boolean
  etat: EtatCarte
  notionDisponible(concept: ConceptViewModel): boolean
  onCanoniser(): void
  onCible(): void
  onToggleFusion(): void
  onToggleNotion(cle: NotionCle): void
  structure: StructureComparaisonViewModel
}>): ReactElement {
  const rattachementsDetail = structure.rattachements.filter((rattachement) => rattachement.nombre > 0)
  const conceptsPortes = structure.concepts.filter((concept) => concept.present)

  function roleDe(): RoleCarte {
    if (estCible) {
      return 'cible'
    }
    if (etat.fusionner) {
      return 'fusionner'
    }

    return etat.notions.length > 0 ? 'transferer' : 'rien'
  }

  function controles(): ReactElement {
    if (estCible) {
      return <ConceptsPortes conceptsPortes={conceptsPortes} legende="Concepts portés (destination)" />
    }
    if (structure.estCanonique && !cibleEstCanonique) {
      return (
        <p className="fr-text--xs fr-text-mention--grey fr-mt-2w">
          Structure canonique (INSEE) : elle ne peut être absorbée que par une autre canonique, pas par une antenne.
        </p>
      )
    }
    if (conceptsPortes.length === 0) {
      return <p className="fr-text--sm fr-text-mention--grey fr-mt-2w">Aucune notion à transférer.</p>
    }

    return (
      <fieldset className="fr-fieldset fr-mt-2w">
        <legend className="fr-fieldset__legend fr-text--bold">Notions à déplacer vers la cible</legend>
        <div className="fr-fieldset__content">
          <div className="fr-checkbox-group">
            <input checked={etat.fusionner} id={`fusion-${structure.id}`} onChange={onToggleFusion} type="checkbox" />
            <label className="fr-label" htmlFor={`fusion-${structure.id}`}>
              Fusionner (tout transférer puis supprimer la structure)
            </label>
          </div>
          {conceptsPortes.map((concept) => {
            const disponible = notionDisponible(concept)
            const messageIndisponible =
              'Identifiant déjà porté par la cible ou réclamé par une autre structure. Avant d’abandonner cet id, vérifiez qu’il n’existe plus côté source externe, sinon le doublon réapparaîtra au resync.'
            return (
              <div className="fr-checkbox-group" key={concept.cle}>
                <input
                  checked={etat.notions.includes(concept.cle)}
                  disabled={!disponible}
                  id={`notion-${concept.cle}-${structure.id}`}
                  onChange={() => {
                    onToggleNotion(concept.cle)
                  }}
                  type="checkbox"
                />
                <label className="fr-label" htmlFor={`notion-${concept.cle}-${structure.id}`}>
                  {concept.label} — {concept.resume}
                  {concept.idExterne === null ? null : ` · id ${concept.idExterne}`}
                  {disponible ? null : <span className="fr-error-text">{messageIndisponible}</span>}
                </label>
              </div>
            )
          })}
        </div>
      </fieldset>
    )
  }

  return (
    <div className="fr-p-3w" style={{ borderStyle: 'solid', borderWidth: 1, ...styleCarte(roleDe()) }}>
      <p className="fr-mb-1w">
        {structure.estCanonique ? (
          <span className="fr-badge fr-badge--no-icon fr-badge--sm fr-badge--success">Canonique</span>
        ) : (
          <span className="fr-badge fr-badge--no-icon fr-badge--sm fr-badge--purple-glycine">Antenne</span>
        )}
        {structure.membreStatut === 'confirme' ? (
          <span className="fr-badge fr-badge--no-icon fr-badge--sm fr-badge--green-emeraude fr-ml-1w">
            Membre confirmé
          </span>
        ) : null}
        {structure.membreStatut === 'candidat' ? (
          <span className="fr-badge fr-badge--no-icon fr-badge--sm fr-badge--blue-cumulus fr-ml-1w">
            Membre candidat
          </span>
        ) : null}
        {structure.membreStatut === 'supprimer' ? (
          <span className="fr-badge fr-badge--no-icon fr-badge--sm fr-ml-1w">Membre supprimé</span>
        ) : null}
        {structure.dateSuppression === null ? null : (
          <span className="fr-badge fr-badge--no-icon fr-badge--sm fr-badge--warning fr-ml-1w">
            Supprimée le {structure.dateSuppression}
          </span>
        )}
      </p>
      <h2 className="fr-h5">
        {structure.id} -{' '}
        <Link className="fr-link fr-link--lg" href={`/structure/${structure.id}`} rel="noreferrer" target="_blank">
          {structure.denomination}
        </Link>
      </h2>
      <p className="fr-text--xs fr-text-mention--grey">
        {structure.adresse} · {structure.rattachementsTotal} rattachement{structure.rattachementsTotal > 1 ? 's' : ''}
      </p>
      <p className="fr-text--xs">
        <Link
          className="fr-link fr-text--xs"
          href={`/structure/${structure.id}/historique`}
          rel="noreferrer"
          target="_blank"
        >
          Historique
        </Link>
      </p>

      <dl className="fr-text--sm">
        {structure.champs.map((champ) => (
          <div className="fr-grid-row" key={champ.label}>
            <dt className="fr-col-6 fr-text-mention--grey">{champ.label}</dt>
            <dd className="fr-col-6">{champ.valeur}</dd>
          </div>
        ))}
      </dl>

      {structure.estCanonique ? null : (
        <div className="fr-mb-2w">
          <button
            className="fr-btn fr-btn--secondary fr-btn--sm fr-icon-refresh-line fr-btn--icon-left"
            disabled={collisionCanonique || structure.siret === null}
            onClick={onCanoniser}
            type="button"
          >
            Synchroniser avec l’INSEE
          </button>
          {structure.siret === null ? (
            <p className="fr-text--xs fr-text-mention--grey fr-mt-1v">
              Sans SIRET, la structure ne peut pas être canonisée depuis l’INSEE.
            </p>
          ) : null}
          {collisionCanonique ? (
            <p className="fr-text--xs fr-text-mention--grey fr-mt-1v">
              Une structure canonique de même SIRET est déjà présente : fusionnez-la plutôt que de canoniser cette
              antenne.
            </p>
          ) : null}
        </div>
      )}

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
          <div className="fr-radio-group">
            <input
              checked={estCible}
              id={`cible-${structure.id}`}
              name="cible-doublon"
              onChange={onCible}
              type="radio"
            />
            <label className="fr-label" htmlFor={`cible-${structure.id}`}>
              Cible (destination)
            </label>
          </div>
        </div>
      </fieldset>

      {controles()}
    </div>
  )
}

function ConceptsPortes({
  conceptsPortes,
  legende,
}: Readonly<{
  conceptsPortes: ReadonlyArray<ConceptViewModel>
  legende: string
}>): ReactElement {
  return (
    <>
      <p className="fr-text--sm fr-text--bold fr-mb-1v fr-mt-2w">{legende}</p>
      {conceptsPortes.length === 0 ? (
        <p className="fr-text--sm fr-text-mention--grey">Aucun concept porté — structure candidate à la suppression.</p>
      ) : (
        <ul className="fr-text--sm">
          {conceptsPortes.map((concept) => (
            <li key={concept.cle}>
              {concept.label} : <span className="fr-text--bold">{concept.resume}</span>
              {concept.idExterne === null ? null : (
                <span className="fr-text-mention--grey"> · id {concept.idExterne}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function RecapitulatifOperations({
  cartesFusion,
  cartesTransfert,
  cible,
  etatDe,
}: Readonly<{
  cartesFusion: ReadonlyArray<StructureComparaisonViewModel>
  cartesTransfert: ReadonlyArray<StructureComparaisonViewModel>
  cible: StructureComparaisonViewModel
  etatDe(id: number): EtatCarte
}>): ReactElement {
  return (
    <>
      <div className="fr-alert fr-alert--warning fr-mb-2w">
        <p>
          Destination : <span className="fr-text--bold">{cible.denomination}</span>. Elle conserve tous ses champs
          descriptifs (rien n’est repris des structures source).
        </p>
      </div>

      {cartesFusion.length === 0 ? null : (
        <>
          <p className="fr-text--bold">Fusion (déplacement total puis suppression) :</p>
          <ul>
            {cartesFusion.map((structure) => (
              <li key={structure.id}>{structure.denomination}</li>
            ))}
          </ul>
        </>
      )}

      {cartesTransfert.length === 0 ? null : (
        <>
          <p className="fr-text--bold">Transferts partiels :</p>
          <ul>
            {cartesTransfert.map((structure) => (
              <li key={structure.id}>
                {structure.denomination} — {etatDe(structure.id).notions.length} notion
                {etatDe(structure.id).notions.length > 1 ? 's' : ''}
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="fr-text--sm fr-text-mention--grey">
        Les identifiants de source (Coop, Idposte, AC) sont transférés vers la cible ; les identifiants d’identité des
        structures fusionnées (SIRET, RIDET, RNA) sont consignés au journal d’audit puis perdus. Action tracée et
        réversible via le journal.
      </p>
    </>
  )
}

// Retire l'entrée d'une structure de l'état (devenue cible, ou plus aucune notion cochée).
function sansClef(
  record: Readonly<Record<number, EtatCarte | undefined>>,
  id: number
): Readonly<Record<number, EtatCarte | undefined>> {
  return Object.fromEntries(Object.entries(record).filter(([clef]) => Number(clef) !== id))
}

// Couleur de carte selon le rôle : cible (vert), fusionnée (rouge), transfert partiel (bleu), neutre (gris).
function styleCarte(role: RoleCarte): CSSProperties {
  if (role === 'cible') {
    return { backgroundColor: 'var(--background-contrast-success)', borderColor: 'var(--border-plain-success)' }
  }
  if (role === 'fusionner') {
    return { backgroundColor: 'var(--background-contrast-error)', borderColor: 'var(--border-plain-error)' }
  }
  if (role === 'transferer') {
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
