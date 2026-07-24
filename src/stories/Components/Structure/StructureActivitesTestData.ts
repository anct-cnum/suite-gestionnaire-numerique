import { ActivitesStructureViewModel } from '@/presenters/activitesStructurePresenter'

export function createDefaultActivitesStructureViewModel(): ActivitesStructureViewModel {
  return {
    beneficiaires: {
      accompagnes: '68',
      anonymes: '20',
      suivis: '48',
    },
    graphique: {
      parJour: {
        backgroundColor: Array.from({ length: 5 }, () => '#009099'),
        data: [3, 0, 5, 2, 8],
        labels: ['10/08', '11/08', '12/08', '13/08', '14/08'],
      },
      parMois: {
        aidantsConnect: {
          backgroundColor: Array.from({ length: 6 }, () => '#ce614a'),
          data: [12, 8, 15, 10, 5, 14],
        },
        backgroundColor: Array.from({ length: 6 }, () => '#009099'),
        data: [93, 50, 70, 62, 32, 90],
        labels: ['Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.'],
      },
    },
    lienStatistiques: '/statistiques?structuresEmployeuses=1',
    totalAidantsConnect: '18',
    totalMediationNumerique: '120',
  }
}
