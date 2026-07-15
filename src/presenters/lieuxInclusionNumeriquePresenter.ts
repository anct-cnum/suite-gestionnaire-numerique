// eslint-disable-next-line import/no-restricted-paths
import { LieuxInclusionNumeriqueReadModel } from '@/gateways/PrismaLieuxInclusionNumeriqueLoader'

export function lieuxInclusionNumeriquePresenter(
  readModel: LieuxInclusionNumeriqueReadModel
): LieuxInclusionNumeriqueViewModel {
  return {
    // eslint-disable-next-line no-restricted-syntax
    categoryGenerationDate: new Date(),
    lieuxConseillerNumeriques: readModel.nombreStructuresAvecConseillersNumeriques.reduce(
      (acc, lieuxConseillerNumerique) => acc + lieuxConseillerNumerique.count,
      0
    ),
    lieuxFranceService: readModel.nombreStructuresAvecFranceServices.reduce(
      (acc, lieuFranceService) => acc + lieuFranceService.count,
      0
    ),
    nombreLabellisesOuHabilites: readModel.nombreStructuresAvecProgrammeNational.reduce(
      (acc, nombreLabellisesOuHabilite) => acc + nombreLabellisesOuHabilite.count,
      0
    ),
    nombreLieuxInclusion: readModel.totalLieuxInclusionNumerique.reduce(
      (acc, totalLieuxInclusionNumerique) => acc + totalLieuxInclusionNumerique.nb_lieux_inclusion_numerique,
      0
    ),
    territoriesFRR: readModel.nombreStructuresFRR.reduce((acc, territorieFRR) => acc + territorieFRR.nb_structures, 0),
    territoriesPrioritaires: readModel.nombreStructuresZonesPrioritaires.reduce(
      (acc, territoriesPrioritaire) => acc + territoriesPrioritaire.nb_structures,
      0
    ),
    territoriesQPV: readModel.nombreStructuresQPV.reduce((acc, territorieQPV) => acc + territorieQPV.nb_structures, 0),
  }
}

export interface LieuxInclusionNumeriqueViewModel {
  categoryGenerationDate: Date
  lieuxConseillerNumeriques: number
  lieuxFranceService: number
  nombreLabellisesOuHabilites: number
  nombreLieuxInclusion: number
  territoriesFRR: number
  territoriesPrioritaires: number
  territoriesQPV: number
}
