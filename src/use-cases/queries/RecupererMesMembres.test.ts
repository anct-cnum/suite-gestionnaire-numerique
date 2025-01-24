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

    it('et que je filtre sur "Membre", alors je récupère uniquement les Membres', async () => {
      const queryHandler = new RecupererMesMembres(new MesMembresReadModelLoaderStub())
      const mesMembres = await queryHandler.get({ codeDepartementGouvernance: '69' })
      expect(mesMembres.membres).toStrictEqual([
        {
          contactReferent: {
            nom: 'Henrich',
            prenom: 'Laetitia',
          },
          nom: 'Préfecture du Rhône',
          roles: ['Co-porteur'],
          statut: 'Membre',
          suppressionDuMembreNonAutorise: true,
          typologieMembre: 'Préfecture départementale',
        },
        {
          contactReferent: {
            nom: 'Didier',
            prenom: 'Durant',
          },
          nom: 'Département du Rhône',
          roles: ['Co-porteur'],
          statut: 'Membre',
          typologieMembre: 'Collectivité, EPCI',
        },
      ])
    })
    it('et que je filtre sur "Suggestion", alors je récupère uniquement les Suggestions', async () => {
      mesMembresLoaderPrisma = {
        ...mesMembresLoaderPrisma,
        filtre: {
          roles: [''],
          statut: 'Suggestion',
          typologie: '',
        },
      }
      const queryHandler = new RecupererMesMembres(new MesMembresReadModelLoaderStub())
      const mesMembres = await queryHandler.get({ codeDepartementGouvernance: '69' })
      expect(mesMembres.membres).toStrictEqual([
        {
          contactReferent: {
            nom: 'Veronique',
            prenom: 'Dupont',
          },
          nom: 'Bouygues',
          roles: [],
          statut: 'Suggestion',
          // roles: ['Co-Financeur'], ont il des roles ?
          typologieMembre: 'Entreprise privée',
        },
      ])
    })
    it('et que je filtre sur "Candidat", alors je récupère uniquement les Candidats', async () => {
      mesMembresLoaderPrisma = {
        ...mesMembresLoaderPrisma,
        filtre: {
          roles: [''],
          statut: 'Candidat',
          typologie: '',
        },
      }
      const queryHandler = new RecupererMesMembres(new MesMembresReadModelLoaderStub())
      const mesMembres = await queryHandler.get({ codeDepartementGouvernance: '69' })
      expect(mesMembres.membres).toStrictEqual([
        {
          contactReferent: {
            nom: 'Chantal',
            prenom: 'Dubois',
          },
          nom: 'Orange',
          roles: [],
          statut: 'Candidat',
          // roles: ['Co-Financeur'], ont il des roles ?
          typologieMembre: 'Entreprise privée',
        },
      ])
    })
    it('et que je filtre sur "Membre" et sur le role Co-porteur, alors je récupère uniquement les Membres ayant le role co-porteur', async () => {
      mesMembresLoaderPrisma = {
        ...mesMembresLoaderPrisma,
        filtre: {
          roles: ['Co-porteur'],
          statut: 'Membre',
          typologie: '',
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
            typologieMembre: 'Préfecture départementale',
          },
          {
            contactReferent: {
              nom: 'Didier',
              prenom: 'Durant',
            },
            nom: 'Département du Rhône',
            roles: ['Co-porteur'],
            statut: 'Membre',
            typologieMembre: 'Collectivité, EPCI',
          },
          {
            contactReferent: {
              nom: 'Didier',
              prenom: 'Durant',
            },
            nom: 'Département du Rhône',
            roles: ['Co-financeur'],
            statut: 'Membre',
            typologieMembre: 'Collectivité, EPCI',
          },
        ],
      }
      const queryHandler = new RecupererMesMembres(new MesMembresReadModelLoaderStub())
      const mesMembres = await queryHandler.get({ codeDepartementGouvernance: '69' })
      expect(mesMembres.membres).toStrictEqual([
        {
          contactReferent: {
            nom: 'Henrich',
            prenom: 'Laetitia',
          },
          nom: 'Préfecture du Rhône',
          roles: ['Co-porteur'],
          statut: 'Membre',
          suppressionDuMembreNonAutorise: true,
          typologieMembre: 'Préfecture départementale',
        },
        {
          contactReferent: {
            nom: 'Didier',
            prenom: 'Durant',
          },
          nom: 'Département du Rhône',
          roles: ['Co-porteur'],
          statut: 'Membre',
          typologieMembre: 'Collectivité, EPCI',
        },
      ])
    })
    it('et que je filtre sur "Membre" et sur le role "Co-porteur" et sur la typologie "Collectivité, EPCI", alors je récupère uniquement les Membres ayant le role co-porteur', async () => {
      mesMembresLoaderPrisma = {
        ...mesMembresLoaderPrisma,
        filtre: {
          roles: ['Co-porteur'],
          statut: 'Membre',
          typologie: 'Collectivité, EPCI',
        },
        membres: [
          {
            contactReferent: {
              nom: 'Didier',
              prenom: 'Durant',
            },
            nom: 'Département du Rhône',
            roles: ['Co-porteur'],
            statut: 'Membre',
            typologieMembre: 'Collectivité, EPCI',
          },
          {
            contactReferent: {
              nom: 'Didier',
              prenom: 'Durant',
            },
            nom: 'Département du Rhône',
            roles: ['Co-financeur'],
            statut: 'Membre',
            typologieMembre: 'Collectivité, EPCI',
          },
        ],
      }
      const queryHandler = new RecupererMesMembres(new MesMembresReadModelLoaderStub())
      const mesMembres = await queryHandler.get({ codeDepartementGouvernance: '69' })
      expect(mesMembres.membres).toStrictEqual([
        {
          contactReferent: {
            nom: 'Didier',
            prenom: 'Durant',
          },
          nom: 'Département du Rhône',
          roles: ['Co-porteur'],
          statut: 'Membre',
          typologieMembre: 'Collectivité, EPCI',
        },
      ])
    })

    it('et que je filtre sur "Membre" et sur le role "Co-porteur" et "Co-financeur" et sur la typologie "Collectivité, EPCI", alors je récupère uniquement les Membres ayant le role co-porteur', async () => {
      mesMembresLoaderPrisma = {
        ...mesMembresLoaderPrisma,
        filtre: {
          roles: ['Co-porteur', 'Co-financeur'],
          statut: 'Membre',
          typologie: 'Collectivité, EPCI',
        },
        membres: [
          {
            contactReferent: {
              nom: 'Didier',
              prenom: 'Durant',
            },
            nom: 'Département du Rhône',
            roles: ['Co-porteur'],
            statut: 'Membre',
            typologieMembre: 'Collectivité, EPCI',
          },
          {
            contactReferent: {
              nom: 'Didier',
              prenom: 'Durant',
            },
            nom: 'Département du Rhône',
            roles: ['Co-financeur'],
            statut: 'Membre',
            typologieMembre: 'Collectivité, EPCI',
          },
          {
            contactReferent: {
              nom: 'Chantal',
              prenom: 'Dubois',
            },
            nom: 'La Poste',
            roles: ['Co-porteur'],
            statut: 'Membre',
            typologieMembre: 'Entreprise privée',
          },
        ],
      }
      const queryHandler = new RecupererMesMembres(new MesMembresReadModelLoaderStub())
      const mesMembres = await queryHandler.get({ codeDepartementGouvernance: '69' })
      expect(mesMembres.membres).toStrictEqual([
        {
          contactReferent: {
            nom: 'Didier',
            prenom: 'Durant',
          },
          nom: 'Département du Rhône',
          roles: ['Co-porteur'],
          statut: 'Membre',
          typologieMembre: 'Collectivité, EPCI',
        },
        {
          contactReferent: {
            nom: 'Didier',
            prenom: 'Durant',
          },
          nom: 'Département du Rhône',
          roles: ['Co-financeur'],
          statut: 'Membre',
          typologieMembre: 'Collectivité, EPCI',
        },
      ])
    })
  })
})

<<<<<<< HEAD
let mesMembresLoader: MesMembresReadModel = mesMembresReadModelFactory()
=======
const original: MesMembresReadModel = {
  autorisations: {
    AjouterUnMembre: true,
    SupprimerUnMembre: true,
  },
  departement: 'Rhône',
  filtre: {
    roles: [''],
    statut: 'Membre',
    typologie: '',
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
      typologieMembre: 'Préfecture départementale',
    },
    {
      contactReferent: {
        nom: 'Didier',
        prenom: 'Durant',
      },
      nom: 'Département du Rhône',
      roles: ['Co-porteur'],
      statut: 'Membre',
      typologieMembre: 'Collectivité, EPCI',
    },
    {
      contactReferent: {
        nom: 'Veronique',
        prenom: 'Dupont',
      },
      nom: 'Bouygues',
      roles: [],
      statut: 'Suggestion',
      // roles: ['Co-Financeur'], ont il des roles ?
      typologieMembre: 'Entreprise privée',
    },
    {
      contactReferent: {
        nom: 'Chantal',
        prenom: 'Dubois',
      },
      nom: 'Orange',
      roles: [],
      statut: 'Candidat',
      // roles: ['Co-Financeur'], ont il des roles ?
      typologieMembre: 'Entreprise privée',
    },
  ],
  roles: ['Co-porteur'],
  typologieMembre: 'Préfecture départementale',
  uid: 'gouvernanceFooId',
}
let mesMembresLoaderPrisma: MesMembresReadModel = { ...original }
>>>>>>> uses cases filter

class MesMembresLoaderStub extends MesMembresLoader {
  protected async find(): Promise<MesMembresReadModel> {
    return Promise.resolve(mesMembresLoader)
  }
}
