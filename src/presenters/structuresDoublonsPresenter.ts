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
  badges: ReadonlyArray<string>
  cle: string
  commune: string
  idsParam: string
  nbStructures: number
  signalLibelle: string
  structures: ReadonlyArray<StructureLigneViewModel>
}>

export type StructureLigneViewModel = Readonly<{
  denomination: string
  id: number
  identifiant: string
  nbRattachements: number
}>

function versGroupeViewModel(groupe: GroupeDoublonReadModel): GroupeDoublonViewModel {
  const communes = Array.from(
    new Set(
      groupe.structures.map((structure) => structure.commune).filter((commune): commune is string => commune !== null)
    )
  )

  return {
    badges: groupe.multiEtablissement ? ['Multi-établissement (même SIREN)'] : [],
    cle: groupe.cle,
    commune: communes.join(', ') || '—',
    idsParam: groupe.structures.map((structure) => structure.id).join(','),
    nbStructures: groupe.structures.length,
    signalLibelle: LIBELLE_SIGNAL[groupe.signal],
    structures: groupe.structures.map((structure) => ({
      denomination: structure.denominationAntenne ?? structure.denomination ?? `Structure #${structure.id}`,
      id: structure.id,
      identifiant: structure.siret ?? structure.ridet ?? '—',
      nbRattachements: structure.nbRattachements,
    })),
  }
}
