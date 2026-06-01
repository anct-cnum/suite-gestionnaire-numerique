import { QueryHandler } from '../QueryHandler'

const TOUS_LES_SIGNAUX: ReadonlyArray<SignalDoublon> = [
  'identifiant_externe_partage',
  'nom_commune_proche',
  'siret_antenne_ambigu',
]

export class RechercherStructuresDoublons implements QueryHandler<Query, StructuresDoublonsReadModel> {
  readonly #doublonsLoader: StructuresDoublonsLoader

  constructor(doublonsLoader: StructuresDoublonsLoader) {
    this.#doublonsLoader = doublonsLoader
  }

  async handle(query: Query): Promise<StructuresDoublonsReadModel> {
    // Aucun signal sélectionné = on cherche sur tous les axes de détection.
    const signaux = query.signaux.length === 0 ? TOUS_LES_SIGNAUX : query.signaux

    return this.#doublonsLoader.doublons(signaux, query.zone)
  }
}

export interface StructuresDoublonsLoader {
  doublons(signaux: ReadonlyArray<SignalDoublon>, zone?: ZoneDoublons): Promise<StructuresDoublonsReadModel>
}

// Signaux de détection (cf docs dataspace refonte, section N5) :
// - nom_commune_proche : même dénomination normalisée + même commune, SIRET divergents.
//   Inclut les établissements multiples d'une même entité (même SIREN), signalés
//   par le drapeau `multiEtablissement` plutôt que masqués.
// - identifiant_externe_partage : même RNA porté par des SIRET différents.
// - siret_antenne_ambigu : même SIRET avec un `denomination_antenne` NULL d'un côté
//   et renseigné de l'autre (zone grise de la contrainte UNIQUE NULLS NOT DISTINCT).
//
// GARDE ABSOLUE (appliquée côté loader) : deux SA partageant le même SIRET avec des
// `denomination_antenne` tous distincts sont des antennes légitimes (décision tranchée
// 2026-05-25) et ne doivent JAMAIS être proposées comme doublon.
export type SignalDoublon = 'identifiant_externe_partage' | 'nom_commune_proche' | 'siret_antenne_ambigu'

export type StructuresDoublonsReadModel = ReadonlyArray<GroupeDoublonReadModel>

export type GroupeDoublonReadModel = Readonly<{
  cle: string
  // true quand toutes les structures du groupe partagent le même SIREN (établissements
  // multiples d'une même entité) — fusionner serait généralement une erreur, d'où le badge.
  multiEtablissement: boolean
  signal: SignalDoublon
  structures: ReadonlyArray<StructureCandidateReadModel>
}>

export type StructureCandidateReadModel = Readonly<{
  commune: null | string
  denomination: null | string
  denominationAntenne: null | string
  id: number
  nbRattachements: number
  ridet: null | string
  siret: null | string
}>

type TypeZone = 'departement' | 'region'

type ZoneDoublons = Readonly<{
  code: string
  type: TypeZone
}>

type Query = Readonly<{
  signaux: ReadonlyArray<SignalDoublon>
  zone?: ZoneDoublons
}>
