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

export function structuresDoublonsPresenter(readModel: StructuresDoublonsReadModel): StructuresDoublonsViewModel {
  return {
    groupes: readModel.map(versGroupeViewModel),
    total: readModel.length,
  }
}

export type StructuresDoublonsViewModel = Readonly<{
  groupes: ReadonlyArray<GroupeDoublonViewModel>
  total: number
}>

export type GroupeDoublonViewModel = Readonly<{
  cle: string
  commune: string
  idsParam: string
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
