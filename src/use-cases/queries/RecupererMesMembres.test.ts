import { MesMembresReadModel, MesMembresReadModelLoader, RecupererMesMembres } from './RecupererMesMembres'

describe('recupererMesMembres', () => {
  afterEach(() => {
    mesMembresLoaderPrisma = original
  })
  describe('quand on demande les membres rattachés à une gouvernance existante d’un département existant', () => {
    it('et que le membre est une préfecture alors on les récupères mais il n’est pas autorisé à être supprimer', async () => {
      mesMembresLoaderPrisma = {
        ...mesMembresLoaderPrisma,
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
        ],
      }
      const queryHandler = new RecupererMesMembres(new MesMembresReadModelLoaderStub())
      const mesMembres = await queryHandler.get({ codeDepartementGouvernance: '69' })
      expect(mesMembres.membres).toStrictEqual(
        [
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
        ]
      )
    })

    it('et que le membre n’est pas la préfecture alors on le récupère mais il est autoriser à être supprimer', async () => {
      mesMembresLoaderPrisma = {
        ...mesMembresLoaderPrisma,
        membres: [
          {
            contactReferent: {
              nom: 'Didier',
              prenom: 'Durant',
            },
            nom: 'Département du Rhône',
            roles: ['Co-porteur', 'Co-financeur'],
            statut: 'Membre',
            typologieMembre: 'Collectivité, EPCI',
          },
        ],
      }
      const queryHandler = new RecupererMesMembres(new MesMembresReadModelLoaderStub())
      const mesMembres = await queryHandler.get({ codeDepartementGouvernance: '69' })
      expect(mesMembres.membres).toStrictEqual(
        [
          {
            contactReferent: {
              nom: 'Didier',
              prenom: 'Durant',
            },
            nom: 'Département du Rhône',
            roles: ['Co-porteur', 'Co-financeur'],
            statut: 'Membre',
            typologieMembre: 'Collectivité, EPCI',
          },
        ]
      )
    })

    it('et que le gestionnaire département n’est pas un co-porteur alors on le récupère mais je ne peux ni supprimer et ni ajouter un membre', () => {
      ['Co-Financeur', 'Bénéficiaire', 'Formation', 'Observateur'].forEach(async (role) => {
        mesMembresLoaderPrisma = {
          ...mesMembresLoaderPrisma,
          autorisations: {
          },
          roles: [role],
        }
        const queryHandler = new RecupererMesMembres(new MesMembresReadModelLoaderStub())
        const mesMembres = await queryHandler.get({ codeDepartementGouvernance: '69' })
        expect(mesMembres.autorisations).toStrictEqual({})
      })
    })

    it('et que le gestionnaire département est un co-porteur alors on le récupère mais je peux supprimer et ajouter un membre', () => {
      ['Co-Financeur', 'Bénéficiaire', 'Formation'].forEach(async (role) => {
        mesMembresLoaderPrisma = {
          ...mesMembresLoaderPrisma,
          autorisations: {
          },
          roles: ['Co-porteur', role],
        }
        const queryHandler = new RecupererMesMembres(new MesMembresReadModelLoaderStub())
        const mesMembres = await queryHandler.get({ codeDepartementGouvernance: '69' })
        expect(mesMembres.autorisations).toStrictEqual({
          AjouterUnMembre: true,
          SupprimerUnMembre: true,
        })
      })
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

class MesMembresReadModelLoaderStub extends MesMembresReadModelLoader {
  protected async find(): Promise<MesMembresReadModel> {
    return Promise.resolve(mesMembresLoaderPrisma)
  }
}
