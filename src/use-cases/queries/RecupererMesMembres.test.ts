import { membresReadModelFactory } from '../testHelper'
import { MesMembresLoader, MesMembresReadModel, RecupererMesMembres } from './RecupererMesMembres'

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
      expect(mesMembres).toStrictEqual<MesMembresReadModel>({
        autorisations: {
          accesMembreConfirme: false,
          ajouterUnMembre: false,
          supprimerUnMembre: false,
        },
        departement: 'Rhône',
        membres: [
          {
            adresse: '29,31 Cours de la Liberté 69483 LYON Cedex 03',
            contactReferent: {
              email: 'laetitia.henrich@example.net',
              fonction: 'Responsable territoriale',
              nom: 'Henrich',
              prenom: 'Laetitia',
            },
            isDeletable: false,
            nom: 'Préfecture du Rhône',
            roles: ['coporteur'],
            siret: '00000000000000',
            statut: 'confirme',
            suppressionDuMembreAutorise: false,
            typologie: 'Préfecture départementale',
            uid: 'prefecture-69',
          },
          {
            adresse: '29,31 Cours de la Liberté 69483 LYON Cedex 03',
            contactReferent: {
              email: 'pauline.chappuis@example.net',
              fonction: 'Directrice',
              nom: 'Chappuis',
              prenom: 'Pauline',
            },
            isDeletable: true,
            nom: 'Rhône (69)',
            roles: ['coporteur', 'cofinanceur'],
            siret: '00000000000000',
            statut: 'confirme',
            suppressionDuMembreAutorise: false,
            typologie: 'Collectivité, conseil départemental',
            uid: 'departement-69-69',
          },
          {
            adresse: '790 allée de Pluvy – 69590 Pomeys',
            contactReferent: {
              email: 'blaise.boudet@example.net',
              fonction: 'Responsable territorial',
              nom: 'Boudet',
              prenom: 'Blaise',
            },
            isDeletable: true,
            nom: 'CC des Monts du Lyonnais',
            roles: ['coporteur', 'cofinanceur'],
            siret: '00000000000000',
            statut: 'candidat',
            suppressionDuMembreAutorise: false,
            typologie: 'Collectivité, EPCI',
            uid: 'epci-200066587-69',
          },
          {
            adresse: '26 rue Emile Decorps 69100 VILLEURBANNE',
            contactReferent: {
              email: 'gaby.vasseur@example.net',
              fonction: 'Coordinateur',
              nom: 'Vasseur',
              prenom: 'Gaby',
            },
            isDeletable: true,
            nom: "La Voie du Num'",
            roles: ['beneficiaire', 'recipiendaire'],
            siret: '42985163700034',
            statut: 'candidat',
            suppressionDuMembreAutorise: false,
            typologie: 'Association',
            uid: 'structure-42985163700034-69',
          },
          {
            adresse: '17 rue Jean Bourgey 69100 Villeurbanne',
            contactReferent: {
              email: 'gaby.vasseur@example.net',
              fonction: 'Coordinateur',
              nom: 'Vasseur',
              prenom: 'Gaby',
            },
            isDeletable: true,
            nom: 'Fédération départementale des centres sociaux du Rhône et de la Métropole de Lyon',
            roles: ['observateur'],
            siret: '77978721700057',
            statut: 'candidat',
            suppressionDuMembreAutorise: false,
            typologie: '',
            uid: 'structure-77978721700057-69',
          },
          {
            adresse: '66 cours Charlemagne, Lyon 2e',
            contactReferent: {
              email: 'gregory.geffroy@example.net',
              fonction: 'Responsable communication',
              nom: 'Geffroy',
              prenom: 'Grégory',
            },
            isDeletable: true,
            nom: 'Info-Jeunes Auvergne Rhône-Alpes (CRIJ)',
            roles: ['beneficiaire', 'cofinanceur'],
            siret: '33805291300062',
            statut: 'confirme',
            suppressionDuMembreAutorise: false,
            typologie: 'Association',
            uid: 'structure-33805291300062-69',
          },
          {
            adresse: '71 rue Archereau, 75019 PARIS',
            contactReferent: {
              email: 'ninon.poulin@example.net',
              fonction: 'Médiatrice',
              nom: 'Poulin',
              prenom: 'Ninon',
            },
            isDeletable: true,
            nom: 'Emmaüs Connect',
            roles: ['observateur'],
            siret: '79227291600034',
            statut: 'candidat',
            suppressionDuMembreAutorise: false,
            typologie: 'Association',
            uid: 'structure-79227291600034-69',
          },
          {
            adresse: '21/23 Rue DE LA VANNE 92120 MONTROUGE',
            contactReferent: {
              email: 'arianne.dufour@example.net',
              fonction: 'Secrétaire générale',
              nom: 'Dufour',
              prenom: 'Arianne',
            },
            isDeletable: true,
            nom: 'Croix Rouge Française',
            roles: ['cofinanceur'],
            siret: '77567227224553',
            statut: 'candidat',
            suppressionDuMembreAutorise: false,
            typologie: 'Association',
            uid: 'structure-77567227224553-69',
          },
          {
            adresse: '111 Quai du Président Roosevelt 92449 Issy-les-Moulineaux',
            contactReferent: {
              email: 'fabien.pelissier@example.net',
              fonction: 'Secrétaire général',
              nom: 'Pélissier',
              prenom: 'Fabien',
            },
            isDeletable: true,
            nom: 'Orange',
            roles: ['coporteur'],
            siret: '38012986643097',
            statut: 'confirme',
            suppressionDuMembreAutorise: false,
            typologie: 'Entreprise privée',
            uid: 'structure-38012986643097-69',
          },
          {
            adresse: '66 cours Charlemagne, Lyon 2e',
            contactReferent: {
              email: 'gregory.geffroy@example.net',
              fonction: 'Responsable communication',
              nom: 'Geffroy',
              prenom: 'Grégory',
            },
            isDeletable: true,
            nom: 'Info-Jeunes Rhône (CRIJ)',
            roles: ['coporteur'],
            siret: '33805291300063',
            statut: 'confirme',
            suppressionDuMembreAutorise: false,
            typologie: 'Association',
            uid: 'structure-33805291300063-69',
          },
        ],
        roles: ['beneficiaire', 'cofinanceur', 'coporteur', 'observateur', 'recipiendaire'],
        typologies: ['', 'Association', 'Collectivité, conseil départemental', 'Collectivité, EPCI', 'Entreprise privée', 'Préfecture départementale'],
        uidGouvernance: '69',
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
