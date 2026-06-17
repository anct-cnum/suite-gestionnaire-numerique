import { QueryHandler } from '../QueryHandler'

// Aide à la consolidation des membres de gouvernance.
//
// Signal `gouvernance_sans_terrain` : un membre de gouvernance est rattaché à une SA
// « antenne » (denomination_antenne renseignée) qui ne porte AUCUNE donnée opérationnelle
// (poste / contrat / affectation / lieu), alors qu'une autre SA du MÊME SIREN — l'établissement
// réel — concentre cet opérationnel. C'est un angle mort de la détection des doublons de
// structures (même SIRET, antennes toutes nommées → jamais signalé). Cf
// dataspace/docs/constat-membres-gouvernance-mal-raccroches.md (Problème 3, motif systémique).
//
// GARDE ENTITÉ : on exclut les membres dont l'identifiant métier (structure-<siret> / epci-<siren>
// / departement-<dep> / commune-<insee>) désigne une entité différente du SIREN de la SA actuelle
// (ceux-là relèvent d'une CORRECTION de rattachement, pas d'une fusion de SA).
//
// La cible proposée = la SA-terrain (plus grosse empreinte opérationnelle du SIREN). La fusion
// elle-même réutilise l'outil existant (`/structures-doublons/comparer`), qui déplace les 7 FK
// (dont membre / utilisateur / contact) et permet d'arbitrer la denomination_antenne retenue.
export class RechercherMembresAConsolider implements QueryHandler<Query, MembresAConsoliderReadModel> {
  readonly #loader: MembresAConsoliderLoader

  constructor(loader: MembresAConsoliderLoader) {
    this.#loader = loader
  }

  async handle(query: Query): Promise<MembresAConsoliderReadModel> {
    // Seule la règle « structure fantôme » est branchée pour l'instant. Les autres règles du
    // catalogue (cf REGLES_CONSOLIDATION) sont « à venir » et renvoient une liste vide.
    if (query.regle !== 'structure-fantome') {
      return []
    }

    return this.#loader.membres()
  }
}

export interface MembresAConsoliderLoader {
  membres(): Promise<MembresAConsoliderReadModel>
}

// Catalogue des règles de détection. Une seule est implémentée à ce stade ; les autres servent
// d'onglets « à venir » dans le sélecteur. Les libellés sont portés par le presenter.
export const REGLES_CONSOLIDATION = [
  'structure-fantome',
  'mauvaise-entite',
  'commune-ccas-epci',
  'canonique-disponible',
] as const

export type RegleConsolidation = (typeof REGLES_CONSOLIDATION)[number]

export type MembresAConsoliderReadModel = ReadonlyArray<MembreAConsoliderReadModel>

export type MembreAConsoliderReadModel = Readonly<{
  departementGouvernance: null | string
  estCoporteur: boolean
  membreId: string
  membreNom: null | string
  nbSaDuSiren: number
  saActuelleAntenne: null | string
  saActuelleDenomination: null | string
  saActuelleId: number
  // Liste des ids de SA du SIREN (séparés par des virgules) à passer à la page de comparaison.
  saIdsDuSiren: string
  saTerrainAntenne: null | string
  saTerrainDenomination: null | string
  saTerrainId: number
  saTerrainOp: number
  siren: null | string
}>

type Query = Readonly<{
  regle: RegleConsolidation
}>
