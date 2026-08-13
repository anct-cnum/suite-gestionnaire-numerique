import { StatistiquesCoopLoader } from './RecupererStatistiquesCoop'
import { QueryHandler } from '../QueryHandler'

// Statistiques d'activité d'une structure : accompagnements et bénéficiaires des activités
// rattachées à cette structure employeuse (filtre structuresEmployeuses — maille activité,
// pas médiateur : un médiateur ayant eu plusieurs structures employeuses n'y contribue que pour
// les activités réalisées pour celle-ci), plus les accompagnements Aidants Connect des aidants
// de la structure (total cumulé et détail mensuel).
export class RecupererActivitesStructure implements QueryHandler<Query, ActivitesStructureReadModel> {
  readonly #accompagnementsAcLoader: AccompagnementsAcStructureLoader
  readonly #statistiquesCoopLoader: StatistiquesCoopLoader

  constructor(
    statistiquesCoopLoader: StatistiquesCoopLoader,
    accompagnementsAcLoader: AccompagnementsAcStructureLoader
  ) {
    this.#statistiquesCoopLoader = statistiquesCoopLoader
    this.#accompagnementsAcLoader = accompagnementsAcLoader
  }

  async handle(query: Query): Promise<ActivitesStructureReadModel> {
    const [statistiques, accompagnementsAidantsConnect, parMoisAidantsConnect] = await Promise.all([
      this.#statistiquesCoopLoader.recupererStatistiques({ structuresEmployeuses: [String(query.structureId)] }),
      this.#accompagnementsAcLoader.recupererTotalParStructure(query.structureId),
      this.#accompagnementsAcLoader.recupererParMoisParStructure(query.structureId),
    ])

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
