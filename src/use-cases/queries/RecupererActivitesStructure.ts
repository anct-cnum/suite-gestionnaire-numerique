import { StatistiquesCoopLoader } from './RecupererStatistiquesCoop'
import { QueryHandler } from '../QueryHandler'

// Statistiques d'activité d'une structure : accompagnements et bénéficiaires des médiateurs
// qui sont ou ont été en contrat dans la structure (via l'API Coop), plus les accompagnements
// Aidants Connect des aidants de la structure (total cumulé et détail mensuel).
export class RecupererActivitesStructure implements QueryHandler<Query, ActivitesStructureReadModel> {
  readonly #accompagnementsAcLoader: AccompagnementsAcStructureLoader
  readonly #mediateursCoopLoader: MediateursCoopStructureLoader
  readonly #statistiquesCoopLoader: StatistiquesCoopLoader

  constructor(
    mediateursCoopLoader: MediateursCoopStructureLoader,
    statistiquesCoopLoader: StatistiquesCoopLoader,
    accompagnementsAcLoader: AccompagnementsAcStructureLoader
  ) {
    this.#mediateursCoopLoader = mediateursCoopLoader
    this.#statistiquesCoopLoader = statistiquesCoopLoader
    this.#accompagnementsAcLoader = accompagnementsAcLoader
  }

  async handle(query: Query): Promise<ActivitesStructureReadModel> {
    const [coopIds, accompagnementsAidantsConnect, parMoisAidantsConnect] = await Promise.all([
      this.#mediateursCoopLoader.recupererCoopIdsParStructure(query.structureId),
      this.#accompagnementsAcLoader.recupererTotalParStructure(query.structureId),
      this.#accompagnementsAcLoader.recupererParMoisParStructure(query.structureId),
    ])

    // Sans médiateur rattaché, ne pas appeler l'API Coop : un filtre vide renverrait les statistiques nationales.
    if (coopIds.length === 0) {
      return {
        accompagnementsAidantsConnect,
        accompagnementsMediationNumerique: 0,
        beneficiaires: { anonymes: 0, suivis: 0, total: 0 },
        parJour: [],
        parMois: [],
        parMoisAidantsConnect,
      }
    }

    const statistiques = await this.#statistiquesCoopLoader.recupererStatistiques({ mediateurs: coopIds })

    return {
      accompagnementsAidantsConnect,
      accompagnementsMediationNumerique: statistiques.totaux.accompagnements.total,
      beneficiaires: {
        anonymes: statistiques.totaux.beneficiaires.anonymes,
        suivis: statistiques.totaux.beneficiaires.suivis,
        total: statistiques.totaux.beneficiaires.total,
      },
      parJour: statistiques.accompagnementsParJour,
      parMois: statistiques.accompagnementsParMois,
      parMoisAidantsConnect,
    }
  }
}

export interface MediateursCoopStructureLoader {
  recupererCoopIdsParStructure(structureId: number): Promise<ReadonlyArray<string>>
}

export interface AccompagnementsAcStructureLoader {
  recupererParMoisParStructure(structureId: number): Promise<ReadonlyArray<AccompagnementAcMensuelReadModel>>
  recupererTotalParStructure(structureId: number): Promise<number>
}

export type ActivitesStructureReadModel = Readonly<{
  accompagnementsAidantsConnect: number
  accompagnementsMediationNumerique: number
  beneficiaires: Readonly<{
    anonymes: number
    suivis: number
    total: number
  }>
  parJour: ReadonlyArray<PointGraphiqueReadModel>
  parMois: ReadonlyArray<PointGraphiqueReadModel>
  parMoisAidantsConnect: ReadonlyArray<AccompagnementAcMensuelReadModel>
}>

type AccompagnementAcMensuelReadModel = Readonly<{
  // Mois au format « AAAA-MM »
  mois: string
  total: number
}>

type PointGraphiqueReadModel = Readonly<{
  count: number
  label: string
}>

type Query = Readonly<{
  structureId: number
}>
