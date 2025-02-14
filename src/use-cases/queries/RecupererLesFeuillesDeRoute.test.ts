import { feuillesDeRouteReadModelFactory } from '../testHelper'
import { FeuillesDeRouteLoader, FeuillesDeRouteReadModel, RecupererLesFeuillesDeRoute } from './RecupererLesFeuillesDeRoute'

describe('recupérer les feuilles de route', () => {
  beforeEach(() => {
    desFeuillesDeRoute = feuillesDeRouteReadModelFactory()
    spiedCodeDepartement = ''
  })

  it('quand les feuilles de route d’une gouvernance sont demandées, alors elles sont récupérées en calculant les totaux des différents budgets', async () => {
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
            financementAccorde: 60_000,
          },
        },
        {
          ...desFeuillesDeRoute.feuillesDeRoute[1],
          totaux: {
            budget: 150_000,
            coFinancement: 100_000,
            financementAccorde: 50_000,
          },
        },
      ],
      totaux: {
        budget: 290_000,
        coFinancement: 180_000,
        financementAccorde: 110_000,
      },
    }))
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
        budget: 100_000,
        coFinancement: 80_000,
        financementAccorde: 20_000,
      }
    )
    expect(feuillesDeRoute.feuillesDeRoute[1].totaux).toStrictEqual(
      {
        budget: 100_000,
        coFinancement: 100_000,
        financementAccorde: 0,
      }
    )
    expect(feuillesDeRoute.totaux).toStrictEqual(
      {
        budget: 200_000,
        coFinancement: 180_000,
        financementAccorde: 20_000,
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
              statut: 'enCours',
            },
            {
              ...desFeuillesDeRoute.feuillesDeRoute[0].actions[1],
            },
          ],
        },
        {
          ...desFeuillesDeRoute.feuillesDeRoute[1],
          actions: [
            {
              ...desFeuillesDeRoute.feuillesDeRoute[1].actions[0],
              statut: 'enCours',
            },
            {
              ...desFeuillesDeRoute.feuillesDeRoute[1].actions[1],
              statut: 'enCours',
            },
          ],
        },
      ],
    }))
  }
}
