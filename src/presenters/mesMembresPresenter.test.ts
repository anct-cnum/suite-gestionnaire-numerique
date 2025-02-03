import { mesMembresPresenter } from './mesMembresPresenter'
import { mesMembresViewModelFactory } from './testHelper'
import { mesMembresReadModelFactory } from '@/use-cases/testHelper'

describe('mes membres presenter', () => {
  it('affichage des membres', () => {
    // GIVEN
    const mesMembres = mesMembresReadModelFactory({
      roles: ['coporteur', 'cofinanceur'],
      typologies: ['Préfecture départementale', 'Collectivité, EPCI'],
    })

    // WHEN
    const mesMembresViewModel = mesMembresPresenter(mesMembres)

    // THEN
    expect(mesMembresViewModel).toStrictEqual(mesMembresViewModelFactory())
  })
})
