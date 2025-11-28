import { StatistiquesMediateursReadModel } from '@/gateways/PrismaStatistiquesMediateursLoader'

export type StatistiquesMediateursViewModel = Readonly<{
  mediateurs: {
    nombre: string
    sousTexte: string
  }
  conseillersNumeriques: {
    nombre: string
    sousTexte: string
  }
  aidantsConnect: {
    nombre: string
    sousTexte: string
  }
}>

export function statistiquesMediateursPresenter(
  readModel: StatistiquesMediateursReadModel
): StatistiquesMediateursViewModel {
  const { nombreAidantsConnect, nombreConseillersNumeriques, nombreCoordinateurs, nombreMediateurs } = readModel

  const pourcentageConseillers = nombreMediateurs > 0
    ? Math.round((nombreConseillersNumeriques / nombreMediateurs) * 100)
    : 0

  const pourcentageAidants = nombreMediateurs > 0
    ? Math.round((nombreAidantsConnect / nombreMediateurs) * 100)
    : 0

  return {
    aidantsConnect: {
      nombre: String(nombreAidantsConnect),
      sousTexte: `Soit ${pourcentageAidants}% des médiateurs numériques`,
    },
    conseillersNumeriques: {
      nombre: String(nombreConseillersNumeriques),
      sousTexte: `Soit ${pourcentageConseillers}% des médiateurs numériques`,
    },
    mediateurs: {
      nombre: String(nombreMediateurs),
      sousTexte: `Dont ${nombreCoordinateurs} médiateur${nombreCoordinateurs > 1 ? 's' : ''} coordinateur${nombreCoordinateurs > 1 ? 's' : ''}`,
    },
  }
}
