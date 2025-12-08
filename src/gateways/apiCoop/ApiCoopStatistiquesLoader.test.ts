/* eslint-disable camelcase */
import { ApiCoopStatistiquesLoader } from './ApiCoopStatistiquesLoader'

describe('apiCoopStatistiquesLoader', () => {
  let loader: ApiCoopStatistiquesLoader

  beforeEach(() => {
    loader = new ApiCoopStatistiquesLoader()
  })
  
  it('devrait transformer correctement les données de l\'API', () => {
    // Mock de la réponse API réelle (structure simplifiée)
    const reponseApiMock = {
      data: {
        attributes: {
          accompagnements_par_jour: [
            { count: 485, label: '14/08' },
          ],
          accompagnements_par_mois: [
            { count: 16427, label: 'Août' },
          ],
          activites: {
            durees: [
              { count: 100000, label: 'Moins d\'une heure', proportion: 10.0, value: 'MoinsUneHeure' },
            ],
            materiels: [
              { count: 329338, label: 'Ordinateur', proportion: 56.605, value: 'Ordinateur' },
            ],
            thematiques: [
              { count: 200000, label: 'Prise en main d\'un ordinateur', proportion: 20.0, value: 'PriseEnMainOrdinateur' },
            ],
            thematiques_demarches: [
              { count: 50000, label: 'CAF', proportion: 25.0, value: 'Caf' },
            ],
            total: 1161183,
            type_activites: [
              { count: 461503, label: 'Individuel', proportion: 45.706, value: 'Individuel' },
            ],
            type_lieu: [
              { count: 50000, label: 'À distance', proportion: 5.0, value: 'ADistance' },
            ],
          },
          beneficiaires: {
            genres: [
              { count: 278165, label: 'Masculin', proportion: 27.549, value: 'Masculin' },
            ],
            statuts_social: [
              { count: 203477, label: 'Sans emploi', proportion: 20.157, value: 'SansEmploi' },
            ],
            total: 1009721,
            tranche_ages: [
              { count: 192281, label: '70 ans et plus', proportion: 19.043, value: 'SoixanteDixPlus' },
            ],
          },
          totaux: {
            accompagnements: {
              collectifs: {
                proportion: 54.225,
                total: 646368,
              },
              individuels: {
                proportion: 45.775,
                total: 545633,
              },
              total: 1192006,
            },
            activites: {
              collectifs: {
                participants: 646368,
                proportion: 15.436,
                total: 99601,
              },
              individuels: {
                proportion: 84.564,
                total: 545633,
              },
              total: 645234,
            },
            beneficiaires: {
              anonymes: 946668,
              nouveaux: 0,
              suivis: 63053,
              total: 1009721,
            },
          },
        },
        id: 'statistiques',
        type: 'statistiques',
      },
      links: {
        self: {
          href: 'https://coop-numerique.anct.gouv.fr/api/v1/statistiques',
        },
      },
      meta: {},
    }

    // @ts-expect-error - Accès à la méthode privée pour les tests
    const result = loader.transformerReponse(reponseApiMock)

    expect(result).toStrictEqual({
      accompagnementsParJour: [
        { count: 485, label: '14/08' },
      ],
      accompagnementsParMois: [
        { count: 16427, label: 'Août' },
      ],
      activites: {
        durees: [
          { count: 100000, label: 'Moins d\'une heure', proportion: 10.0, value: 'MoinsUneHeure' },
        ],
        materiels: [
          { count: 329338, label: 'Ordinateur', proportion: 56.605, value: 'Ordinateur' },
        ],
        thematiques: [
          { count: 200000, label: 'Prise en main d\'un ordinateur', proportion: 20.0, value: 'PriseEnMainOrdinateur' },
        ],
        thematiquesDemarches: [
          { count: 50000, label: 'CAF', proportion: 25.0, value: 'Caf' },
        ],
        total: 1161183,
        typeActivites: [
          { count: 461503, label: 'Individuel', proportion: 45.706, value: 'Individuel' },
        ],
        typeLieu: [
          { count: 50000, label: 'À distance', proportion: 5.0, value: 'ADistance' },
        ],
      },
      beneficiaires: {
        genres: [
          { count: 278165, label: 'Masculin', proportion: 27.549, value: 'Masculin' },
        ],
        statutsSocial: [
          { count: 203477, label: 'Sans emploi', proportion: 20.157, value: 'SansEmploi' },
        ],
        total: 1009721,
        trancheAges: [
          { count: 192281, label: '70 ans et plus', proportion: 19.043, value: 'SoixanteDixPlus' },
        ],
      },
      totaux: {
        accompagnements: {
          collectifs: {
            proportion: 54.225,
            total: 646368,
          },
          demarches: {
            proportion: 0,
            total: 0,
          },
          individuels: {
            proportion: 45.775,
            total: 545633,
          },
          total: 1192006,
        },
        activites: {
          collectifs: {
            participants: 646368,
            proportion: 15.436,
            total: 99601,
          },
          demarches: {
            proportion: 0,
            total: 0,
          },
          individuels: {
            proportion: 84.564,
            total: 545633,
          },
          total: 645234,
        },
        beneficiaires: {
          anonymes: 946668,
          nouveaux: 0,
          suivis: 63053,
          total: 1009721,
        },
      },
    })
  })
})