import { libelleSource } from '@/presenters/shared/libelleSource'
import {
  GroupeDoublonReadModel,
  SignalDoublon,
  StructuresDoublonsReadModel,
} from '@/use-cases/queries/RechercherStructuresDoublons'

const LIBELLE_SIGNAL: Readonly<Record<SignalDoublon, string>> = {
  identifiant_externe_partage: 'Identifiant externe partagé',
  nom_commune_proche: 'Même nom et commune',
  siret_antenne_ambigu: 'SIRET à antenne ambiguë',
}

// Options du filtre « Signal » du composant, dérivées des libellés pour rester alignées.
export const optionsSignal: ReadonlyArray<Readonly<{ label: string; valeur: string }>> = Object.entries(
  LIBELLE_SIGNAL
).map(([valeur, label]) => ({ label, valeur }))

// Colonnes triables du tableau ; le tri par défaut (rattachements décroissant)
// priorise les fusions qui assainissent le plus de données.
export const colonnesTriablesDoublons: ReadonlyArray<ColonneTriableDoublons> = ['commune', 'rattachements', 'signal']

export const triDoublonsParDefaut: TriDoublons = { colonne: 'rattachements', ordre: 'desc' }

export function structuresDoublonsPresenter(
  readModel: StructuresDoublonsReadModel,
  tri: TriDoublons
): StructuresDoublonsViewModel {
  const groupes = readModel.map(versGroupeViewModel).sort(comparateur(tri))

  return {
    groupes,
    total: groupes.length,
  }
}

export type ColonneTriableDoublons = 'commune' | 'rattachements' | 'signal'

export type TriDoublons = Readonly<{
  colonne: ColonneTriableDoublons
  ordre: 'asc' | 'desc'
}>

export type StructuresDoublonsViewModel = Readonly<{
  groupes: ReadonlyArray<GroupeDoublonViewModel>
  total: number
}>

export type GroupeDoublonViewModel = Readonly<{
  cle: string
  commune: string
  idsParam: string
  nbRattachements: number
  nbStructures: number
  signalLibelle: string
  structures: ReadonlyArray<StructureLigneViewModel>
}>

export type StructureLigneViewModel = Readonly<{
  dejaFusionnee: boolean
  denomination: string
  estAntenne: boolean
  id: number
  identifiant: string
  nbRattachements: number
  source: string
}>

function comparateur(tri: TriDoublons): (gauche: GroupeDoublonViewModel, droite: GroupeDoublonViewModel) => number {
  const sens = tri.ordre === 'asc' ? 1 : -1

  return (gauche, droite) => {
    if (tri.colonne === 'rattachements') {
      return sens * (gauche.nbRattachements - droite.nbRattachements)
    }
    if (tri.colonne === 'commune') {
      return sens * gauche.commune.localeCompare(droite.commune, 'fr')
    }
    return sens * gauche.signalLibelle.localeCompare(droite.signalLibelle, 'fr')
  }
}

function versGroupeViewModel(groupe: GroupeDoublonReadModel): GroupeDoublonViewModel {
  const communes = Array.from(
    new Set(
      groupe.structures.map((structure) => structure.commune).filter((commune): commune is string => commune !== null)
    )
  )

  return {
    cle: groupe.cle,
    commune: communes.join(', ') || '—',
    idsParam: groupe.structures.map((structure) => structure.id).join(','),
    nbRattachements: groupe.structures.reduce((total, structure) => total + structure.nbRattachements, 0),
    nbStructures: groupe.structures.length,
    signalLibelle: LIBELLE_SIGNAL[groupe.signal],
    structures: groupe.structures.map((structure) => ({
      dejaFusionnee: structure.dejaFusionnee,
      denomination: structure.denominationAntenne ?? structure.denomination ?? `Structure #${structure.id}`,
      estAntenne: structure.denominationAntenne !== null,
      id: structure.id,
      identifiant: structure.siret ?? structure.ridet ?? '—',
      nbRattachements: structure.nbRattachements,
      source: libelleSource(structure.source),
    })),
  }
}
