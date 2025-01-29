import { mesMembresReadModelFactory } from '../testHelper'
import { MesMembresReadModel, MesMembresLoader, RecupererMesMembres } from './RecupererMesMembres'

describe('recuperer mes membres', () => {
  beforeEach(() => {
    // GIVEN
    mesMembresLoader = mesMembresReadModelFactory()
  })
  describe('quand les membres rattachés à une gouvernance existante sont demandés', () => {
    it('alors on retourne les membres validés si le gestionnaire a les droits', async () => {
      // GIVEN
      const queryHandler = new RecupererMesMembres(new MesMembresLoaderStub())

      // WHEN
      const mesMembres = await queryHandler.get({ codeDepartement: '69' })

      // THEN
      expect(mesMembres).toStrictEqual(mesMembresReadModelFactory({
        autorisations: {
          accesMembreValide: true,
          ajouterUnMembre: true,
          supprimerUnMembre: true,
        },
        roles: ['coporteur', 'cofinanceur'],
        typologies: ['Préfecture départementale', 'Collectivité, EPCI'],
      }))
    })
  })
})

let mesMembresLoader: MesMembresReadModel

class MesMembresLoaderStub extends MesMembresLoader {
  protected async find(): Promise<MesMembresReadModel> {
    return Promise.resolve(mesMembresLoader)
  }
}
