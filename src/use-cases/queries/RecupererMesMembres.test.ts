import { mesMembresReadModelFactory } from '../testHelper'
import { MesMembresReadModel, MesMembresLoader, RecupererMesMembres } from './RecupererMesMembres'

describe('recuperer mes membres', () => {
  afterEach(() => {
    mesMembresLoader = mesMembresReadModelFactory()
  })
  describe('quand on demande les membres validés rattachés à une gouvernance existante d’un département existant', () => {
    it('et que le membre est une préfecture départementale alors on les récupères mais il n’est pas autorisé à se supprimer', async () => {
      // GIVEN
      mesMembresLoader = {
        ...mesMembresLoader,
        membres: [mesMembresLoader.membres[0], mesMembresLoader.membres[1]],
      }

      // WHEN
      const queryHandler = new RecupererMesMembres(new MesMembresLoaderStub())
      const mesMembres = await queryHandler.get({ codeDepartement: '69' })

      // THEN
      expect(mesMembres).toStrictEqual(mesMembresReadModelFactory({
        membres: [
          {
            contactReferent: {
              nom: 'Henrich',
              prenom: 'Laetitia',
            },
            nom: 'Préfecture du Rhône',
            roles: ['Co-porteur'],
            statut: 'Membre',
            suppressionDuMembreAutorise: false,
            typologie: 'Préfecture départementale',
          },
          {
            contactReferent: {
              nom: 'Didier',
              prenom: 'Durant',
            },
            nom: 'Département du Rhône',
            roles: ['Co-porteur'],
            statut: 'Membre',
            suppressionDuMembreAutorise: true,
            typologie: 'Collectivité, EPCI',
          },
        ],
      }))
    })

    it.each([
      'Co-financeur',
      'Bénéficiaire',
      'Formation',
      'Observateur',
    ])('et que le gestionnaire département détient le rôle %s sans avoir le rôle "Co-porteur" alors on les récupère mais il ne peut ni supprimer et ni ajouter un membre', async (role) => {
      // GIVEN
      mesMembresLoader = {
        ...mesMembresLoader,
        roles: [role],
      }

      // WHEN
      const queryHandler = new RecupererMesMembres(new MesMembresLoaderStub())
      const mesMembres = await queryHandler.get({ codeDepartement: '69' })

      // THEN
      expect(mesMembres).toStrictEqual(mesMembresReadModelFactory({
        autorisations: {
          ajouterUnMembre: false,
          supprimerUnMembre: false,
        },
        roles: [role],
      }))
    })

    it('et que le gestionnaire département est un co-porteur alors on les récupère et il peut supprimer et ajouter un membre', async () => {
      // GIVEN
      mesMembresLoader = {
        ...mesMembresLoader,
        roles: ['Co-porteur', 'Co-Financeur'],
      }

      // WHEN
      const queryHandler = new RecupererMesMembres(new MesMembresLoaderStub())
      const mesMembres = await queryHandler.get({ codeDepartement: '69' })

      // THEN
      expect(mesMembres).toStrictEqual(mesMembresReadModelFactory({
        autorisations: {
          ajouterUnMembre: true,
          supprimerUnMembre: true,
        },
        roles: ['Co-porteur', 'Co-Financeur'],
      }))
    })
  })
})

let mesMembresLoader: MesMembresReadModel = mesMembresReadModelFactory()

class MesMembresLoaderStub extends MesMembresLoader {
  protected async find(): Promise<MesMembresReadModel> {
    return Promise.resolve(mesMembresLoader)
  }
}
