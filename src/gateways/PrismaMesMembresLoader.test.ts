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
      candidats: [
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: undefined,
          nom: 'Pipriac',
          roles: ['observateur'],
          siret: 'Siret bouchonné',
          suppressionDuMembreAutorise: false,
          typologie: 'Préfecture régionale',
          uidMembre: 'commune-110-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: undefined,
          nom: 'Rennes',
          roles: ['observateur'],
          siret: 'Siret bouchonné',
          suppressionDuMembreAutorise: false,
          typologie: 'Préfecture régionale',
          uidMembre: 'commune-112-69',
        },
      ],
      departement: 'Rhône',
      membres: [
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: undefined,
          nom: 'Bretagne',
          roles: ['coporteur'],
          siret: 'Siret bouchonné',
          suppressionDuMembreAutorise: false,
          typologie: 'Préfecture régionale',
          uidMembre: 'region-53-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: undefined,
          nom: 'CA Tulle Agglo',
          roles: ['observateur'],
          siret: 'Siret bouchonné',
          suppressionDuMembreAutorise: false,
          typologie: 'Collectivité, EPCI',
          uidMembre: 'epci-241927201-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: undefined,
          nom: 'CC Porte du Jura',
          roles: ['beneficiaire', 'coporteur'],
          siret: 'Siret bouchonné',
          suppressionDuMembreAutorise: false,
          typologie: 'Collectivité, EPCI',
          uidMembre: 'epci-200072056-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: undefined,
          nom: 'Créteil',
          roles: ['coporteur'],
          siret: 'Siret bouchonné',
          suppressionDuMembreAutorise: false,
          typologie: 'Collectivité, commune',
          uidMembre: 'commune-94028-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: undefined,
          nom: 'Île-de-France',
          roles: ['observateur'],
          siret: 'Siret bouchonné',
          suppressionDuMembreAutorise: false,
          typologie: 'Préfecture régionale',
          uidMembre: 'region-11-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: undefined,
          nom: 'Orange',
          roles: ['coporteur', 'recipiendaire'],
          siret: 'Siret bouchonné',
          suppressionDuMembreAutorise: false,
          typologie: 'Entreprise privée',
          uidMembre: 'structure-38012986643097-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: undefined,
          nom: 'Rhône',
          roles: ['coporteur'],
          siret: 'Siret bouchonné',
          suppressionDuMembreAutorise: false,
          typologie: 'Préfecture départementale',
          uidMembre: 'prefecture-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: undefined,
          nom: 'Rhône',
          roles: ['observateur'],
          siret: 'Siret bouchonné',
          suppressionDuMembreAutorise: false,
          typologie: 'Conseil départemental',
          uidMembre: 'departement-69-69',
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
            'recipiendaire',
          ],
          siret: 'Siret bouchonné',
          suppressionDuMembreAutorise: false,
          typologie: '',
          uidMembre: 'commune-35345-69',
        },
      ],
      roles: [],
      suggeres: [
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: undefined,
          nom: 'Pipriac',
          roles: ['observateur'],
          siret: 'Siret bouchonné',
          suppressionDuMembreAutorise: false,
          typologie: 'Préfecture régionale',
          uidMembre: 'commune-113-69',
        },
        {
          adresse: 'Adresse bouchonnée',
          contactReferent: undefined,
          nom: 'Rennes',
          roles: ['observateur'],
          siret: 'Siret bouchonné',
          suppressionDuMembreAutorise: false,
          typologie: 'Préfecture régionale',
          uidMembre: 'commune-111-69',
        },
      ],
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
