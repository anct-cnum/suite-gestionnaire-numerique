import { feuillesDeRouteReadModelFactory } from '../testHelper'
import { FeuillesDeRouteLoader, FeuillesDeRouteReadModel, RecupererLesFeuillesDeRoute } from './RecupererLesFeuillesDeRoute'

describe('recupérer les feuilles de route', () => {
  beforeEach(() => {
    desFeuillesDeRoute = feuillesDeRouteReadModelFactory()
    spiedCodeDepartement = ''
  })

  it('quand les feuilles de route d’une gouvernance sont demandées, alors elles sont récupérées et les données suivantes sont calculées :\n' +
    '- pour chaque action de chaque feuille de route, les totaux des subventions demandées et des co-financements\n' +
    '- pour chaque feuille de route :\n' +
    '-- les nombres de cofinanceurs et de bénéficiaires pour l’ensemble des actions\n' +
    '-- les totaux des budgets de toutes les actions \n' +
    '-- les totaux des financement accordés pour et des co-financements pour l’ensemble des actions\n', async () => {
    // GIVEN
    const codeDepartement = '93'
    const recupererLesFeuillesDeRoute = new RecupererLesFeuillesDeRoute(new FeuillesDeRouteLoaderSpy())

    // WHEN
    const feuillesDeRoute = await recupererLesFeuillesDeRoute.handle({ codeDepartement })

    // THEN
    expect(spiedCodeDepartement).toBe(codeDepartement)
    expect(feuillesDeRoute).toStrictEqual<FeuillesDeRouteReadModel>({
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
                coFinancement: 40_000,
                financementAccorde: 30_000,
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
            budget: 170_000,
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
              budgetGlobal: 60_000,
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
                coFinancement: 20_000,
                financementAccorde: 0,
              },
              uid: 'actionFooId3',
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
            budget: 60_000,
            coFinancement: 20_000,
            financementAccorde: 0,
          },
          uid: 'feuilleDeRouteFooId2',
        },
        {
          actions: [
            {
              beneficiaires: [],
              besoins: ['Établir un diagnostic territorial'],
              budgetGlobal: 13_000,
              coFinancements: [
                {
                  coFinanceur: { nom: 'Co-financeur 2', uid: 'coFinanceurId2' },
                  montant: 6_000,
                },
              ],
              contexte: '<p><strong>Aliquam maecenas augue morbi risus sed odio. Sapien imperdiet feugiat at nibh dui amet. Leo euismod sit ultrices nulla lacus aliquet tellus.</strong></p>',
              description: '<p><strong>Aliquam maecenas augue morbi risus sed odio. Sapien imperdiet feugiat at nibh dui amet. Leo euismod sit ultrices nulla lacus aliquet tellus.</strong></p>',
              nom: 'Structurer une filière de reconditionnement locale 3',
              porteurs: [],
              subvention: {
                enveloppe: 'Ingénierie France Numérique Ensemble',
                montants: {
                  prestation: 4_000,
                  ressourcesHumaines: 3_000,
                },
                statut: 'refusee',
              },
              totaux: {
                coFinancement: 6_000,
                financementAccorde: 0,
              },
              uid: 'actionFooId4',
            },
          ],
          beneficiaires: 0,
          coFinanceurs: 1,
          nom: 'Feuille de route 3',
          structureCoPorteuse: undefined,
          totaux: {
            budget: 13_000,
            coFinancement: 6_000,
            financementAccorde: 0,
          },
          uid: 'feuilleDeRouteFooId3',
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
        budget: 243_000,
        coFinancement: 66_000,
        financementAccorde: 30_000,
      },
      uidGouvernance: 'gouvernanceFooId',
    })
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
