import { Prisma } from '@prisma/client'

import { PrismaMesMembresLoader } from './PrismaMesMembresLoader'
import { creerMembres, creerUnDepartement, creerUneGouvernance, creerUneRegion } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { MesMembresReadModel } from '@/use-cases/queries/RecupererMesMembres'

describe('mes membres loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('quand les membres rattachés à une gouvernance sont demandés, alors ils sont renvoyés dans l’ordre alphabétique', async () => {
    // GIVEN
    await creerUneRegion({ code: '84', nom: 'Auvergne-Rhône-Alpes' })
    await creerUneRegion({ code: '53', nom: 'Bretagne' })
    await creerUneRegion({ code: '11', nom: 'Île-de-France' })
    await creerUnDepartement({ code: '69', nom: 'Rhône', regionCode: '84' })
    await creerUneGouvernance({ departementCode: '69' })
    await creerMembres('69')

    // WHEN
    const mesMembresReadModel = await new PrismaMesMembresLoader().get('69')

    // THEN
    expect(mesMembresReadModel).toStrictEqual<MesMembresReadModel>({
      autorisations: {
        accesMembreConfirme: false,
        ajouterUnMembre: false,
        supprimerUnMembre: false,
      },
      departement: 'Rhône',
      membres: [
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: {
            email: 'commune-35345-69@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          nom: 'Bretagne',
          roles: ['coporteur'],
          siret: 'Siret bouchonné',
          statut: 'confirme',
          suppressionDuMembreAutorise: false,
          typologie: 'Préfecture régionale',
          uid: 'region-53-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: {
            email: 'commune-35345-69@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          nom: 'CA Tulle Agglo',
          roles: ['observateur'],
          siret: 'Siret bouchonné',
          statut: 'confirme',
          suppressionDuMembreAutorise: false,
          typologie: 'Collectivité, EPCI',
          uid: 'epci-241927201-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: {
            email: 'commune-35345-69@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          nom: 'CC Porte du Jura',
          roles: ['beneficiaire', 'coporteur'],
          siret: 'Siret bouchonné',
          statut: 'confirme',
          suppressionDuMembreAutorise: false,
          typologie: 'Collectivité, EPCI',
          uid: 'epci-200072056-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: {
            email: 'commune-35345-69@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          nom: 'Créteil',
          roles: ['coporteur'],
          siret: 'Siret bouchonné',
          statut: 'confirme',
          suppressionDuMembreAutorise: false,
          typologie: 'Collectivité, commune',
          uid: 'commune-94028-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: {
            email: 'commune-35345-69@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          nom: 'Île-de-France',
          roles: ['observateur'],
          siret: 'Siret bouchonné',
          statut: 'confirme',
          suppressionDuMembreAutorise: false,
          typologie: 'Préfecture régionale',
          uid: 'region-11-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: {
            email: 'commune-35345-69@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          nom: 'Orange',
          roles: ['coporteur', 'recipiendaire'],
          siret: 'Siret bouchonné',
          statut: 'confirme',
          suppressionDuMembreAutorise: false,
          typologie: 'Entreprise privée',
          uid: 'structure-38012986643097-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: {
            email: 'commune-35345-69@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          nom: 'Pipriac',
          roles: ['observateur'],
          siret: 'Siret bouchonné',
          statut: 'candidat',
          suppressionDuMembreAutorise: false,
          typologie: 'Préfecture régionale',
          uid: 'commune-110-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: {
            email: 'commune-35345-69@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          nom: 'Pipriac',
          roles: ['observateur'],
          siret: 'Siret bouchonné',
          statut: 'suggere',
          suppressionDuMembreAutorise: false,
          typologie: 'Préfecture régionale',
          uid: 'commune-113-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: {
            email: 'commune-35345-69@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          nom: 'Rennes',
          roles: ['observateur'],
          siret: 'Siret bouchonné',
          statut: 'candidat',
          suppressionDuMembreAutorise: false,
          typologie: 'Préfecture régionale',
          uid: 'commune-112-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: {
            email: 'commune-35345-69@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          nom: 'Rennes',
          roles: ['observateur'],
          siret: 'Siret bouchonné',
          statut: 'suggere',
          suppressionDuMembreAutorise: false,
          typologie: 'Préfecture régionale',
          uid: 'commune-111-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: {
            email: 'commune-35345-69@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },

          nom: 'Rhône',
          roles: ['coporteur'],
          siret: 'Siret bouchonné',
          statut: 'confirme',
          suppressionDuMembreAutorise: false,
          typologie: 'Préfecture départementale',
          uid: 'prefecture-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: {
            email: 'commune-35345-69@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          nom: 'Rhône',
          roles: ['observateur'],
          siret: 'Siret bouchonné',
          statut: 'confirme',
          suppressionDuMembreAutorise: false,
          typologie: 'Conseil départemental',
          uid: 'departement-69-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: {
            email: 'commune-35345-69@example.com',
            fonction: 'Directeur',
            nom: 'Tartempion',
            prenom: 'Michel',
          },
          nom: 'Trévérien',
          roles: [
            'beneficiaire',
            'coporteur',
            'recipiendaire',
          ],
          siret: 'Siret bouchonné',
          statut: 'confirme',
          suppressionDuMembreAutorise: false,
          typologie: '',
          uid: 'commune-35345-69',
        },
      ],
      roles: [],
      typologies: [],
      uidGouvernance: '69',
    })
  })

  it('quand des membres de gouvernance sont demandés pour un départment non existant, alors ils une exception est levée', async () => {
    // GIVEN
    const codeDepartementInexistant = 'code_departement_inexistant'
    await creerUneRegion({ code: '84', nom: 'Auvergne-Rhône-Alpes' })
    await creerUnDepartement({ code: '69', nom: 'Rhône', regionCode: '84' })

    // WHEN
    const mesMembresReadModel = new PrismaMesMembresLoader().get(codeDepartementInexistant)

    // THEN
    await expect(mesMembresReadModel).rejects.toThrow(Prisma.PrismaClientKnownRequestError)
    await expect(mesMembresReadModel).rejects.toMatchObject({ code: 'P2025' })
  })
})
