import { ApiCoopStatistiquesLoader } from './ApiCoopStatistiquesLoader'

describe('ApiCoopStatistiquesLoader', () => {
  let loader: ApiCoopStatistiquesLoader

  beforeEach(() => {
    loader = new ApiCoopStatistiquesLoader()
  })

  it('devrait transformer correctement les données de l\'API', () => {
    // Mock de la réponse API réelle (structure simplifiée)
    const reponseApiMock = {
      data: {
        type: 'statistiques',
        id: 'statistiques',
        attributes: {
          accompagnements_par_jour: [
            { label: '14/08', count: 485 }
          ],
          accompagnements_par_mois: [
            { count: 16427, label: 'Août' }
          ],
          beneficiaires: {
            total: 1009721,
            genres: [
              { value: 'Masculin', label: 'Masculin', count: 278165, proportion: 27.549 }
            ],
            tranche_ages: [
              { value: 'SoixanteDixPlus', label: '70 ans et plus', count: 192281, proportion: 19.043 }
            ],
            statuts_social: [
              { value: 'SansEmploi', label: 'Sans emploi', count: 203477, proportion: 20.157 }
            ]
          },
          activites: {
            total: 1161183,
            type_activites: [
              { value: 'Individuel', label: 'Individuel', count: 461503, proportion: 45.706 }
            ],
            durees: [
              { value: 'MoinsUneHeure', label: 'Moins d\'une heure', count: 100000, proportion: 10.0 }
            ],
            type_lieu: [
              { value: 'ADistance', label: 'À distance', count: 50000, proportion: 5.0 }
            ],
            thematiques: [
              { value: 'PriseEnMainOrdinateur', label: 'Prise en main d\'un ordinateur', count: 200000, proportion: 20.0 }
            ],
            materiels: [
              { value: 'Ordinateur', label: 'Ordinateur', count: 329338, proportion: 56.605 }
            ]
          },
          totaux: {
            activites: {
              total: 645234,
              individuels: {
                total: 545633,
                proportion: 84.564
              },
              collectifs: {
                total: 99601,
                proportion: 15.436,
                participants: 646368
              }
            },
            accompagnements: {
              total: 1192006,
              individuels: {
                total: 545633,
                proportion: 45.775
              },
              collectifs: {
                total: 646368,
                proportion: 54.225
              }
            },
            beneficiaires: {
              total: 1009721,
              nouveaux: 0,
              suivis: 63053,
              anonymes: 946668
            }
          }
        }
      },
      links: {
        self: {
          href: 'https://coop-numerique.anct.gouv.fr/api/v1/statistiques'
        }
      },
      meta: {}
    }

    // @ts-expect-error - Accès à la méthode privée pour les tests
    const result = loader.transformerReponse(reponseApiMock)

    expect(result).toEqual({
      accompagnementsParJour: [
        { label: '14/08', count: 485 }
      ],
      accompagnementsParMois: [
        { label: 'Août', count: 16427 }
      ],
      beneficiaires: {
        total: 1009721,
        genres: [
          { value: 'Masculin', label: 'Masculin', count: 278165, proportion: 27.549 }
        ],
        trancheAges: [
          { value: 'SoixanteDixPlus', label: '70 ans et plus', count: 192281, proportion: 19.043 }
        ],
        statutsSocial: [
          { value: 'SansEmploi', label: 'Sans emploi', count: 203477, proportion: 20.157 }
        ]
      },
      activites: {
        total: 1161183,
        typeActivites: [
          { value: 'Individuel', label: 'Individuel', count: 461503, proportion: 45.706 }
        ],
        durees: [
          { value: 'MoinsUneHeure', label: 'Moins d\'une heure', count: 100000, proportion: 10.0 }
        ],
        typeLieu: [
          { value: 'ADistance', label: 'À distance', count: 50000, proportion: 5.0 }
        ],
        thematiques: [
          { value: 'PriseEnMainOrdinateur', label: 'Prise en main d\'un ordinateur', count: 200000, proportion: 20.0 }
        ],
        materiels: [
          { value: 'Ordinateur', label: 'Ordinateur', count: 329338, proportion: 56.605 }
        ]
      },
      totaux: {
        activites: {
          total: 645234,
          individuels: {
            total: 545633,
            proportion: 84.564
          },
          collectifs: {
            total: 99601,
            proportion: 15.436,
            participants: 646368
          },
          demarches: {
            total: 0,
            proportion: 0
          }
        },
        accompagnements: {
          total: 1192006,
          individuels: {
            total: 545633,
            proportion: 45.775
          },
          collectifs: {
            total: 646368,
            proportion: 54.225
          },
          demarches: {
            total: 0,
            proportion: 0
          }
        },
        beneficiaires: {
          total: 1009721,
          nouveaux: 0,
          suivis: 63053,
          anonymes: 946668
        }
      }
    })
  })
})