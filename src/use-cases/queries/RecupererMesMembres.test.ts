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
      mesMembresLoader = {
        ...mesMembresLoader,
        membres: [
          {
            contactReferent: {
              nom: 'Henrich',
              prenom: 'Laetitia',
            },
            nom: 'Préfecture du Rhône',
            roles: ['coporteur'],
            statut: 'membre',
            suppressionDuMembreAutorise: false,
            typologie: 'Préfecture départementale',
          },
          {
            contactReferent: {
              nom: 'Didier',
              prenom: 'Durant',
            },
            nom: 'Département du Rhône',
            roles: ['coporteur', 'cofinanceur'],
            statut: 'membre',
            suppressionDuMembreAutorise: true,
            typologie: 'Collectivité, EPCI',
          },
          {
            contactReferent: {
              nom: 'Dupont',
              prenom: 'Tom',
            },
            nom: 'Département du Rhône',
            roles: [],
            statut: 'candidat',
            suppressionDuMembreAutorise: true,
            typologie: 'Collectivité, EPCI',
          },
          {
            contactReferent: {
              nom: 'Dupont',
              prenom: 'Valérie',
            },
            nom: 'La Voie Du Num',
            roles: ['coporteur'],
            statut: 'suggestion',
            suppressionDuMembreAutorise: true,
            typologie: 'Association',
          },
        ],
      }

      // WHEN
      const queryHandler = new RecupererMesMembres(new MesMembresLoaderStub())
      const mesMembres = await queryHandler.get({ codeDepartement: '69', statut: 'membre' })

      // THEN
      expect(mesMembres).toStrictEqual(mesMembresReadModelFactory({
        autorisations: {
          accesMembreValide: true,
          ajouterUnMembre: true,
          supprimerUnMembre: true,
        },
        membres: [
          {
            contactReferent: {
              nom: 'Henrich',
              prenom: 'Laetitia',
            },
            nom: 'Préfecture du Rhône',
            roles: ['coporteur'],
            statut: 'membre',
            suppressionDuMembreAutorise: false,
            typologie: 'Préfecture départementale',
          },
          {
            contactReferent: {
              nom: 'Didier',
              prenom: 'Durant',
            },
            nom: 'Département du Rhône',
            roles: ['coporteur', 'cofinanceur'],
            statut: 'membre',
            suppressionDuMembreAutorise: true,
            typologie: 'Collectivité, EPCI',
          },
        ],
        roles: ['coporteur', 'cofinanceur'],
        statuts: ['membre', 'candidat', 'suggestion'],
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
