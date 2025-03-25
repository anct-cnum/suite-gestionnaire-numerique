import { feuillesDeRouteReadModelFactory } from '../testHelper'
import { FeuillesDeRouteLoader, FeuillesDeRouteReadModel, RecupererLesFeuillesDeRoute } from './RecupererLesFeuillesDeRoute'

describe('recupérer les feuilles de route', () => {
  beforeEach(() => {
    desFeuillesDeRoute = feuillesDeRouteReadModelFactory()
    spiedCodeDepartement = ''
  })

  it('quand les feuilles de route d’une gouvernance sont demandées, alors elles sont récupérées en calculant les totaux des différents budgets ainsi que les totaux du nombre de cofinanceurs et de bénéficiaires', async () => {
    // GIVEN
    const codeDepartement = '93'
    const recupererLesFeuillesDeRoute = new RecupererLesFeuillesDeRoute(new FeuillesDeRouteLoaderSpy())

    // WHEN
    const feuillesDeRoute = await recupererLesFeuillesDeRoute.handle({ codeDepartement })

    // THEN
    expect(spiedCodeDepartement).toBe(codeDepartement)
    expect(feuillesDeRoute).toStrictEqual({
      feuillesDeRoute: [
        {
          actions: [
            {
              beneficiaires: [
                {
                  nom: 'CAF DE LA CHARENTE',
                  uid: '1',
                },
                {
                  nom: 'HUBIKOOP',
                  uid: '2',
                },
                {
                  nom: 'HYPRA',
                  uid: '3',
                },
              ],
              besoins: ['Établir un diagnostic territorial', 'Appui juridique dédié à la gouvernance'],
              budgetGlobal: 70_000,
              coFinancements: [
                {
                  coFinanceur: { nom: 'Co-financeur 1', uid: 'coFinanceurId' },
                  montant: 20_000,
                },
                {
                  coFinanceur: { nom: 'Co-financeur Orange', uid: 'coFinanceurOrangeId' },
                  montant: 10_000,
                },
                {
                  coFinanceur: { nom: 'Co-financeur 1', uid: 'coFinanceurId' },
                  montant: 10_000,
                },
              ],
              contexte: '<p><strong>Aliquam maecenas augue morbi risus sed odio. Sapien imperdiet feugiat at nibh dui amet. Leo euismod sit ultrices nulla lacus aliquet tellus.</strong></p>',
              description: '<p><strong>Aliquam maecenas augue morbi risus sed odio. Sapien imperdiet feugiat at nibh dui amet. Leo euismod sit ultrices nulla lacus aliquet tellus.</strong></p>',
              nom: 'Structurer une filière de reconditionnement locale 1',
              porteurs: [
                {
                  nom: 'CC des Monts du Lyonnais',
                  uid: 'coPorteuseFooId',
                },
              ],
              subvention: {
                enveloppe: 'Ingénierie France Numérique Ensemble',
                montants: {
                  prestation: 20_000,
                  ressourcesHumaines: 10_000,
                },
                statut: 'acceptee',
              },
              totaux: {
                coFinancement: 0,
                financementAccorde: 0,
              },
              uid: 'actionFooId1',
            },
            {
              beneficiaires: [
                {
                  nom: 'CAF DE LA CHARENTE',
                  uid: '1',
                },
                {
                  nom: 'Kocoya THinkLab',
                  uid: '5',
                },
              ],
              besoins: ['Établir un diagnostic territorial', 'Appui juridique dédié à la gouvernance'],
              budgetGlobal: 100_000,
              coFinancements: [],
              contexte: '<p><strong>Aliquam maecenas augue morbi risus sed odio. Sapien imperdiet feugiat at nibh dui amet. Leo euismod sit ultrices nulla lacus aliquet tellus.</strong></p>',
              description: '<p><strong>Aliquam maecenas augue morbi risus sed odio. Sapien imperdiet feugiat at nibh dui amet. Leo euismod sit ultrices nulla lacus aliquet tellus.</strong></p>',
              nom: 'Structurer une filière de reconditionnement locale 2',
              porteurs: [],
              totaux: {
                coFinancement: 0,
                financementAccorde: 0,
              },
              uid: 'actionFooId2',
            },
          ],

          beneficiaires: 4,
          coFinanceurs: 2,
          nom: 'Feuille de route 1',
          structureCoPorteuse: {
            nom: 'CC des Monts du Lyonnais',
            uid: 'coPorteuseFooId',
          },
          totaux: {
            budget: 70_000,
            coFinancement: 40_000,
            financementAccorde: 30_000,
          },

          uid: 'feuilleDeRouteFooId1',
        },
        {
          actions: [
            {
              beneficiaires: [
                {
                  nom: 'CAF DE LA CHARENTE',
                  uid: '1',
                },
              ],
              besoins: ['Établir un diagnostic territorial', 'Appui juridique dédié à la gouvernance'],
              budgetGlobal: 70_000,
              coFinancements: [
                {
                  coFinanceur: { nom: 'Co-financeur 2', uid: 'coFinanceurId2' },
                  montant: 20_000,
                },
              ],
              contexte: '<p><strong>Aliquam maecenas augue morbi risus sed odio. Sapien imperdiet feugiat at nibh dui amet. Leo euismod sit ultrices nulla lacus aliquet tellus.</strong></p>',
              description: '<p><strong>Aliquam maecenas augue morbi risus sed odio. Sapien imperdiet feugiat at nibh dui amet. Leo euismod sit ultrices nulla lacus aliquet tellus.</strong></p>',
              nom: 'Structurer une filière de reconditionnement locale 3',
              porteurs: [
                {
                  nom: 'Emmaüs Connect',
                  uid: 'porteurId1',
                },
                {
                  nom: 'Orange',
                  uid: 'porteurId2',
                },
              ],
              totaux: {
                coFinancement: 0,
                financementAccorde: 0,
              },
              uid: 'actionFooId1',
            },
          ],
          beneficiaires: 1,
          coFinanceurs: 1,
          nom: 'Feuille de route 2',
          structureCoPorteuse: {
            nom: 'Croix Rouge Française',
            uid: 'coPorteuseFooId2',
          },
          totaux: {
            budget: 20_000,
            coFinancement: 20_000,
            financementAccorde: 0,
          },
          uid: 'feuilleDeRouteFooId2',
        },
      ],
      porteursPotentielsNouvellesFeuillesDeRouteOuActions: [
        {
          nom: 'Meetkap',
          roles: ['coporteur'],
          uid: 'structure-95351745500010-44',
        },
        {
          nom: 'Emmaüs Connect',
          roles: ['coporteur', 'recipiendaire'],
          uid: 'porteurId1',
        },
        {
          nom: 'Orange',
          roles: ['observateur'],
          uid: 'porteurId2',
        },
      ],
      totaux: {
        budget: 90_000,
        coFinancement: 60_000,
        financementAccorde: 30_000,
      },
      uidGouvernance: 'gouvernanceFooId',
    })
  })

  it('quand les feuilles de route d’une gouvernance sont demandées, alors elles sont récupérées en calculant le financement accordé selon si l’action a sa subvention acceptée', async () => {
    // GIVEN
    const codeDepartement = '93'
    const recupererLesFeuillesDeRoute = new RecupererLesFeuillesDeRoute(
      new FeuillesDeRouteSansSubventionsAccepteesLoaderSpy()
    )

    // WHEN
    const feuillesDeRoute = await recupererLesFeuillesDeRoute.handle({ codeDepartement })

    // THEN
    expect(spiedCodeDepartement).toBe(codeDepartement)
    expect(feuillesDeRoute.feuillesDeRoute[0].totaux).toStrictEqual(
      {
        budget: 40_000,
        coFinancement: 40_000,
        financementAccorde: 0,
      }
    )
    expect(feuillesDeRoute.feuillesDeRoute[0].beneficiaires).toBe(4)
    expect(feuillesDeRoute.feuillesDeRoute[0].coFinanceurs).toBe(2)
    expect(feuillesDeRoute.feuillesDeRoute[1].totaux).toStrictEqual(
      {
        budget: 20_000,
        coFinancement: 20_000,
        financementAccorde: 0,
      }
    )
    expect(feuillesDeRoute.feuillesDeRoute[1].beneficiaires).toBe(1)
    expect(feuillesDeRoute.feuillesDeRoute[1].coFinanceurs).toBe(1)
    expect(feuillesDeRoute.totaux).toStrictEqual(
      {
        budget: 60_000,
        coFinancement: 60_000,
        financementAccorde: 0,
      }
    )
  })
})

let desFeuillesDeRoute: FeuillesDeRouteReadModel = feuillesDeRouteReadModelFactory()
let spiedCodeDepartement = ''

class FeuillesDeRouteLoaderSpy implements FeuillesDeRouteLoader {
  async feuillesDeRoute(codeDepartement: string): Promise<FeuillesDeRouteReadModel> {
    spiedCodeDepartement = codeDepartement
    return Promise.resolve(desFeuillesDeRoute)
  }
}

class FeuillesDeRouteSansSubventionsAccepteesLoaderSpy implements FeuillesDeRouteLoader {
  async feuillesDeRoute(codeDepartement: string): Promise<FeuillesDeRouteReadModel> {
    spiedCodeDepartement = codeDepartement
    return Promise.resolve(feuillesDeRouteReadModelFactory({
      feuillesDeRoute: [
        {
          ...desFeuillesDeRoute.feuillesDeRoute[0],
          actions: [
            {
              ...desFeuillesDeRoute.feuillesDeRoute[0].actions[0],
              subvention: {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                ...desFeuillesDeRoute.feuillesDeRoute[0].actions[0].subvention!,
                statut: 'enCours',
              },
            },
            {
              ...desFeuillesDeRoute.feuillesDeRoute[0].actions[1],
            },
          ],
        },
        desFeuillesDeRoute.feuillesDeRoute[1],
      ],
    }))
  }
}
