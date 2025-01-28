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
            roles: ['Co-porteur', 'Co-financeur'],
            statut: 'Membre',
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
            statut: 'Candidat',
            suppressionDuMembreAutorise: true,
            typologie: 'Collectivité, EPCI',
          },
          {
            contactReferent: {
              nom: 'Dupont',
              prenom: 'Valérie',
            },
            nom: 'La Voie Du Num',
            roles: ['Co-porteur'],
            statut: 'Suggestion',
            suppressionDuMembreAutorise: true,
            typologie: 'Association',
          },
        ],
      }

      // WHEN
      const queryHandler = new RecupererMesMembres(new MesMembresLoaderStub())
      const mesMembres = await queryHandler.get({ codeDepartement: '69', statut: 'Membre' })

      // THEN
      expect(mesMembres).toStrictEqual(mesMembresReadModelFactory({
        autorisations: {
          accesMembreValide: true,
          ajouterUnMembre: true,
          supprimerUnMembre: true,
        },
        filtres: {
          roles: ['Co-porteur', 'Co-financeur'],
          typologies: ['Préfecture départementale', 'Collectivité, EPCI'],
        },
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
            roles: ['Co-porteur', 'Co-financeur'],
            statut: 'Membre',
            suppressionDuMembreAutorise: true,
            typologie: 'Collectivité, EPCI',
          },
        ],
        statut: ['Membre', 'Candidat', 'Suggestion'],
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
