import { feuillesDeRouteReadModelFactory } from '../testHelper'
import { FeuillesDeRouteLoader, FeuillesDeRouteReadModel, RecupererLesFeuillesDeRoute } from './RecupererLesFeuillesDeRoute'

describe('recupérer les feuilles de route', () => {
  beforeEach(() => {
    desFeuillesDeRoute = feuillesDeRouteReadModelFactory()
    spiedCodeDepartement = ''
  })

  it('quand les feuilles de route dune gouvernance sont demandées, alors elles sont récupérées en calculant le total des différents budgets', async () => {
    // GIVEN
    const codeDepartement = '93'
    const recupererLesFeuillesDeRoute = new RecupererLesFeuillesDeRoute(new FeuillesDeRouteLoaderSpy())

    // WHEN
    const feuillesDeRoute = await recupererLesFeuillesDeRoute.handle({ codeDepartement })

    // THEN
    expect(spiedCodeDepartement).toBe(codeDepartement)
    expect(feuillesDeRoute).toStrictEqual(feuillesDeRouteReadModelFactory({
      feuillesDeRoute: [
        {
          ...desFeuillesDeRoute.feuillesDeRoute[0],
          totaux: {
            budget: 140_000,
            coFinancement: 80_000,
            subventionDeLEtat: 60_000,
          },
        },
        {
          ...desFeuillesDeRoute.feuillesDeRoute[1],
          totaux: {
            budget: 150_000,
            coFinancement: 100_000,
            subventionDeLEtat: 50_000,
          },
        },
      ],
      totaux: {
        budget: 290_000,
        coFinancement: 180_000,
        subventionDeLEtat: 110_000,
      },
    }))
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
