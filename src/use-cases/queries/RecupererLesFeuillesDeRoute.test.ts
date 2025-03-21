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
    expect(feuillesDeRoute).toStrictEqual(feuillesDeRouteReadModelFactory({
      feuillesDeRoute: [
        {
          ...desFeuillesDeRoute.feuillesDeRoute[0],
          beneficiaires: 4,
          coFinanceurs: 2,
          totaux: {
            budget: 70_000,
            coFinancement: 40_000,
            financementAccorde: 30_000,
          },
        },
        {
          ...desFeuillesDeRoute.feuillesDeRoute[1],
          beneficiaires: 1,
          coFinanceurs: 1,
          totaux: {
            budget: 20_000,
            coFinancement: 20_000,
            financementAccorde: 0,
          },
        },
      ],
      totaux: {
        budget: 90_000,
        coFinancement: 60_000,
        financementAccorde: 30_000,
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
