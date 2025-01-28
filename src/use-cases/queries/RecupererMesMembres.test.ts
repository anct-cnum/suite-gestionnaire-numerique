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
      ['Co-financeur', 'Bénéficiaire', 'Formation', 'Observateur'].forEach(async (role) => {
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
      typologieMembre: 'Entreprise privée',
    },
    {
      contactReferent: {
        nom: 'Chantal',
        prenom: 'Dubois',
      },
      nom: 'Orange',
      roles: ['Co-porteur'],
      statut: 'Candidat',
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
