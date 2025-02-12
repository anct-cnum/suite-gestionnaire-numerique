import { mesFeuillesDeRoutePresenter } from './mesFeuillesDeRoutePresenter'
import { mesFeuillesDeRouteViewModelFactory } from './testHelper'
import { feuillesDeRouteReadModelFactory } from '@/use-cases/testHelper'

describe('mes feuilles de route presenter', () => {
  it('affichage des membres', () => {
    // GIVEN
    const mesFeuillesDeRoute = feuillesDeRouteReadModelFactory()

    // WHEN
    const mesFeuillesDeRouteViewModel = mesFeuillesDeRoutePresenter(mesFeuillesDeRoute)

    // THEN
    expect(mesFeuillesDeRouteViewModel).toStrictEqual(mesFeuillesDeRouteViewModelFactory())
  })
})
