import { membresReadModelFactory } from '../testHelper'
import { MesMembresReadModel, MesMembresLoader, RecupererMesMembres } from './RecupererMesMembres'

describe('recuperer mes membres', () => {
  beforeEach(() => {
    mesMembresLoader = membresReadModelFactory()
  })

  describe('quand les membres rattachés à une gouvernance existante sont demandés', () => {
    it('alors on retourne les membres validés si le gestionnaire a les droits', async () => {
      // GIVEN
      const queryHandler = new RecupererMesMembres(new MesMembresLoaderStub())

      // WHEN
      const mesMembres = await queryHandler.handle({ codeDepartement: '69' })

      // THEN
      expect(mesMembres).toStrictEqual({
        autorisations: {
          accesMembreConfirme: false,
          ajouterUnMembre: false,
          supprimerUnMembre: false,
        },
        departement: 'Rhône',
        membres: [
          {
            contactReferent: {
              nom: 'Henrich',
              prenom: 'Laetitia',
            },
            nom: 'Préfecture du Rhône',
            roles: ['coporteur'],
            statut: 'confirme',
            suppressionDuMembreAutorise: false,
            typologie: 'Préfecture départementale',
          },
          {
            contactReferent: {
              nom: 'Chappuis',
              prenom: 'Pauline',
            },
            nom: 'Rhône (69)',
            roles: ['coporteur', 'cofinanceur'],
            statut: 'confirme',
            suppressionDuMembreAutorise: false,
            typologie: 'Collectivité, conseil départemental',
          },
          {
            contactReferent: {
              nom: 'Boudet',
              prenom: 'Blaise',
            },
            nom: 'CC des Monts du Lyonnais',
            roles: ['coporteur', 'cofinanceur'],
            statut: 'candidat',
            suppressionDuMembreAutorise: false,
            typologie: 'Collectivité, EPCI',
          },
          {
            contactReferent: {
              nom: 'Vasseur',
              prenom: 'Gaby',
            },
            nom: "La Voie du Num'",
            roles: ['beneficiaire', 'recipiendaire'],
            statut: 'candidat',
            suppressionDuMembreAutorise: false,
            typologie: 'Association',
          },
          {
            contactReferent: {
              nom: 'Beauvilliers',
              prenom: 'Fabien',
            },
            nom: 'Fédération départementale des centres sociaux du Rhône et de la Métropole de Lyon',
            roles: ['observateur'],
            statut: 'suggere',
            suppressionDuMembreAutorise: false,
            typologie: 'Association',
          },
          {
            contactReferent: {
              nom: 'Geffroy',
              prenom: 'Grégory',
            },
            nom: 'Info-Jeunes Auvergne Rhône-Alpes (CRIJ)',
            roles: ['beneficiaire', 'cofinanceur'],
            statut: 'confirme',
            suppressionDuMembreAutorise: false,
            typologie: 'Association',
          },
          {
            contactReferent: {
              nom: 'Poulin',
              prenom: 'Ninon',
            },
            nom: 'Emmaüs Connect',
            roles: ['observateur'],
            statut: 'candidat',
            suppressionDuMembreAutorise: false,
            typologie: 'Association',
          },
          {
            contactReferent: {
              nom: 'Dufour',
              prenom: 'Arianne',
            },
            nom: 'Croix Rouge Française',
            roles: ['cofinanceur'],
            statut: 'suggere',
            suppressionDuMembreAutorise: false,
            typologie: 'Association',
          },
          {
            contactReferent: {
              nom: 'Pélissier',
              prenom: 'Fabien',
            },
            nom: 'Orange',
            roles: ['coporteur'],
            statut: 'confirme',
            suppressionDuMembreAutorise: false,
            typologie: 'Entreprise privée',
          },
          {
            contactReferent: {
              nom: 'Geffroy',
              prenom: 'Grégory',
            },
            nom: 'Info-Jeunes Rhône (CRIJ)',
            roles: ['coporteur'],
            statut: 'confirme',
            suppressionDuMembreAutorise: false,
            typologie: 'Association',
          },
        ],
        roles: ['coporteur', 'cofinanceur', 'beneficiaire', 'recipiendaire', 'observateur'],
        typologies: [
          'Préfecture départementale',
          'Collectivité, conseil départemental',
          'Collectivité, EPCI',
          'Association',
          'Entreprise privée',
        ],
      })
    })
  })
})

let mesMembresLoader: MesMembresReadModel

class MesMembresLoaderStub implements MesMembresLoader {
  async get(): Promise<MesMembresReadModel> {
    return Promise.resolve(mesMembresLoader)
  }
}
