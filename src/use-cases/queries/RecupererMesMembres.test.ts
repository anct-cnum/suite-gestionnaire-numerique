import { beforeEach, describe, expect, it } from 'vitest'

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
            isDeletable: false,
            nom: 'Préfecture du Rhône',
            nombreContacts: 1,
            roles: ['coporteur'],
            siret: '00000000000000',
            statut: 'confirme',
            structureId: undefined,
            suppressionDuMembreAutorise: false,
            typologie: 'Préfecture départementale',
            uid: 'prefecture-69',
          },
          {
            adresse: '29,31 Cours de la Liberté 69483 LYON Cedex 03',
            isDeletable: true,
            nom: 'Rhône (69)',
            nombreContacts: 1,
            roles: ['coporteur', 'cofinanceur'],
            siret: '00000000000000',
            statut: 'confirme',
            structureId: undefined,
            suppressionDuMembreAutorise: false,
            typologie: 'Collectivité, conseil départemental',
            uid: 'departement-69-69',
          },
          {
            adresse: '790 allée de Pluvy – 69590 Pomeys',
            isDeletable: true,
            nom: 'CC des Monts du Lyonnais',
            nombreContacts: 2,
            roles: ['coporteur', 'cofinanceur'],
            siret: '00000000000000',
            statut: 'candidat',
            structureId: undefined,
            suppressionDuMembreAutorise: false,
            typologie: 'Collectivité, EPCI',
            uid: 'epci-200066587-69',
          },
          {
            adresse: '26 rue Emile Decorps 69100 VILLEURBANNE',
            isDeletable: true,
            nom: "La Voie du Num'",
            nombreContacts: 1,
            roles: ['beneficiaire', 'recipiendaire'],
            siret: '42985163700034',
            statut: 'candidat',
            structureId: undefined,
            suppressionDuMembreAutorise: false,
            typologie: 'Association',
            uid: 'structure-42985163700034-69',
          },
          {
            adresse: '17 rue Jean Bourgey 69100 Villeurbanne',
            isDeletable: true,
            nom: 'Fédération départementale des centres sociaux du Rhône et de la Métropole de Lyon',
            nombreContacts: 0,
            roles: ['observateur'],
            siret: '77978721700057',
            statut: 'candidat',
            structureId: undefined,
            suppressionDuMembreAutorise: false,
            typologie: '',
            uid: 'structure-77978721700057-69',
          },
          {
            adresse: '66 cours Charlemagne, Lyon 2e',
            isDeletable: true,
            nom: 'Info-Jeunes Auvergne Rhône-Alpes (CRIJ)',
            nombreContacts: 1,
            roles: ['beneficiaire', 'cofinanceur'],
            siret: '33805291300062',
            statut: 'confirme',
            structureId: undefined,
            suppressionDuMembreAutorise: false,
            typologie: 'Association',
            uid: 'structure-33805291300062-69',
          },
          {
            adresse: '71 rue Archereau, 75019 PARIS',
            isDeletable: true,
            nom: 'Emmaüs Connect',
            nombreContacts: 1,
            roles: ['observateur'],
            siret: '79227291600034',
            statut: 'candidat',
            structureId: undefined,
            suppressionDuMembreAutorise: false,
            typologie: 'Association',
            uid: 'structure-79227291600034-69',
          },
          {
            adresse: '21/23 Rue DE LA VANNE 92120 MONTROUGE',
            isDeletable: true,
            nom: 'Croix Rouge Française',
            nombreContacts: 1,
            roles: ['cofinanceur'],
            siret: '77567227224553',
            statut: 'candidat',
            structureId: undefined,
            suppressionDuMembreAutorise: false,
            typologie: 'Association',
            uid: 'structure-77567227224553-69',
          },
          {
            adresse: '111 Quai du Président Roosevelt 92449 Issy-les-Moulineaux',
            isDeletable: true,
            nom: 'Orange',
            nombreContacts: 1,
            roles: ['coporteur'],
            siret: '38012986643097',
            statut: 'confirme',
            structureId: undefined,
            suppressionDuMembreAutorise: false,
            typologie: 'Entreprise privée',
            uid: 'structure-38012986643097-69',
          },
          {
            adresse: '66 cours Charlemagne, Lyon 2e',
            isDeletable: true,
            nom: 'Info-Jeunes Rhône (CRIJ)',
            nombreContacts: 1,
            roles: ['coporteur'],
            siret: '33805291300063',
            statut: 'confirme',
            structureId: undefined,
            suppressionDuMembreAutorise: false,
            typologie: 'Association',
            uid: 'structure-33805291300063-69',
          },
        ],
        roles: ['beneficiaire', 'cofinanceur', 'coporteur', 'observateur', 'recipiendaire'],
        typologies: [
          '',
          'Association',
          'Collectivité, conseil départemental',
          'Collectivité, EPCI',
          'Entreprise privée',
          'Préfecture départementale',
        ],
        uidGouvernance: '69',
      })
    })

    it('alors quand un rôle est demandé, on ne retourne que les membres ayant ce rôle, sans réduire les rôles et typologies disponibles', async () => {
      // GIVEN
      const queryHandler = new RecupererMesMembres(new MesMembresLoaderStub())

      // WHEN
      const mesMembres = await queryHandler.handle({ codeDepartement: '69', role: 'coporteur' })

      // THEN
      expect(mesMembres.membres.map((membre) => membre.uid)).toStrictEqual([
        'prefecture-69',
        'departement-69-69',
        'epci-200066587-69',
        'structure-38012986643097-69',
        'structure-33805291300063-69',
      ])
      expect(mesMembres.roles).toStrictEqual([
        'beneficiaire',
        'cofinanceur',
        'coporteur',
        'observateur',
        'recipiendaire',
      ])
      expect(mesMembres.typologies).toStrictEqual([
        '',
        'Association',
        'Collectivité, conseil départemental',
        'Collectivité, EPCI',
        'Entreprise privée',
        'Préfecture départementale',
      ])
    })

    it('alors quand une typologie est demandée, on ne retourne que les membres ayant cette typologie', async () => {
      // GIVEN
      const queryHandler = new RecupererMesMembres(new MesMembresLoaderStub())

      // WHEN
      const mesMembres = await queryHandler.handle({ codeDepartement: '69', typologie: 'Association' })

      // THEN
      expect(mesMembres.membres.map((membre) => membre.uid)).toStrictEqual([
        'structure-42985163700034-69',
        'structure-33805291300062-69',
        'structure-79227291600034-69',
        'structure-77567227224553-69',
        'structure-33805291300063-69',
      ])
    })

    it('alors quand la typologie vide est demandée, on ne retourne que les membres sans typologie', async () => {
      // GIVEN
      const queryHandler = new RecupererMesMembres(new MesMembresLoaderStub())

      // WHEN
      const mesMembres = await queryHandler.handle({ codeDepartement: '69', typologie: '' })

      // THEN
      expect(mesMembres.membres.map((membre) => membre.uid)).toStrictEqual(['structure-77978721700057-69'])
    })

    it('alors quand un rôle et une typologie sont demandés, on ne retourne que les membres correspondant aux deux filtres', async () => {
      // GIVEN
      const queryHandler = new RecupererMesMembres(new MesMembresLoaderStub())

      // WHEN
      const mesMembres = await queryHandler.handle({
        codeDepartement: '69',
        role: 'coporteur',
        typologie: 'Association',
      })

      // THEN
      expect(mesMembres.membres.map((membre) => membre.uid)).toStrictEqual(['structure-33805291300063-69'])
    })
  })
})

let mesMembresLoader: MesMembresReadModel

class MesMembresLoaderStub implements MesMembresLoader {
  async get(): Promise<MesMembresReadModel> {
    return Promise.resolve(mesMembresLoader)
  }
}
