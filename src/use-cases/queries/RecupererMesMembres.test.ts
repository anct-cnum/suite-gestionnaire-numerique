import { mesMembresReadModelFactory } from '../testHelper'
import { MesMembresReadModel, MesMembresLoader, RecupererMesMembres } from './RecupererMesMembres'

describe('recuperer mes membres', () => {
  afterEach(() => {
    // GIVEN
    mesMembresLoader = mesMembresReadModelFactory()
  })
  describe('quand les membres rattachés à une gouvernance existante sont demandés', () => {
    it('alors il a la possibilité de choisir seulement les membres qui sont validés', async () => {
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
      }))
    })

    it('sans filtrer par rôle et typologie, alors on récupère tous les membres', async () => {
      // WHEN
      const queryHandler = new RecupererMesMembres(new MesMembresLoaderStub())
      const mesMembres = await queryHandler.get({ codeDepartement: '69', statut: 'Membre' })

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

    it('et que le membre est une préfecture départementale alors on les récupère mais il n’est pas autorisé à se supprimer', async () => {
      // GIVEN
      mesMembresLoader = {
        ...mesMembresLoader,
        membres: [mesMembresLoader.membres[0], mesMembresLoader.membres[1]],
      }

      // WHEN
      const queryHandler = new RecupererMesMembres(new MesMembresLoaderStub())
      const mesMembres = await queryHandler.get({ codeDepartement: '69', statut: 'Membre' })

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
      const mesMembres = await queryHandler.get({ codeDepartement: '69', statut: 'Membre' })

      // THEN
      expect(mesMembres).toStrictEqual(mesMembresReadModelFactory({
        autorisations: {
          accesMembreValide: true,
          ajouterUnMembre: false,
          supprimerUnMembre: false,
        },
        roles: [role],
      }))
    })

    it('et que le gestionnaire département est un Co-porteur alors on les récupère et il peut supprimer et ajouter un membre', async () => {
      // GIVEN
      mesMembresLoader = {
        ...mesMembresLoader,
        roles: ['Co-porteur', 'Co-Financeur'],
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
        roles: ['Co-porteur', 'Co-Financeur'],
      }))
    })

    it('et que je filtre par un seule rôle "Co-porteur", alors on récupère uniquement les membres ayant ce rôle', async () => {
    // GIVEN
      mesMembresLoader = {
        ...mesMembresLoader,
        filtre: {
          roles: ['Co-porteur'],
          typologies: [''],
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
            roles: ['Co-financeur'],
            statut: 'Membre',
            suppressionDuMembreAutorise: true,
            typologie: 'Collectivité, EPCI',
          },
        ],
      }

      // WHEN
      const queryHandler = new RecupererMesMembres(new MesMembresLoaderStub())
      const mesMembres = await queryHandler.get({ codeDepartement: '69', statut: 'Membre' })

      // THEN
      expect(mesMembres).toStrictEqual(mesMembresReadModelFactory({ filtre: {
        roles: ['Co-porteur'],
        typologies: [''],
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
      ] }))
    })

    it('et que je filtre par plusieurs rôle "Co-porteur" & "Co-financeur", alors on récupère uniquement les membres ayant ce rôle', async () => {
    // GIVEN
      mesMembresLoader = {
        ...mesMembresLoader,
        filtre: {
          roles: ['Co-porteur', 'Co-financeur'],
          typologies: [''],
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
            roles: ['Co-financeur'],
            statut: 'Membre',
            suppressionDuMembreAutorise: true,
            typologie: 'Collectivité, EPCI',
          },
          {
            contactReferent: {
              nom: 'Durpont',
              prenom: 'Tom',
            },
            nom: 'Département du Rhône',
            roles: ['Récipiendaire'],
            statut: 'Membre',
            suppressionDuMembreAutorise: true,
            typologie: 'Collectivité, EPCI',
          },
        ],
      }

      // WHEN
      const queryHandler = new RecupererMesMembres(new MesMembresLoaderStub())
      const mesMembres = await queryHandler.get({ codeDepartement: '69', statut: 'Membre' })

      // THEN
      expect(mesMembres).toStrictEqual(mesMembresReadModelFactory({ filtre: {
        roles: ['Co-porteur', 'Co-financeur'],
        typologies: [''],
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
          roles: ['Co-financeur'],
          statut: 'Membre',
          suppressionDuMembreAutorise: true,
          typologie: 'Collectivité, EPCI',
        },
      ] }))
    })

    it('et que je filtre par une seule typologie "Collectivité, EPCI", alors on récupère uniquement les membres ayant ce typologie', async () => {
    // GIVEN
      mesMembresLoader = {
        ...mesMembresLoader,
        filtre: {
          roles: [''],
          typologies: ['Collectivité, EPCI'],
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
            roles: ['Co-financeur'],
            statut: 'Membre',
            suppressionDuMembreAutorise: true,
            typologie: 'Collectivité, EPCI',
          },
          {
            contactReferent: {
              nom: 'Durpont',
              prenom: 'Tom',
            },
            nom: 'Département du Rhône',
            roles: ['Récipiendaire'],
            statut: 'Membre',
            suppressionDuMembreAutorise: true,
            typologie: 'Collectivité, EPCI',
          },
        ],
      }

      // WHEN
      const queryHandler = new RecupererMesMembres(new MesMembresLoaderStub())
      const mesMembres = await queryHandler.get({ codeDepartement: '69', statut: 'Membre' })

      // THEN
      expect(mesMembres).toStrictEqual(mesMembresReadModelFactory({ filtre: {
        roles: [''],
        typologies: ['Collectivité, EPCI'],
      },
      membres: [
        {
          contactReferent: {
            nom: 'Didier',
            prenom: 'Durant',
          },
          nom: 'Département du Rhône',
          roles: ['Co-financeur'],
          statut: 'Membre',
          suppressionDuMembreAutorise: true,
          typologie: 'Collectivité, EPCI',
        },
        {
          contactReferent: {
            nom: 'Durpont',
            prenom: 'Tom',
          },
          nom: 'Département du Rhône',
          roles: ['Récipiendaire'],
          statut: 'Membre',
          suppressionDuMembreAutorise: true,
          typologie: 'Collectivité, EPCI',
        },
      ] }))
    })

    it('et que je filtre par une seule typologie "Collectivité, EPCI" et par un seule rôle "Récipiendaire", alors on récupère uniquement les membres ayant ce typologie et ce role', async () => {
    // GIVEN
      mesMembresLoader = {
        ...mesMembresLoader,
        filtre: {
          roles: ['Récipiendaire'],
          typologies: ['Collectivité, EPCI'],
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
            roles: ['Co-financeur'],
            statut: 'Membre',
            suppressionDuMembreAutorise: true,
            typologie: 'Collectivité, EPCI',
          },
          {
            contactReferent: {
              nom: 'Durpont',
              prenom: 'Tom',
            },
            nom: 'Département du Rhône',
            roles: ['Récipiendaire'],
            statut: 'Membre',
            suppressionDuMembreAutorise: true,
            typologie: 'Collectivité, EPCI',
          },
        ],
      }

      // WHEN
      const queryHandler = new RecupererMesMembres(new MesMembresLoaderStub())
      const mesMembres = await queryHandler.get({ codeDepartement: '69', statut: 'Membre' })

      // THEN
      expect(mesMembres).toStrictEqual(mesMembresReadModelFactory({ filtre: {
        roles: ['Récipiendaire'],
        typologies: ['Collectivité, EPCI'],
      },
      membres: [
        {
          contactReferent: {
            nom: 'Durpont',
            prenom: 'Tom',
          },
          nom: 'Département du Rhône',
          roles: ['Récipiendaire'],
          statut: 'Membre',
          suppressionDuMembreAutorise: true,
          typologie: 'Collectivité, EPCI',
        },
      ] }))
    })

    it('et que je filtre par plusieurs typologies "Collectivité, EPCI" & "Préfecture départementale" et par plusieurs rôles "Récipiendaire" & "Co-porteur", alors je récupère uniquement les membres ayant ces typologies et ces rôles', async () => {
    // GIVEN
      mesMembresLoader = {
        ...mesMembresLoader,
        filtre: {
          roles: ['Récipiendaire', 'Co-porteur'],
          typologies: ['Collectivité, EPCI', 'Préfecture départementale'],
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
            roles: ['Co-financeur'],
            statut: 'Membre',
            suppressionDuMembreAutorise: true,
            typologie: 'Collectivité, EPCI',
          },
          {
            contactReferent: {
              nom: 'Durpont',
              prenom: 'Tom',
            },
            nom: 'Département du Rhône',
            roles: ['Récipiendaire'],
            statut: 'Membre',
            suppressionDuMembreAutorise: true,
            typologie: 'Collectivité, EPCI',
          },
        ],
      }

      // WHEN
      const queryHandler = new RecupererMesMembres(new MesMembresLoaderStub())
      const mesMembres = await queryHandler.get({ codeDepartement: '69', statut: 'Membre' })

      // THEN
      expect(mesMembres).toStrictEqual(mesMembresReadModelFactory({ filtre: {
        roles: ['Récipiendaire', 'Co-porteur'],
        typologies: ['Collectivité, EPCI', 'Préfecture départementale'],
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
            nom: 'Durpont',
            prenom: 'Tom',
          },
          nom: 'Département du Rhône',
          roles: ['Récipiendaire'],
          statut: 'Membre',
          suppressionDuMembreAutorise: true,
          typologie: 'Collectivité, EPCI',
        },
      ] }))
    })
  })
})

let mesMembresLoader: MesMembresReadModel = mesMembresReadModelFactory()

class MesMembresLoaderStub extends MesMembresLoader {
  protected async find(): Promise<MesMembresReadModel> {
    return Promise.resolve(mesMembresLoader)
  }
}
