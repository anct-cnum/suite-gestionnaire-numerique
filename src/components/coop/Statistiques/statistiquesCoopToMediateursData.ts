import type { StatistiquesMediateursData } from './types'
import type { StatistiquesCoopReadModel } from '@/use-cases/queries/RecupererStatistiquesCoop'

export function statistiquesCoopToMediateursData(
  readModel: StatistiquesCoopReadModel
): StatistiquesMediateursData {
  return {
    accompagnementsParJour: readModel.accompagnementsParJour.map(item => ({
      count: item.count,
      label: item.label,
    })),
    accompagnementsParMois: readModel.accompagnementsParMois.map(item => ({
      count: item.count,
      label: item.label,
    })),
    activites: {
      durees: readModel.activites.durees.map(item => ({
        count: item.count,
        label: item.label,
        proportion: item.proportion,
        value: item.value,
      })),
      materiels: readModel.activites.materiels.map(item => ({
        count: item.count,
        label: item.label,
        proportion: item.proportion,
        value: item.value,
      })),
      thematiques: readModel.activites.thematiques.map(item => ({
        count: item.count,
        label: item.label,
        proportion: item.proportion,
        value: item.value,
      })),
      thematiquesDemarches: readModel.activites.thematiquesDemarches.map(item => ({
        count: item.count,
        label: item.label,
        proportion: item.proportion,
        value: item.value,
      })),
      total: readModel.activites.total,
      typeActivites: readModel.activites.typeActivites.map(item => ({
        count: item.count,
        label: item.label,
        proportion: item.proportion,
        value: item.value,
      })),
      typeLieu: readModel.activites.typeLieu.map(item => ({
        count: item.count,
        label: item.label,
        proportion: item.proportion,
        value: item.value,
      })),
    },
    beneficiaires: {
      genres: readModel.beneficiaires.genres.map(item => ({
        count: item.count,
        label: item.label,
        proportion: item.proportion,
        value: item.value,
      })),
      statutsSocial: readModel.beneficiaires.statutsSocial.map(item => ({
        count: item.count,
        label: item.label,
        proportion: item.proportion,
        value: item.value,
      })),
      total: readModel.beneficiaires.total,
      trancheAges: readModel.beneficiaires.trancheAges.map(item => ({
        count: item.count,
        label: item.label,
        proportion: item.proportion,
        value: item.value,
      })),
    },
    totalCounts: {
      accompagnements: {
        collectifs: {
          proportion: readModel.totaux.accompagnements.collectifs.proportion,
          total: readModel.totaux.accompagnements.collectifs.total,
        },
        individuels: {
          proportion: readModel.totaux.accompagnements.individuels.proportion,
          total: readModel.totaux.accompagnements.individuels.total,
        },
        total: readModel.totaux.accompagnements.total,
      },
      activites: {
        collectifs: {
          participants: readModel.totaux.activites.collectifs.participants,
          proportion: readModel.totaux.activites.collectifs.proportion,
          total: readModel.totaux.activites.collectifs.total,
        },
        individuels: {
          proportion: readModel.totaux.activites.individuels.proportion,
          total: readModel.totaux.activites.individuels.total,
        },
        total: readModel.totaux.activites.total,
      },
      beneficiaires: {
        anonymes: readModel.totaux.beneficiaires.anonymes,
        nouveaux: readModel.totaux.beneficiaires.nouveaux,
        suivis: readModel.totaux.beneficiaires.suivis,
        total: readModel.totaux.beneficiaires.total,
      },
    },
  }
}
